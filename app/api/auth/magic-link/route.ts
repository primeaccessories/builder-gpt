import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { signMagicLink } from '@/lib/auth'
import nodemailer from 'nodemailer'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Invalid email' }, { status: 400 })
    }

    // Find or create user
    let user = await prisma.user.findUnique({ where: { email } })

    if (!user) {
      // Create new user with 7-day trial
      const trialEndsAt = new Date()
      trialEndsAt.setDate(trialEndsAt.getDate() + 7)

      user = await prisma.user.create({
        data: {
          email,
          plan: 'SOLO',
          subscriptionStatus: 'trialing',
          trialEndsAt,
        },
      })
    }

    // Generate magic link token
    const token = signMagicLink(email)
    const magicLink = `${process.env.NEXT_PUBLIC_APP_URL}/auth/verify?token=${token}`

    // Send email
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    })

    await transporter.sendMail({
      from: process.env.FROM_EMAIL,
      to: email,
      subject: 'Sign in to Builder GPT',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Sign in to Builder GPT</h2>
          <p>Click the button below to sign in to your account:</p>
          <p style="margin: 30px 0;">
            <a href="${magicLink}" style="background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Sign in to Builder GPT
            </a>
          </p>
          <p style="color: #666; font-size: 14px;">This link expires in 15 minutes.</p>
          <p style="color: #666; font-size: 14px;">If you didn't request this email, you can safely ignore it.</p>
        </div>
      `,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Magic link error:', error)
    return NextResponse.json(
      { error: 'Failed to send magic link' },
      { status: 500 }
    )
  }
}
