import { NextRequest } from "next/server"
import { verifyToken } from "@/lib/auth"
import { getNotificationListener } from "@/lib/notifications/listener"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  const token = request.cookies.get("token")?.value
  if (!token) {
    return new Response("Unauthorized", { status: 401 })
  }
  const payload = await verifyToken(token)
  if (!payload?.userId) {
    return new Response("Unauthorized", { status: 401 })
  }
  const userId = payload.userId as string
  const isAdmin = payload.role === "admin"

  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    start(controller) {
      let closed = false
      const send = (event: string, data: unknown) => {
        if (closed) return
        try {
          controller.enqueue(
            encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`),
          )
        } catch {
          closed = true
        }
      }

      send("ready", { userId })

      const listener = getNotificationListener()
      const unsubscribe = listener.subscribe((notifiedUserId) => {
        if (notifiedUserId === userId || (isAdmin && notifiedUserId === "__admin__")) {
          send("new", { userId: notifiedUserId })
        }
      })

      const heartbeat = setInterval(() => {
        if (closed) return
        try {
          controller.enqueue(encoder.encode(`: ping\n\n`))
        } catch {
          closed = true
        }
      }, 25_000)

      const cleanup = () => {
        if (closed) return
        closed = true
        clearInterval(heartbeat)
        unsubscribe()
        try {
          controller.close()
        } catch {
          // already closed
        }
      }

      request.signal.addEventListener("abort", cleanup)
    },
  })

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  })
}
