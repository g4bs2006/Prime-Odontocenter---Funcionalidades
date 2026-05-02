import { fetchHelena } from '@/lib/api'
import { birthdayMessage } from '@/lib/birthday-message'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const { phone, name } = await request.json() as { phone: string; name: string }

  if (!phone || !name) {
    return NextResponse.json({ error: 'phone e name são obrigatórios' }, { status: 400 })
  }

  const text = birthdayMessage(name, process.env.SCHEDULING_LINK ?? '')

  await fetchHelena('/chat/v1/message/send', {
    method: 'POST',
    body: JSON.stringify({
      to: phone,
      body: { type: 'text', text },
    }),
  })

  return NextResponse.json({ success: true })
}
