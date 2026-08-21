import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const protectedRoutes = ["/app"]
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
      return NextResponse.redirect(new URL("/app", request.url))
    }
    return NextResponse.next()
  }

  if (pathname === "/app/admin" || pathname.startsWith("/app/admin/")) {
    if (!token) {
      return NextResponse.redirect(new URL("/login", request.url))
    }

    try {
      const res = await fetch(new URL("/api/auth/verify-admin", request.url), {
        headers: { Cookie: `token=${token}` },
      })
      const data = await res.json()

      if (!data.isAdmin) {
        return NextResponse.redirect(new URL("/app", request.url))
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