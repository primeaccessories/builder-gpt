'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

interface Conversation {
  id: string
  name: string
  issueType: string
  createdAt: string
}

export default function MainChatPage() {
  const router = useRouter()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [userName, setUserName] = useState('')
  const [userPlan, setUserPlan] = useState('')
  const [showUserMenu, setShowUserMenu] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    // Fetch user info
    const fetchUser = async () => {
      try {
        const res = await fetch('/api/user/me')
        if (res.ok) {
          const data = await res.json()
          setUserName(data.user?.name || data.user?.email?.split('@')[0] || 'User')
          setUserPlan(data.user?.plan || 'SOLO')
        }
      } catch (error) {
        console.error('Failed to fetch user:', error)
      }
    }

    fetchUser()
  }, [])

  const handleNewChat = () => {
    setCurrentConversationId(null)
    setMessages([])
  }

  const sendMessage = async (messageText: string, previousMessages: Message[] = messages) => {
    setIsLoading(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          issueType: 'OTHER',
          message: messageText,
          conversationHistory: previousMessages,
          conversationId: currentConversationId,
        }),
      })

      const data = await res.json()

      if (data.response) {
        const assistantMessage: Message = {
          role: 'assistant',
          content: data.response,
        }
        setMessages((prev) => [...prev, assistantMessage])

        // If this is a new conversation, add it to the sidebar
        if (!currentConversationId && data.conversationId) {
          setCurrentConversationId(data.conversationId)
          // Refresh conversations list
          loadConversations()
        }
      }
    } catch (error) {
      console.error('Chat error:', error)
      const errorMessage: Message = {
        role: 'assistant',
        content: 'Sorry, something went wrong. Please try again.',
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleSend = async () => {
    if (!input.trim()) return

    const userMessage: Message = { role: 'user', content: input }
    setMessages((prev) => [...prev, userMessage])
    const messageToSend = input
    setInput('')

    await sendMessage(messageToSend, [...messages, userMessage])
  }

  const handleRegenerate = async () => {
    if (messages.length < 2) return

    // Remove last AI response
    const newMessages = messages.slice(0, -1)
    setMessages(newMessages)

    // Get the last user message
    const lastUserMessage = newMessages[newMessages.length - 1]
    if (lastUserMessage && lastUserMessage.role === 'user') {
      // Regenerate using messages before the last AI response
      await sendMessage(lastUserMessage.content, newMessages.slice(0, -1))
    }
  }

  const loadConversations = async () => {
    try {
      const res = await fetch('/api/conversations')
      if (res.ok) {
        const data = await res.json()
        setConversations(data.conversations || [])
      }
    } catch (error) {
      console.error('Failed to load conversations:', error)
    }
  }

  const loadConversation = async (id: string) => {
    try {
      const res = await fetch(`/api/conversations/${id}`)
      if (res.ok) {
        const data = await res.json()
        setCurrentConversationId(id)
        setMessages(data.messages || [])
      }
    } catch (error) {
      console.error('Failed to load conversation:', error)
    }
  }

  useEffect(() => {
    loadConversations()
  }, [])

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (showUserMenu && !target.closest('.user-menu-container')) {
        setShowUserMenu(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showUserMenu])

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleLogout = async () => {
    document.cookie = 'auth-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
    router.push('/')
  }

  const getPlanDisplayName = (plan: string) => {
    const names: Record<string, string> = {
      SOLO: 'Solo',
      SMALL_FIRM: 'Small Firm',
      PRO: 'Pro',
    }
    return names[plan] || plan
  }

  const handleUpgrade = () => {
    router.push('/pricing')
  }

  return (
    <div className="h-screen bg-bg-primary flex overflow-hidden">
      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? 'w-72' : 'w-0'
        } bg-bg-secondary border-r border-border-subtle flex-shrink-0 transition-all duration-300 overflow-hidden flex flex-col`}
      >
        {/* Sidebar Header */}
        <div className="p-4 border-b border-border-subtle">
          <button
            onClick={handleNewChat}
            className="w-full px-4 py-3 bg-bg-elevated border border-border-subtle hover:border-accent-blue rounded-lg text-left transition-all hover:bg-bg-hover group flex items-center gap-3"
          >
            <svg className="w-5 h-5 text-text-muted group-hover:text-accent-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span className="text-sm font-medium">New chat</span>
          </button>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto p-3">
          {conversations.length === 0 && (
            <p className="text-text-muted text-sm text-center py-8">
              No chats yet
            </p>
          )}
          {conversations.map((conv) => (
            <button
              key={conv.id}
              onClick={() => loadConversation(conv.id)}
              className={`w-full px-3 py-2 rounded-lg text-left text-sm mb-1 transition-all ${
                currentConversationId === conv.id
                  ? 'bg-bg-hover text-text-primary'
                  : 'text-text-secondary hover:bg-bg-hover hover:text-text-primary'
              }`}
            >
              <div className="truncate">{conv.name || 'New chat'}</div>
            </button>
          ))}
        </div>

        {/* User Profile */}
        <div className="p-4 border-t border-border-subtle relative user-menu-container">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="w-full flex items-center justify-between hover:bg-bg-hover rounded-lg px-2 py-2 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                {userName.charAt(0).toUpperCase()}
              </div>
              <div className="text-left">
                <div className="text-sm font-medium">{userName}</div>
                <div className="text-xs text-text-muted">{getPlanDisplayName(userPlan)} Plan</div>
              </div>
            </div>
            <svg className={`w-4 h-4 text-text-muted transition-transform ${showUserMenu ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </svg>
          </button>

          {/* Dropdown Menu */}
          {showUserMenu && (
            <div className="absolute bottom-full left-4 right-4 mb-2 bg-bg-elevated border border-border-subtle rounded-lg shadow-lg overflow-hidden">
              <button
                onClick={handleUpgrade}
                className="w-full px-4 py-3 text-left hover:bg-bg-hover transition-colors flex items-center gap-3"
              >
                <svg className="w-5 h-5 text-accent-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
                <div>
                  <div className="text-sm font-medium">Upgrade plan</div>
                  <div className="text-xs text-text-muted">Get more features</div>
                </div>
              </button>
              <div className="border-t border-border-subtle"></div>
              <button
                onClick={handleLogout}
                className="w-full px-4 py-3 text-left hover:bg-bg-hover transition-colors flex items-center gap-3"
              >
                <svg className="w-5 h-5 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span className="text-sm font-medium">Log out</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="border-b border-border-subtle bg-bg-secondary/50 backdrop-blur-sm flex-shrink-0">
          <div className="px-6 py-4 flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-text-secondary hover:text-text-primary transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div className="text-lg font-semibold">Builder GPT</div>
          </div>
        </header>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-3xl mx-auto px-6 py-8">
            {messages.length === 0 && (
              <div className="text-center py-16">
                <div className="mb-8">
                  <div className="text-6xl mb-4">🏗️</div>
                  <h2 className="text-3xl font-bold mb-3">How can I help you today?</h2>
                  <p className="text-text-secondary text-lg">
                    Ask me about payments, disputes, pricing, or any building-related issue
                  </p>
                </div>

                {/* Example prompts */}
                <div className="grid md:grid-cols-2 gap-3 max-w-2xl mx-auto">
                  {[
                    { icon: '💷', text: 'Customer refusing to pay final balance' },
                    { icon: '📄', text: 'How to price a kitchen extension' },
                    { icon: '🔁', text: 'Client wants extras but no paperwork' },
                    { icon: '🧱', text: 'Job running over budget - what to do' },
                    { icon: '😤', text: 'Difficult customer changing their mind' },
                    { icon: '⚠️', text: 'Customer threatening legal action' },
                  ].map((example, idx) => (
                    <button
                      key={idx}
                      onClick={() => setInput(example.text)}
                      className="px-4 py-3 bg-bg-secondary border border-border-subtle hover:border-orange-500/50 rounded-xl text-sm text-left transition-all hover:bg-bg-hover group"
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-xl">{example.icon}</span>
                        <span className="group-hover:text-white transition-colors">"{example.text}"</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`group mb-8 ${
                  msg.role === 'user' ? 'flex justify-end' : ''
                }`}
              >
                {msg.role === 'assistant' && (
                  <div className="flex gap-4 w-full">
                    <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-amber-500 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-sm font-bold">AI</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="prose prose-invert max-w-none">
                        <div className="whitespace-pre-wrap leading-relaxed text-text-primary">
                          {msg.content.split('\n').map((line, i) => {
                            // Handle bullet points
                            if (line.trim().startsWith('•') || line.trim().startsWith('-')) {
                              return (
                                <div key={i} className="flex gap-2 mb-2">
                                  <span className="text-orange-400 flex-shrink-0">•</span>
                                  <span>{line.replace(/^[•\-]\s*/, '')}</span>
                                </div>
                              )
                            }
                            // Handle numbered lists
                            if (/^\d+\./.test(line.trim())) {
                              return (
                                <div key={i} className="flex gap-2 mb-2">
                                  <span className="text-orange-400 flex-shrink-0 font-semibold">
                                    {line.match(/^\d+\./)?.[0]}
                                  </span>
                                  <span>{line.replace(/^\d+\.\s*/, '')}</span>
                                </div>
                              )
                            }
                            // Handle bold text **text**
                            if (line.includes('**')) {
                              const parts = line.split(/(\*\*.*?\*\*)/)
                              return (
                                <p key={i} className="mb-2">
                                  {parts.map((part, j) => {
                                    if (part.startsWith('**') && part.endsWith('**')) {
                                      return (
                                        <strong key={j} className="font-semibold text-white">
                                          {part.slice(2, -2)}
                                        </strong>
                                      )
                                    }
                                    return part
                                  })}
                                </p>
                              )
                            }
                            // Regular paragraph
                            if (line.trim()) {
                              return <p key={i} className="mb-2">{line}</p>
                            }
                            return <br key={i} />
                          })}
                        </div>
                      </div>
                      <div className="mt-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(msg.content)
                          }}
                          className="p-1.5 hover:bg-bg-hover rounded-lg transition-colors"
                          title="Copy"
                        >
                          <svg className="w-4 h-4 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                        </button>
                        {idx === messages.length - 1 && !isLoading && (
                          <button
                            onClick={handleRegenerate}
                            className="p-1.5 hover:bg-bg-hover rounded-lg transition-colors"
                            title="Regenerate response"
                          >
                            <svg className="w-4 h-4 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {msg.role === 'user' && (
                  <div className="bg-bg-elevated rounded-2xl px-5 py-3 max-w-2xl">
                    <div className="whitespace-pre-wrap leading-relaxed text-text-primary">
                      {msg.content}
                    </div>
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-4 max-w-3xl">
                <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-amber-500 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-sm font-bold">AI</span>
                </div>
                <div className="flex-1 pt-1">
                  <div className="flex gap-2">
                    <span className="w-2 h-2 bg-text-muted rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                    <span className="w-2 h-2 bg-text-muted rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                    <span className="w-2 h-2 bg-text-muted rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input */}
        <div className="border-t border-border-subtle bg-bg-secondary/50 backdrop-blur-sm flex-shrink-0">
          <div className="max-w-3xl mx-auto px-6 py-4">
            <div className="flex gap-3">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Message Builder GPT..."
                rows={1}
                className="flex-1 px-4 py-3 bg-bg-elevated border border-border-subtle rounded-xl text-text-primary placeholder-text-muted focus:outline-none focus:border-accent-blue resize-none"
                style={{ minHeight: '52px', maxHeight: '200px' }}
              />
              <button
                onClick={handleSend}
                disabled={isLoading || !input.trim()}
                className="px-5 py-3 bg-accent-blue hover:bg-accent-blue-hover text-white font-medium rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0 h-[52px]"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
            <p className="text-xs text-text-muted mt-2 text-center">
              Builder GPT can make mistakes. Always verify important advice.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
