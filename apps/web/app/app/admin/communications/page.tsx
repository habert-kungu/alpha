"use client"

import * as React from "react"
import { Card } from "@/components/ui"
import { useCachedFetch } from "@/lib/use-cached-fetch"
import { PageHeader, Skeleton, inputCls } from "../_components"

interface MailStatus {
  configured: boolean
  host: string | null
  port: number
  secure: boolean
  from: string
  appUrl: string
  adminEmail: string | null
  connection: { ok: boolean; error?: string }
  audience: { all: number; users: number; admins: number }
}

type Audience = "all" | "users" | "admins" | "email"

export default function CommunicationsPage() {
  const { data, loading, refresh, refreshing } = useCachedFetch<MailStatus>("/api/admin/mail", { ttl: 60_000 })

  const [testing, setTesting] = React.useState(false)
  const [testMsg, setTestMsg] = React.useState<{ ok: boolean; text: string } | null>(null)

  const [audience, setAudience] = React.useState<Audience>("users")
  const [email, setEmail] = React.useState("")
  const [subject, setSubject] = React.useState("")
  const [message, setMessage] = React.useState("")
  const [ctaLabel, setCtaLabel] = React.useState("")
  const [ctaUrl, setCtaUrl] = React.useState("")
  const [confirm, setConfirm] = React.useState(false)
  const [sending, setSending] = React.useState(false)
  const [sendMsg, setSendMsg] = React.useState<{ ok: boolean; text: string } | null>(null)

  const sendTest = async () => {
    setTesting(true)
    setTestMsg(null)
    try {
      const res = await fetch("/api/admin/mail", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "test" }) })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || "Failed")
      setTestMsg(json.sent ? { ok: true, text: `Test email sent to ${json.to}. Check the inbox (and spam).` } : { ok: false, text: `Not sent: ${json.error}. The message was logged to the server console instead.` })
    } catch (err) {
      setTestMsg({ ok: false, text: err instanceof Error ? err.message : "Failed" })
    } finally {
      setTesting(false)
    }
  }

  const recipientCount = !data ? 0 : audience === "all" ? data.audience.all : audience === "users" ? data.audience.users : audience === "admins" ? data.audience.admins : 1

  const send = async () => {
    setSending(true)
    setSendMsg(null)
    try {
      const res = await fetch("/api/admin/mail", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "send", to: audience === "email" ? email.trim() : audience, subject, body: message, ctaLabel, ctaUrl }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || "Failed to send")
      setConfirm(false)
      if (json.sent === 0 && json.failed.length) {
        setSendMsg({ ok: false, text: `0 of ${json.requested} delivered — SMTP isn't configured or rejected the send. Messages were logged to the server console.` })
      } else {
        setSendMsg({ ok: true, text: `Sent to ${json.sent} of ${json.requested} recipient${json.requested === 1 ? "" : "s"}${json.failed.length ? ` (failed: ${json.failed.join(", ")})` : ""}.` })
        setSubject("")
        setMessage("")
        setCtaLabel("")
        setCtaUrl("")
      }
    } catch (err) {
      setSendMsg({ ok: false, text: err instanceof Error ? err.message : "Failed to send" })
    } finally {
      setSending(false)
    }
  }

  if (loading || !data) return <Skeleton rows={3} />

  const ok = data.configured && data.connection.ok

  return (
    <div className="space-y-4 sm:space-y-6">
      <PageHeader title="Communications" subtitle="Email delivery status and messages to your users" right={refreshing ? <span className="text-[11px] text-muted-foreground">Checking…</span> : undefined} />

      {/* Status */}
      <Card className="p-4 sm:p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-3">
            <span className={`mt-1 h-2.5 w-2.5 flex-shrink-0 rounded-full ${ok ? "bg-[var(--color-success)]" : "bg-[var(--color-warning)]"}`} />
            <div>
              <div className="text-sm font-medium text-foreground">{ok ? "Email delivery is working" : data.configured ? "SMTP configured, but the connection failed" : "Email is not configured"}</div>
              <div className="mt-0.5 text-xs text-muted-foreground">
                {ok
                  ? `Connected to ${data.host}:${data.port}${data.secure ? " (TLS)" : ""}. Sending as ${data.from}.`
                  : data.configured
                    ? data.connection.error
                    : "Set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS and MAIL_FROM in the server environment. Until then, every email is printed to the server log instead of delivered."}
              </div>
              <dl className="mt-3 grid grid-cols-1 gap-x-6 gap-y-1 text-[11px] sm:grid-cols-2">
                <div className="flex gap-2"><dt className="text-muted-foreground">From</dt><dd className="font-mono text-foreground">{data.from}</dd></div>
                <div className="flex gap-2"><dt className="text-muted-foreground">Links point to</dt><dd className="font-mono text-foreground">{data.appUrl}</dd></div>
                <div className="flex gap-2"><dt className="text-muted-foreground">Admin notices</dt><dd className="font-mono text-foreground">{data.adminEmail || "— (set ADMIN_EMAIL)"}</dd></div>
                <div className="flex gap-2"><dt className="text-muted-foreground">Audience</dt><dd className="text-foreground">{data.audience.users} users · {data.audience.admins} admins</dd></div>
              </dl>
            </div>
          </div>
          <div className="flex flex-shrink-0 gap-2">
            <button onClick={() => refresh()} className="rounded-lg border border-border px-3 py-2 text-xs font-medium text-muted-foreground hover:bg-secondary hover:text-foreground">Re-check</button>
            <button onClick={sendTest} disabled={testing} className="rounded-lg bg-primary px-3 py-2 text-xs font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50">
              {testing ? "Sending…" : "Send me a test email"}
            </button>
          </div>
        </div>
        {testMsg && <p className={`mt-3 text-xs ${testMsg.ok ? "text-[var(--color-success)]" : "text-destructive"}`}>{testMsg.text}</p>}
      </Card>

      {/* Automatic emails */}
      <Card className="p-4 sm:p-5">
        <h3 className="mb-3 text-sm font-medium text-foreground">Automatic emails</h3>
        <ul className="grid grid-cols-1 gap-2 text-xs text-muted-foreground sm:grid-cols-2">
          {[
            ["Welcome", "when someone signs up"],
            ["Password reset link", "from “Forgot password” (1-hour, single-use)"],
            ["Password changed", "after a reset or a change from the profile"],
            ["Deposit received", "to the user as soon as they submit a deposit (pending review)"],
            ["Deposit confirmed / not confirmed", "when you approve or reject a deposit"],
            ["Account details", "when you add a user here (temporary password)"],
            ["Password reset by admin", "temporary password when you reset someone from Users"],
            ["New deposit request", `to ${data.adminEmail || "ADMIN_EMAIL"} for every submission`],
          ].map(([t, d]) => (
            <li key={t} className="flex gap-2 rounded-lg bg-secondary/40 px-3 py-2">
              <span className="text-[var(--color-success)]">✓</span>
              <span><span className="font-medium text-foreground">{t}</span> — {d}</span>
            </li>
          ))}
        </ul>
      </Card>

      {/* Compose */}
      <Card className="p-4 sm:p-5">
        <h3 className="mb-1 text-sm font-medium text-foreground">Message your users</h3>
        <p className="mb-4 text-xs text-muted-foreground">Sent with the AlphaReserve email design. Plain text — a blank line starts a new paragraph.</p>

        {sendMsg && (
          <div className={`mb-4 rounded-lg border p-3 text-xs ${sendMsg.ok ? "border-[var(--color-success)]/25 bg-[var(--bg-success)] text-foreground" : "border-destructive/25 bg-[var(--bg-danger)] text-destructive"}`}>{sendMsg.text}</div>
        )}

        <div className="space-y-3">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-foreground">To</label>
              <select className={inputCls} value={audience} onChange={(e) => setAudience(e.target.value as Audience)}>
                <option value="users">All investors ({data.audience.users})</option>
                <option value="all">Everyone incl. admins ({data.audience.all})</option>
                <option value="admins">Admins only ({data.audience.admins})</option>
                <option value="email">A single email address</option>
              </select>
            </div>
            {audience === "email" && (
              <div>
                <label className="mb-1 block text-xs font-medium text-foreground">Email address</label>
                <input className={inputCls} type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="user@example.com" />
              </div>
            )}
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-foreground">Subject</label>
            <input className={inputCls} value={subject} onChange={(e) => setSubject(e.target.value)} maxLength={150} placeholder="e.g. Weekly pool closes Friday" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-foreground">Message</label>
            <textarea className={`${inputCls} min-h-[160px] resize-y`} value={message} onChange={(e) => setMessage(e.target.value)} maxLength={5000} placeholder="Hi everyone,&#10;&#10;…" />
            <div className="mt-1 text-right text-[10px] text-muted-foreground">{message.length}/5000</div>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-foreground">Button label <span className="font-normal text-muted-foreground">(optional)</span></label>
              <input className={inputCls} value={ctaLabel} onChange={(e) => setCtaLabel(e.target.value)} maxLength={60} placeholder="Open dashboard" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-foreground">Button link</label>
              <input className={inputCls} value={ctaUrl} onChange={(e) => setCtaUrl(e.target.value)} placeholder={`${data.appUrl}/app`} />
            </div>
          </div>
          <div className="flex items-center justify-between gap-3 pt-1">
            <span className="text-[11px] text-muted-foreground">
              {ok ? `Will deliver to ${recipientCount} recipient${recipientCount === 1 ? "" : "s"}.` : "Email isn't configured — sends will only be logged on the server."}
            </span>
            {!confirm ? (
              <button
                onClick={() => setConfirm(true)}
                disabled={subject.trim().length < 2 || message.trim().length < 2 || (audience === "email" && !email.includes("@"))}
                className="rounded-lg bg-primary px-4 py-2 text-xs font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
              >
                Review & send
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-xs text-foreground">Send “{subject.trim()}” to {recipientCount} recipient{recipientCount === 1 ? "" : "s"}?</span>
                <button onClick={() => setConfirm(false)} disabled={sending} className="rounded-lg border border-border px-3 py-2 text-xs font-medium text-muted-foreground hover:bg-secondary hover:text-foreground">Cancel</button>
                <button onClick={send} disabled={sending} className="rounded-lg bg-primary px-3 py-2 text-xs font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50">{sending ? "Sending…" : "Send now"}</button>
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  )
}
