'use client'

import styles from './page1.module.css'
import { BUILDINGS } from '@/data/buildings'

interface Page1Props {
  selectedKey: string | null
  onSelect: (key: string) => void
  onContinue: () => void
}

export default function Page1({ selectedKey, onSelect, onContinue }: Page1Props) {
  const handleContinue = () => {
    if (!selectedKey) {
      const grid = document.getElementById('bld-grid')
      if (grid) {
        grid.style.outline = '1.5px solid var(--gold)'
        grid.style.outlineOffset = '6px'
        setTimeout(() => { grid.style.outline = ''; grid.style.outlineOffset = '' }, 1600)
      }
      return
    }
    onContinue()
  }

  return (
    <div className={styles.page}>

      {/* HERO */}
      <div className={styles.hero}>
        <div className={styles.heroBg} />
        <div className={styles.heroOverlay} />
        <div className={styles.heroContent}>
          <div>
            <div className={styles.eyebrow}>
              <span className={styles.eyeDash} />
              Houston · Members Only
            </div>
            <h1 className={styles.h1}>
              The finest<br />cuts, <em>at<br />your door.</em>
            </h1>
          </div>
          <p className={styles.mission}>
            <strong>The best steak in Houston shouldn't require a reservation.</strong>{' '}
            Prime Reserve delivers USDA Prime and A5 Wagyu directly to luxury residents —
            every month, to your unit, zero effort.
          </p>
        </div>
      </div>

      {/* STEAK STRIP */}
      <div className={styles.steakStrip}>
        {[
          { src: 'https://images.unsplash.com/photo-1562802378-063ec186a863?w=800&q=80&fit=crop&crop=center', name: 'Tomahawk Ribeye', price: '$229/mo', priority: true },
          { src: 'https://images.unsplash.com/photo-1565299507177-b0ac66763828?w=500&q=80&fit=crop&crop=center', name: 'Ribeye', price: '$89/mo' },
          { src: 'https://images.unsplash.com/photo-1432139509613-5c4255815697?w=500&q=80&fit=crop&crop=center', name: 'Filet Mignon', price: '$119/mo' },
          { src: 'https://images.unsplash.com/photo-1570197788417-0e82375c9371?w=500&q=80&fit=crop&crop=center', name: 'A5 Wagyu', price: '$189/mo' },
        ].map((cut, i) => (
          <div key={i} className={styles.sc}>
            <img
              src={cut.src}
              alt={cut.name}
              className={styles.scImg}
              loading={i === 0 ? 'eager' : 'lazy'}
              onError={(e) => { (e.target as HTMLImageElement).style.opacity = '0' }}
            />
            <div className={styles.scInfo}>
              <span className={styles.scName}>{cut.name}</span>
              <span className={styles.scPrice}>From {cut.price}</span>
            </div>
          </div>
        ))}
      </div>

      {/* VALUE BAR */}
      <div className={styles.vbar}>
        {[
          { icon: '🚪', title: 'To your unit', sub: 'Via your concierge' },
          { icon: '🥩', title: 'USDA Prime & A5 Wagyu', sub: 'No lower grades, ever' },
          { icon: '❄️', title: 'Vacuum sealed + dry ice', sub: 'Restaurant packaging' },
          { icon: '🔒', title: 'Cancel any time', sub: 'No commitment' },
        ].map((v, i) => (
          <div key={i} className={styles.vp}>
            <span className={styles.vpIcon}>{v.icon}</span>
            <div>
              <strong>{v.title}</strong>
              {v.sub}
            </div>
          </div>
        ))}
      </div>

      {/* BUILDING SELECTOR */}
      <div className={styles.bldSection}>
        <div className={styles.bldHeader}>
          <h2 className={styles.bldTitle}>
            Where do<br />you <em>live?</em>
          </h2>
          <p className={styles.bldHint}>
            Select your building to claim your exclusive resident membership.
          </p>
        </div>

        <div className={styles.bldGrid} id="bld-grid">
          {BUILDINGS.map((b) => (
            <div
              key={b.key}
              className={`${styles.bc} ${selectedKey === b.key ? styles.bcSel : ''}`}
              onClick={() => onSelect(b.key)}
            >
              <div
                className={styles.bcBg}
                style={{ backgroundImage: `url('${b.img}')` }}
              />
              <div className={styles.bcGrad} />
              {selectedKey === b.key && <div className={styles.bcCheck}>✓</div>}
              <div className={styles.bcBody}>
                <div className={styles.bcNbhd}>{b.nbhd}</div>
                <div
                  className={styles.bcName}
                  dangerouslySetInnerHTML={{ __html: b.nameHtml }}
                />
                <div className={styles.bcHint}>
                  <span className={styles.hl} />
                  Select
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className={styles.bldAction}>
          <div className={styles.bldStatus}>
            {selectedKey && <div className={styles.sdot} />}
            <span>
              {selectedKey
                ? `${BUILDINGS.find(b => b.key === selectedKey)?.name} selected`
                : 'Select your building above'}
            </span>
          </div>
          <button className={styles.btnNext} onClick={handleContinue}>
            Continue <span className={styles.arr}>→</span>
          </button>
        </div>
      </div>

    </div>
  )
}
