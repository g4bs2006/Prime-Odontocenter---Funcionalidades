import { fetchClinicorp } from '@/lib/api'
import type { ClinicorpProfessional, ClinicorpAvailableTime } from '@/lib/types'
import { AgendaClient } from './agenda-client'

export default async function AgendaPage() {
  const professionals = await fetchClinicorp<ClinicorpProfessional[]>(
    '/professional/list_all_professionals?subscriber_id=primeodontocenter'
  )

  const from = new Date().toISOString().split('T')[0]
  const toDate = new Date()
  toDate.setDate(toDate.getDate() + 7)
  const to = toDate.toISOString().split('T')[0]

  const availability = await fetchClinicorp<ClinicorpAvailableTime[]>(
    `/business/list_available_times?subscriber_id=primeodontocenter&business_id=6505624431493120&from=${from}&to=${to}`
  )

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">📅 Agenda Disponível</h1>
        <p className="text-muted-foreground text-sm mt-1">Próximos 7 dias · horários livres por profissional</p>
      </div>
      <AgendaClient
        professionals={professionals}
        availability={availability}
        schedulingLink={process.env.SCHEDULING_LINK ?? ''}
      />
    </div>
  )
}
