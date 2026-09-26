import Link from 'next/link'

import type { DailyFare } from '@/lib/flights/fares'

const weekdays = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

function formatPrice(price: number): string {
  return `C$${price.toLocaleString('en-US')}`
}

export function DateCalendar({
  month,
  fares,
  minDateKey,
  selectHref,
  prevHref,
  nextHref,
}: {
  month: string
  fares: Map<string, DailyFare>
  minDateKey: string
  selectHref: (date: string) => string
  prevHref: string | null
  nextHref: string | null
}) {
  const year = Number(month.slice(0, 4))
  const monthIndex = Number(month.slice(5, 7)) - 1
  const firstWeekday = new Date(Date.UTC(year, monthIndex, 1)).getUTCDay()
  const daysInMonth = new Date(Date.UTC(year, monthIndex + 1, 0)).getUTCDate()
  const monthLabel = new Intl.DateTimeFormat('en-US', { month: 'short', timeZone: 'UTC' }).format(
    Date.UTC(year, monthIndex, 1),
  )

  const cells: (number | null)[] = [
    ...Array.from({ length: firstWeekday }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-3xl font-semibold text-gray-900">{year}</h2>
        <div className="flex items-center gap-2">
          <MonthArrow href={prevHref} label="Previous month">
            ‹
          </MonthArrow>
          <span className="w-16 text-center text-lg font-medium text-gray-700">{monthLabel}.</span>
          <MonthArrow href={nextHref} label="Next month">
            ›
          </MonthArrow>
        </div>
      </div>

      <div className="grid grid-cols-7 border-b border-gray-200 pb-3 text-center text-sm text-gray-500">
        {weekdays.map((day, i) => (
          <div key={i}>{day}</div>
        ))}
      </div>

      <div className="grid grid-cols-7">
        {cells.map((day, i) => {
          if (day === null) return <div key={i} className="h-20" />

          const dateKey = `${month}-${String(day).padStart(2, '0')}`
          const fare = fares.get(dateKey)
          const isDisabled = dateKey < minDateKey

          if (fare && !isDisabled) {
            return (
              <Link
                key={i}
                href={selectHref(dateKey)}
                className="flex h-20 flex-col items-center justify-center gap-1 rounded hover:bg-emerald-50"
              >
                <span className="text-lg text-gray-900">{day}</span>
                <span className="text-xs font-medium text-emerald-700">
                  {formatPrice(fare.price)}
                </span>
              </Link>
            )
          }

          return (
            <div key={i} className="flex h-20 items-center justify-center">
              <span className={isDisabled ? 'text-gray-300 line-through' : 'text-gray-300'}>
                {day}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function MonthArrow({
  href,
  label,
  children,
}: {
  href: string | null
  label: string
  children: React.ReactNode
}) {
  if (!href) {
    return (
      <span className="flex h-8 w-8 items-center justify-center rounded-full text-gray-300">
        {children}
      </span>
    )
  }
  return (
    <Link
      href={href}
      aria-label={label}
      className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-300 text-gray-600 hover:bg-gray-50"
    >
      {children}
    </Link>
  )
}
