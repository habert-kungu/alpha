import { NextRequest, NextResponse } from "next/server"
import { getAdminUser, createUser, generateTempPassword, isStrongEnoughPassword } from "@/lib/auth"
import { accountCreatedByAdminEmail } from "@/lib/mail"
import prisma from "@/lib/db"

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function GET(request: NextRequest) {
  try {
    if (!(await getAdminUser(request))) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const q = (searchParams.get("q") || "").trim().toLowerCase()
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10) || 1)
    const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get("pageSize") || "10", 10) || 10))

    const where = q
      ? { OR: [{ email: { contains: q } }, { name: { contains: q } }, { telegram: { contains: q } }] }
      : {}

    const [total, users, deposits, returns] = await Promise.all([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
        select: {
          id: true,
          email: true,
          name: true,
          telegram: true,
          role: true,
          createdAt: true,
          _count: { select: { investments: true } },
        },
      }),
      prisma.investment.groupBy({ by: ["userId"], _sum: { amount: true }, where: { status: { in: ["active", "completed"] } } }),
      prisma.transaction.groupBy({ by: ["userId"], _sum: { amount: true }, where: { type: "return", status: "completed" } }),
    ])

    const depositsBy = new Map(deposits.map((d) => [d.userId, d._sum.amount || 0]))
    const returnsBy = new Map(returns.map((r) => [r.userId, r._sum.amount || 0]))

    const totals = {
      users: await prisma.user.count(),
      deposits: deposits.reduce((s, d) => s + (d._sum.amount || 0), 0),
      returns: returns.reduce((s, r) => s + (r._sum.amount || 0), 0),
    }

    return NextResponse.json({
      users: users.map((u) => ({
        id: u.id,
        email: u.email,
        name: u.name,
        telegram: u.telegram,
        role: u.role,
        createdAt: u.createdAt.toISOString(),
        investments: u._count.investments,
        deposits: depositsBy.get(u.id) || 0,
        returns: returnsBy.get(u.id) || 0,
      })),
      total,
      page,
      pageSize,
      pageCount: Math.max(1, Math.ceil(total / pageSize)),
      totals,
    })
  } catch (error) {
    console.error("Error listing users:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!(await getAdminUser(request))) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await request.json()
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : ""
    const name = typeof body.name === "string" ? body.name.trim() : ""
    const telegram = typeof body.telegram === "string" ? body.telegram.trim() : ""
    const role = body.role === "admin" ? "admin" : "user"

    if (!EMAIL_RE.test(email)) {
      return NextResponse.json({ error: "Enter a valid email address" }, { status: 400 })
    }
    if (body.password !== undefined && body.password !== "" && !isStrongEnoughPassword(body.password)) {
      return NextResponse.json({ error: "Password must be 6–128 characters" }, { status: 400 })
    }

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json({ error: "A user with that email already exists" }, { status: 409 })
    }

    const password: string = body.password || generateTempPassword()
    const user = await createUser(email, password, name || undefined, telegram || undefined)
    if (role === "admin") {
      await prisma.user.update({ where: { id: user.id }, data: { role: "admin" } })
    }

    const mail = await accountCreatedByAdminEmail(email, password, name || null)

    return NextResponse.json({
      success: true,
      user: { id: user.id, email: user.email, name: user.name, telegram: user.telegram, role, createdAt: user.createdAt.toISOString() },
      // Surface the temp password to the admin only when it could not be emailed.
      tempPassword: mail.sent ? undefined : password,
      emailSent: mail.sent,
    })
  } catch (error) {
    console.error("Error creating user:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
