import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getUserFromRequest } from '@/lib/auth'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// GET - Fetch company settings
export async function GET(request: NextRequest) {
  try {
    const auth = await getUserFromRequest(request)
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const settings = await prisma.companySettings.findUnique({
      where: { userId: auth.userId },
    })

    return NextResponse.json({ settings })
  } catch (error) {
    console.error('Failed to fetch company settings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch company settings' },
      { status: 500 }
    )
  }
}

// POST - Create or update company settings
export async function POST(request: NextRequest) {
  try {
    const auth = await getUserFromRequest(request)
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      companyName,
      addressLine1,
      addressLine2,
      city,
      postcode,
      phone,
      email,
      vatNumber,
      registrationNumber,
      bankName,
      accountNumber,
      sortCode,
    } = body

    if (!companyName || !companyName.trim()) {
      return NextResponse.json(
        { error: 'Company name is required' },
        { status: 400 }
      )
    }

    const settings = await prisma.companySettings.upsert({
      where: { userId: auth.userId },
      update: {
        companyName: companyName.trim(),
        addressLine1: addressLine1?.trim() || null,
        addressLine2: addressLine2?.trim() || null,
        city: city?.trim() || null,
        postcode: postcode?.trim() || null,
        phone: phone?.trim() || null,
        email: email?.trim() || null,
        vatNumber: vatNumber?.trim() || null,
        registrationNumber: registrationNumber?.trim() || null,
        bankName: bankName?.trim() || null,
        accountNumber: accountNumber?.trim() || null,
        sortCode: sortCode?.trim() || null,
      },
      create: {
        userId: auth.userId,
        companyName: companyName.trim(),
        addressLine1: addressLine1?.trim() || null,
        addressLine2: addressLine2?.trim() || null,
        city: city?.trim() || null,
        postcode: postcode?.trim() || null,
        phone: phone?.trim() || null,
        email: email?.trim() || null,
        vatNumber: vatNumber?.trim() || null,
        registrationNumber: registrationNumber?.trim() || null,
        bankName: bankName?.trim() || null,
        accountNumber: accountNumber?.trim() || null,
        sortCode: sortCode?.trim() || null,
      },
    })

    return NextResponse.json({ settings })
  } catch (error) {
    console.error('Failed to save company settings:', error)
    return NextResponse.json(
      { error: 'Failed to save company settings' },
      { status: 500 }
    )
  }
}
