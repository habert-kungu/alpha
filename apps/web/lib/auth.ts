import { SignJWT, jwtVerify } from "jose"
import bcrypt from "bcryptjs"
import prisma from "./db"

// Resolve the signing secret lazily so a missing value fails closed in
// production (never silently falling back to a known, forgeable default).
function getJwtSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET
  if (secret && secret.length >= 16) {
    return new TextEncoder().encode(secret)
  }
  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "JWT_SECRET is not set (or too short). Refusing to sign/verify tokens with an insecure default."
    )
  }
  // Development-only fallback. Clearly not for production use.
  return new TextEncoder().encode("dev-only-insecure-secret-do-not-use-in-prod")
}

export interface JWTPayload {
  userId: string
  email: string
  role: string
  name?: string
  /** User.tokenVersion at issue time; a mismatch means the session was revoked. */
  tv?: number
  [key: string]: unknown
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

export async function createToken(payload: JWTPayload): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getJwtSecret())
}

export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getJwtSecret())
    return payload as JWTPayload
  } catch {
    return null
  }
}

export async function createUser(
  email: string,
  password: string,
  name?: string,
  telegram?: string
) {
  const passwordHash = await hashPassword(password)
  return prisma.user.create({
    data: {
      email: email.toLowerCase().trim(),
      name: name?.trim(),
      telegram: telegram?.trim(),
      password: passwordHash,
      role: "user",
    },
  })
}

export async function validateUser(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } })
  if (!user || !user.password) return null

  const valid = await verifyPassword(password, user.password)
  if (!valid) return null

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    telegram: user.telegram,
    tokenVersion: user.tokenVersion,
  }
}
// ---------------------------------------------------------------------------
// Request-scoped session helpers for API routes
// ---------------------------------------------------------------------------

import { createHash, randomBytes } from "node:crypto"
import type { NextRequest, NextResponse } from "next/server"

export interface SessionUser {
  id: string
  email: string
  name: string | null
  role: string
  telegram: string | null
  tokenVersion: number
}

export const SESSION_COOKIE = "token"
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7 // 7 days

/** Builds the JWT claims for a user, stamping the current tokenVersion. */
export function sessionClaims(user: { id: string; email: string; role: string; name?: string | null; tokenVersion: number }): JWTPayload {
  return { userId: user.id, email: user.email, role: user.role, name: user.name || undefined, tv: user.tokenVersion }
}

/** Issues a session cookie on the given response. */
export async function setSessionCookie(
  response: NextResponse,
  user: { id: string; email: string; role: string; name?: string | null; tokenVersion: number }
) {
  response.cookies.set(SESSION_COOKIE, await createToken(sessionClaims(user)), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_MAX_AGE,
    path: "/",
  })
  return response
}

export function clearSessionCookie(response: NextResponse) {
  response.cookies.set(SESSION_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0,
    path: "/",
  })
  return response
}

/**
 * Resolves the signed-in user from the request cookie and re-reads them from
 * the database, so a role change, a deleted account, or a session revocation
 * (tokenVersion bump) takes effect immediately rather than whenever the 7-day
 * JWT happens to expire.
 */
export async function getSessionUser(request: NextRequest): Promise<SessionUser | null> {
  const token = request.cookies.get(SESSION_COOKIE)?.value
  if (!token) return null
  const payload = await verifyToken(token)
  if (!payload?.userId) return null
  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: { id: true, email: true, name: true, role: true, telegram: true, tokenVersion: true },
  })
  if (!user) return null
  // Tokens minted before this field existed carry no `tv`; treat as version 0.
  if ((payload.tv ?? 0) !== user.tokenVersion) return null
  return user
}

/**
 * Invalidates every session for a user by bumping tokenVersion. Returns the
 * updated user so the caller can re-issue a cookie for the current device.
 */
export async function revokeAllSessions(userId: string) {
  return prisma.user.update({
    where: { id: userId },
    data: { tokenVersion: { increment: 1 } },
    select: { id: true, email: true, name: true, role: true, telegram: true, tokenVersion: true },
  })
}

export async function getAdminUser(request: NextRequest): Promise<SessionUser | null> {
  const user = await getSessionUser(request)
  return user?.role === "admin" ? user : null
}

export function isStrongEnoughPassword(password: unknown): password is string {
  return typeof password === "string" && password.length >= 6 && password.length <= 128
}

// ---------------------------------------------------------------------------
// Password reset tokens (hashed at rest, single-use, 1h expiry)
// ---------------------------------------------------------------------------

export const RESET_TOKEN_TTL_MS = 60 * 60 * 1000

export function hashResetToken(token: string): string {
  return createHash("sha256").update(token).digest("hex")
}

export async function createPasswordResetToken(userId: string): Promise<string> {
  const token = randomBytes(32).toString("base64url")
  // Invalidate any outstanding tokens so only the newest link works.
  await prisma.passwordResetToken.updateMany({
    where: { userId, usedAt: null },
    data: { usedAt: new Date() },
  })
  await prisma.passwordResetToken.create({
    data: { userId, tokenHash: hashResetToken(token), expiresAt: new Date(Date.now() + RESET_TOKEN_TTL_MS) },
  })
  return token
}

/** Returns the owning user id if the token is valid, unused and unexpired. */
export async function consumePasswordResetToken(token: string): Promise<string | null> {
  if (typeof token !== "string" || token.length < 20) return null
  const record = await prisma.passwordResetToken.findUnique({ where: { tokenHash: hashResetToken(token) } })
  if (!record || record.usedAt || record.expiresAt.getTime() < Date.now()) return null
  await prisma.passwordResetToken.update({ where: { id: record.id }, data: { usedAt: new Date() } })
  return record.userId
}

export function generateTempPassword(): string {
  // 12 chars from an unambiguous alphabet (no 0/O/1/l).
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789"
  const bytes = randomBytes(12)
  let out = ""
  for (let i = 0; i < 12; i++) out += alphabet[bytes[i]! % alphabet.length]
  return out
}
