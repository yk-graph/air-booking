'use client'

import { useState } from 'react'

export type AirportOption = {
  code: string
  city: string
  name: string
  country: string
}

type TripType = 'round' | 'oneway'

const selectClass =
  'w-full truncate rounded border border-gray-300 px-4 py-4 text-lg text-gray-900 focus:border-emerald-600 focus:outline-none'
const labelClass = 'text-sm text-gray-500'

export function FlightSearch({ airports }: { airports: AirportOption[] }) {
  const [trip, setTrip] = useState<TripType>('round')
  const [origin, setOrigin] = useState('')
  const [destination, setDestination] = useState('')

  const swap = () => {
    setOrigin(destination)
    setDestination(origin)
  }

  const renderOptions = (disabledCode: string) => (
    <>
      <option value="">Select</option>
      {airports.map((airport) => (
        <option key={airport.code} value={airport.code} disabled={airport.code === disabledCode}>
          {airport.city} — {airport.code} {airport.name} ({airport.country})
        </option>
      ))}
    </>
  )

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

      <div className="hidden md:grid md:grid-cols-[1fr_auto_1fr] md:gap-3">
        <span className={labelClass}>Origin (Country, Region)</span>
        <span aria-hidden className="w-10" />
        <span className={labelClass}>Destination (Country, Region)</span>
      </div>

      <div className="mt-1 flex flex-col gap-3 md:flex-row md:items-center">
        <div className="min-w-0 flex-1">
          <span className={`mb-1 block md:hidden ${labelClass}`}>Origin (Country, Region)</span>
          <select
            value={origin}
            onChange={(event) => setOrigin(event.target.value)}
            className={selectClass}
          >
            {renderOptions(destination)}
          </select>
        </div>

        <button
          type="button"
          aria-label="Swap origin and destination"
          onClick={swap}
          className="flex h-10 w-10 shrink-0 items-center justify-center self-center rounded-full border border-gray-300 text-gray-500 hover:bg-gray-50"
        >
          ⇄
        </button>

        <div className="min-w-0 flex-1">
          <span className={`mb-1 block md:hidden ${labelClass}`}>
            Destination (Country, Region)
          </span>
          <select
            value={destination}
            onChange={(event) => setDestination(event.target.value)}
            className={selectClass}
          >
            {renderOptions(origin)}
          </select>
        </div>
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
