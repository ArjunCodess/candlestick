"use client"

import * as React from "react"
import { usePathname, useRouter } from "next/navigation"
import { HugeiconsIcon } from "@hugeicons/react"
import { FavouriteIcon } from "@hugeicons/core-free-icons"

import { getWatchlistedSymbols, toggleWatchlist } from "@/actions/watchlist"
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
  const pathname = usePathname()
  const [open, setOpen] = React.useState(false)
  const [query, setQuery] = React.useState("")
  const [results, setResults] = React.useState<StockResult[]>([])
  const [watchlistedSymbols, setWatchlistedSymbols] = React.useState<string[]>(
    []
  )
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [pendingSymbol, setPendingSymbol] = React.useState<string | null>(null)
  const searchTimeoutRef = React.useRef<number | null>(null)
  const searchControllerRef = React.useRef<AbortController | null>(null)

  function openSearch() {
    onOpen?.()
    setOpen(true)
    void refreshWatchlist()
  }

  function updateOpen(nextOpen: boolean) {
    setOpen(nextOpen)

    if (!nextOpen) {
      resetSearch()
    } else {
      void refreshWatchlist()
    }
  }

  async function refreshWatchlist() {
    setWatchlistedSymbols(await getWatchlistedSymbols())
  }

  function resetSearch() {
    if (searchTimeoutRef.current) {
      window.clearTimeout(searchTimeoutRef.current)
    }

    searchControllerRef.current?.abort()
    setQuery("")
    setResults([])
    setLoading(false)
    setError(null)
  }

  function updateQuery(value: string) {
    const nextQuery = value.trim()

    setQuery(value)
    searchControllerRef.current?.abort()

    if (searchTimeoutRef.current) {
      window.clearTimeout(searchTimeoutRef.current)
    }

    if (nextQuery.length < 2) {
      setResults([])
      setLoading(false)
      setError(null)
      return
    }

    searchTimeoutRef.current = window.setTimeout(() => {
      void searchStocks(nextQuery)
    }, DEBOUNCE_MS)
  }

  async function searchStocks(nextQuery: string) {
    const controller = new AbortController()
    searchControllerRef.current = controller
    setLoading(true)
    setError(null)
    setResults([])

    try {
      const response = await fetch(
        `/api/stocks/search?q=${encodeURIComponent(nextQuery)}`,
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

  function selectStock(ticker: string) {
    setOpen(false)
    resetSearch()
    router.push(`/stock/${encodeURIComponent(ticker)}`)
  }

  function toggleStock(
    event: React.MouseEvent<HTMLButtonElement>,
    symbol: string
  ) {
    event.preventDefault()
    event.stopPropagation()

    const saved = watchlistedSymbols.includes(symbol)
    const nextSymbols = saved
      ? watchlistedSymbols.filter((savedSymbol) => savedSymbol !== symbol)
      : [...watchlistedSymbols, symbol]

    setWatchlistedSymbols(nextSymbols)
    setPendingSymbol(symbol)

    React.startTransition(async () => {
      try {
        await toggleWatchlist(symbol, !saved, pathname)
      } catch (error) {
        setWatchlistedSymbols(watchlistedSymbols)
        throw error
      } finally {
        setPendingSymbol(null)
      }
    })
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
        onOpenChange={updateOpen}
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
                  className="[&>svg:last-child]:hidden"
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
                  <Button
                    aria-label={
                      watchlistedSymbols.includes(stock.ticker)
                        ? `Remove ${stock.ticker} from watchlist`
                        : `Add ${stock.ticker} to watchlist`
                    }
                    className="ml-2"
                    disabled={pendingSymbol === stock.ticker}
                    onClick={(event) => toggleStock(event, stock.ticker)}
                    onPointerDown={(event) => event.stopPropagation()}
                    size="icon-sm"
                    variant="ghost"
                  >
                    <HugeiconsIcon
                      icon={FavouriteIcon}
                      strokeWidth={1.8}
                      className={cn(
                        "size-4",
                        watchlistedSymbols.includes(stock.ticker)
                          ? "fill-yellow-400 text-yellow-400 [&_path]:fill-current"
                          : "text-muted-foreground"
                      )}
                    />
                  </Button>
                </CommandItem>
              ))}
            </CommandGroup>
          )}
        </CommandList>
      </CommandDialog>
    </>
  )
}
