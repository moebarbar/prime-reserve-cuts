import type { Metadata } from 'next'
import Link from 'next/link'
import ArticleShell from '@/components/ArticleShell'
import { getPost } from '@/data/blog'
import { SITE } from '@/data/site'

const post = getPost('beef-cuts-explained')!

export const metadata: Metadata = {
  title: post.title,
  description: post.description,
  alternates: { canonical: `${SITE.url}/blog/${post.slug}` },
  openGraph: {
    title: post.title,
    description: post.description,
    url: `${SITE.url}/blog/${post.slug}`,
    type: 'article',
    images: [{ url: `${SITE.url}${post.hero}` }],
  },
}

export default function Page() {
  return (
    <ArticleShell post={post}>
      <p>
        Beef can feel like a different language — ribeye, sirloin, flank, brisket, chuck. But
        you only need to understand one idea: <strong>muscles that work hard are tougher and
        richer; muscles that barely move are tender.</strong> That single rule tells you how to
        cook every cut. Here&apos;s the plain-English tour of the cuts we deliver and what each
        is best for.
      </p>

      <h2>The tender steaks — cook fast, hot</h2>
      <p>
        These come from the middle of the animal, do little work, and want a hot, quick sear.
        Don&apos;t cook them past medium.
      </p>
      <ul>
        <li><strong>Filet</strong> — the most tender cut, lean and buttery. Elegant, mild,
          best simply seasoned.</li>
        <li><strong>Bone-in Ribeye</strong> — the marbled favorite. Rich, juicy, forgiving on
          the grill or in a cast-iron pan.</li>
        <li><strong>New York Strip</strong> — the classic steakhouse cut. Firm bite, big beefy
          flavor, a little leaner than ribeye.</li>
        <li><strong>Sirloin</strong> — leaner and beefy, the smart weeknight steak. Great value
          and quick.</li>
      </ul>
      <h3>How to cook them</h3>
      <p>
        Pat dry, salt well, sear hot 3–4 minutes a side, rest 5 minutes. That&apos;s it.
      </p>

      <h2>The bold, lean steaks — slice against the grain</h2>
      <p>
        Flank and skirt come from harder-working muscle: more flavor, a bit more chew. The
        secret is to cook them quick and hot, then <strong>slice thin across the grain</strong>.
      </p>
      <ul>
        <li><strong>Flank / Skirt</strong> — the fajita and stir-fry hero. Loves a marinade and
          a fast, hot cook.</li>
      </ul>

      <h2>The slow cuts — low and slow wins</h2>
      <p>
        These hard-working cuts are full of collagen that melts into richness when you give them
        time. Rushing them makes them tough; patience makes them spectacular.
      </p>
      <ul>
        <li><strong>Roasts</strong> — the Sunday pot roast. Braise low with onions and stock
          until fork-tender.</li>
        <li><strong>Brisket</strong> — the heart of Texas barbecue. Smoke or oven-braise for
          hours; it rewards every minute.</li>
      </ul>

      <h2>The everyday workhorse</h2>
      <ul>
        <li><strong>Ground Beef</strong> — burgers, tacos, bolognese, meatballs, chili. The most
          versatile thing in your fridge, and the one you&apos;ll reorder most.</li>
      </ul>

      <blockquote>
        Tender cut? Fast and hot. Tough cut? Low and slow. Get that right and you can cook
        anything.
      </blockquote>

      <h2>Building a balanced week</h2>
      <p>
        A great weekly order usually spans all three groups: a steak or two for the good nights,
        a roast or brisket for one big cook, and ground beef for everything else. Not sure on
        quantities? See <Link href="/blog/how-much-beef-per-week-family">how much beef a household
        needs per week</Link>, then <Link href="/">build your order by the pound</Link>.
      </p>
    </ArticleShell>
  )
}
