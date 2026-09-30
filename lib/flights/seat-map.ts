import { cabinAddPrice, cabinSections } from '@/constants/cabin'
import { CabinClass } from '@/lib/generated/prisma/enums'

export type SeatCell = {
  row: number
  column: string
  cabinClass: CabinClass
  addPrice: number
}

export function buildSeatMap(): SeatCell[] {
  const seats: SeatCell[] = []
  for (const section of cabinSections) {
    for (const row of section.rows) {
      for (const column of section.columns) {
        seats.push({
          row,
          column,
          cabinClass: section.cabinClass,
          addPrice: cabinAddPrice[section.cabinClass],
        })
      }
    }
  }
  return seats
}
