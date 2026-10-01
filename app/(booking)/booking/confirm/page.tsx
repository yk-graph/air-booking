import { redirect } from 'next/navigation'

import { ConfirmClient } from '@/components/booking/confirm-client'
import { getSelectionView, parseSelection } from '@/lib/booking/selection'

export default async function ConfirmPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>
}) {
  const params = await searchParams
  const selection = parseSelection(params)
  if (!selection) redirect('/')

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

  return (
    <main className="mx-auto max-w-2xl px-6 py-12">
      <h1 className="mb-2 text-3xl font-semibold">Review your booking</h1>
      <p className="mb-8 text-sm text-gray-500">
        Please review the details before confirming your reservation.
      </p>

      <ConfirmClient legs={view.legs} total={view.total} query={query} />
    </main>
  )
}
