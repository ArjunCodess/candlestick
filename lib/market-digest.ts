import { getCountry } from "countries-and-timezones"

export const defaultMarketDigestCountry = "us"

export const defaultMarketDigestHour = 9

export const marketDigestHourOptions = Array.from({ length: 24 }, (_, hour) => {
  const value = String(hour)
  const label = `${String(hour).padStart(2, "0")}:00`

  return { label, value }
})

const gnewsSupportedCountryCodes = [
  "au",
  "br",
  "ca",
  "cn",
  "eg",
  "fr",
  "de",
  "gr",
  "hk",
  "in",
  "ie",
  "il",
  "it",
  "jp",
  "nl",
  "no",
  "pk",
  "pe",
  "ph",
  "pt",
  "ro",
  "ru",
  "sg",
  "es",
  "se",
  "ch",
  "tw",
  "ua",
  "gb",
  "us",
] as const

export type MarketDigestCountryCode =
  (typeof gnewsSupportedCountryCodes)[number]

export type MarketDigestCountryOption = {
  code: MarketDigestCountryCode
  name: string
  timeZone: string
}

function getDatasetCountry(code: string) {
  return getCountry(code.toUpperCase())
}

export const marketDigestCountries = gnewsSupportedCountryCodes
  .reduce<MarketDigestCountryOption[]>((countries, code) => {
    const country = getDatasetCountry(code)

    if (!country?.timezones[0]) {
      return countries
    }

    countries.push({
      code,
      name: country.name,
      timeZone: String(country.timezones[0]),
    })

    return countries
  }, [])
  .sort((first, second) => first.name.localeCompare(second.name))

export function isMarketDigestCountryCode(
  country: string
): country is MarketDigestCountryCode {
  return gnewsSupportedCountryCodes.includes(
    country as MarketDigestCountryCode
  )
}

export function getMarketDigestTimeZone(country: string) {
  return (
    getDatasetCountry(country)?.timezones[0] ??
    getDatasetCountry(defaultMarketDigestCountry)?.timezones[0] ??
    "America/New_York"
  )
}
