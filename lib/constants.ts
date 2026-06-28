import type { TradingViewWidgetConfig } from "@/hooks/use-tv-widget"

const tradingViewWidgetBaseUrl = "https://s3.tradingview.com/external-embedding"

const tradingViewWidgetHost = "https://www.tradingview.com"

const tradingViewDarkConfig = {
  colorTheme: "dark",
  isTransparent: false,
  locale: "en",
} satisfies TradingViewWidgetConfig

const tradingViewFullSizeConfig = {
  width: "100%",
  height: "100%",
} satisfies TradingViewWidgetConfig

function tradingViewWidgetScript(fileName: string) {
  return `${tradingViewWidgetBaseUrl}/${fileName}`
}

export function getDefaultMarketOverviewConfig() {
  return {
    colorTheme: "dark",
    dateRange: "12M",
    showChart: true,
    locale: "en",
    width: "100%",
    height: "100%",
    largeChartUrl: "",
    isTransparent: false,
    showSymbolLogo: true,
    showFloatingTooltip: false,
    plotLineColorGrowing: "rgba(41, 98, 255, 1)",
    plotLineColorFalling: "rgba(41, 98, 255, 1)",
    gridLineColor: "rgba(240, 243, 250, 0)",
    scaleFontColor: "rgba(120, 123, 134, 1)",
    belowLineFillColorGrowing: "rgba(41, 98, 255, 0.12)",
    belowLineFillColorFalling: "rgba(41, 98, 255, 0.12)",
    belowLineFillColorGrowingBottom: "rgba(41, 98, 255, 0)",
    belowLineFillColorFallingBottom: "rgba(41, 98, 255, 0)",
    symbolActiveColor: "rgba(41, 98, 255, 0.12)",
    tabs: [
      {
        title: "Stocks",
        symbols: [
          { s: "NASDAQ:AAPL", d: "Apple" },
          { s: "NASDAQ:MSFT", d: "Microsoft" },
          { s: "NASDAQ:NVDA", d: "NVIDIA" },
          { s: "NASDAQ:GOOGL", d: "Alphabet" },
          { s: "NASDAQ:AMZN", d: "Amazon" },
          { s: "NASDAQ:META", d: "Meta Platforms" },
          { s: "NYSE:BRK.B", d: "Berkshire Hathaway" },
          { s: "NYSE:LLY", d: "Eli Lilly" },
          { s: "NYSE:JPM", d: "JPMorgan Chase" },
          { s: "NASDAQ:TSLA", d: "Tesla" },
        ],
      },
      {
        title: "Forex",
        symbols: [
          { s: "FX:EURUSD", d: "EUR/USD" },
          { s: "FX:USDJPY", d: "USD/JPY" },
          { s: "FX:GBPUSD", d: "GBP/USD" },
          { s: "FX:AUDUSD", d: "AUD/USD" },
          { s: "FX:USDCAD", d: "USD/CAD" },
          { s: "FX:USDCHF", d: "USD/CHF" },
          { s: "FX:NZDUSD", d: "NZD/USD" },
          { s: "FX:EURGBP", d: "EUR/GBP" },
          { s: "FX:EURJPY", d: "EUR/JPY" },
          { s: "FX:GBPJPY", d: "GBP/JPY" },
        ],
      },
      {
        title: "Crypto",
        symbols: [
          { s: "BINANCE:BTCUSDT", d: "Bitcoin" },
          { s: "BINANCE:ETHUSDT", d: "Ethereum" },
          { s: "BINANCE:BNBUSDT", d: "BNB" },
          { s: "BINANCE:SOLUSDT", d: "Solana" },
          { s: "BINANCE:XRPUSDT", d: "XRP" },
          { s: "BINANCE:DOGEUSDT", d: "Dogecoin" },
          { s: "BINANCE:ADAUSDT", d: "Cardano" },
          { s: "BINANCE:AVAXUSDT", d: "Avalanche" },
          { s: "BINANCE:LINKUSDT", d: "Chainlink" },
          { s: "BINANCE:TRXUSDT", d: "TRON" },
        ],
      },
    ],
  } satisfies TradingViewWidgetConfig
}

export function getDefaultStockHeatmapConfig() {
  return {
    exchanges: [],
    dataSource: "SPX500",
    grouping: "sector",
    blockSize: "market_cap_basic",
    blockColor: "change",
    locale: "en",
    symbolUrl: "",
    colorTheme: "dark",
    hasTopBar: true,
    isDataSetEnabled: true,
    isZoomEnabled: true,
    hasSymbolTooltip: true,
    width: "100%",
    height: "100%",
  } satisfies TradingViewWidgetConfig
}

export function getDefaultTopStoriesConfig() {
  return {
    feedMode: "all_symbols",
    isTransparent: false,
    displayMode: "regular",
    width: "100%",
    height: "100%",
    colorTheme: "dark",
    locale: "en",
  } satisfies TradingViewWidgetConfig
}

export function getDefaultMarketDataConfig() {
  return {
    title: "Market Data",
    width: "100%",
    height: "100%",
    locale: "en",
    showSymbolLogo: true,
    colorTheme: "dark",
    isTransparent: false,
    symbolsGroups: [
      {
        name: "Indices",
        symbols: [
          { name: "FOREXCOM:SPXUSD", displayName: "S&P 500" },
          { name: "FOREXCOM:NSXUSD", displayName: "US 100" },
          { name: "FOREXCOM:DJI", displayName: "Dow 30" },
          { name: "INDEX:NKY", displayName: "Nikkei 225" },
          { name: "INDEX:DEU40", displayName: "DAX" },
          { name: "FOREXCOM:UKXGBP", displayName: "FTSE 100" },
        ],
      },
      {
        name: "Commodities",
        symbols: [
          { name: "CME_MINI:ES1!", displayName: "S&P 500 Futures" },
          { name: "CME:6E1!", displayName: "Euro Futures" },
          { name: "COMEX:GC1!", displayName: "Gold" },
          { name: "NYMEX:CL1!", displayName: "WTI Crude Oil" },
          { name: "NYMEX:NG1!", displayName: "Natural Gas" },
          { name: "CBOT:ZC1!", displayName: "Corn" },
        ],
      },
      {
        name: "Bonds",
        symbols: [
          { name: "CBOT:ZB1!", displayName: "T-Bond" },
          { name: "CBOT:UB1!", displayName: "Ultra T-Bond" },
          { name: "EUREX:FGBL1!", displayName: "Euro Bund" },
          { name: "EUREX:FBTP1!", displayName: "Euro BTP" },
          { name: "EUREX:FGBM1!", displayName: "Euro BOBL" },
          { name: "EUREX:FGBS1!", displayName: "Euro Schatz" },
        ],
      },
    ],
  } satisfies TradingViewWidgetConfig
}

export function getDefaultDashboardWidgets() {
  return [
    {
      title: "Market Overview",
      scriptUrl: tradingViewWidgetScript("embed-widget-market-overview.js"),
      config: getDefaultMarketOverviewConfig(),
    },
    {
      title: "Stock Heatmap",
      scriptUrl: tradingViewWidgetScript("embed-widget-stock-heatmap.js"),
      config: getDefaultStockHeatmapConfig(),
    },
    {
      title: "Top Stories",
      scriptUrl: tradingViewWidgetScript("embed-widget-timeline.js"),
      config: getDefaultTopStoriesConfig(),
    },
    {
      title: "Market Data",
      scriptUrl: tradingViewWidgetScript("embed-widget-market-quotes.js"),
      config: getDefaultMarketDataConfig(),
    },
  ]
}

export const widgets = getDefaultDashboardWidgets()

export function normalizeStockSymbol(symbol: string) {
  const normalizedSymbol = decodeURIComponent(symbol)
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9:._!|-]/g, "")

  return normalizedSymbol
}

function getTradingViewSymbol(symbol: string) {
  const normalizedSymbol = normalizeStockSymbol(symbol)

  if (normalizedSymbol.startsWith("BSE:")) {
    const [, , tradingSymbol = ""] =
      normalizedSymbol.match(/^BSE:([^|]+)\|?([^|]*)$/) ?? []

    return tradingSymbol ? `BSE:${tradingSymbol}` : normalizedSymbol
  }

  return normalizedSymbol
}

export function getStockWidgets(symbol: string) {
  const tvSymbol = getTradingViewSymbol(symbol)

  return {
    symbolInfo: {
      title: `${tvSymbol} Snapshot`,
      scriptUrl: tradingViewWidgetScript("embed-widget-symbol-info.js"),
      config: {
        ...tradingViewDarkConfig,
        symbol: tvSymbol,
        width: "100%",
      },
    },
    advancedChart: {
      title: `${tvSymbol} Advanced Chart`,
      scriptUrl: tradingViewWidgetScript("embed-widget-advanced-chart.js"),
      config: {
        autosize: true,
        symbol: tvSymbol,
        interval: "D",
        timezone: "Etc/UTC",
        theme: "dark",
        style: "1",
        locale: "en",
        enable_publishing: false,
        allow_symbol_change: true,
        calendar: false,
        support_host: tradingViewWidgetHost,
      },
    },
    fundamentalData: {
      title: "Fundamental Data",
      scriptUrl: tradingViewWidgetScript("embed-widget-financials.js"),
      config: {
        ...tradingViewDarkConfig,
        ...tradingViewFullSizeConfig,
        symbol: tvSymbol,
        largeChartUrl: "",
        displayMode: "regular",
      },
    },
    technicalAnalysis: {
      title: "Technical Analysis",
      scriptUrl: tradingViewWidgetScript("embed-widget-technical-analysis.js"),
      config: {
        ...tradingViewDarkConfig,
        ...tradingViewFullSizeConfig,
        interval: "1m",
        symbol: tvSymbol,
        showIntervalTabs: true,
        displayMode: "single",
      },
    },
    companyProfile: {
      title: "Company Profile",
      scriptUrl: tradingViewWidgetScript("embed-widget-symbol-profile.js"),
      config: {
        ...tradingViewDarkConfig,
        ...tradingViewFullSizeConfig,
        symbol: tvSymbol,
      },
    },
  }
}

export function getMiniChartWidget(symbol: string) {
  const tvSymbol = getTradingViewSymbol(symbol)

  return {
    title: tvSymbol,
    scriptUrl: tradingViewWidgetScript("embed-widget-mini-symbol-overview.js"),
    config: {
      ...tradingViewDarkConfig,
      ...tradingViewFullSizeConfig,
      symbol: tvSymbol,
      dateRange: "12M",
      noTimeScale: false,
      chartOnly: false,
      isTransparent: false,
      autosize: false,
      largeChartUrl: "",
    },
  }
}

export const navLinks = [
  {
    label: "Dashboard",
    href: "/dashboard",
  },
  {
    label: "Watchlist",
    href: "/watchlist",
  },
  {
    label: "Alerts",
    href: "/alert",
  },
]
