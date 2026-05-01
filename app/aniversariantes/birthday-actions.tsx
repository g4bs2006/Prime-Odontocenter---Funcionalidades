'use client'
import { useState } from 'react'
import { Button } from '@/components/ui/button'

interface BirthdayActionsProps {
  phone: string
  name: string
}

export function BirthdayActions({ phone, name }: BirthdayActionsProps) {
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')

  async function send() {
    setStatus('sending')
    try {
      const res = await fetch('/api/send-birthday', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, name }),
      })
      setStatus(res.ok ? 'sent' : 'error')
    } catch {
      setStatus('error')
    }
  }

  if (status === 'sent') return <span className="text-green-500 text-sm font-medium">✓ Enviado</span>
  if (status === 'error') return <span className="text-red-500 text-sm font-medium">✗ Erro</span>

  return (
    <Button onClick={send} disabled={status === 'sending'} size="sm">
      {status === 'sending' ? 'Enviando...' : '🎁 Enviar parabéns'}
    </Button>
  )
}
