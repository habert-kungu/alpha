"use client"

import * as React from "react"
import Link from "next/link"

const TOP_COINS = [
  { rank: 1, symbol: "BTC", name: "Bitcoin", price: "76,660.00", change: "-1.64%", marketCap: "$1.51T" },
  { rank: 2, symbol: "ETH", name: "Ethereum", price: "2,342.50", change: "+0.87%", marketCap: "$281B" },
  { rank: 3, symbol: "USDT", name: "Tether", price: "1.00", change: "+0.01%", marketCap: "$142B" },
  { rank: 4, symbol: "BNB", name: "BNB", price: "612.80", change: "+0.92%", marketCap: "$92B" },
  { rank: 5, symbol: "SOL", name: "Solana", price: "108.50", change: "+4.21%", marketCap: "$48B" },
]

const MARKET_OVERVIEW = [
  { label: "Total Market Cap", value: "$2.45T" },
  { label: "24h Volume", value: "$98.2B" },
  { label: "BTC Dominance", value: "52.4%" },
  { label: "Fear & Greed", value: "65", valueColor: "text-emerald-600", suffix: " (Greed)" },
]

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-card border border-border rounded-lg ${className}`}>
      {children}
    </div>
  )
}

function ChartContainer({ 
  title, 
  children, 
  action 
}: { 
  title: string
  children: React.ReactNode
  action?: React.ReactNode
}) {
  return (
    <Card className="overflow-hidden">
      <div className="px-3 sm:px-4 py-2.5 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-[10px] sm:text-xs font-medium text-foreground">{title}</h3>
          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
        </div>
        {action}
      </div>
      {children}
    </Card>
  )
}

function CustomChart({ symbol, height = 300 }: { symbol: string; height?: number }) {
  const [timeframe, setTimeframe] = React.useState("1H")
  const [isLoading, setIsLoading] = React.useState(true)

  const timeframes = ["1H", "4H", "1D", "1W"]

  React.useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1500)
    return () => clearTimeout(timer)
  }, [symbol])

  const intervalMap: Record<string, string> = {
    "1H": "15",
    "4H": "60",
    "1D": "D",
    "1W": "W",
  }

  return (
    <div className="relative">
      {/* Custom Controls - Integrated UI */}
      <div className="absolute top-2 left-2 z-10 flex gap-1">
        {timeframes.map((tf) => (
          <button
            key={tf}
            onClick={() => setTimeframe(tf)}
            className={`px-2 py-1 text-[9px] sm:text-[10px] font-medium rounded transition-all ${
              timeframe === tf
                ? "bg-[oklch(0.21_0_0)] text-[oklch(1_0_180)]"
                : "bg-white/80 text-muted-foreground hover:bg-white"
            }`}
          >
            {tf}
          </button>
        ))}
      </div>
      
      {isLoading && (
        <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-20">
          <div className="flex flex-col items-center gap-2">
            <div className="w-6 h-6 border-2 border-[oklch(0.21_0_0)] border-t-transparent rounded-full animate-spin" />
            <span className="text-[10px] text-muted-foreground">Loading chart...</span>
          </div>
        </div>
      )}
      
      <iframe
        src={`https://www.tradingview.com/widgetembed/?symbol=${symbol}&interval=${intervalMap[timeframe]}&theme=light&style=1&locale=en&toolbar_bg=f8f9fa&enable_publishing=false&allow_symbol_change=false&hide_side_toolbar=true&studies=MASimple@tv-basicstudies&show_popup_button=false&save_image=false&popup_width=1000&container_id=chart_${symbol}`}
        className="w-full"
        style={{ height }}
        frameBorder="0"
        allow="clipboard-write"
        title="Chart"
        onLoad={() => setIsLoading(false)}
      />
    </div>
  )
}

function CryptoScreener() {
  const [prices, setPrices] = React.useState<{symbol: string, price: string, change: number}[]>([])
  const [isLoading, setIsLoading] = React.useState(true)

  React.useEffect(() => {
    const fetchPrices = async () => {
      try {
        const res = await fetch('https://api.binance.com/api/v3/ticker/24hr?symbol=BTCUSDT&symbol=ETHUSDT&symbol=SOLUSDT&symbol=BNBUSDT&symbol=XRPUSDT&symbol=DOGEUSDT&symbol=ADAUSDT&symbol=AVAXUSDT')
        const data = await res.json()
        setPrices(data.map((d: any) => ({
          symbol: d.symbol.replace('USDT', ''),
          price: parseFloat(d.lastPrice).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: d.lastPrice < 1 ? 4 : 2 }),
          change: parseFloat(d.priceChangePercent)
        })))
      } catch (e) {
        setPrices([
          { symbol: 'BTC', price: '76,843', change: 1.2 },
          { symbol: 'ETH', price: '2,456', change: 2.1 },
          { symbol: 'SOL', price: '112.45', change: 3.8 },
          { symbol: 'BNB', price: '618.20', change: 0.5 },
          { symbol: 'XRP', price: '0.52', change: 1.4 },
        ])
      } finally {
        setIsLoading(false)
      }
    }
    fetchPrices()
    const interval = setInterval(fetchPrices, 30000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="relative">
      {isLoading && (
        <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10">
          <div className="flex flex-col items-center gap-2">
            <div className="w-6 h-6 border-2 border-[oklch(0.21_0_0)] border-t-transparent rounded-full animate-spin" />
            <span className="text-[10px] text-muted-foreground">Loading...</span>
          </div>
        </div>
      )}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-2">
        {prices.map((coin) => (
          <div key={coin.symbol} className="p-2 sm:p-3 bg-secondary/30 rounded-lg">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-bold text-foreground">{coin.symbol}</span>
              <span className={`text-[9px] font-semibold ${coin.change >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                {coin.change >= 0 ? '+' : ''}{coin.change.toFixed(2)}%
              </span>
            </div>
            <div className="text-[11px] sm:text-xs font-mono text-foreground">${coin.price}</div>
          </div>
        ))}
      </div>
      <div className="text-[9px] text-muted-foreground text-center mt-2">Live prices from Binance</div>
    </div>
  )
}

function ForexHeatMap() {
  return (
    <iframe
      src="https://s3.tradingview.com/external-embedding/embed-widget-forex-heat-map.js?pairs=EURUSD,GBPUSD,USDJPY,USDCHF,AUDUSD,USDCAD&theme=light&locale=en&isTransparent=true"
      className="w-full"
      style={{ height: 180 }}
      frameBorder="0"
      title="Forex Heat Map"
    />
  )
}

function TradingViewNews() {
  return (
    <iframe
      src="https://s3.tradingview.com/external-embedding/embed-widget-timeline.js?colorTheme=light&isTransparent=true&locale=en"
      className="w-full"
      style={{ height: 350 }}
      frameBorder="0"
      title="News"
    />
  )
}

export default function ExplorePage() {
  const [activeTab, setActiveTab] = React.useState("crypto")
  const [selectedForex, setSelectedForex] = React.useState("FX:EURUSD")
  const [selectedCrypto, setSelectedCrypto] = React.useState("BINANCE:BTCUSDT")

  const tabs = [
    { id: "crypto", label: "Crypto" },
    { id: "forex", label: "Forex" },
    { id: "news", label: "News" },
  ]

  const cryptoPairs = [
    { symbol: "BINANCE:BTCUSDT", label: "BTC" },
    { symbol: "BINANCE:ETHUSDT", label: "ETH" },
    { symbol: "BINANCE:SOLUSDT", label: "SOL" },
    { symbol: "BINANCE:BNBUSDT", label: "BNB" },
    { symbol: "BINANCE:XRPUSDT", label: "XRP" },
    { symbol: "BINANCE:DOGEUSDT", label: "DOGE" },
  ]

  const forexPairs = [
    { symbol: "FX:EURUSD", label: "EUR/USD" },
    { symbol: "FX:GBPUSD", label: "GBP/USD" },
    { symbol: "FX:USDJPY", label: "USD/JPY" },
    { symbol: "FX:USDCHF", label: "USD/CHF" },
    { symbol: "FX:AUDUSD", label: "AUD/USD" },
  ]

  const currentCryptoLabel = cryptoPairs.find(p => p.symbol === selectedCrypto)?.label || "BTC"
  const currentForexLabel = forexPairs.find(p => p.symbol === selectedForex)?.label || "EUR/USD"

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <div className="text-[10px] sm:text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Live Data</div>
          <h1 className="text-lg sm:text-xl font-semibold text-foreground">Explore Markets</h1>
        </div>
        <Link href="/dashboard" className="text-xs text-muted-foreground hover:text-foreground">
          ← Back
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1.5 flex-wrap">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-2.5 sm:px-3 py-1.5 text-[10px] sm:text-xs font-medium rounded-lg transition-all ${
              activeTab === tab.id
                ? "bg-[oklch(0.21_0_0)] text-[oklch(1_0_180)]"
                : "bg-secondary text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
          </button>
        ))}
        <div className="ml-auto flex items-center gap-1.5 px-2 py-1 bg-emerald-50 rounded-full">
          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
          <span className="text-[10px] font-medium text-emerald-700">Live</span>
        </div>
      </div>

      {/* Crypto Tab */}
      {activeTab === "crypto" && (
        <div className="space-y-3 sm:space-y-4">
          {/* Pair Selector */}
          <Card className="p-2.5">
            <div className="flex flex-wrap gap-1">
              {cryptoPairs.map((pair) => (
                <button
                  key={pair.symbol}
                  onClick={() => setSelectedCrypto(pair.symbol)}
                  className={`px-2.5 py-1.5 text-[10px] font-semibold rounded transition-all ${
                    selectedCrypto === pair.symbol
                      ? "bg-[oklch(0.21_0_0)] text-[oklch(1_0_180)]"
                      : "bg-secondary text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {pair.label}
                </button>
              ))}
            </div>
          </Card>

          {/* Main Chart */}
          <ChartContainer title={`${currentCryptoLabel}/USDT`}>
            <CustomChart symbol={selectedCrypto} height={240} />
          </ChartContainer>

          {/* Market Overview */}
          <ChartContainer title="Market Overview">
            <CryptoScreener />
          </ChartContainer>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
            {MARKET_OVERVIEW.map((item, i) => (
              <Card key={i} className="p-2.5">
                <div className="text-[9px] text-muted-foreground mb-0.5">{item.label}</div>
                <div className={`text-sm font-bold ${item.valueColor || 'text-foreground'}`}>
                  {item.value}{item.suffix}
                </div>
              </Card>
            ))}
          </div>

          {/* Price Table */}
          <ChartContainer title="Top Cryptocurrencies">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[350px]">
                <thead className="bg-secondary/50">
                  <tr>
                    <th className="px-3 py-2 text-left text-[9px] font-mono uppercase text-muted-foreground">#</th>
                    <th className="px-3 py-2 text-left text-[9px] font-mono uppercase text-muted-foreground">Name</th>
                    <th className="px-3 py-2 text-right text-[9px] font-mono uppercase text-muted-foreground">Price</th>
                    <th className="px-3 py-2 text-right text-[9px] font-mono uppercase text-muted-foreground">24h</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {TOP_COINS.map((coin) => (
                    <tr 
                      key={coin.rank} 
                      className="hover:bg-secondary/30 cursor-pointer"
                      onClick={() => setSelectedCrypto(`BINANCE:${coin.symbol}USDT`)}
                    >
                      <td className="px-3 py-2.5 text-[10px] text-muted-foreground">{coin.rank}</td>
                      <td className="px-3 py-2.5">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center text-[9px] font-bold text-foreground">
                            {coin.symbol.slice(0,2)}
                          </div>
                          <span className="text-[10px] font-medium text-foreground">{coin.name}</span>
                        </div>
                      </td>
                      <td className="px-3 py-2.5 text-right text-[10px] font-medium text-foreground">${coin.price}</td>
                      <td className={`px-3 py-2.5 text-right text-[10px] font-semibold ${coin.change.startsWith('+') ? 'text-emerald-600' : 'text-red-600'}`}>
                        {coin.change}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </ChartContainer>
        </div>
      )}

      {/* Forex Tab */}
      {activeTab === "forex" && (
        <div className="space-y-3 sm:space-y-4">
          {/* Pair Selector */}
          <Card className="p-2.5">
            <div className="flex flex-wrap gap-1">
              {forexPairs.map((pair) => (
                <button
                  key={pair.symbol}
                  onClick={() => setSelectedForex(pair.symbol)}
                  className={`px-2.5 py-1.5 text-[10px] font-semibold rounded transition-all ${
                    selectedForex === pair.symbol
                      ? "bg-[oklch(0.21_0_0)] text-[oklch(1_0_180)]"
                      : "bg-secondary text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {pair.label}
                </button>
              ))}
            </div>
          </Card>

          {/* Main Chart */}
          <ChartContainer title={currentForexLabel}>
            <CustomChart symbol={selectedForex} height={240} />
          </ChartContainer>

          {/* Heat Map */}
          <ChartContainer title="Market Overview">
            <ForexHeatMap />
          </ChartContainer>
        </div>
      )}

      {/* News Tab */}
      {activeTab === "news" && (
        <ChartContainer title="Latest News">
          <TradingViewNews />
        </ChartContainer>
      )}

      {/* Info */}
      <div className="p-2.5 bg-blue-50 border border-blue-100 rounded-lg">
        <p className="text-[10px] text-blue-700">
          <span className="font-medium">Note:</span> Positions closed 30 mins before high-impact events. Capital protected.
        </p>
      </div>
    </div>
  )
}