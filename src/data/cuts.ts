export interface Cut {
  name: string
  grade: string
  detail: string
  weight: string
  pricePerWeek: number
  qtyPerWeek: string
  img: string
}

export const CUTS: Cut[] = [
  {
    name: 'NY Strip',
    grade: 'USDA Prime',
    detail: 'Center-cut New York Strip · Bold, beefy, perfect sear',
    weight: '14 oz (397g)',
    pricePerWeek: 49,
    qtyPerWeek: '1 steak per week',
    img: 'https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=240&q=75&fit=crop&crop=center',
  },
  {
    name: 'Tenderloin',
    grade: 'USDA Prime',
    detail: 'Center-cut Filet Mignon · The most tender cut, silky clean',
    weight: '8 oz (227g)',
    pricePerWeek: 59,
    qtyPerWeek: '1 steak per week',
    img: 'https://images.unsplash.com/photo-1588168333986-5078d3ae3976?w=240&q=75&fit=crop&crop=center',
  },
  {
    name: 'Ribeye',
    grade: 'USDA Prime',
    detail: 'Bone-in Ribeye · Rich marbling, buttery char',
    weight: '16 oz (454g)',
    pricePerWeek: 55,
    qtyPerWeek: '1 steak per week',
    img: 'https://images.unsplash.com/photo-1600891964092-4316c288032e?w=240&q=75&fit=crop&crop=center',
  },
]
