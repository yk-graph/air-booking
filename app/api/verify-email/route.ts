import { NextRequest, NextResponse } from 'next/server'

import { verifyEmail, VerifyResult } from '@/lib/auth/token'

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token')
  if (!token) {
    return NextResponse.redirect(new URL('/verify-email?status=invalid', request.url))
  }

  let status: VerifyResult
  try {
    status = await verifyEmail(token)
  } catch (error) {
    console.error('email verification failed', error)
    status = 'error'
  }

  return NextResponse.redirect(new URL(`/verify-email?status=${status}`, request.url))
}
