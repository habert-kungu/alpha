"use client"


import { Card } from "@/components/ui"
import * as React from "react"
import Link from "next/link"
import { invalidateCache } from "@/lib/use-cached-fetch"

const BINANCE_WALLET = "TP3HUdgXCsVBwnRARKEouqYo9USdZTUcbg"

export default function InvestmentsPage() {
  const [copiedAddress, setCopiedAddress] = React.useState(false)
  const [amount, setAmount] = React.useState("")
  const [selectedPlan, setSelectedPlan] = React.useState("weekly")
  const [txHash, setTxHash] = React.useState("")
  const [notes, setNotes] = React.useState("")
  const [showConfirm, setShowConfirm] = React.useState(false)
  const [submitting, setSubmitting] = React.useState(false)
  const [submitError, setSubmitError] = React.useState("")
  const [submitSuccess, setSubmitSuccess] = React.useState(false)

  const copyAddress = () => {
    navigator.clipboard.writeText(BINANCE_WALLET)
    setCopiedAddress(true)
    setTimeout(() => setCopiedAddress(false), 2000)
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    setSubmitError("")

    try {
      const res = await fetch("/api/user/investments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: parseFloat(amount),
          pool: selectedPlan,
          txHash: txHash.trim(),
          network: "TRC20",
          notes,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setSubmitError(data.error || "Failed to submit investment")
        return
      }

      const roi = selectedPlan === "weekly" ? "8x" : "6.4x"
      const message = `🎯 *New Stake Request*\n\n*Plan:* ${selectedPlan === "weekly" ? "Weekly Pool" : "24H Pool"} (${roi} ROI)\n*Amount:* $${amount}\n*Network:* USDT (TRC20)\n*TX Hash:* ${txHash}\n*DB ID:* ${data.investment?.id}\n${notes ? `\n*Notes:* ${notes}` : ""}`
      const telegramUrl = `https://t.me/khan_bashiri?text=${encodeURIComponent(message)}`
      window.open(telegramUrl, "_blank")

      invalidateCache("/api/user/")
      setSubmitSuccess(true)
      setShowConfirm(false)
      setAmount("")
      setTxHash("")
      setNotes("")
    } catch (error) {
      setSubmitError("Network error. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  const calculatedReturn = amount
    ? Math.round(parseFloat(amount) * (selectedPlan === "weekly" ? 8 : 6.4))
    : 0
  const fee = amount ? Math.round(parseFloat(amount) * 0.165) : 0
  const net = amount ? parseFloat(amount) - fee : 0

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center sm:gap-0">
        <div>
          <h1 className="text-xl font-semibold text-foreground sm:text-2xl">
            Buy Crypto
          </h1>
          <p className="mt-0.5 text-xs text-muted-foreground sm:text-sm">
            Stake to earn guaranteed returns
          </p>
        </div>
        <Link
          href="/app"
          className="text-xs text-muted-foreground hover:text-foreground"
        >
          ← Back to Dashboard
        </Link>
      </div>

      {/* Plan Selection */}
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-4">
        <button
          onClick={() => setSelectedPlan("daily")}
          className={`rounded-lg border bg-card p-3 text-left transition-all hover:bg-secondary/50 sm:p-4 ${selectedPlan === "daily" ? "border-[oklch(0.21_0_0)] ring-2 ring-[oklch(0.21_0_0)]" : "border-border"}`}
        >
          <div className="mb-2 flex items-start justify-between">
            <div>
              <div className="text-sm font-medium text-foreground sm:text-base">
                24H Pool
              </div>
              <div className="text-[10px] text-muted-foreground sm:text-xs">
                24 hours
              </div>
            </div>
          </div>
          <div className="text-lg font-semibold text-foreground sm:text-xl">
            6.4x ROI
          </div>
        </button>

        <button
          onClick={() => setSelectedPlan("weekly")}
          className={`relative rounded-lg border bg-card p-3 text-left transition-all hover:bg-secondary/50 sm:p-4 ${selectedPlan === "weekly" ? "border-[oklch(0.21_0_0)] ring-2 ring-[oklch(0.21_0_0)]" : "border-border"}`}
        >
          <div className="absolute -top-1.5 right-2 rounded bg-[oklch(0.21_0_0)] px-1.5 py-0.5 text-[9px] font-medium text-[oklch(1_0_180)] sm:right-3 sm:px-2 sm:text-[10px]">
            Popular
          </div>
          <div className="mb-2 flex items-start justify-between">
            <div>
              <div className="text-sm font-medium text-foreground sm:text-base">
                Weekly Pool
              </div>
              <div className="text-[10px] text-muted-foreground sm:text-xs">
                7 days
              </div>
            </div>
          </div>
          <div className="text-lg font-semibold text-foreground sm:text-xl">
            8x ROI
          </div>
        </button>
      </div>

      {/* Deposit Form */}
      <Card className="p-4 sm:p-6">
        <h2 className="mb-4 text-base font-medium text-foreground sm:mb-6 sm:text-lg">
          Make a Deposit
        </h2>

        <div className="space-y-4 sm:space-y-5">
          {/* Wallet Address */}
          <div>
            <label className="mb-2 block text-xs font-medium text-foreground sm:text-sm">
              Deposit Address (Binance)
            </label>
            <div className="rounded-lg border border-border bg-secondary/30 p-2.5 sm:p-3.5">
              <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center sm:gap-0">
                <code className="font-mono text-[10px] break-all text-foreground sm:text-xs">
                  {BINANCE_WALLET}
                </code>
                <button
                  type="button"
                  onClick={copyAddress}
                  className="flex shrink-0 items-center gap-1.5 rounded bg-[oklch(0.21_0_0)] px-2.5 py-1.5 text-[10px] font-medium text-[oklch(1_0_180)] transition-opacity hover:opacity-90 sm:gap-2 sm:px-3 sm:text-xs"
                >
                  {copiedAddress ? (
                    <>
                      <svg
                        className="h-3 w-3 sm:h-4 sm:w-4"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      Copied
                    </>
                  ) : (
                    <>
                      <svg
                        className="h-3 w-3 sm:h-4 sm:w-4"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <rect x="9" y="9" width="13" height="13" rx="2" />
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                      </svg>
                      Copy
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Warning */}
          <div className="rounded-lg border border-[oklch(0.6_0_0)/0.15] bg-[oklch(0.6_0_0)/0.08] p-3">
            <p className="text-[10px] text-foreground sm:text-xs">
              <span className="font-medium">Important:</span> Send exact amount.
              After sending, fill details below and submit.
            </p>
          </div>

          {/* Amount & Network */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-foreground sm:mb-2 sm:text-sm">
                Amount (USD)
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="e.g. 500"
                className="w-full rounded-lg border border-border px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-[oklch(0.21_0_0)] focus:outline-none sm:px-4 sm:py-3 sm:text-base"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-foreground sm:mb-2 sm:text-sm">
                Network
              </label>
              <div className="w-full rounded-lg border border-border bg-secondary/30 px-3 py-2.5 text-sm text-muted-foreground sm:px-4 sm:py-3 sm:text-base">
                USDT (TRC20)
              </div>
            </div>
          </div>

          {/* Preview Return */}
          {amount && parseFloat(amount) > 0 && (
            <div className="rounded-lg border border-[oklch(0.62_0.12_178)/20] bg-[oklch(0.62_0.12_178)/8] p-3 sm:p-4">
              <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center sm:gap-0">
                <div>
                  <div className="mb-1 font-mono text-[10px] text-muted-foreground uppercase sm:text-xs">
                    Expected Return
                  </div>
                  <div className="text-lg font-bold text-[oklch(0.62_0.12_178)] sm:text-xl">
                    ${calculatedReturn.toLocaleString()}
                  </div>
                </div>
                <div className="text-left sm:text-right">
                  <div className="mb-1 font-mono text-[10px] text-muted-foreground uppercase sm:text-xs">
                    After 16.5% fee
                  </div>
                  <div className="text-sm font-semibold text-foreground sm:text-base">
                    ${net.toLocaleString()} payout
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TX Hash */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-foreground sm:mb-2 sm:text-sm">
              Transaction Hash
            </label>
            <input
              type="text"
              value={txHash}
              onChange={(e) => setTxHash(e.target.value)}
              placeholder="Paste TX hash after sending"
              className="w-full rounded-lg border border-border px-3 py-2.5 font-mono text-xs text-foreground placeholder:text-muted-foreground focus:border-[oklch(0.21_0_0)] focus:outline-none sm:px-4 sm:py-3 sm:text-sm"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-foreground sm:mb-2 sm:text-sm">
              Notes (optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Message for admin..."
              rows={2}
              className="w-full resize-none rounded-lg border border-border px-3 py-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:border-[oklch(0.21_0_0)] focus:outline-none sm:px-4 sm:py-3 sm:text-sm"
            />
          </div>

          {/* Submit */}
          {submitSuccess && (
            <div className="mb-3 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-center text-sm text-emerald-500">
              Investment submitted successfully! Awaiting admin approval.
            </div>
          )}
          {submitError && (
            <div className="mb-3 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-center text-sm text-red-400">
              {submitError}
            </div>
          )}
          <button
            type="button"
            onClick={() => setShowConfirm(true)}
            disabled={!amount || !txHash || submitting}
            className="w-full rounded-lg bg-[oklch(0.62_0.12_178)] py-3 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 sm:py-4 sm:text-base"
          >
            {submitting ? "Submitting..." : "Submit Investment"}
          </button>
        </div>
      </Card>

      {/* How it works */}
      <Card className="p-4 sm:p-6">
        <h3 className="mb-3 text-sm font-medium text-foreground sm:mb-4 sm:text-base">
          How it works
        </h3>
        <div className="space-y-3 sm:space-y-4">
          {[
            { step: "1", title: "Select Plan", desc: "24H or Weekly pool" },
            {
              step: "2",
              title: "Send Crypto",
              desc: "Transfer USDT to wallet",
            },
            {
              step: "3",
              title: "Get Confirmed",
              desc: "Admin verifies & updates balance",
            },
          ].map((item) => (
            <div key={item.step} className="flex items-center gap-3">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[oklch(0.21_0_0)] text-[10px] font-medium text-[oklch(1_0_180)] sm:h-8 sm:w-8 sm:text-sm">
                {item.step}
              </div>
              <div>
                <div className="text-xs font-medium text-foreground sm:text-sm">
                  {item.title}
                </div>
                <div className="text-[10px] text-muted-foreground sm:text-xs">
                  {item.desc}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

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
              Confirm Submission
            </h3>
            <div className="space-y-3 text-xs sm:text-sm">
              <div className="flex justify-between border-b border-border py-2">
                <span className="text-muted-foreground">Plan</span>
                <span className="font-medium text-foreground">
                  {selectedPlan === "weekly"
                    ? "Weekly Pool (8x)"
                    : "24H Pool (6.4x)"}
                </span>
              </div>
              <div className="flex justify-between border-b border-border py-2">
                <span className="text-muted-foreground">Amount</span>
                <span className="font-medium text-foreground">${amount}</span>
              </div>
              <div className="flex justify-between border-b border-border py-2">
                <span className="text-muted-foreground">Expected Return</span>
                <span className="font-bold text-[oklch(0.62_0.12_178)]">
                  ${calculatedReturn.toLocaleString()}
                </span>
              </div>
            </div>
            <div className="mt-5 flex gap-2">
              <button
                onClick={() => setShowConfirm(false)}
                disabled={submitting}
                className="flex-1 rounded-lg border border-border py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-secondary disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="flex-1 rounded-lg bg-[oklch(0.62_0.12_178)] py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                {submitting ? "Submitting..." : "Confirm & Submit"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
