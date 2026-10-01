import { type ReactNode } from 'react'

import { BookingFormProvider } from '@/components/booking/booking-form-context'

export default function BookingLayout({ children }: { children: ReactNode }) {
  return (
    <BookingFormProvider>
      <div className="min-h-screen bg-white">{children}</div>
    </BookingFormProvider>
  )
}
