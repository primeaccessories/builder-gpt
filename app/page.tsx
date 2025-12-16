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
      {/* ChatGPT-style Header */}
      <header className="border-b border-white/10 sticky top-0 z-50 backdrop-blur-xl bg-black/80">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center max-w-7xl">
          <div className="flex items-center gap-3">
            <div className="text-2xl font-bold bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent">
              Builder GPT
            </div>
          </div>
          <Link
            href="/login"
            className="px-5 py-2 rounded-lg border border-white/20 hover:bg-white/10 transition-all text-sm font-medium"
          >
            Log in
          </Link>
        </div>
      </header>

      {/* Hero Section - ChatGPT style */}
      <section className="container mx-auto px-6 py-24 md:py-32 max-w-5xl text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-orange-400/30 bg-orange-400/10 text-orange-400 text-sm font-medium mb-8">
          <span className="w-2 h-2 bg-orange-400 rounded-full animate-pulse"></span>
          Your AI building advisor
        </div>

        <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold mb-8 leading-tight">
          The one-stop shop
          <br />
          <span className="bg-gradient-to-r from-orange-400 via-amber-300 to-orange-400 bg-clip-text text-transparent">
            for all builder needs
          </span>
        </h1>

        <p className="text-xl md:text-2xl text-white/60 mb-12 max-w-3xl mx-auto font-light">
          Get instant expert guidance on payments, difficult customers, pricing, disputes, and everything in between.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-6">
          <Link
            href="/signup"
            className="px-10 py-4 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold rounded-xl transition-all hover:scale-105 text-lg shadow-lg shadow-orange-500/25"
          >
            Get started free
          </Link>
          <Link
            href="/login"
            className="px-10 py-4 bg-white/5 border border-white/20 hover:bg-white/10 hover:border-white/30 text-white font-semibold rounded-xl transition-all text-lg"
          >
            Log in
          </Link>
        </div>
        <p className="text-sm text-white/40">7-day free trial · No credit card required</p>
      </section>

      {/* What Builder GPT helps with - with emojis */}
      <section className="container mx-auto px-6 py-20 max-w-7xl">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">What Builder GPT helps with</h2>
          <p className="text-xl text-white/50">Get instant answers to your toughest builder challenges</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { emoji: '💰', title: 'Payment problems', desc: 'Late payments, non-payment, professional chase wording' },
            { emoji: '🔧', title: 'Changes & extras', desc: 'Handle scope creep, price extras fairly, keep control' },
            { emoji: '😤', title: 'Difficult customers', desc: 'Manage unreasonable demands, set clear expectations' },
            { emoji: '⏰', title: 'Jobs running over', desc: 'Handle delays, control costs, communicate clearly' },
            { emoji: '📊', title: 'Pricing pushback', desc: 'Defend your quotes, handle objections confidently' },
            { emoji: '⚠️', title: 'Disputes starting', desc: 'De-escalate situations, get professional wording, know your next steps' },
            { emoji: '📝', title: 'Contract issues', desc: 'Understand terms, spot problems, protect yourself' },
            { emoji: '👥', title: 'Subcontractor problems', desc: 'Manage subs, handle issues, maintain standards' },
            { emoji: '🏗️', title: 'Job planning', desc: 'Schedule work, manage resources, avoid common pitfalls' },
          ].map((item, i) => (
            <div
              key={i}
              className="group bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 hover:border-orange-400/30 transition-all duration-300 cursor-pointer"
            >
              <div className="text-4xl mb-4">{item.emoji}</div>
              <h3 className="text-xl font-semibold mb-2 group-hover:text-orange-400 transition-colors">
                {item.title}
              </h3>
              <p className="text-white/60 text-sm leading-relaxed">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="container mx-auto px-6 py-20 max-w-5xl">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">How it works</h2>
          <p className="text-xl text-white/50">Get expert guidance in three simple steps</p>
        </div>

        <div className="grid md:grid-cols-3 gap-12">
          {[
            { step: '01', emoji: '🎯', title: 'Pick your issue', desc: 'Select what you need help with from common builder challenges' },
            { step: '02', emoji: '💬', title: 'Describe it', desc: 'Chat naturally about your situation - no complicated forms' },
            { step: '03', emoji: '✅', title: 'Get clear guidance', desc: 'Receive actionable advice: what\'s happening, the risks, and what to do next' },
          ].map((item, i) => (
            <div key={i} className="text-center">
              <div className="text-6xl font-bold text-white/10 mb-4">{item.step}</div>
              <div className="text-5xl mb-4">{item.emoji}</div>
              <h3 className="text-xl font-semibold mb-3">{item.title}</h3>
              <p className="text-white/60 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="container mx-auto px-6 py-20 max-w-7xl">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">Simple pricing</h2>
          <p className="text-xl text-white/50">Choose the plan that works for your business</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Solo Builder */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-8 hover:border-white/20 transition-all">
            <h3 className="text-2xl font-bold mb-2">Solo Builder</h3>
            <div className="mb-6">
              <span className="text-5xl font-bold">£15</span>
              <span className="text-white/40 text-lg">/month</span>
            </div>
            <ul className="space-y-3 mb-8">
              <li className="flex items-start gap-3">
                <span className="text-orange-400 text-xl">✓</span>
                <span className="text-white/80">Unlimited chat</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-orange-400 text-xl">✓</span>
                <span className="text-white/80">All issue categories</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-white/20 text-xl">—</span>
                <span className="text-white/30">No conversation history</span>
              </li>
            </ul>
            <Link
              href="/signup?plan=solo"
              className="block w-full text-center px-6 py-3 bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 rounded-xl transition-all font-medium"
            >
              Start free trial
            </Link>
          </div>

          {/* Small Firm - Featured */}
          <div className="relative bg-gradient-to-b from-orange-500/10 to-amber-500/10 border-2 border-orange-400/40 rounded-2xl p-8 shadow-2xl shadow-orange-500/20">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-6 py-2 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full text-sm font-semibold">
              Most popular
            </div>
            <h3 className="text-2xl font-bold mb-2">Small Firm</h3>
            <div className="mb-6">
              <span className="text-5xl font-bold">£29</span>
              <span className="text-white/40 text-lg">/month</span>
            </div>
            <ul className="space-y-3 mb-8">
              <li className="flex items-start gap-3">
                <span className="text-orange-400 text-xl">✓</span>
                <span className="text-white/90">Everything in Solo</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-orange-400 text-xl">✓</span>
                <span className="text-white/90">Job context tracking</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-orange-400 text-xl">✓</span>
                <span className="text-white/90">Conversation history</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-orange-400 text-xl">✓</span>
                <span className="text-white/90">Context memory</span>
              </li>
            </ul>
            <Link
              href="/signup?plan=small_firm"
              className="block w-full text-center px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-xl transition-all font-semibold hover:scale-105"
            >
              Start free trial
            </Link>
          </div>

          {/* Pro */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-8 hover:border-white/20 transition-all">
            <h3 className="text-2xl font-bold mb-2">Pro</h3>
            <div className="mb-6">
              <span className="text-5xl font-bold">£49</span>
              <span className="text-white/40 text-lg">/month</span>
            </div>
            <ul className="space-y-3 mb-8">
              <li className="flex items-start gap-3">
                <span className="text-orange-400 text-xl">✓</span>
                <span className="text-white/80">Everything in Small Firm</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-orange-400 text-xl">✓</span>
                <span className="text-white/80">Multi-user accounts</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-orange-400 text-xl">✓</span>
                <span className="text-white/80">Shared conversations</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-orange-400 text-xl">✓</span>
                <span className="text-white/80">Dispute wording packs</span>
              </li>
            </ul>
            <Link
              href="/signup?plan=pro"
              className="block w-full text-center px-6 py-3 bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 rounded-xl transition-all font-medium"
            >
              Start free trial
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-12 mt-20">
        <div className="container mx-auto px-6 max-w-7xl text-center text-white/40 text-sm">
          <p>&copy; 2025 Builder GPT. The one-stop shop for UK builders and trades.</p>
        </div>
      </footer>
    </div>
  )
}
