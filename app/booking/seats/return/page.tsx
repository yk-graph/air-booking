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
  cabin?: string
  depart?: string
  returnDate?: string
  seatOut?: string
}

export default async function ReturnSeatsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const params = await searchParams
  const from = params.from
  const to = params.to
  const depart = params.depart
  const returnDate = params.returnDate
  const seatOut = params.seatOut
  if (!from || !to || !depart || !returnDate || !seatOut) redirect('/')

  const cabin: CabinClass = params.cabin === 'BUSINESS' ? CabinClass.BUSINESS : CabinClass.ECONOMY

  const airports = await prisma.airport.findMany({
    where: { code: { in: [from, to] } },
    select: { code: true, city: true },
  })
  const fromAirport = airports.find((airport) => airport.code === from)
  const toAirport = airports.find((airport) => airport.code === to)
  if (!fromAirport || !toAirport) redirect('/')

  // Return leg flies the reversed route (to -> from).
  const outboundFlight = await getFlightForDate(from, to, depart)
  const returnFlight = await getFlightForDate(to, from, returnDate)
  if (!outboundFlight || !returnFlight) redirect('/')

  const seats = (await getFlightSeatMap(returnFlight.id)).filter(
    (seat) => seat.cabinClass === cabin,
  )

  const add = cabinAddPrice[cabin]
  const total = outboundFlight.basePrice + returnFlight.basePrice + add * 2

  const base = { from, to, trip: 'round', cabin, depart, returnDate, seatOut }
  const hrefFor = (seatCode: string) =>
    `/booking/passenger?${new URLSearchParams({ ...base, seatRet: seatCode }).toString()}`
  const backHref = `/booking/seats/outbound?${new URLSearchParams({ from, to, trip: 'round', cabin, depart, returnDate }).toString()}`

  return (
    <div className="min-h-screen bg-white">
      <BookingHeader
        backHref={backHref}
        fromCity={fromAirport.city}
        toCity={toAirport.city}
        trip="round"
        activeLeg="return"
        outboundDate={depart}
        returnDate={returnDate}
        totalLabel={`C$${total.toLocaleString('en-US')}`}
      />

      <main className="mx-auto max-w-5xl px-6 py-10">
        <h1 className="mb-1 text-2xl font-semibold">
          Select your seat — {toAirport.city} → {fromAirport.city}
        </h1>
        <p className="mb-8 text-sm text-gray-500">
          {cabin === CabinClass.BUSINESS ? 'Business' : 'Economy'} cabin
        </p>
        <SeatGrid seats={seats} hrefFor={hrefFor} />
      </main>
    </div>
  )
}
