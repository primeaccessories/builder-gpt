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
  const [sidebarOpen, setSidebarOpen] = useState(false) // Hidden by default on mobile
  const [userName, setUserName] = useState('')
  const [userPlan, setUserPlan] = useState('')
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Set sidebar open on desktop by default
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setSidebarOpen(true)
      } else {
        setSidebarOpen(false)
      }
    }

    handleResize() // Set initial state
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

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

        // Close sidebar on mobile after selecting conversation
        if (window.innerWidth < 768) {
          setSidebarOpen(false)
        }
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
    <div className="fixed inset-0 bg-[#343541] flex overflow-hidden">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        } ${
          sidebarOpen ? 'w-[260px]' : 'w-0 md:w-[260px]'
        } bg-[#0D0D0D] flex-shrink-0 transition-all duration-300 ease-out overflow-hidden flex flex-col fixed md:relative h-full z-50 md:z-auto border-r border-white/[0.08]`}
      >
        {/* Sidebar Header */}
        <div className="p-3 space-y-2.5">
          {/* Close button - mobile only */}
          <div className="flex justify-end md:hidden -mt-1 -mr-1">
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-2.5 hover:bg-white/[0.08] rounded-full text-white/50 hover:text-white transition-all duration-200 active:scale-95"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* New Chat Button */}
          <button
            onClick={handleNewChat}
            className="w-full px-3 py-2.5 border border-white/[0.12] hover:bg-white/[0.08] rounded-lg text-white/90 text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2 active:scale-[0.98]"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            <span>New chat</span>
          </button>

          {/* Search Input */}
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search..."
              className="w-full px-3 py-2 pl-9 bg-white/[0.05] border border-white/[0.08] rounded-lg text-white/90 text-sm placeholder-white/30 focus:outline-none focus:bg-white/[0.08] focus:border-white/[0.15] transition-all duration-200"
            />
            <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto px-2 py-2">
          {conversations
            .filter((conv) =>
              conv.name.toLowerCase().includes(searchQuery.toLowerCase())
            )
            .map((conv) => (
            <button
              key={conv.id}
              onClick={() => loadConversation(conv.id)}
              className={`w-full px-3 py-2.5 mb-1 rounded-lg text-left text-sm font-medium transition-all duration-200 group relative active:scale-[0.98] ${
                currentConversationId === conv.id
                  ? 'bg-white/[0.12] text-white shadow-sm'
                  : 'text-white/60 hover:bg-white/[0.06] hover:text-white/90'
              }`}
            >
              <div className="truncate flex items-center gap-2.5">
                <svg className="w-4 h-4 flex-shrink-0 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <span className="truncate">{conv.name || 'New chat'}</span>
              </div>
            </button>
          ))}
        </div>

        {/* User Profile */}
        <div className="p-2.5 border-t border-white/[0.08] relative user-menu-container">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="w-full flex items-center gap-3 hover:bg-white/[0.06] rounded-lg px-3 py-2.5 transition-all duration-200 text-white text-sm font-medium active:scale-[0.98]"
          >
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-semibold shadow-lg">
              {userName.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 text-left truncate text-white/90">{userName}</div>
            <svg className="w-4 h-4 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
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
      <div className="flex-1 flex flex-col bg-black overflow-hidden">
        {/* Header */}
        <header className="flex-shrink-0 bg-black/80 backdrop-blur-xl border-b border-white/[0.08] sticky top-0 z-10">
          <div className="px-4 py-3.5 flex items-center gap-2">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-white/[0.08] rounded-full transition-all duration-200 text-white/70 hover:text-white active:scale-95"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div className="flex-1 text-center">
              <div className="text-sm font-semibold text-white/90">Builder GPT</div>
            </div>
            <div className="w-9"></div> {/* Balance the hamburger button */}
          </div>
        </header>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden" style={{ WebkitOverflowScrolling: 'touch', overscrollBehavior: 'contain' }}>
          <div className="max-w-3xl mx-auto px-4 md:px-6 py-4 md:py-8 pb-4">
            {messages.length === 0 && (
              <div className="text-center py-12 px-4">
                <div className="mb-12">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-2xl">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-semibold mb-2 text-white/90">
                    Builder GPT
                  </h2>
                  <p className="text-sm text-white/50">
                    Know what to say. Right now.
                  </p>
                </div>

                {/* Example prompts */}
                <div className="grid md:grid-cols-2 gap-2.5 max-w-2xl mx-auto">
                  {[
                    { text: 'Customer won\'t pay the final balance. Keeps saying they\'re "not happy" but won\'t list issues.' },
                    { text: 'Customer keeps adding extras. I\'m halfway through and they assume it\'s included.' },
                    { text: 'How do I price plastering a staircase and landing?' },
                    { text: 'Customer says if I don\'t knock £300 off they\'ll ruin me on Facebook.' },
                    { text: 'My subbie has gone quiet and I\'m meant to finish Friday.' },
                    { text: 'How do I ask for a deposit without sounding dodgy?' },
                  ].map((example, idx) => (
                    <button
                      key={idx}
                      onClick={() => setInput(example.text)}
                      className="px-4 py-3.5 bg-white/[0.05] hover:bg-white/[0.08] border border-white/[0.1] rounded-xl text-sm text-left transition-all duration-200 text-white/70 hover:text-white/90 hover:border-white/[0.15] active:scale-[0.98]"
                    >
                      <div className="text-sm leading-relaxed">{example.text}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg, idx) => (
              <>
                {msg.role === 'assistant' && (
                  <div key={idx} className="w-full text-white border-b border-black/10 bg-[#444654]">
                    <div className="max-w-3xl mx-auto p-6 flex gap-6">
                      <div className="w-8 h-8 flex-shrink-0">
                        <div className="w-8 h-8 bg-[#19C37D] rounded-sm flex items-center justify-center">
                          <span className="text-white text-xs font-semibold">AI</span>
                        </div>
                      </div>
                      <div className="flex-1 overflow-hidden">
                        <div className="whitespace-pre-wrap text-base leading-7">
                          {msg.content.split('\n').map((line, i) => {
                            // Handle bullet points
                            if (line.trim().startsWith('•') || line.trim().startsWith('-')) {
                              return (
                                <div key={i} className="mb-1">
                                  <span>{line}</span>
                                </div>
                              )
                            }
                            // Handle numbered lists
                            if (/^\d+\./.test(line.trim())) {
                              return (
                                <div key={i} className="mb-1">
                                  <span>{line}</span>
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
                    </div>
                  </div>
                )}

                {msg.role === 'user' && (
                  <div key={idx} className="w-full text-white border-b border-black/10 bg-[#343541]">
                    <div className="max-w-3xl mx-auto p-6 flex gap-6">
                      <div className="w-8 h-8 flex-shrink-0">
                        <div className="w-8 h-8 bg-[#5436DA] rounded-sm flex items-center justify-center">
                          <span className="text-white text-xs font-semibold">{userName.charAt(0).toUpperCase()}</span>
                        </div>
                      </div>
                      <div className="flex-1 overflow-hidden">
                        <div className="whitespace-pre-wrap text-base leading-7">
                          {msg.content}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </>
            ))}

            {isLoading && (
              <div className="w-full text-white border-b border-black/10 bg-[#444654]">
                <div className="max-w-3xl mx-auto p-6 flex gap-6">
                  <div className="w-8 h-8 flex-shrink-0">
                    <div className="w-8 h-8 bg-[#19C37D] rounded-sm flex items-center justify-center">
                      <span className="text-white text-xs font-semibold">AI</span>
                    </div>
                  </div>
                  <div className="flex-1 overflow-hidden pt-1">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                      <span className="w-2 h-2 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                      <span className="w-2 h-2 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input - Fixed at bottom on mobile */}
        <div className="border-t border-white/[0.08] bg-black/80 backdrop-blur-xl flex-shrink-0 sticky bottom-0 z-10" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
          <div className="max-w-3xl mx-auto px-4 md:px-6 pt-4 pb-4 md:pb-5">
            <div className="relative bg-white/[0.05] rounded-2xl border border-white/[0.1] shadow-2xl shadow-black/20 backdrop-blur-sm">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Message Builder GPT..."
                rows={1}
                className="w-full px-4 py-3.5 pr-12 bg-transparent text-white/90 placeholder-white/40 focus:outline-none resize-none text-base leading-relaxed"
                style={{ minHeight: '56px', maxHeight: '200px' }}
              />
              <button
                onClick={handleSend}
                disabled={isLoading || !input.trim()}
                className={`absolute right-2 bottom-2 p-2.5 rounded-lg transition-all duration-200 active:scale-95 ${
                  input.trim()
                    ? 'bg-white text-black hover:bg-white/90 shadow-lg'
                    : 'bg-white/10 text-white/30 cursor-not-allowed'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </button>
            </div>
            <p className="text-xs text-white/30 mt-3 text-center hidden md:block">
              Builder GPT can make mistakes. Always verify important advice.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
