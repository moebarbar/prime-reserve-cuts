export interface Building {
  key: string
  name: string
  nameHtml: string
  nbhd: string
  img: string
  heroImg: string
}

export const BUILDINGS: Building[] = [
  {
    key: 'pearl',
    name: 'Pearl 21Eleven',
    nameHtml: 'Pearl<br /><em>21Eleven</em>',
    nbhd: 'Upper Kirby · Westheimer',
    img: '/pearl-21eleven.webp',
    heroImg: '/pearl-21eleven.webp',
  },
]
