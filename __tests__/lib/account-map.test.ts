import { describe, it, expect, beforeEach } from 'vitest'

describe('getClinicCredentials', () => {
  beforeEach(() => {
    process.env.ACCOUNT_MAP = JSON.stringify({ 'acc-123': 'prime' })
    process.env.CLINICORP_USER = 'primeodontocenter'
    process.env.CLINICORP_TOKEN = 'b6b383e7-6b27-4378-8dfb-057648f6f017'
    process.env.CLINICORP_SUBSCRIBER_ID = 'primeodontocenter'
    process.env.CLINICORP_BUSINESS_ID = '6505624431493120'
  })

  it('retorna credenciais para accountId conhecido', async () => {
    const { getClinicCredentials } = await import('@/lib/account-map')
    const creds = getClinicCredentials('acc-123')
    expect(creds).toEqual({
      user: 'primeodontocenter',
      token: 'b6b383e7-6b27-4378-8dfb-057648f6f017',
      subscriberId: 'primeodontocenter',
      businessId: 6505624431493120,
    })
  })

  it('lança erro para accountId desconhecido', async () => {
    const { getClinicCredentials } = await import('@/lib/account-map')
    expect(() => getClinicCredentials('unknown')).toThrow('Unknown accountId: unknown')
  })
})
