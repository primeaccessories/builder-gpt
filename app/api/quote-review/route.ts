import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest } from '@/lib/auth'
import { QUOTE_REVIEW_PROMPT, buildQuoteReviewContext } from '@/lib/quote-review-prompt'
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
    const auth = await getUserFromRequest(request)
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { customerName, jobDescription, lineItems, subtotal, vatAmount, total, dueDate, notes } = body

    if (!customerName || !lineItems || lineItems.length === 0) {
      return NextResponse.json(
        { error: 'Customer name and line items are required' },
        { status: 400 }
      )
    }

    // Build the quote context
    const quoteContext = buildQuoteReviewContext({
      customerName,
      jobDescription,
      lineItems,
      subtotal,
      vatAmount,
      total,
      dueDate,
      notes,
    })

    // Call OpenAI with the Quote Review prompt
    const openai = getOpenAIClient()
    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: QUOTE_REVIEW_PROMPT,
        },
        {
          role: 'user',
          content: quoteContext,
        },
      ],
      temperature: 0.7,
      max_tokens: 1500,
    })

    const review = completion.choices[0]?.message?.content || 'Failed to generate review'

    return NextResponse.json({ review })
  } catch (error) {
    console.error('Quote review error:', error)
    return NextResponse.json(
      { error: 'Failed to review quote' },
      { status: 500 }
    )
  }
}
