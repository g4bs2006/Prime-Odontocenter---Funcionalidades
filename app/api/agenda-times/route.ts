import { NextRequest, NextResponse } from 'next/server'
import { fetchClinicorp } from '@/lib/api'
import type { ClinicorpAvailableTime } from '@/lib/types'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const professionalId = searchParams.get('professionalId')
  const from = searchParams.get('from')
  const to = searchParams.get('to')

  if (!professionalId || !from || !to) {
    return NextResponse.json({ error: 'Missing params' }, { status: 400 })
  }

  try {
    const data = await fetchClinicorp<ClinicorpAvailableTime[]>(
      `/business/list_available_times?subscriber_id=primeodontocenter&business_id=6505624431493120&professional_id=${professionalId}&from=${from}&to=${to}`
    )
    return NextResponse.json(data)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erro desconhecido'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
