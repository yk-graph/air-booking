'use client'

import { useState } from 'react'
import { Controller, type Control, type FieldValues, type Path } from 'react-hook-form'

import { dialCodeFor, dialCodes } from '@/lib/countries'

import { Combobox, type ComboboxItem } from './combobox'

const dialItems: ComboboxItem[] = dialCodes.map((entry) => ({
  value: entry.code,
  primary: entry.dialCode,
  secondary: entry.name,
  flagCode: entry.code,
  searchText: `${entry.name} ${entry.dialCode}`,
}))

const labelClass = 'text-sm font-medium text-gray-800'
const inputClass =
  'min-w-0 flex-1 rounded border border-gray-300 px-3 py-2 text-base focus:border-brand-600 focus:outline-none'

const DEFAULT_COUNTRY = 'jp'

export function PhoneField<T extends FieldValues>({
  label,
  hint,
  name,
  control,
  error,
}: {
  label: string
  hint?: string
  name: Path<T>
  control: Control<T>
  error?: string
}) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <PhoneInput label={label} hint={hint} error={error} onChange={field.onChange} />
      )}
    />
  )
}

function PhoneInput({
  label,
  hint,
  error,
  onChange,
}: {
  label: string
  hint?: string
  error?: string
  onChange: (value: string) => void
}) {
  const [country, setCountry] = useState(DEFAULT_COUNTRY)
  const [number, setNumber] = useState('')

  const emit = (nextCountry: string, nextNumber: string) => {
    const dial = dialCodeFor(nextCountry) ?? ''
    onChange(nextNumber ? `${dial} ${nextNumber}` : '')
  }

  return (
    <div className="flex flex-col gap-1">
      <label className={labelClass}>
        {label}
        {hint && <span className="ml-1 font-normal text-gray-400">{hint}</span>}
      </label>
      <div className="flex gap-2">
        <div className="w-36 shrink-0">
          <Combobox
            value={country}
            onChange={(next) => {
              setCountry(next)
              emit(next, number)
            }}
            items={dialItems}
          />
        </div>
        <input
          type="tel"
          value={number}
          onChange={(event) => {
            setNumber(event.target.value)
            emit(country, event.target.value)
          }}
          placeholder="Phone number"
          className={inputClass}
        />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  )
}
