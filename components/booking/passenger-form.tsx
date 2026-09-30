'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'

import { createBooking } from '@/app/actions/booking'
import { ComboboxField } from '@/components/ui/combobox-field'
import { type ComboboxItem } from '@/components/ui/combobox'
import { TextField } from '@/components/ui/text-field'
import { countries } from '@/lib/countries'
import { passengerSchema, type PassengerInput } from '@/lib/validations/booking'

export type BookingSelection = {
  from: string
  to: string
  trip: string
  cabinOut: string
  cabinRet: string
  depart: string
  returnDate?: string
  seatOut: string
  seatRet?: string
}

const countryItems: ComboboxItem[] = countries.map((country) => ({
  value: country.name,
  primary: country.name,
  flagCode: country.code,
  searchText: country.name,
}))

export function PassengerForm({
  selection,
  defaultEmail,
}: {
  selection: BookingSelection
  defaultEmail?: string
}) {
  const [formMessage, setFormMessage] = useState<string>()
  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<PassengerInput>({
    resolver: zodResolver(passengerSchema),
    mode: 'onBlur',
    defaultValues: {
      firstName: '',
      lastName: '',
      middleName: '',
      contactEmail: defaultEmail ?? '',
      contactPhone: '',
      dateOfBirth: '',
      nationality: '',
      passportNumber: '',
      countryOfIssue: '',
      dateOfIssue: '',
      dateOfExpiry: '',
    },
  })

  const onSubmit = handleSubmit(async (values) => {
    setFormMessage(undefined)
    const formData = new FormData()
    for (const [key, value] of Object.entries(values)) {
      if (value) formData.set(key, String(value))
    }
    formData.set('from', selection.from)
    formData.set('to', selection.to)
    formData.set('trip', selection.trip)
    formData.set('cabinOut', selection.cabinOut)
    formData.set('cabinRet', selection.cabinRet)
    formData.set('depart', selection.depart)
    if (selection.returnDate) formData.set('returnDate', selection.returnDate)
    formData.set('seatOut', selection.seatOut)
    if (selection.seatRet) formData.set('seatRet', selection.seatRet)

    const result = await createBooking(undefined, formData)
    if (result?.message) setFormMessage(result.message)
  })

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-6">
      {formMessage && <p className="text-sm text-red-600">{formMessage}</p>}
      <p className="text-sm font-semibold text-red-600">All items in * are mandatory.</p>

      <div className="grid gap-4 md:grid-cols-2">
        <TextField
          label="Family Name"
          hint="(Half-width alphabetical)"
          required
          registration={register('lastName')}
          error={errors.lastName?.message}
        />
        <TextField
          label="First Name"
          hint="(Half-width alphabetical)"
          required
          registration={register('firstName')}
          error={errors.firstName?.message}
        />
      </div>

      <TextField
        label="Middle Name"
        hint="(optional)"
        registration={register('middleName')}
        error={errors.middleName?.message}
      />

      <div className="grid gap-4 md:grid-cols-2">
        <TextField
          label="Email"
          type="email"
          required
          registration={register('contactEmail')}
          error={errors.contactEmail?.message}
        />
        <TextField
          label="Phone"
          hint="(optional)"
          registration={register('contactPhone')}
          error={errors.contactPhone?.message}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <TextField
          label="Date of Birth"
          type="date"
          required
          registration={register('dateOfBirth')}
          error={errors.dateOfBirth?.message}
        />
        <ComboboxField
          label="Nationality"
          name="nationality"
          control={control}
          items={countryItems}
          error={errors.nationality?.message}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <TextField
          label="Passport Number"
          required
          registration={register('passportNumber')}
          error={errors.passportNumber?.message}
        />
        <ComboboxField
          label="Country of Issue"
          name="countryOfIssue"
          control={control}
          items={countryItems}
          error={errors.countryOfIssue?.message}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <TextField
          label="Date of Issue"
          type="date"
          required
          registration={register('dateOfIssue')}
          error={errors.dateOfIssue?.message}
        />
        <TextField
          label="Date of Expiry"
          type="date"
          required
          registration={register('dateOfExpiry')}
          error={errors.dateOfExpiry?.message}
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full max-w-sm self-center rounded bg-brand-700 px-6 py-3 font-semibold text-white hover:bg-brand-800 disabled:bg-gray-300"
      >
        {isSubmitting ? 'Processing…' : 'Continue'}
      </button>
    </form>
  )
}
