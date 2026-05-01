import { describe, it, expect } from 'vitest'
import { daysAgo, formatBRL, estimateDaysStale } from '@/lib/transformers'

describe('daysAgo', () => {
  it('retorna 0 para data de hoje', () => {
    const today = new Date().toISOString().split('T')[0]
    expect(daysAgo(today)).toBe(0)
  })

  it('retorna 30 para data de 30 dias atrás', () => {
    const d = new Date()
    d.setDate(d.getDate() - 30)
    expect(daysAgo(d.toISOString().split('T')[0])).toBe(30)
  })
})

describe('formatBRL', () => {
  it('formata valor como moeda brasileira', () => {
    expect(formatBRL(1500.5)).toContain('1.500,50')
  })

  it('formata zero', () => {
    expect(formatBRL(0)).toContain('0,00')
  })
})

describe('estimateDaysStale', () => {
  it('retorna dias desde criação do orçamento', () => {
    const d = new Date()
    d.setDate(d.getDate() - 15)
    expect(estimateDaysStale(d.toISOString())).toBe(15)
  })
})
