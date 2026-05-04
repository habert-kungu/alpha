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

    const where = status && status !== 'all' ? { status } : {}

    const investments = await prisma.investment.findMany({
      where,
      include: {
        user: {
          select: { id: true, email: true, name: true, telegram: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

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

    return NextResponse.json({ investments: formatted })
  } catch (error) {
    console.error('Error fetching investments:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}