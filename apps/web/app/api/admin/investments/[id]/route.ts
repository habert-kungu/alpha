import { NextRequest, NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { verifyToken } from '@/lib/auth'
import prisma from '@/lib/db'
import { createNotification } from '@/lib/notifications/create'

export async function PATCH(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = await verifyToken(token)
    if (!payload?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Re-verify admin role from DB (don't trust the JWT alone — handles demoted admins).
    const adminUser = await prisma.user.findUnique({
      where: { id: payload.userId as string },
      select: { role: true },
    })
    if (adminUser?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { investmentId, action } = body

    if (!investmentId || typeof investmentId !== 'string') {
      return NextResponse.json({ error: 'Missing investmentId' }, { status: 400 })
    }
    if (!['approve', 'reject'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    const result = await prisma.$transaction(async (tx) => {
      const investment = await tx.investment.findUnique({ where: { id: investmentId } })
      if (!investment) return { error: 'Investment not found' as const, status: 404 }
      if (investment.status !== 'pending') {
        return { error: 'Investment already processed' as const, status: 400 }
      }

      const newStatus = action === 'approve' ? 'active' : 'rejected'
      const updated = await tx.investment.update({
        where: { id: investmentId },
        data: { status: newStatus },
      })

      const poolLabel = updated.pool === 'daily' ? '24H' : 'Weekly'
      const amountStr = updated.amount.toFixed(2)

      if (action === 'approve') {
        const targetValue = updated.amount.mul(updated.roi)

        const cycle = await tx.cycle.create({
          data: {
            investmentId: updated.id,
            userId: updated.userId,
            startValue: updated.amount,
            currentValue: updated.amount,
            targetValue,
            progress: new Prisma.Decimal(0),
            status: 'active',
          },
        })

        await tx.transaction.create({
          data: {
            userId: updated.userId,
            type: 'investment',
            amount: updated.amount,
            netAmount: updated.amount,
            currency: 'USDT',
            status: 'completed',
            note: `${poolLabel} Pool investment activated`,
          },
        })

        await createNotification(tx, {
          userId: updated.userId,
          type: 'INVESTMENT_APPROVED',
          title: 'Investment Approved',
          message: `Your ${poolLabel} Pool investment of $${amountStr} has been approved.`,
          data: {
            investmentId: updated.id,
            cycleId: cycle.id,
            amount: amountStr,
            pool: updated.pool,
            targetValue: targetValue.toFixed(2),
          },
        })
      } else {
        await tx.transaction.create({
          data: {
            userId: updated.userId,
            type: 'investment',
            amount: updated.amount,
            netAmount: updated.amount,
            currency: 'USDT',
            status: 'rejected',
            note: 'Investment rejected',
          },
        })

        await createNotification(tx, {
          userId: updated.userId,
          type: 'INVESTMENT_REJECTED',
          title: 'Investment Rejected',
          message: `Your investment of $${amountStr} was not approved. Please contact support.`,
          data: {
            investmentId: updated.id,
            amount: amountStr,
            pool: updated.pool,
          },
        })
      }

      return {
        ok: true as const,
        investment: { id: updated.id, status: updated.status },
      }
    })

    if ('error' in result) {
      return NextResponse.json({ error: result.error }, { status: result.status })
    }

    return NextResponse.json({ success: true, investment: result.investment })
  } catch (error) {
    console.error('Error updating investment:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
