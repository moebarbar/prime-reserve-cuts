'use client'

import { useEffect, useState } from 'react'
import styles from './page.module.css'

const SLIDES = [
  'cover', 'problem', 'solution', 'why-now', 'market', 'how',
  'traction', 'unit-economics', 'model', 'competition', 'gtm',
  'roadmap', 'team', 'ask', 'close',
] as const

export default function PitchDeck() {
  const [active, setActive] = useState(0)

  // Track which slide is currently in view
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(e => {
          if (e.isIntersecting) {
            const idx = SLIDES.indexOf(e.target.id as typeof SLIDES[number])
            if (idx !== -1) setActive(idx)
          }
        })
      },
      { threshold: 0.5 }
    )
    SLIDES.forEach(id => {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    })
    return () => observer.disconnect()
  }, [])

  // Arrow-key navigation
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown' || e.key === 'PageDown' || e.key === ' ') {
        e.preventDefault()
        const next = Math.min(SLIDES.length - 1, active + 1)
        document.getElementById(SLIDES[next])?.scrollIntoView({ behavior: 'smooth' })
      } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
        e.preventDefault()
        const prev = Math.max(0, active - 1)
        document.getElementById(SLIDES[prev])?.scrollIntoView({ behavior: 'smooth' })
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [active])

  return (
    <div className={styles.deck}>
      {/* Slide counter (top-right) */}
      <div className={styles.counter}>
        <span className={styles.counterNum}>{String(active + 1).padStart(2, '0')}</span>
        <span className={styles.counterSep} />
        <span className={styles.counterTotal}>{String(SLIDES.length).padStart(2, '0')}</span>
      </div>

      {/* Progress rail (left side) */}
      <div className={styles.rail}>
        {SLIDES.map((id, i) => (
          <a
            key={id}
            href={`#${id}`}
            className={`${styles.railDot} ${i === active ? styles.railDotActive : ''}`}
            aria-label={`Slide ${i + 1}`}
          />
        ))}
      </div>

      {/* 01 — COVER */}
      <section id="cover" className={`${styles.slide} ${styles.cover}`}>
        <div className={styles.coverInner}>
          <div className={styles.brand}>Automatic <em>Cow</em></div>
          <h1 className={styles.coverTitle}>
            Whole-cow luxury.<br /><em>Every Saturday.</em>
          </h1>
          <div className={styles.coverMeta}>
            <span>Investor Brief</span>
            <span className={styles.metaDot} />
            <span>Houston, TX</span>
            <span className={styles.metaDot} />
            <span>Series Seed · Confidential</span>
          </div>
        </div>
        <div className={styles.coverFooter}>
          ↓ Scroll or use arrow keys
        </div>
      </section>

      {/* 02 — PROBLEM */}
      <section id="problem" className={styles.slide}>
        <div className={styles.slideInner}>
          <div className={styles.eyebrow}>The Problem</div>
          <h2 className={styles.h2}>
            Houston&apos;s most demanding palates<br /><em>have nowhere to shop.</em>
          </h2>
          <div className={styles.problemGrid}>
            <div className={styles.problemCard}>
              <div className={styles.problemStat}>$200K+</div>
              <div className={styles.problemLabel}>average annual dining spend per luxury high-rise household</div>
            </div>
            <div className={styles.problemCard}>
              <div className={styles.problemStat}>3%</div>
              <div className={styles.problemLabel}>of that spent on at-home prime beef — despite preference</div>
            </div>
            <div className={styles.problemCard}>
              <div className={styles.problemStat}>0</div>
              <div className={styles.problemLabel}>delivery services bringing true USDA Prime to a Houston concierge</div>
            </div>
          </div>
          <ul className={styles.problemList}>
            <li>Costco &amp; HEB don&apos;t carry true USDA Prime — nor proper brisket, marrow bones, or rendered tallow</li>
            <li>Specialty butchers require a drive, parking, conversation, planning — for one cut at a time</li>
            <li>National DTC players (Crowd Cow, Snake River) ship 2-day frozen and only sell prime steaks — never the full animal</li>
            <li>Different cuts. Different cravings. Different stores. Nobody serves the whole-week, whole-cow customer.</li>
          </ul>
        </div>
      </section>

      {/* 03 — SOLUTION */}
      <section id="solution" className={styles.slide}>
        <div className={styles.slideInner}>
          <div className={styles.eyebrow}>The Solution</div>
          <h2 className={styles.h2}>
            One subscription.<br /><em>The whole animal.</em>
          </h2>
          <p className={styles.lead}>
            A weekly USDA Prime membership covering every cut your household actually eats —
            three categories from one animal:
            <br /><br />
            <strong>Steak</strong> (Ribeye, NY Strip, Sirloin, Filet, Wagyu, Tomahawk) ·
            <strong> Slow Cook</strong> (Brisket, Chuck Roast, Shank) ·
            <strong> Daily Essentials</strong> (Ground Beef, Tallow, Marrow Bones).
            Delivered every Saturday to your building&apos;s concierge.
          </p>
          <div className={styles.solutionFlow}>
            {[
              { n: '01', t: 'Pick Your Building', d: 'Scan the QR in your lobby. We already know your address.' },
              { n: '02', t: 'Choose Your Category', d: 'Premium steaks, soulful slow-cook cuts, or daily essentials. Mix freely.' },
              { n: '03', t: 'Every Saturday, Done', d: 'Vacuum-sealed, chilled, dropped at your concierge.' },
            ].map(s => (
              <div key={s.n} className={styles.solutionStep}>
                <div className={styles.solutionNum}>{s.n}</div>
                <div className={styles.solutionTitle}>{s.t}</div>
                <div className={styles.solutionDesc}>{s.d}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 04 — WHY NOW */}
      <section id="why-now" className={styles.slide}>
        <div className={styles.slideInner}>
          <div className={styles.eyebrow}>Why Now</div>
          <h2 className={styles.h2}>
            Three tailwinds<br /><em>colliding in our zip code.</em>
          </h2>
          <div className={styles.whyGrid}>
            <div className={styles.whyCard}>
              <div className={styles.whyTitle}>Home cooking renaissance</div>
              <div className={styles.whyBig}>$500B → $720B</div>
              <div className={styles.whyDesc}>US at-home premium grocery, 2024 → 2027 projected</div>
            </div>
            <div className={styles.whyCard}>
              <div className={styles.whyTitle}>Luxury subscriptions</div>
              <div className={styles.whyBig}>+23% YoY</div>
              <div className={styles.whyDesc}>Premium DTC subscription category growth (2023–2025)</div>
            </div>
            <div className={styles.whyCard}>
              <div className={styles.whyTitle}>Houston high-rise boom</div>
              <div className={styles.whyBig}>+22 buildings</div>
              <div className={styles.whyDesc}>New luxury towers delivered since 2020 — 32 total in our market</div>
            </div>
          </div>
        </div>
      </section>

      {/* 05 — MARKET */}
      <section id="market" className={styles.slide}>
        <div className={styles.slideInner}>
          <div className={styles.eyebrow}>Market Opportunity</div>
          <h2 className={styles.h2}>
            A $42M wedge<br /><em>in a $89B mountain.</em>
          </h2>
          <div className={styles.marketStack}>
            <div className={`${styles.marketTier} ${styles.tierTam}`}>
              <span className={styles.tierLabel}>TAM</span>
              <span className={styles.tierValue}>$89B</span>
              <span className={styles.tierDesc}>US premium beef DTC + retail (Mintel, 2025)</span>
            </div>
            <div className={`${styles.marketTier} ${styles.tierSam}`}>
              <span className={styles.tierLabel}>SAM</span>
              <span className={styles.tierValue}>$4.2B</span>
              <span className={styles.tierDesc}>US urban luxury subscription beef</span>
            </div>
            <div className={`${styles.marketTier} ${styles.tierSom}`}>
              <span className={styles.tierLabel}>SOM</span>
              <span className={styles.tierValue}>$42M</span>
              <span className={styles.tierDesc}>Houston Phase 1 — 32 buildings × 300 units × 15% × $1,400/yr</span>
            </div>
          </div>
          <div className={styles.marketFootnote}>
            Phase 2 (Top 20 metros): <strong>$620M</strong> serviceable revenue at current unit economics.
          </div>
        </div>
      </section>

      {/* 06 — HOW IT WORKS */}
      <section id="how" className={styles.slide}>
        <div className={styles.slideInner}>
          <div className={styles.eyebrow}>How It Works</div>
          <h2 className={styles.h2}>
            From ranch to your unit<br /><em>in 72 hours.</em>
          </h2>
          <div className={styles.howChain}>
            {[
              { i: '✺', t: 'Direct Ranch Sourcing', d: 'USDA Prime sourced direct from partner ranches in Texas, Oklahoma, Midwest. No middlemen.' },
              { i: '◇', t: 'USDA Processing', d: 'Cut, vacuum-sealed, and chilled in USDA-certified facilities with full cold-chain.' },
              { i: '◈', t: 'Saturday Routing', d: 'Refrigerated routes from our Houston warehouse to every partner building.' },
              { i: '◉', t: 'Concierge Hand-Off', d: 'Dropped at your building&apos;s front desk. Member ID matched. Done.' },
            ].map((s, i) => (
              <div key={i} className={styles.howStep}>
                <div className={styles.howIcon}>{s.i}</div>
                <div className={styles.howTitle}>{s.t}</div>
                <div className={styles.howDesc}>{s.d}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 07 — TRACTION */}
      <section id="traction" className={styles.slide}>
        <div className={styles.slideInner}>
          <div className={styles.eyebrow}>Traction</div>
          <h2 className={styles.h2}>
            Six buildings live.<br /><em>And a pipeline.</em>
          </h2>
          <div className={styles.tractionGrid}>
            <div className={styles.tractionStat}>
              <div className={styles.tractionNum}>6</div>
              <div className={styles.tractionLbl}>Partner Buildings Live</div>
              <div className={styles.tractionSub}>Aspire Post Oak · The Driscoll · Market Square Tower · Parkside · Elev8 · Hanover Autry Park</div>
            </div>
            <div className={styles.tractionStat}>
              <div className={styles.tractionNum}>1,800+</div>
              <div className={styles.tractionLbl}>Addressable Units in Network</div>
              <div className={styles.tractionSub}>Across 6 luxury Houston towers</div>
            </div>
            <div className={styles.tractionStat}>
              <div className={styles.tractionNum}>10</div>
              <div className={styles.tractionLbl}>Buildings in Pipeline</div>
              <div className={styles.tractionSub}>Letters of interest signed; launch within 90 days</div>
            </div>
            <div className={styles.tractionStat}>
              <div className={styles.tractionNum}>0 → 100%</div>
              <div className={styles.tractionLbl}>Property Acceptance Rate</div>
              <div className={styles.tractionSub}>Every building we&apos;ve pitched has signed</div>
            </div>
          </div>
          <div className={styles.tractionFootnote}>
            Member metrics (MRR · active subs · retention) available under NDA.
          </div>
        </div>
      </section>

      {/* 08 — UNIT ECONOMICS */}
      <section id="unit-economics" className={styles.slide}>
        <div className={styles.slideInner}>
          <div className={styles.eyebrow}>Unit Economics</div>
          <h2 className={styles.h2}>
            The math<br /><em>that makes this obvious.</em>
          </h2>
          <div className={styles.ueGrid}>
            {[
              { lbl: 'Avg Revenue Per Member', val: '$180/mo',  sub: 'Blended across 3 categories' },
              { lbl: 'Gross Margin',           val: '40%',      sub: 'After product + cold-chain logistics' },
              { lbl: 'CAC',                    val: '$35',      sub: 'Building-direct · no paid acquisition' },
              { lbl: 'Contribution / mo',      val: '$72',      sub: 'Per active member, after gross margin' },
              { lbl: 'Payback Period',         val: '< 1 mo',   sub: 'CAC recovered in first delivery cycle' },
              { lbl: 'Projected LTV',          val: '$2,160',   sub: '12-month avg retention × ARPU' },
              { lbl: 'LTV : CAC',              val: '62 : 1',   sub: 'Best-in-class for DTC food subscription' },
              { lbl: 'Target Monthly Churn',   val: '4–6%',     sub: 'In line with luxury subscription benchmarks' },
            ].map((m, i) => (
              <div key={i} className={styles.ueCard}>
                <div className={styles.ueVal}>{m.val}</div>
                <div className={styles.ueLbl}>{m.lbl}</div>
                <div className={styles.ueSub}>{m.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 09 — BUSINESS MODEL */}
      <section id="model" className={styles.slide}>
        <div className={styles.slideInner}>
          <div className={styles.eyebrow}>Business Model</div>
          <h2 className={styles.h2}>
            Three revenue lines.<br /><em>One subscription engine.</em>
          </h2>
          <div className={styles.modelGrid}>
            <div className={styles.modelCard}>
              <div className={styles.modelPercent}>72%</div>
              <div className={styles.modelTitle}>Member Subscription</div>
              <div className={styles.modelBody}>
                Weekly recurring · whole-animal utilization across three tiers:
                <br /><br />
                <strong>Steak</strong> $25–115/wk · <strong>Slow Cook</strong> $35–85/wk · <strong>Daily Essentials</strong> $15–40/wk.
                <br /><br />
                Blended ARPU: <strong>$180/mo</strong> per member.
              </div>
            </div>
            <div className={styles.modelCard}>
              <div className={styles.modelPercent}>18%</div>
              <div className={styles.modelTitle}>Property Partnership</div>
              <div className={styles.modelBody}>
                Optional B2B tier where buildings sponsor delivery as a luxury amenity. Adds revenue, increases penetration.
              </div>
            </div>
            <div className={styles.modelCard}>
              <div className={styles.modelPercent}>10%</div>
              <div className={styles.modelTitle}>Rancher Distribution</div>
              <div className={styles.modelBody}>
                We distribute small-batch ranchers&apos; product with their name attached. Markup + content + brand.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 10 — COMPETITION */}
      <section id="competition" className={styles.slide}>
        <div className={styles.slideInner}>
          <div className={styles.eyebrow}>Competition</div>
          <h2 className={styles.h2}>
            Nobody is solving<br /><em>this exact problem.</em>
          </h2>
          <div className={styles.compMatrix}>
            <div className={styles.compYAxis}>Quality →</div>
            <div className={styles.compXAxis}>Convenience →</div>
            <div className={`${styles.compDot} ${styles.compUs}`} style={{ left: '78%', bottom: '78%' }}>
              <span>Automatic Cow</span>
            </div>
            <div className={styles.compDot} style={{ left: '20%', bottom: '70%' }}>
              <span>Local Butcher</span>
            </div>
            <div className={styles.compDot} style={{ left: '55%', bottom: '40%' }}>
              <span>Crowd Cow</span>
            </div>
            <div className={styles.compDot} style={{ left: '75%', bottom: '22%' }}>
              <span>Costco / HEB</span>
            </div>
            <div className={styles.compDot} style={{ left: '35%', bottom: '15%' }}>
              <span>Grocery DTC</span>
            </div>
          </div>
          <div className={styles.compMoats}>
            <span><strong>Moat 1:</strong> Whole-animal economics — premium steaks subsidise daily essentials</span>
            <span><strong>Moat 2:</strong> Building partnerships — exclusive concierge access</span>
            <span><strong>Moat 3:</strong> Saturday cold-chain network optimised for one city</span>
            <span><strong>Moat 4:</strong> Direct rancher relationships at small scale</span>
          </div>
        </div>
      </section>

      {/* 11 — GO TO MARKET */}
      <section id="gtm" className={styles.slide}>
        <div className={styles.slideInner}>
          <div className={styles.eyebrow}>Go-to-Market</div>
          <h2 className={styles.h2}>
            Buildings, not billboards.<br /><em>$0 paid acquisition.</em>
          </h2>
          <div className={styles.gtmFlow}>
            <div className={styles.gtmPhase}>
              <div className={styles.gtmTag}>Phase 1 · Months 0–18</div>
              <div className={styles.gtmCity}>Houston</div>
              <div className={styles.gtmTarget}>32 buildings · 9,600 addressable units</div>
            </div>
            <div className={styles.gtmArrow}>→</div>
            <div className={styles.gtmPhase}>
              <div className={styles.gtmTag}>Phase 2 · Months 12–30</div>
              <div className={styles.gtmCity}>Dallas + Austin</div>
              <div className={styles.gtmTarget}>+62 buildings · +18,000 units</div>
            </div>
            <div className={styles.gtmArrow}>→</div>
            <div className={styles.gtmPhase}>
              <div className={styles.gtmTag}>Phase 3 · Year 3</div>
              <div className={styles.gtmCity}>Top 10 Luxury Metros</div>
              <div className={styles.gtmTarget}>Miami · LA · NYC · Chicago · Atlanta · Seattle · Denver</div>
            </div>
          </div>
          <p className={styles.lead} style={{ marginTop: 32 }}>
            Channel: <strong>building-direct partnerships</strong>. Property managers want amenities;
            we&apos;re free for them, revenue for us. CAC stays under $50 indefinitely.
          </p>
        </div>
      </section>

      {/* 12 — ROADMAP */}
      <section id="roadmap" className={styles.slide}>
        <div className={styles.slideInner}>
          <div className={styles.eyebrow}>Roadmap</div>
          <h2 className={styles.h2}>
            What we&apos;re building<br /><em>in the next 24 months.</em>
          </h2>
          <div className={styles.roadmap}>
            {[
              { q: 'Q1 2026', items: ['6 buildings live', 'Steak category fully operational', 'First 200 members'] },
              { q: 'Q2 2026', items: ['Slow Cook + Daily categories launch', '15 buildings', '750+ members'] },
              { q: 'Q3 2026', items: ['Property partnership program', '25 buildings', 'First rancher pilot live'] },
              { q: 'Q4 2026', items: ['30 buildings (Houston saturation)', '$200K MRR target', 'Hiring: ops lead, GM Dallas'] },
              { q: '2027',    items: ['Dallas + Austin launch', 'Mobile app', '$1M ARR'] },
              { q: '2028',    items: ['Top 5 metro expansion', '$5M ARR', 'Series A'] },
            ].map(p => (
              <div key={p.q} className={styles.roadmapRow}>
                <div className={styles.roadmapQ}>{p.q}</div>
                <ul className={styles.roadmapItems}>
                  {p.items.map(i => <li key={i}>{i}</li>)}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 13 — TEAM */}
      <section id="team" className={styles.slide}>
        <div className={styles.slideInner}>
          <div className={styles.eyebrow}>Team</div>
          <h2 className={styles.h2}>
            The operators<br /><em>behind the brand.</em>
          </h2>
          <div className={styles.teamGrid}>
            <div className={styles.teamCard}>
              <div className={styles.teamAvatar}>D</div>
              <div className={styles.teamName}>Dipendra Sharesta</div>
              <div className={styles.teamRole}>Founder &amp; CEO</div>
              <div className={styles.teamBio}>[Background — prior ventures, exits, relevant industry experience.]</div>
            </div>
            <div className={styles.teamCard}>
              <div className={styles.teamAvatar}>+</div>
              <div className={styles.teamName}>Operations Lead</div>
              <div className={styles.teamRole}>Hiring · Q2 2026</div>
              <div className={styles.teamBio}>Cold-chain logistics &amp; multi-site fulfilment.</div>
            </div>
            <div className={styles.teamCard}>
              <div className={styles.teamAvatar}>+</div>
              <div className={styles.teamName}>Advisor</div>
              <div className={styles.teamRole}>DTC Food &amp; Subscription</div>
              <div className={styles.teamBio}>[Advisor profile — name + 1-liner credibility.]</div>
            </div>
          </div>
          <div className={styles.teamFootnote}>
            Edit team slide before sending: replace founder name, bio, and advisor.
          </div>
        </div>
      </section>

      {/* 14 — THE ASK */}
      <section id="ask" className={styles.slide}>
        <div className={styles.slideInner}>
          <div className={styles.eyebrow}>The Ask</div>
          <h2 className={styles.h2}>
            $1.2M Seed.<br /><em>18 months. 30 buildings.</em>
          </h2>
          <div className={styles.askGrid}>
            <div className={styles.askBig}>
              <div className={styles.askLbl}>Raising</div>
              <div className={styles.askVal}>$1.2M</div>
              <div className={styles.askSub}>SAFE · post-money cap negotiable</div>
            </div>
            <div className={styles.askUse}>
              <div className={styles.askUseTitle}>Use of Funds</div>
              {[
                { pct: 40, lbl: 'Operations · cold chain · warehouse' },
                { pct: 25, lbl: 'Sales &amp; partnerships team' },
                { pct: 20, lbl: 'Product &amp; engineering' },
                { pct: 15, lbl: 'Inventory &amp; working capital' },
              ].map(u => (
                <div key={u.lbl} className={styles.askRow}>
                  <span className={styles.askPct}>{u.pct}%</span>
                  <div className={styles.askBar}>
                    <div className={styles.askBarFill} style={{ width: `${u.pct}%` }} />
                  </div>
                  <span className={styles.askLblSm} dangerouslySetInnerHTML={{ __html: u.lbl }} />
                </div>
              ))}
            </div>
          </div>
          <div className={styles.askMilestones}>
            <strong>What this gets you to:</strong> 30 partner buildings · 1,500+ active members · $200K MRR · Texas-state proof of model — ready for Series A.
          </div>
        </div>
      </section>

      {/* 15 — CLOSING */}
      <section id="close" className={`${styles.slide} ${styles.closing}`}>
        <div className={styles.closingInner}>
          <div className={styles.eyebrow} style={{ color: 'var(--gold)' }}>Automatic Cow</div>
          <h2 className={styles.closingHeadline}>
            Houston eats well at home.<br /><em>Every Saturday.</em>
          </h2>
          <p className={styles.closingLead}>
            We&apos;re building the operating system for at-home luxury food in America&apos;s 20 largest metros —
            starting with the cut that matters most.
          </p>
          <div className={styles.closingContact}>
            <div>
              <div className={styles.contactLbl}>Contact</div>
              <a className={styles.contactVal} href="mailto:beef@automaticcow.com">beef@automaticcow.com</a>
            </div>
            <div>
              <div className={styles.contactLbl}>Site</div>
              <a className={styles.contactVal} href="https://automaticcow.com" target="_blank" rel="noreferrer">automaticcow.com</a>
            </div>
          </div>
          <div className={styles.closingFoot}>
            Projections illustrative · Confidential · © {new Date().getFullYear()} Automatic Cow
          </div>
        </div>
      </section>
    </div>
  )
}
