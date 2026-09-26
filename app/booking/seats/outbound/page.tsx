import { redirect } from 'next/navigation'

import { BookingHeader } from '@/components/booking/booking-header'
import { SeatGrid } from '@/components/booking/seat-grid'
import { cabinAddPrice } from '@/lib/flights/seat-map'
import { getFlightForDate } from '@/lib/flights/flights'
import { getFlightSeatMap } from '@/lib/flights/seats'
import { CabinClass } from '@/lib/generated/prisma/enums'
import { prisma } from '@/lib/prisma'

type SearchParams = {
  from?: string
  to?: string
  trip?: string
  cabin?: string
  depart?: string
  returnDate?: string
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
  const cabin: CabinClass = params.cabin === 'BUSINESS' ? CabinClass.BUSINESS : CabinClass.ECONOMY
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
    (seat) => seat.cabinClass === cabin,
  )

  const add = cabinAddPrice[cabin]
  let total = outboundFlight.basePrice + add
  if (trip === 'round' && returnDate) {
    const returnFlight = await getFlightForDate(to, from, returnDate)
    if (returnFlight) total += returnFlight.basePrice + add
  }

  const base: Record<string, string> = { from, to, trip, cabin, depart }
  if (returnDate) base.returnDate = returnDate

  const nextStep = trip === 'round' ? '/booking/seats/return' : '/booking/passenger'
  const hrefFor = (seatCode: string) =>
    `${nextStep}?${new URLSearchParams({ ...base, seatOut: seatCode }).toString()}`

  const backHref = `/booking/${trip === 'round' ? 'return' : 'outbound'}?${new URLSearchParams(base).toString()}`

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
      />

      <main className="mx-auto max-w-5xl px-6 py-10">
        <h1 className="mb-1 text-2xl font-semibold">
          Select your seat — {fromAirport.city} → {toAirport.city}
        </h1>
        <p className="mb-8 text-sm text-gray-500">
          {cabin === CabinClass.BUSINESS ? 'Business' : 'Economy'} cabin
        </p>
        <SeatGrid seats={seats} hrefFor={hrefFor} />
      </main>
    </div>
  )
}
