import { fetchHelena } from '@/lib/api'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const { phone, name } = await request.json() as { phone: string; name: string }

  if (!phone || !name) {
    return NextResponse.json({ error: 'phone e name são obrigatórios' }, { status: 400 })
  }

  await fetchHelena('/chat/v1/message/send', {
    method: 'POST',
    body: JSON.stringify({
      to: phone,
      body: {
        type: 'text',
        text: `🎂 Feliz aniversário, ${name}! A equipe Prime Odontocenter deseja a você um dia incrível. Que tal aproveitar esse dia especial e agendar sua avaliação gratuita? 😊 ${process.env.SCHEDULING_LINK}`,
      },
    }),
  })

  return NextResponse.json({ success: true })
}
