import 'server-only'

import { prisma } from '@/lib/prisma'

import { airportTimeZones, zonedDateKey } from './airport-timezones'

export type FlightForDate = {
  id: string
  departureAt: Date
  arrivalAt: Date
  durationMinutes: number
  basePrice: number
}

const dayMs = 24 * 60 * 60 * 1000

export async function getFlightForDate(
  originCode: string,
  destinationCode: string,
  dateKey: string,
): Promise<FlightForDate | null> {
  const timeZone = airportTimeZones[originCode]
  if (!timeZone) return null

  const year = Number(dateKey.slice(0, 4))
  const monthIndex = Number(dateKey.slice(5, 7)) - 1
  const day = Number(dateKey.slice(8, 10))
  const rangeStart = new Date(Date.UTC(year, monthIndex, day) - dayMs)
  const rangeEnd = new Date(Date.UTC(year, monthIndex, day) + 2 * dayMs)

  const flights = await prisma.flight.findMany({
    where: {
      originAirport: { code: originCode },
      destinationAirport: { code: destinationCode },
      departureAt: { gte: rangeStart, lt: rangeEnd },
    },
    select: {
      id: true,
      departureAt: true,
      arrivalAt: true,
      durationMinutes: true,
      basePrice: true,
    },
    orderBy: { departureAt: 'asc' },
  })

  const match = flights.find((flight) => zonedDateKey(flight.departureAt, timeZone) === dateKey)
  if (!match) return null

  return {
    id: match.id,
    departureAt: match.departureAt,
    arrivalAt: match.arrivalAt,
    durationMinutes: match.durationMinutes,
    basePrice: Number(match.basePrice),
  }
}
