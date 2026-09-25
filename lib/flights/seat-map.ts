import { CabinClass } from '@/lib/generated/prisma/enums'

export const cabinAddPrice: Record<CabinClass, number> = {
  [CabinClass.ECONOMY]: 0,
  [CabinClass.BUSINESS]: 1500,
}

type CabinSection = {
  cabinClass: CabinClass
  rows: number[]
  columns: string[]
}

const cabinSections: CabinSection[] = [
  {
    cabinClass: CabinClass.BUSINESS,
    rows: [1, 2, 3, 4, 5],
    columns: ['A', 'C', 'D', 'F'],
  },
  {
    cabinClass: CabinClass.ECONOMY,
    rows: Array.from({ length: 26 }, (_, index) => index + 20),
    columns: ['A', 'B', 'C', 'D', 'E', 'F'],
  },
]

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
