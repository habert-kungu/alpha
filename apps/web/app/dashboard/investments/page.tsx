"use client"

import * as React from "react"
import Link from "next/link"

const BINANCE_WALLET = "TP3HUdgXCsVBwnRARKEouqYo9USdZTUcbg"

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-card border border-border rounded-lg ${className}`}>
      {children}
    </div>
  )
}

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
      const res = await fetch('/api/user/investments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: parseFloat(amount),
          pool: selectedPlan,
          txHash: txHash.trim(),
          network: 'TRC20',
          notes,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setSubmitError(data.error || 'Failed to submit investment')
        return
      }

      const roi = selectedPlan === 'weekly' ? '8x' : '6.4x'
      const message = `🎯 *New Stake Request*\n\n*Plan:* ${selectedPlan === 'weekly' ? 'Weekly Pool' : '24H Pool'} (${roi} ROI)\n*Amount:* $${amount}\n*Network:* USDT (TRC20)\n*TX Hash:* ${txHash}\n*DB ID:* ${data.investment?.id}\n${notes ? `\n*Notes:* ${notes}` : ''}`
      const telegramUrl = `https://t.me/Sir_khanbashiri?text=${encodeURIComponent(message)}`
      window.open(telegramUrl, '_blank')
      
      setSubmitSuccess(true)
      setShowConfirm(false)
      setAmount("")
      setTxHash("")
      setNotes("")
      
    } catch (error) {
      setSubmitError('Network error. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const calculatedReturn = amount ? Math.round(parseFloat(amount) * (selectedPlan === 'weekly' ? 8 : 6.4)) : 0
  const fee = amount ? Math.round(parseFloat(amount) * 0.165) : 0
  const net = amount ? parseFloat(amount) - fee : 0

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-foreground">Buy Crypto</h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">Stake to earn guaranteed returns</p>
        </div>
        <Link href="/dashboard" className="text-xs text-muted-foreground hover:text-foreground">
          ← Back to Dashboard
        </Link>
      </div>

      {/* Plan Selection */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">
        <button
          onClick={() => setSelectedPlan("daily")}
          className={`p-3 sm:p-4 rounded-lg border bg-card text-left hover:bg-secondary/50 transition-all ${selectedPlan === 'daily' ? 'ring-2 ring-[oklch(0.21_0_0)] border-[oklch(0.21_0_0)]' : 'border-border'}`}
        >
          <div className="flex items-start justify-between mb-2">
            <div>
              <div className="text-sm sm:text-base font-medium text-foreground">24H Pool</div>
              <div className="text-[10px] sm:text-xs text-muted-foreground">24 hours</div>
            </div>
          </div>
          <div className="text-lg sm:text-xl font-semibold text-foreground">6.4x ROI</div>
        </button>

        <button
          onClick={() => setSelectedPlan("weekly")}
          className={`p-3 sm:p-4 rounded-lg border bg-card text-left hover:bg-secondary/50 transition-all relative ${selectedPlan === 'weekly' ? 'ring-2 ring-[oklch(0.21_0_0)] border-[oklch(0.21_0_0)]' : 'border-border'}`}
        >
          <div className="absolute -top-1.5 right-2 sm:right-3 text-[9px] sm:text-[10px] font-medium px-1.5 sm:px-2 py-0.5 bg-[oklch(0.21_0_0)] text-[oklch(1_0_180)] rounded">Popular</div>
          <div className="flex items-start justify-between mb-2">
            <div>
              <div className="text-sm sm:text-base font-medium text-foreground">Weekly Pool</div>
              <div className="text-[10px] sm:text-xs text-muted-foreground">7 days</div>
            </div>
          </div>
          <div className="text-lg sm:text-xl font-semibold text-foreground">8x ROI</div>
        </button>
      </div>

      {/* Deposit Form */}
      <Card className="p-4 sm:p-6">
        <h2 className="text-base sm:text-lg font-medium text-foreground mb-4 sm:mb-6">Make a Deposit</h2>
        
        <div className="space-y-4 sm:space-y-5">
          {/* Wallet Address */}
          <div>
            <label className="block text-xs sm:text-sm font-medium text-foreground mb-2">Deposit Address (Binance)</label>
            <div className="p-2.5 sm:p-3.5 border border-border rounded-lg bg-secondary/30">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-0">
                <code className="text-[10px] sm:text-xs text-foreground font-mono break-all">{BINANCE_WALLET}</code>
                <button
                  type="button"
                  onClick={copyAddress}
                  className="shrink-0 px-2.5 sm:px-3 py-1.5 bg-[oklch(0.21_0_0)] text-[oklch(1_0_180)] rounded text-[10px] sm:text-xs font-medium hover:opacity-90 transition-opacity flex items-center gap-1.5 sm:gap-2"
                >
                  {copiedAddress ? (
                    <>
                      <svg className="w-3 h-3 sm:w-4 sm:h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                      Copied
                    </>
                  ) : (
                    <>
                      <svg className="w-3 h-3 sm:w-4 sm:h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                      </svg>
                      Copy
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Warning */}
          <div className="p-3 bg-[oklch(0.6_0_0)/0.08] border border-[oklch(0.6_0_0)/0.15] rounded-lg">
            <p className="text-[10px] sm:text-xs text-foreground">
              <span className="font-medium">Important:</span> Send exact amount. After sending, fill details below and submit.
            </p>
          </div>

          {/* Amount & Network */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-foreground mb-1.5 sm:mb-2">Amount (USD)</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="e.g. 500"
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-border rounded-lg text-sm sm:text-base text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-[oklch(0.21_0_0)]"
              />
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium text-foreground mb-1.5 sm:mb-2">Network</label>
              <div className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-border rounded-lg text-sm sm:text-base text-muted-foreground bg-secondary/30">
                USDT (TRC20)
              </div>
            </div>
          </div>

          {/* Preview Return */}
          {amount && parseFloat(amount) > 0 && (
            <div className="p-3 sm:p-4 bg-[oklch(0.55_0_150)/8] border border-[oklch(0.55_0_150)/20] rounded-lg">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-0">
                <div>
                  <div className="text-[10px] sm:text-xs text-muted-foreground uppercase font-mono mb-1">Expected Return</div>
                  <div className="text-lg sm:text-xl font-bold text-[oklch(0.55_0_150)]">${calculatedReturn.toLocaleString()}</div>
                </div>
                <div className="text-left sm:text-right">
                  <div className="text-[10px] sm:text-xs text-muted-foreground uppercase font-mono mb-1">After 16.5% fee</div>
                  <div className="text-sm sm:text-base font-semibold text-foreground">${net.toLocaleString()} payout</div>
                </div>
              </div>
            </div>
          )}

          {/* TX Hash */}
          <div>
            <label className="block text-xs sm:text-sm font-medium text-foreground mb-1.5 sm:mb-2">Transaction Hash</label>
            <input
              type="text"
              value={txHash}
              onChange={(e) => setTxHash(e.target.value)}
              placeholder="Paste TX hash after sending"
              className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-border rounded-lg text-xs sm:text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-[oklch(0.21_0_0)] font-mono"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs sm:text-sm font-medium text-foreground mb-1.5 sm:mb-2">Notes (optional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Message for admin..."
              rows={2}
              className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-border rounded-lg text-xs sm:text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-[oklch(0.21_0_0)] resize-none"
            />
          </div>

          {/* Submit */}
          {submitSuccess && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-500 text-sm text-center mb-3">
              Investment submitted successfully! Awaiting admin approval.
            </div>
          )}
          {submitError && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm text-center mb-3">
              {submitError}
            </div>
          )}
          <button
            type="button"
            onClick={() => setShowConfirm(true)}
            disabled={!amount || !txHash || submitting}
            className="w-full py-3 sm:py-4 bg-[oklch(0.55_0_150)] text-white rounded-lg text-sm sm:text-base font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? 'Submitting...' : 'Submit Investment'}
          </button>
        </div>
      </Card>

      {/* How it works */}
      <Card className="p-4 sm:p-6">
        <h3 className="text-sm sm:text-base font-medium text-foreground mb-3 sm:mb-4">How it works</h3>
        <div className="space-y-3 sm:space-y-4">
          {[
            { step: "1", title: "Select Plan", desc: "24H or Weekly pool" },
            { step: "2", title: "Send Crypto", desc: "Transfer USDT to wallet" },
            { step: "3", title: "Get Confirmed", desc: "Admin verifies & updates balance" },
          ].map((item) => (
            <div key={item.step} className="flex items-center gap-3">
              <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-[oklch(0.21_0_0)] flex items-center justify-center text-[oklch(1_0_180)] font-medium text-[10px] sm:text-sm shrink-0">
                {item.step}
              </div>
              <div>
                <div className="text-xs sm:text-sm font-medium text-foreground">{item.title}</div>
                <div className="text-[10px] sm:text-xs text-muted-foreground">{item.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowConfirm(false)}>
          <div className="w-full max-w-sm bg-card border border-border rounded-lg p-5" onClick={e => e.stopPropagation()}>
            <h3 className="text-base font-semibold text-foreground mb-4">Confirm Submission</h3>
            <div className="space-y-3 text-xs sm:text-sm">
              <div className="flex justify-between py-2 border-b border-border">
                <span className="text-muted-foreground">Plan</span>
                <span className="text-foreground font-medium">{selectedPlan === 'weekly' ? 'Weekly Pool (8x)' : '24H Pool (6.4x)'}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-border">
                <span className="text-muted-foreground">Amount</span>
                <span className="text-foreground font-medium">${amount}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-border">
                <span className="text-muted-foreground">Expected Return</span>
                <span className="text-[oklch(0.55_0_150)] font-bold">${calculatedReturn.toLocaleString()}</span>
              </div>
            </div>
            <div className="flex gap-2 mt-5">
              <button
                onClick={() => setShowConfirm(false)}
                disabled={submitting}
                className="flex-1 py-2.5 border border-border rounded-lg text-sm font-medium text-foreground hover:bg-secondary transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="flex-1 py-2.5 bg-[oklch(0.55_0_150)] text-white rounded-lg text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {submitting ? 'Submitting...' : 'Confirm & Submit'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}