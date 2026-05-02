import { fetchClinicorp } from '@/lib/api'
import type {
  ClinicorpFinancialSummary,
  ClinicorpCashFlow,
  ClinicorpPayment,
} from '@/lib/types'
import { formatBRL, formatDate } from '@/lib/transformers'
import { KpiCard } from '@/components/kpi-card'
import { DataTable, type Column } from '@/components/data-table'
import { Badge } from '@/components/ui/badge'

export const dynamic = 'force-dynamic'

export default async function FinanceiroPage() {
  const from = (() => {
    const d = new Date()
    d.setDate(1)
    return d.toISOString().split('T')[0]
  })()
  const to = new Date().toISOString().split('T')[0]
  const sub = 'primeodontocenter'

  const [summary, cashFlow, payments] = await Promise.all([
    fetchClinicorp<ClinicorpFinancialSummary>(
      `/financial/list_summary?subscriber_id=${sub}&from=${from}&to=${to}&business_id=6505624431493120`
    ),
    fetchClinicorp<ClinicorpCashFlow[]>(
      `/financial/list_cash_flow?subscriber_id=${sub}&from=${from}&to=${to}&business_id=6505624431493120`
    ),
    fetchClinicorp<ClinicorpPayment[]>(
      `/financial/list_payments?subscriber_id=${sub}&from=${from}&to=${to}&business_id=6505624431493120`
    ),
  ])

  const paymentColumns: Column<ClinicorpPayment>[] = [
    { key: 'PatientName', header: 'Paciente' },
    { key: 'Amount', header: 'Valor', render: (r) => formatBRL(r.Amount) },
    { key: 'Method', header: 'Forma' },
    { key: 'Date', header: 'Data', render: (r) => formatDate(r.Date) },
    {
      key: 'Status',
      header: 'Status',
      render: (r) => (
        <Badge variant={r.Status === 'Pago' ? 'default' : 'destructive'}>
          {r.Status}
        </Badge>
      ),
    },
  ]

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">💰 Painel Financeiro</h1>
        <p className="text-muted-foreground text-sm mt-1">Mês atual · Prime Odontocenter</p>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">
        <KpiCard label="Receita do mês" value={formatBRL(summary.TotalRevenue)} accent="green" />
        <KpiCard label="Despesas" value={formatBRL(summary.TotalExpenses)} accent="red" />
        <KpiCard label="Saldo" value={formatBRL(summary.Balance)} accent={summary.Balance >= 0 ? 'green' : 'red'} />
      </div>

      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-3">Fluxo de Caixa</h2>
        <div className="space-y-2">
          {cashFlow.map((row) => (
            <div key={row.Date} className="flex items-center justify-between rounded-xl border bg-card px-4 py-3">
              <span className="text-sm font-medium">{formatDate(row.Date)}</span>
              <div className="flex gap-6 text-sm">
                <span className="text-green-500">↑ {formatBRL(row.Revenue)}</span>
                <span className="text-red-500">↓ {formatBRL(row.Expense)}</span>
                <span className="text-muted-foreground">≈ {formatBRL(row.Forecast)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-3">Pagamentos Recentes</h2>
        <DataTable
          columns={paymentColumns}
          rows={payments}
          emptyMessage="Nenhum pagamento no período."
        />
      </div>
    </div>
  )
}
