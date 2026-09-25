import 'server-only'

import { prisma } from '@/lib/prisma'

import { buildSeatMap, type SeatCell } from './seat-map'

export type SeatAvailability = SeatCell & { isTaken: boolean }

export async function getFlightSeatMap(flightId: string): Promise<SeatAvailability[]> {
  const takenSeats = await prisma.seat.findMany({
    where: { flightId },
    select: { seatRow: true, seatColumn: true },
  })

  const takenKeys = new Set(takenSeats.map((seat) => `${seat.seatRow}-${seat.seatColumn}`))

  return buildSeatMap().map((seat) => ({
    ...seat,
    isTaken: takenKeys.has(`${seat.row}-${seat.column}`),
  }))
}
