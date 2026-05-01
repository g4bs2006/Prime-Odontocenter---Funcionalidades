// web/lib/types.ts

// ── Clinicorp ──────────────────────────────────────────────

export interface ClinicorpBusiness {
  id: number
  CompanyId: string
  BusinessName: string
  Name: string
  Address: string
  Email: string
}

export interface ClinicorpProfessional {
  id: number
  Name: string
  Specialty: string
}

export interface ClinicorpPatient {
  id: number
  Name: string
  CPF: string
  Phone: string
  Email: string
  BirthDate: string
}

export interface ClinicorpAppointment {
  id: number
  PatientId: number
  PatientName: string
  ProfessionalName: string
  Date: string
  Time: string
  Status: string
  Category: string
}

export interface ClinicorpEstimate {
  id: number
  PatientId: number
  PatientName: string
  PatientPhone: string
  ProfessionalName: string
  TotalValue: number
  CreatedAt: string
  Status: string
  Procedures: string[]
}

export interface ClinicorpAvailableTime {
  Date: string
  Times: string[]
  ProfessionalId: number
  ProfessionalName: string
}

export interface ClinicorpFinancialSummary {
  TotalRevenue: number
  TotalExpenses: number
  Balance: number
  Period: string
}

export interface ClinicorpCashFlow {
  Date: string
  Revenue: number
  Expense: number
  Forecast: number
}

export interface ClinicorpPayment {
  id: number
  PatientName: string
  Amount: number
  Date: string
  Status: string
  Method: string
}

export interface ClinicorpBirthday {
  id: number
  Name: string
  Phone: string
  BirthDate: string
  Age: number
}

// ── Helena ────────────────────────────────────────────────

export interface HelenaSession {
  id: string
  createdAt: string
  status: string
  contact: {
    id: string
    name: string
    phonenumber: string
  }
  tags: string[]
  lastInteractionAt: string
}

export interface HelenaContact {
  id: string
  name: string
  phonenumber: string
  email: string | null
  tags: string[]
}

// ── Internal ──────────────────────────────────────────────

export type ClinicSlug = 'prime'

export interface ClinicCredentials {
  user: string
  token: string
  subscriberId: string
  businessId: number
}

export interface CriticalClient {
  patientId: number
  patientName: string
  patientPhone: string
  reason: 'stale_estimate' | 'unconfirmed_appointment' | 'no_show_history' | 'stale_lead'
  reasonLabel: string
  daysStale: number
  estimateValue?: number
  appointmentDate?: string
}
