"use client"

import * as React from "react"

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-card border border-border rounded-lg ${className}`}>
      {children}
    </div>
  )
}

const transactions = [
  { id: "TXN-001", user: "Alex M.", type: "deposit", amount: 1000, fee: 0, net: 1000, status: "completed", date: "Apr 29, 2026" },
  { id: "TXN-002", user: "John D.", type: "deposit", amount: 500, fee: 0, net: 500, status: "completed", date: "Apr 29, 2026" },
  { id: "TXN-003", user: "Sarah K.", type: "return", amount: 8000, fee: 0, net: 8000, status: "completed", date: "Apr 28, 2026" },
  { id: "TXN-004", user: "Mike R.", type: "withdrawal", amount: 500, fee: 82.5, net: 417.5, status: "completed", date: "Apr 27, 2026" },
  { id: "TXN-005", user: "Lisa M.", type: "deposit", amount: 1500, fee: 0, net: 1500, status: "pending", date: "Apr 26, 2026" },
  { id: "TXN-006", user: "Alex M.", type: "return", amount: 3200, fee: 0, net: 3200, status: "completed", date: "Apr 25, 2026" },
]

export default function TransactionsPage() {
  const [filter, setFilter] = React.useState("all")

  const filtered = transactions.filter(t => filter === "all" || t.type === filter)

  const totalDeposits = transactions.filter(t => t.type === "deposit" && t.status === "completed").reduce((sum, t) => sum + t.net, 0)
  const totalReturns = transactions.filter(t => t.type === "return").reduce((sum, t) => sum + t.net, 0)
  const totalWithdrawn = transactions.filter(t => t.type === "withdrawal" && t.status === "completed").reduce((sum, t) => sum + t.net, 0)

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-semibold text-foreground">Transactions</h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">View all platform transactions</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="p-3 text-center">
          <div className="text-lg font-bold text-foreground">${totalDeposits.toLocaleString()}</div>
          <div className="text-[10px] text-muted-foreground">Deposits</div>
        </Card>
        <Card className="p-3 text-center">
          <div className="text-lg font-bold text-emerald-600">+${totalReturns.toLocaleString()}</div>
          <div className="text-[10px] text-muted-foreground">Returns</div>
        </Card>
        <Card className="p-3 text-center">
          <div className="text-lg font-bold text-red-600">-${totalWithdrawn.toLocaleString()}</div>
          <div className="text-[10px] text-muted-foreground">Withdrawn</div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-3">
        <div className="flex gap-2 flex-wrap">
          {["all", "deposit", "return", "withdrawal"].map((f) => (
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

      {/* Transactions Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[500px]">
            <thead className="bg-secondary/50">
              <tr>
                <th className="px-3 py-2.5 text-left text-[9px] font-mono uppercase text-muted-foreground">ID</th>
                <th className="px-3 py-2.5 text-left text-[9px] font-mono uppercase text-muted-foreground">User</th>
                <th className="px-3 py-2.5 text-left text-[9px] font-mono uppercase text-muted-foreground">Type</th>
                <th className="px-3 py-2.5 text-right text-[9px] font-mono uppercase text-muted-foreground">Amount</th>
                <th className="px-3 py-2.5 text-right text-[9px] font-mono uppercase text-muted-foreground">Fee</th>
                <th className="px-3 py-2.5 text-right text-[9px] font-mono uppercase text-muted-foreground">Net</th>
                <th className="px-3 py-2.5 text-left text-[9px] font-mono uppercase text-muted-foreground">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((tx) => (
                <tr key={tx.id} className="hover:bg-secondary/30">
                  <td className="px-3 py-2.5 text-[10px] font-mono text-muted-foreground">{tx.id}</td>
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center text-[9px] font-bold text-foreground">
                        {tx.user.charAt(0)}
                      </div>
                      <span className="text-xs text-foreground">{tx.user}</span>
                    </div>
                  </td>
                  <td className="px-3 py-2.5">
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded ${
                      tx.type === "deposit" ? "bg-emerald-100 text-emerald-700" :
                      tx.type === "return" ? "bg-purple-100 text-purple-700" :
                      "bg-red-100 text-red-700"
                    }`}>
                      {tx.type}
                    </span>
                  </td>
                  <td className={`px-3 py-2.5 text-right text-xs font-medium ${
                    tx.type === "return" ? "text-emerald-600" : "text-foreground"
                  }`}>
                    {tx.type === "return" ? "+" : tx.type === "withdrawal" ? "-" : ""}${tx.amount}
                  </td>
                  <td className="px-3 py-2.5 text-right text-xs text-muted-foreground">
                    {tx.fee > 0 ? `-$${tx.fee}` : "-"}
                  </td>
                  <td className="px-3 py-2.5 text-right text-xs font-medium text-foreground">${tx.net}</td>
                  <td className="px-3 py-2.5 text-[10px] text-muted-foreground">{tx.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}