'use client'

import { ArrowRightLeft, ArrowUpDown } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'

import { Combobox, type ComboboxItem } from '@/components/ui/combobox'
import { Icon } from '@/components/ui/icon'
import { LoadingDots } from '@/components/ui/loading-dots'
import { flagCodeForCountry } from '@/lib/countries'
import { destinationsFor, originsFor } from '@/lib/flights/routes'

export type AirportOption = {
  code: string
  city: string
  name: string
  country: string
}

type TripType = 'round' | 'oneway'

const labelClass = 'text-sm text-gray-500'

export function FlightSearch({ airports }: { airports: AirportOption[] }) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [trip, setTrip] = useState<TripType>('round')
  const [origin, setOrigin] = useState('')
  const [destination, setDestination] = useState('')

  const swap = () => {
    setOrigin(destination)
    setDestination(origin)
  }

  const canSearch =
    origin !== '' && destination !== '' && destinationsFor(origin).includes(destination)

  const search = () => {
    if (!canSearch) return
    const query = new URLSearchParams({ from: origin, to: destination, trip })
    startTransition(() => router.push(`/booking/outbound?${query.toString()}`))
  }

  const toItem = (airport: AirportOption): ComboboxItem => ({
    value: airport.code,
    primary: airport.city,
    secondary: airport.name,
    flagCode: flagCodeForCountry(airport.country),
    searchText: `${airport.city} ${airport.code} ${airport.name}`,
  })
  const validOrigins = destination ? originsFor(destination) : null
  const validDestinations = origin ? destinationsFor(origin) : null
  const originItems = airports
    .filter((airport) => airport.code !== destination)
    .filter((airport) => !validOrigins || validOrigins.includes(airport.code))
    .map(toItem)
  const destinationItems = airports
    .filter((airport) => airport.code !== origin)
    .filter((airport) => !validDestinations || validDestinations.includes(airport.code))
    .map(toItem)

  return (
    <div className="rounded-lg bg-white p-6 shadow-xl md:p-10">
      <div className="mb-8 flex items-center justify-center gap-8 border-b border-gray-100 pb-4">
        <button
          type="button"
          onClick={() => setTrip('round')}
          className={`pb-2 text-lg font-semibold ${
            trip === 'round'
              ? 'border-b-2 border-brand-600 text-gray-900'
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
              ? 'border-b-2 border-brand-600 text-gray-900'
              : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          One Way
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
          <Combobox value={origin} onChange={setOrigin} items={originItems} />
        </div>

        <button
          type="button"
          aria-label="Swap origin and destination"
          onClick={swap}
          className="flex h-10 w-10 shrink-0 items-center justify-center self-center rounded-full border border-gray-300 text-gray-500 hover:bg-gray-50"
        >
          <Icon icon={ArrowUpDown} size={18} className="md:hidden" />
          <Icon icon={ArrowRightLeft} size={18} className="hidden md:block" />
        </button>

        <div className="min-w-0 flex-1">
          <span className={`mb-1 block md:hidden ${labelClass}`}>
            Destination (Country, Region)
          </span>
          <Combobox value={destination} onChange={setDestination} items={destinationItems} />
        </div>
      </div>

      <div className="mt-8 text-center">
        <button
          type="button"
          onClick={search}
          disabled={!canSearch || pending}
          className="inline-flex w-full max-w-sm items-center justify-center rounded bg-brand-700 px-6 py-3 text-base font-semibold text-white hover:bg-brand-800 disabled:cursor-not-allowed disabled:bg-gray-300"
        >
          {pending ? <LoadingDots /> : 'Search Flight'}
        </button>
      </div>

      {pending && (
        <div className="fixed bottom-6 left-6 z-50 rounded-full bg-gray-900 px-4 py-2 text-white shadow-lg">
          <LoadingDots />
        </div>
      )}
    </div>
  )
}
