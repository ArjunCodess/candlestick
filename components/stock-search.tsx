"use client"

import * as React from "react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { cn } from "@/lib/utils"

type StockResult = {
  exchange: string
  industry: string
  name: string
  sector: string
  ticker: string
  type: string
}

type StockSearchProps = {
  className?: string
  onOpen?: () => void
}

const DEBOUNCE_MS = 350

export function StockSearch({ className, onOpen }: StockSearchProps) {
  const router = useRouter()
  const [open, setOpen] = React.useState(false)
  const [query, setQuery] = React.useState("")
  const [debouncedQuery, setDebouncedQuery] = React.useState("")
  const [results, setResults] = React.useState<StockResult[]>([])
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    const timeout = window.setTimeout(() => {
      setDebouncedQuery(query.trim())
    }, DEBOUNCE_MS)

    return () => window.clearTimeout(timeout)
  }, [query])

  React.useEffect(() => {
    if (!open) {
      return
    }

    if (debouncedQuery.length < 2) {
      return
    }

    const controller = new AbortController()

    async function searchStocks() {
      setLoading(true)
      setError(null)
      setResults([])

      try {
        const response = await fetch(
          `/api/stocks/search?q=${encodeURIComponent(debouncedQuery)}`,
          { signal: controller.signal }
        )
        const data = (await response.json()) as {
          error?: string
          results?: StockResult[]
        }

        if (!response.ok) {
          throw new Error(data.error ?? "Unable to search stocks.")
        }

        setResults(data.results ?? [])
      } catch (searchError) {
        if (
          searchError instanceof DOMException &&
          searchError.name === "AbortError"
        ) {
          return
        }

        setResults([])
        setError("Stock search is unavailable right now.")
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false)
        }
      }
    }

    searchStocks()

    return () => controller.abort()
  }, [debouncedQuery, open])

  function openSearch() {
    onOpen?.()
    setOpen(true)
  }

  function updateQuery(value: string) {
    setQuery(value)

    if (value.trim().length < 2) {
      setResults([])
      setLoading(false)
      setError(null)
    }
  }

  function selectStock(ticker: string) {
    setOpen(false)
    setQuery("")
    setDebouncedQuery("")
    setResults([])
    router.push(`/stock/${encodeURIComponent(ticker)}`)
  }

  return (
    <>
      <Button
        className={cn("justify-start px-6", className)}
        onClick={openSearch}
        size="sm"
        variant="ghost"
      >
        Search
      </Button>
      <CommandDialog
        title="Search Stocks"
        description="Search stocks by company name or ticker."
        open={open}
        onOpenChange={setOpen}
      >
        <CommandInput
          placeholder="Search stocks by name or ticker..."
          value={query}
          onValueChange={updateQuery}
        />
        <CommandList>
          {query.trim().length < 2 ? (
            <CommandEmpty>
              Type at least 2 characters to search stocks.
            </CommandEmpty>
          ) : loading ? (
            <CommandEmpty>Searching stocks...</CommandEmpty>
          ) : error ? (
            <CommandEmpty>{error}</CommandEmpty>
          ) : (
            <CommandEmpty>No stocks found.</CommandEmpty>
          )}
          {query.trim().length >= 2 && results.length > 0 && (
            <CommandGroup>
              {results.map((stock) => (
                <CommandItem
                  key={`${stock.exchange}-${stock.ticker}`}
                  value={`${stock.name} ${stock.ticker} ${stock.exchange}`}
                  onSelect={() => selectStock(stock.ticker)}
                >
                  <div className="flex min-w-0 flex-1 flex-col gap-2">
                    <div className="flex min-w-0 items-center justify-between gap-3">
                      <span className="truncate font-medium">{stock.name}</span>
                      <span className="shrink-0 font-semibold">
                        {stock.ticker}
                      </span>
                    </div>
                    <div className="flex min-w-0 items-center gap-3 text-xs text-muted-foreground">
                      <span className="truncate">{stock.exchange}</span>
                    </div>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          )}
        </CommandList>
      </CommandDialog>
    </>
  )
}
