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
  {
    key: 'aspire',
    name: 'Aspire Post Oak',
    nameHtml: 'Aspire<br /><em>Post Oak</em>',
    nbhd: 'Uptown · The Galleria',
    img: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=700&q=80&fit=crop&crop=center',
    heroImg: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=1400&q=80&fit=crop&crop=center',
  },
  {
    key: 'driscoll',
    name: 'The Driscoll',
    nameHtml: 'The<br /><em>Driscoll</em>',
    nbhd: 'River Oaks · 30 Stories',
    img: 'https://images.unsplash.com/photo-1555636222-cae831e670b3?w=700&q=80&fit=crop&crop=center',
    heroImg: 'https://images.unsplash.com/photo-1555636222-cae831e670b3?w=1400&q=80&fit=crop&crop=center',
  },
  {
    key: 'marketsq',
    name: 'Market Square Tower',
    nameHtml: 'Market Square<br /><em>Tower</em>',
    nbhd: 'Downtown Houston',
    img: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=700&q=80&fit=crop&crop=center',
    heroImg: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=1400&q=80&fit=crop&crop=center',
  },
  {
    key: 'parkside',
    name: 'Parkside at Discovery Green',
    nameHtml: 'Parkside<br /><em>Discovery Green</em>',
    nbhd: 'Downtown · Discovery Green',
    img: 'https://images.unsplash.com/photo-1449844908441-8829872d2607?w=700&q=80&fit=crop&crop=center',
    heroImg: 'https://images.unsplash.com/photo-1449844908441-8829872d2607?w=1400&q=80&fit=crop&crop=center',
  },
  {
    key: 'elev8',
    name: 'Elev8 Downtown',
    nameHtml: 'Elev8<br /><em>Downtown</em>',
    nbhd: 'Downtown Houston',
    img: 'https://images.unsplash.com/photo-1574362848149-11496d93a7c7?w=700&q=80&fit=crop&crop=center',
    heroImg: 'https://images.unsplash.com/photo-1574362848149-11496d93a7c7?w=1400&q=80&fit=crop&crop=center',
  },
]
