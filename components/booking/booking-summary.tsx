import type { BookingView } from '@/lib/booking/get-booking-view'

function formatPrice(value: number): string {
  return `C$${value.toLocaleString('en-US')}`
}

export function BookingSummary({ booking }: { booking: BookingView }) {
  return (
    <div className="flex flex-col gap-6">
      <section className="rounded-lg border border-gray-200">
        {booking.legs.map((leg, i) => (
          <div
            key={i}
            className="flex items-center justify-between border-b border-gray-100 p-4 last:border-b-0"
          >
            <div>
              <div className="text-sm font-semibold text-gray-900">
                {leg.fromCity} → {leg.toCity}
                <span className="ml-2 font-normal text-gray-400">{leg.flightNumber}</span>
              </div>
              <div className="text-xs text-gray-500">
                {leg.departure} → {leg.arrival}
              </div>
              <div className="text-xs text-gray-500">
                Seat {leg.seat} · {leg.cabin}
              </div>
            </div>
            <div className="text-sm font-medium text-gray-900">{formatPrice(leg.price)}</div>
          </div>
        ))}
      </section>

      <section className="rounded-lg border border-gray-200 p-4 text-sm text-gray-700">
        <h3 className="mb-2 font-semibold text-gray-900">Passenger</h3>
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
        <span className="text-lg font-semibold text-emerald-700">
          {formatPrice(booking.totalPrice)}
        </span>
      </div>
    </div>
  )
}
