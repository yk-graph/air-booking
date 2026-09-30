import { type ReactNode } from 'react'

import { BookingFormProvider } from '@/components/booking/booking-form-context'
import { BookingTopBar } from '@/components/booking/booking-top-bar'

export default function BookingLayout({ children }: { children: ReactNode }) {
  return (
    <BookingFormProvider>
      <div className="min-h-screen bg-white">
        <BookingTopBar />
        {children}
      </div>
    </BookingFormProvider>
  )
}
