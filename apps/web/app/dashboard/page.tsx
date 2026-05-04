"use client"

import * as React from "react"
import Link from "next/link"
import { useAuth } from "@/app/providers/auth-provider"

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-card border border-border rounded-lg ${className}`}>
      {children}
    </div>
  )
}

function StatCard({ label, value, icon, change, positive }: { label: string; value: string; icon: string; change?: string; positive?: boolean }) {
  return (
    <Card className="p-3 sm:p-5">
      <div className="flex items-start justify-between mb-2 sm:mb-3">
        <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-lg bg-[oklch(0.55_0_150)/10] flex items-center justify-center">
          <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[oklch(0.55_0_150)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            {icon === "wallet" && <><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></>}
            {icon === "trending" && <><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></>}
            {icon === "clock" && <><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></>}
            {icon === "chart" && <><line x1="12" y1="20" x2="12" y2="10"/><line x1="18" y1="20" x2="18" y2="4"/><line x1="6" y1="20" x2="6" y2="16"/></>}
          </svg>
        </div>
        {change && (
          <span className={`text-[10px] sm:text-[11px] font-medium px-1.5 sm:px-2 py-0.5 rounded-full ${positive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
            {change}
          </span>
        )}
      </div>
      <div className="text-[11px] sm:text-[12px] text-muted-foreground mb-1 font-medium">{label}</div>
      <div className="text-lg sm:text-xl font-semibold text-foreground">{value}</div>
    </Card>
  )
}

function generateMarketData(startValue: number, targetValue: number, points: number = 48): number[] {
  const data: number[] = []
  const totalGain = targetValue - startValue
  const progressPerPoint = 1 / points
  
  let currentValue = startValue
  
  for (let i = 0; i < points; i++) {
    const expectedProgress = (i + 1) * progressPerPoint
    const expectedValue = startValue + (totalGain * expectedProgress)
    
    const volatility = totalGain * 0.12
    const randomWalk = (Math.random() - 0.5) * 2 * volatility
    
    const momentum = Math.sin((i / points) * Math.PI) * (totalGain * 0.08)
    
    currentValue = expectedValue + randomWalk + momentum
    currentValue = Math.max(startValue * 0.9, Math.min(targetValue * 1.05, currentValue))
    
    data.push(Math.round(currentValue * 100) / 100)
  }
  
  data[data.length - 1] = targetValue
  
  return data
}

const TIME_PERIODS = [
  { label: '1m', value: 1 },
  { label: '5m', value: 5 },
  { label: '15m', value: 15 },
  { label: '1H', value: 60 },
  { label: '4H', value: 240 },
]

interface UserStats {
  totalAssets: number
  totalInvested: number
  totalProfit: number
  pendingReturns: number
  activeCycles: {
    id: string
    pool: string
    startValue: number
    currentValue: number
    targetValue: number
    progress: number
    status: string
  }[]
  recentTransactions: {
    id: string
    type: string
    amount: number
    status: string
    createdAt: string
  }[]
}

export default function DashboardPage() {
  const { user } = useAuth()
  const [stats, setStats] = React.useState<UserStats | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [timePeriod, setTimePeriod] = React.useState(60)
  const [hoveredPoint, setHoveredPoint] = React.useState<{x: number; y: number; value: number; time: string} | null>(null)

  React.useEffect(() => {
    if (user) {
      fetchUserStats()
    }
  }, [user])

  const fetchUserStats = async () => {
    try {
      const res = await fetch('/api/user/stats')
      if (res.ok) {
        const data = await res.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const activeCycle = stats?.activeCycles?.[0]
  
  const hasActiveCycle = !!activeCycle
  
  const fullChartData = hasActiveCycle
    ? generateMarketData(activeCycle!.startValue, activeCycle!.targetValue, 48)
    : []
  
  const progress = activeCycle?.progress || 0
  const visiblePoints = hasActiveCycle 
    ? Math.max(1, Math.floor((progress / 100) * fullChartData.length))
    : 0
  const chartData = fullChartData.slice(0, visiblePoints)
  
  const currentDisplayValue = activeCycle?.currentValue || activeCycle?.startValue || 0
  
  const allValues = [...chartData, currentDisplayValue]
  const minValue = allValues.length > 0 ? Math.min(...allValues) * 0.98 : 0
  const maxValue = allValues.length > 0 ? Math.max(...allValues) * 1.02 : 1
  const valueRange = maxValue - minValue || 1

  const formatTime = (index: number) => {
    const hours = Math.floor(index * 0.5)
    return `${hours.toString().padStart(2, '0')}:00`
  }

  if (loading) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <div className="h-8 w-32 bg-muted animate-pulse rounded" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => (
            <div key={i} className="h-24 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-foreground">Dashboard</h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 sm:mt-1">Here's your portfolio overview.</p>
        </div>
        <Link 
          href="/dashboard/investments" 
          className="px-3 py-1.5 sm:px-4 sm:py-2 bg-[oklch(0.55_0_150)] text-white rounded-lg text-xs sm:text-sm font-medium hover:opacity-90 transition-all"
        >
          + Invest
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
        <StatCard 
          label="Total Assets" 
          value={`$${(stats?.totalAssets || 0).toLocaleString()}`} 
          icon="wallet" 
        />
        <StatCard 
          label="Invested" 
          value={`$${(stats?.totalInvested || 0).toLocaleString()}`} 
          icon="trending" 
        />
        <StatCard 
          label="Pending Returns" 
          value={`$${(stats?.pendingReturns || 0).toLocaleString()}`} 
          icon="clock" 
        />
        <StatCard 
          label="Total Profit" 
          value={`$${(stats?.totalProfit || 0).toLocaleString()}`} 
          icon="chart" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-8 space-y-6">
          {/* Active Cycle */}
          {activeCycle && (
            <Card className="p-4 sm:p-6 overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-r from-[oklch(0.55_0_150)/5] via-transparent to-[oklch(0.55_0_150)/10]" />
              <div className="relative">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 sm:gap-0 mb-4 sm:mb-6">
                  <div>
                    <div className="flex items-center gap-2 sm:gap-3 mb-1.5 sm:mb-2">
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 sm:px-2.5 sm:py-1 bg-[oklch(0.55_0_150)/15] text-[oklch(0.55_0_150)] rounded-full text-[10px] sm:text-xs font-medium">
                        <span className="w-1.5 h-1.5 bg-[oklch(0.55_0_150)] rounded-full animate-pulse" />
                        Active
                      </span>
                      <span className="text-[10px] sm:text-xs text-muted-foreground">
                        {activeCycle.pool === 'daily' ? '24H Pool' : 'Weekly Pool'}
                      </span>
                    </div>
                    <h2 className="text-base sm:text-lg font-semibold text-foreground">Cycle Progress</h2>
                  </div>
                  <div className="text-right sm:ml-4">
                    <div className="text-2xl sm:text-3xl font-bold text-foreground">${Math.round(activeCycle.currentValue).toLocaleString()}</div>
                    <div className="text-[10px] sm:text-xs text-muted-foreground">of ${Math.round(activeCycle.targetValue).toLocaleString()}</div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-8">
                  <div className="h-2 bg-[oklch(0.55_0_150)/20 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-[oklch(0.55_0_150)] rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(activeCycle.progress, 100)}%` }}
                    />
                  </div>
                  <div className="flex justify-between mt-2 text-[10px] sm:text-xs text-muted-foreground">
                    <span>Started</span>
                    <span>{Math.round(activeCycle.progress)}% Complete</span>
                    <span>Target</span>
                  </div>
                </div>

                {/* Start New Investment */}
                <div className="flex items-center justify-between">
                  <div className="text-xs text-muted-foreground">
                    ROI: <span className="text-[oklch(0.55_0_150)] font-medium">{activeCycle.pool === 'daily' ? '6.4x' : '8x'}</span>
                  </div>
                  <Link 
                    href="/dashboard/investments"
                    className="flex items-center gap-2 px-4 py-2 bg-[oklch(0.55_0_150)] text-white rounded-lg text-xs font-medium hover:opacity-90 transition-all"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                    </svg>
                    Start Investing
                  </Link>
                </div>
              </div>
            </Card>
          )}

          {/* Chart - TradingView Style */}
          <Card className="p-4 sm:p-6 overflow-hidden">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 sm:mb-6">
              <div className="flex items-center gap-3">
                <h3 className="text-sm sm:text-base font-semibold text-foreground">Portfolio Chart</h3>
                <span className="text-[10px] px-2 py-0.5 bg-[oklch(0.55_0_150)/12] text-[oklch(0.55_0_150)] rounded font-mono">USDT</span>
              </div>
              
              {/* Time Period Selector */}
              <div className="flex items-center gap-1 p-1 bg-secondary/50 rounded-lg">
                {TIME_PERIODS.map((period) => (
                  <button
                    key={period.value}
                    onClick={() => setTimePeriod(period.value)}
                    className={`px-2 sm:px-2.5 py-1 text-[10px] sm:text-xs font-mono rounded transition-all ${
                      timePeriod === period.value
                        ? 'bg-[oklch(0.55_0_150)] text-white'
                        : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                    }`}
                  >
                    {period.label}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Chart Area */}
            <div className="relative h-48 sm:h-64">
              {!hasActiveCycle ? (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <svg className="w-10 h-10 mx-auto mb-2 text-muted-foreground/50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M3 3v18h18"/>
                      <path d="M18 9l-5 5-4-4-3 3"/>
                    </svg>
                    <p className="text-sm text-muted-foreground">No active investment</p>
                    <Link href="/dashboard/investments" className="text-xs text-[oklch(0.55_0_150)] hover:underline mt-1 inline-block">
                      Start investing →
                    </Link>
                  </div>
                </div>
              ) : (
                <>
                  {/* Crosshair tooltip */}
                  {hoveredPoint && (
                    <div 
                      className="absolute z-10 px-2 py-1 bg-[oklch(0.21_0_0)] text-white text-[10px] sm:text-xs rounded pointer-events-none"
                      style={{ left: hoveredPoint.x, top: hoveredPoint.y - 30 }}
                    >
                      ${hoveredPoint.value.toLocaleString()} · {hoveredPoint.time}
                    </div>
                  )}
                  
                  <svg 
                    className="w-full h-full" 
                    viewBox="0 0 400 200" 
                    preserveAspectRatio="none"
                    onMouseLeave={() => setHoveredPoint(null)}
                  >
                    {/* Grid lines */}
                    {[0, 1, 2, 3, 4].map((i) => (
                      <line 
                        key={i}
                        x1="0" y1={40 * i} 
                        x2="300" y2={40 * i} 
                        stroke="oklch(0.3_0_0 / 0.1)" 
                        strokeWidth="1"
                        strokeDasharray="4,4"
                      />
                    ))}
                    
                    <defs>
                      <linearGradient id="tvAreaGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="oklch(0.55_0_150)" stopOpacity="0.4"/>
                        <stop offset="100%" stopColor="oklch(0.55_0_150)" stopOpacity="0"/>
                      </linearGradient>
                    </defs>
                    
                    {/* Area fill - only up to current progress */}
                    {chartData.length > 0 && (
                      <path
                        d={`M 0 200 ${chartData.map((d, i) => 
                          `${i === 0 ? '' : 'L '} ${(i / Math.max(1, chartData.length - 1)) * 300} ${200 - ((d - minValue) / valueRange * 180)}`
                        ).join(' ')} L ${(chartData.length / Math.max(1, chartData.length - 1)) * 300} 200 Z`}
                        fill="url(#tvAreaGrad)"
                      />
                    )}
                    
                    {/* Current value line */}
                    {chartData.length > 0 && (
                      <path
                        d={chartData.map((d, i) => 
                          `${i === 0 ? 'M' : 'L'} ${(i / Math.max(1, chartData.length - 1)) * 300} ${200 - ((d - minValue) / valueRange * 180)}`
                        ).join(' ')}
                        fill="none"
                        stroke="oklch(0.55_0_150)"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    )}
                    
                    {/* Future path (dashed) - from current to target */}
                    {hasActiveCycle && activeCycle && chartData.length > 0 && (
                      <line
                        x1={(chartData.length / Math.max(1, chartData.length - 1)) * 300}
                        y1={200 - ((currentDisplayValue - minValue) / valueRange * 180)}
                        x2={300}
                        y2={200 - ((activeCycle.targetValue - minValue) / valueRange * 180)}
                        stroke="oklch(0.55_0_150)"
                        strokeWidth="1.5"
                        strokeDasharray="6,4"
                        strokeOpacity="0.4"
                      />
                    )}
                    
                    {/* Current price dot - at actual current value */}
                    {hasActiveCycle && (
                      <circle 
                        cx={chartData.length > 0 ? (chartData.length / Math.max(1, chartData.length - 1)) * 300 : 0}
                        cy={200 - ((currentDisplayValue - minValue) / valueRange * 180)}
                        r="5"
                        fill="oklch(0.55_0_150)"
                        stroke="white"
                        strokeWidth="1.5"
                      />
                    )}
                    
                    {/* Interactive hover areas */}
                    {chartData.map((d, i) => {
                      const x = (i / Math.max(1, chartData.length - 1)) * 300
                      const y = 200 - ((d - minValue) / valueRange * 180)
                      return (
                        <circle
                          key={i}
                          cx={x}
                          cy={y}
                          r="15"
                          fill="transparent"
                          className="cursor-pointer"
                          onMouseEnter={() => setHoveredPoint({
                            x: Math.min(x, 260),
                            y: y,
                            value: d,
                            time: `${Math.round((i / chartData.length) * progress)}%`
                          })}
                        />
                      )
                    })}
                  </svg>
                  
                  {/* Y-axis labels - reduced to avoid overlap */}
                  <div className="absolute left-1 sm:left-2 top-0 h-full flex flex-col justify-between py-2 text-[10px] text-muted-foreground font-mono">
                    <span>${Math.round(maxValue)}</span>
                    <span>${Math.round(minValue)}</span>
                  </div>
                  
                  {/* X-axis labels - reduced to 3 */}
                  <div className="absolute bottom-0 left-0 flex justify-between px-4 text-[10px] text-muted-foreground font-mono" style={{ width: '300px' }}>
                    <span>Start</span>
                    <span>Mid</span>
                    <span>End</span>
                  </div>
                </>
              )}
            </div>
            
            {/* Chart Stats */}
            {activeCycle && (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-4 pt-4 border-t border-border">
                <div className="flex items-center gap-3 sm:gap-6">
                  <div>
                    <div className="text-[9px] sm:text-[10px] uppercase text-muted-foreground font-mono mb-0.5">Current</div>
                    <div className="text-base sm:text-xl font-bold text-foreground">${Math.round(activeCycle.currentValue).toLocaleString()}</div>
                  </div>
                  <div className="w-px h-6 sm:h-10 bg-border" />
                  <div>
                    <div className="text-[9px] sm:text-[10px] uppercase text-muted-foreground font-mono mb-0.5">Profit</div>
                    <div className="text-base sm:text-xl font-bold text-[oklch(0.55_0_150)]">+${Math.round(activeCycle.currentValue - activeCycle.startValue).toLocaleString()}</div>
                  </div>
                </div>
                <div className="text-left sm:text-right">
                  <div className="text-[9px] sm:text-[10px] uppercase text-muted-foreground font-mono mb-0.5">Payout</div>
                  <div className="text-base sm:text-xl font-bold text-foreground">${Math.round(activeCycle.targetValue).toLocaleString()}</div>
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* Right Sidebar */}
        <div className="lg:col-span-4 space-y-3 sm:space-y-4">
          {/* Quick Actions */}
          <Card className="p-4 sm:p-5">
            <h3 className="text-xs sm:text-sm font-semibold text-foreground mb-3 sm:mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <Link href="/dashboard/investments" className="flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 rounded-lg bg-[oklch(0.55_0_150)] text-white hover:opacity-90 transition-all group">
                <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
                <span className="text-xs sm:text-sm font-medium">Buy Crypto</span>
                <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 ml-auto opacity-60 group-hover:translate-x-1 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="9 18 15 12 9 6"/>
                </svg>
              </Link>
              <Link href="/dashboard/withdraw" className="flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 rounded-lg border border-border text-foreground hover:bg-secondary hover:border-[oklch(0.55_0_150)/30] transition-all group">
                <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/>
                </svg>
                <span className="text-xs sm:text-sm font-medium">Withdraw</span>
                <span className="ml-auto text-[9px] sm:text-[10px] text-muted-foreground">16.5% fee</span>
              </Link>
            </div>
          </Card>

          {/* Pool Options */}
          <Card className="p-4 sm:p-5">
            <h3 className="text-xs sm:text-sm font-semibold text-foreground mb-3 sm:mb-4">Pools</h3>
            <div className="space-y-2 sm:space-y-3">
              <Link href="/dashboard/investments" className="block p-3 sm:p-4 rounded-lg border border-border hover:border-[oklch(0.55_0_150)/40] hover:bg-secondary/50 transition-all group">
                <div className="flex items-center justify-between mb-1 sm:mb-2">
                  <span className="text-xs sm:text-sm font-medium text-foreground">24H Pool</span>
                  <span className="text-[10px] sm:text-xs font-mono text-[oklch(0.55_0_150)]">6.4x</span>
                </div>
                <p className="text-[10px] sm:text-xs text-muted-foreground">24 hours duration</p>
              </Link>
              <Link href="/dashboard/investments" className="block p-3 sm:p-4 rounded-lg border-2 border-[oklch(0.55_0_150)/30 bg-[oklch(0.55_0_150)/5] hover:bg-[oklch(0.55_0_150)/10 transition-all group relative">
                <div className="absolute -top-2 right-2 text-[9px] sm:text-[10px] font-medium px-1.5 sm:px-2 py-0.5 bg-[oklch(0.55_0_150)] text-white rounded">Popular</div>
                <div className="flex items-center justify-between mb-1 sm:mb-2">
                  <span className="text-xs sm:text-sm font-medium text-foreground">Weekly Pool</span>
                  <span className="text-[10px] sm:text-xs font-mono text-[oklch(0.55_0_150)]">8x</span>
                </div>
                <p className="text-[10px] sm:text-xs text-muted-foreground">7 days duration</p>
              </Link>
            </div>
          </Card>

          {/* Recent Activity */}
          <Card className="p-4 sm:p-5">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <h3 className="text-xs sm:text-sm font-semibold text-foreground">Recent</h3>
              <Link href="/dashboard/transactions" className="text-[10px] sm:text-xs text-muted-foreground hover:text-foreground">View All</Link>
            </div>
            <div className="space-y-3">
              {stats?.recentTransactions?.slice(0, 5).map((tx) => (
                <div key={tx.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                      tx.type === 'deposit' ? 'bg-emerald-500/20' : 'bg-red-500/20'
                    }`}>
                      <svg className={`w-3 h-3 ${tx.type === 'deposit' ? 'text-emerald-400' : 'text-red-400'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        {tx.type === 'deposit' 
                          ? <polyline points="20 6 9 17 4 12"/>
                          : <><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></>
                        }
                      </svg>
                    </div>
                    <div>
                      <div className="text-[11px] sm:text-xs text-foreground capitalize">{tx.type}</div>
                      <div className="text-[9px] sm:text-[10px] text-muted-foreground">{new Date(tx.createdAt).toLocaleDateString()}</div>
                    </div>
                  </div>
                  <span className={`text-[11px] sm:text-xs font-medium ${
                    tx.type === 'deposit' ? 'text-emerald-400' : 'text-red-400'
                  }`}>
                    {tx.type === 'deposit' ? '+' : '-'}${tx.amount.toLocaleString()}
                  </span>
                </div>
              ))}
              {(!stats?.recentTransactions || stats.recentTransactions.length === 0) && (
                <p className="text-[11px] text-muted-foreground text-center py-4">No recent transactions</p>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}