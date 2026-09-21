import type { Metadata } from 'next'
import { ReactNode } from 'react'

import './globals.css'

export const metadata: Metadata = {
  title: 'Air Flight Booking',
  description: 'Flight booking app',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full">{children}</body>
    </html>
  )
}
