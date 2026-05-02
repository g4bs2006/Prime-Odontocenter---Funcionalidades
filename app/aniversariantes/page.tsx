import { fetchClinicorp } from '@/lib/api'
import type { ClinicorpBirthday } from '@/lib/types'
import { formatDate } from '@/lib/transformers'
import { birthdayMessage } from '@/lib/birthday-message'
import { EmptyState } from '@/components/empty-state'
import { BirthdayActions } from './birthday-actions'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

interface PageProps {
  searchParams: { semana?: string }
}

interface BirthdayGroup {
  date: string
  label: string
  patients: ClinicorpBirthday[]
}

function getWeekDays(): Date[] {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const day = today.getDay()
  const monday = new Date(today)
  monday.setDate(today.getDate() + (day === 0 ? -6 : 1 - day))
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    return d
  })
}

function dayLabel(date: Date, todayStr: string): string {
  const dateStr = date.toISOString().split('T')[0]
  if (dateStr === todayStr) return 'Hoje'
  const tomorrow = new Date(new Date().setDate(new Date().getDate() + 1))
  if (dateStr === tomorrow.toISOString().split('T')[0]) return 'Amanhã'
  return date.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: '2-digit' })
}

export default async function AniversariantesPage({ searchParams }: PageProps) {
  const isSemana = searchParams.semana === '1'
  const todayStr = new Date().toISOString().split('T')[0]
  const schedulingLink = process.env.SCHEDULING_LINK ?? ''

  let groups: BirthdayGroup[]

  if (isSemana) {
    const weekDays = getWeekDays()
    const results = await Promise.all(
      weekDays.map((d) =>
        fetchClinicorp<ClinicorpBirthday[]>(
          `/patient/birthdays?subscriber_id=primeodontocenter&date=${d.toISOString().split('T')[0]}`
        ).catch(() => [] as ClinicorpBirthday[])
      )
    )
    groups = weekDays
      .map((d, i) => ({
        date: d.toISOString().split('T')[0],
        label: dayLabel(d, todayStr),
        patients: results[i],
      }))
      .filter((g) => g.patients.length > 0)
  } else {
    const patients = await fetchClinicorp<ClinicorpBirthday[]>(
      `/patient/birthdays?subscriber_id=primeodontocenter&date=${todayStr}`
    )
    groups = patients.length > 0
      ? [{ date: todayStr, label: 'Hoje', patients }]
      : []
  }

  const total = groups.reduce((s, g) => s + g.patients.length, 0)

  return (
    <div>
      {/* Header */}
      <div className="mb-5 flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            🎂 Aniversariantes
            {total > 0 && (
              <span className="text-sm font-semibold bg-primary text-primary-foreground rounded-full px-2.5 py-0.5">
                {total}
              </span>
            )}
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {isSemana ? 'Esta semana' : `Hoje — ${formatDate(todayStr)}`}
          </p>
        </div>

        {/* Toggle Hoje / Semana */}
        <div className="flex items-center rounded-lg border bg-muted/40 p-1 gap-1 text-sm">
          <Link
            href="/aniversariantes"
            className={`px-3 py-1 rounded-md transition-colors font-medium ${
              !isSemana ? 'bg-background shadow text-foreground' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Hoje
          </Link>
          <Link
            href="/aniversariantes?semana=1"
            className={`px-3 py-1 rounded-md transition-colors font-medium ${
              isSemana ? 'bg-background shadow text-foreground' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Esta semana
          </Link>
        </div>
      </div>

      {/* Content */}
      {groups.length === 0 ? (
        <EmptyState
          icon="🎉"
          title={isSemana ? 'Nenhum aniversariante esta semana' : 'Nenhum aniversariante hoje'}
          description={isSemana ? 'Aproveite para checar o próximo período.' : 'Volte amanhã para conferir.'}
        />
      ) : (
        <div className="space-y-6">
          {groups.map((group) => (
            <div key={group.date}>
              {/* Day label — only shows in week mode */}
              {isSemana && (
                <div className="flex items-center gap-2 mb-2">
                  <span className={`text-xs font-bold uppercase tracking-widest px-2 py-0.5 rounded ${
                    group.label === 'Hoje'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground'
                  }`}>
                    {group.label}
                  </span>
                  <span className="text-xs text-muted-foreground">{formatDate(group.date)}</span>
                </div>
              )}

              <div className="space-y-3">
                {group.patients.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between rounded-xl border bg-card p-4 gap-4"
                  >
                    {/* Avatar + info */}
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-full bg-primary/15 flex items-center justify-center text-lg font-bold text-primary flex-shrink-0">
                        {p.Name?.[0] ?? '?'}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold truncate">{p.Name}</p>
                        <p className="text-sm text-muted-foreground">
                          {p.Phone}
                          {p.Age ? ` · ${p.Age} anos` : ''}
                          {p.BirthDate ? ` · nascido em ${formatDate(p.BirthDate)}` : ''}
                        </p>
                      </div>
                    </div>

                    {/* Actions */}
                    <BirthdayActions
                      phone={p.Phone}
                      name={p.Name}
                      messagePreview={birthdayMessage(p.Name, schedulingLink)}
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
