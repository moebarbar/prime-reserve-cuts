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
    key: 'aspire',
    name: 'Aspire Post Oak',
    nameHtml: 'Aspire<br /><em>Post Oak</em>',
    nbhd: 'Uptown · The Galleria',
    img: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=700&q=72&fit=crop&crop=center',
    heroImg: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1400&q=80&fit=crop&crop=center',
  },
  {
    key: 'driscoll',
    name: 'The Driscoll',
    nameHtml: 'The<br /><em>Driscoll</em>',
    nbhd: 'River Oaks · 30 Stories',
    img: 'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=700&q=72&fit=crop&crop=center',
    heroImg: 'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=1400&q=80&fit=crop&crop=center',
  },
  {
    key: 'marketsq',
    name: 'Market Square Tower',
    nameHtml: 'Market Square<br /><em>Tower</em>',
    nbhd: 'Downtown Houston',
    img: 'https://images.unsplash.com/photo-1464082354059-27db6ce50048?w=700&q=72&fit=crop&crop=center',
    heroImg: 'https://images.unsplash.com/photo-1464082354059-27db6ce50048?w=1400&q=80&fit=crop&crop=center',
  },
  {
    key: 'parkside',
    name: 'Parkside at Discovery Green',
    nameHtml: 'Parkside<br /><em>Discovery Green</em>',
    nbhd: 'Downtown · Discovery Green',
    img: 'https://images.unsplash.com/photo-1480074568708-e7b720bb3f09?w=700&q=72&fit=crop&crop=center',
    heroImg: 'https://images.unsplash.com/photo-1480074568708-e7b720bb3f09?w=1400&q=80&fit=crop&crop=center',
  },
  {
    key: 'elev8',
    name: 'Elev8 Downtown',
    nameHtml: 'Elev8<br /><em>Downtown</em>',
    nbhd: 'Downtown Houston',
    img: 'https://images.unsplash.com/photo-1507089947368-19c1da9775ae?w=700&q=72&fit=crop&crop=center',
    heroImg: 'https://images.unsplash.com/photo-1507089947368-19c1da9775ae?w=1400&q=80&fit=crop&crop=center',
  },
  {
    key: 'autrypark',
    name: 'Hanover Autry Park',
    nameHtml: 'Hanover<br /><em>Autry Park</em>',
    nbhd: 'Montrose · Autry Park',
    img: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=700&q=72&fit=crop&crop=center',
    heroImg: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1400&q=80&fit=crop&crop=center',
  },
]
