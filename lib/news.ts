import {
  defaultMarketDigestCountry,
  isMarketDigestCountryCode,
} from "@/lib/market-digest"

export type NewsHeadline = {
  title: string
  description: string
  url: string
  sourceName: string
  publishedAt: string
}

type GNewsResponse = {
  articles?: {
    title?: string
    description?: string
    url?: string
    publishedAt?: string
    source?: {
      name?: string
    }
  }[]
}

export async function getCountryBusinessHeadlines(country: string) {
  const apiKey = process.env.GNEWS_API_KEY

  if (!apiKey) {
    throw new Error("GNEWS_API_KEY is not configured.")
  }

  const countryCode = country.trim().toLowerCase()
  const url = new URL("https://gnews.io/api/v4/top-headlines")

  url.searchParams.set("category", "business")
  url.searchParams.set(
    "country",
    isMarketDigestCountryCode(countryCode)
      ? countryCode
      : defaultMarketDigestCountry
  )
  url.searchParams.set("lang", "en")
  url.searchParams.set("max", "10")
  url.searchParams.set("apikey", apiKey)

  const response = await fetch(url, { cache: "no-store" })

  if (!response.ok) {
    throw new Error("Unable to fetch GNews headlines.")
  }

  const data = (await response.json()) as GNewsResponse

  return (data.articles ?? [])
    .filter((article) => article.title && article.url)
    .map(
      (article): NewsHeadline => ({
        title: article.title ?? "",
        description: article.description ?? "",
        url: article.url ?? "",
        sourceName: article.source?.name ?? "GNews",
        publishedAt: article.publishedAt ?? "",
      })
    )
}
