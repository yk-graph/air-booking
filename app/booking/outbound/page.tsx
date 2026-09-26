import { redirect } from 'next/navigation'

import { BookingHeader } from '@/components/booking/booking-header'
import { CabinToggle } from '@/components/booking/cabin-toggle'
import { DateCalendar } from '@/components/booking/date-calendar'
import { airportTimeZones, zonedDateKey } from '@/lib/flights/airport-timezones'
import { getMonthlyFares, scheduleMonths } from '@/lib/flights/fares'
import { CabinClass } from '@/lib/generated/prisma/enums'
import { prisma } from '@/lib/prisma'

type SearchParams = {
  from?: string
  to?: string
  trip?: string
  cabin?: string
  month?: string
}

export default async function OutboundPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const params = await searchParams
  const from = params.from
  const to = params.to
  if (!from || !to) redirect('/')

  const trip = params.trip === 'oneway' ? 'oneway' : 'round'
  const cabin: CabinClass = params.cabin === 'BUSINESS' ? CabinClass.BUSINESS : CabinClass.ECONOMY
  const month = scheduleMonths.includes(params.month ?? '') ? params.month! : scheduleMonths[0]

  const airports = await prisma.airport.findMany({
    where: { code: { in: [from, to] } },
    select: { code: true, city: true },
  })
  const fromAirport = airports.find((airport) => airport.code === from)
  const toAirport = airports.find((airport) => airport.code === to)
  if (!fromAirport || !toAirport) redirect('/')

  const fares = await getMonthlyFares(from, to, month, cabin)
  const todayKey = zonedDateKey(new Date(), airportTimeZones[from] ?? 'UTC')

  const base = { from, to, trip }
  const monthIndex = scheduleMonths.indexOf(month)
  const prevMonth = monthIndex > 0 ? scheduleMonths[monthIndex - 1] : null
  const nextMonth = monthIndex < scheduleMonths.length - 1 ? scheduleMonths[monthIndex + 1] : null

  const buildHref = (path: string, extra: Record<string, string>) =>
    `${path}?${new URLSearchParams({ ...base, ...extra }).toString()}`

  const monthHref = (target: string) => buildHref('/booking/outbound', { cabin, month: target })
  const cabinHref = (target: CabinClass) => buildHref('/booking/outbound', { cabin: target, month })
  const nextStep = trip === 'round' ? '/booking/return' : '/booking/passenger'
  const selectHref = (date: string) => buildHref(nextStep, { cabin, depart: date })

  return (
    <div className="min-h-screen bg-white">
      <BookingHeader backHref="/" fromCity={fromAirport.city} toCity={toAirport.city} trip={trip} />

      <main className="mx-auto max-w-5xl px-6 py-10">
        <div className="mb-6 flex items-center justify-end">
          <CabinToggle cabin={cabin} hrefFor={cabinHref} />
        </div>

        <DateCalendar
          month={month}
          fares={fares}
          todayKey={todayKey}
          selectHref={selectHref}
          prevHref={prevMonth ? monthHref(prevMonth) : null}
          nextHref={nextMonth ? monthHref(nextMonth) : null}
        />
      </main>
    </div>
  )
}
