import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Builder GPT - Construction Problem Solver for UK Builders',
  description: 'Get clear, practical guidance on payments, extras, difficult customers, pricing, and disputes. Built for UK builders and trades.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en-GB">
      <body>{children}</body>
    </html>
  )
}
