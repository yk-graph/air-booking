import { ArrowRight } from 'lucide-react'
import Link from 'next/link'

import { Icon } from '@/components/ui/icon'
import type { BookingView } from '@/lib/booking/get-booking-view'

function formatPrice(value: number): string {
  return `C$${value.toLocaleString('en-US')}`
}

export function BookingSummary({
  booking,
  editHref,
  legEditHrefs,
}: {
  booking: BookingView
  editHref?: string
  legEditHrefs?: string[]
}) {
  return (
    <div className="flex flex-col gap-6">
      <section className="rounded-lg border border-gray-200">
        {booking.legs.map((leg, i) => (
          <div
            key={i}
            className="flex items-center justify-between border-b border-gray-100 p-4 last:border-b-0"
          >
            <div>
              <div className="flex items-center gap-1 text-sm font-semibold text-gray-900">
                {leg.fromCity}
                <Icon icon={ArrowRight} size={14} />
                {leg.toCity}
                <span className="ml-2 font-normal text-gray-400">{leg.flightNumber}</span>
              </div>
              <div className="flex items-center gap-1 text-xs text-gray-500">
                {leg.departure}
                <Icon icon={ArrowRight} size={12} />
                {leg.arrival}
              </div>
              <div className="text-xs text-gray-500">
                Seat {leg.seat} · {leg.cabin}
              </div>
            </div>
            <div className="flex flex-col items-end gap-1">
              {legEditHrefs?.[i] && (
                <Link
                  href={legEditHrefs[i]}
                  className="text-sm font-medium text-brand-700 hover:underline"
                >
                  Edit
                </Link>
              )}
              <span className="text-sm font-medium text-gray-900">{formatPrice(leg.price)}</span>
            </div>
          </div>
        ))}
      </section>

      <section className="rounded-lg border border-gray-200 p-4 text-sm text-gray-700">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">Passenger</h3>
          {editHref && (
            <Link href={editHref} className="text-sm font-medium text-brand-700 hover:underline">
              Edit
            </Link>
          )}
        </div>
        <p>{booking.passengerName}</p>
        <p className="text-gray-500">
          {booking.contactEmail}
          {booking.contactPhone ? ` · ${booking.contactPhone}` : ''}
        </p>
        <p className="text-gray-500">
          Passport {booking.passportNumber} · {booking.nationality}
        </p>
      </section>

      <div className="flex items-center justify-between border-t border-gray-200 pt-4">
        <span className="text-lg font-semibold">Total</span>
        <span className="text-lg font-semibold text-brand-700">
          {formatPrice(booking.totalPrice)}
        </span>
      </div>
    </div>
  )
}
