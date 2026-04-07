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
    img: 'https://images.unsplash.com/photo-1600891964092-4316c288032e?w=240&q=75&fit=crop&crop=center',
  },
  {
    name: 'Filet Mignon',
    grade: 'USDA Prime',
    detail: '8oz center-cut tenderloin',
    price: 119,
    img: 'https://images.unsplash.com/photo-1588168333986-5078d3ae3976?w=240&q=75&fit=crop&crop=center',
  },
  {
    name: 'A5 Wagyu',
    grade: 'A5 Wagyu',
    detail: '12oz Japanese Miyazaki striploin',
    price: 189,
    img: 'https://images.unsplash.com/photo-1558030006-450675393462?w=240&q=75&fit=crop&crop=center',
  },
  {
    name: 'Tomahawk',
    grade: 'Heritage',
    detail: '40oz long-bone cowboy cut',
    price: 229,
    img: 'https://images.unsplash.com/photo-1611564494260-6f21b80af7ea?w=240&q=75&fit=crop&crop=center',
  },
]
