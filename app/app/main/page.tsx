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
          // Use first name from full name, or email as fallback
          const fullName = data.user?.name || ''
          const firstName = fullName.split(' ')[0] || data.user?.email?.split('@')[0] || 'User'
          setUserName(firstName)
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
    <div className="h-screen bg-gradient-to-br from-bg-primary via-bg-primary to-bg-secondary flex overflow-hidden">
      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? 'w-80' : 'w-0'
        } bg-black/40 backdrop-blur-xl border-r border-white/5 flex-shrink-0 transition-all duration-300 overflow-hidden flex flex-col`}
      >
        {/* Sidebar Header */}
        <div className="p-4">
          <button
            onClick={handleNewChat}
            className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-xl text-white font-medium transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>New chat</span>
          </button>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
          {conversations.length === 0 && (
            <div className="text-center py-16 px-4">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/5">
                <div className="text-3xl">💬</div>
              </div>
              <p className="text-text-muted text-sm leading-relaxed">
                Your conversations<br/>will appear here
              </p>
            </div>
          )}
          {conversations.map((conv) => (
            <button
              key={conv.id}
              onClick={() => loadConversation(conv.id)}
              className={`w-full px-4 py-3 rounded-xl text-left text-sm transition-all group ${
                currentConversationId === conv.id
                  ? 'bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 text-white'
                  : 'text-text-secondary hover:bg-white/5 hover:text-white border border-transparent'
              }`}
            >
              <div className="truncate flex items-center gap-2">
                <svg className={`w-4 h-4 flex-shrink-0 ${currentConversationId === conv.id ? 'text-blue-400' : 'text-text-muted'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <span className="truncate">{conv.name || 'New chat'}</span>
              </div>
            </button>
          ))}
        </div>

        {/* User Profile */}
        <div className="p-4 border-t border-white/5 relative user-menu-container">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="w-full flex items-center justify-between hover:bg-white/5 rounded-xl px-3 py-3 transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-semibold shadow-lg shadow-blue-500/30">
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
            <div className="absolute bottom-full left-4 right-4 mb-2 bg-black/90 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl overflow-hidden">
              <button
                onClick={handleUpgrade}
                className="w-full px-4 py-3 text-left hover:bg-white/5 transition-all flex items-center gap-3 group"
              >
                <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-white group-hover:text-blue-400 transition-colors">Upgrade plan</div>
                  <div className="text-xs text-text-muted">Get more features</div>
                </div>
              </button>
              <div className="border-t border-white/5"></div>
              <button
                onClick={handleLogout}
                className="w-full px-4 py-3 text-left hover:bg-white/5 transition-all flex items-center gap-3 group"
              >
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                  <svg className="w-4 h-4 text-text-muted group-hover:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </div>
                <span className="text-sm font-medium text-white group-hover:text-red-400 transition-colors">Log out</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="border-b border-white/5 bg-black/20 backdrop-blur-xl flex-shrink-0">
          <div className="px-6 py-4 flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-white/5 rounded-lg transition-all text-text-secondary hover:text-white"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/30">
                <span className="text-white text-sm font-bold">AI</span>
              </div>
              <div>
                <div className="text-base font-semibold text-white">Builder GPT</div>
                <div className="text-xs text-text-muted">Your AI construction assistant</div>
              </div>
            </div>
          </div>
        </header>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-3xl mx-auto px-6 py-8">
            {messages.length === 0 && (
              <div className="text-center py-20 animate-fade-in">
                <div className="mb-12">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-3xl flex items-center justify-center mx-auto mb-6 backdrop-blur-xl border border-white/10">
                    <div className="text-5xl">🏗️</div>
                  </div>
                  <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">
                    How can I help you today?
                  </h2>
                  <p className="text-text-secondary text-lg leading-relaxed max-w-md mx-auto">
                    Expert AI guidance for UK construction professionals
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
                      className="relative px-6 py-5 bg-gradient-to-br from-white/5 via-white/3 to-transparent border border-white/10 hover:border-blue-500/40 rounded-2xl text-sm text-left transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] group hover:shadow-xl hover:shadow-blue-500/10 backdrop-blur-sm overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 to-purple-500/0 group-hover:from-blue-500/5 group-hover:to-purple-500/5 transition-all duration-300"></div>
                      <div className="relative flex items-start gap-4">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 flex items-center justify-center flex-shrink-0 border border-white/5 group-hover:scale-110 transition-transform duration-300">
                          <span className="text-2xl">{example.icon}</span>
                        </div>
                        <div className="flex-1 pt-1">
                          <span className="text-white/70 group-hover:text-white transition-colors duration-300 leading-relaxed block text-[15px]">
                            {example.text}
                          </span>
                        </div>
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
                  <div className="flex gap-5 w-full animate-fade-in">
                    <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-500/25">
                      <span className="text-white text-sm font-bold">AI</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="prose prose-invert max-w-none">
                        <div className="whitespace-pre-wrap leading-[1.7] text-[15px] text-white/90">
                          {msg.content.split('\n').map((line, i) => {
                            // Handle bullet points
                            if (line.trim().startsWith('•') || line.trim().startsWith('-')) {
                              return (
                                <div key={i} className="flex gap-2 mb-2">
                                  <span className="text-blue-400 flex-shrink-0">•</span>
                                  <span>{line.replace(/^[•\-]\s*/, '')}</span>
                                </div>
                              )
                            }
                            // Handle numbered lists
                            if (/^\d+\./.test(line.trim())) {
                              return (
                                <div key={i} className="flex gap-2 mb-2">
                                  <span className="text-blue-400 flex-shrink-0 font-semibold">
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
                  <div className="bg-gradient-to-br from-blue-600/10 to-purple-600/10 border border-blue-500/20 rounded-2xl px-6 py-4 max-w-2xl shadow-lg animate-fade-in backdrop-blur-sm">
                    <div className="whitespace-pre-wrap leading-[1.7] text-[15px] text-white">
                      {msg.content}
                    </div>
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-5 max-w-3xl animate-fade-in">
                <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-500/25 animate-pulse-slow">
                  <span className="text-white text-sm font-bold">AI</span>
                </div>
                <div className="flex-1 pt-2">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1.5">
                      <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                      <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                      <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                    </div>
                    <span className="text-sm text-text-muted ml-2">Thinking...</span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input */}
        <div className="border-t border-white/5 bg-black/20 backdrop-blur-xl flex-shrink-0">
          <div className="max-w-3xl mx-auto px-6 py-6">
            <div className="flex gap-3 items-end">
              <div className="flex-1 relative">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Ask about payments, disputes, pricing, or any building issue..."
                  rows={1}
                  className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-text-muted focus:outline-none focus:border-blue-500/50 focus:bg-white/10 resize-none transition-all shadow-lg"
                  style={{ minHeight: '56px', maxHeight: '200px' }}
                />
              </div>
              <button
                onClick={handleSend}
                disabled={isLoading || !input.trim()}
                className="px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium rounded-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0 h-[56px] hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-blue-500/20 disabled:hover:scale-100"
              >
                {isLoading ? (
                  <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                )}
              </button>
            </div>
            <p className="text-xs text-text-muted mt-3 text-center">
              Builder GPT can make mistakes. Always verify important advice.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
