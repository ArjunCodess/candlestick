import { FavouriteIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

import { getWatchlistedStocks } from "@/actions/watchlist"
import { StockSearch } from "@/components/stock-search"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { WatchlistCard } from "@/components/watchlist-card"

export default async function WatchlistPage() {
  const stocks = await getWatchlistedStocks()

  return (
    <div className="flex min-w-0 flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Watchlist</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {stocks.length} saved {stocks.length === 1 ? "stock" : "stocks"}
          </p>
        </div>
        <StockSearch className="w-full sm:w-auto" />
      </div>

      {stocks.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {stocks.map(({ symbol }) => (
            <WatchlistCard key={symbol} symbol={symbol} />
          ))}
        </div>
      ) : (
        <Empty className="border border-border">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <HugeiconsIcon icon={FavouriteIcon} strokeWidth={2} />
            </EmptyMedia>
            <EmptyTitle>No stocks yet</EmptyTitle>
            <EmptyDescription>
              Search for a stock and add it to your watchlist.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <StockSearch className="w-full justify-center sm:w-auto" />
          </EmptyContent>
        </Empty>
      )}
    </div>
  )
}
