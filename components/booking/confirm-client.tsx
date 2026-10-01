'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState, useTransition } from 'react'

import { placeBooking } from '@/app/actions/booking'
import { useBookingForm } from '@/components/booking/booking-form-context'
import { BookingSummary } from '@/components/booking/booking-summary'
import type { BookingView, LegView } from '@/lib/booking/get-booking-view'

export function ConfirmClient({
  legs,
  total,
  query,
}: {
  legs: LegView[]
  total: number
  query: string
}) {
  const router = useRouter()
  const { passenger } = useBookingForm()
  const [pending, startTransition] = useTransition()
  const [message, setMessage] = useState<string>()

  useEffect(() => {
    if (!passenger) router.replace(`/booking/passenger?${query}`)
  }, [passenger, query, router])

  if (!passenger) return null

  const booking: BookingView = {
    id: '',
    reference: '',
    status: 'PENDING',
    totalPrice: total,
    passengerName: [passenger.firstName, passenger.middleName, passenger.lastName]
      .filter(Boolean)
      .join(' '),
    contactEmail: passenger.contactEmail,
    contactPhone: passenger.contactPhone ?? null,
    passportNumber: passenger.passportNumber,
    nationality: passenger.nationality,
    legs,
  }

  const onConfirm = () => {
    setMessage(undefined)
    startTransition(async () => {
      const formData = new FormData()
      for (const [key, value] of Object.entries(passenger)) {
        if (value) formData.set(key, String(value))
      }
      new URLSearchParams(query).forEach((value, key) => formData.set(key, value))
      const result = await placeBooking(undefined, formData)
      if (result?.message) setMessage(result.message)
    })
  }

  return (
    <>
      {message && <p className="mb-4 text-sm text-red-600">{message}</p>}

      <BookingSummary booking={booking} editHref={`/booking/passenger?${query}`} />

      <div className="mt-8 text-center">
        <button
          type="button"
          onClick={onConfirm}
          disabled={pending}
          className="w-full max-w-sm rounded bg-brand-700 px-6 py-3 text-base font-semibold text-white hover:bg-brand-800 disabled:bg-gray-300"
        >
          {pending ? 'Processing…' : 'Confirm booking'}
        </button>
      </div>
    </>
  )
}
