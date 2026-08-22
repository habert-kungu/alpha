import { NextRequest, NextResponse } from "next/server"
import { validateUser, setSessionCookie } from "@/lib/auth"
import { checkRateLimit, getRateLimitResetSeconds, clearRateLimit } from "@/lib/rate-limit"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    const rateLimitKey = `login:${String(email).toLowerCase()}`
    const rateLimit = checkRateLimit(rateLimitKey)
    if (!rateLimit.allowed) {
      const waitSeconds = getRateLimitResetSeconds(rateLimit.resetTime)
      return NextResponse.json({ error: `Too many login attempts. Please try again in ${waitSeconds} seconds.` }, { status: 429 })
    }

    const user = await validateUser(email, password)
    if (!user) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 })
    }

    clearRateLimit(rateLimitKey)

    const response = NextResponse.json({
      user: { id: user.id, email: user.email, name: user.name, role: user.role, telegram: user.telegram },
    })
    return setSessionCookie(response, user)
  } catch (error) {
    console.error("Signin error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
