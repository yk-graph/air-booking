import Link from 'next/link'
import { redirect } from 'next/navigation'

import { BookingSummary } from '@/components/booking/booking-summary'
import { getBookingView } from '@/lib/booking/get-booking-view'

export default async function CompletePage({
  searchParams,
}: {
  searchParams: Promise<{ bookingId?: string }>
}) {
  const { bookingId } = await searchParams
  if (!bookingId) redirect('/')

  const booking = await getBookingView(bookingId)
  if (!booking) redirect('/')

  return (
    <main className="mx-auto max-w-2xl px-6 py-12">
      <div className="mb-8 rounded-lg border border-emerald-200 bg-emerald-50 p-6 text-center">
        <h1 className="mb-1 text-2xl font-semibold text-emerald-800">Booking confirmed</h1>
        <p className="text-sm text-emerald-700">
          Reference <span className="font-mono font-semibold">{booking.reference}</span>
        </p>
      </div>

      <BookingSummary booking={booking} />

      <div className="mt-8 text-center">
        <Link href="/" className="text-emerald-700 underline">
          Back to home
        </Link>
      </div>
    </main>
  )
}
