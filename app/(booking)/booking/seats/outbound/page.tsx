import { ArrowRight } from 'lucide-react'
import { redirect } from 'next/navigation'

import { BookingHeader } from '@/components/booking/booking-header'
import { SeatGrid } from '@/components/booking/seat-grid'
import { Icon } from '@/components/ui/icon'
import { cabinAddPrice } from '@/constants/cabin'
import { getFlightForDate } from '@/lib/flights/flights'
import { getFlightSeatMap } from '@/lib/flights/seats'
import { CabinClass } from '@/lib/generated/prisma/enums'
import { prisma } from '@/lib/prisma'

type SearchParams = {
  from?: string
  to?: string
  trip?: string
  cabinOut?: string
  cabinRet?: string
  depart?: string
  returnDate?: string
}

function parseCabin(value: string | undefined): CabinClass {
  return value === 'BUSINESS' ? CabinClass.BUSINESS : CabinClass.ECONOMY
}

export default async function OutboundSeatsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const params = await searchParams
  const from = params.from
  const to = params.to
  const depart = params.depart
  if (!from || !to || !depart) redirect('/')

  const trip = params.trip === 'oneway' ? 'oneway' : 'round'
  const cabinOut = parseCabin(params.cabinOut)
  const cabinRet = parseCabin(params.cabinRet)
  const returnDate = params.returnDate

  const airports = await prisma.airport.findMany({
    where: { code: { in: [from, to] } },
    select: { code: true, city: true },
  })
  const fromAirport = airports.find((airport) => airport.code === from)
  const toAirport = airports.find((airport) => airport.code === to)
  if (!fromAirport || !toAirport) redirect('/')

  const outboundFlight = await getFlightForDate(from, to, depart)
  if (!outboundFlight) redirect('/')

  const seats = (await getFlightSeatMap(outboundFlight.id)).filter(
    (seat) => seat.cabinClass === cabinOut,
  )

  let total = outboundFlight.basePrice + cabinAddPrice[cabinOut]
  if (trip === 'round' && returnDate) {
    const returnFlight = await getFlightForDate(to, from, returnDate)
    if (returnFlight) total += returnFlight.basePrice + cabinAddPrice[cabinRet]
  }

  const base: Record<string, string> = { from, to, trip, cabinOut, depart }
  if (trip === 'round') base.cabinRet = cabinRet
  if (returnDate) base.returnDate = returnDate

  const nextStep = trip === 'round' ? '/booking/seats/return' : '/booking/passenger'
  const hrefFor = (seatCode: string) =>
    `${nextStep}?${new URLSearchParams({ ...base, seatOut: seatCode }).toString()}`

  const query = new URLSearchParams(base).toString()
  const backHref = `/booking/${trip === 'round' ? 'return' : 'outbound'}?${query}`
  const outboundHref = `/booking/outbound?${query}`
  const returnHref = trip === 'round' ? `/booking/return?${query}` : undefined

  return (
    <div className="min-h-screen bg-white">
      <BookingHeader
        backHref={backHref}
        fromCity={fromAirport.city}
        toCity={toAirport.city}
        trip={trip}
        activeLeg="outbound"
        outboundDate={depart}
        returnDate={returnDate}
        totalLabel={`C$${total.toLocaleString('en-US')}`}
        outboundHref={outboundHref}
        returnHref={returnHref}
      />

      <main className="mx-auto max-w-5xl px-6 py-10">
        <h1 className="mb-1 flex items-center gap-2 text-2xl font-semibold">
          Select your seat — {fromAirport.city}
          <Icon icon={ArrowRight} size={18} />
          {toAirport.city}
        </h1>
        <p className="mb-8 text-sm text-gray-500">
          {cabinOut === CabinClass.BUSINESS ? 'Business' : 'Economy'} cabin
        </p>
        <SeatGrid seats={seats} hrefFor={hrefFor} />
      </main>
    </div>
  )
}
