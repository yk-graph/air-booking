'use client'

import { useEffect } from 'react'

import { useBookingForm } from '@/components/booking/booking-form-context'

export function ClearBookingForm() {
  const { reset } = useBookingForm()
  useEffect(() => {
    reset()
  }, [reset])
  return null
}
