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
          For UK builders and trades
        </div>

        <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold mb-8 leading-tight">
          Know what to say.
          <br />
          <span className="bg-gradient-to-r from-orange-400 via-amber-300 to-orange-400 bg-clip-text text-transparent">
            Right now.
          </span>
        </h1>

        <p className="text-xl md:text-2xl text-white/60 mb-12 max-w-3xl mx-auto font-light">
          When a customer won't pay, adds extras without paperwork, or threatens you with a bad review — get the exact reply to send back. In seconds.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-6">
          <Link
            href="/pricing"
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

      {/* The moment you'll use it */}
      <section className="container mx-auto px-6 py-20 max-w-5xl">
        <div className="bg-white/5 border border-white/10 rounded-3xl p-12 text-center">
          <p className="text-white/50 text-sm uppercase tracking-wider mb-4">It's 7:30pm. You're knackered.</p>
          <p className="text-2xl md:text-3xl font-light text-white/90 mb-6 leading-relaxed">
            Your phone buzzes:<br />
            <span className="text-orange-400 font-semibold">"We're not happy, so we won't be paying the balance."</span>
          </p>
          <p className="text-xl text-white/70 mb-8">
            You don't want motivation. You don't want a course.<br />
            You want: <span className="text-white font-semibold">"What do I say back — now?"</span>
          </p>
          <p className="text-lg text-white/50">
            That's Builder GPT.
          </p>
        </div>
      </section>

      {/* What you get */}
      <section className="container mx-auto px-6 py-20 max-w-7xl">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">What you actually get</h2>
          <p className="text-xl text-white/50">Not theory. Not fluff. Just the next step.</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { emoji: '💷', title: 'Customer won\'t pay', desc: 'The exact message to send. How to get it in writing. What not to do.' },
            { emoji: '🔁', title: 'Scope creep ("just add...")', desc: 'How to say no professionally. How to price the extra. How to protect the original job.' },
            { emoji: '😤', title: 'Bad review threat', desc: 'How to respond without looking weak. When to offer a snag visit. When to stand firm.' },
            { emoji: '⚠️', title: 'Job stuck mid-way', desc: 'What to check first. What to do next. How to avoid making it worse.' },
            { emoji: '📄', title: 'Pricing questions', desc: 'How to structure the quote. What to exclude. How to defend your number.' },
            { emoji: '🧱', title: 'Subbie gone quiet', desc: 'Message to send. Backup plan. How to tell the client without drama.' },
          ].map((item, i) => (
            <div
              key={i}
              className="group bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 hover:border-orange-400/30 transition-all duration-300"
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

      {/* Why not just Google or ChatGPT */}
      <section className="container mx-auto px-6 py-20 max-w-5xl">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">Why not Google? Why not ChatGPT?</h2>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Google */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
            <h3 className="text-2xl font-bold mb-6 text-white/40">Google gives you:</h3>
            <ul className="space-y-3 text-white/60">
              <li className="flex items-start gap-3">
                <span className="text-red-400">✗</span>
                <span>10 conflicting answers</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-red-400">✗</span>
                <span>American advice (wrong laws)</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-red-400">✗</span>
                <span>Legal waffle you can't use</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-red-400">✗</span>
                <span>Forums from 2014</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-red-400">✗</span>
                <span>No decision</span>
              </li>
            </ul>
          </div>

          {/* ChatGPT */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
            <h3 className="text-2xl font-bold mb-6 text-white/40">ChatGPT gives you:</h3>
            <ul className="space-y-3 text-white/60">
              <li className="flex items-start gap-3">
                <span className="text-red-400">✗</span>
                <span>Tries to please everyone</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-red-400">✗</span>
                <span>Over-explains everything</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-red-400">✗</span>
                <span>Avoids taking a side</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-red-400">✗</span>
                <span>Doesn't understand UK trades</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-red-400">✗</span>
                <span>Doesn't protect your margins</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Builder GPT */}
        <div className="mt-8 bg-gradient-to-br from-orange-500/10 to-amber-500/10 border-2 border-orange-400/40 rounded-2xl p-8">
          <h3 className="text-2xl font-bold mb-6 text-orange-400">Builder GPT gives you:</h3>
          <ul className="grid md:grid-cols-2 gap-4 text-white">
            <li className="flex items-start gap-3">
              <span className="text-orange-400 text-xl">✓</span>
              <span><strong>A position</strong> — who's right, who's wrong</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-orange-400 text-xl">✓</span>
              <span><strong>A next step</strong> — do this, now</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-orange-400 text-xl">✓</span>
              <span><strong>A message</strong> — copy/paste and send</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-orange-400 text-xl">✓</span>
              <span><strong>UK-specific</strong> — built for your laws</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-orange-400 text-xl">✓</span>
              <span><strong>Protects cashflow</strong> — by default</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-orange-400 text-xl">✓</span>
              <span><strong>Keeps you safe</strong> — written proof first</span>
            </li>
          </ul>
        </div>
      </section>

      {/* What it saves you */}
      <section className="container mx-auto px-6 py-20 max-w-5xl bg-white/5 rounded-3xl">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">What it saves you</h2>
          <p className="text-xl text-white/50">One avoided mistake pays for a year</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
          <div className="text-center">
            <div className="text-5xl mb-3">💷</div>
            <h3 className="text-2xl font-bold mb-2">One unpaid balance</h3>
            <p className="text-white/60">Worth £500–£5,000</p>
          </div>
          <div className="text-center">
            <div className="text-5xl mb-3">📉</div>
            <h3 className="text-2xl font-bold mb-2">One underpriced job</h3>
            <p className="text-white/60">Worth £300–£2,000</p>
          </div>
          <div className="text-center">
            <div className="text-5xl mb-3">🔁</div>
            <h3 className="text-2xl font-bold mb-2">One wasted revisit</h3>
            <p className="text-white/60">Worth £150–£400</p>
          </div>
          <div className="text-center">
            <div className="text-5xl mb-3">⚖️</div>
            <h3 className="text-2xl font-bold mb-2">One legal headache</h3>
            <p className="text-white/60">Worth £1,000–£10,000</p>
          </div>
        </div>

        <p className="text-center text-xl text-white/70 mt-12">
          Builder GPT costs <strong className="text-orange-400">£15–£49/month</strong>.<br />
          That's less than fuel for two days.
        </p>
      </section>

      {/* Pricing */}
      <section id="pricing" className="container mx-auto px-6 py-20 max-w-7xl">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">Pick your plan</h2>
          <p className="text-xl text-white/50">7-day free trial. Cancel anytime.</p>
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

      {/* Final CTA */}
      <section className="container mx-auto px-6 py-20 max-w-4xl text-center">
        <div className="bg-gradient-to-br from-orange-500/20 to-amber-500/20 border-2 border-orange-400/40 rounded-3xl p-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Someone sensible in your corner
          </h2>
          <p className="text-xl text-white/70 mb-8 max-w-2xl mx-auto">
            In vans. On site. In the evening. Under pressure.<br />
            <strong className="text-white">That's when you'll use it.</strong>
          </p>
          <Link
            href="/pricing"
            className="inline-block px-12 py-5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-xl font-semibold rounded-xl transition-all hover:scale-105 shadow-lg shadow-orange-500/25"
          >
            Start 7-day free trial
          </Link>
          <p className="text-sm text-white/40 mt-4">No credit card required</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-12 mt-20">
        <div className="container mx-auto px-6 max-w-7xl text-center text-white/40 text-sm">
          <p>&copy; 2025 Builder GPT. For UK builders and trades.</p>
          <p className="mt-2">Know what to say. Right now.</p>
        </div>
      </footer>
    </div>
  )
}
