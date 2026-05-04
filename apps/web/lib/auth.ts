import { SignJWT, jwtVerify } from "jose"
import bcrypt from "bcryptjs"
import prisma from "./db"

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "next-level-secret-key-change-in-production"
)

export interface JWTPayload {
  userId: string
  email: string
  role: string
  name?: string
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
    .sign(JWT_SECRET)
}

export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
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
  }
}