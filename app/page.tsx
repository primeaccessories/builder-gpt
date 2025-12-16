'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function LandingPage() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleGetStarted = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Send magic link
    const res = await fetch('/api/auth/magic-link', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    })

    if (res.ok) {
      alert('Check your email for a login link')
      setEmail('')
    } else {
      alert('Something went wrong. Try again.')
    }

    setIsLoading(false)
  }

  return (
    <div className="min-h-screen bg-bg-primary">
      {/* Header */}
      <header className="border-b border-border-subtle bg-bg-secondary/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center max-w-6xl">
          <div className="text-xl font-semibold">Builder GPT</div>
          <Link
            href="/login"
            className="text-text-secondary hover:text-text-primary transition-colors"
          >
            Sign in
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="container mx-auto px-6 py-20 max-w-4xl text-center">
        <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
          Sort job problems.<br />Get clear answers.
        </h1>
        <p className="text-xl text-text-secondary mb-8 max-w-2xl mx-auto">
          Builder GPT helps UK builders deal with payment issues, extras, difficult customers, pricing pushback, and disputes. Plain guidance. No waffle.
        </p>

        <form onSubmit={handleGetStarted} className="max-w-md mx-auto mb-4">
          <div className="flex gap-3">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Your email"
              required
              className="flex-1 px-4 py-3 bg-bg-elevated border border-border-subtle rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:border-accent-blue"
            />
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-3 bg-accent-blue hover:bg-accent-blue-hover text-white font-medium rounded-lg transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Sending...' : 'Get started'}
            </button>
          </div>
        </form>
        <p className="text-sm text-text-muted">Free 7-day trial. No card needed.</p>
      </section>

      {/* What it does */}
      <section className="container mx-auto px-6 py-16 max-w-5xl">
        <h2 className="text-3xl font-bold text-center mb-12">What Builder GPT helps with</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { title: 'Payment problems', desc: 'Late payments, non-payment, chase wording' },
            { title: 'Changes & extras', desc: 'Scope creep, pricing extras, keeping control' },
            { title: 'Difficult customers', desc: 'Unreasonable demands, managing expectations' },
            { title: 'Jobs running over', desc: 'Delays, cost control, client communication' },
            { title: 'Pricing pushback', desc: 'Defending quotes, handling objections' },
            { title: 'Dispute starting', desc: 'De-escalation, wording, next steps' },
          ].map((item, i) => (
            <div key={i} className="bg-bg-secondary border border-border-subtle rounded-lg p-6">
              <h3 className="font-semibold mb-2">{item.title}</h3>
              <p className="text-text-secondary text-sm">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="container mx-auto px-6 py-16 max-w-4xl">
        <h2 className="text-3xl font-bold text-center mb-12">How it works</h2>
        <div className="space-y-8">
          {[
            { step: '1', title: 'Pick your issue', desc: 'Click what you need help with' },
            { step: '2', title: 'Describe the situation', desc: 'Simple questions, not forms' },
            { step: '3', title: 'Get clear guidance', desc: "What's happening, the risk, what to do next" },
          ].map((item) => (
            <div key={item.step} className="flex gap-6 items-start">
              <div className="flex-shrink-0 w-12 h-12 bg-accent-blue rounded-full flex items-center justify-center text-xl font-bold">
                {item.step}
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-1">{item.title}</h3>
                <p className="text-text-secondary">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="container mx-auto px-6 py-20 max-w-6xl">
        <h2 className="text-3xl font-bold text-center mb-4">Simple pricing</h2>
        <p className="text-center text-text-secondary mb-12">All plans include 7-day free trial</p>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Solo Builder */}
          <div className="bg-bg-secondary border border-border-subtle rounded-lg p-8">
            <h3 className="text-2xl font-bold mb-2">Solo Builder</h3>
            <div className="mb-6">
              <span className="text-4xl font-bold">£29</span>
              <span className="text-text-secondary">/month</span>
            </div>
            <ul className="space-y-3 mb-8">
              <li className="flex items-start gap-2">
                <span className="text-success-green mt-1">✓</span>
                <span>Unlimited chat</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-success-green mt-1">✓</span>
                <span>All issue categories</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-text-muted mt-1">—</span>
                <span className="text-text-muted">No conversation history</span>
              </li>
            </ul>
            <Link
              href="/signup?plan=solo"
              className="block w-full text-center px-6 py-3 bg-bg-elevated border border-border-subtle hover:border-accent-blue rounded-lg transition-colors"
            >
              Start free trial
            </Link>
          </div>

          {/* Small Firm */}
          <div className="bg-bg-secondary border-2 border-accent-blue rounded-lg p-8 relative">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-accent-blue px-4 py-1 rounded-full text-sm font-medium">
              Popular
            </div>
            <h3 className="text-2xl font-bold mb-2">Small Firm</h3>
            <div className="mb-6">
              <span className="text-4xl font-bold">£79</span>
              <span className="text-text-secondary">/month</span>
            </div>
            <ul className="space-y-3 mb-8">
              <li className="flex items-start gap-2">
                <span className="text-success-green mt-1">✓</span>
                <span>Everything in Solo</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-success-green mt-1">✓</span>
                <span>Job context (name, type, value)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-success-green mt-1">✓</span>
                <span>Conversation history</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-success-green mt-1">✓</span>
                <span>Light memory across chats</span>
              </li>
            </ul>
            <Link
              href="/signup?plan=small_firm"
              className="block w-full text-center px-6 py-3 bg-accent-blue hover:bg-accent-blue-hover text-white rounded-lg transition-colors"
            >
              Start free trial
            </Link>
          </div>

          {/* Pro */}
          <div className="bg-bg-secondary border border-border-subtle rounded-lg p-8">
            <h3 className="text-2xl font-bold mb-2">Pro</h3>
            <div className="mb-6">
              <span className="text-4xl font-bold">£149</span>
              <span className="text-text-secondary">/month</span>
            </div>
            <ul className="space-y-3 mb-8">
              <li className="flex items-start gap-2">
                <span className="text-success-green mt-1">✓</span>
                <span>Everything in Small Firm</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-success-green mt-1">✓</span>
                <span>Multiple users per account</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-success-green mt-1">✓</span>
                <span>Shared conversations</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-success-green mt-1">✓</span>
                <span>Dispute wording packs</span>
              </li>
            </ul>
            <Link
              href="/signup?plan=pro"
              className="block w-full text-center px-6 py-3 bg-bg-elevated border border-border-subtle hover:border-accent-blue rounded-lg transition-colors"
            >
              Start free trial
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border-subtle py-12">
        <div className="container mx-auto px-6 max-w-6xl text-center text-text-muted text-sm">
          <p>&copy; 2025 Builder GPT. Built for UK builders and trades.</p>
        </div>
      </footer>
    </div>
  )
}
