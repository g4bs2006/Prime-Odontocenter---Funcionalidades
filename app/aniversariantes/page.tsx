import { fetchClinicorp } from '@/lib/api'
import type { ClinicorpBirthday } from '@/lib/types'
import { formatDate } from '@/lib/transformers'
import { EmptyState } from '@/components/empty-state'
import { BirthdayActions } from './birthday-actions'

interface PageProps {
  searchParams: { accountId?: string }
}

export default async function AniversariantesPage({ searchParams }: PageProps) {
  const today = new Date().toISOString().split('T')[0]

  const birthdays = await fetchClinicorp<ClinicorpBirthday[]>(
    `/patient/birthdays?subscriber_id=primeodontocenter&date=${today}`
  )

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">🎂 Aniversariantes</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Pacientes aniversariando hoje — {formatDate(today)}
        </p>
      </div>

      {birthdays.length === 0 ? (
        <EmptyState
          icon="🎉"
          title="Nenhum aniversariante hoje"
          description="Volte amanhã para conferir."
        />
      ) : (
        <div className="space-y-3">
          {birthdays.map((p) => (
            <div
              key={p.id}
              className="flex items-center justify-between rounded-xl border bg-card p-4"
            >
              <div>
                <p className="font-semibold">{p.Name}</p>
                <p className="text-sm text-muted-foreground">
                  {p.Phone} · {p.Age} anos
                </p>
              </div>
              <BirthdayActions phone={p.Phone} name={p.Name} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
