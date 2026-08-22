"use client"

import * as React from "react"
import Link from "next/link"
import { Card } from "@/components/ui"
import { useAuth } from "@/app/providers/auth-provider"
import { useCachedFetch, invalidateCache } from "@/lib/use-cached-fetch"

interface Profile {
  user: { id: string; email: string; name: string | null; telegram: string | null; walletAddress: string | null; role: string; createdAt: string }
  stats: { totalDeposits: number; totalReturns: number; activeInvestments: number; completedCycles: number }
}

const inputCls =
  "w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-foreground focus:outline-none focus:ring-1 focus:ring-foreground"

/** X-style verified check: blue scalloped badge with a white tick. */
export function VerifiedBadge({ className = "h-5 w-5", title = "Verified account" }: { className?: string; title?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-label={title} role="img">
      <title>{title}</title>
      <path
        fill="#1d9bf0"
        d="M22.25 12c0-1.43-.88-2.67-2.19-3.34.46-1.39.2-2.9-.81-3.91s-2.52-1.27-3.91-.81c-.66-1.31-1.91-2.19-3.34-2.19s-2.67.88-3.33 2.19c-1.4-.46-2.91-.2-3.92.81s-1.26 2.52-.8 3.91c-1.31.67-2.2 1.91-2.2 3.34s.89 2.67 2.2 3.34c-.46 1.39-.21 2.9.8 3.91s2.52 1.26 3.91.81c.67 1.31 1.91 2.19 3.34 2.19s2.68-.88 3.34-2.19c1.39.45 2.9.2 3.91-.81s1.27-2.52.81-3.91c1.31-.67 2.19-1.91 2.19-3.34z"
      />
      <path fill="#fff" d="M10.3 16.1l-3.4-3.4 1.4-1.4 2 2 5.4-5.4 1.4 1.4z" />
    </svg>
  )
}

function initials(name: string | null, email: string) {
  const src = (name || email).trim()
  const parts = src.split(/\s+/).filter(Boolean)
  if (parts.length >= 2) return (parts[0]![0]! + parts[1]![0]!).toUpperCase()
  return src.slice(0, 2).toUpperCase()
}

function handleFor(p: Profile["user"]) {
  if (p.telegram) return p.telegram.startsWith("@") ? p.telegram : `@${p.telegram}`
  return `@${p.email.split("@")[0]}`
}

function Banner({ children }: { children?: React.ReactNode }) {
  return (
    <div className="relative h-28 overflow-hidden sm:h-40">
      <div className="absolute inset-0 bg-[linear-gradient(120deg,oklch(0.25_0.06_250),oklch(0.45_0.14_24)_55%,oklch(0.7_0.12_178))] opacity-90" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.25),transparent_55%)]" />
      <svg className="absolute inset-0 h-full w-full opacity-30" viewBox="0 0 600 160" preserveAspectRatio="none" aria-hidden="true">
        <path d="M0,120 C80,60 140,140 220,100 C300,60 360,120 440,80 C520,40 560,110 600,70 L600,160 L0,160 Z" fill="rgba(255,255,255,0.18)" />
        <path d="M0,140 C100,100 160,150 260,120 C360,90 420,140 520,110 C560,98 580,105 600,100 L600,160 L0,160 Z" fill="rgba(0,0,0,0.18)" />
      </svg>
      {children}
    </div>
  )
}

export default function ProfilePage() {
  const { user: session, setUser } = useAuth()
  const { data, loading, refresh, setData } = useCachedFetch<Profile>(session ? "/api/user/profile" : null, { ttl: 60_000 })

  const [editing, setEditing] = React.useState(false)
  const [form, setForm] = React.useState({ name: "", telegram: "", walletAddress: "" })
  const [saving, setSaving] = React.useState(false)
  const [msg, setMsg] = React.useState<{ tone: "ok" | "err"; text: string } | null>(null)

  const [pwOpen, setPwOpen] = React.useState(false)
  const [pw, setPw] = React.useState({ current: "", next: "", confirm: "" })
  const [pwBusy, setPwBusy] = React.useState(false)
  const [pwMsg, setPwMsg] = React.useState<{ tone: "ok" | "err"; text: string } | null>(null)

  const startEdit = () => {
    if (!data) return
    setForm({ name: data.user.name || "", telegram: data.user.telegram || "", walletAddress: data.user.walletAddress || "" })
    setMsg(null)
    setEditing(true)
  }

  const save = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMsg(null)
    try {
      const res = await fetch("/api/user/profile", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || "Couldn't save changes")
      if (data) setData({ ...data, user: json.user })
      if (session) setUser({ ...session, name: json.user.name, telegram: json.user.telegram })
      invalidateCache("/api/user/profile")
      setEditing(false)
      setMsg({ tone: "ok", text: "Profile updated" })
    } catch (err) {
      setMsg({ tone: "err", text: err instanceof Error ? err.message : "Couldn't save changes" })
    } finally {
      setSaving(false)
    }
  }

  const changePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setPwMsg(null)
    if (pw.next !== pw.confirm) {
      setPwMsg({ tone: "err", text: "New passwords don't match" })
      return
    }
    setPwBusy(true)
    try {
      const res = await fetch("/api/user/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword: pw.current, newPassword: pw.next }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || "Couldn't change password")
      setPw({ current: "", next: "", confirm: "" })
      setPwOpen(false)
      setPwMsg({ tone: "ok", text: "Password changed. A confirmation email is on its way." })
    } catch (err) {
      setPwMsg({ tone: "err", text: err instanceof Error ? err.message : "Couldn't change password" })
    } finally {
      setPwBusy(false)
    }
  }

  if (loading || !data) {
    return (
      <div className="space-y-4">
        <div className="h-40 animate-pulse rounded-xl bg-muted sm:h-52" />
        <div className="grid grid-cols-4 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-16 animate-pulse rounded-lg bg-muted" />
          ))}
        </div>
        <div className="h-48 animate-pulse rounded-xl bg-muted" />
      </div>
    )
  }

  const p = data.user
  const joined = new Date(p.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })
  const displayName = p.name || p.email.split("@")[0]

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header card */}
      <Card className="overflow-hidden">
        <Banner>
          <Link href="/app" className="absolute left-3 top-3 rounded-full bg-black/30 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur-sm hover:bg-black/45">
            ← Dashboard
          </Link>
        </Banner>

        <div className="px-4 pb-4 sm:px-6 sm:pb-6">
          <div className="-mt-10 flex items-end justify-between sm:-mt-14">
            <div className="relative z-10 flex h-20 w-20 items-center justify-center rounded-full border-4 border-card bg-[linear-gradient(135deg,oklch(0.45_0.08_250),oklch(0.2_0.02_265))] text-2xl font-bold text-white shadow-[0_8px_24px_rgba(0,0,0,0.35)] ring-1 ring-border sm:h-28 sm:w-28 sm:text-4xl">
              {initials(p.name, p.email)}
            </div>
            {!editing && (
              <button
                onClick={startEdit}
                className="rounded-full border border-border bg-card px-4 py-1.5 text-[13px] font-semibold text-foreground transition-colors hover:bg-secondary"
              >
                Edit profile
              </button>
            )}
          </div>

          {!editing ? (
            <div className="mt-3">
              <div className="flex flex-wrap items-center gap-1.5">
                <h1 className="text-xl font-bold leading-tight text-foreground sm:text-2xl">{displayName}</h1>
                <VerifiedBadge className="h-5 w-5 sm:h-6 sm:w-6" />
                {p.role === "admin" && (
                  <span className="ml-1 rounded-full bg-[var(--bg-info)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--color-info)]">Admin</span>
                )}
              </div>
              <p className="text-sm text-muted-foreground">{handleFor(p)}</p>

              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[13px] text-muted-foreground">
                <span className="inline-flex items-center gap-1.5">
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="M4 4h16v16H4z" /><path d="M4 8l8 5 8-5" /></svg>
                  {p.email}
                </span>
                {p.telegram && (
                  <a href={`https://t.me/${p.telegram.replace(/^@/, "")}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 hover:text-foreground">
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M21.5 3.5L2.6 10.9c-1.3.5-1.3 1.2-.2 1.5l4.8 1.5 11.2-7.1c.5-.3 1-.1.6.2l-9.1 8.2-.3 5c.5 0 .7-.2 1-.5l2.4-2.3 4.9 3.6c.9.5 1.6.2 1.8-.8L22.9 5c.3-1.3-.5-1.9-1.4-1.5z" /></svg>
                    {handleFor(p)}
                  </a>
                )}
                <span className="inline-flex items-center gap-1.5">
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></svg>
                  Joined {joined}
                </span>
              </div>

              {msg && (
                <p className={`mt-3 text-xs ${msg.tone === "ok" ? "text-[var(--color-success)]" : "text-destructive"}`}>{msg.text}</p>
              )}
            </div>
          ) : (
            <form onSubmit={save} className="mt-4 space-y-3">
              {msg?.tone === "err" && <div className="rounded-lg border border-destructive/25 bg-[var(--bg-danger)] p-2.5 text-xs text-destructive">{msg.text}</div>}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-medium text-foreground">Display name</label>
                  <input className={inputCls} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required minLength={2} maxLength={80} />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-foreground">Telegram</label>
                  <input className={inputCls} value={form.telegram} onChange={(e) => setForm({ ...form, telegram: e.target.value })} placeholder="@username" maxLength={64} />
                </div>
                <div className="sm:col-span-2">
                  <label className="mb-1 block text-xs font-medium text-foreground">
                    USDT wallet (TRC20) <span className="font-normal text-muted-foreground">— used for withdrawals</span>
                  </label>
                  <input className={`${inputCls} font-mono`} value={form.walletAddress} onChange={(e) => setForm({ ...form, walletAddress: e.target.value })} placeholder="T…" maxLength={128} />
                </div>
                <div className="sm:col-span-2">
                  <label className="mb-1 block text-xs font-medium text-foreground">Email</label>
                  <input className={`${inputCls} opacity-60`} value={p.email} disabled />
                  <p className="mt-1 text-[11px] text-muted-foreground">Contact support to change the email on your account.</p>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-1">
                <button type="button" onClick={() => setEditing(false)} disabled={saving} className="rounded-full border border-border px-4 py-1.5 text-[13px] font-medium text-muted-foreground hover:bg-secondary hover:text-foreground">
                  Cancel
                </button>
                <button type="submit" disabled={saving} className="rounded-full bg-foreground px-4 py-1.5 text-[13px] font-semibold text-background hover:opacity-90 disabled:opacity-50">
                  {saving ? "Saving…" : "Save"}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Stats strip */}
        <div className="grid grid-cols-2 divide-x divide-y divide-border border-t border-border sm:grid-cols-4 sm:divide-y-0">
          {[
            { label: "Deposited", value: `$${data.stats.totalDeposits.toLocaleString()}` },
            { label: "Returns", value: `$${data.stats.totalReturns.toLocaleString()}`, cls: "text-[var(--color-success)]" },
            { label: "Active", value: data.stats.activeInvestments },
            { label: "Completed", value: data.stats.completedCycles },
          ].map((s) => (
            <div key={s.label} className="px-4 py-3 text-center sm:py-4">
              <div className={`text-base font-bold tabular-nums sm:text-lg ${s.cls || "text-foreground"}`}>{s.value}</div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{s.label}</div>
            </div>
          ))}
        </div>
      </Card>

      {/* Security */}
      <Card className="p-4 sm:p-6">
        <h2 className="mb-4 text-sm font-medium text-foreground sm:text-base">Security</h2>
        <div className="space-y-3">
          <div className="rounded-lg bg-secondary/50 p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-medium text-foreground sm:text-sm">Password</div>
                <div className="text-[10px] text-muted-foreground sm:text-xs">Use at least 6 characters. You'll get an email when it changes.</div>
              </div>
              <button
                onClick={() => {
                  setPwMsg(null)
                  setPwOpen((o) => !o)
                }}
                className="text-xs font-medium text-foreground hover:underline sm:text-sm"
              >
                {pwOpen ? "Cancel" : "Change"}
              </button>
            </div>
            {pwMsg && <p className={`mt-2 text-xs ${pwMsg.tone === "ok" ? "text-[var(--color-success)]" : "text-destructive"}`}>{pwMsg.text}</p>}
            {pwOpen && (
              <form onSubmit={changePassword} className="mt-3 grid grid-cols-1 gap-3 border-t border-border/60 pt-3 sm:grid-cols-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-foreground">Current password</label>
                  <input className={inputCls} type="password" value={pw.current} onChange={(e) => setPw({ ...pw, current: e.target.value })} required autoComplete="current-password" />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-foreground">New password</label>
                  <input className={inputCls} type="password" value={pw.next} onChange={(e) => setPw({ ...pw, next: e.target.value })} required minLength={6} autoComplete="new-password" />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-foreground">Confirm new password</label>
                  <input className={inputCls} type="password" value={pw.confirm} onChange={(e) => setPw({ ...pw, confirm: e.target.value })} required minLength={6} autoComplete="new-password" />
                </div>
                <div className="flex justify-end sm:col-span-3">
                  <button type="submit" disabled={pwBusy} className="rounded-full bg-foreground px-4 py-1.5 text-[13px] font-semibold text-background hover:opacity-90 disabled:opacity-50">
                    {pwBusy ? "Updating…" : "Update password"}
                  </button>
                </div>
              </form>
            )}
          </div>

          <div className="flex items-center justify-between rounded-lg bg-secondary/50 p-3 sm:p-4">
            <div>
              <div className="text-xs font-medium text-foreground sm:text-sm">Forgot your password?</div>
              <div className="text-[10px] text-muted-foreground sm:text-xs">We'll email {p.email} a secure reset link.</div>
            </div>
            <Link href="/forgot-password" className="text-xs font-medium text-foreground hover:underline sm:text-sm">Send link</Link>
          </div>
        </div>
      </Card>
    </div>
  )
}
