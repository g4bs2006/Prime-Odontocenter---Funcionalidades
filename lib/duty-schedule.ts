export const PROFESSIONALS = {
  rafael: { id: '4693001712435200', name: 'Dr. Rafael da Cunha Santos', short: 'Rafael' },
  alex:   { id: '6525572572774400', name: 'Dr. Alex Fernando Santos da Silva', short: 'Alex' },
} as const

export type ProfessionalKey = keyof typeof PROFESSIONALS
export type DutyProfessional = typeof PROFESSIONALS[ProfessionalKey]

export function getDutyProfessional(date: Date): DutyProfessional | null {
  const diaSemana = date.getDay() // 0=Dom, 1=Seg ... 6=Sáb
  const numSabado = Math.ceil(date.getDate() / 7)

  // Rafael: Seg(1), Ter(2), Qua(3), Sex(5)
  if ([1, 2, 3, 5].includes(diaSemana)) return PROFESSIONALS.rafael

  // Alex: Qui(4)
  if (diaSemana === 4) return PROFESSIONALS.alex

  // Sábado: 2º e 4º → Rafael | 1º e 3º → Alex
  if (diaSemana === 6) {
    if (numSabado === 2 || numSabado === 4) return PROFESSIONALS.rafael
    if (numSabado === 1 || numSabado === 3) return PROFESSIONALS.alex
  }

  return null // Domingo ou 5º sábado
}
