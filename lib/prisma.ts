import { PrismaMariaDb } from '@prisma/adapter-mariadb'
import { PrismaClient } from '@/lib/generated/prisma/client'

// DATABASE_URL is required at runtime. The only exception is the production
// build phase, where no database exists (and must not be contacted).
const isBuildPhase = process.env.NEXT_PHASE === 'phase-production-build'
const databaseUrl = process.env.DATABASE_URL

if (!databaseUrl && !isBuildPhase) {
  throw new Error('DATABASE_URL is not set')
}

const adapter = new PrismaMariaDb(databaseUrl ?? 'mysql://build:build@localhost:3306/build')

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter })

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}
