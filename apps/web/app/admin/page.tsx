"use client"

import * as React from "react"
import prisma from "@/lib/db"

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-card border border-border rounded-lg ${className}`}>
      {children}
    </div>
  )
}

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
          <a href="/admin/deposits" className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-center hover:bg-amber-100 transition-colors">
            <div className="text-sm font-medium text-amber-800">Pending Deposits</div>
            <div className="text-xs text-amber-600">{stats.pendingDeposits} awaiting</div>
          </a>
          <a href="/admin/investments" className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-center hover:bg-emerald-100 transition-colors">
            <div className="text-sm font-medium text-emerald-800">Active Cycles</div>
            <div className="text-xs text-emerald-600">{stats.activeInvestments} running</div>
          </a>
          <a href="/admin/users" className="p-3 rounded-lg bg-blue-50 border border-blue-200 text-center hover:bg-blue-100 transition-colors">
            <div className="text-sm font-medium text-blue-800">Manage Users</div>
            <div className="text-xs text-blue-600">{stats.totalUsers} total</div>
          </a>
          <a href="/admin/transactions" className="p-3 rounded-lg bg-purple-50 border border-purple-200 text-center hover:bg-purple-100 transition-colors">
            <div className="text-sm font-medium text-purple-800">View Transactions</div>
            <div className="text-xs text-purple-600">All history</div>
          </a>
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