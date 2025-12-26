'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'

interface Message {
  role: 'user' | 'assistant'
  content: string
  images?: string[] // base64 encoded images
}

interface Conversation {
  id: string
  name: string
  issueType: string
  createdAt: string
}

export default function BuildPriceProPage() {
  const router = useRouter()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<{ name: string; base64: string; type: string }[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [uploadMenuOpen, setUploadMenuOpen] = useState(false)
  const [cameraOpen, setCameraOpen] = useState(false)
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null)
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

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

  // Fetch conversations on mount
  useEffect(() => {
    fetchConversations()
  }, [])

  const fetchConversations = async () => {
    try {
      const res = await fetch('/api/conversations')
      if (res.ok) {
        const data = await res.json()
        setConversations(data.conversations)
      }
    } catch (error) {
      console.error('Failed to fetch conversations:', error)
    }
  }

  const loadConversation = async (conversationId: string) => {
    try {
      const res = await fetch(`/api/conversations/${conversationId}`)
      if (res.ok) {
        const data = await res.json()
        setMessages(data.messages)
        setCurrentConversationId(conversationId)
        setUploadedFiles([])
        setInput('')
        textareaRef.current?.focus()
      }
    } catch (error) {
      console.error('Failed to load conversation:', error)
    }
  }

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return

    const newFiles: { name: string; base64: string; type: string }[] = []

    for (let i = 0; i < files.length; i++) {
      const file = files[i]

      // Check if file is an image
      if (file.type.startsWith('image/')) {
        const reader = new FileReader()
        reader.onload = (e) => {
          const base64 = e.target?.result as string
          newFiles.push({
            name: file.name,
            base64,
            type: file.type,
          })

          if (newFiles.length === files.length) {
            setUploadedFiles(prev => [...prev, ...newFiles])
          }
        }
        reader.readAsDataURL(file)
      }
    }
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
    handleFileSelect(e.dataTransfer.files)
  }

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index))
  }

  const sendMessage = async () => {
    if ((!input.trim() && uploadedFiles.length === 0) || isLoading) return

    const userMessage = input.trim()
    const filesToSend = [...uploadedFiles]

    setInput('')
    setUploadedFiles([])

    // Add user message with images
    setMessages(prev => [...prev, {
      role: 'user',
      content: userMessage || 'What can you tell me about this image?',
      images: filesToSend.map(f => f.base64)
    }])
    setIsLoading(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage || 'What can you tell me about this image?',
          issueType: 'pricing',
          conversationHistory: messages.map(m => ({
            role: m.role,
            content: m.content,
            images: m.images
          })),
          images: filesToSend.map(f => f.base64),
          conversationId: currentConversationId,
        }),
      })

      if (!res.ok) throw new Error('Failed to send message')

      const data = await res.json()
      setMessages(prev => [...prev, { role: 'assistant', content: data.response }])

      // Update conversation ID if this is a new conversation
      if (data.conversationId && !currentConversationId) {
        setCurrentConversationId(data.conversationId)
        // Refresh conversations list
        fetchConversations()
      }
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
    setUploadedFiles([])
    setCurrentConversationId(null)
    textareaRef.current?.focus()
  }

  const openCamera = async () => {
    setUploadMenuOpen(false)

    // Check if getUserMedia is supported
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      alert('Camera access is not supported in this browser. Please use a modern browser like Chrome, Firefox, or Safari.')
      return
    }

    try {
      // Request camera access with fallback for desktop
      const constraints = {
        video: {
          facingMode: { ideal: 'environment' }, // Prefer rear camera but allow front
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        },
        audio: false,
      }

      const stream = await navigator.mediaDevices.getUserMedia(constraints)

      setCameraStream(stream)
      setCameraOpen(true)

      // Wait for next tick to ensure DOM is ready
      setTimeout(() => {
        if (videoRef.current && stream) {
          videoRef.current.srcObject = stream
          videoRef.current.play().catch(err => {
            console.error('Error playing video:', err)
          })
        }
      }, 100)
    } catch (error: any) {
      console.error('Camera access error:', error)

      if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        alert('Camera permission denied. Please allow camera access in your browser settings and try again.')
      } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
        alert('No camera found on this device.')
      } else if (error.name === 'NotReadableError' || error.name === 'TrackStartError') {
        alert('Camera is already in use by another application. Please close other apps using the camera and try again.')
      } else {
        alert('Could not access camera: ' + error.message)
      }
    }
  }

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return

    const video = videoRef.current
    const canvas = canvasRef.current

    // Set canvas size to match video
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    // Draw video frame to canvas
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

    // Convert to base64
    const base64 = canvas.toDataURL('image/jpeg', 0.9)

    // Add to uploaded files
    setUploadedFiles(prev => [...prev, {
      name: `photo-${Date.now()}.jpg`,
      base64,
      type: 'image/jpeg',
    }])

    // Close camera
    closeCamera()
  }

  const closeCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop())
      setCameraStream(null)
    }
    setCameraOpen(false)
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
          {/* Invoices Section */}
          <div className="buildprice-nav-section">
            <div className="buildprice-nav-section-header">Invoices</div>
            <button onClick={() => router.push('/dashboard/invoices')} className="buildprice-nav-item">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <rect x="3" y="2" width="12" height="14" rx="1" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M6 6H12M6 9H10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              View Invoices
            </button>
          </div>

          {/* Chats Section */}
          <div className="buildprice-nav-section">
            <div className="buildprice-nav-section-header">Chats</div>
            <button onClick={startNewJob} className={`buildprice-nav-item ${!currentConversationId ? 'active' : ''}`}>
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M9 4V14M4 9H14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              New Chat
            </button>

            {/* Conversation History */}
            <div className="buildprice-conversations">
              {conversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => loadConversation(conv.id)}
                  className={`buildprice-conversation-item ${currentConversationId === conv.id ? 'active' : ''}`}
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M2 3C2 2.44772 2.44772 2 3 2H13C13.5523 2 14 2.44772 14 3V10C14 10.5523 13.5523 11 13 11H5L2 14V3Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
                  </svg>
                  <span className="buildprice-conversation-name">{conv.name}</span>
                </button>
              ))}
            </div>
          </div>
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
      <div
        className="buildprice-main-area"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {/* Drag overlay */}
        {isDragging && (
          <div className="buildprice-drag-overlay">
            <div className="buildprice-drag-box">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                <path d="M7 18C5.17107 18.4117 4 19.0443 4 19.7537C4 20.9943 7.58172 22 12 22C16.4183 22 20 20.9943 20 19.7537C20 19.0443 18.8289 18.4117 17 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <path d="M12 15V2M12 2L8 6M12 2L16 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <p>Drop images here</p>
            </div>
          </div>
        )}

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
                  {/* Show images if present */}
                  {message.images && message.images.length > 0 && (
                    <div className="buildprice-message-images">
                      {message.images.map((img, idx) => (
                        <img key={idx} src={img} alt={`Uploaded ${idx + 1}`} className="buildprice-message-image" />
                      ))}
                    </div>
                  )}
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
          {/* File previews */}
          {uploadedFiles.length > 0 && (
            <div className="buildprice-file-previews">
              {uploadedFiles.map((file, index) => (
                <div key={index} className="buildprice-file-preview">
                  <img src={file.base64} alt={file.name} />
                  <button
                    onClick={() => removeFile(index)}
                    className="buildprice-file-remove"
                    type="button"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="buildprice-input-container">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => handleFileSelect(e.target.files)}
              style={{ display: 'none' }}
            />

            {/* Upload Menu */}
            <div className="buildprice-upload-menu-container">
              <button
                onClick={() => setUploadMenuOpen(!uploadMenuOpen)}
                className="buildprice-plus-btn"
                type="button"
                disabled={isLoading}
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M10 4V16M4 10H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </button>

              {uploadMenuOpen && (
                <>
                  <div className="buildprice-upload-menu-overlay" onClick={() => setUploadMenuOpen(false)} />
                  <div className="buildprice-upload-menu">
                    <button
                      onClick={() => {
                        fileInputRef.current?.click()
                        setUploadMenuOpen(false)
                      }}
                      className="buildprice-upload-menu-item"
                    >
                      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                        <path d="M9 12V4M9 4L6 7M9 4L12 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M3 13V14C3 15.1046 3.89543 16 5 16H13C14.1046 16 15 15.1046 15 14V13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                      </svg>
                      <span>Upload from device</span>
                    </button>

                    <button
                      onClick={openCamera}
                      className="buildprice-upload-menu-item"
                    >
                      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                        <rect x="2" y="5" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.5"/>
                        <circle cx="9" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.5"/>
                        <path d="M6 5L7 3H11L12 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      <span>Take photo</span>
                    </button>

                    <button
                      onClick={() => {
                        window.open('https://www.dropbox.com/chooser', '_blank')
                        setUploadMenuOpen(false)
                      }}
                      className="buildprice-upload-menu-item"
                    >
                      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                        <path d="M4.5 2L9 5.5L4.5 9L1 5.5L4.5 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
                        <path d="M13.5 2L9 5.5L13.5 9L17 5.5L13.5 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
                        <path d="M4.5 12.5L9 16L13.5 12.5L9 9L4.5 12.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
                      </svg>
                      <span>From Dropbox</span>
                    </button>

                    <button
                      onClick={() => {
                        window.open('https://drive.google.com/drive/my-drive', '_blank')
                        setUploadMenuOpen(false)
                      }}
                      className="buildprice-upload-menu-item"
                    >
                      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                        <path d="M6 2L12 2L17 11L14 16H4L1 11L6 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
                        <path d="M6 2L1 11H17L12 2" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
                      </svg>
                      <span>From Google Drive</span>
                    </button>
                  </div>
                </>
              )}
            </div>

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
              disabled={(!input.trim() && uploadedFiles.length === 0) || isLoading}
              className="buildprice-send-btn"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M18 2L9 11M18 2L12 18L9 11M18 2L2 8L9 11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Camera Modal */}
      {cameraOpen && (
        <div className="buildprice-camera-modal">
          <div className="buildprice-camera-container">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="buildprice-camera-video"
            />
            <canvas ref={canvasRef} style={{ display: 'none' }} />

            <div className="buildprice-camera-controls">
              <button
                onClick={closeCamera}
                className="buildprice-camera-close"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </button>

              <button
                onClick={capturePhoto}
                className="buildprice-camera-capture"
              >
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                  <circle cx="16" cy="16" r="14" stroke="currentColor" strokeWidth="3"/>
                  <circle cx="16" cy="16" r="10" fill="currentColor"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

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

        .buildprice-nav-section {
          margin-bottom: 24px;
        }

        .buildprice-nav-section:last-child {
          margin-bottom: 0;
        }

        .buildprice-nav-section-header {
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: #666;
          padding: 0 14px 8px 14px;
          margin-bottom: 4px;
        }

        .buildprice-conversations {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .buildprice-conversation-item {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 14px;
          background: transparent;
          border: none;
          border-radius: 6px;
          color: #888;
          font-size: 13px;
          font-weight: 400;
          text-align: left;
          cursor: pointer;
          transition: all 0.2s;
          margin-bottom: 0;
        }

        .buildprice-conversation-item:hover {
          background: #2A2A2A;
          color: #F7F7F7;
        }

        .buildprice-conversation-item.active {
          background: #2A2A2A;
          color: #F7F7F7;
        }

        .buildprice-conversation-item svg {
          flex-shrink: 0;
          opacity: 0.7;
        }

        .buildprice-conversation-item.active svg {
          opacity: 1;
        }

        .buildprice-conversation-name {
          flex: 1;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .buildprice-sidebar-footer {
          padding: 12px;
          border-top: 1px solid #2A2A2A;
        }

        .buildprice-overlay {
          display: none;
        }

        /* Drag & Drop */
        .buildprice-drag-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(31, 31, 31, 0.95);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 100;
        }

        .buildprice-drag-box {
          border: 2px dashed #F7F7F7;
          border-radius: 16px;
          padding: 60px 80px;
          text-align: center;
          color: #F7F7F7;
        }

        .buildprice-drag-box svg {
          margin-bottom: 16px;
          stroke: #F7F7F7;
        }

        .buildprice-drag-box p {
          font-size: 18px;
          font-weight: 600;
          margin: 0;
        }

        /* Main Area */
        .buildprice-main-area {
          flex: 1;
          display: flex;
          flex-direction: column;
          min-width: 0;
          position: relative;
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

        .buildprice-message-images {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          margin-bottom: 12px;
        }

        .buildprice-message-image {
          max-width: 200px;
          max-height: 200px;
          border-radius: 6px;
          object-fit: cover;
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

        .buildprice-file-previews {
          max-width: 800px;
          margin: 0 auto 12px auto;
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .buildprice-file-preview {
          position: relative;
          width: 80px;
          height: 80px;
          border-radius: 8px;
          overflow: hidden;
          border: 2px solid #D0D0D0;
        }

        .buildprice-file-preview img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .buildprice-file-remove {
          position: absolute;
          top: 4px;
          right: 4px;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: rgba(31, 31, 31, 0.9);
          color: #F7F7F7;
          border: none;
          cursor: pointer;
          font-size: 16px;
          line-height: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform 0.2s;
        }

        .buildprice-file-remove:hover {
          transform: scale(1.1);
        }

        .buildprice-input-container {
          max-width: 800px;
          margin: 0 auto;
          display: flex;
          gap: 12px;
          align-items: flex-end;
        }

        .buildprice-upload-menu-container {
          position: relative;
          flex-shrink: 0;
        }

        .buildprice-plus-btn {
          background: #FFFFFF;
          border: 1px solid #D0D0D0;
          border-radius: 8px;
          width: 48px;
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #1F1F1F;
          cursor: pointer;
          flex-shrink: 0;
          transition: all 0.2s;
        }

        .buildprice-plus-btn:hover:not(:disabled) {
          border-color: #1F1F1F;
          background: #FAFAFA;
        }

        .buildprice-plus-btn:disabled {
          opacity: 0.3;
          cursor: not-allowed;
        }

        .buildprice-upload-menu-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 10;
        }

        .buildprice-upload-menu {
          position: absolute;
          bottom: 60px;
          left: 0;
          background: #FFFFFF;
          border: 1px solid #D0D0D0;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          min-width: 200px;
          overflow: hidden;
          z-index: 20;
        }

        .buildprice-upload-menu-item {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          background: transparent;
          border: none;
          border-bottom: 1px solid #F0F0F0;
          color: #1F1F1F;
          font-size: 14px;
          font-weight: 500;
          text-align: left;
          cursor: pointer;
          transition: background 0.2s;
        }

        .buildprice-upload-menu-item:last-child {
          border-bottom: none;
        }

        .buildprice-upload-menu-item:hover {
          background: #F7F7F7;
        }

        .buildprice-upload-menu-item svg {
          flex-shrink: 0;
          stroke: #666;
        }

        .buildprice-upload-menu-item:hover svg {
          stroke: #1F1F1F;
        }

        /* Camera Modal */
        .buildprice-camera-modal {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: #000000;
          z-index: 2000;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .buildprice-camera-container {
          position: relative;
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .buildprice-camera-video {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .buildprice-camera-controls {
          position: absolute;
          bottom: 40px;
          left: 0;
          right: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 60px;
          padding: 0 20px;
        }

        .buildprice-camera-close {
          background: rgba(255, 255, 255, 0.2);
          backdrop-filter: blur(10px);
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-radius: 50%;
          width: 56px;
          height: 56px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #FFFFFF;
          cursor: pointer;
          transition: all 0.2s;
        }

        .buildprice-camera-close:hover {
          background: rgba(255, 255, 255, 0.3);
          transform: scale(1.05);
        }

        .buildprice-camera-capture {
          background: rgba(255, 255, 255, 0.9);
          border: 4px solid rgba(255, 255, 255, 0.5);
          border-radius: 50%;
          width: 80px;
          height: 80px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #1F1F1F;
          cursor: pointer;
          transition: all 0.2s;
        }

        .buildprice-camera-capture:hover {
          background: #FFFFFF;
          transform: scale(1.05);
        }

        .buildprice-camera-capture:active {
          transform: scale(0.95);
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

          .buildprice-plus-btn,
          .buildprice-send-btn {
            width: 44px;
            height: 44px;
          }

          .buildprice-drag-box {
            padding: 40px 60px;
          }
        }
      `}</style>
    </div>
  )
}
