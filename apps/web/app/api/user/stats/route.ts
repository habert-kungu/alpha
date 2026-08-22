import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import prisma from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = await verifyToken(token)
    if (!payload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = payload.userId

    const investments = await prisma.investment.findMany({
      where: { userId },
      include: { cycles: true },
      orderBy: { createdAt: 'desc' }
    })

    const transactions = await prisma.transaction.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 20
    })

    const activeInvestments = investments.filter((i: any) => i.status === 'active' || i.status === 'pending')
    const completedInvestments = investments.filter((i: any) => i.status === 'completed')

    const totalInvested = investments.reduce((sum: number, i: any) => sum + i.amount, 0)
    const totalProfit = completedInvestments.reduce((sum: number, i: any) => sum + (i.amount * i.roi - i.amount), 0)
    
    const activeCycles = investments
      .filter((i: any) => i.status === 'active' && i.cycles.length > 0)
      .flatMap((i: any) => i.cycles.filter((c: any) => c.status === 'active'))
      .map((cycle: any) => ({
        id: cycle.id,
        pool: investments.find((inv: any) => inv.id === cycle.investmentId)?.pool || 'weekly',
        roi: investments.find((inv: any) => inv.id === cycle.investmentId)?.roi ?? (cycle.startValue ? cycle.targetValue / cycle.startValue : 10),
        startValue: cycle.startValue,
        currentValue: cycle.currentValue,
        targetValue: cycle.targetValue,
        progress: cycle.progress,
        status: cycle.status,
      }))

    const pendingReturns = activeCycles.reduce((sum: number, c: any) => sum + (c.targetValue - c.currentValue), 0)

    const totalAssets = completedInvestments.reduce((sum: number, i: any) => sum + i.amount * i.roi, 0) + 
      activeInvestments.reduce((sum: number, i: any) => sum + i.amount, 0)

    return NextResponse.json({
      totalAssets: Math.round(totalAssets * 100) / 100,
      totalInvested: Math.round(totalInvested * 100) / 100,
      totalProfit: Math.round(totalProfit * 100) / 100,
      pendingReturns: Math.round(pendingReturns * 100) / 100,
      activeCycles,
      recentTransactions: transactions.map((t: any) => ({
        id: t.id,
        type: t.type,
        amount: t.amount,
        status: t.status,
        createdAt: t.createdAt.toISOString(),
      })),
    })
  } catch (error) {
    console.error('Error fetching user stats:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}