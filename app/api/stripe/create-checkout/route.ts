import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
})

// Price IDs for each plan - you'll need to create these in Stripe Dashboard
const PRICE_IDS = {
  solo: process.env.STRIPE_PRICE_SOLO!,
  small_firm: process.env.STRIPE_PRICE_SMALL_FIRM!,
  pro: process.env.STRIPE_PRICE_PRO!,
}

export async function POST(request: NextRequest) {
  try {
    const { plan, email } = await request.json()

    console.log('Checkout request:', { plan, email })

    if (!plan || !email) {
      return NextResponse.json(
        { error: 'Plan and email required' },
        { status: 400 }
      )
    }

    const priceId = PRICE_IDS[plan as keyof typeof PRICE_IDS]

    console.log('Price ID lookup:', { plan, priceId })
    console.log('Available price IDs:', PRICE_IDS)

    if (!priceId) {
      return NextResponse.json(
        { error: 'Invalid plan' },
        { status: 400 }
      )
    }

    // Create Stripe Checkout Session with 7-day trial
    const session = await stripe.checkout.sessions.create({
      customer_email: email,
      mode: 'subscription',
      payment_method_types: ['card'], // Apple Pay & Google Pay are automatically included
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      subscription_data: {
        trial_period_days: 7,
        metadata: {
          plan: plan,
        },
      },
      success_url: `${process.env.NEXT_PUBLIC_URL}/signup/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_URL}/pricing`,
      metadata: {
        plan: plan,
      },
    })

    return NextResponse.json({ sessionId: session.id, url: session.url })
  } catch (error: any) {
    console.error('Stripe checkout error:', error)
    console.error('Error details:', error.message, error.type)
    return NextResponse.json(
      { error: 'Failed to create checkout session', details: error.message },
      { status: 500 }
    )
  }
}
