import { NextRequest, NextResponse } from "next/server"
import { validateUser, createToken } from "@/lib/auth"
import { checkRateLimit, getRateLimitResetSeconds, clearRateLimit } from "@/lib/rate-limit"

const rateLimitKeyLogin = (email: string) => `login:${email.toLowerCase()}`

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      )
    }

    const rateLimitKey = `login:${email.toLowerCase()}`
    const rateLimit = checkRateLimit(rateLimitKey)
    
    if (!rateLimit.allowed) {
      const waitSeconds = getRateLimitResetSeconds(rateLimit.resetTime)
      return NextResponse.json(
        { error: `Too many login attempts. Please try again in ${waitSeconds} seconds.` },
        { status: 429 }
      )
    }

    const user = await validateUser(email, password)
    if (!user) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      )
    }

    clearRateLimit(rateLimitKeyLogin(email))

    const token = await createToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      name: user.name || undefined,
    })

    const response = NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        telegram: user.telegram,
      },
    })

    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    })

    return response
  } catch (error) {
    console.error("Signin error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}