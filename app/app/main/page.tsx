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
  const [showUserMenu, setShowUserMenu] = useState(false)
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
          issueType: 'pricing', // BuildPrice Pro is pricing-focused
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
  }

  return (
    <div className="buildprice-container">
      {/* Header */}
      <header className="buildprice-header">
        <div className="buildprice-header-content">
          <h1 className="buildprice-title">BuildPrice Pro</h1>
          <div className="buildprice-header-actions">
            {messages.length > 0 && (
              <button onClick={startNewJob} className="buildprice-new-btn">
                New Job
              </button>
            )}
            <div className="buildprice-user-menu">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="buildprice-user-btn"
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <circle cx="10" cy="10" r="9" stroke="currentColor" strokeWidth="1.5"/>
                  <circle cx="10" cy="8" r="3" stroke="currentColor" strokeWidth="1.5"/>
                  <path d="M4 17C4 14 6 12 10 12C14 12 16 14 16 17" stroke="currentColor" strokeWidth="1.5"/>
                </svg>
              </button>
              {showUserMenu && (
                <div className="buildprice-user-dropdown">
                  <button onClick={() => router.push('/dashboard')}>Dashboard</button>
                  <button onClick={handleSignOut}>Sign Out</button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="buildprice-main">
        <div className="buildprice-messages">
          {messages.length === 0 ? (
            <div className="buildprice-welcome">
              <h2>What's the job?</h2>
              <p>Tell me what you need to price and I'll walk you through it.</p>
            </div>
          ) : (
            messages.map((message, index) => (
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
            ))
          )}
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

      <style jsx>{`
        .buildprice-container {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          display: flex;
          flex-direction: column;
          background: #F7F7F7;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }

        .buildprice-header {
          background: #1F1F1F;
          border-bottom: 1px solid #2A2A2A;
          padding: 16px 20px;
          flex-shrink: 0;
        }

        .buildprice-header-content {
          max-width: 800px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .buildprice-title {
          font-size: 20px;
          font-weight: 600;
          color: #F7F7F7;
          margin: 0;
          letter-spacing: -0.02em;
        }

        .buildprice-header-actions {
          display: flex;
          align-items: center;
          gap: 12px;
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

        .buildprice-user-menu {
          position: relative;
        }

        .buildprice-user-btn {
          background: transparent;
          border: none;
          color: #F7F7F7;
          cursor: pointer;
          padding: 8px;
          border-radius: 6px;
          display: flex;
          align-items: center;
          transition: background 0.2s;
        }

        .buildprice-user-btn:hover {
          background: #2A2A2A;
        }

        .buildprice-user-dropdown {
          position: absolute;
          top: 100%;
          right: 0;
          margin-top: 8px;
          background: #1F1F1F;
          border: 1px solid #2A2A2A;
          border-radius: 8px;
          padding: 8px;
          min-width: 160px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
          z-index: 1000;
        }

        .buildprice-user-dropdown button {
          width: 100%;
          padding: 10px 12px;
          background: transparent;
          border: none;
          color: #F7F7F7;
          font-size: 14px;
          text-align: left;
          cursor: pointer;
          border-radius: 4px;
          transition: background 0.2s;
        }

        .buildprice-user-dropdown button:hover {
          background: #2A2A2A;
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

        .buildprice-welcome {
          text-align: center;
          padding: 60px 20px;
        }

        .buildprice-welcome h2 {
          font-size: 32px;
          font-weight: 600;
          color: #1F1F1F;
          margin: 0 0 12px 0;
          letter-spacing: -0.02em;
        }

        .buildprice-welcome p {
          font-size: 16px;
          color: #666;
          margin: 0;
          line-height: 1.5;
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
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
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

        @media (max-width: 768px) {
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

          .buildprice-welcome {
            padding: 40px 16px;
          }

          .buildprice-welcome h2 {
            font-size: 24px;
          }

          .buildprice-welcome p {
            font-size: 15px;
          }

          .buildprice-input-wrapper {
            padding: 12px 16px;
          }

          .buildprice-input {
            font-size: 16px; /* Prevent iOS zoom */
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
