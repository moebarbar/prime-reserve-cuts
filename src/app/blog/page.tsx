import type { Metadata } from 'next'
import Link from 'next/link'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import { POSTS } from '@/data/blog'
import { SITE } from '@/data/site'
import styles from './blog.module.css'

export const metadata: Metadata = {
  title: 'The Beef Journal — Local Beef Guides for Houston',
  description:
    'Buying guides, cut guides, and cooking tips for getting the best local beef in Houston. How much beef per week, where to buy, and which cut for which meal.',
  alternates: { canonical: `${SITE.url}/blog` },
  openGraph: {
    title: 'The Beef Journal — Local Beef Guides for Houston',
    description: 'Buying guides, cut guides, and cooking tips for local beef in Houston.',
    url: `${SITE.url}/blog`,
    type: 'website',
  },
}

const fmtDate = (iso: string) =>
  new Date(iso + 'T12:00:00Z').toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  })

export default function BlogIndex() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    '@id': `${SITE.url}/blog#blog`,
    name: 'The Beef Journal',
    description:
      'Local beef buying guides, cut guides and cooking tips for Houston households.',
    url: `${SITE.url}/blog`,
    publisher: { '@type': 'Organization', name: SITE.name, url: SITE.url },
    blogPost: POSTS.map(p => ({
      '@type': 'BlogPosting',
      headline: p.title,
      description: p.description,
      datePublished: p.date,
      url: `${SITE.url}/blog/${p.slug}`,
    })),
  }

  return (
    <>
      <Nav step={1} hideSteps />
      <main className={styles.page}>
        <div className={styles.container}>
          <Link href="/" className={styles.back}>← Back to Home</Link>
          <div className={styles.eyebrow}>The Beef Journal</div>
          <h1 className={styles.indexTitle}>
            Local beef,<br /><em>explained.</em>
          </h1>
          <p className={styles.indexLead}>
            Straight-talking guides on buying, portioning, and cooking local beef in Houston —
            so every weekly order is the right one.
          </p>

          <div className={styles.grid}>
            {POSTS.map(p => (
              <Link key={p.slug} href={`/blog/${p.slug}`} className={styles.card}>
                <div className={styles.cardRow}>
                  <div
                    className={styles.cardThumb}
                    style={{ backgroundImage: `url('${p.hero}')` }}
                    role="img"
                    aria-label={p.heroAlt}
                  />
                  <div className={styles.cardBody}>
                    <div className={styles.cardTags}>{p.tags[0]}</div>
                    <h2 className={styles.cardTitle}>{p.title}</h2>
                    <p className={styles.cardExcerpt}>{p.excerpt}</p>
                    <div className={styles.cardMeta}>{fmtDate(p.date)} · {p.readMins} min read</div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>
      <Footer />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </>
  )
}
