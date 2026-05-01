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
  const map: Record<string, ClinicSlug> = JSON.parse(process.env.ACCOUNT_MAP ?? '{}')
  const slug = map[accountId]
  if (!slug || !(slug in CLINIC_CREDENTIALS)) {
    throw new Error(`Unknown accountId: ${accountId}`)
  }
  return CLINIC_CREDENTIALS[slug]()
}
