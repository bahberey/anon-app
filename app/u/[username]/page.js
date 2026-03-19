'use client'
import { useState, useEffect } from 'react'
import { use } from 'react'
import { supabase } from '../../../lib/supabase'

export default function UserPage({ params }) {
  const { username } = use(params)
  const [profile, setProfile] = useState(null)
  const [message, setMessage] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    async function fetchProfile() {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('username', username)
        .single()

      if (error || !data) {
        setNotFound(true)
      } else {
        setProfile(data)
      }
    }
    fetchProfile()
  }, [username])

  async function handleSend() {
    if (!message.trim()) return
    setLoading(true)

    const { data, error } = await supabase
      .from('messages')
      .insert({
        recipient_id: profile.id,
        content: message
      })
      .select()
      .single()

    if (error) {
      alert('Error sending: ' + error.message)
    } else {
      localStorage.setItem('last_reply_token', data.reply_token)
      setSent(true)
    }
    setLoading(false)
  }

  if (notFound) return (
    <main style={{
      minHeight: '100vh',
      background: '#0f0f0f',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div style={{ textAlign: 'center', color: '#fff' }}>
        <div style={{ fontSize: 48 }}>👻</div>
        <h2>User not found</h2>
        <p style={{ color: '#666' }}>This link doesn't exist</p>
      </div>
    </main>
  )

  if (!profile) return (
    <main style={{
      minHeight: '100vh',
      background: '#0f0f0f',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#fff'
    }}>
      Loading...
    </main>
  )

  return (
    <main style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f0f0f 0%, #1a0a2e 50%, #0f0f0f 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: "'Segoe UI', sans-serif"
    }}>
      <div style={{ width: '100%', maxWidth: 460, padding: 24, textAlign: 'center' }}>

        <span style={{
          fontSize: 36,
          fontWeight: 900,
          background: 'linear-gradient(90deg, #f97316, #ec4899, #8b5cf6)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          SPILL
        </span>

        <div style={{ margin: '24px 0' }}>
          <div style={{
            width: 72,
            height: 72,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #f97316, #8b5cf6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 28,
            fontWeight: 700,
            color: '#fff',
            margin: '0 auto 12px'
          }}>
            {profile.username[0].toUpperCase()}
          </div>
          <h2 style={{ color: '#fff', margin: 0 }}>@{profile.username}</h2>
          <p style={{ color: '#666', fontSize: 14 }}>send an anonymous message 👇</p>
        </div>

        <div style={{
          background: '#1a1a2e',
          border: '1px solid #2a2a4a',
          borderRadius: 16,
          padding: 32
        }}>
          {!sent ? (
            <>
              <textarea
                placeholder="say something... they won't know it's you 👀"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={5}
                style={{
                  width: '100%',
                  padding: 14,
                  fontSize: 15,
                  borderRadius: 10,
                  border: '1px solid #333',
                  background: '#0f0f1a',
                  color: '#fff',
                  resize: 'none',
                  outline: 'none',
                  boxSizing: 'border-box',
                  marginBottom: 16,
                  fontFamily: "'Segoe UI', sans-serif"
                }}
              />
              <button
                onClick={handleSend}
                disabled={loading || !message.trim()}
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  fontSize: 16,
                  fontWeight: 700,
                  borderRadius: 10,
                  border: 'none',
                  background: message.trim()
                    ? 'linear-gradient(90deg, #f97316, #ec4899, #8b5cf6)'
                    : '#2a2a4a',
                  color: '#fff',
                  cursor: message.trim() ? 'pointer' : 'not-allowed',
                  letterSpacing: 1
                }}
              >
                {loading ? 'Sending...' : 'SPILL IT 🌶️'}
              </button>
            </>
          ) : (
            <div>
              <div style={{ fontSize: 48, marginBottom: 12 }}>🔥</div>
              <h3 style={{ color: '#fff', margin: '0 0 8px' }}>Message sent!</h3>
              <p style={{ color: '#888', fontSize: 14, marginBottom: 20 }}>
                They have no idea it was you 😏
              </p>

              <button
                onClick={() => {
                  const token = localStorage.getItem('last_reply_token')
                  if (token) {
                    window.location.href = `/check/${token}`
                  } else {
                    alert('Token not found, try again')
                  }
                }}
                style={{
                  width: '100%',
                  padding: '13px 16px',
                  fontSize: 15,
                  fontWeight: 700,
                  borderRadius: 10,
                  border: 'none',
                  background: 'linear-gradient(90deg, #f97316, #ec4899, #8b5cf6)',
                  color: '#fff',
                  cursor: 'pointer',
                  marginBottom: 12
                }}
              >
                Check for reply 💬
              </button>

              <button
                onClick={() => { setMessage(''); setSent(false) }}
                style={{
                  width: '100%',
                  padding: '13px 16px',
                  borderRadius: 10,
                  border: '1px solid #8b5cf6',
                  background: 'transparent',
                  color: '#c4b5fd',
                  cursor: 'pointer',
                  fontSize: 14
                }}
              >
                Send another 👀
              </button>
            </div>
          )}
        </div>

        <p style={{ color: '#444', fontSize: 12, marginTop: 24 }}>
          100% anonymous · powered by SPILL
        </p>
      </div>
    </main>
  )
}