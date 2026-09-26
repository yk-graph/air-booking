import Link from 'next/link'

function formatDate(date: string | undefined): string {
  if (!date) return '-'
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(`${date}T00:00:00Z`))
}

export function BookingHeader({
  backHref,
  fromCity,
  toCity,
  trip,
  activeLeg,
  outboundDate,
  returnDate,
  totalLabel,
}: {
  backHref: string
  fromCity: string
  toCity: string
  trip: 'round' | 'oneway'
  activeLeg: 'outbound' | 'return'
  outboundDate?: string
  returnDate?: string
  totalLabel?: string
}) {
  return (
    <div className="border-b border-gray-200">
      <div className="mx-auto flex max-w-5xl items-center gap-4 px-6 py-4">
        <Link href={backHref} aria-label="Back" className="text-2xl text-gray-700 hover:text-black">
          ←
        </Link>

        <Leg from={fromCity} to={toCity} date={outboundDate} active={activeLeg === 'outbound'} />

        {trip === 'round' && (
          <>
            <span className="text-gray-300">|</span>
            <Leg from={toCity} to={fromCity} date={returnDate} active={activeLeg === 'return'} />
          </>
        )}

        {totalLabel && (
          <span className="ml-auto text-xl font-semibold text-gray-900">{totalLabel}</span>
        )}
      </div>
    </div>
  )
}

function Leg({
  from,
  to,
  date,
  active,
}: {
  from: string
  to: string
  date?: string
  active: boolean
}) {
  return (
    <div className={active ? 'border-b-2 border-emerald-600 pb-1' : 'pb-1'}>
      <div className={`text-sm font-semibold ${active ? 'text-gray-900' : 'text-gray-400'}`}>
        {from} → {to}
      </div>
      <div className="text-xs text-gray-500">{formatDate(date)}</div>
    </div>
  )
}
