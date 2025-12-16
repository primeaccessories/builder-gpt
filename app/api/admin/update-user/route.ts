import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const { email, plan, subscriptionStatus } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Email required' },
        { status: 400 }
      )
    }

    const user = await prisma.user.update({
      where: { email },
      data: {
        plan: plan || 'PRO',
        subscriptionStatus: subscriptionStatus || 'active',
      },
    })

    return NextResponse.json({
      success: true,
      user: {
        email: user.email,
        plan: user.plan,
        subscriptionStatus: user.subscriptionStatus
      }
    })
  } catch (error) {
    console.error('Update user error:', error)
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    )
  }
}
