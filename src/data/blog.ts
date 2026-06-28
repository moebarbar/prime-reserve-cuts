// Blog post registry — drives the /blog index, each article's metadata, the
// sitemap, and the BlogPosting structured data. Article *content* lives in each
// page component; this file holds the metadata so everything stays in one place.

export interface Post {
  slug: string
  title: string
  description: string
  excerpt: string
  date: string // ISO (publish date)
  updated?: string
  readMins: number
  tags: string[]
  hero: string
  heroAlt: string
}

export const POSTS: Post[] = [
  {
    slug: 'how-much-beef-per-week-family',
    title: 'How Much Beef Does a Family Actually Need Per Week?',
    description:
      'A simple, no-nonsense guide to how many pounds of beef a household goes through each week — and how to size a weekly beef delivery in Houston without over- or under-ordering.',
    excerpt:
      'Two people or a family of five — here\'s how to size your weekly beef order so nothing goes to waste and you\'re never short for dinner.',
    date: '2026-06-20',
    readMins: 5,
    tags: ['Buying guide', 'Weekly delivery', 'Portioning'],
    hero: '/ribeye-raw.jpg',
    heroAlt: 'Fresh local ribeye portioned for a weekly Houston beef delivery',
  },
  {
    slug: 'where-to-buy-local-beef-houston',
    title: 'Where to Buy Local Beef in Houston (and What to Look For)',
    description:
      'From farmers markets to weekly delivery, here are the real options for buying local beef in Houston — plus what "local," "grass-fed," and "by the pound" actually mean for price and quality.',
    excerpt:
      'Farmers markets, butchers, ranch shares, or weekly delivery? A straight comparison of how to buy local beef in Houston — and what to watch for.',
    date: '2026-06-24',
    readMins: 6,
    tags: ['Local Houston', 'Buying guide', 'Sourcing'],
    hero: '/source-ranch.jpg',
    heroAlt: 'Open-pasture cattle at a Texas partner ranch supplying local beef to Houston',
  },
  {
    slug: 'beef-cuts-explained',
    title: 'Beef Cuts Explained: Which Cut for Which Meal',
    description:
      'Ribeye, sirloin, brisket, flank, ground beef — a plain-English guide to the main beef cuts, what each is best for, and how to cook them, so you order the right thing every week.',
    excerpt:
      'Steak night, Sunday roast, weeknight tacos — match the cut to the meal with this plain-English guide to the cuts we deliver.',
    date: '2026-06-27',
    readMins: 7,
    tags: ['Cuts guide', 'Cooking', 'Steak'],
    hero: '/ny-strip-raw.jpg',
    heroAlt: 'A selection of local beef cuts including New York strip, sirloin and brisket',
  },
]

export const getPost = (slug: string): Post | undefined =>
  POSTS.find(p => p.slug === slug)
