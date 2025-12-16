'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

function SuccessContent() {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('session_id')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!sessionId) {
      setError('No session found')
      setLoading(false)
      return
    }

    // Verify the session and set up the user's subscription
    const verifySession = async () => {
      try {
        const res = await fetch('/api/stripe/verify-session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId }),
        })

        if (!res.ok) {
          setError('Failed to verify payment')
        }
      } catch (err) {
        setError('Something went wrong')
      } finally {
        setLoading(false)
      }
    }

    verifySession()
  }, [sessionId])

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white/60">Setting up your account...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center px-6">
        <div className="max-w-md text-center">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold mb-3">Something went wrong</h1>
          <p className="text-white/60 mb-6">{error}</p>
          <Link
            href="/pricing"
            className="inline-block px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl transition-all"
          >
            Try again
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-6">
      <div className="max-w-2xl text-center">
        <div className="w-20 h-20 bg-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-8">
          <svg className="w-10 h-10 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h1 className="text-5xl font-bold mb-4">Welcome to Builder GPT!</h1>
        <p className="text-xl text-white/60 mb-8">
          Your 7-day free trial has started. You won't be charged until {new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('en-GB')}
        </p>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-8 text-left">
          <h2 className="text-lg font-semibold mb-4">What happens next:</h2>
          <ul className="space-y-3 text-white/80">
            <li className="flex items-start gap-3">
              <span className="text-orange-400 text-xl">✓</span>
              <span>Your trial starts today — full access to all features</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-orange-400 text-xl">✓</span>
              <span>Use Builder GPT for advice on payments, disputes, pricing, and more</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-orange-400 text-xl">✓</span>
              <span>Cancel anytime during your trial — no charge</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-orange-400 text-xl">✓</span>
              <span>After 7 days, your subscription begins automatically</span>
            </li>
          </ul>
        </div>

        <Link
          href="/app"
          className="inline-block px-10 py-4 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold rounded-xl transition-all hover:scale-105 text-lg shadow-lg shadow-orange-500/25"
        >
          Start using Builder GPT
        </Link>
      </div>
    </div>
  )
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-white/60">Loading...</div>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  )
}
