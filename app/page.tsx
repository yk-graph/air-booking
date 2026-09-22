import Link from 'next/link'

import { logout } from '@/app/actions/auth'
import { VerificationBanner } from '@/app/verification-banner'
import { getCurrentAccount } from '@/lib/auth/session'

export default async function HomePage() {
  const account = await getCurrentAccount()

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col items-center justify-center gap-4 px-6 text-center">
      <h1 className="text-3xl font-bold">Air Flight Booking</h1>

      {account ? (
        <div className="flex flex-col items-center gap-2">
          <p className="text-gray-600">Signed in as {account.email}</p>
          {!account.emailVerifiedAt && <VerificationBanner />}
          <form action={logout}>
            <button type="submit" className="underline">
              Log out
            </button>
          </form>
        </div>
      ) : (
        <div className="flex gap-4">
          <Link href="/login" className="underline">
            Log in
          </Link>
          <Link href="/register" className="underline">
            Sign up
          </Link>
        </div>
      )}
    </main>
  )
}
