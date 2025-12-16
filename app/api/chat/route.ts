import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getUserFromRequest } from '@/lib/auth'
import { buildChatPrompt } from '@/lib/ai-prompt'
import OpenAI from 'openai'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function getOpenAIClient() {
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || 'sk-placeholder',
  })
}

export async function POST(request: NextRequest) {
  try {
    // Auth
    const auth = await getUserFromRequest(request)
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user and check plan
    const user = await prisma.user.findUnique({
      where: { id: auth.userId },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check subscription status
    if (user.subscriptionStatus !== 'active' && user.subscriptionStatus !== 'trialing') {
      return NextResponse.json(
        { error: 'Subscription required' },
        { status: 402 }
      )
    }

    // Check if trial expired
    if (user.subscriptionStatus === 'trialing' && user.trialEndsAt) {
      if (new Date() > user.trialEndsAt) {
        return NextResponse.json(
          { error: 'Trial expired. Please subscribe to continue.' },
          { status: 402 }
        )
      }
    }

    const body = await request.json()
    const {
      issueType,
      message,
      jobContext,
      conversationHistory = [],
    } = body

    // Tier enforcement: Job context only for SMALL_FIRM and PRO
    const canUseJobContext = user.plan !== 'SOLO'
    const finalJobContext = canUseJobContext ? jobContext : undefined

    // Build system prompt
    const systemPrompt = buildChatPrompt(issueType, finalJobContext)

    // Build messages array for OpenAI
    const messages: Array<{ role: string; content: string }> = [
      { role: 'system', content: systemPrompt },
    ]

    // Tier enforcement: Conversation history only for SMALL_FIRM and PRO
    const canUseHistory = user.plan !== 'SOLO'
    if (canUseHistory && conversationHistory.length > 0) {
      conversationHistory.forEach((msg: { role: string; content: string }) => {
        messages.push({
          role: msg.role === 'user' ? 'user' : 'assistant',
          content: msg.content,
        })
      })
    }

    // Add current message
    messages.push({
      role: 'user',
      content: message,
    })

    // Call OpenAI
    const openai = getOpenAIClient()
    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: messages as any,
      temperature: 0.7,
      max_tokens: 500,
    })

    const assistantResponse = completion.choices[0]?.message?.content || 'Sorry, I couldn\'t generate a response.'

    // Save conversation for SMALL_FIRM and PRO plans
    if (canUseHistory) {
      // Find or create conversation
      let conversation = await prisma.conversation.findFirst({
        where: {
          userId: user.id,
          issueType: issueType.toUpperCase(),
        },
        orderBy: { createdAt: 'desc' },
      })

      if (!conversation) {
        conversation = await prisma.conversation.create({
          data: {
            userId: user.id,
            issueType: issueType.toUpperCase(),
          },
        })
      }

      // Save messages
      await prisma.message.createMany({
        data: [
          {
            conversationId: conversation.id,
            userId: user.id,
            role: 'USER',
            content: message,
          },
          {
            conversationId: conversation.id,
            userId: user.id,
            role: 'ASSISTANT',
            content: assistantResponse,
          },
        ],
      })
    }

    return NextResponse.json({ response: assistantResponse })
  } catch (error) {
    console.error('Chat error:', error)
    return NextResponse.json(
      { error: 'Failed to process chat' },
      { status: 500 }
    )
  }
}
