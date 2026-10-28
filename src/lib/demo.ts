// Preview-only data, used when Supabase isn't configured yet. Not real listings.
import type { Lead, Property } from './types'

const base = { city: 'Panama City', features: [], amenities: [], images: [], status: 'active' as const, featured: false, views: 0 }
const at = (d: number) => new Date(Date.now() - d * 864e5).toISOString()

export const DEMO_PROPERTIES: Property[] = [
  { ...base, id: 'demo-1', title: 'Demo · 2BR with ocean view', titleEs: 'Demo · 2 rec. con vista al mar', description: 'Demo listing for preview. Connect Supabase to see your real listings.', operation: 'rent', type: 'apartment', price: 1800, beds: 2, baths: 2, area: 110, parking: 1, location: 'punta-pacifica', furnishing: 'furnished', amenities: ['pool', 'gym', 'security'], featured: true, createdAt: at(1), updatedAt: at(1) },
  { ...base, id: 'demo-2', title: 'Demo · Family house', titleEs: 'Demo · Casa familiar', description: 'Demo listing for preview.', operation: 'sale', type: 'house', price: 420000, beds: 4, baths: 3, area: 260, parking: 2, location: 'costa-del-este', createdAt: at(3), updatedAt: at(3) },
  { ...base, id: 'demo-3', title: 'Demo · Studio near Calle 50', titleEs: 'Demo · Estudio cerca de Calle 50', description: 'Demo listing for preview.', operation: 'rent', type: 'studio', price: 950, beds: 1, baths: 1, area: 45, parking: 1, location: 'obarrio', furnishing: 'linea_blanca', createdAt: at(5), updatedAt: at(5) },
]

export const DEMO_LEADS: Lead[] = [
  { id: 'demo-l1', name: 'Demo · María', phone: '+50760000000', interest: 'rent', areas: 'Punta Pacífica', budget: '1800/month', bedrooms: '2', timeline: 'Nov 15', score: 'hot', botStage: 'human', stage: 'new', source: 'whatsapp', sofiaNotes: 'Works locally, 1 small dog, 1-year lease.', lastMessage: 'Me interesa el de Punta Pacífica', createdAt: at(0.2), updatedAt: at(0.2) },
  { id: 'demo-l2', name: 'Demo · Carlos', phone: '+50761111111', interest: 'sell', areas: 'El Cangrejo', budget: '1200/month', score: 'hot', botStage: 'human', stage: 'contacted', source: 'whatsapp', sofiaNotes: 'Owner, 1BR línea blanca, available now. Sent photos.', createdAt: at(1), updatedAt: at(1) },
]
