import type { Property } from './types'
import { hood } from './neighborhoods'

/** Exact pin when the listing has one, otherwise near its neighborhood center (stable per listing). */
export function coordsOf(p: Property): { lat: number; lng: number } | null {
  if (p.latitude && p.longitude) return { lat: p.latitude, lng: p.longitude }
  const h = hood(p.location)
  if (!h) return null
  const seed = [...p.id].reduce((a, c) => (a * 31 + c.charCodeAt(0)) % 9973, 7)
  return { lat: h.lat + ((seed % 100) - 50) / 12000, lng: h.lng + ((Math.floor(seed / 100) % 100) - 50) / 12000 }
}

export const shortPrice = (p: Property) =>
  p.price >= 1_000_000 ? `$${(p.price / 1_000_000).toFixed(p.price % 1_000_000 ? 1 : 0)}M` : p.price >= 10_000 ? `$${Math.round(p.price / 1000)}K` : `$${p.price.toLocaleString('en-US')}`
