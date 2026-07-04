'use client'

import { useState } from 'react'
import styles from './page.module.css'

const GRADE_OPTS = ['', 'USDA Choice', 'Wagyu / Kobe', 'Heritage', 'Grass-Fed', 'Other']

export default function RancherInquiryForm() {
  const [form, setForm] = useState({
    ranch_name: '', owner_name: '', email: '', phone: '',
    location: '', herd_size: '', grade: '', breeds: '',
    weekly_capacity: '', story: '',
  })
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [errMsg, setErrMsg] = useState<string | null>(null)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrMsg(null)

    if (!form.ranch_name.trim() || !form.owner_name.trim() || !form.email.trim()) {
      setErrMsg('Ranch name, your name, and email are required.')
      return
    }
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRe.test(form.email)) {
      setErrMsg('Please enter a valid email.')
      return
    }

    setStatus('sending')
    try {
      const res = await fetch('/api/rancher-inquiries', {
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
        <h3 className={styles.successTitle}>Application received.</h3>
        <p className={styles.successBody}>
          A founder will read every word personally. If we&apos;re a fit, we&apos;ll be in touch within a few business days.
        </p>
      </div>
    )
  }

  return (
    <form className={styles.formCard} onSubmit={submit}>
      {errMsg && <div className={styles.formErr}>{errMsg}</div>}

      <div className={styles.formRow}>
        <div className={styles.formField}>
          <label>Ranch Name *</label>
          <input
            type="text" placeholder="e.g. Lone Star Cattle Co."
            value={form.ranch_name}
            onChange={e => setForm({ ...form, ranch_name: e.target.value })}
          />
        </div>
        <div className={styles.formField}>
          <label>Your Name *</label>
          <input
            type="text" placeholder="John Wells"
            value={form.owner_name}
            onChange={e => setForm({ ...form, owner_name: e.target.value })}
          />
        </div>
      </div>

      <div className={styles.formRow}>
        <div className={styles.formField}>
          <label>Email *</label>
          <input
            type="email" placeholder="john@ranch.com"
            value={form.email}
            onChange={e => setForm({ ...form, email: e.target.value })}
          />
        </div>
        <div className={styles.formField}>
          <label>Phone</label>
          <input
            type="tel" placeholder="+1 (000) 000-0000"
            value={form.phone}
            onChange={e => setForm({ ...form, phone: e.target.value })}
          />
        </div>
      </div>

      <div className={styles.formRow}>
        <div className={styles.formField}>
          <label>Location</label>
          <input
            type="text" placeholder="e.g. Hill Country, TX"
            value={form.location}
            onChange={e => setForm({ ...form, location: e.target.value })}
          />
        </div>
        <div className={styles.formField}>
          <label>Herd Size</label>
          <input
            type="text" placeholder="e.g. 200 head"
            value={form.herd_size}
            onChange={e => setForm({ ...form, herd_size: e.target.value })}
          />
        </div>
      </div>

      <div className={styles.formRow}>
        <div className={styles.formField}>
          <label>Grade</label>
          <select
            value={form.grade}
            onChange={e => setForm({ ...form, grade: e.target.value })}
          >
            {GRADE_OPTS.map(g => <option key={g} value={g}>{g || 'Select grade…'}</option>)}
          </select>
        </div>
        <div className={styles.formField}>
          <label>Breeds</label>
          <input
            type="text" placeholder="e.g. Black Angus, Wagyu cross"
            value={form.breeds}
            onChange={e => setForm({ ...form, breeds: e.target.value })}
          />
        </div>
      </div>

      <div className={styles.formField}>
        <label>Weekly Capacity</label>
        <input
          type="text" placeholder="e.g. 80 subprimals / week"
          value={form.weekly_capacity}
          onChange={e => setForm({ ...form, weekly_capacity: e.target.value })}
        />
      </div>

      <div className={styles.formField}>
        <label>Tell us your story</label>
        <textarea
          rows={4} placeholder="What makes your ranch different? Practices, history, anything you want us to know."
          value={form.story}
          onChange={e => setForm({ ...form, story: e.target.value })}
        />
      </div>

      <button type="submit" className={styles.formSubmit} disabled={status === 'sending'}>
        {status === 'sending' ? 'Sending…' : 'Submit Application →'}
      </button>
    </form>
  )
}
