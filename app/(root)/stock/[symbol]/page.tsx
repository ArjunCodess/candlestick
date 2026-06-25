import { TvWidget } from "@/components/tv-widget"
import WatchlistButton from "@/components/watchlist-button"
import { getStockWidgets, normalizeStockSymbol } from "@/lib/constants"

type StockPageProps = {
  params: Promise<{
    symbol: string
  }>
}

export default async function StockPage({ params }: StockPageProps) {
  const symbol = normalizeStockSymbol((await params).symbol)
  const widgets = getStockWidgets(symbol)

  return (
    <div className="grid min-h-screen gap-4 lg:grid-cols-4">
      <div className="flex min-w-0 flex-col gap-4 lg:col-span-3">
        <TvWidget {...widgets.symbolInfo} className="min-h-42" />
        <TvWidget {...widgets.advancedChart} className="flex-1" />
      </div>

      <aside className="flex min-w-0 flex-col gap-4">
        <WatchlistButton />
        <TvWidget {...widgets.technicalAnalysis} className="min-h-112" />
        <TvWidget {...widgets.fundamentalData} className="min-h-112" />
        <TvWidget {...widgets.companyProfile} className="min-h-112" />
      </aside>
    </div>
  )
}
