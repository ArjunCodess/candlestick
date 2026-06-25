import { getWatchlistedStocks } from "@/actions/watchlist"
import { StockSearch } from "@/components/stock-search"
import { TvWidget } from "@/components/tv-widget"
import { getMiniChartWidget } from "@/lib/constants"

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
            <TvWidget
              key={symbol}
              {...getMiniChartWidget(symbol)}
              className="min-h-64"
            />
          ))}
        </div>
      ) : (
        <div className="border border-border px-4 py-10 text-sm text-muted-foreground">
          Search for a stock, open its page, and add it to your watchlist.
        </div>
      )}
    </div>
  )
}
