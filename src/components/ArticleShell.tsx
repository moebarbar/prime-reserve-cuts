import Link from 'next/link'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import { SITE } from '@/data/site'
import type { Post } from '@/data/blog'
import styles from '@/app/blog/blog.module.css'

const fmtDate = (iso: string) =>
  new Date(iso + 'T12:00:00Z').toLocaleDateString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric',
  })

export default function ArticleShell({
  post,
  children,
}: {
  post: Post
  children: React.ReactNode
}) {
  const url = `${SITE.url}/blog/${post.slug}`

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BlogPosting',
        headline: post.title,
        description: post.description,
        datePublished: post.date,
        dateModified: post.updated ?? post.date,
        image: `${SITE.url}${post.hero}`,
        author: { '@type': 'Organization', name: SITE.name, url: SITE.url },
        publisher: {
          '@type': 'Organization',
          name: SITE.name,
          logo: { '@type': 'ImageObject', url: `${SITE.url}/logo.png` },
        },
        mainEntityOfPage: { '@type': 'WebPage', '@id': url },
        keywords: post.tags.join(', '),
        articleSection: 'Beef guides',
        isPartOf: { '@type': 'Blog', '@id': `${SITE.url}/blog#blog` },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: SITE.url },
          { '@type': 'ListItem', position: 2, name: 'Blog', item: `${SITE.url}/blog` },
          { '@type': 'ListItem', position: 3, name: post.title, item: url },
        ],
      },
    ],
  }

  return (
    <>
      <Nav step={1} hideSteps />
      <article className={styles.page}>
        <div className={styles.container}>
          <Link href="/blog" className={styles.back}>← All articles</Link>

          <header className={styles.articleHead}>
            <div className={styles.eyebrow}>{post.tags[0]}</div>
            <h1 className={styles.title}>{post.title}</h1>
            <div className={styles.meta}>
              <span>{fmtDate(post.date)}</span>
              <span className={styles.metaDot} />
              <span>{post.readMins} min read</span>
              <span className={styles.metaDot} />
              <span>Houston · Local Beef</span>
            </div>
            <img className={styles.heroImg} src={post.hero} alt={post.heroAlt} />
          </header>

          <div className={styles.prose}>{children}</div>

          <div className={styles.cta}>
            <div className={styles.ctaTitle}>Local beef, delivered every Saturday</div>
            <div className={styles.ctaText}>
              Pick your cuts, set your pounds, and we handle the rest. Priced by the pound. Cancel anytime.
            </div>
            <Link href="/" className={styles.ctaBtn}>Start your weekly order →</Link>
          </div>
        </div>
      </article>
      <Footer />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </>
  )
}
