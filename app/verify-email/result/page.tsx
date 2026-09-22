import Link from 'next/link'

import { VerifyResult } from '@/lib/auth/token'

const MESSAGES: Record<VerifyResult, string> = {
  verified: 'Your email address has been verified. Thank you!',
  used: 'This verification link has already been used.',
  expired: 'This verification link has expired. Please request a new one.',
  invalid: 'This verification link is invalid.',
  error: 'Something went wrong. Please try again later.',
}

export default async function VerifyEmailResultPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  const { status } = await searchParams
  const message = status && status in MESSAGES ? MESSAGES[status as VerifyResult] : MESSAGES.error

  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col items-center justify-center gap-4 px-6 text-center">
      <h1 className="text-xl font-semibold">Email verification</h1>
      <p className="text-gray-600">{message}</p>
      <Link href="/" className="underline">
        Go to home
      </Link>
    </main>
  )
}
