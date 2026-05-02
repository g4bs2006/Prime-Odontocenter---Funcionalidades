import { differenceInDays, parseISO, startOfDay } from 'date-fns'

export function daysAgo(dateStr: string): number {
  return differenceInDays(startOfDay(new Date()), startOfDay(parseISO(dateStr)))
}

export function estimateDaysStale(isoString: string): number {
  return daysAgo(isoString)
}

export function formatBRL(value: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

export function formatDate(isoString: string | null | undefined): string {
  if (!isoString) return '—'
  const d = new Date(isoString)
  if (isNaN(d.getTime())) return '—'
  return new Intl.DateTimeFormat('pt-BR').format(d)
}
