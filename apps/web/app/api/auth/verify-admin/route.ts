import { NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/auth"
import prisma from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("token")?.value

    if (!token) {
      return NextResponse.json({ isAdmin: false }, { status: 200 })
    }

    const payload = await verifyToken(token)
    if (!payload) {
      return NextResponse.json({ isAdmin: false }, { status: 200 })
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { role: true },
    })

    return NextResponse.json({ isAdmin: user?.role === "admin" })
  } catch {
    return NextResponse.json({ isAdmin: false }, { status: 200 })
  }
}