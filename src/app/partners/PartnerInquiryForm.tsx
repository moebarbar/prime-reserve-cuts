'use client'

import { useState } from 'react'
import styles from './page.module.css'

export default function PartnerInquiryForm() {
  const [form, setForm] = useState({
    property_name: '', manager_name: '', email: '', phone: '', units: '', message: '',
  })
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [errMsg, setErrMsg] = useState<string | null>(null)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrMsg(null)

    if (!form.property_name.trim() || !form.manager_name.trim() || !form.email.trim()) {
      setErrMsg('Property name, your name, and email are required.')
      return
    }
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRe.test(form.email)) {
      setErrMsg('Please enter a valid email.')
      return
    }

    setStatus('sending')
    try {
      const res = await fetch('/api/partner-inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error('Failed')
      setStatus('sent')
    } catch {
      setStatus('error')
      setErrMsg('Something went wrong. Please try again or email beef@automaticcow.com.')
    }
  }

  if (status === 'sent') {
    return (
      <div className={styles.formCard}>
        <div className={styles.successIcon}>✓</div>
        <h3 className={styles.successTitle}>Thank you.</h3>
        <p className={styles.successBody}>
          We&apos;ve received your inquiry and will be in touch within one business day.
        </p>
      </div>
    )
  }

  return (
    <form className={styles.formCard} onSubmit={submit}>
      {errMsg && <div className={styles.formErr}>{errMsg}</div>}

      <div className={styles.formField}>
        <label>Property Name *</label>
        <input
          type="text" placeholder="e.g. Aspire Post Oak"
          value={form.property_name}
          onChange={e => setForm({ ...form, property_name: e.target.value })}
        />
      </div>

      <div className={styles.formRow}>
        <div className={styles.formField}>
          <label>Your Name *</label>
          <input
            type="text" placeholder="Jane Smith"
            value={form.manager_name}
            onChange={e => setForm({ ...form, manager_name: e.target.value })}
          />
        </div>
        <div className={styles.formField}>
          <label># of Units</label>
          <input
            type="text" placeholder="e.g. 350"
            value={form.units}
            onChange={e => setForm({ ...form, units: e.target.value })}
          />
        </div>
      </div>

      <div className={styles.formRow}>
        <div className={styles.formField}>
          <label>Email *</label>
          <input
            type="email" placeholder="jane@property.com"
            value={form.email}
            onChange={e => setForm({ ...form, email: e.target.value })}
          />
        </div>
        <div className={styles.formField}>
          <label>Phone</label>
          <input
            type="tel" placeholder="+1 (713) 000-0000"
            value={form.phone}
            onChange={e => setForm({ ...form, phone: e.target.value })}
          />
        </div>
      </div>

      <div className={styles.formField}>
        <label>Anything we should know?</label>
        <textarea
          rows={3} placeholder="Optional — a short message about your building or residents"
          value={form.message}
          onChange={e => setForm({ ...form, message: e.target.value })}
        />
      </div>

      <button type="submit" className={styles.formSubmit} disabled={status === 'sending'}>
        {status === 'sending' ? 'Sending…' : 'Send Inquiry →'}
      </button>
    </form>
  )
}
