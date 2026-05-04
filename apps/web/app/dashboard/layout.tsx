"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "@/app/providers/auth-provider"
import { NotificationProvider } from "@/app/providers/notification-provider"
import { NotificationBell, ToastNotification } from "@/app/components/notification-bell"

const mainItems = [
  { href: "/dashboard", label: "Overview", icon: "home" },
  { href: "/dashboard/transactions", label: "Transactions", icon: "history" },
]

const actionItems = [
  { href: "/dashboard/investments", label: "Buy Crypto", icon: "wallet" },
  { href: "/dashboard/withdraw", label: "Withdraw", icon: "send" },
  { href: "/dashboard/services", label: "Services", icon: "shopping" },
]

const insightItems = [
  { href: "/dashboard/strategies", label: "Strategies", icon: "trending" },
  { href: "/dashboard/risk", label: "Risk Management", icon: "shield" },
  { href: "/dashboard/explore", label: "Explore Markets", icon: "globe" },
]

const accountItems = [
  { href: "/dashboard/profile", label: "Profile", icon: "user" },
  { href: "/dashboard/support", label: "Support", icon: "help" },
]

const adminItems = [
  { href: "/admin", label: "Admin Panel", icon: "settings" },
]

function Icon({ name, className }: { name: string; className?: string }) {
  const icons: Record<string, React.ReactNode> = {
    home: <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
    history: <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
    wallet: <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>,
    send: <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>,
    shopping: <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>,
    trending: <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>,
    shield: <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
    globe: <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>,
    user: <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
    help: <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
    logout: <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
    bell: <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>,
    menu: <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>,
    settings: <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
  }
  return <span className="inline-flex">{icons[name]}</span>
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { user } = useAuth()
  const [mobileOpen, setMobileOpen] = React.useState(false)

  const allItems = user?.role === "admin" 
    ? [...mainItems, ...actionItems, ...insightItems, ...accountItems, ...adminItems]
    : [...mainItems, ...actionItems, ...insightItems, ...accountItems]
    
  const currentPage = allItems.find(i => i.href === pathname)

  return (
    <NotificationProvider userId={user?.id} isAdmin={user?.role === 'admin'}>
    <div className="min-h-screen bg-background flex">
      {/* Sidebar - fixed on mobile, sticky on desktop */}
      <aside className={`bg-card fixed lg:sticky top-0 h-screen w-56 z-50 border-r border-border ${
        mobileOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0`}>
        <div className="h-14 flex items-center px-4 border-b border-border">
          <Link href="/" className="flex items-center gap-2">
            <svg className="w-6 h-6" viewBox="0 0 44 45" fill="none">
              <path fillRule="evenodd" clipRule="evenodd" d="M18.4201 9.7905C19.2053 10.2438 19.4743 11.2477 19.021 12.0329L10.8134 26.2488C10.3601 27.034 9.35616 27.3029 8.57104 26.8497C7.78592 26.3964 7.51689 25.3924 7.9702 24.6073L16.1778 10.3913C16.6311 9.60622 17.635 9.33722 18.4201 9.7905ZM27.7561 13.3169C28.5412 13.7702 28.8102 14.7741 28.3569 15.5592L18.5078 32.6184C18.0545 33.4035 17.0506 33.6725 16.2655 33.2192C15.4803 32.7659 15.2113 31.762 15.6646 30.9769L25.5137 13.9177C25.967 13.1326 26.9709 12.8636 27.7561 13.3169ZM36.7357 20.7424C37.2646 19.8265 37.0569 18.7165 36.2717 18.2632C35.4866 17.8099 34.4214 18.185 33.8926 19.1009L24.317 35.6862C23.7882 36.6022 23.9959 37.7122 24.7811 38.1655C25.5662 38.6188 26.6314 38.2437 27.1602 37.3277L36.7357 20.7424Z" fill="oklch(0.21 0 0)"/>
            </svg>
            <span className="text-sm font-medium text-foreground">Next Level</span>
          </Link>
        </div>

        <nav className="p-2">
          <div className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider px-3 mt-4 mb-2">Main</div>
          {mainItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 px-3 py-2 rounded text-[13px] transition-colors ${
                  isActive ? 'bg-secondary text-foreground font-medium' : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                }`}
              >
                <Icon name={item.icon} className="w-4 h-4 flex-shrink-0" />
                <span>{item.label}</span>
              </Link>
            )
          })}

          <div className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider px-3 mt-4 mb-2">Actions</div>
          {actionItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 px-3 py-2 rounded text-[13px] transition-colors ${
                  isActive ? 'bg-secondary text-foreground font-medium' : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                }`}
              >
                <Icon name={item.icon} className="w-4 h-4 flex-shrink-0" />
                <span>{item.label}</span>
              </Link>
            )
          })}

          <div className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider px-3 mt-4 mb-2">Insights</div>
          {insightItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 px-3 py-2 rounded text-[13px] transition-colors ${
                  isActive ? 'bg-secondary text-foreground font-medium' : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                }`}
              >
                <Icon name={item.icon} className="w-4 h-4 flex-shrink-0" />
                <span>{item.label}</span>
              </Link>
            )
          })}

          <div className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider px-3 mt-4 mb-2">Account</div>
          {accountItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 px-3 py-2 rounded text-[13px] transition-colors ${
                  isActive ? 'bg-secondary text-foreground font-medium' : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                }`}
              >
                <Icon name={item.icon} className="w-4 h-4 flex-shrink-0" />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>

        <div className="absolute bottom-16 left-0 right-0 px-3">
          <button
            onClick={async () => {
              try {
                await fetch('/api/auth/signout', { method: 'POST' })
                window.location.href = '/login'
              } catch (e) {
                window.location.href = '/login'
              }
            }}
            className="w-full flex items-center gap-2 px-3 py-2 rounded text-[13px] text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-colors"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            <span>Sign Out</span>
          </button>
        </div>

        <div className="absolute bottom-3 left-0 right-0 px-3">
          <div className="flex items-center gap-3 p-2 bg-secondary rounded-md">
            <div className="w-7 h-7 rounded bg-[oklch(0.21_0_0)] flex items-center justify-center text-[oklch(1_0_180)] text-xs font-medium flex-shrink-0">
              {user?.name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || "U"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] text-foreground truncate">{user?.name || user?.email || "User"}</p>
              <p className="text-[11px] text-muted-foreground">{user?.role === "admin" ? "Admin" : "Investor"}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={() => setMobileOpen(false)} />
      )}

      {/* Main content */}
      <div className="flex-1">
        <header className="h-14 bg-card flex items-center justify-between px-6 sticky top-0 z-20 border-b border-border">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setMobileOpen(true)}
              className="p-2 rounded hover:bg-secondary lg:hidden"
            >
              <Icon name="menu" className="w-4 h-4 text-muted-foreground" />
            </button>
            <span className="text-[15px] font-medium text-foreground">
              {currentPage?.label || 'Dashboard'}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <NotificationBell />
          </div>
        </header>

        <main className="p-6">
          {children}
        </main>
        <ToastNotification />
      </div>
    </div>
    </NotificationProvider>
  )
}