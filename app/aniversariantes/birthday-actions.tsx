'use client'
import { useState } from 'react'
import { Button } from '@/components/ui/button'

interface Props {
  phone: string
  name: string
  messagePreview: string
}

export function BirthdayActions({ phone, name, messagePreview }: Props) {
  const [status, setStatus] = useState<'idle' | 'preview' | 'sending' | 'sent' | 'error'>('idle')

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

  const fluxodontoUrl = `https://app.fluxodonto.com/crm/contatos?phone=${encodeURIComponent(phone)}`

  if (status === 'sent') {
    return (
      <div className="flex items-center gap-3 flex-shrink-0">
        <span className="text-green-500 text-sm font-medium">✓ Enviado</span>
        <a href={fluxodontoUrl} target="_blank" className="text-xs text-blue-500 hover:underline">
          Abrir conversa →
        </a>
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="flex items-center gap-2 flex-shrink-0">
        <span className="text-red-500 text-sm font-medium">✗ Falhou</span>
        <Button size="sm" variant="outline" onClick={() => setStatus('idle')}>Tentar novamente</Button>
      </div>
    )
  }

  if (status === 'preview') {
    return (
      <div className="flex flex-col gap-2 max-w-xs flex-shrink-0">
        <div className="rounded-lg border bg-muted/50 px-3 py-2 text-xs text-muted-foreground leading-relaxed">
          {messagePreview}
        </div>
        <div className="flex gap-2">
          <Button size="sm" onClick={send}>
            Confirmar envio
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setStatus('idle')}>
            Cancelar
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2 flex-shrink-0">
      <a
        href={fluxodontoUrl}
        target="_blank"
        className="text-xs text-blue-500 hover:underline whitespace-nowrap"
      >
        Abrir conversa →
      </a>
      <Button
        size="sm"
        variant="outline"
        onClick={() => setStatus('preview')}
        disabled={status === 'sending'}
      >
        🎁 Enviar parabéns
      </Button>
    </div>
  )
}
