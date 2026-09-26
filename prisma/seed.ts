import 'dotenv/config'

import { PrismaMariaDb } from '@prisma/adapter-mariadb'

import { airportTimeZones } from '../lib/flights/airport-timezones'
import { PrismaClient } from '../lib/generated/prisma/client'

const databaseUrl = process.env.DATABASE_URL
if (!databaseUrl) {
  throw new Error('DATABASE_URL is not set')
}

const adapter = new PrismaMariaDb(databaseUrl)
const prisma = new PrismaClient({ adapter })

type AirportSeed = {
  code: string
  name: string
  city: string
  country: string
}

const airports: AirportSeed[] = [
  { code: 'NRT', name: 'Narita International Airport', city: 'Tokyo', country: 'Japan' },
  { code: 'ICN', name: 'Incheon International Airport', city: 'Seoul', country: 'South Korea' },
  { code: 'BKK', name: 'Suvarnabhumi Airport', city: 'Bangkok', country: 'Thailand' },
  { code: 'SIN', name: 'Singapore Changi Airport', city: 'Singapore', country: 'Singapore' },
  {
    code: 'KUL',
    name: 'Kuala Lumpur International Airport',
    city: 'Kuala Lumpur',
    country: 'Malaysia',
  },
  {
    code: 'HNL',
    name: 'Daniel K. Inouye International Airport',
    city: 'Honolulu',
    country: 'United States',
  },
  { code: 'YVR', name: 'Vancouver International Airport', city: 'Vancouver', country: 'Canada' },
  {
    code: 'SFO',
    name: 'San Francisco International Airport',
    city: 'San Francisco',
    country: 'United States',
  },
  {
    code: 'LAX',
    name: 'Los Angeles International Airport',
    city: 'Los Angeles',
    country: 'United States',
  },
]

type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6

type FlightSchedule = {
  flightNumber: string
  originCode: string
  destinationCode: string
  departureLocal: string
  arrivalLocal: string
  arrivalDayOffset: number
  durationMinutes: number
  days: Weekday[] | 'daily'
  basePrice: number
}

const flightSchedules: FlightSchedule[] = [
  {
    flightNumber: 'ZG045',
    originCode: 'NRT',
    destinationCode: 'ICN',
    departureLocal: '08:55',
    arrivalLocal: '11:25',
    arrivalDayOffset: 0,
    durationMinutes: 150,
    days: 'daily',
    basePrice: 350,
  },
  {
    flightNumber: 'ZG051',
    originCode: 'NRT',
    destinationCode: 'BKK',
    departureLocal: '17:00',
    arrivalLocal: '22:15',
    arrivalDayOffset: 0,
    durationMinutes: 435,
    days: 'daily',
    basePrice: 700,
  },
  {
    flightNumber: 'ZG053',
    originCode: 'NRT',
    destinationCode: 'SIN',
    departureLocal: '16:50',
    arrivalLocal: '23:00',
    arrivalDayOffset: 0,
    durationMinutes: 430,
    days: 'daily',
    basePrice: 720,
  },
  {
    flightNumber: 'ZG061',
    originCode: 'NRT',
    destinationCode: 'KUL',
    departureLocal: '16:50',
    arrivalLocal: '23:40',
    arrivalDayOffset: 0,
    durationMinutes: 470,
    days: 'daily',
    basePrice: 720,
  },
  {
    flightNumber: 'ZG002',
    originCode: 'NRT',
    destinationCode: 'HNL',
    departureLocal: '19:10',
    arrivalLocal: '07:50',
    arrivalDayOffset: 0,
    durationMinutes: 460,
    days: [0, 2, 5],
    basePrice: 800,
  },
  {
    flightNumber: 'ZG022',
    originCode: 'NRT',
    destinationCode: 'YVR',
    departureLocal: '16:00',
    arrivalLocal: '08:30',
    arrivalDayOffset: 0,
    durationMinutes: 570,
    days: [1, 3, 5, 6],
    basePrice: 900,
  },
  {
    flightNumber: 'ZG026',
    originCode: 'NRT',
    destinationCode: 'SFO',
    departureLocal: '21:25',
    arrivalLocal: '13:35',
    arrivalDayOffset: 0,
    durationMinutes: 550,
    days: 'daily',
    basePrice: 950,
  },
  {
    flightNumber: 'ZG024',
    originCode: 'NRT',
    destinationCode: 'LAX',
    departureLocal: '14:45',
    arrivalLocal: '07:30',
    arrivalDayOffset: 0,
    durationMinutes: 585,
    days: 'daily',
    basePrice: 950,
  },
  {
    flightNumber: 'ZG046',
    originCode: 'ICN',
    destinationCode: 'NRT',
    departureLocal: '12:55',
    arrivalLocal: '15:30',
    arrivalDayOffset: 0,
    durationMinutes: 155,
    days: 'daily',
    basePrice: 350,
  },
  {
    flightNumber: 'ZG052',
    originCode: 'BKK',
    destinationCode: 'NRT',
    departureLocal: '23:10',
    arrivalLocal: '07:30',
    arrivalDayOffset: 1,
    durationMinutes: 380,
    days: 'daily',
    basePrice: 700,
  },
  {
    flightNumber: 'ZG054',
    originCode: 'SIN',
    destinationCode: 'NRT',
    departureLocal: '00:40',
    arrivalLocal: '08:30',
    arrivalDayOffset: 0,
    durationMinutes: 410,
    days: 'daily',
    basePrice: 720,
  },
  {
    flightNumber: 'ZG062',
    originCode: 'KUL',
    destinationCode: 'NRT',
    departureLocal: '01:10',
    arrivalLocal: '09:00',
    arrivalDayOffset: 0,
    durationMinutes: 410,
    days: 'daily',
    basePrice: 720,
  },
  {
    flightNumber: 'ZG001',
    originCode: 'HNL',
    destinationCode: 'NRT',
    departureLocal: '09:10',
    arrivalLocal: '13:15',
    arrivalDayOffset: 1,
    durationMinutes: 545,
    days: [0, 2, 5],
    basePrice: 800,
  },
  {
    flightNumber: 'ZG021',
    originCode: 'YVR',
    destinationCode: 'NRT',
    departureLocal: '10:30',
    arrivalLocal: '12:45',
    arrivalDayOffset: 1,
    durationMinutes: 555,
    days: [1, 3, 5, 6],
    basePrice: 900,
  },
  {
    flightNumber: 'ZG025',
    originCode: 'SFO',
    destinationCode: 'NRT',
    departureLocal: '16:45',
    arrivalLocal: '20:00',
    arrivalDayOffset: 1,
    durationMinutes: 675,
    days: 'daily',
    basePrice: 950,
  },
  {
    flightNumber: 'ZG023',
    originCode: 'LAX',
    destinationCode: 'NRT',
    departureLocal: '10:25',
    arrivalLocal: '14:10',
    arrivalDayOffset: 1,
    durationMinutes: 705,
    days: 'daily',
    basePrice: 950,
  },
]

const scheduleStart = { year: 2026, month: 10, day: 1 }
const scheduleEnd = { year: 2026, month: 12, day: 31 }
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

async function seedFlights(airportIdByCode: Map<string, string>): Promise<number> {
  const startUtc = Date.UTC(scheduleStart.year, scheduleStart.month - 1, scheduleStart.day)
  const endUtc = Date.UTC(scheduleEnd.year, scheduleEnd.month - 1, scheduleEnd.day)
  let count = 0

  for (const schedule of flightSchedules) {
    const originTimeZone = airportTimeZones[schedule.originCode]
    const destinationTimeZone = airportTimeZones[schedule.destinationCode]
    const originAirportId = airportIdByCode.get(schedule.originCode)
    const destinationAirportId = airportIdByCode.get(schedule.destinationCode)
    if (!originTimeZone || !destinationTimeZone || !originAirportId || !destinationAirportId) {
      throw new Error(`Missing airport data for flight ${schedule.flightNumber}`)
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
          originAirportId,
          destinationAirportId,
          arrivalAt,
          durationMinutes: schedule.durationMinutes,
          basePrice: schedule.basePrice,
        },
        create: {
          flightNumber: schedule.flightNumber,
          originAirportId,
          destinationAirportId,
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
  const flightCount = await seedFlights(airportIdByCode)

  console.log(
    `Seeded ${airports.length} airports, removed ${removed.count} stale, seeded ${flightCount} flights`,
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
