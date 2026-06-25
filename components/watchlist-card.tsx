"use client"

import { useRouter } from "next/navigation"

import { TvWidget } from "@/components/tv-widget"
import { getMiniChartWidget } from "@/lib/constants"

type WatchlistCardProps = {
  symbol: string
}

export function WatchlistCard({ symbol }: WatchlistCardProps) {
  const router = useRouter()
  const href = `/stock/${encodeURIComponent(symbol)}`

  function openStock() {
    router.push(href)
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault()
      openStock()
    }
  }

  return (
    <div
      aria-label={`Open ${symbol}`}
      className="flex min-h-64 cursor-pointer"
      onClick={openStock}
      onKeyDown={onKeyDown}
      role="link"
      tabIndex={0}
    >
      <TvWidget
        {...getMiniChartWidget(symbol)}
        className="pointer-events-none min-h-64 flex-1"
      />
    </div>
  )
}
