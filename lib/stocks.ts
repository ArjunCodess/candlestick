import { normalizeStockSymbol } from "@/lib/constants"
import {
  encodeBseSymbol,
  getDisplayStockSymbol,
  parseBseSymbol,
} from "@/lib/stock-symbols"

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

type FinnhubSearchResponse = {
  result?: {
    description?: string
    displaySymbol?: string
    symbol?: string
    type?: string
  }[]
}

const finnhubBaseUrl = "https://finnhub.io/api/v1"

function numberValue(value: unknown) {
  const number = Number(value)

  return Number.isFinite(number) ? number : 0
}

async function fetchFinnhub<T>(path: string, params: Record<string, string>) {
  const token = process.env.FINNHUB_API_KEY ?? process.env.FINNHUB_TOKEN

  if (!token) {
    throw new Error("Finnhub API key is not configured.")
  }

  const url = new URL(`${finnhubBaseUrl}${path}`)
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.set(key, value)
  })

  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
      "X-Finnhub-Token": token,
    },
    cache: "no-store",
  })

  if (!response.ok) {
    throw new Error("Unable to fetch Finnhub stock data.")
  }

  return response.json() as Promise<T>
}

async function getBseClient() {
  const { BSE } = await import("nse-bse-api")

  return new BSE({ downloadFolder: "./.tmp-nse-bse", timeout: 30000 })
}

async function getBseQuote(symbol: string) {
  const bseSymbol = parseBseSymbol(symbol)

  if (!bseSymbol) {
    return null
  }

  const bse = await getBseClient()
  const quote = await bse.quote(bseSymbol.code)
  const price = numberValue(quote.LTP)
  const previousClose = numberValue(quote.PrevClose)
  const change = previousClose ? price - previousClose : 0

  return price > 0
    ? ({
        price,
        change,
        percentChange: previousClose ? (change / previousClose) * 100 : 0,
      } satisfies StockQuote)
    : null
}

async function getFinnhubQuote(symbol: string) {
  const quote = await fetchFinnhub<{ c?: number; d?: number; dp?: number }>(
    "/quote",
    { symbol: normalizeStockSymbol(symbol) }
  )

  return quote.c && quote.c > 0
    ? ({
        price: quote.c,
        change: quote.d ?? 0,
        percentChange: quote.dp ?? 0,
      } satisfies StockQuote)
    : null
}

export async function getStockQuote(symbol: string) {
  return parseBseSymbol(symbol) ? getBseQuote(symbol) : getFinnhubQuote(symbol)
}

export async function getStockProfile(symbol: string) {
  const bseSymbol = parseBseSymbol(symbol)

  if (bseSymbol) {
    return { name: bseSymbol.ticker, logo: "" } satisfies StockProfile
  }

  const profile = await fetchFinnhub<{ name?: string; logo?: string }>(
    "/stock/profile2",
    { symbol: normalizeStockSymbol(symbol) }
  )

  return {
    name: profile.name?.trim() || getDisplayStockSymbol(symbol),
    logo: profile.logo?.trim() || "",
  } satisfies StockProfile
}

function parseBseLookup(raw: string, limit: number) {
  return Array.from(
    raw.matchAll(
      /liclick\('(\d+)','([^']+)'\).*?<strong>([A-Z0-9]+)<\/strong>\s+[^<]*<br\s*\/?>/g
    )
  )
    .slice(0, limit)
    .map((match) => ({
      exchange: "BSE",
      name: match[2]?.trim() || match[3],
      percentChange: null,
      price: null,
      providerSymbol: encodeBseSymbol(match[1], match[3]),
      ticker: match[3],
      type: "Indian Stock",
    }))
}

async function searchBse(query: string, limit: number) {
  const bse = await getBseClient()
  const raw = await (
    bse as unknown as { lookup: (text: string) => Promise<string> }
  )
    .lookup(query)
    .catch(() => "")

  return parseBseLookup(raw, limit)
}

async function searchFinnhub(query: string, limit: number) {
  const data = await fetchFinnhub<FinnhubSearchResponse>("/search", {
    q: query,
  }).catch(() => ({ result: [] }))

  return (data.result ?? [])
    .map((stock) => {
      const providerSymbol = stock.symbol
        ? normalizeStockSymbol(stock.symbol)
        : ""
      const ticker = getDisplayStockSymbol(
        stock.displaySymbol || providerSymbol
      )

      return {
        exchange: stock.type ?? "",
        name: stock.description?.trim() || ticker,
        percentChange: null,
        price: null,
        providerSymbol,
        ticker,
        type: stock.type ?? "Stock",
      }
    })
    .filter((stock) => stock.providerSymbol && stock.ticker)
    .slice(0, limit)
}

export async function searchStocks(query: string, limit = 8) {
  const cleanedQuery = query.trim()

  if (cleanedQuery.length < 2) {
    return []
  }

  const stocks = [
    ...(await searchBse(cleanedQuery, limit).catch(() => [])),
    ...(await searchFinnhub(cleanedQuery, limit)),
  ]
  const uniqueStocks = stocks.filter(
    (stock, index) =>
      stocks.findIndex((item) => item.ticker === stock.ticker) === index
  )

  return Promise.all(
    uniqueStocks.slice(0, limit).map(async (stock) => {
      const quote = await getStockQuote(stock.providerSymbol).catch(() => null)

      return {
        ...stock,
        price: quote?.price ?? null,
        percentChange: quote?.percentChange ?? null,
      }
    })
  )
}
