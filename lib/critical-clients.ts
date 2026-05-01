import type { ClinicorpEstimate, ClinicorpAppointment, CriticalClient } from '@/lib/types'
import { estimateDaysStale } from '@/lib/transformers'

export function buildCriticalList(
  estimates: ClinicorpEstimate[],
  appointments: ClinicorpAppointment[]
): CriticalClient[] {
  const criticals: CriticalClient[] = []

  // Orçamentos parados há mais de 30 dias
  for (const e of estimates) {
    const days = estimateDaysStale(e.CreatedAt)
    if (days >= 30 && e.Status !== 'Aprovado' && e.Status !== 'Cancelado') {
      criticals.push({
        patientId: e.PatientId,
        patientName: e.PatientName,
        patientPhone: e.PatientPhone,
        reason: 'stale_estimate',
        reasonLabel: `Orçamento parado há ${days} dias`,
        daysStale: days,
        estimateValue: e.TotalValue,
      })
    }
  }

  // Histórico de faltas (2+)
  const noShowMap = new Map<number, number>()
  for (const a of appointments) {
    if (a.Status === 'Faltou') {
      noShowMap.set(a.PatientId, (noShowMap.get(a.PatientId) ?? 0) + 1)
    }
  }
  for (const a of appointments) {
    const count = noShowMap.get(a.PatientId) ?? 0
    if (count >= 2 && !criticals.find((c) => c.patientId === a.PatientId)) {
      criticals.push({
        patientId: a.PatientId,
        patientName: a.PatientName,
        patientPhone: '',
        reason: 'no_show_history',
        reasonLabel: `${count} faltas registradas`,
        daysStale: 0,
      })
    }
  }

  return criticals.sort((a, b) => b.daysStale - a.daysStale)
}
