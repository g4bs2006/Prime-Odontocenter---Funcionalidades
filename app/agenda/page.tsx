import { fetchClinicorp } from '@/lib/api'
import type { ClinicorpProfessional } from '@/lib/types'
import { PROFESSIONALS } from '@/lib/duty-schedule'
import { AgendaClient } from './agenda-client'

export const dynamic = 'force-dynamic'

export default async function AgendaPage() {
  const all = await fetchClinicorp<ClinicorpProfessional[]>(
    '/professional/list_all_professionals?subscriber_id=primeodontocenter'
  )

  // Encontra os IDs reais do Clinicorp pelo nome dos profissionais
  function findId(fullName: string): number | null {
    const keyword = (fullName.toLowerCase().split(' ')[1] ?? fullName).toLowerCase()
    const match = all.find((p) => p.Name?.toLowerCase().includes(keyword))
    return match?.id ?? null
  }

  const rafaelId = findId(PROFESSIONALS.rafael.name)
  const alexId   = findId(PROFESSIONALS.alex.name)

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">📅 Agenda</h1>
        <p className="text-muted-foreground text-sm mt-1">Semana atual · Dr. Rafael e Dr. Alex</p>
      </div>
      <AgendaClient
        schedulingLink={process.env.SCHEDULING_LINK ?? ''}
        rafaelId={rafaelId}
        alexId={alexId}
      />
    </div>
  )
}
