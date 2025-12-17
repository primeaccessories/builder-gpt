'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface Job {
  id: string
  name: string
  customerName: string | null
  stage: string
  value: number
  outstandingAmount: number
  overdueAmount: number
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH'
  needsAttentionToday: boolean
  nextPaymentDue: string | null
}

interface Payment {
  id: string
  amount: number
  dueDate: string | null
  status: string
  invoiceNumber: string | null
  job: {
    name: string
    customerName: string | null
  }
}

interface RiskFlag {
  id: string
  type: string
  severity: 'LOW' | 'MEDIUM' | 'HIGH'
  message: string
  job: {
    name: string
  }
}

export default function DashboardPage() {
  const router = useRouter()
  const [todayJobs, setTodayJobs] = useState<Job[]>([])
  const [paymentsToChase, setPaymentsToChase] = useState<Payment[]>([])
  const [riskFlags, setRiskFlags] = useState<RiskFlag[]>([])
  const [loading, setLoading] = useState(true)
  const [userName, setUserName] = useState('')

  useEffect(() => {
    loadDashboardData()
    loadUser()
  }, [])

  const loadUser = async () => {
    try {
      const res = await fetch('/api/user/me')
      if (res.ok) {
        const data = await res.json()
        const fullName = data.user?.name || ''
        const firstName = fullName.split(' ')[0] || data.user?.email?.split('@')[0] || 'User'
        setUserName(firstName)
      }
    } catch (error) {
      console.error('Failed to fetch user:', error)
    }
  }

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      // Load jobs needing attention
      const jobsRes = await fetch('/api/dashboard/today')
      if (jobsRes.ok) {
        const jobsData = await jobsRes.json()
        setTodayJobs(jobsData.jobs || [])
        setPaymentsToChase(jobsData.payments || [])
        setRiskFlags(jobsData.riskFlags || [])
      }
    } catch (error) {
      console.error('Failed to load dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  const openGPTWithJob = (jobId: string) => {
    router.push(`/app/main?jobId=${jobId}`)
  }

  const getRiskColor = (severity: 'LOW' | 'MEDIUM' | 'HIGH') => {
    switch (severity) {
      case 'HIGH':
        return 'text-red-400 bg-red-500/10 border-red-500/20'
      case 'MEDIUM':
        return 'text-amber-400 bg-amber-500/10 border-amber-500/20'
      default:
        return 'text-blue-400 bg-blue-500/10 border-blue-500/20'
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Not set'
    const date = new Date(dateString)
    const today = new Date()
    const diffDays = Math.floor((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Tomorrow'
    if (diffDays < 0) return `${Math.abs(diffDays)} days overdue`
    if (diffDays <= 7) return `In ${diffDays} days`

    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
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

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-white/[0.08] bg-black/80 backdrop-blur-xl sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 md:py-5">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">Good morning, {userName}</h1>
              <p className="text-white/50 text-sm mt-1">Here's what needs your attention today</p>
            </div>
            <button
              onClick={() => router.push('/app/main')}
              className="px-4 py-2 bg-white text-black hover:bg-white/90 rounded-lg font-medium transition-all active:scale-95"
            >
              I'm Stuck
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-8">
        {/* Today's Actions */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Today ({todayJobs.length + paymentsToChase.length + riskFlags.length})</h2>

          {todayJobs.length === 0 && paymentsToChase.length === 0 && riskFlags.length === 0 ? (
            <div className="bg-white/[0.03] border border-white/[0.08] rounded-xl p-8 text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-green-500/10 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-white/90 mb-2">All clear</h3>
              <p className="text-white/50 text-sm">Nothing needs your attention right now</p>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Jobs Needing Attention */}
              {todayJobs.map((job) => (
                <div
                  key={job.id}
                  className="bg-white/[0.03] border border-white/[0.08] rounded-xl p-4 hover:bg-white/[0.05] transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium text-white/90">{job.name}</h3>
                        {job.riskLevel !== 'LOW' && (
                          <span className={`text-xs px-2 py-0.5 rounded-full border ${getRiskColor(job.riskLevel)}`}>
                            {job.riskLevel}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-white/50">
                        {job.customerName || 'No customer name'} • {job.stage.replace('_', ' ')}
                        {job.nextPaymentDue && ` • Payment due ${formatDate(job.nextPaymentDue)}`}
                      </p>
                    </div>
                    <button
                      onClick={() => openGPTWithJob(job.id)}
                      className="px-4 py-2 bg-white/[0.08] hover:bg-white/[0.12] rounded-lg text-sm font-medium transition-all active:scale-95 flex-shrink-0"
                    >
                      Open GPT
                    </button>
                  </div>
                </div>
              ))}

              {/* Payments to Chase */}
              {paymentsToChase.map((payment) => (
                <div
                  key={payment.id}
                  className="bg-white/[0.03] border border-white/[0.08] rounded-xl p-4 hover:bg-white/[0.05] transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <svg className="w-4 h-4 text-amber-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <h3 className="font-medium text-white/90">Chase payment: {payment.job.name}</h3>
                      </div>
                      <p className="text-sm text-white/50">
                        {formatCurrency(payment.amount)} • {formatDate(payment.dueDate)}
                        {payment.invoiceNumber && ` • Invoice ${payment.invoiceNumber}`}
                      </p>
                    </div>
                    <button
                      onClick={() => router.push('/app/main')}
                      className="px-4 py-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 rounded-lg text-sm font-medium transition-all active:scale-95 flex-shrink-0"
                    >
                      Send Message
                    </button>
                  </div>
                </div>
              ))}

              {/* Risk Flags */}
              {riskFlags.map((flag) => (
                <div
                  key={flag.id}
                  className="bg-white/[0.03] border border-white/[0.08] rounded-xl p-4 hover:bg-white/[0.05] transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <svg className="w-4 h-4 text-red-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <h3 className="font-medium text-white/90">{flag.message}</h3>
                        <span className={`text-xs px-2 py-0.5 rounded-full border ${getRiskColor(flag.severity)}`}>
                          {flag.severity}
                        </span>
                      </div>
                      <p className="text-sm text-white/50">{flag.job.name} • {flag.type.replace(/_/g, ' ').toLowerCase()}</p>
                    </div>
                    <button
                      onClick={() => router.push('/app/main')}
                      className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg text-sm font-medium transition-all active:scale-95 flex-shrink-0"
                    >
                      Fix This
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Quick Stats */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white/[0.03] border border-white/[0.08] rounded-xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div>
                <p className="text-2xl font-bold text-white/90">{todayJobs.length}</p>
                <p className="text-sm text-white/50">Active jobs</p>
              </div>
            </div>
          </div>

          <div className="bg-white/[0.03] border border-white/[0.08] rounded-xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-amber-500/10 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-2xl font-bold text-white/90">{paymentsToChase.length}</p>
                <p className="text-sm text-white/50">Payments to chase</p>
              </div>
            </div>
          </div>

          <div className="bg-white/[0.03] border border-white/[0.08] rounded-xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-red-500/10 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <p className="text-2xl font-bold text-white/90">{riskFlags.length}</p>
                <p className="text-sm text-white/50">Risk flags</p>
              </div>
            </div>
          </div>
        </section>

        {/* Quick Actions */}
        <section>
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => router.push('/dashboard/jobs')}
              className="bg-white/[0.03] border border-white/[0.08] rounded-xl p-6 hover:bg-white/[0.05] transition-all text-left group"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-white/90 mb-1">View all jobs</h3>
                  <p className="text-sm text-white/50">Manage your projects</p>
                </div>
                <svg className="w-5 h-5 text-white/30 group-hover:text-white/50 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </button>

            <button
              onClick={() => router.push('/dashboard/money')}
              className="bg-white/[0.03] border border-white/[0.08] rounded-xl p-6 hover:bg-white/[0.05] transition-all text-left group"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-white/90 mb-1">Money snapshot</h3>
                  <p className="text-sm text-white/50">Track payments</p>
                </div>
                <svg className="w-5 h-5 text-white/30 group-hover:text-white/50 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </button>

            <button
              onClick={() => router.push('/dashboard/invoices/new')}
              className="bg-gradient-to-r from-green-600 to-emerald-600 border border-green-500/20 rounded-xl p-6 hover:from-green-500 hover:to-emerald-500 transition-all text-left group"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-white mb-1">Create Invoice</h3>
                  <p className="text-sm text-white/80">Generate professional invoices</p>
                </div>
                <svg className="w-5 h-5 text-white/80 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
              </div>
            </button>
          </div>
        </section>
      </main>
    </div>
  )
}
