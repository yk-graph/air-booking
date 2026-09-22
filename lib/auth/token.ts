import 'server-only'

import { createHash, randomBytes } from 'node:crypto'

import { prisma } from '@/lib/prisma'
import { TokenType } from '@/lib/generated/prisma/enums'

const EMAIL_VERIFICATION_TTL_MS = 1000 * 60 * 60 * 24 // 24 hours
const PASSWORD_RESET_TTL_MS = 1000 * 60 * 60 // 1 hour

function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex')
}

export async function createEmailVerificationToken(accountId: string): Promise<string> {
  const token = randomBytes(32).toString('hex')

  await prisma.token.create({
    data: {
      accountId,
      type: TokenType.EMAIL_VERIFICATION,
      hashedToken: hashToken(token),
      expiresAt: new Date(Date.now() + EMAIL_VERIFICATION_TTL_MS),
    },
  })

  return token
}

export type VerifyResult = 'verified' | 'invalid' | 'expired' | 'used' | 'error'

export async function verifyEmail(token: string): Promise<VerifyResult> {
  const record = await prisma.token.findUnique({
    where: { hashedToken: hashToken(token) },
  })

  if (!record || record.type !== TokenType.EMAIL_VERIFICATION) return 'invalid'
  if (record.usedAt) return 'used'
  if (record.expiresAt < new Date()) return 'expired'

  await prisma.$transaction([
    prisma.account.update({
      where: { id: record.accountId },
      data: { emailVerifiedAt: new Date() },
    }),
    prisma.token.update({
      where: { id: record.id },
      data: { usedAt: new Date() },
    }),
  ])

  return 'verified'
}

export async function createPasswordResetToken(accountId: string): Promise<string> {
  const token = randomBytes(32).toString('hex')

  await prisma.token.create({
    data: {
      accountId,
      type: TokenType.PASSWORD_RESET,
      hashedToken: hashToken(token),
      expiresAt: new Date(Date.now() + PASSWORD_RESET_TTL_MS),
    },
  })

  return token
}

export type PasswordResetState = 'valid' | 'invalid' | 'expired' | 'used'

export async function checkPasswordResetToken(token: string): Promise<PasswordResetState> {
  const record = await prisma.token.findUnique({
    where: { hashedToken: hashToken(token) },
  })

  if (!record || record.type !== TokenType.PASSWORD_RESET) return 'invalid'
  if (record.usedAt) return 'used'
  if (record.expiresAt < new Date()) return 'expired'

  return 'valid'
}

export async function resetPassword(
  token: string,
  passwordHash: string,
): Promise<PasswordResetState> {
  const record = await prisma.token.findUnique({
    where: { hashedToken: hashToken(token) },
  })

  if (!record || record.type !== TokenType.PASSWORD_RESET) return 'invalid'
  if (record.usedAt) return 'used'
  if (record.expiresAt < new Date()) return 'expired'

  await prisma.$transaction([
    prisma.account.update({
      where: { id: record.accountId },
      data: { passwordHash },
    }),
    prisma.token.update({
      where: { id: record.id },
      data: { usedAt: new Date() },
    }),
    prisma.session.deleteMany({
      where: { accountId: record.accountId },
    }),
  ])

  return 'valid'
}
