import { fetchClinicorp } from '@/lib/api'
import type {
  ClinicorpPatient,
  ClinicorpAppointment,
  ClinicorpEstimate,
  ClinicorpPayment,
} from '@/lib/types'
import { formatBRL, formatDate } from '@/lib/transformers'
import { Badge } from '@/components/ui/badge'
import { EmptyState } from '@/components/empty-state'

export const dynamic = 'force-dynamic'

interface PageProps {
  searchParams: { phone?: string; patientId?: string }
}

export default async function Paciente360Page({ searchParams }: PageProps) {
  const { phone, patientId } = searchParams
  const sub = 'primeodontocenter'

  if (!phone && !patientId) {
    return <EmptyState icon="🔍" title="Parâmetro necessário" description="Passe ?phone=+55... ou ?patientId=... na URL." />
  }

  const query = patientId ? `id=${patientId}` : `phone=${encodeURIComponent(phone!)}`

  const [patient, appointments, estimates, payments] = await Promise.all([
    fetchClinicorp<ClinicorpPatient>(`/patient/get?subscriber_id=${sub}&${query}`),
    fetchClinicorp<ClinicorpAppointment[]>(`/patient/list_appointments?subscriber_id=${sub}&${query}`),
    fetchClinicorp<ClinicorpEstimate[]>(`/patient/list_estimates?subscriber_id=${sub}&${query}`),
    fetchClinicorp<ClinicorpPayment[]>(`/payment/list?subscriber_id=${sub}&business_id=6505624431493120&${query}`),
  ])

  const pendingPayments = payments.filter((p) => p.Status !== 'Pago')

  return (
    <div className="space-y-5 max-w-lg">
      {/* Ficha */}
      <div className="rounded-xl border bg-card p-5">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-lg font-bold text-primary">
            {patient.Name?.[0] ?? '?'}
          </div>
          <div>
            <p className="font-bold text-lg">{patient.Name}</p>
            <p className="text-sm text-muted-foreground">{patient.Phone}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div><span className="text-muted-foreground">CPF:</span> {patient.CPF || '—'}</div>
          <div><span className="text-muted-foreground">Email:</span> {patient.Email || '—'}</div>
          <div><span className="text-muted-foreground">Nascimento:</span> {patient.BirthDate ? formatDate(patient.BirthDate) : '—'}</div>
        </div>
      </div>

      {/* Consultas */}
      <div className="rounded-xl border bg-card p-5">
        <h3 className="font-semibold mb-3">🗓 Consultas ({appointments.length})</h3>
        {appointments.length === 0 ? (
          <p className="text-sm text-muted-foreground">Sem consultas registradas.</p>
        ) : (
          <ul className="space-y-2">
            {appointments.slice(0, 5).map((a) => (
              <li key={a.id} className="flex items-center justify-between text-sm">
                <span>{formatDate(a.Date)} · {a.ProfessionalName}</span>
                <Badge variant={a.Status === 'Compareceu' ? 'default' : a.Status === 'Faltou' ? 'destructive' : 'outline'}>
                  {a.Status}
                </Badge>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Orçamentos */}
      <div className="rounded-xl border bg-card p-5">
        <h3 className="font-semibold mb-3">📋 Orçamentos ({estimates.length})</h3>
        {estimates.length === 0 ? (
          <p className="text-sm text-muted-foreground">Sem orçamentos.</p>
        ) : (
          <ul className="space-y-2">
            {estimates.slice(0, 5).map((e) => (
              <li key={e.id} className="flex items-center justify-between text-sm">
                <span>{e.Procedures?.[0] ?? 'Procedimento'}</span>
                <span className="font-medium">{formatBRL(e.TotalValue)}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Financeiro */}
      <div className="rounded-xl border bg-card p-5">
        <h3 className="font-semibold mb-3">💳 Financeiro</h3>
        {pendingPayments.length === 0 ? (
          <p className="text-sm text-green-500">✓ Sem pendências financeiras.</p>
        ) : (
          <ul className="space-y-2">
            {pendingPayments.map((p) => (
              <li key={p.id} className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{formatDate(p.Date)}</span>
                <span className="font-medium text-red-500">{formatBRL(p.Amount)}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
