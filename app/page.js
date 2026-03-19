'use client'
import { useState, useEffect } from 'react'
import { use } from 'react'
import { supabase } from '../lib/supabase'

export default function CheckReply({ params }) {
  const { token } = use(params)
  const [reply, setReply] = useState(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    async function fetchReply() {
      const { data, error } = await supabase
        .from('messages')
        .select('content, replies(*)')
        .eq('reply_token', token)
        .single()

      if (error || !data) {
        setNotFound(true)
      } else {
        setReply(data)
      }
      setLoading(false)
    }
    fetchReply()
  }, [token])

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
          {loading ? (
            <p style={{ color: '#888' }}>Checking for reply...</p>
          ) : notFound ? (
            <div>
              <div style={{ fontSize: 40, marginBottom: 12 }}>👻</div>
              <p style={{ color: '#888' }}>Message not found</p>
            </div>
          ) : (
            <div>
              <div style={{
                background: '#0f0f1a',
                borderRadius: 10,
                padding: 16,
                marginBottom: 20,
                textAlign: 'left'
              }}>
                <p style={{ color: '#666', fontSize: 12, margin: '0 0 6px' }}>Your message</p>
                <p style={{ color: '#aaa', fontSize: 14, margin: 0 }}>{reply.content}</p>
              </div>

              {reply.replies?.length > 0 ? (
                <div>
                  <div style={{ fontSize: 36, marginBottom: 12 }}>💬</div>
                  <p style={{ color: '#888', fontSize: 13, marginBottom: 12 }}>They replied!</p>
                  <div style={{
                    background: '#0f0f1a',
                    borderLeft: '3px solid #8b5cf6',
                    borderRadius: 10,
                    padding: 16,
                    textAlign: 'left'
                  }}>
                    <p style={{ color: '#c4b5fd', fontSize: 15, margin: 0 }}>
                      {reply.replies[0].content}
                    </p>
                  </div>
                </div>
              ) : (
                <div>
                  <div style={{ fontSize: 36, marginBottom: 12 }}>⏳</div>
                  <p style={{ color: '#888', fontSize: 14 }}>No reply yet. Check back later!</p>
                </div>
              )}
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
