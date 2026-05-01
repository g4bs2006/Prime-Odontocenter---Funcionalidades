import { fetchClinicorp } from '@/lib/api'
import type { ClinicorpEstimate, ClinicorpAppointment } from '@/lib/types'
import { buildCriticalList } from '@/lib/critical-clients'
import { formatBRL } from '@/lib/transformers'
import { Badge } from '@/components/ui/badge'
import { EmptyState } from '@/components/empty-state'
import { KpiCard } from '@/components/kpi-card'

export default async function CriticosPage() {
  const sub = 'primeodontocenter'
  const from = (() => {
    const d = new Date()
    d.setMonth(d.getMonth() - 3)
    return d.toISOString().split('T')[0]
  })()
  const to = new Date().toISOString().split('T')[0]

  const [estimates, appointments] = await Promise.all([
    fetchClinicorp<ClinicorpEstimate[]>(`/estimates/list?subscriber_id=${sub}&from=${from}&to=${to}`),
    fetchClinicorp<ClinicorpAppointment[]>(`/appointment/list?subscriber_id=${sub}&from=${from}&to=${to}&business_id=6505624431493120`),
  ])

  const criticals = buildCriticalList(estimates, appointments)

  const byReason = {
    stale_estimate: criticals.filter((c) => c.reason === 'stale_estimate').length,
    no_show_history: criticals.filter((c) => c.reason === 'no_show_history').length,
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">🚨 Clientes Críticos</h1>
        <p className="text-muted-foreground text-sm mt-1">Pacientes que precisam de atenção agora</p>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <KpiCard label="Total críticos" value={criticals.length} accent="red" />
        <KpiCard label="Orçamentos parados" value={byReason.stale_estimate} accent="yellow" />
        <KpiCard label="Histórico de faltas" value={byReason.no_show_history} accent="red" />
      </div>

      {criticals.length === 0 ? (
        <EmptyState icon="✅" title="Nenhum cliente crítico" description="Tudo em dia nos últimos 90 dias." />
      ) : (
        <div className="space-y-3">
          {criticals.map((c, i) => (
            <div key={i} className="flex items-center justify-between rounded-xl border bg-card p-4">
              <div>
                <p className="font-semibold">{c.patientName}</p>
                <p className="text-sm text-muted-foreground">{c.reasonLabel}</p>
                {c.estimateValue && (
                  <p className="text-sm font-medium text-yellow-500">{formatBRL(c.estimateValue)}</p>
                )}
              </div>
              <div className="flex items-center gap-3">
                <Badge variant={c.reason === 'stale_estimate' ? 'secondary' : 'destructive'}>
                  {c.reason === 'stale_estimate' ? 'Orçamento' : 'Faltas'}
                </Badge>
                {c.patientPhone && (
                  <a
                    href={`https://app.fluxodonto.com/crm/contatos?phone=${encodeURIComponent(c.patientPhone)}`}
                    target="_blank"
                    className="text-sm text-blue-500 hover:underline"
                  >
                    Abrir →
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
