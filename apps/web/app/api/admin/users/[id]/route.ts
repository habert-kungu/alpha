import { NextRequest, NextResponse } from "next/server"
import { getAdminUser, generateTempPassword, hashPassword, isStrongEnoughPassword } from "@/lib/auth"
import { passwordResetByAdminEmail } from "@/lib/mail"
import prisma from "@/lib/db"

type Ctx = { params: Promise<{ id: string }> }

export async function DELETE(request: NextRequest, { params }: Ctx) {
  try {
    const admin = await getAdminUser(request)
    if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

    const { id } = await params
    if (id === admin.id) {
      return NextResponse.json({ error: "You can't remove your own account" }, { status: 400 })
    }

    const target = await prisma.user.findUnique({ where: { id }, select: { id: true, role: true } })
    if (!target) return NextResponse.json({ error: "User not found" }, { status: 404 })

    if (target.role === "admin") {
      const admins = await prisma.user.count({ where: { role: "admin" } })
      if (admins <= 1) {
        return NextResponse.json({ error: "Can't remove the last admin" }, { status: 400 })
      }
    }

    // Delete dependents explicitly (oldest → newest FK order) so this works on
    // databases created before the schema gained ON DELETE CASCADE.
    await prisma.$transaction([
      prisma.cycle.deleteMany({ where: { userId: id } }),
      prisma.transaction.deleteMany({ where: { userId: id } }),
      prisma.investment.deleteMany({ where: { userId: id } }),
      prisma.passwordResetToken.deleteMany({ where: { userId: id } }),
      prisma.user.delete({ where: { id } }),
    ])
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting user:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: Ctx) {
  try {
    const admin = await getAdminUser(request)
    if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

    const { id } = await params
    const body = await request.json()
    const data: { role?: string; name?: string; telegram?: string | null } = {}

    if (body.role !== undefined) {
      if (!["admin", "user"].includes(body.role)) {
        return NextResponse.json({ error: "Invalid role" }, { status: 400 })
      }
      if (id === admin.id && body.role !== "admin") {
        return NextResponse.json({ error: "You can't demote your own account" }, { status: 400 })
      }
      data.role = body.role
    }
    if (typeof body.name === "string") data.name = body.name.trim()
    if (typeof body.telegram === "string") data.telegram = body.telegram.trim() || null

    const user = await prisma.user.update({
      where: { id },
      // A role change invalidates the user's sessions so the old role can't linger in a JWT.
      data: data.role !== undefined ? { ...data, tokenVersion: { increment: 1 } } : data,
      select: { id: true, email: true, name: true, telegram: true, role: true },
    })
    return NextResponse.json({ success: true, user })
  } catch (error) {
    console.error("Error updating user:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

/**
 * POST { action: "resetPassword", password? }
 * Sets a new (or generated temporary) password, signs the user out everywhere
 * and emails them the temporary password. The password is only returned to the
 * admin when it could not be emailed.
 */
export async function POST(request: NextRequest, { params }: Ctx) {
  try {
    const admin = await getAdminUser(request)
    if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

    const { id } = await params
    const body = await request.json().catch(() => ({}))
    if (body.action !== "resetPassword") return NextResponse.json({ error: "Unknown action" }, { status: 400 })
    if (body.password !== undefined && body.password !== "" && !isStrongEnoughPassword(body.password)) {
      return NextResponse.json({ error: "Password must be 6–128 characters" }, { status: 400 })
    }

    const target = await prisma.user.findUnique({ where: { id }, select: { id: true, email: true, name: true } })
    if (!target) return NextResponse.json({ error: "User not found" }, { status: 404 })

    const password: string = body.password || generateTempPassword()
    await prisma.user.update({
      where: { id },
      data: { password: await hashPassword(password), tokenVersion: { increment: 1 } },
    })
    // Any outstanding "forgot password" links are now moot.
    await prisma.passwordResetToken.updateMany({ where: { userId: id, usedAt: null }, data: { usedAt: new Date() } })

    const mail = await passwordResetByAdminEmail(target.email, password, target.name)
    return NextResponse.json({
      success: true,
      email: target.email,
      emailSent: mail.sent,
      tempPassword: mail.sent ? undefined : password,
      sessionsRevoked: true,
    })
  } catch (error) {
    console.error("Error resetting user password:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
