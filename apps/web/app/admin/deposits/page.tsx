"use client"

import * as React from "react"

interface Investment {
  id: string
  userId: string
  userName: string
  userEmail: string
  userTelegram: string | null
  amount: number
  pool: string
  roi: number
  txHash: string | null
  network: string
  status: string
  createdAt: string
}

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-card border border-border rounded-lg ${className}`}>
      {children}
    </div>
  )
}

export default function DepositsPage() {
  const [investments, setInvestments] = React.useState<Investment[]>([])
  const [loading, setLoading] = React.useState(true)
  const [filter, setFilter] = React.useState("pending")
  const [processing, setProcessing] = React.useState<string | null>(null)

  React.useEffect(() => {
    fetchInvestments()
  }, [])

  const fetchInvestments = async () => {
    try {
      const res = await fetch('/api/admin/investments')
      if (res.ok) {
        const data = await res.json()
        setInvestments(data.investments || [])
      }
    } catch (error) {
      console.error('Failed to fetch investments:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (id: string) => {
    setProcessing(id)
    try {
      const res = await fetch(`/api/admin/investments/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ investmentId: id, action: 'approve' }),
      })
      
      if (res.ok) {
        setInvestments(investments.map(inv => 
          inv.id === id ? { ...inv, status: 'active' } : inv
        ))
      }
    } catch (error) {
      console.error('Failed to approve:', error)
    } finally {
      setProcessing(null)
    }
  }

  const handleReject = async (id: string) => {
    setProcessing(id)
    try {
      const res = await fetch(`/api/admin/investments/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ investmentId: id, action: 'reject' }),
      })
      
      if (res.ok) {
        setInvestments(investments.map(inv => 
          inv.id === id ? { ...inv, status: 'rejected' } : inv
        ))
      }
    } catch (error) {
      console.error('Failed to reject:', error)
    } finally {
      setProcessing(null)
    }
  }

  const filtered = investments.filter(d => filter === "all" || d.status === filter)

  const pendingCount = investments.filter(d => d.status === "pending").length
  const activeCount = investments.filter(d => d.status === "active").length

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  if (loading) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <div className="h-8 w-32 bg-muted animate-pulse rounded" />
        <div className="grid grid-cols-3 gap-3">
          {[1,2,3].map(i => (
            <div key={i} className="h-16 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-foreground">Deposits</h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">Approve or reject deposit requests</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Pending:</span>
          <span className="text-sm font-bold text-amber-500">{pendingCount}</span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="p-3 text-center">
          <div className="text-lg font-bold text-amber-500">{pendingCount}</div>
          <div className="text-[10px] text-muted-foreground">Pending</div>
        </Card>
        <Card className="p-3 text-center">
          <div className="text-lg font-bold text-emerald-500">{activeCount}</div>
          <div className="text-[10px] text-muted-foreground">Active</div>
        </Card>
        <Card className="p-3 text-center">
          <div className="text-lg font-bold text-foreground">{investments.length}</div>
          <div className="text-[10px] text-muted-foreground">Total</div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-3">
        <div className="flex gap-2 flex-wrap">
          {[
            { key: "pending", label: "Pending" },
            { key: "active", label: "Active" },
            { key: "rejected", label: "Rejected" },
            { key: "all", label: "All" },
          ].map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                filter === f.key
                  ? "bg-[oklch(0.55_0_150)] text-white"
                  : "bg-secondary text-muted-foreground hover:text-foreground"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </Card>

      {/* Deposits List */}
      <div className="space-y-3">
        {filtered.map((deposit) => (
          <Card key={deposit.id} className="p-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[oklch(0.55_0_150)/10] flex items-center justify-center text-sm font-bold text-[oklch(0.55_0_150)]">
                  {deposit.userName?.charAt(0).toUpperCase() || deposit.userEmail.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-foreground">{deposit.userName || deposit.userEmail}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                      deposit.status === "pending" ? "bg-amber-500/20 text-amber-500" :
                      deposit.status === "active" ? "bg-emerald-500/20 text-emerald-500" :
                      "bg-red-500/20 text-red-500"
                    }`}>
                      {deposit.status}
                    </span>
                  </div>
                  <div className="text-[10px] text-muted-foreground">{deposit.userEmail}</div>
                </div>
              </div>
              
              <div className="flex items-center justify-between sm:justify-end gap-4">
                <div className="text-right">
                  <div className="text-base font-bold text-foreground">${deposit.amount.toLocaleString()}</div>
                  <div className="text-[10px] text-muted-foreground">{deposit.pool === 'daily' ? '24H Pool' : 'Weekly Pool'} • {deposit.roi}x • {formatDate(deposit.createdAt)}</div>
                </div>
                
                {deposit.status === "pending" && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleApprove(deposit.id)}
                      disabled={processing === deposit.id}
                      className="px-3 py-1.5 text-xs font-medium bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors disabled:opacity-50"
                    >
                      {processing === deposit.id ? '...' : 'Approve'}
                    </button>
                    <button
                      onClick={() => handleReject(deposit.id)}
                      disabled={processing === deposit.id}
                      className="px-3 py-1.5 text-xs font-medium border border-red-500/30 text-red-400 rounded-lg hover:bg-red-500/10 transition-colors disabled:opacity-50"
                    >
                      {processing === deposit.id ? '...' : 'Reject'}
                    </button>
                  </div>
                )}
              </div>
            </div>
            
            {deposit.txHash && (
              <div className="mt-3 pt-3 border-t border-border/50">
                <div className="text-[10px] text-muted-foreground">
                  <span className="font-mono">TX: {deposit.txHash}</span>
                  {deposit.userTelegram && <span className="ml-2">• TG: {deposit.userTelegram}</span>}
                </div>
              </div>
            )}
          </Card>
        ))}
        
        {filtered.length === 0 && (
          <Card className="p-8 text-center">
            <div className="text-sm text-muted-foreground">No deposits found</div>
          </Card>
        )}
      </div>
    </div>
  )
}