'use client'

interface NavProps {
  step: 1 | 2 | 3
}

export default function Nav({ step }: NavProps) {
  return (
    <nav className="nav">
      <div className="nav-logo">Prime <span>Reserve</span></div>
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
    </nav>
  )
}
