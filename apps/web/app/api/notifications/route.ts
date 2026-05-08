import { NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/auth"
import prisma from "@/lib/db"

export const runtime = "nodejs"

async function authUser(request: NextRequest) {
  const token = request.cookies.get("token")?.value
  if (!token) return null
  const payload = await verifyToken(token)
  if (!payload?.userId) return null
  return payload
}

export async function GET(request: NextRequest) {
  const payload = await authUser(request)
  if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const limit = Math.min(parseInt(searchParams.get("limit") || "50", 10), 100)
  const cursor = searchParams.get("cursor") || undefined

  const [notifications, unreadCount] = await Promise.all([
    prisma.notification.findMany({
      where: { userId: payload.userId as string },
      orderBy: { createdAt: "desc" },
      take: limit,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    }),
    prisma.notification.count({
      where: { userId: payload.userId as string, readAt: null },
    }),
  ])

  return NextResponse.json({
    notifications,
    unreadCount,
    nextCursor: notifications.length === limit ? notifications[notifications.length - 1]!.id : null,
  })
}

export async function PATCH(request: NextRequest) {
  const payload = await authUser(request)
  if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await request.json().catch(() => ({}))
  const { id, all } = body as { id?: string; all?: boolean }

  if (all) {
    const result = await prisma.notification.updateMany({
      where: { userId: payload.userId as string, readAt: null },
      data: { readAt: new Date() },
    })
    return NextResponse.json({ updated: result.count })
  }

  if (typeof id !== "string" || id.length === 0) {
    return NextResponse.json({ error: "id or all required" }, { status: 400 })
  }

  const result = await prisma.notification.updateMany({
    where: { id, userId: payload.userId as string, readAt: null },
    data: { readAt: new Date() },
  })
  return NextResponse.json({ updated: result.count })
}
