'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface Invoice {
  id: string
  invoiceNumber: string
  status: 'DRAFT' | 'SENT' | 'PAID' | 'OVERDUE' | 'CANCELLED'
  customerName: string
  total: number
  issueDate: string
  dueDate: string | null
  job: { name: string } | null
}

export default function InvoicesPage() {
  const router = useRouter()
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('ALL')

  useEffect(() => {
    fetchInvoices()
  }, [])

  async function fetchInvoices() {
    try {
      const res = await fetch('/api/invoices')
      if (res.ok) {
        const data = await res.json()
        setInvoices(data.invoices)
      }
    } catch (error) {
      console.error('Failed to fetch invoices:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredInvoices = invoices.filter((inv) => {
    if (filter === 'ALL') return true
    return inv.status === filter
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DRAFT':
        return 'bg-gray-500/20 text-gray-300'
      case 'SENT':
        return 'bg-blue-500/20 text-blue-300'
      case 'PAID':
        return 'bg-green-500/20 text-green-300'
      case 'OVERDUE':
        return 'bg-red-500/20 text-red-300'
      case 'CANCELLED':
        return 'bg-gray-600/20 text-gray-400'
      default:
        return 'bg-gray-500/20 text-gray-300'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'DRAFT':
        return 'Draft'
      case 'SENT':
        return 'Sent'
      case 'PAID':
        return 'Paid'
      case 'OVERDUE':
        return 'Overdue'
      case 'CANCELLED':
        return 'Cancelled'
      default:
        return status
    }
  }

  return (
    <div className="min-h-screen bg-[#F7F7F7]">
      {/* Header */}
      <div className="bg-[#1F1F1F] border-b border-[#2A2A2A]">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-white mb-1">Invoices</h1>
              <p className="text-white/50 text-sm">Manage your invoices and track payments</p>
            </div>
            <button
              onClick={() => router.push('/dashboard/invoices/new')}
              className="px-4 py-2 bg-white text-[#1F1F1F] rounded-lg font-medium hover:bg-white/90 transition-colors"
            >
              + New Invoice
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-6xl mx-auto px-6 py-4">
        <div className="flex gap-2 overflow-x-auto pb-2">
          {['ALL', 'DRAFT', 'SENT', 'PAID', 'OVERDUE', 'CANCELLED'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                filter === status
                  ? 'bg-[#1F1F1F] text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              {status === 'ALL' ? 'All' : getStatusLabel(status)}
            </button>
          ))}
        </div>
      </div>

      {/* Invoice List */}
      <div className="max-w-6xl mx-auto px-6 pb-12">
        {loading ? (
          <div className="text-center py-12 text-gray-500">Loading invoices...</div>
        ) : filteredInvoices.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">
              {filter === 'ALL' ? 'No invoices yet' : `No ${getStatusLabel(filter).toLowerCase()} invoices`}
            </p>
            {filter === 'ALL' && (
              <button
                onClick={() => router.push('/dashboard/invoices/new')}
                className="px-4 py-2 bg-[#1F1F1F] text-white rounded-lg font-medium hover:bg-[#2A2A2A] transition-colors"
              >
                Create your first invoice
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredInvoices.map((invoice) => (
              <div
                key={invoice.id}
                className="bg-white rounded-lg p-5 hover:shadow-sm transition-shadow cursor-pointer border border-gray-200"
                onClick={() => router.push(`/dashboard/invoices/${invoice.id}`)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-gray-900">{invoice.invoiceNumber}</h3>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(invoice.status)}`}>
                        {getStatusLabel(invoice.status)}
                      </span>
                    </div>
                    <p className="text-gray-700 mb-1">{invoice.customerName}</p>
                    {invoice.job && (
                      <p className="text-sm text-gray-500">Job: {invoice.job.name}</p>
                    )}
                    <div className="flex gap-4 mt-2 text-sm text-gray-500">
                      <span>Issued: {new Date(invoice.issueDate).toLocaleDateString('en-GB')}</span>
                      {invoice.dueDate && (
                        <span>Due: {new Date(invoice.dueDate).toLocaleDateString('en-GB')}</span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-semibold text-gray-900">
                      £{invoice.total.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style jsx>{`
        /* Match BuildPrice Pro design system */
        body {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }
      `}</style>
    </div>
  )
}
