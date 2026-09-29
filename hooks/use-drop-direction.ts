'use client'

import { useCallback, useState } from 'react'

export type DropDirection = 'up' | 'down'

export function useDropDirection(): {
  direction: DropDirection
  measure: (element: HTMLElement | null) => void
} {
  const [direction, setDirection] = useState<DropDirection>('down')

  const measure = useCallback((element: HTMLElement | null) => {
    if (!element || typeof window === 'undefined') return
    const { top } = element.getBoundingClientRect()
    setDirection(top > window.innerHeight / 2 ? 'up' : 'down')
  }, [])

  return { direction, measure }
}
