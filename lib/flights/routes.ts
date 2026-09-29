import { routes } from '../../constants/routes'

export function routeCode(originCode: string, destinationCode: string): string {
  return `${originCode}-${destinationCode}`
}

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
