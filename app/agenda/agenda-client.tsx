'use client'
import { useState } from 'react'
import type { ClinicorpProfessional, ClinicorpAvailableTime } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/empty-state'

interface Props {
  professionals: ClinicorpProfessional[]
  availability: ClinicorpAvailableTime[]
  schedulingLink: string
}

export function AgendaClient({ professionals, availability, schedulingLink }: Props) {
  const [selectedPro, setSelectedPro] = useState<number | null>(
    professionals[0]?.id ?? null
  )

  const proSlots = availability.filter((a) => a.ProfessionalId === selectedPro)

  function copyLink() {
    navigator.clipboard.writeText(schedulingLink)
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {professionals.map((p) => (
          <button
            key={p.id}
            onClick={() => setSelectedPro(p.id)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium border transition-colors ${
              selectedPro === p.id
                ? 'bg-primary text-primary-foreground border-primary'
                : 'bg-card hover:bg-accent border-border'
            }`}
          >
            {p.Name}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-3 rounded-xl border bg-card p-4">
        <span className="text-sm text-muted-foreground flex-1">
          Link de agendamento: <span className="font-mono text-foreground">{schedulingLink}</span>
        </span>
        <Button size="sm" variant="outline" onClick={copyLink}>
          📋 Copiar link
        </Button>
        <a href={schedulingLink} target="_blank">
          <Button size="sm">Abrir →</Button>
        </a>
      </div>

      {proSlots.length === 0 ? (
        <EmptyState icon="📅" title="Sem horários disponíveis" description="Nenhum slot livre nos próximos 7 dias para este profissional." />
      ) : (
        <div className="grid gap-3">
          {proSlots.map((slot) => (
            <div key={slot.Date} className="rounded-xl border bg-card p-4">
              <p className="font-semibold mb-2">
                {new Intl.DateTimeFormat('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' }).format(new Date(slot.Date + 'T12:00:00'))}
              </p>
              <div className="flex flex-wrap gap-2">
                {slot.Times.map((t) => (
                  <span key={t} className="rounded-lg border bg-accent px-3 py-1 text-sm font-mono">
                    {t}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
