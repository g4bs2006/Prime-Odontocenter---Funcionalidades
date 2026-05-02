import { fetchClinicorp } from '@/lib/api'
import type { ClinicorpEstimate } from '@/lib/types'
import { formatBRL, estimateDaysStale, formatDate } from '@/lib/transformers'
import { DataTable, type Column } from '@/components/data-table'
import { Badge } from '@/components/ui/badge'
import { EmptyState } from '@/components/empty-state'
import { KpiCard } from '@/components/kpi-card'

export const dynamic = 'force-dynamic'

export default async function OrcamentosPage() {
  const from = (() => {
    const d = new Date()
    d.setDate(d.getDate() - 30)
    return d.toISOString().split('T')[0]
  })()
  const to = new Date().toISOString().split('T')[0]

  const estimates = await fetchClinicorp<ClinicorpEstimate[]>(
    `/estimates/list?subscriber_id=primeodontocenter&from=${from}&to=${to}`
  )

  const pending = estimates.filter((e) => e.Status !== 'Aprovado' && e.Status !== 'Cancelado')
  const totalValue = pending.reduce((sum, e) => sum + e.TotalValue, 0)
  const avgDays = pending.length
    ? Math.round(pending.reduce((s, e) => s + estimateDaysStale(e.CreatedAt), 0) / pending.length)
    : 0

  const sorted = [...pending].sort(
    (a, b) => estimateDaysStale(b.CreatedAt) - estimateDaysStale(a.CreatedAt)
  )

  const columns: Column<ClinicorpEstimate>[] = [
    { key: 'PatientName', header: 'Paciente' },
    {
      key: 'TotalValue',
      header: 'Valor',
      render: (r) => <span className="font-medium">{formatBRL(r.TotalValue)}</span>,
    },
    { key: 'ProfessionalName', header: 'Dentista' },
    { key: 'CreatedAt', header: 'Criado em', render: (r) => formatDate(r.CreatedAt) },
    {
      key: 'days',
      header: 'Dias em aberto',
      render: (r) => {
        const d = estimateDaysStale(r.CreatedAt)
        return (
          <Badge variant={d > 30 ? 'destructive' : d > 15 ? 'secondary' : 'outline'}>
            {d}d
          </Badge>
        )
      },
    },
    {
      key: 'action',
      header: '',
      render: (r) => (
        <a
          href={`https://app.fluxodonto.com/crm/contatos?phone=${encodeURIComponent(r.PatientPhone)}`}
          target="_blank"
          className="text-sm text-blue-500 hover:underline"
        >
          Abrir conversa →
        </a>
      ),
    },
  ]

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">📋 Orçamentos em Aberto</h1>
        <p className="text-muted-foreground text-sm mt-1">Últimos 90 dias · pendentes de aprovação</p>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <KpiCard label="Em aberto" value={pending.length} accent="yellow" />
        <KpiCard label="Valor total" value={formatBRL(totalValue)} accent="green" />
        <KpiCard label="Média de dias parado" value={`${avgDays}d`} accent="red" />
      </div>

      {sorted.length === 0 ? (
        <EmptyState icon="✅" title="Nenhum orçamento pendente" description="Todos aprovados ou cancelados." />
      ) : (
        <DataTable<ClinicorpEstimate> columns={columns} rows={sorted} />
      )}
    </div>
  )
}
