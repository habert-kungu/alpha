import type { Prisma } from "@prisma/client"

export type NotificationType =
  | "INVESTMENT_CREATED"
  | "INVESTMENT_APPROVED"
  | "INVESTMENT_REJECTED"
  | "CYCLE_COMPLETED"
  | "WITHDRAWAL_PROCESSED"

export interface NotificationInput {
  userId: string
  type: NotificationType
  title: string
  message: string
  data?: Prisma.InputJsonValue
}

/**
 * Create a notification using the given Prisma client (typically a transaction client).
 * The Postgres trigger fires pg_notify('new_notification', userId) automatically.
 */
export function createNotification(
  client: Prisma.TransactionClient | { notification: { create: (args: { data: NotificationInput & { data?: Prisma.InputJsonValue } }) => Promise<unknown> } },
  input: NotificationInput,
) {
  return client.notification.create({
    data: {
      userId: input.userId,
      type: input.type,
      title: input.title,
      message: input.message,
      data: input.data,
    },
  })
}
