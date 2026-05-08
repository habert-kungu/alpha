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

    const transactions = await prisma.transaction.findMany({
      where: { userId: payload.userId as string },
      orderBy: { createdAt: 'desc' },
      take: 100,
    })

    const formatted = transactions.map((t) => {
      const net = t.netAmount ?? t.amount
      const fee = t.fee ?? (t.type !== 'return' ? t.amount.sub(net) : ZERO)
      return {
        id: t.id,
        type: t.type,
        amount: t.amount.toFixed(2),
        net: net.toFixed(2),
        fee: fee.toFixed(2),
        currency: t.currency,
        status: t.status,
        note: t.note || getNoteForType(t.type),
        txHash: t.txHash,
        createdAt: t.createdAt.toISOString(),
      }
    })

    return NextResponse.json({ transactions: formatted })
  } catch (error) {
    console.error('Error fetching transactions:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

function getNoteForType(type: string): string {
  switch (type) {
    case 'deposit':
      return 'TRC20 Network - Confirmed'
    case 'withdrawal':
      return '16.5% fee applied'
    case 'return':
      return 'Investment cycle completed'
    case 'investment':
      return 'Investment placed'
    default:
      return ''
  }
}
