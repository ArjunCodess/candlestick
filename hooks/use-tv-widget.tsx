"use client"

import { useEffect, useMemo, useRef } from "react"

export type TradingViewWidgetConfig = Record<string, unknown>

type UseTvWidgetOptions = {
  scriptUrl: string
  config: TradingViewWidgetConfig
}

export function useTvWidget({ scriptUrl, config }: UseTvWidgetOptions) {
  const containerRef = useRef<HTMLDivElement>(null)
  const configString = useMemo(() => JSON.stringify(config), [config])

  useEffect(() => {
    const container = containerRef.current

    if (!container) {
      return
    }

    container.innerHTML = ""

    const widget = document.createElement("div")
    widget.className = "tradingview-widget-container__widget"
    container.appendChild(widget)

    const script = document.createElement("script")
    script.src = scriptUrl
    script.type = "text/javascript"
    script.async = true
    script.textContent = configString
    container.appendChild(script)

    return () => {
      container.innerHTML = ""
    }
  }, [configString, scriptUrl])

  return containerRef
}
