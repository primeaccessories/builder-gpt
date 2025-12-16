'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

const FEATURES = [
  { emoji: '💷', text: 'Payment problems & late payments' },
  { emoji: '🔁', text: 'Managing changes & extras' },
  { emoji: '😤', text: 'Difficult customers & disputes' },
  { emoji: '🧱', text: 'Job overruns & delays' },
  { emoji: '📄', text: 'Pricing & quotes' },
  { emoji: '⚠️', text: 'Legal advice & protection' },
]

export default function WelcomePage() {
  const router = useRouter()
  const [userName, setUserName] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Fetch user info
    const fetchUser = async () => {
      try {
        const res = await fetch('/api/user/me')
        if (res.ok) {
          const data = await res.json()
          setUserName(data.user?.name || data.user?.email?.split('@')[0] || 'there')
        }
      } catch (error) {
        console.error('Failed to fetch user:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchUser()
  }, [])

  const handleGetStarted = () => {
    // Mark welcome as seen
    localStorage.setItem('builder-gpt-welcome-seen', 'true')
    router.push('/app')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-accent-blue border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center px-6">
      <div className="max-w-2xl w-full text-center">
        {/* Greeting */}
        <div className="mb-12">
          <h1 className="text-5xl md:text-6xl font-bold mb-4">
            Hello {userName}! 👋
          </h1>
          <p className="text-2xl text-text-secondary">
            Welcome to Builder GPT
          </p>
        </div>

        {/* What it helps with */}
        <div className="bg-bg-secondary border border-border-subtle rounded-2xl p-8 mb-10">
          <h2 className="text-xl font-semibold mb-6 text-text-primary">
            Your AI assistant for:
          </h2>
          <div className="grid md:grid-cols-2 gap-4 text-left">
            {FEATURES.map((feature, idx) => (
              <div
                key={idx}
                className="flex items-start gap-3 text-text-secondary"
              >
                <span className="text-2xl flex-shrink-0">{feature.emoji}</span>
                <span className="text-base pt-1">{feature.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <button
          onClick={handleGetStarted}
          className="px-10 py-4 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-lg font-semibold rounded-xl transition-all hover:scale-105 shadow-lg shadow-orange-500/25"
        >
          Get started
        </button>

        <p className="text-sm text-text-muted mt-6">
          Click an issue to start chatting
        </p>
      </div>
    </div>
  )
}
