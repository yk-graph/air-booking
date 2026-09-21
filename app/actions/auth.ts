'use server'

import { redirect } from 'next/navigation'
import * as z from 'zod'

import { hashPassword, verifyPassword } from '@/lib/auth/password'
import { createSession, destroySession } from '@/lib/auth/session'
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
