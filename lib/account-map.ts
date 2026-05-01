import 'server-only'
import type { ClinicCredentials, ClinicSlug } from '@/lib/types'

const CLINIC_CREDENTIALS: Record<ClinicSlug, () => ClinicCredentials> = {
  prime: () => ({
    user: process.env.CLINICORP_USER!,
    token: process.env.CLINICORP_TOKEN!,
    subscriberId: process.env.CLINICORP_SUBSCRIBER_ID!,
    businessId: Number(process.env.CLINICORP_BUSINESS_ID!),
  }),
}

export function getClinicCredentials(accountId: string): ClinicCredentials {
  let map: Record<string, ClinicSlug> = {}
  try {
    map = JSON.parse(process.env.ACCOUNT_MAP ?? '{}')
  } catch {
    throw new Error('ACCOUNT_MAP env var is not valid JSON')
  }
  const slug = map[accountId]
  if (!slug) throw new Error(`No clinic mapping for accountId: ${accountId}`)
  if (!(slug in CLINIC_CREDENTIALS)) throw new Error(`Clinic slug "${slug}" is not configured`)
  return CLINIC_CREDENTIALS[slug]()
}
