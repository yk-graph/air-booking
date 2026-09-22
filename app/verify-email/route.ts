import { NextRequest, NextResponse } from 'next/server'

import { consumeEmailVerificationToken } from '@/lib/auth/token'

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token')
  if (!token) {
    return NextResponse.redirect(new URL('/verify-email/result?status=invalid', request.url))
  }

  let status: string
  try {
    status = await consumeEmailVerificationToken(token)
  } catch (error) {
    console.error('email verification failed', error)
    status = 'error'
  }

  return NextResponse.redirect(new URL(`/verify-email/result?status=${status}`, request.url))
}
