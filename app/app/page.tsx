'use client'

import { useRouter } from 'next/navigation'

const ISSUES = [
  {
    id: 'payment',
    emoji: '💷',
    title: 'Payment problem',
    desc: 'Late payment, non-payment, chase wording',
  },
  {
    id: 'extras',
    emoji: '🔁',
    title: 'Changes / extras',
    desc: 'Scope creep, pricing additional work',
  },
  {
    id: 'customer',
    emoji: '😤',
    title: 'Difficult customer',
    desc: 'Unreasonable demands, managing expectations',
  },
  {
    id: 'overrun',
    emoji: '🧱',
    title: 'Job running over',
    desc: 'Delays, cost overruns, timeline issues',
  },
  {
    id: 'pricing',
    emoji: '📄',
    title: 'Pricing pushback',
    desc: 'Client questioning quote, price negotiations',
  },
  {
    id: 'dispute',
    emoji: '⚠️',
    title: 'Dispute starting',
    desc: 'Complaint, legal threat, escalating situation',
  },
  {
    id: 'other',
    emoji: '❓',
    title: 'Something else',
    desc: 'Another construction business issue',
  },
]

export default function IssueSelectorPage() {
  const router = useRouter()

  const handleIssueClick = (issueId: string) => {
    router.push(`/app/chat?issue=${issueId}`)
  }

  return (
    <div className="min-h-screen bg-bg-primary">
      {/* Header */}
      <header className="border-b border-border-subtle bg-bg-secondary/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center max-w-4xl">
          <div className="text-xl font-semibold">Builder GPT</div>
          <button
            onClick={() => router.push('/app/settings')}
            className="text-text-secondary hover:text-text-primary transition-colors"
          >
            Settings
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-12 max-w-4xl">
        <h1 className="text-4xl font-bold mb-2 text-center">What's the issue?</h1>
        <p className="text-text-secondary text-center mb-12">Pick what you need help with</p>

        <div className="grid md:grid-cols-2 gap-4">
          {ISSUES.map((issue) => (
            <button
              key={issue.id}
              onClick={() => handleIssueClick(issue.id)}
              className="bg-bg-secondary border border-border-subtle hover:border-accent-blue rounded-lg p-6 text-left transition-all hover:scale-[1.02] group"
            >
              <div className="flex items-start gap-4">
                <span className="text-4xl">{issue.emoji}</span>
                <div>
                  <h3 className="text-xl font-semibold mb-1 group-hover:text-accent-blue transition-colors">
                    {issue.title}
                  </h3>
                  <p className="text-text-secondary text-sm">{issue.desc}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </main>
    </div>
  )
}
