import type { Metadata } from 'next'
import Link from 'next/link'
import ArticleShell from '@/components/ArticleShell'
import { getPost } from '@/data/blog'
import { SITE } from '@/data/site'

const post = getPost('where-to-buy-local-beef-houston')!

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
        Houston is a beef town, but buying <strong>local beef</strong> here isn&apos;t always
        obvious. The grocery case is mostly commodity beef trucked in from who-knows-where, and
        the labels — &quot;natural,&quot; &quot;premium,&quot; &quot;farm raised&quot; — rarely
        tell you anything real. Here are the actual ways to buy local beef in Houston, and what
        to look for with each.
      </p>

      <h2>1. Farmers markets</h2>
      <p>
        Markets like Urban Harvest and the Heights farmers market often host Texas ranchers
        selling direct. Quality can be excellent and you can talk to the person who raised the
        animal. The trade-offs: limited hours, variable selection week to week, and you have to
        go to them — every week — which is exactly the errand most people are trying to avoid.
      </p>

      <h2>2. Specialty butchers</h2>
      <p>
        A good butcher will cut to order and often knows their sourcing. You&apos;ll pay a
        premium for the counter service and you still have to make the trip. Worth it for a
        special occasion; harder to sustain as your weekly default.
      </p>

      <h2>3. A ranch share (buying a quarter or half cow)</h2>
      <p>
        Buying a quarter- or half-animal direct from a ranch gets you the best price per pound —
        if you have a chest freezer and don&apos;t mind committing to <strong>100+ pounds at
        once</strong>, paid upfront, in a fixed mix of cuts you don&apos;t get to choose. Great
        for some households; overwhelming for most.
      </p>

      <h2>4. Weekly local beef delivery</h2>
      <p>
        This is the newer option and, for most Houston households, the most practical: local
        beef from partner ranches, <strong>priced by the pound</strong>, with you choosing the
        cuts and quantity each week and it arriving at your door. No market run, no 100-lb
        commitment, no membership lock-in. It&apos;s how <Link href="/">Automatic Cow</Link>{' '}
        works — pick your cuts, set your pounds, delivered every Saturday, cancel anytime.
      </p>

      <h2>What to actually look for</h2>
      <p>
        Whichever route you choose, these are the signals that separate genuine local beef from
        marketing:
      </p>
      <ul>
        <li><strong>Named sourcing.</strong> Can they tell you the region or the ranch? Vague
          answers are a red flag.</li>
        <li><strong>USDA-inspected processing.</strong> Local doesn&apos;t mean unregulated —
          your beef should still come through a USDA-inspected facility.</li>
        <li><strong>Transparent, by-the-pound pricing.</strong> A clear price per pound beats a
          mystery box every time.</li>
        <li><strong>Whole-animal range.</strong> A real beef program offers steaks, roasts, and
          ground — not just the trophy cuts.</li>
      </ul>

      <blockquote>
        &quot;Local&quot; should mean you can trace it and you can taste the difference — not
        just a sticker on the package.
      </blockquote>

      <h2>The bottom line</h2>
      <p>
        If you love the ritual, farmers markets and butchers are wonderful. If you want great
        local beef without the weekly errand or a freezer full of cuts you didn&apos;t pick,
        weekly delivery is the easiest way to do it in Houston. See the{' '}
        <Link href="/">current cuts and per-pound pricing</Link>, or read our guide to{' '}
        <Link href="/blog/how-much-beef-per-week-family">how much beef a household needs per week</Link>.
      </p>
    </ArticleShell>
  )
}
