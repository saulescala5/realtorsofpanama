// Domain model. Mirrors supabase/schema.sql (snake_case there, camelCase here).

export type Lang = 'en' | 'es'
export type Operation = 'sale' | 'rent'
export type PropertyType = 'apartment' | 'penthouse' | 'studio' | 'house' | 'land' | 'commercial' | 'office'
export type ListingStatus = 'draft' | 'active' | 'rented' | 'sold' | 'archived'
export type Furnishing = 'empty' | 'linea_blanca' | 'furnished'

export interface Property {
  id: string
  title: string
  titleEs?: string
  description: string
  descriptionEs?: string
  operation: Operation
  type: PropertyType
  price: number
  beds: number
  baths: number
  area: number
  parking: number
  /** Neighborhood slug, e.g. "punta-pacifica" (Sofia searches by it). */
  location: string
  city: string
  address?: string
  latitude?: number
  longitude?: number
  furnishing?: Furnishing
  petPolicy?: string
  features: string[]
  amenities: string[]
  hoa?: number
  deposit?: number
  availableDate?: string
  videoUrl?: string
  videoPosterUrl?: string
  images: string[]
  status: ListingStatus
  featured: boolean
  /** Sample/mock listing: badge on the site, never offered by Sofia. */
  sample?: boolean
  views: number
  createdAt: string
  updatedAt: string
}

/** Admin-only: where a listing came from. Never shown publicly. */
export interface PropertySource {
  propertyId: string
  sourceCode?: string
  sourceLink?: string
  contactName?: string
  contactPhone?: string
  contactEmail?: string
  commissionNote?: string
  notes?: string
}

export type LeadStage = 'new' | 'contacted' | 'showing' | 'negotiating' | 'won' | 'lost'
export type Interest = 'rent' | 'buy' | 'sell' | 'rent_out' | 'broker'

export interface Lead {
  id: string
  phone?: string
  name: string
  email?: string
  language?: string
  interest?: Interest | string
  propertyType?: string
  bedrooms?: string
  areas?: string
  budget?: string
  timeline?: string
  financing?: string
  /** hot | warm | cold, set by Sofia. */
  score?: string
  botStage?: string
  stage: LeadStage
  listingsSent?: string
  sofiaNotes?: string
  myNotes?: string
  message?: string
  source: 'whatsapp' | 'web'
  sourceAd?: string
  propertyId?: string
  lastInboundAt?: string
  lastMessage?: string
  createdAt: string
  updatedAt: string
}

export interface AdminUser { id: string; email: string }
