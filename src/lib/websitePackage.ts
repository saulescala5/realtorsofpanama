// Reads the folder the listing workflow produces:
//   <listing folder>\Website\website.json + photos\01.jpg… (+ video.mp4, video_poster.jpg)
//   <listing folder>\Info Propiedad.txt (optional; gives the private source contact)
// The user can pick either the Website folder or the whole listing folder.
import type { PropertyInput } from './store'
import type { Furnishing, PropertySource, PropertyType } from './types'
import { LOCATIONS, slugify } from './locations'

export interface ParsedPackage {
  listing: Omit<PropertyInput, 'images' | 'status' | 'featured'>
  source: Omit<PropertySource, 'propertyId'>
  photos: File[]
  previews: string[]
  video?: File
  poster?: File
  summary: [string, string][]
}

const pathOf = (f: File) => ((f as File & { webkitRelativePath?: string }).webkitRelativePath || f.name).replace(/\\/g, '/')
const TYPES: PropertyType[] = ['apartment', 'penthouse', 'studio', 'house', 'land', 'commercial', 'office']
const FURN: Furnishing[] = ['empty', 'linea_blanca', 'furnished']
const num = (v: unknown) => (v === null || v === undefined || v === '' || isNaN(Number(v)) ? undefined : Number(v))

function toSlug(loc: string) {
  const s = slugify(loc)
  return LOCATIONS.find((l) => l.slug === s || slugify(l.name) === s)?.slug ?? s
}

function parseInfo(text: string): Pick<PropertySource, 'contactName' | 'contactPhone' | 'notes'> {
  const pick = (re: RegExp) => text.match(re)?.[1]?.trim()
  return {
    contactName: pick(/(?:Asesor(?:\/agente)?|Agente|Broker|Nombre)\s*:\s*(.+)/i),
    contactPhone: pick(/(?:Tel[eé]fono|Phone|WhatsApp)\s*:\s*(\+?[\d\s()-]{7,})/i),
  }
}

export async function parseWebsitePackage(files: File[]): Promise<ParsedPackage | null> {
  const jsons = files.filter((f) => pathOf(f).toLowerCase().endsWith('website.json'))
  const jsonFile = jsons.find((f) => /\/website\/website\.json$/i.test('/' + pathOf(f))) ?? jsons[0]
  if (!jsonFile) return null
  const j = JSON.parse(await jsonFile.text()) as Record<string, any> // eslint-disable-line @typescript-eslint/no-explicit-any
  const dir = pathOf(jsonFile).replace(/[^/]*$/, '')
  const byPath = new Map(files.map((f) => [pathOf(f).toLowerCase(), f]))
  const at = (rel?: string) => (rel ? byPath.get((dir + rel.replace(/^\.?\//, '')).toLowerCase()) : undefined)

  const photoList: string[] = Array.isArray(j.photos) ? j.photos : []
  let photos = photoList.map(at).filter(Boolean) as File[]
  if (!photos.length) photos = files.filter((f) => pathOf(f).toLowerCase().startsWith(dir.toLowerCase() + 'photos/') && /\.(jpe?g|png|webp)$/i.test(f.name)).sort((a, b) => a.name.localeCompare(b.name))

  const info = files.find((f) => /info propiedad\.txt$/i.test(pathOf(f)))
  const contact = info ? parseInfo(await info.text()) : {}

  const type = TYPES.includes(j.property_type) ? (j.property_type as PropertyType) : 'apartment'
  const operation = j.type === 'sale' ? 'sale' : 'rent'
  const listing: ParsedPackage['listing'] = {
    title: String(j.title_en || j.title || '').trim(), titleEs: j.title_es || undefined,
    description: String(j.description || '').trim(), descriptionEs: j.description_es || undefined,
    operation, type, price: num(j.price) ?? 0, beds: num(j.bedrooms) ?? 0, baths: num(j.bathrooms) ?? 0, area: num(j.area) ?? 0, parking: num(j.parking) ?? 0,
    location: toSlug(String(j.location || '')), city: j.city || 'Panama City', address: j.full_address || undefined,
    latitude: num(j.latitude), longitude: num(j.longitude),
    furnishing: FURN.includes(j.furnishing_status) ? j.furnishing_status : undefined,
    features: Array.isArray(j.features) ? j.features.map(String) : [], amenities: Array.isArray(j.property_amenities) ? j.property_amenities.map(String) : [],
    hoa: num(j.hoa), deposit: num(j.deposit),
  }
  return {
    listing,
    source: { sourceCode: j.external_code ? String(j.external_code) : undefined, sourceLink: j.external_link || undefined, ...contact },
    photos, previews: photos.slice(0, 1).map((f) => URL.createObjectURL(f)),
    video: at(j.video), poster: at(j.video_poster),
    summary: [
      ['Title', listing.title], ['Price', `$${listing.price.toLocaleString()}${operation === 'rent' ? '/mo' : ''}`], ['Location', listing.location],
      ['Specs', `${listing.beds} bd · ${listing.baths} ba · ${listing.area} m²`], ['Ref', j.external_code ?? '—'], ['Source contact', contact.contactName ?? '—'],
    ],
  }
}
