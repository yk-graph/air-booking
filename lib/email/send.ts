import 'server-only'

import { createEmailVerificationToken, createPasswordResetToken } from '@/lib/auth/token'
import { EMAIL_FROM, resend } from '@/lib/email/resend'

const APP_URL = process.env.APP_URL ?? 'http://localhost:3000'

export async function sendAccountVerification(accountId: string, email: string): Promise<void> {
  const token = await createEmailVerificationToken(accountId)
  const verifyUrl = `${APP_URL}/verify-email?token=${token}`
  await sendVerificationEmail(email, verifyUrl)
}

export async function sendVerificationEmail(to: string, verifyUrl: string): Promise<void> {
  const { error } = await resend.emails.send({
    from: EMAIL_FROM,
    to,
    subject: 'Verify your email address',
    html: `
      <p>Thanks for signing up. Please verify your email address to activate your account.</p>
      <p><a href="${verifyUrl}">Verify email</a></p>
      <p>This link expires in 24 hours. If you did not create an account, you can ignore this email.</p>
    `,
  })

  if (error) {
    throw new Error(`Failed to send verification email: ${error.message}`)
  }
}

export async function sendPasswordResetEmail(accountId: string, email: string): Promise<void> {
  const token = await createPasswordResetToken(accountId)
  const resetUrl = `${APP_URL}/reset-password?token=${token}`

  const { error } = await resend.emails.send({
    from: EMAIL_FROM,
    to: email,
    subject: 'Reset your password',
    html: `
      <p>We received a request to reset your password.</p>
      <p><a href="${resetUrl}">Reset password</a></p>
      <p>This link expires in 1 hour. If you did not request this, you can ignore this email.</p>
    `,
  })

  if (error) {
    throw new Error(`Failed to send password reset email: ${error.message}`)
  }
}
