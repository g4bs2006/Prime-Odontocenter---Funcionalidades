interface KpiCardProps {
  label: string
  value: string | number
  sub?: string
  accent?: 'green' | 'red' | 'yellow' | 'blue'
}

const accentClass = {
  green: 'text-green-500',
  red: 'text-red-500',
  yellow: 'text-yellow-500',
  blue: 'text-blue-500',
}

export function KpiCard({ label, value, sub, accent = 'blue' }: KpiCardProps) {
  return (
    <div className="rounded-xl border bg-card p-5 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className={`mt-1 text-3xl font-bold ${accentClass[accent]}`}>{value}</p>
      {sub && <p className="mt-1 text-xs text-muted-foreground">{sub}</p>}
    </div>
  )
}
