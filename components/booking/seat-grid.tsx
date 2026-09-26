import Link from 'next/link'

import type { SeatAvailability } from '@/lib/flights/seats'

export function SeatGrid({
  seats,
  hrefFor,
}: {
  seats: SeatAvailability[]
  hrefFor: (seatCode: string) => string
}) {
  const rows = [...new Set(seats.map((seat) => seat.row))].sort((a, b) => a - b)
  const columns = [...new Set(seats.map((seat) => seat.column))].sort()
  const aisleAfter = Math.ceil(columns.length / 2) - 1

  return (
    <div className="inline-block">
      <div className="mb-2 flex gap-2 pl-8 text-xs text-gray-400">
        {columns.map((column, i) => (
          <div key={column} className="flex">
            <span className="w-10 text-center">{column}</span>
            {i === aisleAfter && <span className="w-6" />}
          </div>
        ))}
      </div>

      {rows.map((row) => (
        <div key={row} className="mb-2 flex items-center gap-2">
          <span className="w-6 text-right text-xs text-gray-400">{row}</span>
          {columns.map((column, i) => {
            const seat = seats.find((s) => s.row === row && s.column === column)
            const seatCode = `${row}${column}`
            return (
              <div key={column} className="flex">
                {seat && !seat.isTaken ? (
                  <Link
                    href={hrefFor(seatCode)}
                    className="flex h-10 w-10 items-center justify-center rounded border border-emerald-500 bg-emerald-50 text-xs text-emerald-700 hover:bg-emerald-600 hover:text-white"
                  >
                    {seatCode}
                  </Link>
                ) : (
                  <span className="flex h-10 w-10 items-center justify-center rounded border border-gray-200 bg-gray-100 text-xs text-gray-300">
                    ×
                  </span>
                )}
                {i === aisleAfter && <span className="w-6" />}
              </div>
            )
          })}
        </div>
      ))}
    </div>
  )
}
