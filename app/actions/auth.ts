'use server'

import { redirect } from 'next/navigation'
import * as z from 'zod'

import { hashPassword, verifyPassword } from '@/lib/auth/password'
import { createSession, destroySession, getCurrentAccount } from '@/lib/auth/session'
import { sendAccountVerification } from '@/lib/email/send'
import { prisma } from '@/lib/prisma'
import { loginSchema, registerSchema, type AuthFormState } from '@/lib/validations/auth'

export async function signup(_state: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const parsed = registerSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  })

  if (!parsed.success) {
    return { errors: z.flattenError(parsed.error).fieldErrors }
  }

  const { email, password } = parsed.data

  try {
    const existing = await prisma.account.findUnique({ where: { email } })
    if (existing) {
      return { message: 'This email address is already registered.' }
    }

    const account = await prisma.account.create({
      data: { email, passwordHash: await hashPassword(password) },
    })

    await createSession(account.id)

    // Email delivery failure must not block signup; user can resend later.
    try {
      await sendAccountVerification(account.id, account.email)
    } catch (error) {
      console.error('verification email failed', error)
    }
  } catch (error) {
    console.error('signup failed', error)
    return { message: 'Something went wrong. Please try again.' }
  }

  redirect('/')
}

export async function login(_state: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const parsed = loginSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  })

  if (!parsed.success) {
    return { errors: z.flattenError(parsed.error).fieldErrors }
  }

  const { email, password } = parsed.data

  try {
    const account = await prisma.account.findUnique({ where: { email } })
    const passwordOk = account ? await verifyPassword(password, account.passwordHash) : false

    if (!account || !passwordOk) {
      return { message: 'Incorrect email address or password.' }
    }

    await createSession(account.id)
  } catch (error) {
    console.error('login failed', error)
    return { message: 'Something went wrong. Please try again.' }
  }

  redirect('/')
}

export async function logout(): Promise<void> {
  await destroySession()
  redirect('/login')
}

export async function resendVerification(): Promise<AuthFormState> {
  const account = await getCurrentAccount()
  if (!account) {
    return { message: 'You must be logged in to resend the email.' }
  }
  if (account.emailVerifiedAt) {
    return { message: 'Your email address is already verified.' }
  }

  try {
    await sendAccountVerification(account.id, account.email)
  } catch (error) {
    console.error('resend verification failed', error)
    return { message: 'Something went wrong. Please try again.' }
  }

  return { message: 'Verification email sent. Please check your inbox.' }
}
