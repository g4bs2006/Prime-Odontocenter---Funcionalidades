import Link from 'next/link'

const SCREENS = [
  { href: '/aniversariantes', icon: '🎂', label: 'Aniversariantes',   description: 'Pacientes aniversariando hoje ou na semana' },
  { href: '/agenda',          icon: '📅', label: 'Agenda',             description: 'Grade semanal com agendamentos e horários livres' },
  { href: '/criticos',        icon: '🚨', label: 'Clientes Críticos',  description: 'Orçamentos parados e histórico de faltas' },
  { href: '/orcamentos',      icon: '📋', label: 'Orçamentos',         description: 'Orçamentos pendentes de aprovação (30 dias)' },
  { href: '/financeiro',      icon: '💰', label: 'Financeiro',         description: 'Resumo do mês, fluxo de caixa e pagamentos' },
  { href: '/paciente360',     icon: '🔍', label: 'Paciente 360',       description: 'Ficha completa via ?phone= ou ?patientId=' },
]

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8">
      <div className="w-full max-w-2xl">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold">Prime Odontocenter</h1>
          <p className="text-muted-foreground mt-2">Painel de funcionalidades integradas</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {SCREENS.map((s) => (
            <Link
              key={s.href}
              href={s.href}
              className="flex items-start gap-4 rounded-xl border bg-card p-4 hover:bg-accent transition-colors"
            >
              <span className="text-2xl">{s.icon}</span>
              <div>
                <p className="font-semibold">{s.label}</p>
                <p className="text-sm text-muted-foreground">{s.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
