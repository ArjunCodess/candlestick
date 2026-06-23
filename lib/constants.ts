const marketOverviewConfig = {
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
}

const stockHeatmapConfig = {
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
}

const topStoriesConfig = {
  feedMode: "market",
  market: "stock",
  isTransparent: false,
  displayMode: "regular",
  width: "100%",
  height: "100%",
  colorTheme: "dark",
  locale: "en",
}

const marketDataConfig = {
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
}

export const widgets = [
  {
    title: "Market Overview",
    scriptUrl:
      "https://s3.tradingview.com/external-embedding/embed-widget-market-overview.js",
    config: marketOverviewConfig,
  },
  {
    title: "Stock Heatmap",
    scriptUrl:
      "https://s3.tradingview.com/external-embedding/embed-widget-stock-heatmap.js",
    config: stockHeatmapConfig,
  },
  {
    title: "Top Stories",
    scriptUrl:
      "https://s3.tradingview.com/external-embedding/embed-widget-timeline.js",
    config: topStoriesConfig,
  },
  {
    title: "Market Data",
    scriptUrl:
      "https://s3.tradingview.com/external-embedding/embed-widget-market-quotes.js",
    config: marketDataConfig,
  },
]
