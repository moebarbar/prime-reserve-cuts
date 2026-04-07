export interface Cut {
  name: string
  grade: string
  detail: string
  price: number
  img: string
}

export const CUTS: Cut[] = [
  {
    name: 'Ribeye',
    grade: 'USDA Prime',
    detail: '16oz bone-in · 21-day dry-aged',
    price: 89,
    img: 'https://images.unsplash.com/photo-1565299507177-b0ac66763828?w=240&q=80&fit=crop&crop=center',
  },
  {
    name: 'Filet Mignon',
    grade: 'USDA Prime',
    detail: '8oz center-cut tenderloin',
    price: 119,
    img: 'https://images.unsplash.com/photo-1432139509613-5c4255815697?w=240&q=80&fit=crop&crop=center',
  },
  {
    name: 'A5 Wagyu',
    grade: 'A5 Wagyu',
    detail: '12oz Japanese Miyazaki striploin',
    price: 189,
    img: 'https://images.unsplash.com/photo-1570197788417-0e82375c9371?w=240&q=80&fit=crop&crop=center',
  },
  {
    name: 'Tomahawk',
    grade: 'Heritage',
    detail: '40oz long-bone cowboy cut',
    price: 229,
    img: 'https://images.unsplash.com/photo-1562802378-063ec186a863?w=240&q=80&fit=crop&crop=center',
  },
]
