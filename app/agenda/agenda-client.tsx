'use client'
import React, { useState, useEffect } from 'react'
import type { ClinicorpAppointment, ClinicorpAvailableTime } from '@/lib/types'
import { getDutyProfessional, PROFESSIONALS } from '@/lib/duty-schedule'
import { Button } from '@/components/ui/button'

// ── Constants ──────────────────────────────────────────────────────────────

const TIME_SLOTS = generateTimeSlots(8, 18) // 08:00–17:30, 30 min cada
const DAYS_IN_WEEK = 6 // Seg → Sáb

const STATUS_CONFIG: Record<string, { label: string; rowClass: string }> = {
  Agendado:   { label: 'Agendado',   rowClass: 'bg-blue-50   border-blue-300  text-blue-800'   },
  Confirmado: { label: 'Confirmado', rowClass: 'bg-sky-100   border-sky-400   text-sky-900'    },
  Compareceu: { label: 'Compareceu', rowClass: 'bg-emerald-50 border-emerald-300 text-emerald-800' },
  Faltou:     { label: 'Faltou',     rowClass: 'bg-red-50    border-red-300   text-red-700'    },
  Cancelado:  { label: 'Cancelado',  rowClass: 'bg-gray-100  border-gray-300  text-gray-400'   },
}

// ── Helpers ────────────────────────────────────────────────────────────────

function generateTimeSlots(startHour: number, endHour: number): string[] {
  const slots: string[] = []
  for (let h = startHour; h < endHour; h++) {
    slots.push(`${String(h).padStart(2, '0')}:00`)
    slots.push(`${String(h).padStart(2, '0')}:30`)
  }
  return slots
}

function getMondayOfWeek(date: Date): Date {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  const day = d.getDay()
  d.setDate(d.getDate() + (day === 0 ? -6 : 1 - day))
  return d
}

function toISODate(date: Date): string {
  return date.toISOString().split('T')[0]
}

function normalizeTime(t: string): string {
  const [h, m = '00'] = t.split(':')
  return `${h.padStart(2, '0')}:${m.padStart(2, '0')}`
}

// ── Types ──────────────────────────────────────────────────────────────────

type SlotType = 'booked' | 'free' | 'blocked' | 'closed'

interface Slot {
  time: string
  type: SlotType
  appointment?: ClinicorpAppointment
}

interface DayColumn {
  date: string
  weekday: string
  dayMonth: string
  isToday: boolean
  dutyName: string | null   // null = domingo / sem plantão
  slots: Slot[]
}

// ── Grid builder ───────────────────────────────────────────────────────────

function buildDayColumns(
  weekStart: Date,
  appointments: ClinicorpAppointment[],
  availableByPro: Record<string, ClinicorpAvailableTime[]>,
  proIdMap: Record<string, string>,
): DayColumn[] {
  const todayStr = toISODate(new Date())

  return Array.from({ length: DAYS_IN_WEEK }, (_, i) => {
    const date = new Date(weekStart)
    date.setDate(weekStart.getDate() + i)
    const dateStr = toISODate(date)

    const duty = getDutyProfessional(date)

    if (!duty) {
      return {
        date: dateStr,
        weekday: date.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '').toUpperCase(),
        dayMonth: date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
        isToday: dateStr === todayStr,
        dutyName: null,
        slots: TIME_SLOTS.map((time) => ({ time, type: 'closed' as const })),
      }
    }

    const realId = proIdMap[duty.name] ?? ''
    const dutyTimes = availableByPro[realId] ?? []
    const dayAppts = appointments.filter(
      (a) => a.ProfessionalName === duty.name && (a.Date ?? '').startsWith(dateStr),
    )
    const dayFree = (dutyTimes.find((at) => at.Date === dateStr)?.Times ?? []).map(normalizeTime)

    return {
      date: dateStr,
      weekday: date.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '').toUpperCase(),
      dayMonth: date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
      isToday: dateStr === todayStr,
      dutyName: duty.short,
      slots: TIME_SLOTS.map((time) => {
        const appointment = dayAppts.find((a) => normalizeTime(a.Time ?? '') === time)
        if (appointment) return { time, type: 'booked', appointment }
        if (dayFree.includes(time)) return { time, type: 'free' }
        return { time, type: 'blocked' }
      }),
    }
  })
}

// ── Sub-components ─────────────────────────────────────────────────────────

function BookedCell({ appointment }: { appointment: ClinicorpAppointment }) {
  const cfg = STATUS_CONFIG[appointment.Status] ?? {
    label: appointment.Status,
    rowClass: 'bg-gray-50 border-gray-200 text-gray-700',
  }
  return (
    <div className={`h-full w-full rounded border px-1.5 py-0.5 text-[11px] leading-tight ${cfg.rowClass}`}>
      <div className="font-semibold truncate">{appointment.PatientName}</div>
      {appointment.Category ? (
        <div className="opacity-70 truncate text-[10px]">{appointment.Category}</div>
      ) : null}
      <div className="font-medium mt-0.5 text-[10px]">{cfg.label}</div>
    </div>
  )
}

function LoadingRows() {
  return (
    <>
      {TIME_SLOTS.map((time) => (
        <React.Fragment key={time}>
          <div
            className="sticky left-0 z-10 bg-muted/60 border-b border-r flex items-center justify-end px-2"
            style={{ minHeight: '3rem' }}
          >
            <span className="text-xs text-muted-foreground font-mono">{time}</span>
          </div>
          {Array.from({ length: DAYS_IN_WEEK }, (_, i) => (
            <div key={i} className="border-b border-r p-1 animate-pulse" style={{ minHeight: '3rem' }}>
              <div className="h-full rounded bg-muted/40" />
            </div>
          ))}
        </React.Fragment>
      ))}
    </>
  )
}

// ── Main component ─────────────────────────────────────────────────────────

interface Props {
  schedulingLink: string
  rafaelId: number | null
  alexId: number | null
}

export function AgendaClient({ schedulingLink, rafaelId, alexId }: Props) {
  const [weekStart, setWeekStart] = useState<Date>(() => getMondayOfWeek(new Date()))
  const [appointments, setAppointments] = useState<ClinicorpAppointment[]>([])
  const [availableByPro, setAvailableByPro] = useState<Record<string, ClinicorpAvailableTime[]>>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const from = toISODate(weekStart)
  const weekEnd = new Date(weekStart)
  weekEnd.setDate(weekStart.getDate() + DAYS_IN_WEEK - 1)
  const to = toISODate(weekEnd)

  const weekLabel = `${weekStart.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })} – ${weekEnd.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}`

  useEffect(() => {
    setLoading(true)
    setError(null)

    const fetchTimes = (id: number | null) =>
      id
        ? fetch(`/api/agenda-times?professionalId=${id}&from=${from}&to=${to}`).then((r) => r.json())
        : Promise.resolve([])

    Promise.all([
      fetch(`/api/agenda-appointments?from=${from}&to=${to}`).then((r) => r.json()),
      fetchTimes(rafaelId),
      fetchTimes(alexId),
    ])
      .then(([appts, rafaelTimes, alexTimes]) => {
        if (appts.error)       throw new Error(appts.error)
        if (rafaelTimes.error) throw new Error(rafaelTimes.error)
        if (alexTimes.error)   throw new Error(alexTimes.error)

        setAppointments(Array.isArray(appts) ? appts : [])
        const byPro: Record<string, ClinicorpAvailableTime[]> = {}
        if (rafaelId) byPro[String(rafaelId)] = Array.isArray(rafaelTimes) ? rafaelTimes : []
        if (alexId)   byPro[String(alexId)]   = Array.isArray(alexTimes)   ? alexTimes   : []
        setAvailableByPro(byPro)
      })
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false))
  }, [from, to])

  const proIdMap: Record<string, string> = {}
  if (rafaelId) proIdMap[PROFESSIONALS.rafael.name] = String(rafaelId)
  if (alexId)   proIdMap[PROFESSIONALS.alex.name]   = String(alexId)

  const dayColumns = buildDayColumns(weekStart, appointments, availableByPro, proIdMap)

  function prevWeek() {
    setWeekStart((d) => { const n = new Date(d); n.setDate(d.getDate() - 7); return n })
  }
  function nextWeek() {
    setWeekStart((d) => { const n = new Date(d); n.setDate(d.getDate() + 7); return n })
  }
  function goToday() {
    setWeekStart(getMondayOfWeek(new Date()))
  }

  return (
    <div className="space-y-4">
      {/* Week navigation */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={prevWeek}>←</Button>
          <span className="text-sm font-semibold min-w-[220px] text-center">{weekLabel}</span>
          <Button variant="outline" size="sm" onClick={nextWeek}>→</Button>
          <Button variant="ghost" size="sm" onClick={goToday} className="text-xs text-muted-foreground">
            Hoje
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground hidden md:block font-mono">{schedulingLink}</span>
          <Button size="sm" variant="outline" onClick={() => navigator.clipboard.writeText(schedulingLink)}>
            📋 Copiar link
          </Button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-5 text-xs text-muted-foreground flex-wrap">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-emerald-100 border border-emerald-300 inline-block" /> Livre
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-blue-100 border border-blue-300 inline-block" /> Agendado
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-red-100 border border-red-300 inline-block" /> Faltou
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-muted border border-border inline-block" /> Bloqueado
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-muted/20 border border-dashed border-border inline-block" /> Fechado
        </span>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-xl border border-destructive bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Grid */}
      <div className="overflow-x-auto rounded-xl border bg-background">
        <div
          className="grid"
          style={{ gridTemplateColumns: `4rem repeat(${DAYS_IN_WEEK}, minmax(9rem, 1fr))` }}
        >
          {/* Header */}
          <div className="sticky left-0 z-20 bg-muted border-b border-r" />
          {(loading ? Array.from({ length: DAYS_IN_WEEK }) : dayColumns).map((day, i) => {
            if (loading || !day) {
              return (
                <div key={i} className="bg-muted/40 border-b border-r px-2 py-2 text-center animate-pulse">
                  <div className="h-3 w-8 bg-muted rounded mx-auto mb-1" />
                  <div className="h-4 w-12 bg-muted rounded mx-auto" />
                </div>
              )
            }
            const d = day as DayColumn
            const isClosed = d.dutyName === null
            return (
              <div
                key={d.date}
                className={`border-b border-r px-2 py-2 text-center ${
                  d.isToday ? 'bg-primary/10' : isClosed ? 'bg-muted/20' : 'bg-muted/30'
                }`}
              >
                <div className={`text-[10px] font-bold tracking-widest ${d.isToday ? 'text-primary' : 'text-muted-foreground'}`}>
                  {d.weekday}
                </div>
                <div className={`text-sm font-bold ${d.isToday ? 'text-primary' : isClosed ? 'text-muted-foreground/50' : ''}`}>
                  {d.dayMonth}
                </div>
                {d.dutyName && (
                  <div className="text-[10px] text-muted-foreground mt-0.5 font-medium">{d.dutyName}</div>
                )}
              </div>
            )
          })}

          {/* Body */}
          {loading ? (
            <LoadingRows />
          ) : (
            TIME_SLOTS.map((time) => (
              <React.Fragment key={time}>
                <div
                  className="sticky left-0 z-10 bg-muted/60 border-b border-r flex items-center justify-end px-2"
                  style={{ minHeight: '3rem' }}
                >
                  <span className="text-[11px] text-muted-foreground font-mono">{time}</span>
                </div>

                {dayColumns.map((day) => {
                  const slot = day.slots.find((s) => s.time === time)!
                  return (
                    <div
                      key={day.date}
                      className={`border-b border-r p-0.5 ${day.isToday ? 'bg-primary/5' : ''}`}
                      style={{ minHeight: '3rem' }}
                    >
                      {slot.type === 'booked' && slot.appointment ? (
                        <BookedCell appointment={slot.appointment} />
                      ) : slot.type === 'free' ? (
                        <div className="h-full rounded bg-emerald-50 border border-emerald-200 flex items-center justify-center">
                          <span className="text-[10px] text-emerald-600 font-medium">livre</span>
                        </div>
                      ) : slot.type === 'closed' ? (
                        <div className="h-full rounded bg-muted/10 border border-dashed border-muted-foreground/10" />
                      ) : (
                        <div className="h-full rounded bg-muted/20" />
                      )}
                    </div>
                  )
                })}
              </React.Fragment>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
