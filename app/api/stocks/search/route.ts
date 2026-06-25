import { NextResponse } from "next/server"

type FinnhubSymbol = {
  description?: string
  displaySymbol?: string
  symbol?: string
  type?: string
}

const RESULT_LIMIT = 8

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get("q")?.trim()
  const token = process.env.FINNHUB_API_KEY ?? process.env.FINNHUB_TOKEN

  if (!query || query.length < 2) {
    return NextResponse.json({ results: [] })
  }

  if (!token) {
    return NextResponse.json(
      { error: "Finnhub API key is not configured.", results: [] },
      { status: 500 }
    )
  }

  const url = new URL("https://finnhub.io/api/v1/search")
  url.searchParams.set("q", query)

  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
      "X-Finnhub-Token": token,
    },
    next: { revalidate: 60 },
  })

  if (!response.ok) {
    return NextResponse.json(
      { error: "Unable to search stocks.", results: [] },
      { status: 502 }
    )
  }

  const data = (await response.json()) as { result?: FinnhubSymbol[] }
  const seenTickers = new Set<string>()
  const results = []

  for (const stock of data.result ?? []) {
    if (!stock.symbol) {
      continue
    }

    const ticker = (stock.symbol ?? stock.displaySymbol ?? "").split(".")[0]

    if (seenTickers.has(ticker)) {
      continue
    }

    seenTickers.add(ticker)
    results.push({
      exchange: stock.type ?? "",
      industry: "",
      name: stock.description ?? ticker,
      sector: "",
      ticker,
      type: stock.type ?? "",
    })

    if (results.length === RESULT_LIMIT) {
      break
    }
  }

  return NextResponse.json({ results })
}
