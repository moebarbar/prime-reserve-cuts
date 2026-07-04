'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import styles from '../account.module.css'

export default function AccountLogin() {
  const router = useRouter()
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setBusy(true)
    setError(null)
    try {
      const res = await fetch('/api/account/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password }),
      })
      const data = await res.json().catch(() => ({}))
      if (res.ok && data.ok) {
        router.push('/account')
        router.refresh()
        return
      }
      setError(typeof data.error === 'string' ? data.error : 'Could not sign you in.')
    } catch {
      setError('Network error — please try again.')
    }
    setBusy(false)
  }

  return (
    <main className={styles.loginPage}>
      <div className={styles.loginBox}>
        <div className={styles.loginBrand}>Automatic <span>Cow</span></div>
        <div className={styles.loginTitle}>Member Sign In</div>

        <form onSubmit={submit}>
          {error && <div className={styles.lErr}>{error}</div>}
          <div className={styles.lField}>
            <label>Username or Email</label>
            <input type="text" autoComplete="username" value={identifier}
              onChange={e => setIdentifier(e.target.value)} autoFocus />
          </div>
          <div className={styles.lField}>
            <label>Password</label>
            <input type="password" autoComplete="current-password" value={password}
              onChange={e => setPassword(e.target.value)} />
          </div>
          <button className={styles.lBtn} type="submit" disabled={busy}>
            {busy ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <a className={styles.lBack} href="/">← Back to Automatic Cow</a>
      </div>
    </main>
  )
}
