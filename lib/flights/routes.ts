export type Route = {
  originCode: string
  destinationCode: string
}

export function routeCode(originCode: string, destinationCode: string): string {
  return `${originCode}-${destinationCode}`
}

const spokes = ['ICN', 'BKK', 'SIN', 'KUL', 'HNL', 'YVR', 'SFO', 'LAX']

// Every route flies through the Tokyo (NRT) hub, in both directions.
export const routes: Route[] = spokes.flatMap((spoke) => [
  { originCode: 'NRT', destinationCode: spoke },
  { originCode: spoke, destinationCode: 'NRT' },
])

export function destinationsFor(originCode: string): string[] {
  return routes
    .filter((route) => route.originCode === originCode)
    .map((route) => route.destinationCode)
}

export function originsFor(destinationCode: string): string[] {
  return routes
    .filter((route) => route.destinationCode === destinationCode)
    .map((route) => route.originCode)
}
