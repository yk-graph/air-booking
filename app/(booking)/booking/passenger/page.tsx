import { redirect } from 'next/navigation'

import { BookingHeader } from '@/components/booking/booking-header'
import { PassengerForm } from '@/components/booking/passenger-form'
import { getCurrentAccount } from '@/lib/auth/session'
import { getFlightForDate } from '@/lib/flights/flights'
import { cabinAddPrice } from '@/constants/cabin'
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
  seatOut?: string
  seatRet?: string
}

function parseCabin(value: string | undefined): CabinClass {
  return value === 'BUSINESS' ? CabinClass.BUSINESS : CabinClass.ECONOMY
}

function cabinLabel(cabin: CabinClass): string {
  return cabin === CabinClass.BUSINESS ? 'Business' : 'Economy'
}

export default async function PassengerPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const params = await searchParams
  const from = params.from
  const to = params.to
  const depart = params.depart
  const seatOut = params.seatOut
  if (!from || !to || !depart || !seatOut) redirect('/')

  const trip = params.trip === 'oneway' ? 'oneway' : 'round'
  const cabinOut = parseCabin(params.cabinOut)
  const cabinRet = parseCabin(params.cabinRet)
  const returnDate = params.returnDate
  const seatRet = params.seatRet
  if (trip === 'round' && (!returnDate || !seatRet)) redirect('/')

  const [airports, account, outboundFlight, returnFlight] = await Promise.all([
    prisma.airport.findMany({
      where: { code: { in: [from, to] } },
      select: { code: true, city: true },
    }),
    getCurrentAccount(),
    getFlightForDate(from, to, depart),
    trip === 'round' && returnDate ? getFlightForDate(to, from, returnDate) : Promise.resolve(null),
  ])
  const fromAirport = airports.find((airport) => airport.code === from)
  const toAirport = airports.find((airport) => airport.code === to)
  if (!fromAirport || !toAirport || !outboundFlight) redirect('/')
  if (trip === 'round' && !returnFlight) redirect('/')

  const total =
    outboundFlight.basePrice +
    cabinAddPrice[cabinOut] +
    (returnFlight ? returnFlight.basePrice + cabinAddPrice[cabinRet] : 0)

  const dateParams: Record<string, string> = { from, to, trip, cabinOut, depart }
  if (trip === 'round') dateParams.cabinRet = cabinRet
  if (returnDate) dateParams.returnDate = returnDate
  const dateQuery = new URLSearchParams(dateParams).toString()

  return (
    <div className="min-h-screen bg-white">
      <BookingHeader
        backHref="/"
        fromCity={fromAirport.city}
        toCity={toAirport.city}
        trip={trip}
        activeLeg="return"
        outboundDate={depart}
        returnDate={returnDate}
        totalLabel={`C$${total.toLocaleString('en-US')}`}
        outboundHref={`/booking/outbound?${dateQuery}`}
        returnHref={trip === 'round' ? `/booking/return?${dateQuery}` : undefined}
      />

      <main className="mx-auto max-w-3xl px-6 py-10">
        <h1 className="mb-2 text-3xl font-semibold">Enter Passenger Information</h1>
        <p className="mb-8 text-sm text-gray-500">
          {seatOut} · {cabinLabel(cabinOut)}
          {seatRet ? ` / ${seatRet} · ${cabinLabel(cabinRet)}` : ''}
        </p>

        <PassengerForm
          selection={{ from, to, trip, cabinOut, cabinRet, depart, returnDate, seatOut, seatRet }}
          defaultEmail={account?.email}
        />
      </main>
    </div>
  )
}
