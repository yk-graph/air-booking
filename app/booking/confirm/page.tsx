import Link from 'next/link'
import { redirect } from 'next/navigation'

import { prisma } from '@/lib/prisma'

export default async function ConfirmPage({
  searchParams,
}: {
  searchParams: Promise<{ bookingId?: string }>
}) {
  const { bookingId } = await searchParams
  if (!bookingId) redirect('/')

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    select: { reference: true, status: true, totalPrice: true, tickets: { select: { id: true } } },
  })
  if (!booking) redirect('/')

  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="mb-4 text-2xl font-semibold">Review your booking — coming soon</h1>
      <p className="mb-2 text-gray-600">
        Reference <span className="font-mono font-semibold">{booking.reference}</span> ·{' '}
        {booking.status}
      </p>
      <p className="mb-6 text-gray-600">
        {booking.tickets.length} ticket(s) · Total C$
        {Number(booking.totalPrice).toLocaleString('en-US')}
      </p>
      <Link href="/" className="text-emerald-700 underline">
        Back to home
      </Link>
    </main>
  )
}
