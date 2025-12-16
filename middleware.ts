import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname

  // Only protect /app routes
  if (path.startsWith('/app')) {
    const token = request.cookies.get('auth-token')?.value

    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    // Token exists, allow access
    // Subscription checks will be handled by individual API routes
    return NextResponse.next()
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/app/:path*'],
}
