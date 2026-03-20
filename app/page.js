'use client'
import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function Home() {
  const [username, setUsername] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [isError, setIsError] = useState(false)
  const [success, setSuccess] = useState(false)
  const [createdUsername, setCreatedUsername] = useState('')

  async function handleSignUp() {
    setLoading(true)
    setMessage('')
    setIsError(false)
    setSuccess(false)

    const { data: existing } = await supabase
      .from('profiles')
      .select('username')
      .eq('username', username)
      .single()

    if (existing) {
      setMessage('❌ Username already taken, try another')
      setIsError(true)
      setLoading(false)
      return
    }

    const random = Math.random().toString(36).substring(2, 10)
    const userEmail = `${username}_${random}@spill.app`
    const userPassword = `spill_${random}_${username}`

    const { data, error } = await supabase.auth.signUp({
      email: userEmail,
      password: userPassword
    })

    if (error) {
      setMessage('❌ Error: ' + error.message)
      setIsError(true)
      setLoading(false)
      return
    }

    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: data.user.id,
        username,
        email: userEmail,
        password: userPassword
      })

    if (profileError) {
      setMessage('❌ Error: ' + profileError.message)
      setIsError(true)
    } else {
      localStorage.setItem('spill_email', userEmail)
      localStorage.setItem('spill_password', userPassword)
      localStorage.setItem('spill_username', username)
      setCreatedUsername(username)
      setSuccess(true)
    }

    setLoading(false)
  }

  const siteUrl = typeof window !== 'undefined' ? window.location.origin : ''
  const shareLink = `${siteUrl}/u/${createdUsername}`

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

        <div style={{ marginBottom: 8 }}>
          <span style={{
            fontSize: 64,
            fontWeight: 900,
            background: 'linear-gradient(90deg, #f97316, #ec4899, #8b5cf6)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            SPILL
          </span>
        </div>

        <p style={{ color: '#888', fontSize: 16, marginBottom: 40 }}>
          send & receive anonymous messages 👀
        </p>

        {!success ? (
          <div style={{
            background: '#1a1a2e',
            border: '1px solid #2a2a4a',
            borderRadius: 16,
            padding: 32
          }}>
            <p style={{ color: '#aaa', marginBottom: 16, fontSize: 14 }}>
              Choose your username to get your personal link
            </p>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              background: '#0f0f1a',
              border: '1px solid #333',
              borderRadius: 10,
              padding: '0 16px',
              marginBottom: 16
            }}>
              <span style={{ color: '#555', fontSize: 15 }}>spill/u/</span>
              <input
                type="text"
                placeholder="yourname"
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s/g, ''))}
                style={{
                  flex: 1,
                  padding: '14px 8px',
                  fontSize: 15,
                  border: 'none',
                  background: 'transparent',
                  color: '#fff',
                  outline: 'none'
                }}
              />
            </div>

            <button
              onClick={handleSignUp}
              disabled={loading || !username}
              style={{
                width: '100%',
                padding: '14px 16px',
                fontSize: 16,
                fontWeight: 700,
                borderRadius: 10,
                border: 'none',
                background: username
                  ? 'linear-gradient(90deg, #f97316, #ec4899, #8b5cf6)'
                  : '#2a2a4a',
                color: '#fff',
                cursor: username ? 'pointer' : 'not-allowed',
                letterSpacing: 1
              }}
            >
              {loading ? 'Creating...' : 'GET MY LINK 🔗'}
            </button>

            {message && (
              <div style={{
                marginTop: 20,
                padding: 14,
                borderRadius: 10,
                background: '#0f0f1a',
                border: `1px solid ${isError ? '#ef4444' : '#8b5cf6'}`,
                color: isError ? '#fca5a5' : '#c4b5fd',
                fontSize: 14
              }}>
                {message}
              </div>
            )}
          </div>
        ) : (
          <div style={{
            background: '#1a1a2e',
            border: '1px solid #2a2a4a',
            borderRadius: 16,
            padding: 32
          }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🎉</div>
            <h3 style={{ color: '#fff', margin: '0 0 8px' }}>Your link is ready!</h3>
            <p style={{ color: '#888', fontSize: 14, marginBottom: 24 }}>
              Share it and start receiving anonymous messages
            </p>

            <div style={{
              background: '#0f0f1a',
              border: '1px solid #333',
              borderRadius: 10,
              padding: '14px 16px',
              marginBottom: 12,
              wordBreak: 'break-all',
              fontSize: 13,
              color: '#c4b5fd',
              textAlign: 'left'
            }}>
              {shareLink}
            </div>

            <button
              onClick={() => {
                navigator.clipboard.writeText(shareLink)
                alert('Link copied! 🔗 Share it everywhere!')
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
              Copy Link 🔗
            </button>

            <button
              onClick={() => {
                const text = `Send me an anonymous message on SPILL 👀🌶️ ${shareLink}`
                window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank')
              }}
              style={{
                width: '100%',
                padding: '13px 16px',
                fontSize: 15,
                fontWeight: 700,
                borderRadius: 10,
                border: 'none',
                background: '#25D366',
                color: '#fff',
                cursor: 'pointer',
                marginBottom: 12
              }}
            >
              Share on WhatsApp 💬
            </button>

            <button
              onClick={() => window.location.href = '/inbox'}
              style={{
                width: '100%',
                padding: '13px 16px',
                fontSize: 15,
                fontWeight: 600,
                borderRadius: 10,
                border: '1px solid #8b5cf6',
                background: 'transparent',
                color: '#c4b5fd',
                cursor: 'pointer'
              }}
            >
              Go to my inbox 📬
            </button>
          </div>
        )}

        <p style={{ color: '#444', fontSize: 12, marginTop: 24 }}>
          no login needed to send a message · 100% anonymous
        </p>
      </div>
    </main>
  )
}