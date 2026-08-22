import nodemailer from "nodemailer"
import type { Transporter } from "nodemailer"

/**
 * Transactional email. Configured entirely through env:
 *
 *   SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_SECURE ("true" for 465)
 *   MAIL_FROM   e.g. "AlphaReserve <no-reply@alphareserve.net>"
 *   APP_URL     public origin used in links, e.g. https://alphareserve.net
 *   ADMIN_EMAIL optional — receives admin notices (new deposit requests)
 *
 * When SMTP_HOST is unset (local dev) nothing is sent; the message is logged
 * to the server console instead so flows can still be exercised end-to-end.
 */

const APP_NAME = "AlphaReserve"

export function isMailConfigured(): boolean {
  return !!process.env.SMTP_HOST
}

export function appUrl(path = ""): string {
  const base = (process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000").replace(/\/$/, "")
  return `${base}${path}`
}

let cached: Transporter | null = null
function getTransport(): Transporter {
  if (cached) return cached
  const port = Number(process.env.SMTP_PORT || 587)
  cached = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure: process.env.SMTP_SECURE === "true" || port === 465,
    auth: process.env.SMTP_USER
      ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
      : undefined,
  })
  return cached
}

export interface MailMessage {
  to: string
  subject: string
  html: string
  text?: string
}

/** Never throws — email failures must not break the request that triggered them. */
export async function sendMail(msg: MailMessage): Promise<{ sent: boolean; error?: string; previewUrl?: string }> {
  const from = process.env.MAIL_FROM || `${APP_NAME} <no-reply@localhost>`
  if (!isMailConfigured()) {
    console.log(
      `\n📧 [mail:dev] To: ${msg.to}\n   Subject: ${msg.subject}\n   ${(msg.text || stripHtml(msg.html)).replace(/\n/g, "\n   ")}\n`
    )
    return { sent: false, error: "SMTP not configured" }
  }
  try {
    const info = await getTransport().sendMail({ from, to: msg.to, subject: msg.subject, html: msg.html, text: msg.text || stripHtml(msg.html) })
    // Only set for Ethereal test accounts (used by scripts/send-test-email.ts).
    const previewUrl = nodemailer.getTestMessageUrl(info) || undefined
    return { sent: true, previewUrl }
  } catch (error) {
    console.error("sendMail failed:", error)
    return { sent: false, error: error instanceof Error ? error.message : "send failed" }
  }
}

function stripHtml(html: string): string {
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|div|h\d|li|tr)>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
}

function escape(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;")
}

/** Minimal, inline-styled layout that renders consistently across mail clients. */
function layout(title: string, body: string): string {
  return `<!doctype html>
<html><body style="margin:0;padding:0;background:#f4f5f7;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#111">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f4f5f7;padding:32px 12px">
    <tr><td align="center">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:520px;background:#fff;border-radius:12px;border:1px solid #e6e8eb">
        <tr><td style="padding:24px 28px 0;font-size:15px;font-weight:600;letter-spacing:-0.01em">${APP_NAME}</td></tr>
        <tr><td style="padding:20px 28px 0;font-size:20px;font-weight:600">${escape(title)}</td></tr>
        <tr><td style="padding:12px 28px 28px;font-size:14px;line-height:1.6;color:#333">${body}</td></tr>
      </table>
      <p style="max-width:520px;margin:16px auto 0;font-size:12px;color:#888;text-align:center">
        You're receiving this because you have an ${APP_NAME} account. If this wasn't you, you can safely ignore this email.
      </p>
    </td></tr>
  </table>
</body></html>`
}

function button(href: string, label: string): string {
  return `<p style="margin:20px 0"><a href="${href}" style="display:inline-block;background:#111;color:#fff;text-decoration:none;padding:11px 18px;border-radius:8px;font-weight:600;font-size:14px">${escape(label)}</a></p>
<p style="font-size:12px;color:#666;word-break:break-all">Or copy this link: ${href}</p>`
}

// ---------------------------------------------------------------------------
// Templates
// ---------------------------------------------------------------------------

export function welcomeEmail(to: string, name?: string | null) {
  const who = name ? `Hi ${escape(name)},` : "Hi,"
  return sendMail({
    to,
    subject: `Welcome to ${APP_NAME}`,
    html: layout("Welcome aboard", `<p>${who}</p>
<p>Your ${APP_NAME} account is ready. Sign in to fund your first pool and track your returns in real time.</p>
${button(appUrl("/login"), "Open your dashboard")}`),
  })
}

export function passwordResetEmail(to: string, token: string, name?: string | null) {
  const link = appUrl(`/reset-password?token=${encodeURIComponent(token)}`)
  return sendMail({
    to,
    subject: `Reset your ${APP_NAME} password`,
    html: layout("Reset your password", `<p>${name ? `Hi ${escape(name)},` : "Hi,"}</p>
<p>We received a request to reset the password for this account. The link below is valid for <strong>1 hour</strong> and can only be used once.</p>
${button(link, "Choose a new password")}
<p style="color:#666">If you didn't request this, no action is needed — your password stays the same.</p>`),
  })
}

export function passwordChangedEmail(to: string, name?: string | null) {
  return sendMail({
    to,
    subject: `Your ${APP_NAME} password was changed`,
    html: layout("Password changed", `<p>${name ? `Hi ${escape(name)},` : "Hi,"}</p>
<p>The password for your account was just changed. If you made this change, you're all set.</p>
<p>If you <strong>didn't</strong> change it, reset your password immediately and contact support.</p>
${button(appUrl("/forgot-password"), "Secure my account")}`),
  })
}

export function accountCreatedByAdminEmail(to: string, tempPassword: string, name?: string | null) {
  return sendMail({
    to,
    subject: `Your ${APP_NAME} account`,
    html: layout("Your account is ready", `<p>${name ? `Hi ${escape(name)},` : "Hi,"}</p>
<p>An account was created for you on ${APP_NAME}. Sign in with the temporary password below and change it from your profile.</p>
<p style="margin:16px 0;padding:12px 14px;background:#f4f5f7;border-radius:8px;font-family:ui-monospace,Menlo,monospace;font-size:14px">
  <strong>Email:</strong> ${escape(to)}<br/>
  <strong>Temporary password:</strong> ${escape(tempPassword)}
</p>
${button(appUrl("/login"), "Sign in")}`),
  })
}

export function passwordResetByAdminEmail(to: string, tempPassword: string, name?: string | null) {
  return sendMail({
    to,
    subject: `Your ${APP_NAME} password was reset`,
    html: layout("Your password was reset", `<p>${name ? `Hi ${escape(name)},` : "Hi,"}</p>
<p>An administrator reset the password on your account and you've been signed out everywhere. Sign in with the temporary password below, then choose a new one from <strong>Profile → Security</strong>.</p>
<p style="margin:16px 0;padding:12px 14px;background:#f4f5f7;border-radius:8px;font-family:ui-monospace,Menlo,monospace;font-size:14px">
  <strong>Email:</strong> ${escape(to)}<br/>
  <strong>Temporary password:</strong> ${escape(tempPassword)}
</p>
${button(appUrl("/login"), "Sign in")}
<p style="color:#666">If you weren't expecting this, contact support.</p>`),
  })
}

export function investmentDecisionEmail(
  to: string,
  opts: { approved: boolean; amount: number; pool: string; targetValue?: number; name?: string | null }
) {
  const poolLabel = opts.pool === "daily" ? "48H Pool" : "Weekly Pool"
  const amount = `$${opts.amount.toLocaleString()}`
  const body = opts.approved
    ? `<p>${opts.name ? `Hi ${escape(opts.name)},` : "Hi,"}</p>
<p>Your <strong>${poolLabel}</strong> deposit of <strong>${amount}</strong> has been confirmed and your cycle is now active${
        opts.targetValue ? ` with a target of <strong>$${opts.targetValue.toLocaleString()}</strong>` : ""
      }.</p>
${button(appUrl("/app"), "Track your cycle")}`
    : `<p>${opts.name ? `Hi ${escape(opts.name)},` : "Hi,"}</p>
<p>We couldn't confirm your <strong>${poolLabel}</strong> deposit of <strong>${amount}</strong>. This usually means the transaction hash didn't match an incoming transfer.</p>
<p>Please double-check the details and contact support if you believe this is a mistake.</p>
${button(appUrl("/app/support"), "Contact support")}`
  return sendMail({
    to,
    subject: opts.approved ? `Deposit confirmed — ${amount} ${poolLabel}` : `Deposit not confirmed — ${amount} ${poolLabel}`,
    html: layout(opts.approved ? "Deposit confirmed" : "Deposit not confirmed", body),
  })
}

export function depositReceivedEmail(
  to: string,
  opts: { amount: number; pool: string; txHash: string; investmentId: string; roi: number; name?: string | null }
) {
  const poolLabel = opts.pool === "daily" ? "48H Pool" : "Weekly Pool"
  const amount = `$${opts.amount.toLocaleString()}`
  const target = `$${Math.round(opts.amount * opts.roi).toLocaleString()}`
  return sendMail({
    to,
    subject: `Deposit received — ${amount} ${poolLabel} (pending review)`,
    html: layout("We've received your deposit request", `<p>${opts.name ? `Hi ${escape(opts.name)},` : "Hi,"}</p>
<p>Your <strong>${poolLabel}</strong> deposit of <strong>${amount}</strong> has been submitted and is now <strong>pending review</strong>. We match the transaction on-chain and activate your cycle — this usually takes under an hour during trading sessions.</p>
<p style="margin:16px 0;padding:12px 14px;background:#f4f5f7;border-radius:8px;font-family:ui-monospace,Menlo,monospace;font-size:13px">
  <strong>Amount:</strong> ${amount} USDT<br/>
  <strong>Pool:</strong> ${poolLabel} · ${opts.roi}x · target ${target}<br/>
  <strong>TX:</strong> ${escape(opts.txHash)}<br/>
  <strong>Reference:</strong> ${escape(opts.investmentId)}
</p>
<p>You'll get another email as soon as it's confirmed. Nothing else is needed from you.</p>
${button(appUrl("/app/transactions"), "View status")}`),
  })
}

export function newDepositAdminEmail(opts: { userEmail: string; userName?: string | null; amount: number; pool: string; txHash: string; investmentId: string; network?: string }) {
  const to = process.env.ADMIN_EMAIL
  if (!to) return Promise.resolve({ sent: false, error: "ADMIN_EMAIL not set" })
  return sendMail({
    to,
    subject: `New deposit request — $${opts.amount.toLocaleString()} from ${opts.userName || opts.userEmail}`,
    html: layout("New deposit request", `<p><strong>${escape(opts.userName || opts.userEmail)}</strong> (${escape(opts.userEmail)}) submitted a ${opts.pool === "daily" ? "48H" : "Weekly"} Pool deposit.</p>
<p style="margin:16px 0;padding:12px 14px;background:#f4f5f7;border-radius:8px;font-family:ui-monospace,Menlo,monospace;font-size:13px">
  <strong>Amount:</strong> $${opts.amount.toLocaleString()}<br/>
  <strong>Network:</strong> ${escape(opts.network || "TRC20")}<br/>
  <strong>TX:</strong> ${escape(opts.txHash)}<br/>
  <strong>ID:</strong> ${escape(opts.investmentId)}
</p>
${button(appUrl("/app/admin/deposits"), "Review in admin panel")}`),
  })
}

// ---------------------------------------------------------------------------
// Admin communications
// ---------------------------------------------------------------------------

export function mailStatus() {
  return {
    configured: isMailConfigured(),
    host: process.env.SMTP_HOST || null,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === "true" || Number(process.env.SMTP_PORT || 587) === 465,
    from: process.env.MAIL_FROM || `${APP_NAME} <no-reply@localhost>`,
    appUrl: appUrl(),
    adminEmail: process.env.ADMIN_EMAIL || null,
  }
}

/** Checks the SMTP connection/credentials without sending anything. */
export async function verifyMailTransport(): Promise<{ ok: boolean; error?: string }> {
  if (!isMailConfigured()) return { ok: false, error: "SMTP_HOST is not set" }
  try {
    await getTransport().verify()
    return { ok: true }
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "verify failed" }
  }
}

/** Turns admin-written plain text into safe, paragraphed HTML (blank line = new paragraph). */
function textToHtml(text: string): string {
  return text
    .trim()
    .split(/\n{2,}/)
    .map((para) => `<p>${escape(para).replace(/\n/g, "<br/>")}</p>`)
    .join("\n")
}

export function customEmail(to: string, opts: { subject: string; body: string; name?: string | null; ctaLabel?: string; ctaUrl?: string }) {
  const greeting = opts.name ? `<p>Hi ${escape(opts.name)},</p>` : ""
  const cta = opts.ctaUrl && opts.ctaLabel ? button(opts.ctaUrl, opts.ctaLabel) : ""
  return sendMail({
    to,
    subject: opts.subject,
    html: layout(opts.subject, `${greeting}${textToHtml(opts.body)}${cta}`),
  })
}

export function testEmail(to: string) {
  return sendMail({
    to,
    subject: `${APP_NAME} test email`,
    html: layout("Email is working", `<p>This is a test message from the ${APP_NAME} admin panel.</p>
<p>If you can read this, outbound email is configured correctly and users will receive password resets, welcome emails and deposit updates.</p>
${button(appUrl("/app/admin/communications"), "Back to Communications")}`),
  })
}
