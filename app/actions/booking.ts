'use server'

import { randomBytes } from 'node:crypto'

import { redirect } from 'next/navigation'
import * as z from 'zod'

import { getCurrentAccount } from '@/lib/auth/session'
import { getFlightForDate, type FlightForDate } from '@/lib/flights/flights'
import { cabinAddPrice } from '@/lib/flights/seat-map'
import { CabinClass } from '@/lib/generated/prisma/enums'
import { prisma } from '@/lib/prisma'
import { passengerSchema, type BookingFormState } from '@/lib/validations/booking'

function parseSeat(code: string | null): { row: number; column: string } | null {
  if (!code) return null
  const match = /^(\d+)([A-Z])$/.exec(code)
  if (!match) return null
  return { row: Number(match[1]), column: match[2] }
}

export async function createBooking(
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
  const cabin: CabinClass =
    formData.get('cabin') === 'BUSINESS' ? CabinClass.BUSINESS : CabinClass.ECONOMY
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

  const addPrice = cabinAddPrice[cabin]
  const legs: { flight: FlightForDate; seat: { row: number; column: string } }[] = [
    { flight: outboundFlight, seat: seatOut },
  ]
  if (trip === 'round' && returnFlight && seatRet) {
    legs.push({ flight: returnFlight, seat: seatRet })
  }

  const totalPrice = legs.reduce((sum, leg) => sum + leg.flight.basePrice + addPrice, 0)
  const account = await getCurrentAccount()
  const data = parsed.data
  const toDate = (value: string) => new Date(`${value}T00:00:00Z`)

  let bookingId: string
  try {
    const booking = await prisma.$transaction(async (tx) => {
      const created = await tx.booking.create({
        data: {
          reference: randomBytes(4).toString('hex').toUpperCase(),
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
        },
      })

      for (const leg of legs) {
        const seat = await tx.seat.create({
          data: {
            flightId: leg.flight.id,
            seatRow: leg.seat.row,
            seatColumn: leg.seat.column,
            cabinClass: cabin,
          },
        })
        await tx.ticket.create({
          data: {
            flightId: leg.flight.id,
            seatId: seat.id,
            bookingId: created.id,
            price: leg.flight.basePrice + addPrice,
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
    console.error('createBooking failed', error)
    return { message: 'Something went wrong. Please try again.' }
  }

  redirect(`/booking/confirm?bookingId=${bookingId}`)
}
