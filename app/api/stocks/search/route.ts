import { NextResponse } from "next/server"

import { searchStocks } from "@/lib/stocks"

const RESULT_LIMIT = 8

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get("q")?.trim()

  if (!query || query.length < 2) {
    return NextResponse.json({ results: [] })
  }

  try {
    const results = await searchStocks(query, RESULT_LIMIT)

    return NextResponse.json({ results })
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Unable to search stocks.",
        results: [],
      },
      { status: 500 }
    )
  }
}
