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
  depart?: string
  month?: string
}

export default async function ReturnPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const params = await searchParams
  const from = params.from
  const to = params.to
  const depart = params.depart
  if (!from || !to || !depart) redirect('/')
  if (params.trip === 'oneway') {
    redirect(`/booking/passenger?${new URLSearchParams({ from, to, trip: 'oneway', depart })}`)
  }

  const cabin: CabinClass = params.cabin === 'BUSINESS' ? CabinClass.BUSINESS : CabinClass.ECONOMY
  const departMonth = depart.slice(0, 7)
  const month = scheduleMonths.includes(params.month ?? '')
    ? params.month!
    : scheduleMonths.includes(departMonth)
      ? departMonth
      : scheduleMonths[0]

  const airports = await prisma.airport.findMany({
    where: { code: { in: [from, to] } },
    select: { code: true, city: true },
  })
  const fromAirport = airports.find((airport) => airport.code === from)
  const toAirport = airports.find((airport) => airport.code === to)
  if (!fromAirport || !toAirport) redirect('/')

  // Return leg flies the reversed route (to -> from).
  const fares = await getMonthlyFares(to, from, month, cabin)
  const todayKey = zonedDateKey(new Date(), airportTimeZones[to] ?? 'UTC')
  const minDateKey = depart > todayKey ? depart : todayKey

  const base = { from, to, trip: 'round', cabin, depart }
  const monthIndex = scheduleMonths.indexOf(month)
  const prevMonth = monthIndex > 0 ? scheduleMonths[monthIndex - 1] : null
  const nextMonth = monthIndex < scheduleMonths.length - 1 ? scheduleMonths[monthIndex + 1] : null

  const buildHref = (path: string, extra: Record<string, string>) =>
    `${path}?${new URLSearchParams({ ...base, ...extra }).toString()}`

  const monthHref = (target: string) => buildHref('/booking/return', { month: target })
  const cabinHref = (target: CabinClass) => buildHref('/booking/return', { cabin: target, month })
  const outboundHref = buildHref('/booking/outbound', { month: departMonth })
  const selectHref = (date: string) => buildHref('/booking/passenger', { returnDate: date })

  return (
    <div className="min-h-screen bg-white">
      <BookingHeader
        backHref={outboundHref}
        fromCity={fromAirport.city}
        toCity={toAirport.city}
        trip="round"
        activeLeg="return"
        outboundDate={depart}
      />

      <main className="mx-auto max-w-5xl px-6 py-10">
        <div className="mb-6 flex items-center justify-end">
          <CabinToggle cabin={cabin} hrefFor={cabinHref} />
        </div>

        <DateCalendar
          month={month}
          fares={fares}
          minDateKey={minDateKey}
          selectHref={selectHref}
          prevHref={prevMonth ? monthHref(prevMonth) : null}
          nextHref={nextMonth ? monthHref(nextMonth) : null}
        />
      </main>
    </div>
  )
}
