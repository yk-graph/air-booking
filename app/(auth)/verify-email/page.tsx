import Link from 'next/link'

import { VerifyResult } from '@/lib/auth/token'

const MESSAGES: Record<VerifyResult, string> = {
  verified: 'Your email address has been verified. Thank you!',
  used: 'This verification link has already been used.',
  expired: 'This verification link has expired. Please request a new one.',
  invalid: 'This verification link is invalid.',
  error: 'Something went wrong. Please try again later.',
}

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  const { status } = await searchParams
  const message = status && status in MESSAGES ? MESSAGES[status as VerifyResult] : MESSAGES.error

  return (
    <div className="flex flex-col items-center gap-4 text-center">
      <h1 className="text-xl font-semibold">Email verification</h1>
      <p className="text-gray-600">{message}</p>
      <Link href="/" className="underline">
        Go to home
      </Link>
    </div>
  )
}
