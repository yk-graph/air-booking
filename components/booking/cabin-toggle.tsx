import Link from 'next/link'

import { CabinClass } from '@/lib/generated/prisma/enums'

const options: { value: CabinClass; label: string }[] = [
  { value: CabinClass.ECONOMY, label: 'Economy' },
  { value: CabinClass.BUSINESS, label: 'Business' },
]

export function CabinToggle({
  cabin,
  hrefFor,
}: {
  cabin: CabinClass
  hrefFor: (cabin: CabinClass) => string
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-gray-500">Cabin</span>
      <div className="inline-flex overflow-hidden rounded-md border border-gray-300">
        {options.map((option) => (
          <Link
            key={option.value}
            href={hrefFor(option.value)}
            className={`px-4 py-2 text-sm font-medium ${
              cabin === option.value
                ? 'bg-emerald-700 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            {option.label}
          </Link>
        ))}
      </div>
    </div>
  )
}
