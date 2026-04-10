'use client'

import Link from 'next/link'
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
        <video
          className={styles.heroBg}
          autoPlay
          muted
          loop
          playsInline
          poster="https://images.unsplash.com/photo-1562802378-063ec186a863?w=1400&q=80&fit=crop&crop=center"
        >
          <source src="https://videos.pexels.com/video-files/3209830/3209830-hd_1920_1080_25fps.mp4" type="video/mp4" />
        </video>
        <div className={styles.heroOverlay} />
        <div className={styles.heroContent}>
          <div className={styles.heroMain}>
            <div className={styles.eyebrow}>
              <span className={styles.eyeDash} />
              Houston · Members Only
            </div>
            <p className={styles.heroEyebrowAlt}>Good Food From Now On</p>
            <h1 className={styles.h1}>
              Finest Cuts.<br />To Your Door.<br /><em>Every Saturday.</em>
            </h1>
            <div className={styles.heroImgWrap}>
              <img
                src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=1200&q=80&fit=crop&crop=center"
                alt="Premium steak plate"
                className={styles.heroImg}
                loading="eager"
              />
              <div className={styles.heroImgFade} />
            </div>
            <Link href="/our-story" className={styles.btnStory}>
              Our Story <span>→</span>
            </Link>
          </div>
        </div>
      </div>

      {/* STEAK STRIP */}
      <div className={styles.steakStrip}>
        {[
          { src: 'https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=800&q=80&fit=crop&crop=center', name: 'NY Strip', price: '$49/week' },
          { src: 'https://images.unsplash.com/photo-1588168333986-5078d3ae3976?w=800&q=80&fit=crop&crop=center', name: 'Tenderloin', price: '$59/week' },
          { src: 'https://images.unsplash.com/photo-1600891964092-4316c288032e?w=800&q=80&fit=crop&crop=center', name: 'Ribeye', price: '$55/week' },
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
