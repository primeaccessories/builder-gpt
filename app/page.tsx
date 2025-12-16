'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function LandingPage() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleGetStarted = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

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
    <div className="min-h-screen bg-black text-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 glass border-b border-border-subtle">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center max-w-7xl">
          <div className="text-lg font-semibold tracking-tight">
            Builder GPT
          </div>
          <Link
            href="/login"
            className="text-sm text-text-secondary hover:text-white transition-colors"
          >
            Sign in
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-to-b from-accent-blue/10 via-transparent to-transparent opacity-50" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent-blue/20 rounded-full blur-3xl" />
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-accent-purple/20 rounded-full blur-3xl" />

        <div className="container mx-auto max-w-5xl relative z-10">
          <div className="text-center space-y-8 fade-in">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-border-subtle text-sm">
              <span className="w-2 h-2 bg-success-green rounded-full animate-pulse" />
              <span className="text-text-secondary">AI-powered construction advisor</span>
            </div>

            {/* Headline */}
            <h1 className="text-6xl md:text-7xl font-bold tracking-tight leading-[1.1]">
              Sort job problems.
              <br />
              <span className="bg-gradient-to-r from-white via-white to-text-secondary bg-clip-text text-transparent">
                Get clear answers.
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-xl md:text-2xl text-text-secondary max-w-3xl mx-auto leading-relaxed">
              Builder GPT helps UK builders deal with payment issues, extras, difficult customers,
              pricing pushback, and disputes.
              <span className="text-white font-medium"> Plain guidance. No waffle.</span>
            </p>

            {/* CTA */}
            <form onSubmit={handleGetStarted} className="max-w-md mx-auto">
              <div className="flex gap-3">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  className="flex-1 px-5 py-4 bg-bg-elevated border border-border-default rounded-xl text-white placeholder-text-muted focus:outline-none focus:border-accent-blue focus:ring-2 focus:ring-accent-blue/20 transition-all"
                />
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-8 py-4 bg-accent-blue hover:bg-accent-blue-hover text-white font-medium rounded-xl transition-all hover:shadow-glow-blue disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Sending...' : 'Get started'}
                </button>
              </div>
              <p className="text-sm text-text-muted mt-3">Free 7-day trial. No card needed.</p>
            </form>

            {/* Trust indicators */}
            <div className="flex items-center justify-center gap-8 text-sm text-text-muted pt-8">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-success-green" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>UK construction context</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-success-green" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Plain English</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-success-green" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Instant answers</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem areas */}
      <section className="py-20 px-6 relative">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Built for real builder problems
            </h2>
            <p className="text-xl text-text-secondary">
              Get guidance on the issues that actually cost you time and money
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { title: 'Payment problems', desc: 'Late payments, non-payment, chase wording', icon: '💷' },
              { title: 'Changes & extras', desc: 'Scope creep, pricing extras, keeping control', icon: '🔁' },
              { title: 'Difficult customers', desc: 'Unreasonable demands, managing expectations', icon: '😤' },
              { title: 'Jobs running over', desc: 'Delays, cost control, client communication', icon: '🧱' },
              { title: 'Pricing pushback', desc: 'Defending quotes, handling objections', icon: '📄' },
              { title: 'Dispute starting', desc: 'De-escalation, wording, next steps', icon: '⚠️' },
            ].map((item, i) => (
              <div
                key={i}
                className="group glass hover:bg-bg-elevated border border-border-subtle rounded-2xl p-6 hover-lift cursor-pointer fade-in"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <div className="text-4xl mb-4">{item.icon}</div>
                <h3 className="text-lg font-semibold mb-2 group-hover:text-accent-blue transition-colors">
                  {item.title}
                </h3>
                <p className="text-sm text-text-secondary leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 px-6 bg-bg-secondary">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Simple. Fast. Clear.
            </h2>
            <p className="text-xl text-text-secondary">
              Three steps to getting actionable advice
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            {[
              { step: '1', title: 'Pick your issue', desc: 'Click what you need help with' },
              { step: '2', title: 'Describe the situation', desc: 'Simple questions, not forms' },
              { step: '3', title: 'Get clear guidance', desc: "What's happening, the risk, what to do next" },
            ].map((item, i) => (
              <div key={i} className="text-center fade-in" style={{ animationDelay: `${i * 0.15}s` }}>
                <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-accent-blue to-accent-purple flex items-center justify-center text-2xl font-bold shadow-glow-blue">
                  {item.step}
                </div>
                <h3 className="text-xl font-semibold mb-3">{item.title}</h3>
                <p className="text-text-secondary leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 px-6">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Simple pricing
            </h2>
            <p className="text-xl text-text-secondary">
              All plans include 7-day free trial. No credit card required.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Solo Builder */}
            <div className="glass border border-border-subtle rounded-3xl p-8 hover-lift">
              <div className="mb-6">
                <h3 className="text-2xl font-bold mb-2">Solo Builder</h3>
                <div className="flex items-baseline gap-2 mb-4">
                  <span className="text-5xl font-bold">£29</span>
                  <span className="text-text-secondary">/month</span>
                </div>
              </div>

              <ul className="space-y-4 mb-8">
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-success-green mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-text-secondary">Unlimited chat</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-success-green mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-text-secondary">All issue categories</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-text-muted mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <span className="text-text-muted">No conversation history</span>
                </li>
              </ul>

              <Link
                href="/signup?plan=solo"
                className="block w-full text-center px-6 py-3 bg-bg-elevated border border-border-default hover:border-accent-blue rounded-xl transition-all hover-lift"
              >
                Start free trial
              </Link>
            </div>

            {/* Small Firm - Featured */}
            <div className="relative glass border-2 border-accent-blue rounded-3xl p-8 hover-lift shadow-glow-blue">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-accent-blue to-accent-purple rounded-full text-sm font-medium">
                Popular
              </div>

              <div className="mb-6">
                <h3 className="text-2xl font-bold mb-2">Small Firm</h3>
                <div className="flex items-baseline gap-2 mb-4">
                  <span className="text-5xl font-bold">£79</span>
                  <span className="text-text-secondary">/month</span>
                </div>
              </div>

              <ul className="space-y-4 mb-8">
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-success-green mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Everything in Solo</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-success-green mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Job context (name, type, value)</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-success-green mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Conversation history</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-success-green mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Light memory across chats</span>
                </li>
              </ul>

              <Link
                href="/signup?plan=small_firm"
                className="block w-full text-center px-6 py-3 bg-accent-blue hover:bg-accent-blue-hover text-white rounded-xl transition-all hover-lift"
              >
                Start free trial
              </Link>
            </div>

            {/* Pro */}
            <div className="glass border border-border-subtle rounded-3xl p-8 hover-lift">
              <div className="mb-6">
                <h3 className="text-2xl font-bold mb-2">Pro</h3>
                <div className="flex items-baseline gap-2 mb-4">
                  <span className="text-5xl font-bold">£149</span>
                  <span className="text-text-secondary">/month</span>
                </div>
              </div>

              <ul className="space-y-4 mb-8">
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-success-green mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Everything in Small Firm</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-success-green mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Multiple users per account</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-success-green mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Shared conversations</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-success-green mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Dispute wording packs</span>
                </li>
              </ul>

              <Link
                href="/signup?plan=pro"
                className="block w-full text-center px-6 py-3 bg-bg-elevated border border-border-default hover:border-accent-blue rounded-xl transition-all hover-lift"
              >
                Start free trial
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border-subtle py-12 px-6">
        <div className="container mx-auto max-w-7xl text-center">
          <p className="text-sm text-text-muted">
            &copy; 2025 Builder GPT. Built for UK builders and trades.
          </p>
        </div>
      </footer>
    </div>
  )
}
