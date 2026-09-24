import 'dotenv/config'

import { PrismaMariaDb } from '@prisma/adapter-mariadb'

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
  { code: 'TPE', name: 'Taoyuan International Airport', city: 'Taipei', country: 'Taiwan' },
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

  console.log(`Seeded ${airports.length} airports, removed ${removed.count} stale`)
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
