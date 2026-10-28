// Realtors of Panama market reading per neighborhood: typical ranges from what we see
// asked and closed, not official statistics. Shown on the site as ranges, labeled as estimates.
import type { SpotName } from '@/components/icons'

type L = { en: string; es: string }
export interface HoodMarket {
  rent2br: [number, number] // USD / month, typical 2-bedroom
  saleM2: [number, number] // USD per m², resale apartments
  demand: 'very-high' | 'high' | 'steady'
  toCalle50: number // minutes by car, off-peak
  walk: 1 | 2 | 3 // 1 car-first, 3 very walkable
  vibe: Tag[]
  gallery: string[]
  spots: { icon: SpotName; name: string; note: L }[]
}
export type Tag = 'ocean' | 'family' | 'walkable' | 'green' | 'historic' | 'value' | 'luxury' | 'nightlife'

export const TAGS: Record<Tag, L & { icon: SpotName }> = {
  ocean: { en: 'Ocean views', es: 'Vista al mar', icon: 'wave' },
  family: { en: 'Family life', es: 'Vida familiar', icon: 'family' },
  walkable: { en: 'Walkable', es: 'Caminable', icon: 'cup' },
  green: { en: 'Green & quiet', es: 'Verde y tranquilo', icon: 'leaf' },
  historic: { en: 'Historic charm', es: 'Encanto histórico', icon: 'building' },
  value: { en: 'Best value', es: 'Mejor precio', icon: 'coins' },
  luxury: { en: 'Luxury', es: 'Lujo', icon: 'key' },
  nightlife: { en: 'Going out', es: 'Vida nocturna', icon: 'sun' },
}

const s = (icon: SpotName, name: string, en: string, es: string) => ({ icon, name, note: { en, es } })

export const MARKET: Record<string, HoodMarket> = {
  'punta-pacifica': {
    rent2br: [1800, 3200], saleM2: [2200, 3500], demand: 'very-high', toCalle50: 10, walk: 2, vibe: ['ocean', 'luxury'],
    gallery: ['/hoods/hood-punta-pacifica.jpg', '/life/life-32.jpg', '/life/life-01.jpg'],
    spots: [s('school', 'Pacífica Salud hospital', 'Private hospital in the neighborhood', 'Hospital privado en la zona'), s('bag', 'Multiplaza', 'The city’s main mall, minutes away', 'El mall principal, a minutos'), s('wave', 'Bay waterfront', 'Morning walks by the water', 'Caminatas frente al mar'), s('building', 'Full-amenity towers', 'Pools, gyms and 24/7 security', 'Piscinas, gimnasios y seguridad 24/7')],
  },
  'costa-del-este': {
    rent2br: [1800, 3000], saleM2: [2000, 3000], demand: 'very-high', toCalle50: 20, walk: 2, vibe: ['family', 'green', 'luxury'],
    gallery: ['/hoods/hood-costa-del-este.jpg', '/life/life-02.jpg', '/life/life-30.jpg'],
    spots: [s('leaf', 'Parque Costa del Este', 'Waterfront park with trails and play areas', 'Parque frente al mar con senderos y juegos'), s('school', 'International schools', 'Several bilingual schools nearby', 'Varios colegios bilingües cerca'), s('building', 'Corporate offices', 'Multinationals next door', 'Multinacionales al lado'), s('bag', 'Town Center', 'Shopping, cinema and restaurants', 'Compras, cine y restaurantes')],
  },
  'avenida-balboa': {
    rent2br: [1400, 2500], saleM2: [1800, 2800], demand: 'high', toCalle50: 8, walk: 3, vibe: ['ocean', 'walkable', 'value'],
    gallery: ['/hoods/hood-avenida-balboa.jpg', '/life/life-11.jpg', '/life/life-10.jpg'],
    spots: [s('wave', 'Cinta Costera', 'Miles of bay promenade for running and biking', 'Kilómetros de paseo para correr y pedalear'), s('cup', 'Mercado de Mariscos', 'Fresh ceviche by the water', 'Ceviche fresco frente al mar'), s('car', 'Central location', 'Close to the banking district and old town', 'Cerca del centro bancario y del casco'), s('building', 'Bay-view towers', 'Some of the best views for the price', 'De las mejores vistas por el precio')],
  },
  'casco-viejo': {
    rent2br: [1500, 3000], saleM2: [2800, 4500], demand: 'high', toCalle50: 15, walk: 3, vibe: ['historic', 'walkable', 'nightlife'],
    gallery: ['/hoods/hood-casco-viejo.jpg', '/life/life-33.jpg', '/life/life-35.jpg', '/life/life-36.jpg'],
    spots: [s('building', 'Plaza de Francia', 'Colonial plazas and sea walls', 'Plazas coloniales y murallas'), s('cup', 'Rooftop bars', 'The city’s best sunsets and dining', 'Los mejores atardeceres y restaurantes'), s('palm', 'UNESCO heritage', 'Restored buildings with character', 'Edificios restaurados con carácter'), s('wave', 'Cinta Costera 3', 'Ocean road around the old town', 'Vía costera alrededor del casco')],
  },
  'el-cangrejo': {
    rent2br: [900, 1500], saleM2: [1500, 2200], demand: 'high', toCalle50: 7, walk: 3, vibe: ['walkable', 'value', 'nightlife'],
    gallery: ['/hoods/hood-el-cangrejo.jpg', '/life/life-12.jpg', '/life/life-18.jpg'],
    spots: [s('cup', 'Vía Argentina', 'Cafés, bakeries and restaurants on foot', 'Cafés, panaderías y restaurantes a pie'), s('leaf', 'Parque Andrés Bello', 'Neighborhood park with weekend life', 'Parque de barrio con vida el fin de semana'), s('car', 'Metro Line 1', 'Easy access across the city', 'Fácil acceso a toda la ciudad'), s('coins', 'Great rental yields', 'Popular with young professionals', 'Muy buscado por jóvenes profesionales')],
  },
  obarrio: {
    rent2br: [1000, 1700], saleM2: [1600, 2400], demand: 'high', toCalle50: 3, walk: 3, vibe: ['walkable', 'value'],
    gallery: ['/hoods/hood-obarrio.jpg', '/life/life-20.jpg', '/life/life-21.jpg'],
    spots: [s('building', 'Calle 50', 'The banking and business district', 'El distrito bancario y de negocios'), s('cup', 'After-work spots', 'Restaurants and bars around the offices', 'Restaurantes y bares junto a las oficinas'), s('car', 'Walk to work', 'Skip traffic entirely', 'Olvídate del tráfico'), s('key', 'Corporate rentals', 'Furnished units in high demand', 'Unidades amobladas muy buscadas')],
  },
  'san-francisco': {
    rent2br: [1000, 1800], saleM2: [1600, 2500], demand: 'high', toCalle50: 10, walk: 2, vibe: ['family', 'walkable', 'value'],
    gallery: ['/hoods/hood-san-francisco.jpg', '/life/life-25.jpg', '/life/life-13.jpg'],
    spots: [s('leaf', 'Parque Omar', 'The city’s big park: trails, pool and sports', 'El gran parque: senderos, piscina y deportes'), s('bag', 'Multiplaza', 'Mall and cinemas nearby', 'Mall y cines cerca'), s('cup', 'Local restaurants', 'Neighborhood spots, not tourist traps', 'Restaurantes de barrio de verdad'), s('family', 'Family streets', 'Mix of houses and mid-rise buildings', 'Mezcla de casas y edificios medianos')],
  },
  'coco-del-mar': {
    rent2br: [1200, 2000], saleM2: [1800, 2600], demand: 'steady', toCalle50: 12, walk: 2, vibe: ['family', 'green', 'ocean'],
    gallery: ['/hoods/hood-coco-del-mar.jpg', '/life/life-28.jpg', '/life/life-25.jpg'],
    spots: [s('wave', 'Coastline', 'Quiet streets close to the water', 'Calles tranquilas cerca del mar'), s('leaf', 'Parque Omar', 'A short drive or bike ride', 'A pocos minutos en carro o bici'), s('building', 'Boutique buildings', 'Fewer units per floor, more privacy', 'Menos unidades por piso, más privacidad'), s('family', 'Residential calm', 'Low traffic, leafy blocks', 'Poco tráfico, cuadras arboladas')],
  },
  paitilla: {
    rent2br: [1300, 2400], saleM2: [1700, 2600], demand: 'high', toCalle50: 7, walk: 3, vibe: ['ocean', 'walkable', 'value'],
    gallery: ['/hoods/hood-paitilla.jpg', '/life/life-32.jpg', '/life/life-11.jpg'],
    spots: [s('wave', 'Cinta Costera', 'Start of the bay promenade', 'Inicio del paseo de la bahía'), s('building', 'Established towers', 'Larger floor plans than new builds', 'Plantas más amplias que lo nuevo'), s('bag', 'Everything nearby', 'Supermarkets, pharmacies and banks', 'Supermercados, farmacias y bancos'), s('school', 'Hospitals close', 'Top private care minutes away', 'Atención privada a minutos')],
  },
  'santa-maria': {
    rent2br: [2500, 4500], saleM2: [2800, 4500], demand: 'steady', toCalle50: 25, walk: 1, vibe: ['luxury', 'family', 'green'],
    gallery: ['/hoods/hood-santa-maria.jpg', '/life/life-08.jpg', '/life/life-30.jpg'],
    spots: [s('leaf', 'Golf & country club', 'Fairways, clubhouse and courts', 'Campo, club y canchas'), s('verified', 'Gated community', 'Controlled access and security', 'Acceso controlado y seguridad'), s('family', 'Space for families', 'Large homes and low-rise buildings', 'Casas grandes y edificios bajos'), s('car', 'Corridor access', 'Quick to the airport and Costa del Este', 'Rápido al aeropuerto y Costa del Este')],
  },
  clayton: {
    rent2br: [1500, 3000], saleM2: [1600, 2600], demand: 'steady', toCalle50: 20, walk: 1, vibe: ['green', 'family'],
    gallery: ['/hoods/hood-clayton.jpg', '/life/life-07.jpg', '/life/life-31.jpg'],
    spots: [s('school', 'Ciudad del Saber', 'Campus, schools and NGOs', 'Campus, colegios y ONGs'), s('leaf', 'Rainforest next door', 'Trails, birds and fresh air', 'Senderos, aves y aire fresco'), s('palm', 'Canal area', 'Near the Miraflores locks', 'Cerca de las esclusas de Miraflores'), s('family', 'Houses with yards', 'Former Canal Zone homes', 'Casas de la antigua Zona del Canal')],
  },
  'panama-pacifico': {
    rent2br: [1300, 2200], saleM2: [1300, 2000], demand: 'steady', toCalle50: 25, walk: 2, vibe: ['family', 'green', 'value'],
    gallery: ['/hoods/hood-panama-pacifico.jpg', '/life/life-09.jpg', '/life/life-02.jpg'],
    spots: [s('family', 'Planned community', 'Parks, bike paths and schools', 'Parques, ciclovías y colegios'), s('building', 'Special economic area', 'Companies and jobs on site', 'Empresas y empleos en la zona'), s('wave', 'Beaches close', 'Veracruz beach a short drive away', 'Playa Veracruz a pocos minutos'), s('home', 'Newer homes', 'Townhouses and houses with yards', 'Townhouses y casas con patio')],
  },
}

export const money = (n: number) => (n >= 1000 ? `$${(n / 1000).toFixed(n % 1000 ? 1 : 0)}K` : `$${n}`)
export const range = ([a, b]: [number, number]) => `$${a.toLocaleString('en-US')}–${b.toLocaleString('en-US')}`
