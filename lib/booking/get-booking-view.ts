import 'server-only'

import { airportTimeZones } from '@/constants/airport-timezones'
import { formatZonedDateTime } from '@/lib/flights/airport-timezones'
import { CabinClass } from '@/lib/generated/prisma/enums'
import { prisma } from '@/lib/prisma'

export type LegView = {
  flightNumber: string
  fromCity: string
  toCity: string
  departure: string
  arrival: string
  seat: string
  cabin: string
  price: number
}

export type BookingView = {
  id: string
  reference: string
  status: string
  totalPrice: number
  passengerName: string
  contactEmail: string
  contactPhone: string | null
  passportNumber: string
  nationality: string
  legs: LegView[]
}

export async function getBookingView(bookingId: string): Promise<BookingView | null> {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      tickets: {
        orderBy: { flight: { departureAt: 'asc' } },
        include: {
          seat: { select: { seatRow: true, seatColumn: true, cabinClass: true } },
          flight: {
            include: {
              flightMap: {
                include: {
                  originAirport: { select: { code: true, city: true } },
                  destinationAirport: { select: { code: true, city: true } },
                },
              },
            },
          },
        },
      },
    },
  })
  if (!booking) return null

  const legs: LegView[] = booking.tickets.map((ticket) => {
    const { originAirport, destinationAirport } = ticket.flight.flightMap
    const originTz = airportTimeZones[originAirport.code] ?? 'UTC'
    const destinationTz = airportTimeZones[destinationAirport.code] ?? 'UTC'
    return {
      flightNumber: ticket.flight.flightNumber,
      fromCity: originAirport.city,
      toCity: destinationAirport.city,
      departure: formatZonedDateTime(ticket.flight.departureAt, originTz),
      arrival: formatZonedDateTime(ticket.flight.arrivalAt, destinationTz),
      seat: `${ticket.seat.seatRow}${ticket.seat.seatColumn}`,
      cabin: ticket.seat.cabinClass === CabinClass.BUSINESS ? 'Business' : 'Economy',
      price: Number(ticket.price),
    }
  })

  return {
    id: booking.id,
    reference: booking.reference,
    status: booking.status,
    totalPrice: Number(booking.totalPrice),
    passengerName: [booking.firstName, booking.middleName, booking.lastName]
      .filter(Boolean)
      .join(' '),
    contactEmail: booking.contactEmail,
    contactPhone: booking.contactPhone,
    passportNumber: booking.passportNumber ?? '',
    nationality: booking.nationality ?? '',
    legs,
  }
}
