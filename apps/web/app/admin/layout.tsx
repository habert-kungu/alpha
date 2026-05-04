"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"

const navItems = [
  { href: "/admin", label: "Dashboard", icon: "home" },
  { href: "/admin/deposits", label: "Deposits", icon: "deposit" },
  { href: "/admin/investments", label: "Investments", icon: "investment" },
  { href: "/admin/transactions", label: "Transactions", icon: "transaction" },
  { href: "/admin/users", label: "Users", icon: "user" },
  { href: "/dashboard", label: "Back to User", icon: "back" },
]

function Icon({ name, className }: { name: string; className?: string }) {
  const icons: Record<string, React.ReactNode> = {
    home: <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>,
    deposit: <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>,
    investment: <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>,
    transaction: <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"/></svg>,
    user: <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/></svg>,
    back: <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M10 19l-7-7m0 0l7-7m-7 18h18M5 12h14"/></svg>,
    menu: <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>,
  }
  return <span className="inline-flex">{icons[name]}</span>
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = React.useState(false)

  const currentPage = navItems.find(i => i.href === pathname)

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar - fixed on mobile, sticky on desktop */}
      <aside className={`bg-card fixed lg:sticky top-0 h-screen w-56 z-50 border-r border-border ${
        mobileOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0`}>
        <div className="h-14 flex items-center px-4 border-b border-border">
          <Link href="/admin" className="flex items-center gap-2">
            <svg className="w-6 h-6" viewBox="0 0 44 45" fill="none">
              <path fillRule="evenodd" clipRule="evenodd" d="M18.4201 9.7905C19.2053 10.2438 19.4743 11.2477 19.021 12.0329L10.8134 26.2488C10.3601 27.034 9.35616 27.3029 8.57104 26.8497C7.78592 26.3964 7.51689 25.3924 7.9702 24.6073L16.1778 10.3913C16.6311 9.60622 17.635 9.33722 18.4201 9.7905ZM27.7561 13.3169C28.5412 13.7702 28.8102 14.7741 28.3569 15.5592L18.5078 32.6184C18.0545 33.4035 17.0506 33.6725 16.2655 33.2192C15.4803 32.7659 15.2113 31.762 15.6646 30.9769L25.5137 13.9177C25.967 13.1326 26.9709 12.8636 27.7561 13.3169ZM36.7357 20.7424C37.2646 19.8265 37.0569 18.7165 36.2717 18.2632C35.4866 17.8099 34.4214 18.185 33.8926 19.1009L24.317 35.6862C23.7882 36.6022 23.9959 37.7122 24.7811 38.1655C25.5662 38.6188 26.6314 38.2437 27.1602 37.3277L36.7357 20.7424Z" fill="oklch(0.21 0 0)"/>
            </svg>
            <span className="text-sm font-medium text-foreground">Next Level</span>
          </Link>
        </div>

        <nav className="p-2">
          <div className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider px-3 mt-3 mb-2">Admin</div>
          {navItems.slice(0, 5).map((item) => {
            const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href))
            const iconKey = item.href === "/admin" ? "home" : item.href === "/admin/deposits" ? "deposit" : item.href === "/admin/investments" ? "investment" : item.href === "/admin/transactions" ? "transaction" : "user"
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 px-3 py-2 rounded text-[13px] transition-colors ${
                  isActive ? 'bg-secondary text-foreground font-medium' : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                }`}
              >
                <Icon name={iconKey} className="w-4 h-4 flex-shrink-0" />
                <span>{item.label}</span>
              </Link>
            )
          })}

          <div className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider px-3 mt-4 mb-2">Navigate</div>
          <Link
            href="/dashboard"
            className="flex items-center gap-2 px-3 py-2 rounded text-[13px] transition-colors text-muted-foreground hover:text-foreground hover:bg-secondary"
          >
            <Icon name="back" className="w-4 h-4 flex-shrink-0" />
            <span>Back to User</span>
          </Link>
          
          <button
            onClick={async () => {
              try {
                await fetch('/api/auth/signout', { method: 'POST' })
                window.location.href = '/login'
              } catch (e) {
                window.location.href = '/login'
              }
            }}
            className="w-full flex items-center gap-2 px-3 py-2 rounded text-[13px] text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-colors mt-2"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            <span>Sign Out</span>
          </button>
        </nav>
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={() => setMobileOpen(false)} />
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Header */}
        <header className="h-14 bg-card flex items-center justify-between px-4 sticky top-0 z-20 border-b border-border">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setMobileOpen(true)}
              className="p-2 rounded hover:bg-secondary lg:hidden"
            >
              <Icon name="menu" className="w-5 h-5 text-muted-foreground" />
            </button>
            <h1 className="text-[15px] font-medium text-foreground">
              {currentPage?.label || 'Admin'}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-2 py-1 bg-emerald-50 rounded-full">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-[10px] font-medium text-emerald-700">Live</span>
            </div>
            <div className="w-8 h-8 rounded-full bg-[oklch(0.21_0_0)] flex items-center justify-center text-[oklch(1_0_180)] text-xs font-medium">
              A
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 sm:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}