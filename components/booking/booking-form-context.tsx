'use client'

import { createContext, useContext, useState, type ReactNode } from 'react'

import type { PassengerInput } from '@/lib/validations/booking'

type BookingFormValue = {
  passenger: PassengerInput | null
  setPassenger: (passenger: PassengerInput) => void
  reset: () => void
}

const BookingFormContext = createContext<BookingFormValue | null>(null)

export function BookingFormProvider({ children }: { children: ReactNode }) {
  const [passenger, setPassenger] = useState<PassengerInput | null>(null)
  const reset = () => setPassenger(null)

  return (
    <BookingFormContext.Provider value={{ passenger, setPassenger, reset }}>
      {children}
    </BookingFormContext.Provider>
  )
}

export function useBookingForm(): BookingFormValue {
  const context = useContext(BookingFormContext)
  if (!context) {
    throw new Error('useBookingForm must be used within a BookingFormProvider')
  }
  return context
}
