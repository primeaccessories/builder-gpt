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
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 backdrop-blur-xl bg-black/50 border-b border-white/10">
        <div className="container mx-auto px-6 lg:px-8 py-5 flex justify-between items-center max-w-7xl">
          <div className="text-xl font-semibold tracking-tight">
            Builder GPT
          </div>
          <Link
            href="/login"
            className="text-sm text-white/60 hover:text-white transition-colors duration-300"
          >
            Sign in
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-6 overflow-hidden">
        {/* Premium gradient orbs */}
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-blue-500/30 rounded-full blur-[120px] animate-pulse" style={{ animationDuration: '4s' }} />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-purple-500/20 rounded-full blur-[100px] animate-pulse" style={{ animationDuration: '6s' }} />

        <div className="container mx-auto max-w-6xl relative z-10 py-32">
          <div className="text-center space-y-12">
            {/* Headline with refined typography */}
            <h1 className="text-7xl md:text-8xl lg:text-9xl font-bold tracking-tight leading-[0.95] mb-8">
              <span className="block text-white/90">Clear advice.</span>
              <span className="block bg-gradient-to-r from-white to-white/40 bg-clip-text text-transparent">
                Real problems.
              </span>
            </h1>

            {/* Subtitle with better spacing */}
            <p className="text-2xl md:text-3xl text-white/50 max-w-3xl mx-auto leading-relaxed font-light">
              The AI advisor built specifically for UK builders and trades
            </p>

            {/* CTA with premium styling */}
            <form onSubmit={handleGetStarted} className="max-w-xl mx-auto mt-12">
              <div className="flex flex-col sm:flex-row gap-4">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  className="flex-1 px-6 py-5 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl text-white placeholder-white/30 focus:outline-none focus:border-white/30 focus:bg-white/10 transition-all duration-300 text-lg"
                />
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-10 py-5 bg-white text-black font-semibold rounded-2xl transition-all duration-300 hover:bg-white/90 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 text-lg"
                >
                  {isLoading ? 'Sending...' : 'Get started'}
                </button>
              </div>
              <p className="text-sm text-white/40 mt-4">Start your free 7-day trial — no card required</p>
            </form>

            {/* Minimal trust indicators */}
            <div className="flex items-center justify-center gap-12 text-sm text-white/40 pt-12">
              <span>UK focused</span>
              <span className="w-1 h-1 rounded-full bg-white/20" />
              <span>Plain English</span>
              <span className="w-1 h-1 rounded-full bg-white/20" />
              <span>Instant answers</span>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 text-white/30 animate-bounce">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </section>

      {/* Problem areas */}
      <section className="py-32 px-6 relative bg-gradient-to-b from-black to-zinc-950">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-6xl font-bold mb-6 tracking-tight">
              Built for real problems
            </h2>
            <p className="text-xl md:text-2xl text-white/40 font-light">
              Get clear guidance when it matters most
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { title: 'Payment problems', desc: 'Late payments, chase wording, protecting your position' },
              { title: 'Changes & extras', desc: 'Scope creep, pricing additional work, keeping control' },
              { title: 'Difficult customers', desc: 'Managing unreasonable demands and expectations' },
              { title: 'Jobs running over', desc: 'Delays, cost control, clear client communication' },
              { title: 'Pricing pushback', desc: 'Defending quotes, handling objections confidently' },
              { title: 'Disputes', desc: 'De-escalation tactics, professional wording, next steps' },
            ].map((item, i) => (
              <div
                key={i}
                className="group relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 hover:bg-white/10 hover:border-white/20 transition-all duration-500 cursor-pointer"
              >
                <h3 className="text-2xl font-semibold mb-3 text-white/90 group-hover:text-white transition-colors duration-300">
                  {item.title}
                </h3>
                <p className="text-base text-white/40 leading-relaxed group-hover:text-white/60 transition-colors duration-300">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-32 px-6 bg-black relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-full blur-[150px]" />

        <div className="container mx-auto max-w-5xl relative z-10">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-6xl font-bold mb-6 tracking-tight">
              Simple. Fast. Clear.
            </h2>
            <p className="text-xl md:text-2xl text-white/40 font-light">
              Three steps to actionable advice
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-16">
            {[
              { step: '01', title: 'Pick your issue', desc: 'Select the problem you're facing' },
              { step: '02', title: 'Describe it', desc: 'Chat naturally, no forms to fill' },
              { step: '03', title: 'Get guidance', desc: 'Clear next steps, ready to use' },
            ].map((item, i) => (
              <div key={i} className="text-center group">
                <div className="text-7xl font-bold mb-8 bg-gradient-to-br from-white/20 to-white/5 bg-clip-text text-transparent group-hover:from-white/40 group-hover:to-white/10 transition-all duration-500">
                  {item.step}
                </div>
                <h3 className="text-2xl font-semibold mb-4 text-white/90">{item.title}</h3>
                <p className="text-lg text-white/40 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-32 px-6 bg-gradient-to-b from-zinc-950 to-black">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-6xl font-bold mb-6 tracking-tight">
              Simple pricing
            </h2>
            <p className="text-xl md:text-2xl text-white/40 font-light">
              Start with a 7-day free trial — no card required
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Solo Builder */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-10 hover:bg-white/[0.07] hover:border-white/20 transition-all duration-500">
              <div className="mb-8">
                <h3 className="text-2xl font-semibold mb-6 text-white/90">Solo Builder</h3>
                <div className="flex items-baseline gap-2">
                  <span className="text-6xl font-bold tracking-tight">£29</span>
                  <span className="text-xl text-white/40">/month</span>
                </div>
              </div>

              <ul className="space-y-4 mb-10">
                <li className="flex items-start gap-3 text-white/60">
                  <svg className="w-6 h-6 text-white/40 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Unlimited chat</span>
                </li>
                <li className="flex items-start gap-3 text-white/60">
                  <svg className="w-6 h-6 text-white/40 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>All issue categories</span>
                </li>
                <li className="flex items-start gap-3 text-white/30">
                  <svg className="w-6 h-6 text-white/20 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  <span>No conversation history</span>
                </li>
              </ul>

              <Link
                href="/signup?plan=solo"
                className="block w-full text-center px-6 py-4 bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 rounded-2xl transition-all duration-300 text-white/90 font-medium"
              >
                Start free trial
              </Link>
            </div>

            {/* Small Firm - Featured */}
            <div className="relative bg-white/10 backdrop-blur-xl border-2 border-white/30 rounded-3xl p-10 hover:border-white/40 transition-all duration-500 shadow-2xl shadow-white/10">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-6 py-2 bg-white text-black rounded-full text-sm font-semibold">
                Most popular
              </div>

              <div className="mb-8">
                <h3 className="text-2xl font-semibold mb-6 text-white">Small Firm</h3>
                <div className="flex items-baseline gap-2">
                  <span className="text-6xl font-bold tracking-tight">£79</span>
                  <span className="text-xl text-white/40">/month</span>
                </div>
              </div>

              <ul className="space-y-4 mb-10">
                <li className="flex items-start gap-3 text-white/90">
                  <svg className="w-6 h-6 text-white mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Everything in Solo</span>
                </li>
                <li className="flex items-start gap-3 text-white/90">
                  <svg className="w-6 h-6 text-white mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Job context tracking</span>
                </li>
                <li className="flex items-start gap-3 text-white/90">
                  <svg className="w-6 h-6 text-white mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Conversation history</span>
                </li>
                <li className="flex items-start gap-3 text-white/90">
                  <svg className="w-6 h-6 text-white mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Context memory</span>
                </li>
              </ul>

              <Link
                href="/signup?plan=small_firm"
                className="block w-full text-center px-6 py-4 bg-white text-black hover:bg-white/90 rounded-2xl transition-all duration-300 font-semibold hover:scale-[1.02]"
              >
                Start free trial
              </Link>
            </div>

            {/* Pro */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-10 hover:bg-white/[0.07] hover:border-white/20 transition-all duration-500">
              <div className="mb-8">
                <h3 className="text-2xl font-semibold mb-6 text-white/90">Pro</h3>
                <div className="flex items-baseline gap-2">
                  <span className="text-6xl font-bold tracking-tight">£149</span>
                  <span className="text-xl text-white/40">/month</span>
                </div>
              </div>

              <ul className="space-y-4 mb-10">
                <li className="flex items-start gap-3 text-white/60">
                  <svg className="w-6 h-6 text-white/40 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Everything in Small Firm</span>
                </li>
                <li className="flex items-start gap-3 text-white/60">
                  <svg className="w-6 h-6 text-white/40 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Multi-user accounts</span>
                </li>
                <li className="flex items-start gap-3 text-white/60">
                  <svg className="w-6 h-6 text-white/40 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Shared conversations</span>
                </li>
                <li className="flex items-start gap-3 text-white/60">
                  <svg className="w-6 h-6 text-white/40 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Dispute wording packs</span>
                </li>
              </ul>

              <Link
                href="/signup?plan=pro"
                className="block w-full text-center px-6 py-4 bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 rounded-2xl transition-all duration-300 text-white/90 font-medium"
              >
                Start free trial
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-16 px-6 bg-black">
        <div className="container mx-auto max-w-7xl text-center">
          <p className="text-sm text-white/30">
            &copy; 2025 Builder GPT. Built for UK builders and trades.
          </p>
        </div>
      </footer>
    </div>
  )
}
