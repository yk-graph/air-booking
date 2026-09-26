import Link from 'next/link'

export function BookingHeader({
  backHref,
  fromCity,
  toCity,
  trip,
}: {
  backHref: string
  fromCity: string
  toCity: string
  trip: 'round' | 'oneway'
}) {
  return (
    <div className="border-b border-gray-200">
      <div className="mx-auto flex max-w-5xl items-center gap-4 px-6 py-4">
        <Link href={backHref} aria-label="Back" className="text-2xl text-gray-700 hover:text-black">
          ←
        </Link>
        <div className="flex items-center gap-4 text-sm">
          <span className="font-semibold text-gray-900">
            {fromCity} → {toCity}
          </span>
          {trip === 'round' && (
            <>
              <span className="text-gray-300">|</span>
              <span className="text-gray-400">
                {toCity} → {fromCity}
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
