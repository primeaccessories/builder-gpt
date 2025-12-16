'use client'

import Link from 'next/link'

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* Header */}
      <header className="border-b border-white/10 backdrop-blur-xl bg-black/80">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center max-w-7xl">
          <Link href="/" className="flex items-center gap-3">
            <div className="text-2xl font-bold bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent">
              Builder GPT
            </div>
          </Link>
          <Link
            href="/login"
            className="text-sm text-white/60 hover:text-white transition-colors"
          >
            Already have an account? <span className="text-orange-400">Log in</span>
          </Link>
        </div>
      </header>

      {/* Pricing Content */}
      <div className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-7xl">
          <div className="text-center mb-16">
            <h1 className="text-5xl md:text-6xl font-bold mb-4">Choose your plan</h1>
            <p className="text-xl text-white/50">Start with a 7-day free trial — no card required</p>
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
                Start 7-day free trial
              </Link>
            </div>

            {/* Small Firm - Featured */}
            <div className="relative bg-gradient-to-b from-orange-500/10 to-amber-500/10 border-2 border-orange-400/40 rounded-2xl p-8 shadow-2xl shadow-orange-500/20 scale-105">
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
                Start 7-day free trial
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
                Start 7-day free trial
              </Link>
            </div>
          </div>

          {/* FAQ or Additional Info */}
          <div className="text-center mt-16">
            <p className="text-white/40 text-sm">
              All plans include a 7-day free trial. Cancel anytime.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
