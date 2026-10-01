import { redirect } from 'next/navigation'

import { BookingHeader } from '@/components/booking/booking-header'
import { ConfirmClient } from '@/components/booking/confirm-client'
import { airports } from '@/constants/airports'
import { getSelectionView, parseSelection } from '@/lib/booking/selection'

export default async function ConfirmPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>
}) {
  const params = await searchParams
  const selection = parseSelection(params)
  if (!selection) redirect('/')

  const fromAirport = airports.find((airport) => airport.code === selection.from)
  const toAirport = airports.find((airport) => airport.code === selection.to)
  if (!fromAirport || !toAirport) redirect('/')

  const view = await getSelectionView(selection)
  if (!view) redirect('/')

  const query = new URLSearchParams({
    from: selection.from,
    to: selection.to,
    trip: selection.trip,
    cabinOut: selection.cabinOut,
    depart: selection.depart,
    seatOut: selection.seatOut,
    ...(selection.trip === 'round' ? { cabinRet: selection.cabinRet } : {}),
    ...(selection.returnDate ? { returnDate: selection.returnDate } : {}),
    ...(selection.seatRet ? { seatRet: selection.seatRet } : {}),
  }).toString()

  const dateQuery = new URLSearchParams({
    from: selection.from,
    to: selection.to,
    trip: selection.trip,
    cabinOut: selection.cabinOut,
    depart: selection.depart,
    ...(selection.trip === 'round' ? { cabinRet: selection.cabinRet } : {}),
    ...(selection.returnDate ? { returnDate: selection.returnDate } : {}),
  }).toString()

  return (
    <>
      <BookingHeader
        backHref={`/booking/passenger?${query}`}
        fromCity={fromAirport.city}
        toCity={toAirport.city}
        trip={selection.trip}
        activeLeg="return"
        outboundDate={selection.depart}
        returnDate={selection.returnDate}
        totalLabel={`C$${view.total.toLocaleString('en-US')}`}
        outboundHref={`/booking/outbound?${dateQuery}`}
        returnHref={selection.trip === 'round' ? `/booking/return?${dateQuery}` : undefined}
      />

      <main className="mx-auto max-w-2xl px-6 py-12">
        <h1 className="mb-2 text-3xl font-semibold">Review your booking</h1>
        <p className="mb-8 text-sm text-gray-500">
          Please review the details before confirming your reservation.
        </p>

        <ConfirmClient legs={view.legs} total={view.total} query={query} />
      </main>
    </>
  )
}
