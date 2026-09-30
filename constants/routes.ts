export type Route = {
  originCode: string
  destinationCode: string
}

const spokes = ['ICN', 'BKK', 'SIN', 'KUL', 'HNL', 'YVR', 'SFO', 'LAX']

// Every route flies through the Tokyo (NRT) hub, in both directions.
export const routes: Route[] = spokes.flatMap((spoke) => [
  { originCode: 'NRT', destinationCode: spoke },
  { originCode: spoke, destinationCode: 'NRT' },
])
