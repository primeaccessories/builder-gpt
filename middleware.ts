import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import jwt from 'jsonwebtoken'
import { prisma } from '@/lib/db'

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname

  // Only protect /app routes
  if (path.startsWith('/app')) {
    const token = request.cookies.get('auth-token')?.value

    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    try {
      // Verify JWT token
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'your-secret-key'
      ) as { userId: string; email: string }

      // Check user subscription status
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: { subscriptionStatus: true },
      })

      if (!user) {
        return NextResponse.redirect(new URL('/login', request.url))
      }

      // Only allow active or trialing subscriptions
      if (user.subscriptionStatus !== 'active' && user.subscriptionStatus !== 'trialing') {
        return NextResponse.redirect(new URL('/pricing', request.url))
      }

      // User is authenticated and has valid subscription
      return NextResponse.next()
    } catch (error) {
      console.error('Middleware auth error:', error)
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/app/:path*'],
}
