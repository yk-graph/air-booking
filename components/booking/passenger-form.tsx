'use client'

import { useActionState } from 'react'

import { createBooking } from '@/app/actions/booking'
import type { BookingFormState, PassengerInput } from '@/lib/validations/booking'

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

function Field({
  name,
  label,
  state,
  required,
  type = 'text',
  hint,
  defaultValue,
}: {
  name: keyof PassengerInput
  label: string
  state: BookingFormState
  required?: boolean
  type?: string
  hint?: string
  defaultValue?: string
}) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={name} className={labelClass}>
        {label} {required && <span className="text-red-600">*</span>}
        {hint && <span className="ml-1 font-normal text-gray-400">{hint}</span>}
      </label>
      <input id={name} name={name} type={type} defaultValue={defaultValue} className={inputClass} />
      {state?.errors?.[name]?.map((error) => (
        <p key={error} className="text-sm text-red-600">
          {error}
        </p>
      ))}
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
  const [state, action, pending] = useActionState(createBooking, undefined)

  return (
    <form action={action} className="flex flex-col gap-6">
      <input type="hidden" name="from" value={selection.from} />
      <input type="hidden" name="to" value={selection.to} />
      <input type="hidden" name="trip" value={selection.trip} />
      <input type="hidden" name="cabin" value={selection.cabin} />
      <input type="hidden" name="depart" value={selection.depart} />
      {selection.returnDate && (
        <input type="hidden" name="returnDate" value={selection.returnDate} />
      )}
      <input type="hidden" name="seatOut" value={selection.seatOut} />
      {selection.seatRet && <input type="hidden" name="seatRet" value={selection.seatRet} />}

      {state?.message && <p className="text-sm text-red-600">{state.message}</p>}
      <p className="text-sm font-semibold text-red-600">All items in * are mandatory.</p>

      <div className="grid gap-4 md:grid-cols-2">
        <Field
          name="lastName"
          label="Family Name"
          hint="(Half-width alphabetical)"
          required
          state={state}
        />
        <Field
          name="firstName"
          label="First Name"
          hint="(Half-width alphabetical)"
          required
          state={state}
        />
      </div>

      <Field name="middleName" label="Middle Name" hint="(optional)" state={state} />

      <div className="grid gap-4 md:grid-cols-2">
        <Field
          name="contactEmail"
          label="Email"
          type="email"
          required
          state={state}
          defaultValue={defaultEmail}
        />
        <Field name="contactPhone" label="Phone" hint="(optional)" state={state} />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Field name="dateOfBirth" label="Date of Birth" type="date" required state={state} />
        <Field name="nationality" label="Nationality" required state={state} />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Field name="passportNumber" label="Passport Number" required state={state} />
        <Field name="countryOfIssue" label="Country of Issue" required state={state} />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Field name="dateOfIssue" label="Date of Issue" type="date" required state={state} />
        <Field name="dateOfExpiry" label="Date of Expiry" type="date" required state={state} />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="w-full max-w-sm self-center rounded bg-emerald-700 px-6 py-3 font-semibold text-white hover:bg-emerald-800 disabled:bg-gray-300"
      >
        {pending ? 'Processing…' : 'Continue'}
      </button>
    </form>
  )
}
