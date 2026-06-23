"use client"

import { cn } from "@/lib/utils"
import {
  type TradingViewWidgetConfig,
  useTvWidget,
} from "@/hooks/use-tv-widget"

type TvWidgetProps = {
  title: string
  scriptUrl: string
  config: TradingViewWidgetConfig
  className?: string
}

export function TvWidget({
  title,
  scriptUrl,
  config,
  className,
}: TvWidgetProps) {
  const containerRef = useTvWidget({ scriptUrl, config })

  return (
    <section
      aria-label={title}
      className={cn(
        "flex min-h-130 flex-col overflow-hidden rounded-lg border border-border bg-card text-card-foreground",
        className
      )}
    >
      <div className="border-b border-border px-4 py-3">
        <h2 className="text-sm font-semibold text-foreground">{title}</h2>
      </div>
      <div ref={containerRef} className="min-h-0 flex-1" />
    </section>
  )
}
