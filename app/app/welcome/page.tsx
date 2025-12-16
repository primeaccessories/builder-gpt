'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

const FEATURES = [
  { emoji: '💷', text: 'Customer won\'t pay — get the exact reply' },
  { emoji: '🔁', text: 'Scope creep — how to price extras' },
  { emoji: '😤', text: 'Bad review threats — stay professional' },
  { emoji: '⚠️', text: 'Job stuck — what to check, what to do next' },
  { emoji: '📄', text: 'Pricing questions — defend your numbers' },
  { emoji: '🧱', text: 'Subbie gone quiet — message + backup plan' },
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
          // Use first name from full name, or email as fallback
          const fullName = data.user?.name || ''
          const firstName = fullName.split(' ')[0] || data.user?.email?.split('@')[0] || 'there'
          setUserName(firstName)
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
    router.push('/app/main')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-accent-blue border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-bg-primary flex items-center justify-center px-4 py-6 md:px-6 overflow-hidden">
      <div className="max-w-2xl w-full text-center">
        {/* Greeting */}
        <div className="mb-6 md:mb-12">
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-3 md:mb-4">
            Hello {userName}! 👋
          </h1>
          <p className="text-lg md:text-2xl text-text-secondary mb-1 md:mb-2">
            Welcome to Builder GPT
          </p>
          <p className="text-sm md:text-lg text-text-muted">
            Know what to say. Right now.
          </p>
        </div>

        {/* What it helps with */}
        <div className="bg-bg-secondary border border-border-subtle rounded-xl md:rounded-2xl p-4 md:p-8 mb-6 md:mb-10">
          <h2 className="text-base md:text-xl font-semibold mb-4 md:mb-6 text-text-primary">
            When you need clarity fast:
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 text-left">
            {FEATURES.map((feature, idx) => (
              <div
                key={idx}
                className="flex items-start gap-2 md:gap-3 text-text-secondary"
              >
                <span className="text-xl md:text-2xl flex-shrink-0">{feature.emoji}</span>
                <span className="text-sm md:text-base pt-0.5 md:pt-1">{feature.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <button
          onClick={handleGetStarted}
          className="w-full md:w-auto px-8 md:px-10 py-3 md:py-4 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-base md:text-lg font-semibold rounded-xl transition-all hover:scale-105 shadow-lg shadow-orange-500/25"
        >
          Get started
        </button>

        <p className="text-xs md:text-sm text-text-muted mt-4 md:mt-6">
          Just start typing your situation
        </p>
      </div>
    </div>
  )
}
