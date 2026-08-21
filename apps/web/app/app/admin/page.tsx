"use client"


import { Card } from "@/components/ui"
import * as React from "react"
import prisma from "@/lib/db"

async function getStats() {
  try {
    const [
      totalUsers,
      pendingDeposits,
      activeInvestments,
      completedCycles,
      totalDeposited,
      totalPaidOut,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.investment.count({ where: { status: "pending" } }),
      prisma.investment.count({ where: { status: "active" } }),
      prisma.cycle.count({ where: { status: "completed" } }),
      prisma.transaction.aggregate({
        _sum: { amount: true },
        where: { type: "deposit", status: "completed" },
      }),
      prisma.transaction.aggregate({
        _sum: { amount: true },
        where: { type: "return", status: "completed" },
      }),
    ])

    return {
      totalUsers,
      pendingDeposits,
      activeInvestments,
      completedCycles,
      totalDeposited: totalDeposited._sum.amount || 0,
      totalPaidOut: totalPaidOut._sum.amount || 0,
    }
  } catch (e) {
    return {
      totalUsers: 0,
      pendingDeposits: 0,
      activeInvestments: 0,
      completedCycles: 0,
      totalDeposited: 0,
      totalPaidOut: 0,
    }
  }
}

export default async function AdminDashboardPage() {
  const stats = await getStats()

  const statCards = [
    { label: "Total Users", value: stats.totalUsers, icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" },
    { label: "Pending Deposits", value: stats.pendingDeposits, icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z", color: "text-amber-600" },
    { label: "Active Investments", value: stats.activeInvestments, icon: "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6", color: "text-emerald-600" },
    { label: "Completed Cycles", value: stats.completedCycles, icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" },
  ]

  const financialCards = [
    { label: "Total Deposited", value: `$${stats.totalDeposited.toLocaleString()}`, color: "text-foreground" },
    { label: "Total Paid Out", value: `$${stats.totalPaidOut.toLocaleString()}`, color: "text-emerald-600" },
  ]

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-semibold text-foreground">Dashboard</h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">Overview of your platform</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {statCards.map((stat, i) => (
          <Card key={i} className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="w-9 h-9 rounded-lg bg-[oklch(0.21_0_0)/8] flex items-center justify-center">
                <svg className="w-4 h-4 text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d={stat.icon} />
                </svg>
              </div>
            </div>
            <div className="text-[11px] text-muted-foreground uppercase font-mono mb-1">{stat.label}</div>
            <div className="text-xl sm:text-2xl font-bold text-foreground">{stat.value}</div>
          </Card>
        ))}
      </div>

      {/* Financial Stats */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        {financialCards.map((card, i) => (
          <Card key={i} className="p-4">
            <div className="text-[11px] text-muted-foreground uppercase font-mono mb-1">{card.label}</div>
            <div className={`text-xl sm:text-2xl font-bold ${card.color}`}>{card.value}</div>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <Card className="p-4 sm:p-5">
        <h3 className="text-sm sm:text-base font-medium text-foreground mb-3 sm:mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
          {[
            { href: "/app/admin/deposits", label: "Deposits", sub: `${stats.pendingDeposits} pending`, d: "M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" },
            { href: "/app/admin/investments", label: "Investments", sub: `${stats.activeInvestments} active`, d: "M23 6l-9.5 9.5-5-5L1 18" },
            { href: "/app/admin/users", label: "Users", sub: `${stats.totalUsers} total`, d: "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.87" },
            { href: "/app/admin/transactions", label: "Transactions", sub: "All history", d: "M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2" },
          ].map((a) => (
            <a
              key={a.href}
              href={a.href}
              className="group flex flex-col gap-2.5 rounded-xl border border-border bg-secondary/30 p-3 transition-all hover:border-primary/30 hover:bg-secondary/60"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                  <path d={a.d} />
                </svg>
              </span>
              <div>
                <div className="text-[13px] font-medium text-foreground">{a.label}</div>
                <div className="text-[11px] text-muted-foreground">{a.sub}</div>
              </div>
            </a>
          ))}
        </div>
      </Card>

      {/* Recent Activity Placeholder */}
      <Card className="p-4 sm:p-5">
        <h3 className="text-sm sm:text-base font-medium text-foreground mb-3 sm:mb-4">Recent Activity</h3>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-[10px] font-bold text-foreground">
                  U{i}
                </div>
                <div>
                  <div className="text-xs sm:text-sm text-foreground">New deposit request</div>
                  <div className="text-[10px] text-muted-foreground">{i} minute{i > 1 ? 's' : ''} ago</div>
                </div>
              </div>
              <span className="text-xs font-medium text-amber-600">Pending</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}