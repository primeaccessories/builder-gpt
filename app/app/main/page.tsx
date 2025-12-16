'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'

interface Message {
  role: 'user' | 'assistant'
  content: string
  isTyping?: boolean
  images?: string[]
}

interface Conversation {
  id: string
  name: string
  issueType: string
  createdAt: string
  projectId?: string
}

interface Project {
  id: string
  name: string
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
  const [activeChatMenu, setActiveChatMenu] = useState<string | null>(null)
  const [showRenameModal, setShowRenameModal] = useState(false)
  const [chatToRename, setChatToRename] = useState<string | null>(null)
  const [newChatName, setNewChatName] = useState('')
  const [showHeaderMenu, setShowHeaderMenu] = useState(false)
  const [typingMessageIndex, setTypingMessageIndex] = useState<number | null>(null)
  const [displayedContent, setDisplayedContent] = useState<string>('')
  const [selectedImages, setSelectedImages] = useState<File[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [showImagePicker, setShowImagePicker] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const typingIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Lock page scrolling on chat page only
  useEffect(() => {
    document.body.classList.add('chat-page')

    // Fix mobile viewport height
    const setVH = () => {
      const vh = window.innerHeight * 0.01
      document.documentElement.style.setProperty('--vh', `${vh}px`)
    }

    setVH()
    window.addEventListener('resize', setVH)
    window.addEventListener('orientationchange', setVH)

    // Prevent pull-to-refresh on mobile
    let lastTouchY = 0
    const preventPullToRefresh = (e: TouchEvent) => {
      const scrollY = window.pageYOffset || document.documentElement.scrollTop
      const touch = e.touches[0]

      if (scrollY === 0 && touch.clientY > lastTouchY) {
        // Pulling down at the top of the page
        e.preventDefault()
      }

      lastTouchY = touch.clientY
    }

    document.addEventListener('touchstart', (e) => {
      lastTouchY = e.touches[0].clientY
    }, { passive: false })

    document.addEventListener('touchmove', preventPullToRefresh, { passive: false })

    return () => {
      document.body.classList.remove('chat-page')
      window.removeEventListener('resize', setVH)
      window.removeEventListener('orientationchange', setVH)
      document.removeEventListener('touchmove', preventPullToRefresh)
    }
  }, [])

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
    messagesEndRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'end',
      inline: 'nearest'
    })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, displayedContent])

  // Typing animation effect
  useEffect(() => {
    if (typingMessageIndex === null) return

    const message = messages[typingMessageIndex]
    if (!message || message.role !== 'assistant' || !message.isTyping) return

    const fullContent = message.content
    let currentIndex = 0

    // Clear any existing interval
    if (typingIntervalRef.current) {
      clearInterval(typingIntervalRef.current)
    }

    setDisplayedContent('')

    typingIntervalRef.current = setInterval(() => {
      if (currentIndex < fullContent.length) {
        setDisplayedContent(fullContent.slice(0, currentIndex + 1))
        currentIndex++
      } else {
        // Typing complete
        if (typingIntervalRef.current) {
          clearInterval(typingIntervalRef.current)
          typingIntervalRef.current = null
        }
        setTypingMessageIndex(null)
        // Mark message as no longer typing
        setMessages((prev) =>
          prev.map((msg, idx) =>
            idx === typingMessageIndex ? { ...msg, isTyping: false } : msg
          )
        )
      }
    }, 20) // 20ms per character for readable pace

    return () => {
      if (typingIntervalRef.current) {
        clearInterval(typingIntervalRef.current)
        typingIntervalRef.current = null
      }
    }
  }, [typingMessageIndex, messages])

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


  const handleRenameChat = () => {
    if (!chatToRename || !newChatName.trim()) return

    setConversations(conversations.map(conv =>
      conv.id === chatToRename
        ? { ...conv, name: newChatName.trim() }
        : conv
    ))

    setShowRenameModal(false)
    setChatToRename(null)
    setNewChatName('')
    setActiveChatMenu(null)
  }

  const handleDeleteChat = (chatId: string) => {
    if (!confirm('Delete this chat?')) return

    setConversations(conversations.filter(conv => conv.id !== chatId))

    if (currentConversationId === chatId) {
      setCurrentConversationId(null)
      setMessages([])
    }

    setActiveChatMenu(null)
  }

  const openRenameChat = (chatId: string) => {
    const chat = conversations.find(c => c.id === chatId)
    if (chat) {
      setChatToRename(chatId)
      setNewChatName(chat.name || '')
      setShowRenameModal(true)
      setActiveChatMenu(null)
    }
  }

  const handleShareChat = () => {
    if (!currentConversationId) return

    // Create shareable link or copy to clipboard
    const shareUrl = `${window.location.origin}/share/${currentConversationId}`
    navigator.clipboard.writeText(shareUrl)
    alert('Link copied to clipboard!')
    setShowHeaderMenu(false)
  }

  const openRenameCurrentChat = () => {
    if (!currentConversationId) return
    openRenameChat(currentConversationId)
    setShowHeaderMenu(false)
  }

  const handleDeleteCurrentChat = () => {
    if (!currentConversationId) return
    handleDeleteChat(currentConversationId)
    setShowHeaderMenu(false)
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
          isTyping: true,
        }
        setMessages((prev) => {
          const newMessages = [...prev, assistantMessage]
          setTypingMessageIndex(newMessages.length - 1)
          return newMessages
        })

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
    if (!input.trim() && selectedImages.length === 0) return

    // Convert images to base64
    const imageUrls: string[] = []
    for (const file of selectedImages) {
      const reader = new FileReader()
      const base64 = await new Promise<string>((resolve) => {
        reader.onload = (e) => resolve(e.target?.result as string)
        reader.readAsDataURL(file)
      })
      imageUrls.push(base64)
    }

    const userMessage: Message = {
      role: 'user',
      content: input || 'Sent images',
      images: imageUrls.length > 0 ? imageUrls : undefined
    }
    setMessages((prev) => [...prev, userMessage])
    const messageToSend = input
    setInput('')
    setSelectedImages([])

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
        // Mark all loaded messages as not typing
        const loadedMessages = (data.messages || []).map((msg: Message) => ({ ...msg, isTyping: false }))
        setMessages(loadedMessages)

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

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (showUserMenu && !target.closest('.user-menu-container')) {
        setShowUserMenu(false)
      }
      if (showHeaderMenu && !target.closest('.header-menu-container')) {
        setShowHeaderMenu(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showUserMenu, showHeaderMenu])

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    const imageFiles = files.filter(file => file.type.startsWith('image/'))
    setSelectedImages(prev => [...prev, ...imageFiles].slice(0, 4)) // Max 4 images
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const files = Array.from(e.dataTransfer.files)
    const imageFiles = files.filter(file => file.type.startsWith('image/'))
    setSelectedImages(prev => [...prev, ...imageFiles].slice(0, 4)) // Max 4 images
  }

  const removeImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index))
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
    <div className="fixed inset-0 bg-[#343541] flex overflow-hidden" style={{
      height: 'calc(var(--vh, 1vh) * 100)',
      width: '100vw',
      minHeight: '-webkit-fill-available',
      overscrollBehavior: 'none',
      WebkitOverflowScrolling: 'touch'
    }}>
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
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } ${
          sidebarOpen ? 'w-[260px]' : 'w-0'
        } bg-[#0D0D0D] flex-shrink-0 overflow-hidden flex flex-col fixed md:relative h-full z-50 md:z-auto border-r border-white/[0.08]`}
        style={{
          transition: 'transform 0.25s cubic-bezier(0.4, 0, 0.2, 1), width 0.25s cubic-bezier(0.4, 0, 0.2, 1)'
        }}
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
            <span>New Chat</span>
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
        <div className="flex-1 overflow-y-auto px-2 py-2" style={{
          WebkitOverflowScrolling: 'touch',
          overscrollBehavior: 'contain',
          scrollbarWidth: 'thin'
        }}>
          {conversations
            .filter((conv) => searchQuery ? conv.name.toLowerCase().includes(searchQuery.toLowerCase()) : true)
            .map((conv) => (
            <div key={conv.id} className="relative group/chat mb-1">
              <button
                onClick={() => loadConversation(conv.id)}
                className={`w-full px-3 py-2.5 rounded-lg text-left text-sm font-medium transition-all duration-200 active:scale-[0.98] ${
                  currentConversationId === conv.id
                    ? 'bg-white/[0.12] text-white shadow-sm'
                    : 'text-white/60 hover:bg-white/[0.06] hover:text-white/90'
                }`}
              >
                <div className="truncate flex items-center gap-2.5 pr-8">
                  <svg className="w-4 h-4 flex-shrink-0 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <span className="truncate">{conv.name || 'New chat'}</span>
                </div>
              </button>

              {/* 3-dot menu */}
              <div
                className={`absolute right-2 top-1/2 -translate-y-1/2 transition-opacity ${
                  activeChatMenu === conv.id ? 'opacity-100 pointer-events-auto' : 'opacity-0 group-hover/chat:opacity-100 pointer-events-none group-hover/chat:pointer-events-auto'
                }`}
                onMouseLeave={() => {
                  if (activeChatMenu === conv.id) {
                    setActiveChatMenu(null)
                  }
                }}
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setActiveChatMenu(activeChatMenu === conv.id ? null : conv.id)
                  }}
                  className="p-1.5 hover:bg-white/[0.1] rounded-md transition-colors"
                >
                  <svg className="w-4 h-4 text-white/50 hover:text-white/90" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
                  </svg>
                </button>

                {/* Dropdown menu */}
                {activeChatMenu === conv.id && (
                  <div className="absolute right-0 top-full mt-1 bg-[#1a1a1a] border border-white/[0.1] rounded-lg shadow-2xl py-1 min-w-[160px] z-50">
                    <button
                      onClick={() => openRenameChat(conv.id)}
                      className="w-full px-3 py-2 text-left text-xs text-white/70 hover:bg-white/[0.08] hover:text-white transition-colors flex items-center gap-2"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Rename
                    </button>
                    <button
                      onClick={() => handleDeleteChat(conv.id)}
                      className="w-full px-3 py-2 text-left text-xs text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors flex items-center gap-2"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Delete
                    </button>
                  </div>
                )}
              </div>
            </div>
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
      <div className="flex-1 flex flex-col bg-black overflow-hidden h-full">
        {/* Header */}
        <header className="flex-shrink-0 bg-black/80 backdrop-blur-xl border-b border-white/[0.08]">
          <div className="px-4 py-3.5 flex items-center gap-2">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-white/[0.08] rounded-full transition-all duration-200 text-white/70 hover:text-white active:scale-95"
              aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
            >
              {/* Mobile: Hamburger menu */}
              <svg className="w-5 h-5 md:hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>

              {/* Desktop: Minimize icon (always shows <<) */}
              <svg className="w-5 h-5 hidden md:block" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
              </svg>
            </button>
            <div className="flex-1 text-center">
              <div className="text-sm font-semibold text-white/90">Builder GPT</div>
            </div>

            {/* 3-dot menu button - always visible */}
            <div className="relative header-menu-container">
              <button
                onClick={() => setShowHeaderMenu(!showHeaderMenu)}
                className="p-2 hover:bg-white/[0.08] rounded-full transition-all duration-200 text-white/70 hover:text-white active:scale-95"
                aria-label="Chat options"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
                </svg>
              </button>

              {/* Dropdown menu */}
              {showHeaderMenu && currentConversationId && (
                <div className="absolute right-0 top-full mt-2 bg-[#1a1a1a] border border-white/[0.1] rounded-xl shadow-2xl py-1.5 min-w-[180px] z-50">
                  <button
                    onClick={handleShareChat}
                    className="w-full px-4 py-2.5 text-left text-sm text-white/70 hover:bg-white/[0.08] hover:text-white transition-colors flex items-center gap-3"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                    </svg>
                    Share
                  </button>
                  <button
                    onClick={openRenameCurrentChat}
                    className="w-full px-4 py-2.5 text-left text-sm text-white/70 hover:bg-white/[0.08] hover:text-white transition-colors flex items-center gap-3"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Rename
                  </button>
                  <div className="border-t border-white/[0.08] my-1"></div>
                  <button
                    onClick={handleDeleteCurrentChat}
                    className="w-full px-4 py-2.5 text-left text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors flex items-center gap-3"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Delete chat
                  </button>
                </div>
              )}

              {/* Menu for new chat (no conversation yet) */}
              {showHeaderMenu && !currentConversationId && (
                <div className="absolute right-0 top-full mt-2 bg-[#1a1a1a] border border-white/[0.1] rounded-xl shadow-2xl py-1.5 min-w-[180px] z-50">
                  <div className="px-4 py-3 text-sm text-white/40 text-center">
                    Start a conversation to see options
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden" style={{
          WebkitOverflowScrolling: 'touch',
          overscrollBehavior: 'contain',
          overscrollBehaviorY: 'contain',
          scrollbarWidth: 'thin',
          touchAction: 'pan-y'
        }}>
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
                <div className="grid grid-cols-1 gap-2.5 max-w-2xl mx-auto">
                  {[
                    { text: 'Customer won\'t pay the final balance. Keeps saying they\'re "not happy" but won\'t list issues.' },
                    { text: 'Customer keeps adding extras. I\'m halfway through and they assume it\'s included.' },
                  ].map((example, idx) => (
                    <button
                      key={idx}
                      onClick={async () => {
                        const userMessage: Message = { role: 'user', content: example.text, images: undefined }
                        setMessages((prev) => [...prev, userMessage])
                        await sendMessage(example.text, [userMessage])
                      }}
                      className="px-4 py-3.5 bg-white/[0.05] hover:bg-white/[0.08] border border-white/[0.1] rounded-xl text-sm text-left transition-all duration-200 text-white/70 hover:text-white/90 hover:border-white/[0.15] active:scale-[0.98]"
                    >
                      <div className="text-sm leading-relaxed">{example.text}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg, idx) => (
              <div key={idx} className={`w-full border-b border-white/[0.05] ${
                msg.role === 'assistant' ? 'bg-white/[0.02]' : ''
              }`}>
                <div className="max-w-3xl mx-auto px-4 md:px-6 py-6 md:py-8 flex gap-4 md:gap-6">
                  <div className="w-7 h-7 md:w-8 md:h-8 flex-shrink-0">
                    {msg.role === 'assistant' ? (
                      <div className="w-7 h-7 md:w-8 md:h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                      </div>
                    ) : (
                      <div className="w-7 h-7 md:w-8 md:h-8 bg-white/10 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs font-semibold">{userName.charAt(0).toUpperCase()}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 overflow-hidden pt-1">
                    {/* Display images if present */}
                    {msg.images && msg.images.length > 0 && (
                      <div className="mb-3 flex gap-2 flex-wrap">
                        {msg.images.map((imgUrl, imgIdx) => (
                          <img
                            key={imgIdx}
                            src={imgUrl}
                            alt={`Uploaded ${imgIdx + 1}`}
                            className="max-w-[200px] md:max-w-[300px] rounded-lg border border-white/[0.1] cursor-pointer hover:opacity-90 transition-opacity"
                            onClick={() => window.open(imgUrl, '_blank')}
                          />
                        ))}
                      </div>
                    )}
                    <div className="prose prose-invert max-w-none">
                      <div className="text-[15px] leading-7 text-white/90">
                        {(msg.role === 'assistant' && msg.isTyping && idx === typingMessageIndex ? displayedContent + '▋' : msg.content).split('\n').map((line, i) => {
                          // Handle bullet points
                          if (line.trim().startsWith('•') || line.trim().startsWith('-')) {
                            return (
                              <div key={i} className="ml-4 mb-2">
                                {line}
                              </div>
                            )
                          }
                          // Handle numbered lists
                          if (/^\d+\./.test(line.trim())) {
                            return (
                              <div key={i} className="ml-4 mb-2">
                                {line}
                              </div>
                            )
                          }
                          // Handle bold text **text**
                          if (line.includes('**')) {
                            const parts = line.split(/(\*\*.*?\*\*)/)
                            return (
                              <p key={i} className="mb-4">
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
                            return <p key={i} className="mb-4 last:mb-0">{line}</p>
                          }
                          return null
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="w-full border-b border-white/[0.05] bg-white/[0.02]">
                <div className="max-w-3xl mx-auto px-4 md:px-6 py-6 md:py-8 flex gap-4 md:gap-6">
                  <div className="w-7 h-7 md:w-8 md:h-8 flex-shrink-0">
                    <div className="w-7 h-7 md:w-8 md:h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
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

        {/* Input - Fixed at bottom */}
        <div className="bg-black flex-shrink-0 border-t border-white/[0.05]" style={{
          paddingBottom: 'max(env(safe-area-inset-bottom), 12px)',
          paddingLeft: 'env(safe-area-inset-left)',
          paddingRight: 'env(safe-area-inset-right)'
        }}>
          <div className="max-w-3xl mx-auto px-3 md:px-4 pt-2 pb-3 md:pb-4">
            {/* Selected Images Preview */}
            {selectedImages.length > 0 && (
              <div className="mb-2 flex gap-2 flex-wrap">
                {selectedImages.map((file, idx) => (
                  <div key={idx} className="relative group">
                    <img
                      src={URL.createObjectURL(file)}
                      alt={`Selected ${idx + 1}`}
                      className="w-16 h-16 md:w-20 md:h-20 object-cover rounded-lg border border-white/[0.1]"
                    />
                    <button
                      onClick={() => removeImage(idx)}
                      className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div
              className={`relative bg-white/[0.05] rounded-xl border shadow-lg shadow-black/10 backdrop-blur-sm ${
                isDragging ? 'border-blue-500 bg-blue-500/10' : 'border-white/[0.1]'
              }`}
              style={{
                transition: 'border-color 0.15s cubic-bezier(0.4, 0, 0.2, 1), background-color 0.15s cubic-bezier(0.4, 0, 0.2, 1)'
              }}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <div className="flex items-end gap-1 md:gap-2">
                {/* Image Upload Button */}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-shrink-0 p-2 md:p-2.5 hover:bg-white/[0.08] rounded-lg transition-colors text-white/50 hover:text-white/90 ml-1 mb-1"
                  aria-label="Upload image"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </button>

                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageSelect}
                  accept="image/*"
                  multiple
                  className="hidden"
                />

                {/* Text Input */}
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Message Builder GPT..."
                  rows={1}
                  className="flex-1 px-2 md:px-3 py-2.5 md:py-3 bg-transparent text-white/90 placeholder-white/40 focus:outline-none resize-none text-sm md:text-base leading-relaxed"
                  style={{ minHeight: '44px', maxHeight: '120px' }}
                />

                {/* Send Button */}
                <button
                  onClick={handleSend}
                  disabled={isLoading || (!input.trim() && selectedImages.length === 0)}
                  className={`flex-shrink-0 p-2 md:p-2.5 rounded-lg transition-all duration-200 active:scale-95 mr-1 mb-1 ${
                    input.trim() || selectedImages.length > 0
                      ? 'bg-white text-black hover:bg-white/90 shadow-md'
                      : 'bg-white/10 text-white/30 cursor-not-allowed'
                  }`}
                >
                  <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </button>
              </div>

              {/* Drag and Drop Indicator */}
              {isDragging && (
                <div className="absolute inset-0 bg-blue-500/20 backdrop-blur-sm rounded-xl flex items-center justify-center pointer-events-none">
                  <div className="text-blue-400 text-sm font-medium">Drop images here</div>
                </div>
              )}
            </div>

            <p className="text-xs text-white/30 mt-2 text-center hidden md:block">
              Builder GPT can make mistakes. Always verify important advice.
            </p>
          </div>
        </div>
      </div>

      {/* Rename Chat Modal */}
      {showRenameModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4" onClick={() => setShowRenameModal(false)}>
          <div className="bg-[#1a1a1a] rounded-2xl border border-white/[0.1] p-6 max-w-md w-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl font-semibold text-white mb-4">Rename Chat</h3>
            <input
              type="text"
              value={newChatName}
              onChange={(e) => setNewChatName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleRenameChat()}
              placeholder="Chat name..."
              autoFocus
              className="w-full px-4 py-3 bg-white/[0.05] border border-white/[0.1] rounded-xl text-white placeholder-white/40 focus:outline-none focus:bg-white/[0.08] focus:border-white/[0.2] transition-all duration-200 mb-4"
            />
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowRenameModal(false)
                  setNewChatName('')
                }}
                className="px-4 py-2.5 text-white/70 hover:text-white hover:bg-white/[0.05] rounded-lg transition-all duration-200 text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleRenameChat}
                disabled={!newChatName.trim()}
                className="px-4 py-2.5 bg-white text-black hover:bg-white/90 rounded-lg transition-all duration-200 text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
              >
                Rename
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
