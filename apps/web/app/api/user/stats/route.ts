import { NextRequest, NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { verifyToken } from '@/lib/auth'
import prisma from '@/lib/db'

const ZERO = new Prisma.Decimal(0)

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = await verifyToken(token)
    if (!payload?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = payload.userId as string

    const [investments, transactions] = await Promise.all([
      prisma.investment.findMany({
        where: { userId },
        include: { cycles: true },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.transaction.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 20,
      }),
    ])

    const activeInvestments = investments.filter((i) => i.status === 'active' || i.status === 'pending')
    const completedInvestments = investments.filter((i) => i.status === 'completed')

    const totalInvested = investments.reduce((sum, i) => sum.add(i.amount), ZERO)
    const totalProfit = completedInvestments.reduce(
      (sum, i) => sum.add(i.amount.mul(i.roi).sub(i.amount)),
      ZERO,
    )

    const activeCycles = investments
      .filter((i) => i.status === 'active' && i.cycles.length > 0)
      .flatMap((i) =>
        i.cycles
          .filter((c) => c.status === 'active')
          .map((cycle) => ({
            id: cycle.id,
            pool: i.pool,
            startValue: cycle.startValue.toFixed(2),
            currentValue: cycle.currentValue.toFixed(2),
            targetValue: cycle.targetValue.toFixed(2),
            progress: cycle.progress.toNumber(),
            status: cycle.status,
            _pending: cycle.targetValue.sub(cycle.currentValue),
          })),
      )

    const pendingReturns = activeCycles.reduce((sum, c) => sum.add(c._pending), ZERO)
    const totalAssets = completedInvestments
      .reduce((sum, i) => sum.add(i.amount.mul(i.roi)), ZERO)
      .add(activeInvestments.reduce((sum, i) => sum.add(i.amount), ZERO))

    return NextResponse.json({
      totalAssets: totalAssets.toFixed(2),
      totalInvested: totalInvested.toFixed(2),
      totalProfit: totalProfit.toFixed(2),
      pendingReturns: pendingReturns.toFixed(2),
      activeCycles: activeCycles.map(({ _pending: _omit, ...c }) => c),
      recentTransactions: transactions.map((t) => ({
        id: t.id,
        type: t.type,
        amount: t.amount.toFixed(2),
        status: t.status,
        createdAt: t.createdAt.toISOString(),
      })),
    })
  } catch (error) {
    console.error('Error fetching user stats:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
