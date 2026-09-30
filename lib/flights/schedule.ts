// Bookable window: the current month plus the following months, as 'YYYY-MM'.
export function getScheduleMonths(count = 3): string[] {
  const now = new Date()
  return Array.from({ length: count }, (_, index) => {
    const month = new Date(now.getFullYear(), now.getMonth() + index, 1)
    return `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, '0')}`
  })
}
