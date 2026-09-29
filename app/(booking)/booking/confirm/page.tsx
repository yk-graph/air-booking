import { redirect } from 'next/navigation'

import { confirmBooking } from '@/app/actions/booking'
import { BookingSummary } from '@/components/booking/booking-summary'
import { getBookingView } from '@/lib/booking/get-booking-view'
import { BookingStatus } from '@/lib/generated/prisma/enums'

export default async function ConfirmPage({
  searchParams,
}: {
  searchParams: Promise<{ bookingId?: string }>
}) {
  const { bookingId } = await searchParams
  if (!bookingId) redirect('/')

  const booking = await getBookingView(bookingId)
  if (!booking) redirect('/')
  if (booking.status !== BookingStatus.PENDING) {
    redirect(`/booking/complete?bookingId=${booking.id}`)
  }

  return (
    <main className="mx-auto max-w-2xl px-6 py-12">
      <h1 className="mb-2 text-3xl font-semibold">Review your booking</h1>
      <p className="mb-8 text-sm text-gray-500">
        Please review the details before confirming your reservation.
      </p>

      <BookingSummary booking={booking} />

      <form action={confirmBooking} className="mt-8 text-center">
        <input type="hidden" name="bookingId" value={booking.id} />
        <button
          type="submit"
          className="w-full max-w-sm rounded bg-emerald-700 px-6 py-3 text-base font-semibold text-white hover:bg-emerald-800"
        >
          Confirm booking
        </button>
      </form>
    </main>
  )
}
