'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { Controller, useForm, type UseFormRegisterReturn } from 'react-hook-form'

import { createBooking } from '@/app/actions/booking'
import { Combobox, type ComboboxItem } from '@/components/ui/combobox'
import { countries } from '@/lib/countries'
import { passengerSchema, type PassengerInput } from '@/lib/validations/booking'

export type BookingSelection = {
  from: string
  to: string
  trip: string
  cabin: string
  depart: string
  returnDate?: string
  seatOut: string
  seatRet?: string
}

const inputClass =
  'rounded border border-gray-300 px-3 py-2 focus:border-emerald-600 focus:outline-none'
const labelClass = 'text-sm font-medium text-gray-800'

const countryItems: ComboboxItem[] = countries.map((country) => ({
  value: country.name,
  primary: country.name,
  flagCode: country.code,
  searchText: country.name,
}))

function TextField({
  label,
  hint,
  required,
  type = 'text',
  registration,
  error,
}: {
  label: string
  hint?: string
  required?: boolean
  type?: string
  registration: UseFormRegisterReturn
  error?: string
}) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={registration.name} className={labelClass}>
        {label} {required && <span className="text-red-600">*</span>}
        {hint && <span className="ml-1 font-normal text-gray-400">{hint}</span>}
      </label>
      <input id={registration.name} type={type} className={inputClass} {...registration} />
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  )
}

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
    formData.set('cabin', selection.cabin)
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
        <CountryField
          label="Nationality"
          name="nationality"
          control={control}
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
        <CountryField
          label="Country of Issue"
          name="countryOfIssue"
          control={control}
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
        className="w-full max-w-sm self-center rounded bg-emerald-700 px-6 py-3 font-semibold text-white hover:bg-emerald-800 disabled:bg-gray-300"
      >
        {isSubmitting ? 'Processing…' : 'Continue'}
      </button>
    </form>
  )
}

function CountryField({
  label,
  name,
  control,
  error,
}: {
  label: string
  name: 'nationality' | 'countryOfIssue'
  control: ReturnType<typeof useForm<PassengerInput>>['control']
  error?: string
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className={labelClass}>
        {label} <span className="text-red-600">*</span>
      </label>
      <Controller
        control={control}
        name={name}
        render={({ field }) => (
          <Combobox value={field.value ?? ''} onChange={field.onChange} items={countryItems} />
        )}
      />
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  )
}
