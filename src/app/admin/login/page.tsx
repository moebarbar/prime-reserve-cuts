'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminLoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })

      if (res.ok) {
        router.push('/admin')
        router.refresh()
      } else {
        const data = await res.json().catch(() => ({}))
        setError(data.error ?? 'Invalid credentials')
      }
    } catch {
      setError('Connection error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--dark)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
    }}>
      <div style={{
        width: '100%',
        maxWidth: 380,
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{
            fontFamily: 'var(--font-cormorant), serif',
            fontSize: 28,
            fontStyle: 'italic',
            color: 'var(--cream)',
            letterSpacing: '-0.01em',
          }}>
            Automatic <span style={{ color: 'var(--gold)' }}>Cow</span>
          </div>
          <div style={{
            fontFamily: 'var(--font-jost), sans-serif',
            fontSize: 7.5,
            fontWeight: 600,
            letterSpacing: '0.44em',
            textTransform: 'uppercase',
            color: 'var(--muted)',
            marginTop: 6,
          }}>
            Admin Console
          </div>
        </div>

        {/* Card */}
        <div style={{
          background: 'var(--panel)',
          border: '1px solid var(--border)',
          padding: '36px 32px 32px',
        }}>
          <div style={{
            fontFamily: 'var(--font-cormorant), serif',
            fontSize: 22,
            fontWeight: 300,
            color: 'var(--cream)',
            marginBottom: 28,
          }}>
            Sign <em style={{ color: 'var(--gold)', fontStyle: 'italic' }}>in.</em>
          </div>

          {error && (
            <div style={{
              background: 'rgba(192,57,43,0.1)',
              border: '1px solid rgba(192,57,43,0.3)',
              color: '#e05c4d',
              fontSize: 11,
              padding: '10px 14px',
              marginBottom: 20,
              letterSpacing: '0.02em',
            }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 20 }}>
              <label style={{
                display: 'block',
                fontSize: 7.5,
                fontWeight: 700,
                letterSpacing: '0.44em',
                textTransform: 'uppercase',
                color: 'var(--muted)',
                marginBottom: 8,
              }}>Username</label>
              <input
                type="text"
                autoComplete="username"
                autoFocus
                value={username}
                onChange={e => setUsername(e.target.value)}
                required
                style={{
                  width: '100%',
                  background: 'transparent',
                  border: 'none',
                  borderBottom: '1px solid rgba(184,134,58,0.3)',
                  color: 'var(--cream)',
                  fontFamily: 'var(--font-jost), sans-serif',
                  fontSize: 15,
                  fontWeight: 300,
                  padding: '8px 0',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
                onFocus={e => { e.target.style.borderBottomColor = 'var(--gold)' }}
                onBlur={e => { e.target.style.borderBottomColor = 'rgba(184,134,58,0.3)' }}
              />
            </div>

            <div style={{ marginBottom: 28 }}>
              <label style={{
                display: 'block',
                fontSize: 7.5,
                fontWeight: 700,
                letterSpacing: '0.44em',
                textTransform: 'uppercase',
                color: 'var(--muted)',
                marginBottom: 8,
              }}>Password</label>
              <input
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                style={{
                  width: '100%',
                  background: 'transparent',
                  border: 'none',
                  borderBottom: '1px solid rgba(184,134,58,0.3)',
                  color: 'var(--cream)',
                  fontFamily: 'var(--font-jost), sans-serif',
                  fontSize: 15,
                  fontWeight: 300,
                  padding: '8px 0',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
                onFocus={e => { e.target.style.borderBottomColor = 'var(--gold)' }}
                onBlur={e => { e.target.style.borderBottomColor = 'rgba(184,134,58,0.3)' }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                background: loading ? 'rgba(184,134,58,0.5)' : 'var(--gold)',
                color: 'var(--dark)',
                border: 'none',
                fontFamily: 'var(--font-jost), sans-serif',
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: '0.24em',
                textTransform: 'uppercase',
                padding: '14px 20px',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'background 0.18s',
              }}
            >
              {loading ? 'Signing in…' : 'Sign In →'}
            </button>
          </form>
        </div>

        <div style={{
          textAlign: 'center',
          marginTop: 20,
          fontSize: 10,
          color: 'var(--muted)',
          letterSpacing: '0.05em',
        }}>
          Houston, TX · automaticcow.com
        </div>
      </div>
    </div>
  )
}
