"use client"

import * as React from "react"
import Link from "next/link"

const AVAILABLE_BALANCE = 4250.00

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-card border border-border rounded-lg ${className}`}>
      {children}
    </div>
  )
}

export default function WithdrawPage() {
  const [amount, setAmount] = React.useState("")
  const [address, setAddress] = React.useState("")
  const [network, setNetwork] = React.useState("TRC20")
  const [showConfirm, setShowConfirm] = React.useState(false)

  const withdrawAmount = amount ? parseFloat(amount) : 0
  const fee = withdrawAmount * 0.165
  const receiveAmount = withdrawAmount - fee

  const handleSubmit = () => {
    const message = `💰 *Withdrawal Request*\n\n*Amount:* $${withdrawAmount}\n*Fee (16.5%):* $${fee.toFixed(2)}\n*Net:* $${receiveAmount.toFixed(2)}\n*Network:* ${network}\n*Address:* ${address}`
    const telegramUrl = `https://t.me/Sir_khanbashiri?text=${encodeURIComponent(message)}`
    window.open(telegramUrl, '_blank')
    setShowConfirm(false)
    setAmount("")
    setAddress("")
  }

  const isValid = withdrawAmount >= 50 && withdrawAmount <= AVAILABLE_BALANCE && address.length > 0

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-foreground">Withdraw</h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">Transfer earnings to your wallet</p>
        </div>
        <Link href="/dashboard" className="text-xs text-muted-foreground hover:text-foreground">
          ← Back to Dashboard
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="lg:col-span-2">
          <Card className="p-4 sm:p-6">
            <h2 className="text-base sm:text-lg font-medium text-foreground mb-4 sm:mb-6">Withdrawal Details</h2>

            <div className="mb-4 sm:mb-5">
              <div className="flex justify-between items-center mb-1.5 sm:mb-2">
                <label className="text-xs sm:text-sm font-medium text-foreground">Amount (USDT)</label>
                <button 
                  onClick={() => setAmount(AVAILABLE_BALANCE.toString())}
                  className="text-[10px] sm:text-xs text-[oklch(0.55_0_150)] hover:opacity-80 font-medium"
                >
                  Max: ${AVAILABLE_BALANCE.toLocaleString()}
                </button>
              </div>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-lg sm:text-2xl font-semibold border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-[oklch(0.21_0_0)]"
              />
            </div>

            <div className="mb-4 sm:mb-5">
              <label className="block text-xs sm:text-sm font-medium text-foreground mb-1.5 sm:mb-2">Wallet Address</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Enter your USDT address"
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-[oklch(0.21_0_0)] font-mono text-xs sm:text-sm"
              />
            </div>

            <div className="mb-4 sm:mb-5">
              <label className="block text-xs sm:text-sm font-medium text-foreground mb-1.5 sm:mb-2">Network</label>
              <div className="grid grid-cols-3 gap-2">
                {["TRC20", "ERC20", "BEP20"].map((net) => (
                  <button
                    key={net}
                    onClick={() => setNetwork(net)}
                    className={`py-2 sm:py-2.5 px-2 sm:px-3 rounded-lg border text-[10px] sm:text-xs font-medium transition-all ${
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
              <div className="p-3 sm:p-4 bg-secondary/50 rounded-lg space-y-2 sm:space-y-3 mb-4 sm:mb-5">
                <div className="flex justify-between text-xs sm:text-sm">
                  <span className="text-muted-foreground">Amount</span>
                  <span className="font-medium text-foreground">${withdrawAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-xs sm:text-sm">
                  <span className="text-muted-foreground">Fee (16.5%)</span>
                  <span className="font-medium text-muted-foreground">-${fee.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-xs sm:text-sm border-t border-border pt-2 sm:pt-3">
                  <span className="font-medium text-foreground">You receive</span>
                  <span className="font-bold text-[oklch(0.55_0_150)]">${receiveAmount.toLocaleString()}</span>
                </div>
              </div>
            )}

            <button 
              onClick={() => isValid && setShowConfirm(true)}
              disabled={!isValid}
              className="w-full py-3 sm:py-4 bg-[oklch(0.21_0_0)] text-[oklch(1_0_180)] rounded-lg text-sm sm:text-base font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Request via Telegram
            </button>
          </Card>
        </div>

        <div className="space-y-3 sm:space-y-4">
          <Card className="p-4 sm:p-5">
            <div className="text-[10px] sm:text-xs text-muted-foreground uppercase font-mono mb-1">Available</div>
            <div className="text-2xl sm:text-3xl font-bold text-foreground">${AVAILABLE_BALANCE.toLocaleString()}</div>
            <div className="text-[10px] sm:text-xs text-muted-foreground mt-0.5">USDT</div>
          </Card>

          <Card className="p-4 sm:p-5">
            <h3 className="text-xs sm:text-sm font-medium text-foreground mb-3 sm:mb-4">Important</h3>
            <ul className="space-y-2 sm:space-y-3 text-[10px] sm:text-xs text-muted-foreground">
              {[
                "Min withdrawal: $50 USDT",
                "Fee: 16.5% on net",
                "Processing: 24-48 hours",
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2">
                  <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[oklch(0.55_0_150)] mt-0.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="20 6 9 17 4 12"/>
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowConfirm(false)}>
          <div className="w-full max-w-sm bg-card border border-border rounded-lg p-5" onClick={e => e.stopPropagation()}>
            <h3 className="text-base font-semibold text-foreground mb-4">Confirm Withdrawal</h3>
            <div className="space-y-3 text-xs sm:text-sm">
              <div className="flex justify-between py-2 border-b border-border">
                <span className="text-muted-foreground">Amount</span>
                <span className="text-foreground font-medium">${withdrawAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-border">
                <span className="text-muted-foreground">Fee (16.5%)</span>
                <span className="text-muted-foreground">-${fee.toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-border">
                <span className="text-muted-foreground">Network</span>
                <span className="text-foreground">{network}</span>
              </div>
              <div className="py-2 border-b border-border">
                <span className="text-muted-foreground text-xs block mb-1">Address</span>
                <span className="text-foreground text-xs font-mono break-all">{address}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="font-medium text-foreground">You receive</span>
                <span className="font-bold text-[oklch(0.55_0_150)]">${receiveAmount.toLocaleString()}</span>
              </div>
            </div>
            <div className="flex gap-2 mt-5">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 py-2.5 border border-border rounded-lg text-sm font-medium text-foreground hover:bg-secondary transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="flex-1 py-2.5 bg-[oklch(0.21_0_0)] text-[oklch(1_0_180)] rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}