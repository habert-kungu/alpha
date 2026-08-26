"use client"

import * as React from "react"
import { Card, StatusPill, statusTone } from "@/components/ui"
import { Pagination } from "@/components/data-table"
import { useCachedFetch, invalidateCache } from "@/lib/use-cached-fetch"
import { PageHeader, StatGrid, FilterBar, Skeleton, Modal, InvestorLink, KV, formatDate, inputCls } from "../_components"

const PAGE_SIZE = 12
type Filter = "all" | "deposit" | "investment" | "return" | "withdrawal"

interface Tx {
  id: string
  userId: string
  user: string
  userEmail: string
  type: string
  amount: number
  fee: number
  net: number
  status: string
  note: string | null
  createdAt: string
}
interface TxResponse {
  transactions: Tx[]
  total: number
  page: number
  pageCount: number
  stats: { deposits: number; returns: number; withdrawals: number }
}

const TYPE_STYLE: Record<string, string> = {
  deposit: "bg-[var(--bg-success)] text-[var(--color-success)]",
  investment: "bg-[var(--bg-success)] text-[var(--color-success)]",
  return: "bg-[var(--bg-info)] text-[var(--color-info)]",
  withdrawal: "bg-[var(--bg-danger)] text-destructive",
}

export default function TransactionsPage() {
  const [filter, setFilter] = React.useState<Filter>("all")
  const [page, setPage] = React.useState(1)
  const key = `/api/admin/transactions?page=${page}&pageSize=${PAGE_SIZE}&type=${filter}`
  const { data, loading, refreshing, refresh } = useCachedFetch<TxResponse>(key, { ttl: 60_000 })

  const [settling, setSettling] = React.useState<{ tx: Tx; action: "completed" | "rejected" } | null>(null)
  const [txHash, setTxHash] = React.useState("")
  const [busy, setBusy] = React.useState(false)
  const [error, setError] = React.useState("")
  const [notice, setNotice] = React.useState("")

  const changeFilter = (f: Filter) => {
    setFilter(f)
    setPage(1)
  }

  /** A pending withdrawal is holding the investor's funds until it is settled. */
  const isPendingWithdrawal = (tx: Tx) => tx.type === "withdrawal" && tx.status !== "completed" && tx.status !== "rejected"

  const settle = async () => {
    if (!settling) return
    setBusy(true)
    setError("")
    try {
      const res = await fetch(`/api/admin/transactions/${settling.tx.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: settling.action, txHash }),
      })
      const json = await res.json()
      if (!res.ok) {
        setError(json.error || "Couldn't settle this withdrawal")
        return
      }
      setNotice(
        settling.action === "completed"
          ? `Marked $${settling.tx.amount.toLocaleString()} as paid to ${settling.tx.user}.`
          : `Rejected $${settling.tx.amount.toLocaleString()} — the amount is back in ${settling.tx.user}'s balance.`
      )
      setSettling(null)
      setTxHash("")
      invalidateCache("/api/admin/")
      await refresh()
    } finally {
      setBusy(false)
    }
  }

  const settleButtons = (tx: Tx) =>
    isPendingWithdrawal(tx) ? (
      <div className="flex items-center gap-1.5">
        <button
          onClick={() => { setError(""); setTxHash(""); setSettling({ tx, action: "completed" }) }}
          className="rounded-lg bg-foreground px-2 py-1 text-[10px] font-medium text-background hover:opacity-90"
        >
          Mark paid
        </button>
        <button
          onClick={() => { setError(""); setTxHash(""); setSettling({ tx, action: "rejected" }) }}
          className="rounded-lg border border-border px-2 py-1 text-[10px] font-medium text-muted-foreground hover:bg-secondary hover:text-foreground"
        >
          Reject
        </button>
      </div>
    ) : null

  if (loading || !data) return <Skeleton rows={6} />

  const start = (data.page - 1) * PAGE_SIZE
  const end = Math.min(data.page * PAGE_SIZE, data.total)

  return (
    <div className="space-y-4 sm:space-y-6">
      <PageHeader title="Transactions" subtitle="All platform transactions" right={refreshing ? <span className="text-[11px] text-muted-foreground">Refreshing…</span> : undefined} />

      {notice && (
        <div className="flex items-start justify-between gap-3 rounded-lg border border-[var(--color-success)]/25 bg-[var(--bg-success)] p-3 text-xs text-foreground">
          <span>{notice}</span>
          <button onClick={() => setNotice("")} className="text-muted-foreground hover:text-foreground" aria-label="Dismiss">✕</button>
        </div>
      )}

      <StatGrid
        items={[
          { label: "Deposits", value: `$${data.stats.deposits.toLocaleString()}` },
          { label: "Returns", value: `+$${data.stats.returns.toLocaleString()}`, className: "text-[var(--color-success)]" },
          { label: "Withdrawn", value: `-$${data.stats.withdrawals.toLocaleString()}`, className: "text-destructive" },
        ]}
      />

      <FilterBar
        value={filter}
        onChange={changeFilter}
        options={[
          { key: "all", label: "All" },
          { key: "investment", label: "Investments" },
          { key: "deposit", label: "Deposits" },
          { key: "return", label: "Returns" },
          { key: "withdrawal", label: "Withdrawals" },
        ]}
      />

      {/* Mobile: cards */}
      <div className="space-y-2 sm:hidden">
        {data.transactions.map((tx) => (
          <Card key={tx.id} className="p-3">
            <div className="flex items-start justify-between gap-2">
              <InvestorLink id={tx.userId} name={tx.user} email={tx.userEmail} />
              <div className={`text-sm font-medium tabular-nums ${tx.type === "return" ? "text-[var(--color-success)]" : "text-foreground"}`}>
                {tx.type === "return" ? "+" : tx.type === "withdrawal" ? "-" : ""}${tx.amount.toLocaleString()}
              </div>
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <span className={`rounded px-2 py-0.5 text-[10px] font-medium capitalize ${TYPE_STYLE[tx.type] || "bg-secondary text-foreground"}`}>{tx.type}</span>
              <StatusPill tone={statusTone(tx.status)} className="capitalize">{tx.status}</StatusPill>
              <span className="text-[10px] text-muted-foreground">{formatDate(tx.createdAt)}</span>
            </div>
            <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1">
              <KV label="Fee">{tx.fee > 0 ? `-$${tx.fee.toLocaleString()}` : "—"}</KV>
              <KV label="Net">${tx.net.toLocaleString()}</KV>
            </div>
            {tx.note && <div className="mt-1.5 text-[11px] text-muted-foreground">{tx.note}</div>}
            {isPendingWithdrawal(tx) && <div className="mt-2">{settleButtons(tx)}</div>}
          </Card>
        ))}
        {data.transactions.length === 0 && <Card className="p-8 text-center text-sm text-muted-foreground">No transactions found</Card>}
      </div>

      <Card className="hidden overflow-hidden sm:block">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px]">
            <thead className="bg-secondary/50">
              <tr>
                <th className="px-3 py-2.5 text-left font-mono text-[9px] uppercase text-muted-foreground">User</th>
                <th className="px-3 py-2.5 text-left font-mono text-[9px] uppercase text-muted-foreground">Type</th>
                <th className="px-3 py-2.5 text-right font-mono text-[9px] uppercase text-muted-foreground">Amount</th>
                <th className="px-3 py-2.5 text-right font-mono text-[9px] uppercase text-muted-foreground">Fee</th>
                <th className="px-3 py-2.5 text-right font-mono text-[9px] uppercase text-muted-foreground">Net</th>
                <th className="px-3 py-2.5 text-left font-mono text-[9px] uppercase text-muted-foreground">Status</th>
                <th className="px-3 py-2.5 text-left font-mono text-[9px] uppercase text-muted-foreground">Date</th>
                <th className="px-3 py-2.5 text-right font-mono text-[9px] uppercase text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {data.transactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-secondary/30">
                  <td className="px-3 py-2.5">
                    <InvestorLink id={tx.userId} name={tx.user} email={tx.userEmail} size="sm" />
                    {tx.note && <div className="ml-8 max-w-[220px] truncate text-[10px] text-muted-foreground">{tx.note}</div>}
                  </td>
                  <td className="px-3 py-2.5">
                    <span className={`rounded px-2 py-0.5 text-[10px] font-medium capitalize ${TYPE_STYLE[tx.type] || "bg-secondary text-foreground"}`}>{tx.type}</span>
                  </td>
                  <td className={`px-3 py-2.5 text-right text-xs font-medium tabular-nums ${tx.type === "return" ? "text-[var(--color-success)]" : "text-foreground"}`}>
                    {tx.type === "return" ? "+" : tx.type === "withdrawal" ? "-" : ""}${tx.amount.toLocaleString()}
                  </td>
                  <td className="px-3 py-2.5 text-right text-xs tabular-nums text-muted-foreground">{tx.fee > 0 ? `-$${tx.fee.toLocaleString()}` : "—"}</td>
                  <td className="px-3 py-2.5 text-right text-xs font-medium tabular-nums text-foreground">${tx.net.toLocaleString()}</td>
                  <td className="px-3 py-2.5">
                    <StatusPill tone={statusTone(tx.status)} className="capitalize">{tx.status}</StatusPill>
                  </td>
                  <td className="px-3 py-2.5 text-[10px] text-muted-foreground">{formatDate(tx.createdAt)}</td>
                  <td className="px-3 py-2.5"><div className="flex justify-end">{settleButtons(tx)}</div></td>
                </tr>
              ))}
              {data.transactions.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-3 py-8 text-center text-sm text-muted-foreground">No transactions found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Pagination page={data.page} pageCount={data.pageCount} onPageChange={setPage} total={data.total} start={start} end={end} className="mt-4" />

      {/* Settle a withdrawal */}
      <Modal open={!!settling} onClose={() => !busy && setSettling(null)} title={settling?.action === "rejected" ? "Reject withdrawal" : "Mark withdrawal paid"}>
        {settling && (
          <div className="space-y-4">
            {error && <div className="rounded-lg border border-destructive/25 bg-[var(--bg-danger)] p-2.5 text-xs text-destructive">{error}</div>}
            <p className="text-sm text-foreground">
              {settling.action === "rejected" ? (
                <>Reject <strong>{settling.tx.user}</strong>&apos;s ${settling.tx.amount.toLocaleString()} withdrawal? The amount goes back into their withdrawable balance and they&apos;ll be emailed.</>
              ) : (
                <>Confirm you have sent <strong>${settling.tx.amount.toLocaleString()}</strong> to <strong>{settling.tx.user}</strong>. They&apos;ll be emailed the payout confirmation.</>
              )}
            </p>
            {settling.tx.note && <p className="rounded-lg bg-secondary/50 p-2.5 text-[11px] break-all text-muted-foreground">{settling.tx.note}</p>}
            {settling.action === "completed" && (
              <div>
                <label className="mb-1 block text-xs font-medium text-foreground">Payout transaction hash (optional)</label>
                <input className={`${inputCls} font-mono text-xs`} value={txHash} onChange={(e) => setTxHash(e.target.value)} placeholder="0x… / T…" />
              </div>
            )}
            <div className="flex justify-end gap-2">
              <button onClick={() => setSettling(null)} disabled={busy} className="rounded-lg border border-border px-3 py-2 text-xs font-medium text-muted-foreground hover:bg-secondary hover:text-foreground">Cancel</button>
              <button
                onClick={settle}
                disabled={busy}
                className={`rounded-lg px-3 py-2 text-xs font-medium disabled:opacity-50 ${settling.action === "rejected" ? "bg-destructive text-destructive-foreground" : "bg-foreground text-background"} hover:opacity-90`}
              >
                {busy ? "Saving…" : settling.action === "rejected" ? "Reject withdrawal" : "Mark as paid"}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
