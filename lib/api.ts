import 'server-only'

const CLINICORP_BASE = 'https://api.clinicorp.com/rest/v1'
const HELENA_BASE = 'https://api.wts.chat'

function clinicorpAuth(): string {
  const user = process.env.CLINICORP_USER!
  const token = process.env.CLINICORP_TOKEN!
  return `Basic ${Buffer.from(`${user}:${token}`).toString('base64')}`
}

export async function fetchClinicorp<T = unknown>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${CLINICORP_BASE}${path}`, {
    ...init,
    headers: {
      Authorization: clinicorpAuth(),
      'Content-Type': 'application/json',
      ...init?.headers,
    },
    next: { revalidate: 60 },
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Clinicorp ${res.status}: ${text}`)
  }
  return res.json() as Promise<T>
}

// No cache revalidation: Helena session data is real-time by design.
export async function fetchHelena<T = unknown>(
  path: string,
  init?: RequestInit
): Promise<T> {
  const key = process.env.HELENA_API_KEY!
  const res = await fetch(`${HELENA_BASE}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
      ...init?.headers,
    },
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Helena ${res.status}: ${text}`)
  }
  return res.json() as Promise<T>
}
