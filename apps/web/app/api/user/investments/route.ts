import { NextRequest, NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { verifyToken } from '@/lib/auth'
import prisma from '@/lib/db'

const POOL_CONFIG = {
  daily: { roi: 6.4, durationDays: 1 },
  weekly: { roi: 8, durationDays: 7 },
}

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = await verifyToken(token)
    if (!payload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { amount, pool, txHash, network, notes } = body

    if (!amount || !pool || !txHash) {
      return NextResponse.json(
        { error: 'Amount, pool, and transaction hash are required' },
        { status: 400 }
      )
    }

    const parsedAmount = parseFloat(amount)
    if (isNaN(parsedAmount) || parsedAmount < 50) {
      return NextResponse.json(
        { error: 'Minimum investment is $50' },
        { status: 400 }
      )
    }

    if (parsedAmount > 1000000) {
      return NextResponse.json(
        { error: 'Maximum investment is $1,000,000' },
        { status: 400 }
      )
    }

    if (typeof txHash !== 'string' || txHash.length < 10 || txHash.length > 200) {
      return NextResponse.json(
        { error: 'Invalid transaction hash' },
        { status: 400 }
      )
    }

    if (!['daily', 'weekly'].includes(pool)) {
      return NextResponse.json(
        { error: 'Invalid pool selection' },
        { status: 400 }
      )
    }

    const config = POOL_CONFIG[pool as keyof typeof POOL_CONFIG]
    const amount = new Prisma.Decimal(parsedAmount.toFixed(2))
    const roi = new Prisma.Decimal(config.roi)
    const trimmedHash = txHash.trim()
    const poolLabel = pool === 'daily' ? '24H' : 'Weekly'

    const investment = await prisma.$transaction(async (tx) => {
      const inv = await tx.investment.create({
        data: {
          userId: payload.userId as string,
          pool,
          amount,
          txHash: trimmedHash,
          network: network || 'TRC20',
          status: 'pending',
          roi,
        },
      })

      await tx.transaction.create({
        data: {
          userId: payload.userId as string,
          type: 'investment',
          amount,
          netAmount: amount,
          currency: 'USDT',
          txHash: trimmedHash,
          status: 'pending',
          note: `Investment submitted for ${poolLabel} Pool - Awaiting approval`,
        },
      })

      return inv
    })

    return NextResponse.json({
      success: true,
      investment: {
        id: investment.id,
        amount: investment.amount.toFixed(2),
        pool: investment.pool,
        status: investment.status,
        createdAt: investment.createdAt.toISOString(),
      },
    })
  } catch (error) {
    console.error('Error creating investment:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}