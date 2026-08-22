import { NextRequest, NextResponse } from "next/server"
import { getAdminUser } from "@/lib/auth"
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
      data,
      select: { id: true, email: true, name: true, telegram: true, role: true },
    })
    return NextResponse.json({ success: true, user })
  } catch (error) {
    console.error("Error updating user:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
