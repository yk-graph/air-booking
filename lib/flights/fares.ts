import 'server-only'

import { airportTimeZones } from '@/constants/airport-timezones'
import { cabinAddPrice } from '@/constants/cabin'
import type { CabinClass } from '@/lib/generated/prisma/enums'
import { prisma } from '@/lib/prisma'

import { zonedDateKey } from './airport-timezones'
import { routeCode } from './routes'

export type DailyFare = {
  date: string
  price: number
  flightId: string
  departureAt: Date
}

const dayMs = 24 * 60 * 60 * 1000

export async function getMonthlyFares(
  originCode: string,
  destinationCode: string,
  month: string,
  cabin: CabinClass,
): Promise<Map<string, DailyFare>> {
  const timeZone = airportTimeZones[originCode]
  if (!timeZone) return new Map()

  const year = Number(month.slice(0, 4))
  const monthIndex = Number(month.slice(5, 7)) - 1
  const rangeStart = new Date(Date.UTC(year, monthIndex, 1) - dayMs)
  const rangeEnd = new Date(Date.UTC(year, monthIndex + 1, 1) + dayMs)

  const flights = await prisma.flight.findMany({
    where: {
      flightMap: { code: routeCode(originCode, destinationCode) },
      departureAt: { gte: rangeStart, lt: rangeEnd },
    },
    select: { id: true, departureAt: true, basePrice: true },
    orderBy: { departureAt: 'asc' },
  })

  const addPrice = cabinAddPrice[cabin]
  const fares = new Map<string, DailyFare>()
  for (const flight of flights) {
    const date = zonedDateKey(flight.departureAt, timeZone)
    if (!date.startsWith(month) || fares.has(date)) continue
    fares.set(date, {
      date,
      price: Number(flight.basePrice) + addPrice,
      flightId: flight.id,
      departureAt: flight.departureAt,
    })
  }
  return fares
}
