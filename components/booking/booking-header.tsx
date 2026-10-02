import { ArrowLeft, ArrowRight } from 'lucide-react'
import Link from 'next/link'

import { Icon } from '@/components/ui/icon'

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
  outboundHref,
  returnHref,
  highlightActive = true,
}: {
  backHref: string
  fromCity: string
  toCity: string
  trip: 'round' | 'oneway'
  activeLeg: 'outbound' | 'return'
  outboundDate?: string
  returnDate?: string
  totalLabel?: string
  outboundHref?: string
  returnHref?: string
  highlightActive?: boolean
}) {
  return (
    <div className="border-b border-gray-200">
      <div className="mx-auto flex max-w-5xl items-center gap-4 px-6 py-4">
        <Link href={backHref} aria-label="Back" className="text-gray-700 hover:text-black">
          <Icon icon={ArrowLeft} />
        </Link>

        <Leg
          from={fromCity}
          to={toCity}
          date={outboundDate}
          active={highlightActive ? activeLeg === 'outbound' : true}
          showUnderline={highlightActive}
          href={outboundHref}
        />

        {trip === 'round' && (
          <>
            <span className="text-gray-300">|</span>
            <Leg
              from={toCity}
              to={fromCity}
              date={returnDate}
              active={highlightActive ? activeLeg === 'return' : true}
              showUnderline={highlightActive}
              href={returnHref}
            />
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
  showUnderline = true,
  href,
}: {
  from: string
  to: string
  date?: string
  active: boolean
  showUnderline?: boolean
  href?: string
}) {
  const content = (
    <div className={active && showUnderline ? 'border-b-2 border-brand-600 pb-1' : 'pb-1'}>
      <div
        className={`flex items-center gap-1 text-sm font-semibold ${active ? 'text-gray-900' : 'text-gray-400'}`}
      >
        {from}
        <Icon icon={ArrowRight} size={14} />
        {to}
      </div>
      <div className="text-xs text-gray-500">{formatDate(date)}</div>
    </div>
  )

  if (href) {
    return (
      <Link href={href} className="hover:opacity-80">
        {content}
      </Link>
    )
  }
  return content
}
