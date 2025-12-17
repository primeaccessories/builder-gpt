import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getUserFromRequest } from '@/lib/auth'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// GET - List all invoices
export async function GET(request: NextRequest) {
  try {
    const auth = await getUserFromRequest(request)
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const invoices = await prisma.invoice.findMany({
      where: { userId: auth.userId },
      include: {
        lineItems: {
          orderBy: { order: 'asc' },
        },
        job: {
          select: {
            name: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ invoices })
  } catch (error) {
    console.error('Failed to fetch invoices:', error)
    return NextResponse.json(
      { error: 'Failed to fetch invoices' },
      { status: 500 }
    )
  }
}

// POST - Create a new invoice
export async function POST(request: NextRequest) {
  try {
    const auth = await getUserFromRequest(request)
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      customerName,
      customerEmail,
      customerPhone,
      customerAddress,
      dueDate,
      notes,
      status,
      lineItems,
      subtotal,
      vatAmount,
      total,
      jobId,
    } = body

    if (!customerName || !customerName.trim()) {
      return NextResponse.json(
        { error: 'Customer name is required' },
        { status: 400 }
      )
    }

    if (!lineItems || lineItems.length === 0) {
      return NextResponse.json(
        { error: 'At least one line item is required' },
        { status: 400 }
      )
    }

    // Generate invoice number
    const lastInvoice = await prisma.invoice.findFirst({
      where: { userId: auth.userId },
      orderBy: { createdAt: 'desc' },
      select: { invoiceNumber: true },
    })

    let invoiceNumber = 'INV-0001'
    if (lastInvoice) {
      const lastNumber = parseInt(lastInvoice.invoiceNumber.split('-')[1] || '0')
      invoiceNumber = `INV-${String(lastNumber + 1).padStart(4, '0')}`
    }

    // Create invoice with line items
    const invoice = await prisma.invoice.create({
      data: {
        userId: auth.userId,
        jobId: jobId || null,
        invoiceNumber,
        status: status || 'DRAFT',
        customerName: customerName.trim(),
        customerEmail: customerEmail?.trim() || null,
        customerPhone: customerPhone?.trim() || null,
        customerAddress: customerAddress?.trim() || null,
        dueDate: dueDate ? new Date(dueDate) : null,
        notes: notes?.trim() || null,
        subtotal,
        vatAmount,
        total,
        lineItems: {
          create: lineItems.map((item: any) => ({
            title: item.title.trim(),
            description: item.description?.trim() || null,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            vatApplicable: item.vatApplicable,
            vatRate: item.vatRate || 20,
            subtotal: item.subtotal,
            vatAmount: item.vatAmount,
            total: item.total,
            order: item.order,
          })),
        },
      },
      include: {
        lineItems: {
          orderBy: { order: 'asc' },
        },
      },
    })

    return NextResponse.json({ invoice })
  } catch (error) {
    console.error('Failed to create invoice:', error)
    return NextResponse.json(
      { error: 'Failed to create invoice' },
      { status: 500 }
    )
  }
}
