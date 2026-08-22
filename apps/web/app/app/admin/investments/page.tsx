"use client"

import * as React from "react"
import { Card, StatusPill, statusTone } from "@/components/ui"
import { Pagination } from "@/components/data-table"
import { useCachedFetch, invalidateCache } from "@/lib/use-cached-fetch"
import { PageHeader, StatGrid, FilterBar, Skeleton, Modal, inputCls, formatDate } from "../_components"

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
  cycle: { currentValue: number; targetValue: number; progress: number; status: string } | null
}

type Draft = { pool: "daily" | "weekly"; amount: string; roi: string; status: string; progress: string }

function draftFrom(inv: Investment): Draft {
  return {
    pool: inv.pool === "weekly" ? "weekly" : "daily",
    amount: String(inv.amount),
    roi: String(inv.roi),
    status: inv.status,
    progress: String(Math.round(inv.cycle?.progress ?? 0)),
  }
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
  const { data, loading, refreshing, refresh } = useCachedFetch<InvResponse>(key, { ttl: 60_000 })

  const [editing, setEditing] = React.useState<Investment | null>(null)
  const [draft, setDraft] = React.useState<Draft | null>(null)
  const [busy, setBusy] = React.useState(false)
  const [error, setError] = React.useState("")
  const [notice, setNotice] = React.useState("")

  const changeFilter = (f: Filter) => {
    setFilter(f)
    setPage(1)
  }

  const openEdit = (inv: Investment) => {
    setError("")
    setEditing(inv)
    setDraft(draftFrom(inv))
  }

  const amountNum = Number(draft?.amount) || 0
  const roiNum = Number(draft?.roi) || 0
  const targetPreview = Math.round(amountNum * roiNum)
  const progressNum = Math.max(0, Math.min(100, Number(draft?.progress) || 0))
  const currentPreview = Math.round(amountNum + (targetPreview - amountNum) * (progressNum / 100))

  const save = async () => {
    if (!editing || !draft) return
    setBusy(true)
    setError("")
    try {
      const res = await fetch(`/api/admin/investments/${editing.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          investmentId: editing.id,
          action: "update",
          pool: draft.pool,
          amount: amountNum,
          roi: roiNum,
          status: draft.status,
          progress: draft.status === "active" ? progressNum : undefined,
        }),
      })
      const json = await res.json()
      if (!res.ok) {
        setError(json.error || "Failed to update")
        return
      }
      invalidateCache("/api/admin/")
      await refresh()
      setNotice(
        `${editing.userName}: ${draft.pool === "daily" ? "48H" : "Weekly"} Pool · $${amountNum.toLocaleString()} at ${roiNum}x → target $${json.investment.targetValue.toLocaleString()}${
          draft.status === "completed" ? " · marked completed and paid out" : draft.status === "active" ? ` · ${Math.round(json.investment.progress)}% progress` : ` · ${draft.status}`
        }. The client's portfolio updates immediately.`
      )
      setEditing(null)
    } catch {
      setError("Network error. Please try again.")
    } finally {
      setBusy(false)
    }
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

      {notice && (
        <div className="flex items-start justify-between gap-3 rounded-lg border border-[var(--color-success)]/25 bg-[var(--bg-success)] p-3 text-xs text-foreground">
          <span>{notice}</span>
          <button onClick={() => setNotice("")} className="text-muted-foreground hover:text-foreground" aria-label="Dismiss">✕</button>
        </div>
      )}

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
                <th className="px-3 py-2.5 text-left font-mono text-[9px] uppercase text-muted-foreground">Progress</th>
                <th className="px-3 py-2.5 text-left font-mono text-[9px] uppercase text-muted-foreground">Status</th>
                <th className="px-3 py-2.5 text-left font-mono text-[9px] uppercase text-muted-foreground">Started</th>
                <th className="px-3 py-2.5 text-right font-mono text-[9px] uppercase text-muted-foreground">Actions</th>
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
                    {inv.cycle ? (
                      <div className="min-w-[90px]">
                        <div className="mb-1 flex justify-between text-[10px] tabular-nums text-muted-foreground">
                          <span>${Math.round(inv.cycle.currentValue).toLocaleString()}</span>
                          <span>{Math.round(inv.cycle.progress)}%</span>
                        </div>
                        <div className="h-1 overflow-hidden rounded-full bg-secondary">
                          <div className="h-full rounded-full bg-[var(--color-success)]" style={{ width: `${Math.min(100, inv.cycle.progress)}%` }} />
                        </div>
                      </div>
                    ) : (
                      <span className="text-[10px] text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="px-3 py-2.5">
                    <StatusPill tone={statusTone(inv.status)} className="capitalize">{inv.status}</StatusPill>
                  </td>
                  <td className="px-3 py-2.5 text-[10px] text-muted-foreground">{formatDate(inv.createdAt)}</td>
                  <td className="px-3 py-2.5 text-right">
                    <button
                      onClick={() => openEdit(inv)}
                      className="rounded-md border border-border px-2 py-1 text-[11px] font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                    >
                      Adjust
                    </button>
                  </td>
                </tr>
              ))}
              {data.investments.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-3 py-8 text-center text-sm text-muted-foreground">No investments found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Pagination page={data.page} pageCount={data.pageCount} onPageChange={setPage} total={data.total} start={start} end={end} className="mt-4" />

      <Modal open={!!editing && !!draft} onClose={() => !busy && setEditing(null)} title="Adjust plan">
        {editing && draft && (
          <div className="space-y-3">
            <p className="text-xs text-muted-foreground">
              <span className="font-medium text-foreground">{editing.userName}</span> · {editing.userEmail}
            </p>
            {error && <div className="rounded-lg border border-destructive/25 bg-[var(--bg-danger)] p-2.5 text-xs text-destructive">{error}</div>}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-foreground">Plan</label>
                <select
                  className={inputCls}
                  value={draft.pool}
                  onChange={(e) => {
                    const pool = e.target.value as Draft["pool"]
                    setDraft({ ...draft, pool })
                  }}
                >
                  <option value="daily">48H Pool</option>
                  <option value="weekly">Weekly Pool</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-foreground">Status</label>
                <select className={inputCls} value={draft.status} onChange={(e) => setDraft({ ...draft, status: e.target.value })}>
                  <option value="pending">Pending</option>
                  <option value="active">Active</option>
                  <option value="completed">Completed (pay out)</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-foreground">Principal (USD)</label>
                <input className={inputCls} type="number" min={1} step="any" value={draft.amount} onChange={(e) => setDraft({ ...draft, amount: e.target.value })} />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-foreground">Return multiplier (x)</label>
                <input className={inputCls} type="number" min={1} max={100} step="0.1" value={draft.roi} onChange={(e) => setDraft({ ...draft, roi: e.target.value })} />
              </div>
            </div>

            {draft.status === "active" && (
              <div>
                <div className="mb-1 flex items-center justify-between text-xs">
                  <label className="font-medium text-foreground">Cycle progress</label>
                  <span className="tabular-nums text-muted-foreground">
                    {progressNum}% · showing ${currentPreview.toLocaleString()} on the client's chart
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={1}
                  value={progressNum}
                  onChange={(e) => setDraft({ ...draft, progress: e.target.value })}
                  className="w-full accent-[var(--color-success)]"
                />
              </div>
            )}

            <div className="rounded-lg bg-secondary/50 p-3 text-xs">
              <div className="flex justify-between py-0.5"><span className="text-muted-foreground">Target return</span><span className="font-semibold tabular-nums text-[var(--color-success)]">${targetPreview.toLocaleString()}</span></div>
              <div className="flex justify-between py-0.5"><span className="text-muted-foreground">Client will see</span><span className="tabular-nums text-foreground">{draft.pool === "daily" ? "48H" : "Weekly"} Pool · {roiNum}x{draft.status === "active" ? ` · ${progressNum}% complete` : draft.status === "completed" ? " · completed, $" + targetPreview.toLocaleString() + " paid" : ` · ${draft.status}`}</span></div>
              {draft.status === "completed" && editing.status !== "completed" && (
                <p className="mt-2 text-[11px] text-[var(--color-warning)]">Marking completed records a ${targetPreview.toLocaleString()} return transaction and emails the client. This can't be undone from here.</p>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <button onClick={() => setEditing(null)} disabled={busy} className="rounded-lg border border-border px-3 py-2 text-xs font-medium text-muted-foreground hover:bg-secondary hover:text-foreground">Cancel</button>
              <button onClick={save} disabled={busy || amountNum <= 0 || roiNum < 1} className="rounded-lg bg-primary px-3 py-2 text-xs font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50">
                {busy ? "Saving…" : "Save changes"}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
