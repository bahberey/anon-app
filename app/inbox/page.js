'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'

export default function Inbox() {
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState(null)
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [replyText, setReplyText] = useState({})
  const [loginError, setLoginError] = useState('')

  useEffect(() => {
    checkSession()
  }, [])

  async function checkSession() {
    const savedEmail = localStorage.getItem('spill_email')
    const savedPassword = localStorage.getItem('spill_password')
    const savedUsername = localStorage.getItem('spill_username')

    if (savedEmail && savedPassword) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: savedEmail,
        password: savedPassword
      })
      if (!error) {
        setUser(data.user)
        setUsername(savedUsername)
        fetchMessages(data.user.id)
        setupNotifications(data.user.id)
        return
      }
    }
    setLoading(false)
  }

  async function setupNotifications(userId) {
    if (!('Notification' in window)) return
    const permission = await Notification.requestPermission()
    if (permission !== 'granted') return

    supabase
      .channel('inbox-notifications')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `recipient_id=eq.${userId}`
      }, () => {
        new Notification('New message on SPILL! 🌶️', {
          body: 'Someone just sent you an anonymous message 👀',
          icon: '/favicon.ico'
        })
        fetchMessages(userId)
      })
      .subscribe()
  }

  async function fetchMessages(userId) {
    const { data, error } = await supabase
      .from('messages')
      .select('*, replies(*)')
      .eq('recipient_id', userId)
      .order('created_at', { ascending: false })

    if (!error) setMessages(data)
    setLoading(false)
  }

  async function handleLogin() {
    setLoginError('')

    const usernameInput = email.trim()

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('username', usernameInput)
      .single()

    if (profileError || !profile) {
      setLoginError('❌ Username not found')
      return
    }

    if (!profile.email || !profile.password) {
      setLoginError('❌ Account not found. Try from the device you signed up on.')
      return
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: profile.email,
      password: profile.password
    })

    if (error) {
      setLoginError('❌ Could not log in, try again')
      return
    }

    setUser(data.user)
    setUsername(usernameInput)
    fetchMessages(data.user.id)
    setupNotifications(data.user.id)
  }

  async function handleReply(messageId) {
    const content = replyText[messageId]
    if (!content?.trim()) return

    const { error } = await supabase
      .from('replies')
      .insert({ message_id: messageId, content })

    if (!error) {
      setReplyText({ ...replyText, [messageId]: '' })
      fetchMessages(user.id)
    }
  }

  async function handleReport(messageId) {
    await supabase
      .from('messages')
      .update({ reported: true })
      .eq('id', messageId)
    fetchMessages(user.id)
    alert('Message reported ✅')
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    localStorage.removeItem('spill_email')
    localStorage.removeItem('spill_password')
    localStorage.removeItem('spill_username')
    setUser(null)
    setMessages([])
  }

  // LOGIN SCREEN
  if (!user) return (
    <main style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f0f0f 0%, #1a0a2e 50%, #0f0f0f 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: "'Segoe UI', sans-serif"
    }}>
      <div style={{ width: '100%', maxWidth: 400, padding: 24, textAlign: 'center' }}>
        <span style={{
          fontSize: 48,
          fontWeight: 900,
          background: 'linear-gradient(90deg, #f97316, #ec4899, #8b5cf6)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>SPILL</span>

        <div style={{
          background: '#1a1a2e',
          border: '1px solid #2a2a4a',
          borderRadius: 16,
          padding: 32,
          marginTop: 24
        }}>
          <h2 style={{ color: '#fff', marginTop: 0 }}>Login to your inbox</h2>
          <p style={{ color: '#888', fontSize: 14, marginBottom: 20 }}>
            Enter the username you created
          </p>

          <input
            type="text"
            placeholder="Your username"
            value={email}
            onChange={(e) => setEmail(e.target.value.toLowerCase())}
            style={{
              width: '100%',
              padding: '12px 16px',
              fontSize: 15,
              borderRadius: 10,
              border: '1px solid #333',
              background: '#0f0f1a',
              color: '#fff',
              outline: 'none',
              marginBottom: 16,
              boxSizing: 'border-box'
            }}
          />

          {loginError && (
            <p style={{ color: '#f87171', fontSize: 13, marginBottom: 12 }}>{loginError}</p>
          )}

          <button
            onClick={handleLogin}
            style={{
              width: '100%',
              padding: '13px 16px',
              fontSize: 15,
              fontWeight: 700,
              borderRadius: 10,
              border: 'none',
              background: 'linear-gradient(90deg, #f97316, #ec4899, #8b5cf6)',
              color: '#fff',
              cursor: 'pointer'
            }}
          >
            View My Inbox 📬
          </button>
        </div>
      </div>
    </main>
  )

  // INBOX SCREEN
  return (
    <main style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f0f0f 0%, #1a0a2e 50%, #0f0f0f 100%)',
      fontFamily: "'Segoe UI', sans-serif",
      padding: '32px 16px'
    }}>
      <div style={{ maxWidth: 600, margin: '0 auto' }}>

        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 32
        }}>
          <span style={{
            fontSize: 32,
            fontWeight: 900,
            background: 'linear-gradient(90deg, #f97316, #ec4899, #8b5cf6)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>SPILL</span>

          <div style={{ textAlign: 'right' }}>
            <p style={{ color: '#888', fontSize: 13, margin: '0 0 4px' }}>@{username}</p>
            <button
              onClick={handleLogout}
              style={{
                padding: '6px 14px',
                borderRadius: 8,
                border: '1px solid #333',
                background: 'transparent',
                color: '#888',
                cursor: 'pointer',
                fontSize: 12
              }}
            >
              Logout
            </button>
          </div>
        </div>

        <div style={{
          background: '#1a1a2e',
          border: '1px solid #2a2a4a',
          borderRadius: 12,
          padding: '16px 20px',
          marginBottom: 24,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <p style={{ color: '#888', fontSize: 12, margin: '0 0 4px' }}>Your shareable link</p>
            <p style={{ color: '#c4b5fd', fontSize: 14, margin: 0 }}>
              {typeof window !== 'undefined' ? window.location.origin : ''}/u/{username}
            </p>
          </div>
          <button
            onClick={() => {
              navigator.clipboard.writeText(`${window.location.origin}/u/${username}`)
              alert('Link copied! 🔗')
            }}
            style={{
              padding: '8px 16px',
              borderRadius: 8,
              border: 'none',
              background: 'linear-gradient(90deg, #f97316, #8b5cf6)',
              color: '#fff',
              cursor: 'pointer',
              fontSize: 13,
              fontWeight: 600
            }}
          >
            Copy Link 🔗
          </button>
        </div>

        <h3 style={{ color: '#fff', marginBottom: 16 }}>
          📬 {messages.length} message{messages.length !== 1 ? 's' : ''}
        </h3>

        {loading ? (
          <p style={{ color: '#666' }}>Loading...</p>
        ) : messages.length === 0 ? (
          <div style={{
            background: '#1a1a2e',
            border: '1px solid #2a2a4a',
            borderRadius: 12,
            padding: 40,
            textAlign: 'center'
          }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>👻</div>
            <p style={{ color: '#666' }}>No messages yet. Share your link!</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} style={{
              background: msg.reported ? '#1a0f0f' : '#1a1a2e',
              border: `1px solid ${msg.reported ? '#3a1a1a' : '#2a2a4a'}`,
              borderRadius: 12,
              padding: 20,
              marginBottom: 16
            }}>
              <p style={{ color: '#fff', fontSize: 15, margin: '0 0 12px' }}>
                {msg.content}
              </p>

              <p style={{ color: '#444', fontSize: 11, margin: '0 0 12px' }}>
                {new Date(msg.created_at).toLocaleString()}
              </p>

              {msg.replies?.length > 0 && (
                <div style={{
                  background: '#0f0f1a',
                  borderLeft: '3px solid #8b5cf6',
                  borderRadius: 8,
                  padding: '10px 14px',
                  marginBottom: 12
                }}>
                  <p style={{ color: '#888', fontSize: 11, margin: '0 0 4px' }}>Your reply</p>
                  <p style={{ color: '#c4b5fd', fontSize: 14, margin: 0 }}>
                    {msg.replies[0].content}
                  </p>
                </div>
              )}

              {!msg.replies?.length && (
                <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                  <input
                    type="text"
                    placeholder="Reply anonymously..."
                    value={replyText[msg.id] || ''}
                    onChange={(e) => setReplyText({ ...replyText, [msg.id]: e.target.value })}
                    style={{
                      flex: 1,
                      padding: '10px 14px',
                      fontSize: 14,
                      borderRadius: 8,
                      border: '1px solid #333',
                      background: '#0f0f1a',
                      color: '#fff',
                      outline: 'none'
                    }}
                  />
                  <button
                    onClick={() => handleReply(msg.id)}
                    style={{
                      padding: '10px 16px',
                      borderRadius: 8,
                      border: 'none',
                      background: '#8b5cf6',
                      color: '#fff',
                      cursor: 'pointer',
                      fontSize: 13,
                      fontWeight: 600
                    }}
                  >
                    Send
                  </button>
                </div>
              )}

              {!msg.reported ? (
                <button
                  onClick={() => handleReport(msg.id)}
                  style={{
                    padding: '5px 12px',
                    borderRadius: 6,
                    border: '1px solid #3a1a1a',
                    background: 'transparent',
                    color: '#666',
                    cursor: 'pointer',
                    fontSize: 11
                  }}
                >
                  🚩 Report
                </button>
              ) : (
                <span style={{ color: '#666', fontSize: 11 }}>🚩 Reported</span>
              )}
            </div>
          ))
        )}
      </div>
    </main>
  )
}