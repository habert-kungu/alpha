import { NextRequest, NextResponse } from 'next/server'
import { getAdminUser } from '@/lib/auth'
import { investmentDecisionEmail } from '@/lib/mail'
import prisma from '@/lib/db'
import { triggerNotification, CHANNELS, EVENTS } from '@/lib/pusher'

export async function PATCH(request: NextRequest) {
  try {
    if (!(await getAdminUser(request))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { investmentId, action } = body

    if (!investmentId || !action) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    if (!['approve', 'reject'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    const investment = await prisma.investment.findUnique({
      where: { id: investmentId },
      include: { user: { select: { email: true, name: true } } },
    })

    if (!investment) {
      return NextResponse.json({ error: 'Investment not found' }, { status: 404 })
    }

    if (investment.status !== 'pending') {
      return NextResponse.json({ error: 'Investment already processed' }, { status: 400 })
    }

    const newStatus = action === 'approve' ? 'active' : 'rejected'
    
    const updated = await prisma.investment.update({
      where: { id: investmentId },
      data: { status: newStatus },
    })

    if (action === 'approve' && updated.status === 'active') {
      const targetValue = updated.amount * updated.roi
      
      const cycle = await prisma.cycle.create({
        data: {
          investmentId: updated.id,
          userId: updated.userId,
          startValue: updated.amount,
          currentValue: updated.amount,
          targetValue,
          progress: 0,
          status: 'active',
        },
      })

      await prisma.transaction.create({
        data: {
          userId: updated.userId,
          type: 'investment',
          amount: updated.amount,
          netAmount: updated.amount,
          currency: 'USDT',
          status: 'completed',
          note: `${updated.pool === 'daily' ? '48H' : 'Weekly'} Pool investment activated`,
        },
      })

      triggerNotification(CHANNELS.USER(updated.userId), EVENTS.INVESTMENT_APPROVED, {
        investmentId: updated.id,
        amount: updated.amount,
        pool: updated.pool,
        targetValue,
        cycleId: cycle.id,
        message: `Your ${updated.pool === 'daily' ? '48H' : 'Weekly'} Pool investment of $${updated.amount} has been approved!`,
      })
      void investmentDecisionEmail(investment.user.email, { approved: true, amount: updated.amount, pool: updated.pool, targetValue, name: investment.user.name })
    } else if (action === 'reject') {
      await prisma.transaction.create({
        data: {
          userId: updated.userId,
          type: 'investment',
          amount: updated.amount,
          netAmount: updated.amount,
          currency: 'USDT',
          status: 'rejected',
          note: `Investment rejected`,
        },
      })

      triggerNotification(CHANNELS.USER(updated.userId), EVENTS.INVESTMENT_REJECTED, {
        investmentId: updated.id,
        amount: updated.amount,
        pool: updated.pool,
        message: `Your investment of $${updated.amount} was not approved. Please contact support.`,
      })
      void investmentDecisionEmail(investment.user.email, { approved: false, amount: updated.amount, pool: updated.pool, name: investment.user.name })
    }

    return NextResponse.json({ 
      success: true, 
      investment: {
        id: updated.id,
        status: updated.status,
      }
    })
  } catch (error) {
    console.error('Error updating investment:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}