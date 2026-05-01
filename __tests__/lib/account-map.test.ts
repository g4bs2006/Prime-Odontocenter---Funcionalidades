import { describe, it, expect, beforeEach } from 'vitest'

describe('getClinicCredentials', () => {
  beforeEach(() => {
    process.env.ACCOUNT_MAP = JSON.stringify({ 'acc-123': 'prime' })
    process.env.CLINICORP_USER = 'test-user'
    process.env.CLINICORP_TOKEN = 'test-token'
    process.env.CLINICORP_SUBSCRIBER_ID = 'test-subscriber'
    process.env.CLINICORP_BUSINESS_ID = '6505624431493120'
  })

  it('retorna credenciais para accountId conhecido', async () => {
    const { getClinicCredentials } = await import('@/lib/account-map')
    const creds = getClinicCredentials('acc-123')
    expect(creds).toEqual({
      user: 'test-user',
      token: 'test-token',
      subscriberId: 'test-subscriber',
      businessId: 6505624431493120,
    })
  })

  it('lança erro para accountId desconhecido', async () => {
    const { getClinicCredentials } = await import('@/lib/account-map')
    expect(() => getClinicCredentials('unknown')).toThrow('No clinic mapping for accountId: unknown')
  })
})
