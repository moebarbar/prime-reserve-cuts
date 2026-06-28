import type { Metadata } from 'next'
import Link from 'next/link'
import ArticleShell from '@/components/ArticleShell'
import { getPost } from '@/data/blog'
import { SITE } from '@/data/site'

const post = getPost('how-much-beef-per-week-family')!

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
        It&apos;s the first question almost everyone asks before starting a weekly beef
        delivery: <strong>how much do we actually need?</strong> Order too little and
        you&apos;re back at the store mid-week. Order too much and the freezer fills up.
        Here&apos;s a simple way to get it right.
      </p>

      <h2>The quick rule of thumb</h2>
      <p>
        A typical adult eats roughly <strong>0.5 lb of beef per beef-based meal</strong>{' '}
        (about 8 oz raw, which cooks down to a generous portion). From there it&apos;s just
        multiplication: people × beef dinners per week × half a pound.
      </p>
      <p>
        So a couple having beef three nights a week needs about{' '}
        <strong>3 lb</strong>. A family of four eating beef four nights a week lands around{' '}
        <strong>8 lb</strong>. Big eaters, teenagers, or a smoker/grill habit push it higher.
      </p>

      <h2>A simple weekly sizing table</h2>
      <table>
        <thead>
          <tr><th>Household</th><th>Beef dinners / week</th><th>Order about</th></tr>
        </thead>
        <tbody>
          <tr><td>1 person</td><td>3</td><td>1.5–2 lb</td></tr>
          <tr><td>Couple</td><td>3–4</td><td>3–4 lb</td></tr>
          <tr><td>Family of 4</td><td>4</td><td>7–8 lb</td></tr>
          <tr><td>Family of 5+</td><td>4–5</td><td>10–12 lb</td></tr>
        </tbody>
      </table>

      <h2>Mix cuts the way you actually eat</h2>
      <p>
        The trick isn&apos;t just total weight — it&apos;s the <strong>mix</strong>. A good
        default week for a family looks something like:
      </p>
      <ul>
        <li><strong>2–3 lb ground beef</strong> — tacos, burgers, pasta, the everyday workhorse.</li>
        <li><strong>2 lb steak</strong> (ribeye, New York strip, or sirloin) — one or two steak nights.</li>
        <li><strong>2–3 lb roast or brisket</strong> — one cook that stretches into leftovers and lunches.</li>
      </ul>
      <p>
        Buying <strong>by the pound</strong> makes this easy: you&apos;re not locked into fixed
        boxes, so you scale each cut to your week instead of guessing.
      </p>

      <blockquote>
        Start a little conservative your first week or two. You can always add pounds — and
        you&apos;ll quickly learn your household&apos;s real rhythm.
      </blockquote>

      <h2>What about the freezer?</h2>
      <p>
        Vacuum-sealed beef keeps beautifully: <strong>6–12 months</strong> in the freezer for
        steaks and roasts, and around <strong>4 months</strong> for ground beef. So if a week
        runs light, nothing&apos;s wasted — it just waits for next week. That&apos;s the quiet
        advantage of a steady weekly delivery over one giant bulk haul: fresh beef, sized to
        real life, with cancel-anytime flexibility.
      </p>

      <h2>The bottom line</h2>
      <p>
        Most Houston households land between <strong>3 and 10 lb a week</strong>. Pick a
        starting number, split it across ground beef, a steak, and a roast, and adjust after a
        week or two. With <Link href="/">Automatic Cow</Link> you set the pounds yourself and
        the weekly price calculates instantly — no oversized boxes, no commitment.
      </p>
    </ArticleShell>
  )
}
