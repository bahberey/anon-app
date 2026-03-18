'use client'
import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function Home() {
  const [username, setUsername] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  async function handleSignUp() {
    setLoading(true)
    setMessage('')

    const email = `${username}@anonapp.com`
    const password = 'defaultpassword123'

    const { data, error } = await supabase.auth.signUp({ email, password })

    if (error) {
      setMessage('Error: ' + error.message)
      setLoading(false)
      return
    }

    const { error: profileError } = await supabase
      .from('profiles')
      .insert({ id: data.user.id, username })

    if (profileError) {
      setMessage('Error: ' + profileError.message)
    } else {
      setMessage('Account created! Your link is: anonapp.com/u/' + username)
    }

    setLoading(false)
  }

  return (
    <main style={{ maxWidth: 500, margin: '80px auto', padding: 24 }}>
      <h1 style={{ fontSize: 32, fontWeight: 700 }}>AnonApp</h1>
      <p style={{ color: '#888', marginBottom: 32 }}>
        Get anonymous messages from anyone
      </p>

      <input
        type="text"
        placeholder="Choose a username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        style={{
          width: '100%',
          padding: '12px 16px',
          fontSize: 16,
          borderRadius: 8,
          border: '1px solid #333',
          background: '#111',
          color: '#fff',
          marginBottom: 12,
          boxSizing: 'border-box'
        }}
      />

      <button
        onClick={handleSignUp}
        disabled={loading || !username}
        style={{
          width: '100%',
          padding: '12px 16px',
          fontSize: 16,
          fontWeight: 600,
          borderRadius: 8,
          border: 'none',
          background: username ? '#7c3aed' : '#333',
          color: '#fff',
          cursor: username ? 'pointer' : 'not-allowed'
        }}
      >
        {loading ? 'Creating...' : 'Create My Link'}
      </button>

      {message && (
        <p style={{ marginTop: 16, color: '#7c3aed', fontWeight: 500 }}>
          {message}
        </p>
      )}
    </main>
  )
}