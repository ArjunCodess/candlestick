import {
  getDefaultDashboardWidgets,
  getDefaultMarketDataConfig,
  getDefaultMarketOverviewConfig,
  getDefaultStockHeatmapConfig,
} from "@/lib/constants"
import {
  type DashboardSettings,
  normalizeDashboardSettings,
} from "@/lib/dashboard-settings"

export function getDashboardWidgets(settings?: Partial<DashboardSettings> | null) {
  const normalizedSettings = normalizeDashboardSettings(settings)
  const widgets = getDefaultDashboardWidgets()

  return widgets.map((widget) => {
    if (widget.title === "Market Overview") {
      return {
        ...widget,
        config: {
          ...getDefaultMarketOverviewConfig(),
          dateRange: normalizedSettings.marketOverview.dateRange,
          tabs: normalizedSettings.marketOverview.tabs,
        },
      }
    }

    if (widget.title === "Stock Heatmap") {
      return {
        ...widget,
        config: {
          ...getDefaultStockHeatmapConfig(),
          dataSource: normalizedSettings.stockHeatmap.dataSource,
          grouping: normalizedSettings.stockHeatmap.grouping,
        },
      }
    }

    if (widget.title === "Market Data") {
      return {
        ...widget,
        config: {
          ...getDefaultMarketDataConfig(),
          symbolsGroups: normalizedSettings.marketData.symbolsGroups,
        },
      }
    }

    return widget
  })
}
