'use client'

import { Check, ChevronDown } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

import { Icon } from './icon'

export type ComboboxItem = {
  value: string
  primary: string
  secondary?: string
  flagCode?: string
  searchText: string
}

export function Combobox({
  value,
  onChange,
  items,
  placeholder = 'Select',
}: {
  value: string
  onChange: (value: string) => void
  items: ComboboxItem[]
  placeholder?: string
}) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onClick = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [open])

  const selected = items.find((item) => item.value === value)
  const filtered = query
    ? items.filter((item) => item.searchText.toLowerCase().includes(query.toLowerCase()))
    : items

  const select = (next: string) => {
    onChange(next)
    setOpen(false)
    setQuery('')
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="flex w-full items-center gap-3 rounded border border-gray-300 px-4 py-4 text-left text-lg focus:border-brand-600 focus:outline-none"
      >
        {selected ? (
          <span className="flex min-w-0 flex-1 items-center gap-3">
            {selected.flagCode && <span className={`fi fi-${selected.flagCode} shrink-0`} />}
            <span className="min-w-0 flex-1 truncate">
              <span className="text-gray-900">{selected.primary}</span>
              {selected.secondary && (
                <span className="ml-2 text-sm text-gray-400">{selected.secondary}</span>
              )}
            </span>
          </span>
        ) : (
          <span className="flex-1 text-gray-400">{placeholder}</span>
        )}
        <Icon icon={ChevronDown} className="shrink-0 text-gray-400" />
      </button>

      {open && (
        <div className="absolute z-20 mt-1 max-h-72 w-full overflow-auto rounded border border-gray-200 bg-white shadow-lg">
          <div className="sticky top-0 bg-white p-2">
            <input
              autoFocus
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search…"
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-brand-600 focus:outline-none"
            />
          </div>

          {filtered.length === 0 && <p className="px-4 py-3 text-sm text-gray-400">No results</p>}

          {filtered.map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => select(item.value)}
              className="flex w-full items-center gap-3 px-4 py-2 text-left hover:bg-brand-50"
            >
              {item.flagCode && <span className={`fi fi-${item.flagCode} shrink-0`} />}
              <span className="min-w-0 flex-1 truncate">
                <span className="text-gray-900">{item.primary}</span>
                {item.secondary && (
                  <span className="ml-2 text-sm text-gray-400">{item.secondary}</span>
                )}
              </span>
              {item.value === value && <Icon icon={Check} size={16} className="text-brand-600" />}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
