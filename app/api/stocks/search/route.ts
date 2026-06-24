import { NextResponse } from "next/server"

type FinnhubSymbol = {
  description?: string
  displaySymbol?: string
  symbol?: string
  type?: string
}

type FinnhubCompanyProfile = {
  exchange?: string
  finnhubIndustry?: string
  name?: string
  ticker?: string
}

type StockSearchResult = {
  exchange: string
  industry: string
  name: string
  sector: string
  ticker: string
  type: string
}

async function getCompanyProfile(symbol: string, token: string) {
  const profileUrl = new URL("https://finnhub.io/api/v1/stock/profile2")
  profileUrl.searchParams.set("symbol", symbol)

  const response = await fetch(profileUrl, {
    headers: {
      Accept: "application/json",
      "X-Finnhub-Token": token,
    },
    next: { revalidate: 60 * 60 },
  })

  if (!response.ok) {
    return null
  }

  const profile = (await response.json()) as FinnhubCompanyProfile

  if (!profile.ticker && !profile.name && !profile.exchange) {
    return null
  }

  return profile
}

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

  const finnhubUrl = new URL("https://finnhub.io/api/v1/search")
  finnhubUrl.searchParams.set("q", query)

  try {
    const response = await fetch(finnhubUrl, {
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
    const stocks = (data.result ?? [])
      .filter((stock) => {
        return stock.symbol && stock.description
      })
      .slice(0, 6)

    const results = await Promise.all(
      stocks.map(async (stock) => {
        const symbol = stock.symbol ?? ""
        const profile = await getCompanyProfile(symbol, token)

        return {
          exchange:
            profile?.exchange ??
            (stock.displaySymbol === stock.symbol
              ? "Exchange unavailable"
              : (stock.displaySymbol ?? "Exchange unavailable")),
          industry: profile?.finnhubIndustry ?? "",
          name: profile?.name ?? stock.description ?? symbol,
          sector: "",
          ticker: symbol,
          type: stock.type ?? "Stock",
        } satisfies StockSearchResult
      })
    )

    return NextResponse.json({ results })
  } catch {
    return NextResponse.json(
      { error: "Unable to search stocks.", results: [] },
      { status: 502 }
    )
  }
}
