'use client'

import Link from 'next/link'

interface NavProps {
  step: 1 | 2 | 3
  hideSteps?: boolean
  onLogoClick?: () => void
}

export default function Nav({ step, hideSteps, onLogoClick }: NavProps) {
  return (
    <nav className="nav">
      <Link href="/" className="nav-logo" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}
        onClick={e => { if (onLogoClick) { e.preventDefault(); onLogoClick() } }}>
        <img
          src="/logo.png?v=3"
          alt="Automatic Cow"
          height={36}
          style={{ height: 36, width: 'auto', display: 'block' }}
        />
        <div style={{ marginLeft: 10, display: 'flex', flexDirection: 'column', gap: 1 }}>
          <span style={{
            fontFamily: "'Cormorant', serif",
            fontSize: 18,
            fontWeight: 300,
            color: 'var(--cream)',
            letterSpacing: '0.06em',
            lineHeight: 1.2,
          }}>Automatic Cow</span>
          <span style={{
            fontFamily: "'Jost', sans-serif",
            fontSize: 8,
            fontWeight: 500,
            color: 'var(--gold)',
            letterSpacing: '0.3em',
            textTransform: 'uppercase',
            lineHeight: 1,
          }}>Good Food From Now On</span>
        </div>
      </Link>
      {!hideSteps && (
        <div className="nav-right">
          <div className="steps">
            <div className={`step ${step === 1 ? 'active' : step > 1 ? 'done' : ''}`}>
              <span className="step-num">{step > 1 ? '✓' : '1'}</span>
            </div>
            <div className="step-sep" />
            <div className={`step ${step === 2 ? 'active' : step > 2 ? 'done' : ''}`}>
              <span className="step-num">{step > 2 ? '✓' : '2'}</span>
            </div>
            <div className="step-sep" />
            <div className={`step ${step === 3 ? 'active' : ''}`}>
              <span className="step-num">3</span>
            </div>
          </div>
          <span style={{ color: 'var(--border)' }}>|</span>
          <span>Houston, TX</span>
        </div>
      )}
    </nav>
  )
}
