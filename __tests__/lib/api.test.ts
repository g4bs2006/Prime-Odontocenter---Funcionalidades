import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

describe('fetchClinicorp', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    process.env.CLINICORP_USER = 'testuser'
    process.env.CLINICORP_TOKEN = 'testtoken'
  })

  it('chama a URL correta com Basic Auth', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ list: [] }),
    })

    const { fetchClinicorp } = await import('@/lib/api')
    await fetchClinicorp('/business/list?subscriber_id=prime')

    expect(mockFetch).toHaveBeenCalledWith(
      'https://api.clinicorp.com/rest/v1/business/list?subscriber_id=prime',
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: expect.stringMatching(/^Basic /),
        }),
      })
    )
  })

  it('lança erro quando response.ok é false', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 400, text: async () => 'Bad Request' })
    const { fetchClinicorp } = await import('@/lib/api')
    await expect(fetchClinicorp('/bad-path')).rejects.toThrow('Clinicorp 400')
  })
})

describe('fetchHelena', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    process.env.HELENA_API_KEY = 'test-key'
  })

  it('chama a URL correta com Bearer token', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({ data: [] }) })
    const { fetchHelena } = await import('@/lib/api')
    await fetchHelena('/chat/v2/session')

    expect(mockFetch).toHaveBeenCalledWith(
      'https://api.wts.chat/chat/v2/session',
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer test-key',
        }),
      })
    )
  })

  it('lança erro quando response.ok é false', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 401, text: async () => 'Unauthorized' })
    const { fetchHelena } = await import('@/lib/api')
    await expect(fetchHelena('/chat/v2/session')).rejects.toThrow('Helena 401')
  })
})
