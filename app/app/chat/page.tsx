'use client'

import { useState, useEffect, useRef } from 'use'
import { useSearchParams, useRouter } from 'next/navigation'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

export default function ChatPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const issue = searchParams.get('issue') || 'other'

  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [jobContext, setJobContext] = useState({
    name: '',
    type: '',
    value: '',
  })
  const [showJobContext, setShowJobContext] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    // Load user plan to determine if job context is available
    // For now, assume available (Tier 2+)
    // In production, fetch from /api/user/me
  }, [])

  const handleSend = async () => {
    if (!input.trim()) return

    const userMessage: Message = { role: 'user', content: input }
    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          issueType: issue,
          message: input,
          jobContext: showJobContext ? jobContext : undefined,
          conversationHistory: messages,
        }),
      })

      const data = await res.json()

      if (data.response) {
        const assistantMessage: Message = {
          role: 'assistant',
          content: data.response,
        }
        setMessages((prev) => [...prev, assistantMessage])
      }
    } catch (error) {
      console.error('Chat error:', error)
      alert('Something went wrong. Try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const getIssueTitle = () => {
    const titles: Record<string, string> = {
      payment: 'Payment problem',
      extras: 'Changes / extras',
      customer: 'Difficult customer',
      overrun: 'Job running over',
      pricing: 'Pricing pushback',
      dispute: 'Dispute starting',
      other: 'Something else',
    }
    return titles[issue] || 'Chat'
  }

  return (
    <div className="h-screen bg-bg-primary flex flex-col">
      {/* Header */}
      <header className="border-b border-border-subtle bg-bg-secondary/50 backdrop-blur-sm flex-shrink-0">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center max-w-4xl">
          <button
            onClick={() => router.push('/app')}
            className="text-text-secondary hover:text-text-primary transition-colors"
          >
            ← Back
          </button>
          <div className="text-lg font-semibold">{getIssueTitle()}</div>
          <button
            onClick={() => setShowJobContext(!showJobContext)}
            className="text-sm text-text-secondary hover:text-text-primary transition-colors"
          >
            {showJobContext ? 'Hide job' : 'Add job'}
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto">
            <div className="container mx-auto px-6 py-8 max-w-3xl">
              {messages.length === 0 && (
                <div className="text-center text-text-secondary py-12">
                  <p className="text-lg mb-2">Describe what's happening</p>
                  <p className="text-sm">I'll give you clear guidance on what to do</p>
                </div>
              )}

              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`mb-6 ${
                    msg.role === 'user' ? 'flex justify-end' : ''
                  }`}
                >
                  {msg.role === 'assistant' && (
                    <div className="bg-bg-secondary border border-border-subtle rounded-lg p-4 max-w-2xl">
                      <div className="whitespace-pre-wrap leading-relaxed">
                        {msg.content}
                      </div>
                    </div>
                  )}

                  {msg.role === 'user' && (
                    <div className="bg-accent-blue rounded-lg p-4 max-w-xl">
                      <div className="whitespace-pre-wrap leading-relaxed">
                        {msg.content}
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {isLoading && (
                <div className="bg-bg-secondary border border-border-subtle rounded-lg p-4 max-w-2xl">
                  <div className="flex gap-2">
                    <span className="w-2 h-2 bg-text-muted rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                    <span className="w-2 h-2 bg-text-muted rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                    <span className="w-2 h-2 bg-text-muted rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Input */}
          <div className="border-t border-border-subtle bg-bg-secondary/50 backdrop-blur-sm flex-shrink-0">
            <div className="container mx-auto px-6 py-4 max-w-3xl">
              <div className="flex gap-3">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Describe the situation..."
                  rows={1}
                  className="flex-1 px-4 py-3 bg-bg-elevated border border-border-subtle rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:border-accent-blue resize-none"
                  style={{ minHeight: '48px', maxHeight: '120px' }}
                />
                <button
                  onClick={handleSend}
                  disabled={isLoading || !input.trim()}
                  className="px-6 py-3 bg-accent-blue hover:bg-accent-blue-hover text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Job Context Sidebar (Tier 2+) */}
        {showJobContext && (
          <div className="w-80 border-l border-border-subtle bg-bg-secondary p-6 flex-shrink-0 overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Job context</h3>
            <p className="text-sm text-text-secondary mb-6">
              Add details to get better guidance
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Job name
                </label>
                <input
                  type="text"
                  value={jobContext.name}
                  onChange={(e) =>
                    setJobContext({ ...jobContext, name: e.target.value })
                  }
                  placeholder="e.g. Kitchen extension, Oak Street"
                  className="w-full px-3 py-2 bg-bg-elevated border border-border-subtle rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:border-accent-blue text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Job type
                </label>
                <input
                  type="text"
                  value={jobContext.type}
                  onChange={(e) =>
                    setJobContext({ ...jobContext, type: e.target.value })
                  }
                  placeholder="e.g. Extension, Renovation"
                  className="w-full px-3 py-2 bg-bg-elevated border border-border-subtle rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:border-accent-blue text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Approx value
                </label>
                <input
                  type="text"
                  value={jobContext.value}
                  onChange={(e) =>
                    setJobContext({ ...jobContext, value: e.target.value })
                  }
                  placeholder="e.g. £25k"
                  className="w-full px-3 py-2 bg-bg-elevated border border-border-subtle rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:border-accent-blue text-sm"
                />
              </div>

              <div className="pt-4 border-t border-border-subtle">
                <p className="text-xs text-text-muted">
                  Job context is saved with this conversation
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
