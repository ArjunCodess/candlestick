import {
  getDefaultMarketDataConfig,
  getDefaultMarketOverviewConfig,
  getDefaultStockHeatmapConfig,
} from "@/lib/constants"

export const dashboardWidgetIds = [
  "marketOverview",
  "stockHeatmap",
  "topStories",
  "marketData",
] as const

export type DashboardWidgetId = (typeof dashboardWidgetIds)[number]
export type DashboardEnabledWidgets = Record<DashboardWidgetId, boolean>

export type MarketOverviewDateRange = "1D" | "1M" | "3M" | "12M" | "60M" | "ALL"

export type MarketOverviewSymbol = {
  s: string
  d: string
}

export type MarketOverviewTab = {
  title: string
  symbols: MarketOverviewSymbol[]
}

export type StockHeatmapGrouping = "sector" | "no_group"

export type MarketDataSymbol = {
  name: string
  displayName: string
}

export type MarketDataGroup = {
  name: string
  symbols: MarketDataSymbol[]
}

export type DashboardSettings = {
  enabledWidgets: DashboardEnabledWidgets
  marketOverview: {
    dateRange: MarketOverviewDateRange
    tabs: MarketOverviewTab[]
  }
  stockHeatmap: {
    dataSource: string
    grouping: StockHeatmapGrouping
  }
  marketData: {
    symbolsGroups: MarketDataGroup[]
  }
}

const dateRanges = ["1D", "1M", "3M", "12M", "60M", "ALL"]
const heatmapGroupings = ["sector", "no_group"]

export function getDefaultDashboardSettings(): DashboardSettings {
  const marketOverview = getDefaultMarketOverviewConfig()
  const stockHeatmap = getDefaultStockHeatmapConfig()
  const marketData = getDefaultMarketDataConfig()

  return {
    enabledWidgets: {
      marketOverview: true,
      stockHeatmap: true,
      topStories: true,
      marketData: true,
    },
    marketOverview: {
      dateRange: marketOverview.dateRange as MarketOverviewDateRange,
      tabs: marketOverview.tabs,
    },
    stockHeatmap: {
      dataSource: String(stockHeatmap.dataSource),
      grouping: stockHeatmap.grouping as StockHeatmapGrouping,
    },
    marketData: {
      symbolsGroups: marketData.symbolsGroups,
    },
  }
}

export function normalizeDashboardSettings(
  settings?: Partial<DashboardSettings> | null
): DashboardSettings {
  const defaults = getDefaultDashboardSettings()

  return {
    enabledWidgets: {
      ...defaults.enabledWidgets,
      ...settings?.enabledWidgets,
    },
    marketOverview: {
      dateRange:
        settings?.marketOverview?.dateRange &&
        dateRanges.includes(settings.marketOverview.dateRange)
          ? settings.marketOverview.dateRange
          : defaults.marketOverview.dateRange,
      tabs: settings?.marketOverview?.tabs?.length
        ? settings.marketOverview.tabs
        : defaults.marketOverview.tabs,
    },
    stockHeatmap: {
      dataSource:
        settings?.stockHeatmap?.dataSource || defaults.stockHeatmap.dataSource,
      grouping:
        settings?.stockHeatmap?.grouping &&
        heatmapGroupings.includes(settings.stockHeatmap.grouping)
          ? settings.stockHeatmap.grouping
          : defaults.stockHeatmap.grouping,
    },
    marketData: {
      symbolsGroups: settings?.marketData?.symbolsGroups?.length
        ? settings.marketData.symbolsGroups
        : defaults.marketData.symbolsGroups,
    },
  }
}
