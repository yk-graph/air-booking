'use client'

import { useState } from 'react'

export type AirportOption = {
  code: string
  city: string
  name: string
  country: string
}

type TripType = 'round' | 'oneway'

export function FlightSearch({ airports }: { airports: AirportOption[] }) {
  const [trip, setTrip] = useState<TripType>('round')
  const [origin, setOrigin] = useState('')
  const [destination, setDestination] = useState('')
  const [showPromo, setShowPromo] = useState(false)

  const swap = () => {
    setOrigin(destination)
    setDestination(origin)
  }

  return (
    <div className="rounded-lg bg-white p-6 shadow-xl md:p-10">
      <div className="mb-8 flex items-center justify-center gap-8 border-b border-gray-100 pb-4">
        <button
          type="button"
          onClick={() => setTrip('round')}
          className={`pb-2 text-lg font-semibold ${
            trip === 'round'
              ? 'border-b-2 border-emerald-600 text-gray-900'
              : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          Round Trip
        </button>
        <button
          type="button"
          onClick={() => setTrip('oneway')}
          className={`pb-2 text-lg font-semibold ${
            trip === 'oneway'
              ? 'border-b-2 border-emerald-600 text-gray-900'
              : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          One Way <span className="text-xs font-normal text-gray-400">Including transit</span>
        </button>
      </div>

      <div className="flex flex-col items-center gap-3 md:flex-row">
        <SelectField
          label="Origin (Country, Region)"
          value={origin}
          onChange={setOrigin}
          airports={airports}
          disabledCode={destination}
        />

        <button
          type="button"
          aria-label="Swap origin and destination"
          onClick={swap}
          className="mt-2 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-gray-300 text-gray-500 hover:bg-gray-50"
        >
          ⇄
        </button>

        <SelectField
          label="Destination (Country, Region)"
          value={destination}
          onChange={setDestination}
          airports={airports}
          disabledCode={origin}
        />
      </div>

      <div className="mt-6 text-center">
        <button
          type="button"
          onClick={() => setShowPromo((value) => !value)}
          className="text-sm text-emerald-700 hover:underline"
        >
          Add a Promotional Code {showPromo ? '−' : '＋'}
        </button>
        {showPromo && (
          <div className="mt-3">
            <input
              type="text"
              placeholder="Promotional code"
              className="w-full max-w-xs rounded border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
        )}
      </div>

      <div className="mt-8 text-center">
        <button
          type="button"
          className="w-full max-w-sm rounded bg-emerald-700 px-6 py-3 text-base font-semibold text-white hover:bg-emerald-800"
        >
          Search Flight
        </button>
      </div>
    </div>
  )
}

function SelectField({
  label,
  value,
  onChange,
  airports,
  disabledCode,
}: {
  label: string
  value: string
  onChange: (code: string) => void
  airports: AirportOption[]
  disabledCode: string
}) {
  return (
    <label className="flex w-full flex-col gap-1">
      <span className="text-sm text-gray-500">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="rounded border border-gray-300 px-4 py-4 text-lg text-gray-900 focus:border-emerald-600 focus:outline-none"
      >
        <option value="">Select</option>
        {airports.map((airport) => (
          <option key={airport.code} value={airport.code} disabled={airport.code === disabledCode}>
            {airport.city} — {airport.code} {airport.name} ({airport.country})
          </option>
        ))}
      </select>
    </label>
  )
}
