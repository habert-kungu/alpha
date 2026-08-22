import { NextRequest, NextResponse } from "next/server"
import { consumePasswordResetToken, hashPassword, isStrongEnoughPassword } from "@/lib/auth"
import { passwordChangedEmail } from "@/lib/mail"
import prisma from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { token, password } = body

    if (!token || !password) {
      return NextResponse.json({ error: "Token and new password are required" }, { status: 400 })
    }
    if (!isStrongEnoughPassword(password)) {
      return NextResponse.json({ error: "Password must be 6–128 characters" }, { status: 400 })
    }

    const userId = await consumePasswordResetToken(token)
    if (!userId) {
      return NextResponse.json({ error: "This reset link is invalid or has expired. Request a new one." }, { status: 400 })
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: { password: await hashPassword(password) },
      select: { email: true, name: true },
    })
    await passwordChangedEmail(user.email, user.name)

    // Clear any existing session cookie so the user signs in fresh.
    const res = NextResponse.json({ success: true })
    res.cookies.set("token", "", { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", maxAge: 0, path: "/" })
    return res
  } catch (error) {
    console.error("Reset password error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
