import Link from 'next/link'
import { redirect } from 'next/navigation'

import { BookingSummary } from '@/components/booking/booking-summary'
import { ClearBookingForm } from '@/components/booking/clear-booking-form'
import { confirmPaidBooking } from '@/lib/booking/finalize'
import { getBookingView } from '@/lib/booking/get-booking-view'
import { BookingStatus } from '@/lib/generated/prisma/enums'
import { stripe } from '@/lib/stripe/client'

export default async function CompletePage({
  searchParams,
}: {
  searchParams: Promise<{ bookingId?: string; session_id?: string }>
}) {
  const { bookingId, session_id: sessionId } = await searchParams
  if (!bookingId) redirect('/')

  let booking = await getBookingView(bookingId)
  if (!booking) redirect('/')

  // Fallback: the webhook may not have landed yet. If Stripe reports the
  // session as paid, confirm now (idempotent) so the user isn't left waiting.
  if (booking.status !== BookingStatus.CONFIRMED && sessionId) {
    try {
      const session = await stripe.checkout.sessions.retrieve(sessionId)
      if (session.payment_status === 'paid' && session.metadata?.bookingId === bookingId) {
        const paymentIntentId =
          typeof session.payment_intent === 'string' ? session.payment_intent : null
        await confirmPaidBooking(bookingId, session.id, paymentIntentId)
        booking = (await getBookingView(bookingId)) ?? booking
      }
    } catch (error) {
      console.error('complete: checkout session retrieve failed', error)
    }
  }

  const confirmed = booking.status === BookingStatus.CONFIRMED

  return (
    <main className="mx-auto max-w-2xl px-6 py-12">
      <ClearBookingForm />

      {confirmed ? (
        <div className="mb-8 rounded-lg border border-brand-200 bg-brand-50 p-6 text-center">
          <h1 className="mb-1 text-2xl font-semibold text-brand-800">Booking confirmed</h1>
          <p className="text-sm text-brand-700">
            Reference <span className="font-mono font-semibold">{booking.reference}</span>
          </p>
        </div>
      ) : (
        <div className="mb-8 rounded-lg border border-amber-200 bg-amber-50 p-6 text-center">
          <h1 className="mb-1 text-2xl font-semibold text-amber-800">Finalizing your payment…</h1>
          <p className="text-sm text-amber-700">
            This can take a moment. Please reload this page shortly.
          </p>
        </div>
      )}

      <BookingSummary booking={booking} />

      <div className="mt-8 text-center">
        <Link href="/" className="text-brand-700 underline">
          Back to home
        </Link>
      </div>
    </main>
  )
}
