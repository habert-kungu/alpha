import { Client } from "pg"

type Listener = (userId: string) => void

const globalForListener = globalThis as unknown as {
  __notifListener?: NotificationListener
}

class NotificationListener {
  private client: Client | null = null
  private listeners = new Set<Listener>()
  private connecting: Promise<void> | null = null
  private reconnectDelayMs = 1000
  private stopped = false

  async ensureConnected(): Promise<void> {
    if (this.client) return
    if (this.connecting) return this.connecting
    this.connecting = this.connect()
    try {
      await this.connecting
    } finally {
      this.connecting = null
    }
  }

  private async connect(): Promise<void> {
    const client = new Client({ connectionString: process.env.DATABASE_URL })
    client.on("notification", (msg) => {
      if (msg.channel !== "new_notification" || !msg.payload) return
      const userId = msg.payload
      for (const fn of this.listeners) {
        try {
          fn(userId)
        } catch (err) {
          console.error("notification listener fn threw", err)
        }
      }
    })
    client.on("error", (err) => {
      console.error("pg LISTEN client error", err)
      this.handleDisconnect()
    })
    client.on("end", () => {
      this.handleDisconnect()
    })

    await client.connect()
    await client.query('LISTEN "new_notification"')
    this.client = client
    this.reconnectDelayMs = 1000
  }

  private handleDisconnect() {
    if (this.stopped) return
    this.client = null
    const delay = this.reconnectDelayMs
    this.reconnectDelayMs = Math.min(this.reconnectDelayMs * 2, 30_000)
    setTimeout(() => {
      this.ensureConnected().catch((err) => {
        console.error("LISTEN reconnect failed", err)
      })
    }, delay)
  }

  subscribe(fn: Listener): () => void {
    this.listeners.add(fn)
    this.ensureConnected().catch((err) => {
      console.error("LISTEN connect failed", err)
    })
    return () => {
      this.listeners.delete(fn)
    }
  }
}

export function getNotificationListener(): NotificationListener {
  if (!globalForListener.__notifListener) {
    globalForListener.__notifListener = new NotificationListener()
  }
  return globalForListener.__notifListener
}
