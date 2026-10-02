import 'server-only'

import { sendBookingConfirmation } from '@/lib/email/send'
import { BookingStatus, PaymentStatus, SeatStatus } from '@/lib/generated/prisma/enums'
import { prisma } from '@/lib/prisma'

// Idempotently confirm a paid booking. Safe to call from both the Stripe
// webhook and the success-page fallback.
export async function confirmPaidBooking(
  bookingId: string,
  checkoutSessionId: string,
  paymentIntentId: string | null,
): Promise<void> {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    select: { id: true, status: true, contactEmail: true, reference: true, totalPrice: true },
  })
  if (!booking || booking.status === BookingStatus.CONFIRMED) return

  await prisma.$transaction([
    prisma.booking.update({
      where: { id: booking.id },
      data: { status: BookingStatus.CONFIRMED, expiresAt: null },
    }),
    prisma.seat.updateMany({
      where: { ticket: { bookingId: booking.id } },
      data: { status: SeatStatus.CONFIRMED },
    }),
    prisma.payment.updateMany({
      where: { stripeCheckoutSessionId: checkoutSessionId },
      data: {
        status: PaymentStatus.SUCCEEDED,
        ...(paymentIntentId ? { stripePaymentIntentId: paymentIntentId } : {}),
      },
    }),
  ])

  try {
    await sendBookingConfirmation(booking.contactEmail, {
      reference: booking.reference,
      totalPrice: Number(booking.totalPrice),
    })
  } catch (error) {
    console.error('confirmPaidBooking: confirmation email failed', error)
  }
}

// Idempotently cancel an unpaid booking and release its held seats.
export async function expireBooking(bookingId: string, checkoutSessionId: string): Promise<void> {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    select: { id: true, status: true, tickets: { select: { seatId: true } } },
  })
  if (!booking || booking.status !== BookingStatus.PENDING) return

  const seatIds = booking.tickets.map((ticket) => ticket.seatId)

  await prisma.$transaction([
    prisma.payment.updateMany({
      where: { stripeCheckoutSessionId: checkoutSessionId },
      data: { status: PaymentStatus.EXPIRED },
    }),
    prisma.booking.update({
      where: { id: booking.id },
      data: { status: BookingStatus.CANCELLED, expiresAt: null },
    }),
    prisma.ticket.deleteMany({ where: { bookingId: booking.id } }),
    prisma.seat.deleteMany({ where: { id: { in: seatIds } } }),
  ])
}
