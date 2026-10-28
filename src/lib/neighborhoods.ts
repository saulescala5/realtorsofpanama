// Neighborhood guides. Coordinates are neighborhood centers (approximate), used to place
// listings that have no exact pin and to draw the map. Copy is written to sell the area
// and our knowledge of it, never with hard numbers we can't stand behind.
import type { Lang } from './types'

type L = { en: string; es: string }
export interface Neighborhood {
  slug: string
  name: string
  lat: number
  lng: number
  /** Shown as a guide page and on the home map. */
  featured: boolean
  tagline?: L
  about?: L
  highlights?: { en: string[]; es: string[] }
  bestFor?: L
}

export const NEIGHBORHOODS: Neighborhood[] = [
  {
    slug: 'punta-pacifica', name: 'Punta Pacífica', lat: 8.9792, lng: -79.5138, featured: true,
    tagline: { en: 'Ocean-view towers on the edge of the bay', es: 'Torres con vista al mar al borde de la bahía' },
    about: {
      en: 'Some of the most sought-after addresses in the city, with full-amenity towers, private hospital care and Multiplaza minutes away. Homes here rarely sit on the market for long.',
      es: 'Algunas de las direcciones más buscadas de la ciudad: torres con todas las amenidades, atención hospitalaria privada y Multiplaza a minutos. Aquí las buenas propiedades no duran en el mercado.',
    },
    highlights: { en: ['Panoramic ocean views', 'Walk to shopping and dining', 'Private hospital nearby'], es: ['Vistas panorámicas al mar', 'Compras y restaurantes a pie', 'Hospital privado cerca'] },
    bestFor: { en: 'Executives, expats and buyers who want a landmark address', es: 'Ejecutivos, expatriados y compradores que buscan una dirección emblemática' },
  },
  {
    slug: 'costa-del-este', name: 'Costa del Este', lat: 9.0105, lng: -79.4705, featured: true,
    tagline: { en: 'Planned, green and made for families', es: 'Planificada, verde y pensada para familias' },
    about: {
      en: 'Wide avenues, waterfront parks and international schools, with corporate offices next door. A favorite for families relocating to Panama who want space and calm without leaving the city.',
      es: 'Avenidas amplias, parques frente al mar y colegios internacionales, con oficinas corporativas al lado. La favorita de las familias que llegan a Panamá y quieren espacio y tranquilidad sin salir de la ciudad.',
    },
    highlights: { en: ['International schools', 'Waterfront promenade', 'Corporate hub next door'], es: ['Colegios internacionales', 'Paseo frente al mar', 'Centro corporativo al lado'] },
    bestFor: { en: 'Families and corporate relocations', es: 'Familias y reubicaciones corporativas' },
  },
  {
    slug: 'avenida-balboa', name: 'Avenida Balboa', lat: 8.9718, lng: -79.5296, featured: true,
    tagline: { en: 'The bay at your window, the city at your door', es: 'La bahía en tu ventana, la ciudad en tu puerta' },
    about: {
      en: 'High-rise living along the Cinta Costera, with bay and skyline views, running paths and quick access to the banking district and Casco Viejo.',
      es: 'Vida en altura frente a la Cinta Costera, con vistas a la bahía y al skyline, ciclovía y acceso rápido al centro bancario y al Casco Viejo.',
    },
    highlights: { en: ['Cinta Costera at your door', 'Bay and skyline views', 'Central to everything'], es: ['Cinta Costera en la puerta', 'Vistas a la bahía y al skyline', 'Céntrico para todo'] },
    bestFor: { en: 'Professionals and investors seeking views and value', es: 'Profesionales e inversionistas que buscan vista y valor' },
  },
  {
    slug: 'casco-viejo', name: 'Casco Viejo', lat: 8.9525, lng: -79.5352, featured: true,
    tagline: { en: 'Colonial streets, rooftop sunsets', es: 'Calles coloniales, atardeceres en la terraza' },
    about: {
      en: 'The historic quarter, a UNESCO World Heritage site, restored into lofts and boutique residences above the city’s best restaurants and bars. Character you cannot build new.',
      es: 'El barrio histórico, Patrimonio de la Humanidad, restaurado en lofts y residencias boutique sobre los mejores restaurantes y bares de la ciudad. Un carácter que no se puede construir de nuevo.',
    },
    highlights: { en: ['UNESCO World Heritage', 'Restored colonial lofts', 'Strong short-stay demand'], es: ['Patrimonio de la Humanidad', 'Lofts coloniales restaurados', 'Alta demanda de estadías cortas'] },
    bestFor: { en: 'Buyers who value character, and investors', es: 'Quienes valoran el carácter, e inversionistas' },
  },
  {
    slug: 'el-cangrejo', name: 'El Cangrejo', lat: 8.9935, lng: -79.5298, featured: true,
    tagline: { en: 'Walkable, central and always alive', es: 'Caminable, céntrico y siempre vivo' },
    about: {
      en: 'Cafés, Vía Argentina and the banking district within walking distance. Modern apartments at accessible prices make it one of the most requested areas for renters.',
      es: 'Cafés, la Vía Argentina y el centro bancario a pocos pasos. Apartamentos modernos a precios accesibles la convierten en una de las zonas más pedidas para alquilar.',
    },
    highlights: { en: ['Walk to work and dining', 'Accessible prices', 'High rental demand'], es: ['Trabajo y restaurantes a pie', 'Precios accesibles', 'Alta demanda de alquiler'] },
    bestFor: { en: 'Young professionals and first-time investors', es: 'Jóvenes profesionales e inversionistas primerizos' },
  },
  {
    slug: 'obarrio', name: 'Obarrio', lat: 8.9893, lng: -79.5228, featured: true,
    tagline: { en: 'Steps from Calle 50', es: 'A pasos de Calle 50' },
    about: {
      en: 'The heart of the financial district: offices, hotels and restaurants around Calle 50, with modern apartments for people who want their commute to be a short walk.',
      es: 'El corazón del distrito financiero: oficinas, hoteles y restaurantes alrededor de Calle 50, con apartamentos modernos para quien quiere ir caminando al trabajo.',
    },
    highlights: { en: ['Financial district', 'Short commutes', 'Hotels and dining'], es: ['Distrito financiero', 'Trayectos cortos', 'Hoteles y restaurantes'] },
    bestFor: { en: 'Executives and corporate rentals', es: 'Ejecutivos y alquileres corporativos' },
  },
  {
    slug: 'san-francisco', name: 'San Francisco', lat: 8.9905, lng: -79.5098, featured: true,
    tagline: { en: 'Residential calm, central location', es: 'Calma residencial, ubicación central' },
    about: {
      en: 'Leafy residential streets, Parque Omar and Multiplaza nearby, with options from family houses to new towers. A balanced choice that keeps everything close.',
      es: 'Calles residenciales arboladas, el Parque Omar y Multiplaza cerca, con opciones desde casas familiares hasta torres nuevas. Una elección equilibrada que lo tiene todo cerca.',
    },
    highlights: { en: ['Parque Omar', 'Houses and new towers', 'Close to Multiplaza'], es: ['Parque Omar', 'Casas y torres nuevas', 'Cerca de Multiplaza'] },
    bestFor: { en: 'Families and long-term renters', es: 'Familias e inquilinos de largo plazo' },
  },
  {
    slug: 'coco-del-mar', name: 'Coco del Mar', lat: 8.9858, lng: -79.5082, featured: true,
    tagline: { en: 'Quiet streets by the water', es: 'Calles tranquilas junto al mar' },
    about: {
      en: 'A low-key residential enclave between San Francisco and the coast, with boutique buildings, spacious layouts and the Cinta Costera extension nearby.',
      es: 'Un enclave residencial discreto entre San Francisco y la costa, con edificios boutique, espacios amplios y la Cinta Costera cerca.',
    },
    highlights: { en: ['Boutique buildings', 'Spacious layouts', 'Near the coast'], es: ['Edificios boutique', 'Espacios amplios', 'Cerca de la costa'] },
    bestFor: { en: 'Families wanting space close to the center', es: 'Familias que quieren espacio cerca del centro' },
  },
  {
    slug: 'paitilla', name: 'Paitilla', lat: 8.9772, lng: -79.5196, featured: true,
    tagline: { en: 'Classic prestige on the point', es: 'Prestigio clásico en la punta' },
    about: {
      en: 'An established address on the bay, with generous apartments, mature buildings and everything within minutes. Often more space for the money than newer areas.',
      es: 'Una dirección consolidada sobre la bahía, con apartamentos amplios, edificios establecidos y todo a minutos. A menudo más espacio por el mismo presupuesto que en zonas nuevas.',
    },
    highlights: { en: ['Generous floor plans', 'Bay views', 'Established community'], es: ['Plantas amplias', 'Vistas a la bahía', 'Comunidad establecida'] },
    bestFor: { en: 'Buyers looking for space and location', es: 'Compradores que buscan espacio y ubicación' },
  },
  {
    slug: 'santa-maria', name: 'Santa María', lat: 9.0335, lng: -79.4745, featured: true,
    tagline: { en: 'Golf, privacy and space', es: 'Golf, privacidad y espacio' },
    about: {
      en: 'A gated golf community with large houses, low-rise residences and a country-club lifestyle, close to Costa del Este and its schools.',
      es: 'Una comunidad cerrada con campo de golf, casas grandes, residencias de baja altura y estilo de vida de club, cerca de Costa del Este y sus colegios.',
    },
    highlights: { en: ['Golf course community', 'Gated and private', 'Large family homes'], es: ['Comunidad de golf', 'Cerrada y privada', 'Casas familiares amplias'] },
    bestFor: { en: 'Families and luxury buyers', es: 'Familias y compradores de lujo' },
  },
  {
    slug: 'clayton', name: 'Clayton', lat: 9.0005, lng: -79.5795, featured: true,
    tagline: { en: 'Green living in the former Canal Zone', es: 'Vida verde en la antigua Zona del Canal' },
    about: {
      en: 'Houses surrounded by rainforest, the City of Knowledge and international schools, fifteen minutes from the city. Quiet, safe and very popular with diplomats and families.',
      es: 'Casas rodeadas de selva, la Ciudad del Saber y colegios internacionales, a quince minutos de la ciudad. Tranquila, segura y muy buscada por diplomáticos y familias.',
    },
    highlights: { en: ['Houses with gardens', 'Near the Canal', 'International schools'], es: ['Casas con jardín', 'Cerca del Canal', 'Colegios internacionales'] },
    bestFor: { en: 'Families, diplomats and nature lovers', es: 'Familias, diplomáticos y amantes de la naturaleza' },
  },
  {
    slug: 'panama-pacifico', name: 'Panamá Pacífico', lat: 8.9145, lng: -79.5995, featured: true,
    tagline: { en: 'A planned city across the Canal', es: 'Una ciudad planificada al otro lado del Canal' },
    about: {
      en: 'A master-planned community on the former Howard base, with parks, schools and a special economic area. Newer homes and a growing community at accessible prices.',
      es: 'Una comunidad planificada en la antigua base de Howard, con parques, colegios y un área económica especial. Viviendas nuevas y una comunidad en crecimiento a precios accesibles.',
    },
    highlights: { en: ['Master-planned community', 'Newer homes', 'Room to grow'], es: ['Comunidad planificada', 'Viviendas nuevas', 'Espacio para crecer'] },
    bestFor: { en: 'Families and long-term investors', es: 'Familias e inversionistas de largo plazo' },
  },
  { slug: 'marbella', name: 'Marbella', lat: 8.9822, lng: -79.5246, featured: false },
  { slug: 'bella-vista', name: 'Bella Vista', lat: 8.9832, lng: -79.5302, featured: false },
  { slug: 'punta-paitilla', name: 'Punta Paitilla', lat: 8.9765, lng: -79.5205, featured: false },
  { slug: 'carrasquilla', name: 'Carrasquilla', lat: 9.0002, lng: -79.5168, featured: false },
  { slug: 'via-espana', name: 'Vía España', lat: 8.9955, lng: -79.5200, featured: false },
  { slug: 'albrook', name: 'Albrook', lat: 8.9748, lng: -79.5558, featured: false },
  { slug: 'condado-del-rey', name: 'Condado del Rey', lat: 9.0392, lng: -79.5282, featured: false },
  { slug: 'villa-lucre', name: 'Villa Lucre', lat: 9.0695, lng: -79.4870, featured: false },
  { slug: 'brisas-del-golf', name: 'Brisas del Golf', lat: 9.0605, lng: -79.4620, featured: false },
  { slug: 'parque-lefevre', name: 'Parque Lefevre', lat: 9.0035, lng: -79.4998, featured: false },
  { slug: 'costa-sur', name: 'Costa Sur', lat: 9.0172, lng: -79.4545, featured: false },
  { slug: 'coronado', name: 'Coronado', lat: 8.5280, lng: -79.8930, featured: false },
  { slug: 'boquete', name: 'Boquete', lat: 8.7800, lng: -82.4410, featured: false },
]

export const hood = (slug: string) => NEIGHBORHOODS.find((n) => n.slug === slug)
export const tr = (l: L | undefined, lang: Lang) => (l ? l[lang] : '')
