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
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10) || 1)
    const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get('pageSize') || '10', 10) || 10))

    const where = status && status !== 'all' ? { status } : {}

    // Page of rows, total for the current filter, and unfiltered status counts
    // (so the stat cards stay accurate regardless of the active filter) — all in
    // one round-trip.
    const [total, investments, statusGroups] = await Promise.all([
      prisma.investment.count({ where }),
      prisma.investment.findMany({
        where,
        include: {
          user: { select: { id: true, email: true, name: true, telegram: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.investment.groupBy({ by: ['status'], _count: { _all: true } }),
    ])

    const stats = { all: 0, pending: 0, active: 0, completed: 0, rejected: 0 }
    for (const g of statusGroups) {
      const count = g._count._all
      stats.all += count
      if (g.status in stats) stats[g.status as keyof typeof stats] = count
    }

    const formatted = investments.map(inv => ({
      id: inv.id,
      userId: inv.user.id,
      userName: inv.user.name || inv.user.email,
      userEmail: inv.user.email,
      userTelegram: inv.user.telegram,
      amount: inv.amount,
      pool: inv.pool,
      roi: inv.roi,
      txHash: inv.txHash,
      network: inv.network,
      status: inv.status,
      createdAt: inv.createdAt.toISOString(),
    }))

    return NextResponse.json({
      investments: formatted,
      total,
      page,
      pageSize,
      pageCount: Math.max(1, Math.ceil(total / pageSize)),
      stats,
    })
  } catch (error) {
    console.error('Error fetching investments:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}