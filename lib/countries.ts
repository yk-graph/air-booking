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

export type DialCode = {
  code: string
  name: string
  dialCode: string
}

export const dialCodes: DialCode[] = worldCountries
  .map((country) => {
    const { root, suffixes } = country.idd
    if (!root) return null
    const dialCode = suffixes && suffixes.length === 1 ? `${root}${suffixes[0]}` : root
    return { code: country.cca2.toLowerCase(), name: country.name.common, dialCode }
  })
  .filter((entry): entry is DialCode => entry !== null)
  .sort((a, b) => a.name.localeCompare(b.name))

const dialCodeByCode = new Map(dialCodes.map((entry) => [entry.code, entry.dialCode]))

export function dialCodeFor(code: string): string | undefined {
  return dialCodeByCode.get(code)
}
