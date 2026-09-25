import Link from 'next/link'

import { logout } from '@/app/actions/auth'
import type { CurrentAccount } from '@/lib/auth/session'

export function SiteHeader({ account }: { account: CurrentAccount | null }) {
  return (
    <header className="sticky top-0 z-30 border-b border-gray-200 bg-white">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-6 px-6">
        <Link href="/" className="text-xl font-semibold tracking-widest text-gray-900">
          AIR BOOKING
        </Link>

        <nav className="hidden items-center gap-6 text-sm text-gray-700 md:flex">
          <Link href="/login" className="hover:text-emerald-700">
            Manage Booking
          </Link>
          <span className="text-gray-300">|</span>
          <span className="cursor-default">CAD (C$)</span>
          <span className="cursor-default">English</span>
        </nav>

        {account ? (
          <div className="flex items-center gap-3 text-sm">
            <span className="hidden text-gray-600 sm:inline">{account.email}</span>
            <form action={logout}>
              <button
                type="submit"
                className="rounded bg-emerald-700 px-4 py-2 font-medium text-white hover:bg-emerald-800"
              >
                Log out
              </button>
            </form>
          </div>
        ) : (
          <Link
            href="/login"
            className="rounded bg-emerald-700 px-5 py-2 text-sm font-medium text-white hover:bg-emerald-800"
          >
            Login
          </Link>
        )}
      </div>
    </header>
  )
}
