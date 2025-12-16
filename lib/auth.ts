import jwt from 'jsonwebtoken'
import { prisma } from './db'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'
const MAGIC_LINK_SECRET = process.env.MAGIC_LINK_SECRET || 'magic-link-secret'

export interface JWTPayload {
  userId: string
  email: string
}

export function signToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' })
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload
  } catch {
    return null
  }
}

export function signMagicLink(email: string): string {
  return jwt.sign({ email }, MAGIC_LINK_SECRET, { expiresIn: '15m' })
}

export function verifyMagicLink(token: string): string | null {
  try {
    const payload = jwt.verify(token, MAGIC_LINK_SECRET) as { email: string }
    return payload.email
  } catch {
    return null
  }
}

export async function getUserFromRequest(
  request: Request
): Promise<{ userId: string; email: string } | null> {
  // Try to get token from Authorization header first
  const authHeader = request.headers.get('Authorization')
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.substring(7)
    const payload = verifyToken(token)
    if (payload) return { userId: payload.userId, email: payload.email }
  }

  // Try to get token from cookies
  const cookieHeader = request.headers.get('cookie')
  if (cookieHeader) {
    const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
      const [key, value] = cookie.trim().split('=')
      acc[key] = value
      return acc
    }, {} as Record<string, string>)

    const token = cookies['auth-token']
    if (token) {
      const payload = verifyToken(token)
      if (payload) return { userId: payload.userId, email: payload.email }
    }
  }

  return null
}
