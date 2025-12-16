import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getUserFromRequest } from '@/lib/auth'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const auth = await getUserFromRequest(request)
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get jobs that need attention today
    const jobs = await prisma.job.findMany({
      where: {
        userId: auth.userId,
        needsAttentionToday: true,
      },
      orderBy: {
        updatedAt: 'desc',
      },
      take: 20,
    })

    // Get overdue and due-soon payments
    const today = new Date()
    const nextWeek = new Date()
    nextWeek.setDate(today.getDate() + 7)

    const payments = await prisma.payment.findMany({
      where: {
        userId: auth.userId,
        status: {
          in: ['PENDING', 'SENT', 'OVERDUE'],
        },
        OR: [
          {
            status: 'OVERDUE',
          },
          {
            dueDate: {
              lte: nextWeek,
            },
          },
        ],
      },
      include: {
        job: {
          select: {
            name: true,
            customerName: true,
          },
        },
      },
      orderBy: {
        dueDate: 'asc',
      },
      take: 10,
    })

    // Get active risk flags (not dismissed)
    const riskFlags = await prisma.riskFlag.findMany({
      where: {
        userId: auth.userId,
        dismissed: false,
      },
      include: {
        job: {
          select: {
            name: true,
          },
        },
      },
      orderBy: [
        {
          severity: 'desc',
        },
        {
          createdAt: 'desc',
        },
      ],
      take: 10,
    })

    return NextResponse.json({
      jobs,
      payments,
      riskFlags,
    })
  } catch (error) {
    console.error('Dashboard today error:', error)
    return NextResponse.json(
      { error: 'Failed to load dashboard data' },
      { status: 500 }
    )
  }
}
