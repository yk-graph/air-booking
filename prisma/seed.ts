import 'dotenv/config'

import { PrismaMariaDb } from '@prisma/adapter-mariadb'

import { airportTimeZones } from '@/constants/airport-timezones'
import { airports } from '@/constants/airports'
import { flightSchedules, type Weekday } from '@/constants/flight-schedule'
import { routes } from '@/constants/routes'
import { routeCode } from '@/lib/flights/routes'
import { getScheduleMonths } from '@/lib/flights/schedule'
import { PrismaClient } from '@/lib/generated/prisma/client'

const databaseUrl = process.env.DATABASE_URL
if (!databaseUrl) {
  throw new Error('DATABASE_URL is not set')
}

const adapter = new PrismaMariaDb(databaseUrl)
const prisma = new PrismaClient({ adapter })

const dayMs = 24 * 60 * 60 * 1000

function timeZoneOffsetMs(timeZone: string, instant: Date): number {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hour12: false,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).formatToParts(instant)

  const field: Record<string, number> = {}
  for (const part of parts) {
    if (part.type !== 'literal') field[part.type] = Number(part.value)
  }

  const asUtc = Date.UTC(
    field.year,
    field.month - 1,
    field.day,
    field.hour % 24,
    field.minute,
    field.second,
  )
  return asUtc - instant.getTime()
}

function zonedWallTimeToUtc(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
  timeZone: string,
): Date {
  const naiveUtc = Date.UTC(year, month - 1, day, hour, minute)
  const firstOffset = timeZoneOffsetMs(timeZone, new Date(naiveUtc))
  let utc = naiveUtc - firstOffset
  const secondOffset = timeZoneOffsetMs(timeZone, new Date(utc))
  if (secondOffset !== firstOffset) utc = naiveUtc - secondOffset
  return new Date(utc)
}

async function seedFlightMaps(airportIdByCode: Map<string, string>): Promise<Map<string, string>> {
  const idByCode = new Map<string, string>()
  for (const route of routes) {
    const originAirportId = airportIdByCode.get(route.originCode)
    const destinationAirportId = airportIdByCode.get(route.destinationCode)
    if (!originAirportId || !destinationAirportId) {
      throw new Error(`Missing airport for route ${route.originCode}-${route.destinationCode}`)
    }
    const code = routeCode(route.originCode, route.destinationCode)
    const flightMap = await prisma.flightMap.upsert({
      where: { code },
      update: { originAirportId, destinationAirportId },
      create: { code, originAirportId, destinationAirportId },
    })
    idByCode.set(code, flightMap.id)
  }

  const codes = routes.map((route) => routeCode(route.originCode, route.destinationCode))
  await prisma.flightMap.deleteMany({ where: { code: { notIn: codes }, flights: { none: {} } } })

  return idByCode
}

async function seedFlights(flightMapIdByCode: Map<string, string>): Promise<number> {
  const scheduleMonths = getScheduleMonths()
  const firstMonth = scheduleMonths[0]
  const lastMonth = scheduleMonths[scheduleMonths.length - 1]
  const startUtc = Date.UTC(Number(firstMonth.slice(0, 4)), Number(firstMonth.slice(5, 7)) - 1, 1)
  const endUtc = Date.UTC(Number(lastMonth.slice(0, 4)), Number(lastMonth.slice(5, 7)), 0)
  let count = 0

  for (const schedule of flightSchedules) {
    const originTimeZone = airportTimeZones[schedule.originCode]
    const destinationTimeZone = airportTimeZones[schedule.destinationCode]
    const flightMapId = flightMapIdByCode.get(
      routeCode(schedule.originCode, schedule.destinationCode),
    )
    if (!originTimeZone || !destinationTimeZone || !flightMapId) {
      throw new Error(`Missing route data for flight ${schedule.flightNumber}`)
    }

    const [departureHour, departureMinute] = schedule.departureLocal.split(':').map(Number)
    const [arrivalHour, arrivalMinute] = schedule.arrivalLocal.split(':').map(Number)

    for (let cursor = startUtc; cursor <= endUtc; cursor += dayMs) {
      const date = new Date(cursor)
      const weekday = date.getUTCDay() as Weekday
      if (schedule.days !== 'daily' && !schedule.days.includes(weekday)) continue

      const departureAt = zonedWallTimeToUtc(
        date.getUTCFullYear(),
        date.getUTCMonth() + 1,
        date.getUTCDate(),
        departureHour,
        departureMinute,
        originTimeZone,
      )

      const arrivalDate = new Date(cursor + schedule.arrivalDayOffset * dayMs)
      const arrivalAt = zonedWallTimeToUtc(
        arrivalDate.getUTCFullYear(),
        arrivalDate.getUTCMonth() + 1,
        arrivalDate.getUTCDate(),
        arrivalHour,
        arrivalMinute,
        destinationTimeZone,
      )

      await prisma.flight.upsert({
        where: { flightNumber_departureAt: { flightNumber: schedule.flightNumber, departureAt } },
        update: {
          flightMapId,
          arrivalAt,
          durationMinutes: schedule.durationMinutes,
          basePrice: schedule.basePrice,
        },
        create: {
          flightNumber: schedule.flightNumber,
          flightMapId,
          departureAt,
          arrivalAt,
          durationMinutes: schedule.durationMinutes,
          basePrice: schedule.basePrice,
        },
      })
      count += 1
    }
  }

  return count
}

async function main() {
  for (const airport of airports) {
    await prisma.airport.upsert({
      where: { code: airport.code },
      update: { name: airport.name, city: airport.city, country: airport.country },
      create: airport,
    })
  }

  const codes = airports.map((airport) => airport.code)
  const removed = await prisma.airport.deleteMany({ where: { code: { notIn: codes } } })

  const stored = await prisma.airport.findMany({ select: { id: true, code: true } })
  const airportIdByCode = new Map(stored.map((airport) => [airport.code, airport.id]))
  const flightMapIdByCode = await seedFlightMaps(airportIdByCode)

  // Drop unbooked flights so re-seeding matches the rolling window; booked ones are kept.
  await prisma.flight.deleteMany({ where: { tickets: { none: {} } } })
  const flightCount = await seedFlights(flightMapIdByCode)

  console.log(
    `Seeded ${airports.length} airports, ${flightMapIdByCode.size} routes, removed ${removed.count} stale, seeded ${flightCount} flights`,
  )
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
