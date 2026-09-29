import { ArrowRight } from 'lucide-react'
import { redirect } from 'next/navigation'

import { BookingHeader } from '@/components/booking/booking-header'
import { SeatGrid } from '@/components/booking/seat-grid'
import { Icon } from '@/components/ui/icon'
import { airports } from '@/constants/airports'
import { cabinAddPrice } from '@/constants/cabin'
import { getFlightForDate } from '@/lib/flights/flights'
import { getFlightSeatMap } from '@/lib/flights/seats'
import { CabinClass } from '@/lib/generated/prisma/enums'

type SearchParams = {
  from?: string
  to?: string
  cabinOut?: string
  cabinRet?: string
  depart?: string
  returnDate?: string
  seatOut?: string
}

function parseCabin(value: string | undefined): CabinClass {
  return value === 'BUSINESS' ? CabinClass.BUSINESS : CabinClass.ECONOMY
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

  const cabinOut = parseCabin(params.cabinOut)
  const cabinRet = parseCabin(params.cabinRet)

  const fromAirport = airports.find((airport) => airport.code === from)
  const toAirport = airports.find((airport) => airport.code === to)
  if (!fromAirport || !toAirport) redirect('/')

  // Return leg flies the reversed route (to -> from).
  const outboundFlight = await getFlightForDate(from, to, depart)
  const returnFlight = await getFlightForDate(to, from, returnDate)
  if (!outboundFlight || !returnFlight) redirect('/')

  const seats = (await getFlightSeatMap(returnFlight.id)).filter(
    (seat) => seat.cabinClass === cabinRet,
  )

  const total =
    outboundFlight.basePrice +
    cabinAddPrice[cabinOut] +
    returnFlight.basePrice +
    cabinAddPrice[cabinRet]

  const base = { from, to, trip: 'round', cabinOut, cabinRet, depart, returnDate, seatOut }
  const hrefFor = (seatCode: string) =>
    `/booking/passenger?${new URLSearchParams({ ...base, seatRet: seatCode }).toString()}`
  const dateQuery = new URLSearchParams({
    from,
    to,
    trip: 'round',
    cabinOut,
    cabinRet,
    depart,
    returnDate,
  }).toString()
  const backHref = `/booking/seats/outbound?${dateQuery}`
  const outboundHref = `/booking/outbound?${dateQuery}`
  const returnHref = `/booking/return?${dateQuery}`

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
        outboundHref={outboundHref}
        returnHref={returnHref}
      />

      <main className="mx-auto max-w-5xl px-6 py-10">
        <h1 className="mb-1 flex items-center gap-2 text-2xl font-semibold">
          Select your seat — {toAirport.city}
          <Icon icon={ArrowRight} size={18} />
          {fromAirport.city}
        </h1>
        <p className="mb-8 text-sm text-gray-500">
          {cabinRet === CabinClass.BUSINESS ? 'Business' : 'Economy'} cabin
        </p>
        <SeatGrid seats={seats} hrefFor={hrefFor} />
      </main>
    </div>
  )
}
