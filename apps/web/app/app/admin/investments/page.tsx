"use client"


import { Card, StatusPill, statusTone } from "@/components/ui"
import { usePagination, Pagination } from "@/components/data-table"
import * as React from "react"

const investments = [
  { id: "INV-001", user: "Alex M.", pool: "weekly", amount: 1000, roi: 8000, status: "active", progress: 45, daysLeft: 4, startDate: "Apr 25" },
  { id: "INV-002", user: "John D.", pool: "daily", amount: 500, roi: 3200, status: "active", progress: 78, daysLeft: 0, startDate: "Apr 28" },
  { id: "INV-003", user: "Sarah K.", pool: "weekly", amount: 2500, roi: 20000, status: "completed", progress: 100, daysLeft: 0, startDate: "Apr 15" },
  { id: "INV-004", user: "Mike R.", pool: "daily", amount: 750, roi: 4800, status: "completed", progress: 100, daysLeft: 0, startDate: "Apr 20" },
  { id: "INV-005", user: "Lisa M.", pool: "weekly", amount: 1500, roi: 12000, status: "active", progress: 20, daysLeft: 5, startDate: "Apr 24" },
]

export default function InvestmentsPage() {
  const [filter, setFilter] = React.useState("all")

  const filtered = investments.filter(inv => filter === "all" || inv.status === filter)

  const { pageItems, page, setPage, pageCount, total, start, end } = usePagination(filtered, 10)

  const activeCount = investments.filter(i => i.status === "active").length
  const completedCount = investments.filter(i => i.status === "completed").length

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-foreground">Investments</h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">Track all investment cycles</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground">Active:</span>
          <span className="text-sm font-bold text-emerald-600">{activeCount}</span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="p-3 text-center">
          <div className="text-lg font-bold text-emerald-600">{activeCount}</div>
          <div className="text-[10px] text-muted-foreground">Active</div>
        </Card>
        <Card className="p-3 text-center">
          <div className="text-lg font-bold text-foreground">{completedCount}</div>
          <div className="text-[10px] text-muted-foreground">Completed</div>
        </Card>
        <Card className="p-3 text-center">
          <div className="text-lg font-bold text-foreground">{investments.length}</div>
          <div className="text-[10px] text-muted-foreground">Total</div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-3">
        <div className="flex gap-2 flex-wrap">
          {["all", "active", "completed"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all capitalize ${
                filter === f
                  ? "bg-[oklch(0.21_0_0)] text-[oklch(1_0_180)]"
                  : "bg-secondary text-muted-foreground hover:text-foreground"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </Card>

      {/* Investments Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[500px]">
            <thead className="bg-secondary/50">
              <tr>
                <th className="px-3 py-2.5 text-left text-[9px] font-mono uppercase text-muted-foreground">User</th>
                <th className="px-3 py-2.5 text-left text-[9px] font-mono uppercase text-muted-foreground">Pool</th>
                <th className="px-3 py-2.5 text-right text-[9px] font-mono uppercase text-muted-foreground">Amount</th>
                <th className="px-3 py-2.5 text-right text-[9px] font-mono uppercase text-muted-foreground">Target</th>
                <th className="px-3 py-2.5 text-center text-[9px] font-mono uppercase text-muted-foreground">Progress</th>
                <th className="px-3 py-2.5 text-left text-[9px] font-mono uppercase text-muted-foreground">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {pageItems.map((inv) => (
                <tr key={inv.id} className="hover:bg-secondary/30">
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center text-[9px] font-bold text-foreground">
                        {inv.user.charAt(0)}
                      </div>
                      <span className="text-xs text-foreground">{inv.user}</span>
                    </div>
                  </td>
                  <td className="px-3 py-2.5">
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded ${
                      inv.pool === "weekly" ? "bg-purple-500/15 text-purple-600 dark:text-purple-400" : "bg-blue-500/15 text-blue-600 dark:text-blue-400"
                    }`}>
                      {inv.pool}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-right text-xs font-medium text-foreground">${inv.amount}</td>
                  <td className="px-3 py-2.5 text-right text-xs font-medium text-emerald-600">${inv.roi}</td>
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-[var(--color-success)] rounded-full"
                          style={{ width: `${inv.progress}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-muted-foreground w-8">{inv.progress}%</span>
                    </div>
                  </td>
                  <td className="px-3 py-2.5">
                    <StatusPill tone={statusTone(inv.status)} className="capitalize">{inv.status}</StatusPill>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Pagination page={page} pageCount={pageCount} onPageChange={setPage} total={total} start={start} end={end} className="mt-4" />
    </div>
  )
}