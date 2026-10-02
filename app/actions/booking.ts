'use server'

import { randomBytes } from 'node:crypto'

import { redirect } from 'next/navigation'
import * as z from 'zod'

import { airports } from '@/constants/airports'
import { cabinAddPrice } from '@/constants/cabin'
import { getCurrentAccount } from '@/lib/auth/session'
import { getFlightForDate, type FlightForDate } from '@/lib/flights/flights'
import { CabinClass, PaymentStatus, SeatStatus } from '@/lib/generated/prisma/enums'
import { prisma } from '@/lib/prisma'
import { stripe } from '@/lib/stripe/client'
import { passengerSchema, type BookingFormState } from '@/lib/validations/booking'

const HOLD_MINUTES = 30

function parseSeat(code: string | null): { row: number; column: string } | null {
  if (!code) return null
  const match = /^(\d+)([A-Z])$/.exec(code)
  if (!match) return null
  return { row: Number(match[1]), column: match[2] }
}

function cityFor(code: string): string {
  return airports.find((airport) => airport.code === code)?.city ?? code
}

export async function startCheckout(
  _state: BookingFormState,
  formData: FormData,
): Promise<BookingFormState> {
  const parsed = passengerSchema.safeParse({
    firstName: formData.get('firstName'),
    lastName: formData.get('lastName'),
    middleName: formData.get('middleName') || undefined,
    contactEmail: formData.get('contactEmail'),
    contactPhone: formData.get('contactPhone') || undefined,
    dateOfBirth: formData.get('dateOfBirth'),
    nationality: formData.get('nationality'),
    passportNumber: formData.get('passportNumber'),
    countryOfIssue: formData.get('countryOfIssue'),
    dateOfIssue: formData.get('dateOfIssue'),
    dateOfExpiry: formData.get('dateOfExpiry'),
  })

  if (!parsed.success) {
    return { errors: z.flattenError(parsed.error).fieldErrors }
  }

  const from = String(formData.get('from') ?? '')
  const to = String(formData.get('to') ?? '')
  const trip = formData.get('trip') === 'oneway' ? 'oneway' : 'round'
  const cabinOut: CabinClass =
    formData.get('cabinOut') === 'BUSINESS' ? CabinClass.BUSINESS : CabinClass.ECONOMY
  const cabinRet: CabinClass =
    formData.get('cabinRet') === 'BUSINESS' ? CabinClass.BUSINESS : CabinClass.ECONOMY
  const depart = String(formData.get('depart') ?? '')
  const returnDate = String(formData.get('returnDate') ?? '')
  const seatOut = parseSeat(formData.get('seatOut') as string | null)
  const seatRet = parseSeat(formData.get('seatRet') as string | null)

  if (!from || !to || !depart || !seatOut) {
    return { message: 'Your selection is incomplete. Please start again.' }
  }

  const outboundFlight = await getFlightForDate(from, to, depart)
  const returnFlight = trip === 'round' ? await getFlightForDate(to, from, returnDate) : null
  if (!outboundFlight || (trip === 'round' && (!returnFlight || !seatRet))) {
    return { message: 'The selected flight is no longer available.' }
  }

  const legs: {
    flight: FlightForDate
    seat: { row: number; column: string }
    cabin: CabinClass
    from: string
    to: string
  }[] = [{ flight: outboundFlight, seat: seatOut, cabin: cabinOut, from, to }]
  if (trip === 'round' && returnFlight && seatRet) {
    legs.push({ flight: returnFlight, seat: seatRet, cabin: cabinRet, from: to, to: from })
  }

  const totalPrice = legs.reduce(
    (sum, leg) => sum + leg.flight.basePrice + cabinAddPrice[leg.cabin],
    0,
  )
  const account = await getCurrentAccount()
  const data = parsed.data
  const toDate = (value: string) => new Date(`${value}T00:00:00Z`)
  const reference = randomBytes(4).toString('hex').toUpperCase()
  const expiresAt = new Date(Date.now() + HOLD_MINUTES * 60 * 1000)

  let bookingId: string
  try {
    const booking = await prisma.$transaction(async (tx) => {
      const created = await tx.booking.create({
        data: {
          reference,
          accountId: account?.id ?? null,
          contactEmail: data.contactEmail,
          contactPhone: data.contactPhone ?? null,
          firstName: data.firstName,
          lastName: data.lastName,
          middleName: data.middleName ?? null,
          dateOfBirth: toDate(data.dateOfBirth),
          nationality: data.nationality,
          passportNumber: data.passportNumber,
          countryOfIssue: data.countryOfIssue,
          dateOfIssue: toDate(data.dateOfIssue),
          dateOfExpiry: toDate(data.dateOfExpiry),
          totalPrice,
          expiresAt,
        },
      })

      for (const leg of legs) {
        const seat = await tx.seat.create({
          data: {
            flightId: leg.flight.id,
            seatRow: leg.seat.row,
            seatColumn: leg.seat.column,
            cabinClass: leg.cabin,
            status: SeatStatus.PENDING,
          },
        })
        await tx.ticket.create({
          data: {
            flightId: leg.flight.id,
            seatId: seat.id,
            bookingId: created.id,
            price: leg.flight.basePrice + cabinAddPrice[leg.cabin],
          },
        })
      }

      return created
    })
    bookingId = booking.id
  } catch (error) {
    if ((error as { code?: string }).code === 'P2002') {
      return { message: 'One of the selected seats was just taken. Please choose another.' }
    }
    console.error('startCheckout: booking creation failed', error)
    return { message: 'Something went wrong. Please try again.' }
  }

  const appUrl = process.env.APP_URL ?? 'http://localhost:3000'
  const cancelQuery = new URLSearchParams({
    from,
    to,
    trip,
    cabinOut,
    depart,
    seatOut: `${seatOut.row}${seatOut.column}`,
    ...(trip === 'round' ? { cabinRet } : {}),
    ...(returnDate ? { returnDate } : {}),
    ...(seatRet ? { seatRet: `${seatRet.row}${seatRet.column}` } : {}),
  }).toString()

  let sessionUrl: string
  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: legs.map((leg) => ({
        quantity: 1,
        price_data: {
          currency: 'cad',
          unit_amount: Math.round((leg.flight.basePrice + cabinAddPrice[leg.cabin]) * 100),
          product_data: {
            name: `${cityFor(leg.from)} → ${cityFor(leg.to)} ${leg.flight.flightNumber}`,
          },
        },
      })),
      metadata: { bookingId },
      expires_at: Math.floor(expiresAt.getTime() / 1000),
      success_url: `${appUrl}/booking/complete?bookingId=${bookingId}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/booking/confirm?${cancelQuery}`,
    })

    if (!session.url) throw new Error('Stripe session has no URL')

    await prisma.payment.create({
      data: {
        bookingId,
        stripeCheckoutSessionId: session.id,
        stripePaymentIntentId:
          typeof session.payment_intent === 'string' ? session.payment_intent : null,
        amount: Math.round(totalPrice * 100),
        currency: 'cad',
        status: PaymentStatus.PENDING,
      },
    })

    sessionUrl = session.url
  } catch (error) {
    console.error('startCheckout: stripe session failed', error)
    await prisma.booking.delete({ where: { id: bookingId } }).catch(() => {})
    return { message: 'Could not start payment. Please try again.' }
  }

  redirect(sessionUrl)
}
