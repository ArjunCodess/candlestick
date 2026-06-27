import { normalizeStockSymbol } from "@/lib/constants"

export function parseBseSymbol(symbol: string) {
  const normalizedSymbol = normalizeStockSymbol(symbol)

  if (!normalizedSymbol.startsWith("BSE:")) {
    return null
  }

  const [, code = "", ticker = ""] =
    normalizedSymbol.match(/^BSE:([^|]+)\|?([^|]*)$/) ?? []

  if (!code) {
    return null
  }

  return { code, ticker }
}

export function encodeBseSymbol(code: string, ticker: string) {
  return normalizeStockSymbol(`BSE:${code}|${ticker}`)
}

export function getDisplayStockSymbol(symbol: string) {
  const bseSymbol = parseBseSymbol(symbol)

  if (bseSymbol?.ticker) {
    return bseSymbol.ticker
  }

  return normalizeStockSymbol(symbol).split(".")[0]
}
