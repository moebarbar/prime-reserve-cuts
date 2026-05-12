'use client'

import Link from 'next/link'
import styles from './page1.module.css'
import { BUILDINGS } from '@/data/buildings'
import Footer from './Footer'

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

      {/* HERO — video + headline only, overflow:hidden safe */}
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
          <div>
            <div className={styles.eyebrow}>
              <span className={styles.eyeDash} />
              Houston · Members Only
            </div>
    <h1 className={styles.h1}>
              Finest Cuts.<br />To Your Door.<br /><em>Every Saturday.</em>
            </h1>
          </div>
          <p className={styles.mission}>
            <strong>The best steak in Houston shouldn&apos;t require a reservation.</strong>{' '}
            Automatic Cow delivers USDA Prime cuts directly to luxury residents —
            every week, to your unit, zero effort.
          </p>
        </div>
      </div>

      {/* OUR STORY CTA */}
      <div className={styles.heroBelow}>
        <span style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 300, letterSpacing: '0.12em' }}>
          Houston&apos;s first weekly prime beef subscription
        </span>
        <Link href="/our-story" className={styles.btnStory}>
          Our Story <span>→</span>
        </Link>
      </div>

      {/* HOW IT WORKS */}
      <div className={styles.howSection}>
        <h2 className={styles.howHeading}>
          Three Easy Steps.
        </h2>
        <div className={styles.howSteps}>
          {[
            { num: '01', title: 'Pick Your Place', desc: 'Scan the QR code in your building lobby. Your property is already set up — no searching, no setup.' },
            { num: '02', title: 'Choose Your Category', desc: 'Steak. Slow Cook. Daily essentials. Three categories of beef — pick what fits your week.' },
            { num: '03', title: 'Every Saturday, Done.', desc: 'Your order arrives vacuum-sealed, chilled, and ready. Every Saturday. No reminders. No reordering. It just happens.' },
          ].map(s => (
            <div key={s.num} className={styles.howCard}>
              <div className={styles.howNum}>{s.num}</div>
              <div className={styles.howCardBody}>
                <div className={styles.howTitle}>{s.title}</div>
                <div className={styles.howDesc}>{s.desc}</div>
              </div>
            </div>
          ))}
        </div>
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

      </div>

      {/* CUTS INTRO */}
      <div className={styles.cutsIntro}>
        <div className={styles.eyebrow}>
          <span className={styles.eyeDash} />
          The Selection
        </div>
        <h2 className={styles.cutsTitle}>
          Three categories.<br /><em>One standard.</em>
        </h2>
        <p className={styles.cutsLead}>
          From the weekend ribeye to the everyday ground beef — every cut is USDA Prime,
          sourced, and delivered to your door every Saturday.
        </p>
      </div>

      {/* CATEGORY STRIP */}
      <div className={styles.steakStrip}>
        {[
          {
            src: 'https://i.imgur.com/2SI0S49.jpg',
            name: 'Slow Cook',
            sub: 'Brisket · Chuck Roast · Shank',
            grade: 'USDA Prime',
            price: '3 cuts',
            featured: false,
          },
          {
            src: '/ribeye-raw.jpg',
            name: 'Steak',
            sub: 'Ribeye · NY Strip · Sirloin',
            grade: 'USDA Prime',
            price: '6 cuts',
            featured: true,
          },
          {
            src: 'https://i.imgur.com/n2wjXBV.jpg',
            name: 'Daily Essentials',
            sub: 'Ground Beef · Tallow · Marrow Bones',
            grade: 'USDA Prime',
            price: '3 items',
            featured: false,
          },
        ].map((cat, i) => (
          <div key={i} className={`${styles.sc} ${cat.featured ? styles.scFeatured : ''}`}>
            <div className={styles.scImgWrap}>
              <img
                src={cat.src}
                alt={cat.name}
                className={styles.scImg}
                loading="lazy"
                onError={(e) => { (e.target as HTMLImageElement).style.opacity = '0' }}
              />
            </div>
            <div className={styles.scWarmOverlay} />
            <div className={styles.scGrade}>{cat.grade}</div>
            <div className={styles.scInfo}>
              <span className={styles.scName}>{cat.name}</span>
              <span className={styles.scSub}>{cat.sub}</span>
              <span className={styles.scPrice}>{cat.price}</span>
            </div>
          </div>
        ))}
      </div>

      {/* SOURCING SECTION */}
      <div className={styles.sourceSection}>
        <div className={styles.sourceInner}>
          <div className={styles.sourceHeader}>
            <div className={styles.eyebrow}>
              <span className={styles.eyeDash} />
              Where It Comes From
            </div>
            <h2 className={styles.sourceTitle}>
              Not every ranch<br />makes the <em>cut.</em>
            </h2>
            <p className={styles.sourceLead}>
              We source exclusively from USDA-inspected facilities across the American Midwest and High Plains —
              where cattle are raised on open pasture, grain-finished for peak marbling, and processed under the
              strictest cold-chain standards. No middlemen. No compromises.
            </p>
          </div>

          <div className={styles.sourceImgWrap}>
            <img src="/source-ranch.jpg" alt="Open pasture cattle" className={styles.sourceImg} />
            <div className={styles.sourceImgOverlay} />
            <div className={styles.sourceImgCaption}>Open pasture · Texas High Plains</div>
          </div>

          <div className={styles.sourceGrid}>
            {[
              {
                icon: (
                  <svg className={styles.sourceIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
                    <circle cx="12" cy="9" r="2.5"/>
                  </svg>
                ),
                region: 'High Plains, Texas',
                title: 'Grain-Finished Cattle',
                body: 'Our NY Strip and Ribeye come from grain-finished Black Angus herds raised on the Texas High Plains — known for producing the most consistent marbling in the country.',
              },
              {
                icon: (
                  <svg className={styles.sourceIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="22" x2="12" y2="10"/>
                    <path d="M12 10 C12 10 8 8 8 4.5 a4 4 0 0 1 4-4"/>
                    <path d="M12 10 C12 10 16 8 16 4.5 a4 4 0 0 0-4-4"/>
                    <path d="M12 15 C12 15 9 13.5 9 11"/>
                    <path d="M12 15 C12 15 15 13.5 15 11"/>
                    <path d="M12 20 C12 20 10 18.5 10 16.5"/>
                    <path d="M12 20 C12 20 14 18.5 14 16.5"/>
                  </svg>
                ),
                region: 'Midwest Cornbelt',
                title: 'Corn-Fed Tenderloin',
                body: 'Our Tenderloin is sourced from Midwest corn-fed programs with an average of 150+ days on feed — resulting in the buttery, clean finish that defines a true filet.',
              },
              {
                icon: (
                  <svg className={styles.sourceIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                    <path d="M9 12l2 2 4-4"/>
                  </svg>
                ),
                region: 'USDA-Certified Facilities',
                title: 'Inspected. Every Time.',
                body: 'Every cut passes through USDA-certified processing facilities with full cold-chain traceability from ranch to your building\'s concierge.',
              },
            ].map((s, i) => (
              <div key={i} className={styles.sourceCard}>
                {s.icon}
                <div className={styles.sourceRegion}>{s.region}</div>
                <div className={styles.sourceCardTitle}>{s.title}</div>
                <p className={styles.sourceCardBody}>{s.body}</p>
              </div>
            ))}
          </div>

          <div className={styles.sourceSeal}>
            <div className={styles.sealLine} />
            <span className={styles.sealText}>USDA Prime · Cold Chain Verified · Direct to Your Unit</span>
            <div className={styles.sealLine} />
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
