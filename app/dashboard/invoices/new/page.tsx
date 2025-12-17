'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface LineItem {
  id: string
  title: string
  quantity: number
  unitPrice: number
  vatApplicable: boolean
  subtotal: number
  vatAmount: number
  total: number
}

interface CompanySettings {
  companyName: string
  addressLine1: string
  addressLine2: string
  city: string
  postcode: string
  phone: string
  email: string
  vatNumber: string
}

export default function NewInvoicePage() {
  const router = useRouter()
  const [companySettings, setCompanySettings] = useState<CompanySettings | null>(null)
  const [showCompanySetup, setShowCompanySetup] = useState(false)
  const [loading, setLoading] = useState(true)

  // Invoice details
  const [customerName, setCustomerName] = useState('')
  const [customerEmail, setCustomerEmail] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [customerAddress, setCustomerAddress] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [notes, setNotes] = useState('')

  // Line items
  const [lineItems, setLineItems] = useState<LineItem[]>([
    {
      id: '1',
      title: '',
      quantity: 1,
      unitPrice: 0,
      vatApplicable: true,
      subtotal: 0,
      vatAmount: 0,
      total: 0,
    },
  ])

  // Totals
  const [subtotal, setSubtotal] = useState(0)
  const [totalVAT, setTotalVAT] = useState(0)
  const [grandTotal, setGrandTotal] = useState(0)

  useEffect(() => {
    loadCompanySettings()
  }, [])

  useEffect(() => {
    calculateTotals()
  }, [lineItems])

  const loadCompanySettings = async () => {
    try {
      const res = await fetch('/api/company-settings')
      if (res.ok) {
        const data = await res.json()
        if (data.settings) {
          setCompanySettings(data.settings)
        } else {
          setShowCompanySetup(true)
        }
      }
    } catch (error) {
      console.error('Failed to load company settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const saveCompanySettings = async (settings: CompanySettings) => {
    try {
      const res = await fetch('/api/company-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      })

      if (res.ok) {
        const data = await res.json()
        setCompanySettings(data.settings)
        setShowCompanySetup(false)
      }
    } catch (error) {
      console.error('Failed to save company settings:', error)
      alert('Failed to save company settings')
    }
  }

  const calculateLineItem = (item: LineItem) => {
    const subtotal = item.quantity * item.unitPrice
    const vatAmount = item.vatApplicable ? subtotal * 0.2 : 0
    const total = subtotal + vatAmount

    return {
      ...item,
      subtotal,
      vatAmount,
      total,
    }
  }

  const calculateTotals = () => {
    const sub = lineItems.reduce((sum, item) => sum + item.subtotal, 0)
    const vat = lineItems.reduce((sum, item) => sum + item.vatAmount, 0)
    const total = sub + vat

    setSubtotal(sub)
    setTotalVAT(vat)
    setGrandTotal(total)
  }

  const updateLineItem = (id: string, field: keyof LineItem, value: any) => {
    setLineItems((items) =>
      items.map((item) => {
        if (item.id === id) {
          const updated = { ...item, [field]: value }
          return calculateLineItem(updated)
        }
        return item
      })
    )
  }

  const addLineItem = () => {
    const newItem: LineItem = {
      id: Date.now().toString(),
      title: '',
      quantity: 1,
      unitPrice: 0,
      vatApplicable: true,
      subtotal: 0,
      vatAmount: 0,
      total: 0,
    }
    setLineItems([...lineItems, newItem])
  }

  const removeLineItem = (id: string) => {
    if (lineItems.length > 1) {
      setLineItems(lineItems.filter((item) => item.id !== id))
    }
  }

  const saveInvoice = async (status: 'DRAFT' | 'SENT') => {
    if (!customerName.trim()) {
      alert('Please enter customer name')
      return
    }

    if (lineItems.some((item) => !item.title.trim())) {
      alert('Please fill in all line item titles')
      return
    }

    try {
      const res = await fetch('/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName,
          customerEmail,
          customerPhone,
          customerAddress,
          dueDate: dueDate || null,
          notes,
          status,
          lineItems: lineItems.map((item, index) => ({
            title: item.title,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            vatApplicable: item.vatApplicable,
            vatRate: 20,
            subtotal: item.subtotal,
            vatAmount: item.vatAmount,
            total: item.total,
            order: index,
          })),
          subtotal,
          vatAmount: totalVAT,
          total: grandTotal,
        }),
      })

      if (res.ok) {
        const data = await res.json()
        router.push(`/dashboard/invoices/${data.invoice.id}`)
      } else {
        alert('Failed to save invoice')
      }
    } catch (error) {
      console.error('Failed to save invoice:', error)
      alert('Failed to save invoice')
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 2,
    }).format(amount)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="flex gap-2">
          <span className="w-3 h-3 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
          <span className="w-3 h-3 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
          <span className="w-3 h-3 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
        </div>
      </div>
    )
  }

  if (showCompanySetup) {
    return <CompanySetupForm onSave={saveCompanySettings} />
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-white/[0.08] bg-black/80 backdrop-blur-xl sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 md:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push('/dashboard')}
                className="p-2 hover:bg-white/[0.08] rounded-lg transition-all active:scale-95"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </button>
              <h1 className="text-xl md:text-2xl font-bold">New Invoice</h1>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => saveInvoice('DRAFT')}
                className="px-4 py-2 bg-white/[0.08] hover:bg-white/[0.12] rounded-lg text-sm font-medium transition-all active:scale-95"
              >
                Save Draft
              </button>
              <button
                onClick={() => saveInvoice('SENT')}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm font-medium transition-all active:scale-95"
              >
                Save & Send
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 md:px-6 py-6 md:py-8">
        <div className="bg-white/[0.03] border border-white/[0.08] rounded-xl p-6 md:p-8">
          {/* Company Info */}
          {companySettings && (
            <div className="mb-8">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">{companySettings.companyName}</h2>
                  <div className="text-sm text-white/60 space-y-0.5">
                    {companySettings.addressLine1 && <div>{companySettings.addressLine1}</div>}
                    {companySettings.addressLine2 && <div>{companySettings.addressLine2}</div>}
                    {companySettings.city && companySettings.postcode && (
                      <div>
                        {companySettings.city}, {companySettings.postcode}
                      </div>
                    )}
                    {companySettings.phone && <div>Tel: {companySettings.phone}</div>}
                    {companySettings.email && <div>Email: {companySettings.email}</div>}
                    {companySettings.vatNumber && <div>VAT: {companySettings.vatNumber}</div>}
                  </div>
                </div>
                <button
                  onClick={() => setShowCompanySetup(true)}
                  className="px-3 py-1.5 bg-white/[0.05] hover:bg-white/[0.08] rounded-lg text-xs font-medium transition-all"
                >
                  Edit
                </button>
              </div>
            </div>
          )}

          <div className="border-t border-white/[0.08] pt-8 mb-8"></div>

          {/* Customer Info */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4">Customer Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">Customer Name *</label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="e.g. John Smith"
                  className="w-full px-3 py-2 bg-white/[0.05] border border-white/[0.08] rounded-lg text-white placeholder-white/30 focus:outline-none focus:bg-white/[0.08] focus:border-white/[0.15]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">Email</label>
                <input
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="customer@example.com"
                  className="w-full px-3 py-2 bg-white/[0.05] border border-white/[0.08] rounded-lg text-white placeholder-white/30 focus:outline-none focus:bg-white/[0.08] focus:border-white/[0.15]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">Phone</label>
                <input
                  type="tel"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="07123 456789"
                  className="w-full px-3 py-2 bg-white/[0.05] border border-white/[0.08] rounded-lg text-white placeholder-white/30 focus:outline-none focus:bg-white/[0.08] focus:border-white/[0.15]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">Due Date</label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-3 py-2 bg-white/[0.05] border border-white/[0.08] rounded-lg text-white placeholder-white/30 focus:outline-none focus:bg-white/[0.08] focus:border-white/[0.15]"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-white/70 mb-2">Address</label>
                <textarea
                  value={customerAddress}
                  onChange={(e) => setCustomerAddress(e.target.value)}
                  placeholder="Customer address..."
                  rows={2}
                  className="w-full px-3 py-2 bg-white/[0.05] border border-white/[0.08] rounded-lg text-white placeholder-white/30 focus:outline-none focus:bg-white/[0.08] focus:border-white/[0.15] resize-none"
                />
              </div>
            </div>
          </div>

          <div className="border-t border-white/[0.08] pt-8 mb-8"></div>

          {/* Line Items */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Items</h3>
              <button
                onClick={addLineItem}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm font-medium transition-all active:scale-95 flex items-center gap-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                Add Item
              </button>
            </div>

            <div className="space-y-4">
              {lineItems.map((item, index) => (
                <div key={item.id} className="bg-white/[0.02] border border-white/[0.08] rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
                    <div className="md:col-span-5">
                      <label className="block text-xs font-medium text-white/50 mb-1">Description *</label>
                      <input
                        type="text"
                        value={item.title}
                        onChange={(e) => updateLineItem(item.id, 'title', e.target.value)}
                        placeholder="e.g. Labour, Materials, etc."
                        className="w-full px-3 py-2 bg-white/[0.05] border border-white/[0.08] rounded-lg text-white text-sm placeholder-white/30 focus:outline-none focus:bg-white/[0.08] focus:border-white/[0.15]"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-xs font-medium text-white/50 mb-1">Quantity</label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.quantity}
                        onChange={(e) => updateLineItem(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 bg-white/[0.05] border border-white/[0.08] rounded-lg text-white text-sm focus:outline-none focus:bg-white/[0.08] focus:border-white/[0.15]"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-xs font-medium text-white/50 mb-1">Price (£)</label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.unitPrice}
                        onChange={(e) => updateLineItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 bg-white/[0.05] border border-white/[0.08] rounded-lg text-white text-sm focus:outline-none focus:bg-white/[0.08] focus:border-white/[0.15]"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-xs font-medium text-white/50 mb-1">Total</label>
                      <div className="px-3 py-2 bg-white/[0.02] border border-white/[0.05] rounded-lg text-white text-sm">
                        {formatCurrency(item.total)}
                      </div>
                    </div>

                    <div className="md:col-span-1 flex items-end">
                      <button
                        onClick={() => removeLineItem(item.id)}
                        disabled={lineItems.length === 1}
                        className="p-2 hover:bg-red-500/10 rounded-lg text-red-400 hover:text-red-300 transition-all disabled:opacity-30 disabled:cursor-not-allowed active:scale-95"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1-1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center gap-2">
                    <input
                      type="checkbox"
                      id={`vat-${item.id}`}
                      checked={item.vatApplicable}
                      onChange={(e) => updateLineItem(item.id, 'vatApplicable', e.target.checked)}
                      className="w-4 h-4 bg-white/[0.05] border-white/[0.08] rounded"
                    />
                    <label htmlFor={`vat-${item.id}`} className="text-sm text-white/60">
                      Include VAT (20%)
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Totals */}
          <div className="border-t border-white/[0.08] pt-6">
            <div className="flex flex-col items-end space-y-2">
              <div className="flex items-center justify-between w-full md:w-64">
                <span className="text-white/60">Subtotal:</span>
                <span className="font-medium">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex items-center justify-between w-full md:w-64">
                <span className="text-white/60">VAT (20%):</span>
                <span className="font-medium">{formatCurrency(totalVAT)}</span>
              </div>
              <div className="flex items-center justify-between w-full md:w-64 text-xl font-bold pt-2 border-t border-white/[0.08]">
                <span>Total:</span>
                <span>{formatCurrency(grandTotal)}</span>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="mt-8">
            <label className="block text-sm font-medium text-white/70 mb-2">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Payment terms, thank you message, etc..."
              rows={3}
              className="w-full px-3 py-2 bg-white/[0.05] border border-white/[0.08] rounded-lg text-white placeholder-white/30 focus:outline-none focus:bg-white/[0.08] focus:border-white/[0.15] resize-none"
            />
          </div>
        </div>
      </main>
    </div>
  )
}

function CompanySetupForm({ onSave }: { onSave: (settings: CompanySettings) => void }) {
  const [settings, setSettings] = useState<CompanySettings>({
    companyName: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    postcode: '',
    phone: '',
    email: '',
    vatNumber: '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!settings.companyName.trim()) {
      alert('Please enter your company name')
      return
    }
    onSave(settings)
  }

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="bg-white/[0.03] border border-white/[0.08] rounded-xl p-6 md:p-8">
          <h2 className="text-2xl font-bold mb-2">Set Up Your Company Info</h2>
          <p className="text-white/60 mb-6">This will appear on all your invoices</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">Company Name *</label>
              <input
                type="text"
                value={settings.companyName}
                onChange={(e) => setSettings({ ...settings, companyName: e.target.value })}
                placeholder="Your Company Ltd"
                className="w-full px-3 py-2 bg-white/[0.05] border border-white/[0.08] rounded-lg text-white placeholder-white/30 focus:outline-none focus:bg-white/[0.08] focus:border-white/[0.15]"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">Address Line 1</label>
                <input
                  type="text"
                  value={settings.addressLine1}
                  onChange={(e) => setSettings({ ...settings, addressLine1: e.target.value })}
                  placeholder="123 Main Street"
                  className="w-full px-3 py-2 bg-white/[0.05] border border-white/[0.08] rounded-lg text-white placeholder-white/30 focus:outline-none focus:bg-white/[0.08] focus:border-white/[0.15]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">Address Line 2</label>
                <input
                  type="text"
                  value={settings.addressLine2}
                  onChange={(e) => setSettings({ ...settings, addressLine2: e.target.value })}
                  placeholder="Unit 4"
                  className="w-full px-3 py-2 bg-white/[0.05] border border-white/[0.08] rounded-lg text-white placeholder-white/30 focus:outline-none focus:bg-white/[0.08] focus:border-white/[0.15]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">City</label>
                <input
                  type="text"
                  value={settings.city}
                  onChange={(e) => setSettings({ ...settings, city: e.target.value })}
                  placeholder="London"
                  className="w-full px-3 py-2 bg-white/[0.05] border border-white/[0.08] rounded-lg text-white placeholder-white/30 focus:outline-none focus:bg-white/[0.08] focus:border-white/[0.15]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">Postcode</label>
                <input
                  type="text"
                  value={settings.postcode}
                  onChange={(e) => setSettings({ ...settings, postcode: e.target.value })}
                  placeholder="SW1A 1AA"
                  className="w-full px-3 py-2 bg-white/[0.05] border border-white/[0.08] rounded-lg text-white placeholder-white/30 focus:outline-none focus:bg-white/[0.08] focus:border-white/[0.15]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">Phone</label>
                <input
                  type="tel"
                  value={settings.phone}
                  onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                  placeholder="020 1234 5678"
                  className="w-full px-3 py-2 bg-white/[0.05] border border-white/[0.08] rounded-lg text-white placeholder-white/30 focus:outline-none focus:bg-white/[0.08] focus:border-white/[0.15]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">Email</label>
                <input
                  type="email"
                  value={settings.email}
                  onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                  placeholder="hello@yourcompany.com"
                  className="w-full px-3 py-2 bg-white/[0.05] border border-white/[0.08] rounded-lg text-white placeholder-white/30 focus:outline-none focus:bg-white/[0.08] focus:border-white/[0.15]"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-white/70 mb-2">VAT Number (optional)</label>
                <input
                  type="text"
                  value={settings.vatNumber}
                  onChange={(e) => setSettings({ ...settings, vatNumber: e.target.value })}
                  placeholder="GB123456789"
                  className="w-full px-3 py-2 bg-white/[0.05] border border-white/[0.08] rounded-lg text-white placeholder-white/30 focus:outline-none focus:bg-white/[0.08] focus:border-white/[0.15]"
                />
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button
                type="submit"
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 rounded-lg font-medium transition-all active:scale-95"
              >
                Save & Continue
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
