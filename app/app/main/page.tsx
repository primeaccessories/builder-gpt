'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

export default function BuildPriceProPage() {
  const router = useRouter()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }, [input])

  // Focus input on mount
  useEffect(() => {
    textareaRef.current?.focus()
  }, [])

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return

    const userMessage = input.trim()
    setInput('')

    // Add user message
    setMessages(prev => [...prev, { role: 'user', content: userMessage }])
    setIsLoading(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          issueType: 'pricing',
          conversationHistory: messages.map(m => ({ role: m.role, content: m.content })),
        }),
      })

      if (!res.ok) throw new Error('Failed to send message')

      const data = await res.json()
      setMessages(prev => [...prev, { role: 'assistant', content: data.response }])
    } catch (error) {
      console.error('Send message error:', error)
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, something went wrong. Please try again.'
      }])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const handleSignOut = async () => {
    try {
      await fetch('/api/auth/signout', { method: 'POST' })
      router.push('/')
    } catch (error) {
      console.error('Sign out error:', error)
    }
  }

  const startNewJob = () => {
    setMessages([])
    setInput('')
    textareaRef.current?.focus()
  }

  return (
    <div className="buildprice-app">
      {/* Sidebar */}
      <aside className={`buildprice-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="buildprice-sidebar-header">
          <h2>BuildPrice Pro</h2>
          <button
            onClick={() => setSidebarOpen(false)}
            className="buildprice-sidebar-close"
          >
            ×
          </button>
        </div>

        <nav className="buildprice-nav">
          <button onClick={startNewJob} className="buildprice-nav-item active">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M2 9C2 5.13401 5.13401 2 9 2C12.866 2 16 5.13401 16 9C16 12.866 12.866 16 9 16C5.13401 16 2 12.866 2 9Z" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M9 6V12M6 9H12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            New Quote
          </button>

          <button onClick={() => router.push('/dashboard/invoices')} className="buildprice-nav-item">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <rect x="3" y="2" width="12" height="14" rx="1" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M6 6H12M6 9H10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            Invoices
          </button>
        </nav>

        <div className="buildprice-sidebar-footer">
          <button onClick={handleSignOut} className="buildprice-nav-item">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M7 16H4C3.44772 16 3 15.5523 3 15V3C3 2.44772 3.44772 2 4 2H7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              <path d="M12 13L15 9M15 9L12 5M15 9H7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Sign Out
          </button>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="buildprice-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Area */}
      <div className="buildprice-main-area">
        {/* Header */}
        <header className="buildprice-header">
          <button
            onClick={() => setSidebarOpen(true)}
            className="buildprice-menu-btn"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M3 5H17M3 10H17M3 15H17" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
          <h1 className="buildprice-title">BuildPrice Pro</h1>
          {messages.length > 0 && (
            <button onClick={startNewJob} className="buildprice-new-btn">
              New
            </button>
          )}
        </header>

        {/* Messages */}
        <main className="buildprice-main">
          <div className="buildprice-messages">
            {messages.length === 0 && (
              <div className="buildprice-placeholder">
                What's the job?
              </div>
            )}
            {messages.map((message, index) => (
              <div key={index} className={`buildprice-message ${message.role}`}>
                {message.role === 'assistant' && (
                  <div className="buildprice-message-label">BuildPrice Pro</div>
                )}
                <div className="buildprice-message-content">
                  {message.content.split('\n').map((line, i) => (
                    <p key={i}>{line}</p>
                  ))}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="buildprice-message assistant">
                <div className="buildprice-message-label">BuildPrice Pro</div>
                <div className="buildprice-loading">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </main>

        {/* Input */}
        <div className="buildprice-input-wrapper">
          <div className="buildprice-input-container">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your answer..."
              className="buildprice-input"
              rows={1}
              disabled={isLoading}
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim() || isLoading}
              className="buildprice-send-btn"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M18 2L9 11M18 2L12 18L9 11M18 2L2 8L9 11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        .buildprice-app {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          display: flex;
          background: #F7F7F7;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }

        /* Sidebar */
        .buildprice-sidebar {
          width: 240px;
          background: #1F1F1F;
          border-right: 1px solid #2A2A2A;
          display: flex;
          flex-direction: column;
          flex-shrink: 0;
          transition: transform 0.3s ease;
        }

        .buildprice-sidebar-header {
          padding: 20px;
          border-bottom: 1px solid #2A2A2A;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .buildprice-sidebar-header h2 {
          font-size: 16px;
          font-weight: 600;
          color: #F7F7F7;
          margin: 0;
          letter-spacing: -0.01em;
        }

        .buildprice-sidebar-close {
          display: none;
          background: none;
          border: none;
          color: #F7F7F7;
          font-size: 28px;
          cursor: pointer;
          padding: 0;
          line-height: 1;
        }

        .buildprice-nav {
          flex: 1;
          padding: 12px;
          overflow-y: auto;
        }

        .buildprice-nav-item {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 14px;
          background: transparent;
          border: none;
          border-radius: 6px;
          color: #999;
          font-size: 14px;
          font-weight: 500;
          text-align: left;
          cursor: pointer;
          transition: all 0.2s;
          margin-bottom: 4px;
        }

        .buildprice-nav-item:hover {
          background: #2A2A2A;
          color: #F7F7F7;
        }

        .buildprice-nav-item.active {
          background: #2A2A2A;
          color: #F7F7F7;
        }

        .buildprice-sidebar-footer {
          padding: 12px;
          border-top: 1px solid #2A2A2A;
        }

        .buildprice-overlay {
          display: none;
        }

        /* Main Area */
        .buildprice-main-area {
          flex: 1;
          display: flex;
          flex-direction: column;
          min-width: 0;
        }

        .buildprice-header {
          background: #1F1F1F;
          border-bottom: 1px solid #2A2A2A;
          padding: 16px 20px;
          display: flex;
          align-items: center;
          gap: 16px;
          flex-shrink: 0;
        }

        .buildprice-menu-btn {
          display: none;
          background: none;
          border: none;
          color: #F7F7F7;
          cursor: pointer;
          padding: 4px;
        }

        .buildprice-title {
          flex: 1;
          font-size: 20px;
          font-weight: 600;
          color: #F7F7F7;
          margin: 0;
          letter-spacing: -0.02em;
        }

        .buildprice-new-btn {
          padding: 8px 16px;
          background: transparent;
          border: 1px solid #3A3A3A;
          border-radius: 6px;
          color: #F7F7F7;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }

        .buildprice-new-btn:hover {
          background: #2A2A2A;
          border-color: #4A4A4A;
        }

        .buildprice-main {
          flex: 1;
          overflow-y: auto;
          overflow-x: hidden;
        }

        .buildprice-messages {
          max-width: 800px;
          margin: 0 auto;
          padding: 40px 20px 120px 20px;
        }

        .buildprice-placeholder {
          text-align: center;
          font-size: 28px;
          font-weight: 600;
          color: #CCC;
          padding: 80px 20px;
          letter-spacing: -0.02em;
        }

        .buildprice-message {
          margin-bottom: 32px;
        }

        .buildprice-message.user {
          padding: 16px 20px;
          background: #1F1F1F;
          border-radius: 8px;
          color: #F7F7F7;
        }

        .buildprice-message.assistant {
          padding: 0;
        }

        .buildprice-message-label {
          font-size: 12px;
          font-weight: 600;
          color: #666;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 12px;
        }

        .buildprice-message-content {
          color: #1F1F1F;
          line-height: 1.6;
        }

        .buildprice-message-content p {
          margin: 0 0 12px 0;
        }

        .buildprice-message-content p:last-child {
          margin-bottom: 0;
        }

        .buildprice-message.user .buildprice-message-content {
          color: #F7F7F7;
        }

        .buildprice-loading {
          display: flex;
          gap: 6px;
          padding: 16px 0;
        }

        .buildprice-loading span {
          width: 8px;
          height: 8px;
          background: #666;
          border-radius: 50%;
          animation: loading-pulse 1.4s ease-in-out infinite;
        }

        .buildprice-loading span:nth-child(2) {
          animation-delay: 0.2s;
        }

        .buildprice-loading span:nth-child(3) {
          animation-delay: 0.4s;
        }

        @keyframes loading-pulse {
          0%, 60%, 100% {
            opacity: 0.3;
          }
          30% {
            opacity: 1;
          }
        }

        .buildprice-input-wrapper {
          position: relative;
          background: #F7F7F7;
          border-top: 1px solid #E0E0E0;
          padding: 16px 20px;
          padding-bottom: max(16px, env(safe-area-inset-bottom));
        }

        .buildprice-input-container {
          max-width: 800px;
          margin: 0 auto;
          display: flex;
          gap: 12px;
          align-items: flex-end;
        }

        .buildprice-input {
          flex: 1;
          padding: 14px 16px;
          background: #FFFFFF;
          border: 1px solid #D0D0D0;
          border-radius: 8px;
          font-size: 16px;
          font-family: inherit;
          color: #1F1F1F;
          resize: none;
          max-height: 200px;
          line-height: 1.5;
          transition: border-color 0.2s;
        }

        .buildprice-input:focus {
          outline: none;
          border-color: #1F1F1F;
        }

        .buildprice-input::placeholder {
          color: #999;
        }

        .buildprice-input:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .buildprice-send-btn {
          background: #1F1F1F;
          border: none;
          border-radius: 8px;
          width: 48px;
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #F7F7F7;
          cursor: pointer;
          flex-shrink: 0;
          transition: all 0.2s;
        }

        .buildprice-send-btn:hover:not(:disabled) {
          background: #2A2A2A;
          transform: scale(1.05);
        }

        .buildprice-send-btn:active:not(:disabled) {
          transform: scale(0.98);
        }

        .buildprice-send-btn:disabled {
          opacity: 0.3;
          cursor: not-allowed;
        }

        /* Mobile */
        @media (max-width: 768px) {
          .buildprice-sidebar {
            position: fixed;
            top: 0;
            left: 0;
            bottom: 0;
            z-index: 1000;
            transform: translateX(-100%);
          }

          .buildprice-sidebar.open {
            transform: translateX(0);
          }

          .buildprice-sidebar-close {
            display: block;
          }

          .buildprice-overlay {
            display: block;
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.5);
            z-index: 999;
          }

          .buildprice-menu-btn {
            display: block;
          }

          .buildprice-header {
            padding: 12px 16px;
          }

          .buildprice-title {
            font-size: 18px;
          }

          .buildprice-new-btn {
            padding: 6px 12px;
            font-size: 13px;
          }

          .buildprice-messages {
            padding: 24px 16px 100px 16px;
          }

          .buildprice-placeholder {
            font-size: 22px;
            padding: 60px 16px;
          }

          .buildprice-input-wrapper {
            padding: 12px 16px;
          }

          .buildprice-input {
            font-size: 16px;
            padding: 12px 14px;
          }

          .buildprice-send-btn {
            width: 44px;
            height: 44px;
          }
        }
      `}</style>
    </div>
  )
}
