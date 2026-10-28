/**
 * Listing importer — turns a link (or pasted text) of the user's OWN listing
 * on another site into a listing draft. Pure TypeScript with no dependencies so
 * the same code runs in the browser (paste), the Vite dev server and the
 * Supabase Edge Function (link).
 *
 * Ground rules: we identify ourselves honestly, read one page per request,
 * and when a site refuses automated access we stop and ask for pasted text
 * instead of trying to get around it.
 */

export type ImportOperation = 'sale' | 'rent'
export type ImportType = 'apartment' | 'house' | 'land' | 'office' | 'commercial'

export interface ImportedListing {
  title?: string
  description?: string
  operation?: ImportOperation
  type?: ImportType
  price?: number
  city?: string
  neighborhood?: string
  beds?: number
  baths?: number
  area?: number
  parking?: number
  images?: string[]
}

export type ImportResult =
  | { ok: true; source: string; listing: ImportedListing; fields: number }
  | { ok: false; source: string; reason: 'invalid' | 'blocked' | 'failed' | 'nothing' }

export const IMPORTER_UA = 'RealtorsOfPanamaImporter/1.0 (+https://realtorsofpanama.com)'

const NEIGHBORHOODS = [
  'Punta Pacífica', 'Punta Paitilla', 'Paitilla', 'Costa del Este', 'Obarrio', 'Marbella', 'San Francisco', 'Coco del Mar',
  'El Cangrejo', 'Bella Vista', 'Casco Viejo', 'Casco Antiguo', 'Santa María', 'Avenida Balboa', 'Cinta Costera', 'Clayton',
  'Albrook', 'Condado del Rey', 'Altos del Golf', 'Coronado', 'Nueva Gorgona', 'Playa Blanca', 'Boquete', 'El Valle',
  'Costa Sur', 'Versalles', 'Brisas del Golf', 'Panamá Pacífico', 'Howard', 'Ancón', 'Amador', 'Dos Mares', 'Betania',
]

const CITY_BY_AREA: Record<string, string> = { Coronado: 'Coronado', 'Nueva Gorgona': 'Chame', 'Playa Blanca': 'Río Hato', Boquete: 'Boquete', 'El Valle': 'El Valle de Antón' }

const strip = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()

const decode = (s: string) => s
  .replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#0?39;|&apos;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>')
  .replace(/&nbsp;/g, ' ').replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
  .replace(/&([a-z])acute;/gi, (_, c) => ({ a: 'á', e: 'é', i: 'í', o: 'ó', u: 'ú', A: 'Á', E: 'É', I: 'Í', O: 'Ó', U: 'Ú' } as Record<string, string>)[c] ?? c)
  .replace(/&ntilde;/g, 'ñ').trim()

function toNumber(raw: string): number | undefined {
  let s = raw.replace(/\s/g, '')
  // "1.250.000" / "1,250,000" / "325000.00" / "1.250,50"
  if (/^\d{1,3}([.,]\d{3})+([.,]\d{1,2})?$/.test(s)) {
    const dec = s.match(/[.,](\d{1,2})$/)
    s = (dec ? s.slice(0, -dec[0].length) : s).replace(/[.,]/g, '') + (dec ? '.' + dec[1] : '')
  } else s = s.replace(',', '.')
  const n = parseFloat(s)
  return Number.isFinite(n) ? n : undefined
}

/** Extract listing facts from free text (title + description). */
export function parseListingText(text: string): ImportedListing {
  const t = strip(text)
  const out: ImportedListing = {}

  out.operation = /\b(alquiler|alquilo|renta|arriendo|for rent|rental|se alquila)\b/.test(t) ? 'rent' : /\b(venta|vendo|se vende|for sale|sale)\b/.test(t) ? 'sale' : undefined
  out.type = /\b(terreno|lote|land|lot)\b/.test(t) ? 'land'
    : /\b(oficina|office)\b/.test(t) ? 'office'
    : /\b(local comercial|local|commercial|galera|bodega)\b/.test(t) ? 'commercial'
    : /\b(casa|house|home|villa|townhouse|chalet)\b/.test(t) ? 'house'
    : /\b(apartamento|apartment|apto|condo|penthouse|loft|ph\b)/.test(t) ? 'apartment' : undefined

  const price = text.match(/(?:US\$|USD|B\/\.|\$)\s*([\d.,]{3,})/i) ?? text.match(/\bpor\s+([\d.,]{4,})\b/i) ?? text.match(/([\d.,]{4,})\s*(?:USD|dólares|dolares)/i)
  if (price) out.price = toNumber(price[1])

  const area = t.match(/([\d.,]+)\s*(?:m²|m2|mts2?|metros cuadrados|sq\.? ?m|sqm)/)
  if (area) out.area = toNumber(area[1])

  const beds = t.match(/(\d+)\s*(?:recamaras?|habitaciones?|dormitorios?|cuartos?|bedrooms?|beds?|hab\.?)\b/)
  if (beds) out.beds = Number(beds[1])
  const baths = t.match(/(\d+(?:[.,]5)?)\s*(?:banos?|bathrooms?|baths?)\b/)
  if (baths) out.baths = toNumber(baths[1])
  const parking = t.match(/(\d+)\s*(?:estacionamientos?|parkings?|parking spaces?|estac\.?|garajes?)\b/)
  if (parking) out.parking = Number(parking[1])

  const hood = NEIGHBORHOODS.find((n) => t.includes(strip(n)))
  if (hood) { out.neighborhood = hood; out.city = CITY_BY_AREA[hood] ?? 'Panama City' }

  // Sanity limits: drop values that are clearly something else.
  if (out.price && (out.price < 100 || out.price > 100_000_000)) delete out.price
  if (out.area && (out.area < 10 || out.area > 1_000_000)) delete out.area
  if (out.beds && out.beds > 30) delete out.beds
  if (out.baths && out.baths > 30) delete out.baths
  return Object.fromEntries(Object.entries(out).filter(([, v]) => v !== undefined)) as ImportedListing
}

function meta(html: string, key: string): string[] {
  const re = new RegExp(`<meta[^>]+(?:property|name)=["']${key}["'][^>]*>`, 'gi')
  return [...html.matchAll(re)]
    .map((m) => m[0].match(/content=["']([^"']*)["']/i)?.[1])
    .filter((x): x is string => !!x)
    .map(decode)
}

// deno-lint-ignore no-explicit-any
function jsonLd(html: string): any[] {
  const out: unknown[] = []
  for (const m of html.matchAll(/<script[^>]+application\/ld\+json[^>]*>([\s\S]*?)<\/script>/gi)) {
    try {
      const v = JSON.parse(m[1].trim())
      const items = Array.isArray(v) ? v : v['@graph'] ?? [v]
      out.push(...items)
    } catch { /* ignore malformed blocks */ }
  }
  // deno-lint-ignore no-explicit-any
  return out as any[]
}

/** Parse a listing page's HTML: structured data first, text heuristics second. */
export function parseListingHtml(html: string, pageUrl: string): ImportedListing {
  const title = meta(html, 'og:title')[0] ?? decode(html.match(/<title[^>]*>([^<]*)<\/title>/i)?.[1] ?? '')
  const description = meta(html, 'og:description')[0] ?? meta(html, 'description')[0] ?? ''
  const images = [...meta(html, 'og:image'), ...meta(html, 'twitter:image')]

  const out: ImportedListing = parseListingText(`${title}\n${description}`)
  if (title) out.title = title.replace(/\s*[|·–-]\s*[^|·–-]*$/, '').slice(0, 120) || title.slice(0, 120)
  if (description) out.description = description.slice(0, 2000)

  for (const item of jsonLd(html)) {
    const offer = Array.isArray(item.offers) ? item.offers[0] : item.offers
    const p = Number(offer?.price ?? item.price)
    if (p > 0) out.price = p
    const rooms = Number(item.numberOfBedrooms ?? item.numberOfRooms)
    if (rooms > 0) out.beds = rooms
    const baths = Number(item.numberOfBathroomsTotal ?? item.numberOfFullBathrooms)
    if (baths > 0) out.baths = baths
    const fs = Number(item.floorSize?.value ?? item.floorSize)
    if (fs > 0) out.area = fs
    const img = item.image
    if (img) images.push(...(Array.isArray(img) ? img : [img]).map((x: { url?: string } | string) => (typeof x === 'string' ? x : x.url ?? '')))
  }

  const abs = images.filter(Boolean).map((src) => { try { return new URL(src, pageUrl).href } catch { return '' } })
  const uniq = [...new Set(abs.filter((x) => /^https:\/\//.test(x)))].slice(0, 12)
  if (uniq.length) out.images = uniq
  return out
}

const PRIVATE_HOST = /^(localhost|0\.0\.0\.0|127\.|10\.|192\.168\.|169\.254\.|172\.(1[6-9]|2\d|3[01])\.|\[?::1\]?$|.*\.local$|.*\.internal$)/i

/** Fetch one page with an honest identity and parse it. */
export async function importListingFromUrl(raw: string): Promise<ImportResult> {
  let url: URL
  try { url = new URL(raw.trim()) } catch { return { ok: false, source: raw, reason: 'invalid' } }
  const source = url.hostname.replace(/^www\./, '')
  if (!/^https?:$/.test(url.protocol) || PRIVATE_HOST.test(url.hostname)) return { ok: false, source, reason: 'invalid' }

  let res: Response
  try {
    res = await fetch(url.href, {
      redirect: 'follow',
      headers: { 'User-Agent': IMPORTER_UA, Accept: 'text/html,application/xhtml+xml', 'Accept-Language': 'es,en;q=0.8' },
      signal: AbortSignal.timeout(10_000),
    })
  } catch {
    return { ok: false, source, reason: 'failed' }
  }
  // Refusals (auth walls, bot protection, rate limits) are respected, not retried.
  if ([401, 403, 429, 451].includes(res.status) || res.headers.get('cf-mitigated')) return { ok: false, source, reason: 'blocked' }
  if (!res.ok || !(res.headers.get('content-type') ?? '').includes('html')) return { ok: false, source, reason: 'failed' }

  const html = (await res.text()).slice(0, 3_000_000)
  const listing = parseListingHtml(html, res.url || url.href)
  const fields = Object.keys(listing).length
  // A page title alone isn't a listing: require at least one property fact.
  if (listing.price === undefined && listing.area === undefined && listing.beds === undefined) return { ok: false, source, reason: 'nothing' }
  return { ok: true, source, listing, fields }
}
