import Link from 'next/link'

export function BookingTopBar() {
  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex h-14 max-w-5xl items-center px-6">
        <Link href="/" className="text-lg font-semibold tracking-widest text-gray-900">
          AIR BOOKING
        </Link>
      </div>
    </header>
  )
}
