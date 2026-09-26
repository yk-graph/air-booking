export const airportTimeZones: Record<string, string> = {
  NRT: 'Asia/Tokyo',
  ICN: 'Asia/Seoul',
  BKK: 'Asia/Bangkok',
  SIN: 'Asia/Singapore',
  KUL: 'Asia/Kuala_Lumpur',
  HNL: 'Pacific/Honolulu',
  YVR: 'America/Vancouver',
  SFO: 'America/Los_Angeles',
  LAX: 'America/Los_Angeles',
}

export function zonedDateKey(instant: Date, timeZone: string): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(instant)
}
