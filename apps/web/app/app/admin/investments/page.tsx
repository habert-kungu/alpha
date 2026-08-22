"use client"

import * as React from "react"
import { Card, StatusPill, statusTone } from "@/components/ui"
import { Pagination } from "@/components/data-table"
import { useCachedFetch } from "@/lib/use-cached-fetch"
import { PageHeader, StatGrid, FilterBar, Skeleton, formatDate } from "../_components"

const PAGE_SIZE = 10
type Filter = "all" | "active" | "completed" | "pending" | "rejected"

interface Investment {
  id: string
  userName: string
  userEmail: string
  amount: number
  pool: string
  roi: number
  status: string
  txHash: string | null
  createdAt: string
}
interface InvResponse {
  investments: Investment[]
  total: number
  page: number
  pageCount: number
  stats: { all: number; pending: number; active: number; completed: number; rejected: number }
}

export default function InvestmentsPage() {
  const [filter, setFilter] = React.useState<Filter>("all")
  const [page, setPage] = React.useState(1)
  const key = `/api/admin/investments?page=${page}&pageSize=${PAGE_SIZE}&status=${filter}`
  const { data, loading, refreshing } = useCachedFetch<InvResponse>(key, { ttl: 60_000 })

  const changeFilter = (f: Filter) => {
    setFilter(f)
    setPage(1)
  }

  if (loading || !data) return <Skeleton rows={5} />

  const start = (data.page - 1) * PAGE_SIZE
  const end = Math.min(data.page * PAGE_SIZE, data.total)

  return (
    <div className="space-y-4 sm:space-y-6">
      <PageHeader
        title="Investments"
        subtitle="Track all investment cycles"
        right={
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            {refreshing && <span className="text-[11px]">Refreshing…</span>}
            <span>
              Active: <span className="text-sm font-bold text-[var(--color-success)]">{data.stats.active}</span>
            </span>
          </div>
        }
      />

      <StatGrid
        items={[
          { label: "Active", value: data.stats.active, className: "text-[var(--color-success)]" },
          { label: "Completed", value: data.stats.completed },
          { label: "Total", value: data.stats.all },
        ]}
      />

      <FilterBar
        value={filter}
        onChange={changeFilter}
        options={[
          { key: "all", label: "All" },
          { key: "active", label: "Active" },
          { key: "completed", label: "Completed" },
          { key: "pending", label: "Pending" },
          { key: "rejected", label: "Rejected" },
        ]}
      />

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <thead className="bg-secondary/50">
              <tr>
                <th className="px-3 py-2.5 text-left font-mono text-[9px] uppercase text-muted-foreground">User</th>
                <th className="px-3 py-2.5 text-left font-mono text-[9px] uppercase text-muted-foreground">Pool</th>
                <th className="px-3 py-2.5 text-right font-mono text-[9px] uppercase text-muted-foreground">Amount</th>
                <th className="px-3 py-2.5 text-right font-mono text-[9px] uppercase text-muted-foreground">Target</th>
                <th className="px-3 py-2.5 text-left font-mono text-[9px] uppercase text-muted-foreground">Status</th>
                <th className="px-3 py-2.5 text-left font-mono text-[9px] uppercase text-muted-foreground">Started</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {data.investments.map((inv) => (
                <tr key={inv.id} className="hover:bg-secondary/30">
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-2">
                      <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-secondary text-[9px] font-bold text-foreground">
                        {inv.userName.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="truncate text-xs text-foreground">{inv.userName}</div>
                        <div className="truncate text-[10px] text-muted-foreground">{inv.userEmail}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-2.5 text-xs text-foreground">
                    {inv.pool === "daily" ? "48H" : "Weekly"} <span className="text-[10px] text-muted-foreground">· {inv.roi}x</span>
                  </td>
                  <td className="px-3 py-2.5 text-right text-xs font-medium tabular-nums text-foreground">${inv.amount.toLocaleString()}</td>
                  <td className="px-3 py-2.5 text-right text-xs font-medium tabular-nums text-[var(--color-success)]">${Math.round(inv.amount * inv.roi).toLocaleString()}</td>
                  <td className="px-3 py-2.5">
                    <StatusPill tone={statusTone(inv.status)} className="capitalize">{inv.status}</StatusPill>
                  </td>
                  <td className="px-3 py-2.5 text-[10px] text-muted-foreground">{formatDate(inv.createdAt)}</td>
                </tr>
              ))}
              {data.investments.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-3 py-8 text-center text-sm text-muted-foreground">No investments found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Pagination page={data.page} pageCount={data.pageCount} onPageChange={setPage} total={data.total} start={start} end={end} className="mt-4" />
    </div>
  )
}
