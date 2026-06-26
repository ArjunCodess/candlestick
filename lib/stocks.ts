import { normalizeStockSymbol } from "@/lib/constants"

export type StockQuote = {
  price: number
  change: number
  percentChange: number
}

export type StockProfile = {
  name: string
  logo: string
}

export type StockSearchResult = {
  exchange: string
  name: string
  percentChange: number | null
  price: number | null
  providerSymbol: string
  ticker: string
  type: string
}

type FinnhubQuote = {
  c?: number
  d?: number
  dp?: number
}

type FinnhubProfile = {
  name?: string
  logo?: string
}

type FinnhubSearchItem = {
  description?: string
  displaySymbol?: string
  symbol?: string
  type?: string
}

type FinnhubSearchResponse = {
  result?: FinnhubSearchItem[]
}

const finnhubBaseUrl = "https://finnhub.io/api/v1"

function getFinnhubToken() {
  return process.env.FINNHUB_API_KEY ?? process.env.FINNHUB_TOKEN
}

export function getDisplayStockSymbol(symbol: string) {
  return normalizeStockSymbol(symbol).split(".")[0]
}

function asSymbol(symbol: string) {
  return normalizeStockSymbol(symbol)
}

async function fetchFinnhub<T>(
  path: string,
  params: Record<string, string>,
  init?: RequestInit
) {
  const token = getFinnhubToken()

  if (!token) {
    throw new Error("Finnhub API key is not configured.")
  }

  const url = new URL(`${finnhubBaseUrl}${path}`)

  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value)
  }

  const response = await fetch(url, {
    ...init,
    headers: {
      Accept: "application/json",
      "X-Finnhub-Token": token,
      ...init?.headers,
    },
  })

  if (!response.ok) {
    const data = (await response.json().catch(() => null)) as {
      error?: string
    } | null

    throw new Error(data?.error ?? "Unable to fetch stock data.")
  }

  return response.json() as Promise<T>
}

export async function getStockQuote(symbol: string) {
  const providerSymbol = asSymbol(symbol)
  const quote = await fetchFinnhub<FinnhubQuote>(
    "/quote",
    { symbol: providerSymbol },
    { cache: "no-store" }
  )

  if (!quote.c || quote.c <= 0) {
    return null
  }

  return {
    price: quote.c,
    change: quote.d ?? 0,
    percentChange: quote.dp ?? 0,
  } satisfies StockQuote
}

export async function getStockProfile(symbol: string) {
  const providerSymbol = asSymbol(symbol)
  const profile = await fetchFinnhub<FinnhubProfile>(
    "/stock/profile2",
    { symbol: providerSymbol },
    { next: { revalidate: 60 * 60 * 24 } }
  )

  return {
    name: profile.name?.trim() || getDisplayStockSymbol(providerSymbol),
    logo: profile.logo?.trim() || "",
  } satisfies StockProfile
}

export async function searchStocks(query: string, limit = 8) {
  const cleanedQuery = query.trim()

  if (cleanedQuery.length < 2) {
    return []
  }

  const data = await fetchFinnhub<FinnhubSearchResponse>(
    "/search",
    { q: cleanedQuery },
    { next: { revalidate: 60 } }
  )
  const seenTickers = new Set<string>()
  const results: StockSearchResult[] = []

  for (const stock of data.result ?? []) {
    const providerSymbol = stock.symbol ? asSymbol(stock.symbol) : ""
    const ticker = getDisplayStockSymbol(stock.displaySymbol || providerSymbol)

    if (!providerSymbol || !ticker || seenTickers.has(ticker)) {
      continue
    }

    seenTickers.add(ticker)
    results.push({
      exchange: stock.type ?? "",
      name: stock.description?.trim() || ticker,
      percentChange: null,
      price: null,
      providerSymbol,
      ticker,
      type: stock.type ?? "Stock",
    })

    if (results.length === limit) {
      break
    }
  }

  return Promise.all(
    results.map(async (stock) => {
      const quote = await getStockQuote(stock.providerSymbol).catch(() => null)

      return {
        ...stock,
        price: quote?.price ?? null,
        percentChange: quote?.percentChange ?? null,
      }
    })
  )
}
