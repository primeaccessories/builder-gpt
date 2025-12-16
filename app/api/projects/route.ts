import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getUserFromRequest } from '@/lib/auth'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// GET - List all projects for the user
export async function GET(request: NextRequest) {
  try {
    const auth = await getUserFromRequest(request)
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const projects = await prisma.project.findMany({
      where: { userId: auth.userId },
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { conversations: true }
        }
      }
    })

    return NextResponse.json({ projects })
  } catch (error) {
    console.error('Failed to fetch projects:', error)
    return NextResponse.json(
      { error: 'Failed to fetch projects' },
      { status: 500 }
    )
  }
}

// POST - Create a new project
export async function POST(request: NextRequest) {
  try {
    const auth = await getUserFromRequest(request)
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name } = body

    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: 'Project name is required' },
        { status: 400 }
      )
    }

    const project = await prisma.project.create({
      data: {
        userId: auth.userId,
        name: name.trim(),
      },
    })

    return NextResponse.json({ project })
  } catch (error) {
    console.error('Failed to create project:', error)
    return NextResponse.json(
      { error: 'Failed to create project' },
      { status: 500 }
    )
  }
}
