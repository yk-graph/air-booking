'use client'

import { Check, ChevronDown } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

import { useDropDirection } from '@/hooks/use-drop-direction'

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
  placeholder = 'Type to search',
}: {
  value: string
  onChange: (value: string) => void
  items: ComboboxItem[]
  placeholder?: string
}) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState(
    () => items.find((item) => item.value === value)?.primary ?? '',
  )
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const previousValue = useRef(value)
  const { direction, measure } = useDropDirection()

  const selected = items.find((item) => item.value === value)

  useEffect(() => {
    if (previousValue.current === value) return
    previousValue.current = value
    setQuery(items.find((item) => item.value === value)?.primary ?? '')
  }, [value, items])

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

  const openList = () => {
    measure(containerRef.current)
    setOpen(true)
  }

  const showingSelected = selected != null && query === selected.primary
  const normalized = query.trim().toLowerCase()
  const filtered =
    !normalized || showingSelected
      ? items
      : items.filter((item) => item.searchText.toLowerCase().includes(normalized))

  const select = (next: string) => {
    const item = items.find((entry) => entry.value === next)
    onChange(next)
    setQuery(item?.primary ?? '')
    setOpen(false)
  }

  return (
    <div ref={containerRef} className="relative">
      <div className="flex items-center gap-2 rounded border border-gray-300 px-4 py-4 text-lg focus-within:border-brand-600">
        {showingSelected && selected?.flagCode && (
          <span className={`fi fi-${selected.flagCode} shrink-0`} />
        )}
        <input
          ref={inputRef}
          value={query}
          placeholder={placeholder}
          onFocus={() => {
            openList()
            inputRef.current?.select()
          }}
          onChange={(event) => {
            setQuery(event.target.value)
            openList()
          }}
          onKeyDown={(event) => {
            if (event.key === 'Escape') setOpen(false)
            if (event.key === 'Enter') {
              event.preventDefault()
              if (open && filtered[0]) select(filtered[0].value)
            }
          }}
          className="min-w-0 flex-1 bg-transparent text-gray-900 outline-none"
        />
        <button
          type="button"
          aria-label="Toggle options"
          onClick={() => {
            if (open) {
              setOpen(false)
            } else {
              openList()
              inputRef.current?.focus()
            }
          }}
          className="shrink-0 text-gray-400"
        >
          <Icon icon={ChevronDown} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {open && (
        <ul
          className={`absolute inset-x-0 z-20 max-h-60 overflow-auto rounded border border-gray-200 bg-white shadow-lg ${
            direction === 'up' ? 'bottom-full mb-1' : 'top-full mt-1'
          }`}
        >
          {filtered.length === 0 && <li className="px-4 py-3 text-sm text-gray-400">No results</li>}
          {filtered.map((item) => (
            <li key={item.value}>
              <button
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
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
