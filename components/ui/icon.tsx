import type { LucideIcon } from 'lucide-react'

export function Icon({
  icon: LucideComponent,
  size = 20,
  className,
}: {
  icon: LucideIcon
  size?: number
  className?: string
}) {
  return <LucideComponent size={size} className={className} aria-hidden />
}
