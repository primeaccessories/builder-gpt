import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
})

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('stripe-signature')!

    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err) {
      console.error('Webhook signature verification failed:', err)
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    // Handle different event types
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string

        // Determine plan from price ID
        const priceId = subscription.items.data[0]?.price.id
        let plan: 'SOLO' | 'SMALL_FIRM' | 'PRO' = 'SOLO'

        if (priceId === process.env.STRIPE_PRICE_SOLO) {
          plan = 'SOLO'
        } else if (priceId === process.env.STRIPE_PRICE_SMALL_FIRM) {
          plan = 'SMALL_FIRM'
        } else if (priceId === process.env.STRIPE_PRICE_PRO) {
          plan = 'PRO'
        }

        // Update user
        await prisma.user.update({
          where: { stripeCustomerId: customerId },
          data: {
            plan,
            stripeSubscriptionId: subscription.id,
            subscriptionStatus: subscription.status,
          },
        })
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string

        await prisma.user.update({
          where: { stripeCustomerId: customerId },
          data: {
            subscriptionStatus: 'canceled',
          },
        })
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        const customerId = invoice.customer as string

        await prisma.user.update({
          where: { stripeCustomerId: customerId },
          data: {
            subscriptionStatus: 'past_due',
          },
        })
        break
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    )
  }
}
