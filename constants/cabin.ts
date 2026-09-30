import { CabinClass } from '@/lib/generated/prisma/enums'

export const cabinAddPrice: Record<CabinClass, number> = {
  [CabinClass.ECONOMY]: 0,
  [CabinClass.BUSINESS]: 1500,
}

export type CabinSection = {
  cabinClass: CabinClass
  rows: number[]
  columns: string[]
}

export const cabinSections: CabinSection[] = [
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
