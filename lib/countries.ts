import worldCountries from 'world-countries'

export type Country = {
  code: string
  name: string
}

export const countries: Country[] = worldCountries
  .map((country) => ({ code: country.cca2.toLowerCase(), name: country.name.common }))
  .sort((a, b) => a.name.localeCompare(b.name))

const codeByName = new Map(countries.map((country) => [country.name, country.code]))

export function flagCodeForCountry(name: string): string | undefined {
  return codeByName.get(name)
}
