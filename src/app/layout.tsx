import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Security+ Red Team Labs',
  description: 'Browser-only CompTIA Security+ red-team training simulations',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  )
}
