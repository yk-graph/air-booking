import 'server-only'

import { cookies } from 'next/headers'
import { createHash, randomBytes } from 'node:crypto'

import { Account } from '@/lib/generated/prisma/client'
import { prisma } from '@/lib/prisma'

const SESSION_COOKIE = 'session'
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7 // 7 days

function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex')
}

export async function createSession(
  accountId: string,
  meta?: { userAgent?: string | null; ipAddress?: string | null },
): Promise<void> {
  const token = randomBytes(32).toString('hex')
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS)

  await prisma.session.create({
    data: {
      accountId,
      hashedToken: hashToken(token),
      expiresAt,
      userAgent: meta?.userAgent ?? null,
      ipAddress: meta?.ipAddress ?? null,
    },
  })

  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    expires: expiresAt,
  })
}

export type CurrentAccount = Pick<Account, 'id' | 'email' | 'role' | 'emailVerifiedAt'>

export async function getCurrentAccount(): Promise<CurrentAccount | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get(SESSION_COOKIE)?.value
  if (!token) return null

  const session = await prisma.session.findUnique({
    where: { hashedToken: hashToken(token) },
    select: {
      expiresAt: true,
      account: {
        select: {
          id: true,
          email: true,
          role: true,
          emailVerifiedAt: true,
        },
      },
    },
  })

  if (!session || session.expiresAt < new Date()) return null
  return session.account
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies()
  const token = cookieStore.get(SESSION_COOKIE)?.value

  if (token) {
    await prisma.session.deleteMany({ where: { hashedToken: hashToken(token) } })
    cookieStore.delete(SESSION_COOKIE)
  }
}
