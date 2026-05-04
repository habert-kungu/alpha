"use client"

import * as React from "react"

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-card border border-border rounded-lg ${className}`}>
      {children}
    </div>
  )
}

const users = [
  { id: "USR-001", name: "Alex Morgan", email: "alex@example.com", telegram: "@alexm", deposits: 4500, returns: 12500, joined: "Jan 2026" },
  { id: "USR-002", name: "John Doe", email: "john@example.com", telegram: "@johnd", deposits: 1500, returns: 3200, joined: "Feb 2026" },
  { id: "USR-003", name: "Sarah Kim", email: "sarah@example.com", telegram: "@sarahk", deposits: 8000, returns: 24000, joined: "Mar 2026" },
  { id: "USR-004", name: "Mike Ross", email: "mike@example.com", telegram: "@miker", deposits: 2200, returns: 5600, joined: "Mar 2026" },
  { id: "USR-005", name: "Lisa Moon", email: "lisa@example.com", telegram: "@lisam", deposits: 3500, returns: 9800, joined: "Apr 2026" },
]

export default function UsersPage() {
  const [search, setSearch] = React.useState("")

  const filtered = users.filter(u => 
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    u.telegram.toLowerCase().includes(search.toLowerCase())
  )

  const totalDeposits = users.reduce((sum, u) => sum + u.deposits, 0)
  const totalReturns = users.reduce((sum, u) => sum + u.returns, 0)

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-semibold text-foreground">Users</h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">Manage registered users</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="p-3 text-center">
          <div className="text-lg font-bold text-foreground">{users.length}</div>
          <div className="text-[10px] text-muted-foreground">Total Users</div>
        </Card>
        <Card className="p-3 text-center">
          <div className="text-lg font-bold text-foreground">${totalDeposits.toLocaleString()}</div>
          <div className="text-[10px] text-muted-foreground">Total Deposits</div>
        </Card>
        <Card className="p-3 text-center">
          <div className="text-lg font-bold text-emerald-600">${totalReturns.toLocaleString()}</div>
          <div className="text-[10px] text-muted-foreground">Total Returns</div>
        </Card>
      </div>

      {/* Search */}
      <Card className="p-3">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search users..."
          className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-[oklch(0.21_0_0)]"
        />
      </Card>

      {/* Users Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[500px]">
            <thead className="bg-secondary/50">
              <tr>
                <th className="px-3 py-2.5 text-left text-[9px] font-mono uppercase text-muted-foreground">User</th>
                <th className="px-3 py-2.5 text-left text-[9px] font-mono uppercase text-muted-foreground">Telegram</th>
                <th className="px-3 py-2.5 text-right text-[9px] font-mono uppercase text-muted-foreground">Deposited</th>
                <th className="px-3 py-2.5 text-right text-[9px] font-mono uppercase text-muted-foreground">Returns</th>
                <th className="px-3 py-2.5 text-left text-[9px] font-mono uppercase text-muted-foreground">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((user) => (
                <tr key={user.id} className="hover:bg-secondary/30 cursor-pointer">
                  <td className="px-3 py-2.5">
                    <div>
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center text-[10px] font-bold text-foreground">
                          {user.name.charAt(0)}
                        </div>
                        <div>
                          <div className="text-xs font-medium text-foreground">{user.name}</div>
                          <div className="text-[9px] text-muted-foreground">{user.email}</div>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-2.5 text-xs text-muted-foreground">{user.telegram}</td>
                  <td className="px-3 py-2.5 text-right text-xs font-medium text-foreground">${user.deposits.toLocaleString()}</td>
                  <td className="px-3 py-2.5 text-right text-xs font-medium text-emerald-600">${user.returns.toLocaleString()}</td>
                  <td className="px-3 py-2.5 text-xs text-muted-foreground">{user.joined}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}