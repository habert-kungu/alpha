"use client"

import * as React from "react"

interface ServerNotification {
  id: string
  userId: string
  type: string
  title: string
  message: string
  data: unknown
  readAt: string | null
  createdAt: string
}

export interface Notification {
  id: string
  type: string
  title: string
  message: string
  timestamp: Date
  read: boolean
}

interface NotificationContextType {
  notifications: Notification[]
  unreadCount: number
  markAsRead: (id: string) => void
  markAllAsRead: () => void
}

const NotificationContext = React.createContext<NotificationContextType | undefined>(undefined)

function uiTypeFor(serverType: string): string {
  switch (serverType) {
    case "INVESTMENT_APPROVED":
    case "CYCLE_COMPLETED":
    case "WITHDRAWAL_PROCESSED":
      return "success"
    case "INVESTMENT_REJECTED":
      return "error"
    case "INVESTMENT_CREATED":
      return "investment"
    default:
      return "info"
  }
}

function toUi(n: ServerNotification): Notification {
  return {
    id: n.id,
    type: uiTypeFor(n.type),
    title: n.title,
    message: n.message,
    timestamp: new Date(n.createdAt),
    read: n.readAt !== null,
  }
}

export function NotificationProvider({
  children,
  userId,
}: {
  children: React.ReactNode
  userId?: string
  isAdmin?: boolean
}) {
  const [notifications, setNotifications] = React.useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = React.useState(0)

  const refresh = React.useCallback(async () => {
    try {
      const res = await fetch("/api/notifications?limit=50", { cache: "no-store" })
      if (!res.ok) return
      const json = (await res.json()) as {
        notifications: ServerNotification[]
        unreadCount: number
      }
      setNotifications(json.notifications.map(toUi))
      setUnreadCount(json.unreadCount)
    } catch (err) {
      console.error("notification fetch failed", err)
    }
  }, [])

  const markAsRead = React.useCallback(
    async (id: string) => {
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
      )
      setUnreadCount((c) => Math.max(0, c - 1))
      try {
        await fetch("/api/notifications", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id }),
        })
      } catch (err) {
        console.error("markAsRead failed", err)
        refresh()
      }
    },
    [refresh],
  )

  const markAllAsRead = React.useCallback(async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
    setUnreadCount(0)
    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ all: true }),
      })
    } catch (err) {
      console.error("markAllAsRead failed", err)
      refresh()
    }
  }, [refresh])

  React.useEffect(() => {
    if (!userId) return
    refresh()

    const es = new EventSource("/api/notifications/stream")
    es.addEventListener("new", () => {
      refresh()
    })
    es.onerror = () => {
      // EventSource auto-reconnects; nothing to do.
    }
    return () => {
      es.close()
    }
  }, [userId, refresh])

  return (
    <NotificationContext.Provider
      value={{ notifications, unreadCount, markAsRead, markAllAsRead }}
    >
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotifications() {
  const context = React.useContext(NotificationContext)
  if (!context) {
    throw new Error("useNotifications must be used within NotificationProvider")
  }
  return context
}
