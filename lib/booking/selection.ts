import 'server-only'

import { airports } from '@/constants/airports'
import { airportTimeZones } from '@/constants/airport-timezones'
import { cabinAddPrice } from '@/constants/cabin'
import { formatZonedDateTime } from '@/lib/flights/airport-timezones'
import { getFlightForDate } from '@/lib/flights/flights'
import { CabinClass } from '@/lib/generated/prisma/enums'

import type { LegView } from './get-booking-view'

export type BookingSelection = {
  from: string
  to: string
  trip: 'round' | 'oneway'
  cabinOut: CabinClass
  cabinRet: CabinClass
  depart: string
  returnDate?: string
  seatOut: string
  seatRet?: string
}

function parseCabin(value: string | undefined): CabinClass {
  return value === 'BUSINESS' ? CabinClass.BUSINESS : CabinClass.ECONOMY
}

function cabinLabel(cabin: CabinClass): string {
  return cabin === CabinClass.BUSINESS ? 'Business' : 'Economy'
}

export function parseSelection(
  params: Record<string, string | undefined>,
): BookingSelection | null {
  const { from, to, depart, seatOut } = params
  if (!from || !to || !depart || !seatOut) return null

  const trip = params.trip === 'oneway' ? 'oneway' : 'round'
  const returnDate = params.returnDate
  const seatRet = params.seatRet
  if (trip === 'round' && (!returnDate || !seatRet)) return null

  return {
    from,
    to,
    trip,
    cabinOut: parseCabin(params.cabinOut),
    cabinRet: parseCabin(params.cabinRet),
    depart,
    returnDate,
    seatOut,
    seatRet,
  }
}

export type SelectionView = {
  legs: LegView[]
  total: number
}

export async function getSelectionView(selection: BookingSelection): Promise<SelectionView | null> {
  const fromAirport = airports.find((airport) => airport.code === selection.from)
  const toAirport = airports.find((airport) => airport.code === selection.to)
  if (!fromAirport || !toAirport) return null

  const [outboundFlight, returnFlight] = await Promise.all([
    getFlightForDate(selection.from, selection.to, selection.depart),
    selection.trip === 'round' && selection.returnDate
      ? getFlightForDate(selection.to, selection.from, selection.returnDate)
      : Promise.resolve(null),
  ])
  if (!outboundFlight) return null
  if (selection.trip === 'round' && !returnFlight) return null

  const outboundTz = airportTimeZones[selection.from] ?? 'UTC'
  const destinationTz = airportTimeZones[selection.to] ?? 'UTC'

  const legs: LegView[] = [
    {
      flightNumber: outboundFlight.flightNumber,
      fromCity: fromAirport.city,
      toCity: toAirport.city,
      departure: formatZonedDateTime(outboundFlight.departureAt, outboundTz),
      arrival: formatZonedDateTime(outboundFlight.arrivalAt, destinationTz),
      seat: selection.seatOut,
      cabin: cabinLabel(selection.cabinOut),
      price: outboundFlight.basePrice + cabinAddPrice[selection.cabinOut],
    },
  ]

  if (returnFlight && selection.seatRet) {
    legs.push({
      flightNumber: returnFlight.flightNumber,
      fromCity: toAirport.city,
      toCity: fromAirport.city,
      departure: formatZonedDateTime(returnFlight.departureAt, destinationTz),
      arrival: formatZonedDateTime(returnFlight.arrivalAt, outboundTz),
      seat: selection.seatRet,
      cabin: cabinLabel(selection.cabinRet),
      price: returnFlight.basePrice + cabinAddPrice[selection.cabinRet],
    })
  }

  const total = legs.reduce((sum, leg) => sum + leg.price, 0)
  return { legs, total }
}
