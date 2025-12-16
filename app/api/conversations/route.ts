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

    const conversations = await prisma.conversation.findMany({
      where: { userId: auth.userId },
      orderBy: { updatedAt: 'desc' },
      take: 50,
      select: {
        id: true,
        issueType: true,
        createdAt: true,
        updatedAt: true,
        messages: {
          take: 1,
          orderBy: { createdAt: 'asc' },
          select: {
            content: true,
          },
        },
      },
    })

    // Format conversations with names from first message
    const formattedConversations = conversations.map((conv) => ({
      id: conv.id,
      name: conv.messages[0]?.content.slice(0, 50) || 'New chat',
      issueType: conv.issueType,
      createdAt: conv.createdAt.toISOString(),
    }))

    return NextResponse.json({ conversations: formattedConversations })
  } catch (error) {
    console.error('Get conversations error:', error)
    return NextResponse.json(
      { error: 'Failed to get conversations' },
      { status: 500 }
    )
  }
}
