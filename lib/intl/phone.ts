import { getCountries, getCountryCallingCode } from 'libphonenumber-js'
import worldCountries from 'world-countries'

export type DialCode = {
  code: string
  name: string
  dialCode: string
}

const nameByCca2 = new Map(worldCountries.map((country) => [country.cca2, country.name.common]))

export const dialCodes: DialCode[] = getCountries()
  // Keep only countries that have a name and flag (drops AC/TA which flag-icons lacks).
  .filter((country) => nameByCca2.has(country))
  .map((country) => ({
    code: country.toLowerCase(),
    name: nameByCca2.get(country)!,
    dialCode: `+${getCountryCallingCode(country)}`,
  }))
  .sort((a, b) => a.name.localeCompare(b.name))

const dialCodeByCode = new Map(dialCodes.map((entry) => [entry.code, entry.dialCode]))

export function dialCodeFor(code: string): string | undefined {
  return dialCodeByCode.get(code)
}
