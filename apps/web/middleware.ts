import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const protectedRoutes = ["/dashboard"]
const authRoutes = ["/login", "/signup"]

export async function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value
  const { pathname } = request.nextUrl

  if (pathname.startsWith("/api")) {
    return NextResponse.next()
  }

  if (pathname.startsWith("/_next") || pathname.startsWith("/static") || pathname.includes(".")) {
    return NextResponse.next()
  }

  if (authRoutes.some(route => pathname === route || pathname.startsWith(route + "/"))) {
    if (token) {
      return NextResponse.redirect(new URL("/dashboard", request.url))
    }
    return NextResponse.next()
  }

  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    if (!token) {
      return NextResponse.redirect(new URL("/login", request.url))
    }

    try {
      const res = await fetch(new URL("/api/auth/verify-admin", request.url), {
        headers: { Cookie: `token=${token}` },
      })
      const data = await res.json()

      if (!data.isAdmin) {
        return NextResponse.redirect(new URL("/dashboard", request.url))
      }
    } catch {
      return NextResponse.redirect(new URL("/login", request.url))
    }

    return NextResponse.next()
  }

  if (protectedRoutes.some(route => pathname === route || pathname.startsWith(route + "/"))) {
    if (!token) {
      return NextResponse.redirect(new URL("/login", request.url))
    }
    return NextResponse.next()
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)",
  ],
}