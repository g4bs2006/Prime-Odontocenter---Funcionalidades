import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Fluxodonto Apps',
  description: 'Ferramentas integradas para clínicas odontológicas',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className={`${inter.className} bg-background text-foreground antialiased`}>
        <main className="min-h-screen p-6">{children}</main>
      </body>
    </html>
  )
}
