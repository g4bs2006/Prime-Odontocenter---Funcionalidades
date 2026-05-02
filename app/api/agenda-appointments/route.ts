import { NextRequest, NextResponse } from 'next/server'
import { fetchClinicorp } from '@/lib/api'
import type { ClinicorpAppointment } from '@/lib/types'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const from = searchParams.get('from')
  const to = searchParams.get('to')

  if (!from || !to) {
    return NextResponse.json({ error: 'Missing params: from, to' }, { status: 400 })
  }

  try {
    const data = await fetchClinicorp<ClinicorpAppointment[]>(
      `/appointment/list?subscriber_id=primeodontocenter&business_id=6505624431493120&from=${from}&to=${to}`
    )
    return NextResponse.json(data)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erro desconhecido'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
