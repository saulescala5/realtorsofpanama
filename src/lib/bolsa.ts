// Bolsa de Brokers: the private database parsed from broker WhatsApp groups (data.json).
// Admin only. Stored gzipped in the private Supabase bucket "bolsa"; never bundled or shown publicly.
import { useEffect, useState } from 'react'
import { supabase } from './supabase'
import type { Lead } from './types'

export interface BItem {
  key: string; kind: string; op: string | null; type: string | null; zones: string[]; building: string | null
  price: number | null; beds_min: number | null; beds_max: number | null; baths: number | null; parking: number | null; m2: number | null
  furnished: string | null; pets: boolean | null; urls: string[]; title: string; text: string; group: string; groups: string[]; broker: string
  first_seen: string; last_seen: string; times: number; last_dt: string; price_history: [string, number][]; price_drop: boolean
  prev_price: number | null; drop_pct: number; closed: string | null; valid_until: string | null; active: boolean; images: string[]
}
export interface BBroker {
  id: string; name: string; phone: string; named: boolean; company: string | null; license: string | null; instagram: string | null
  groups: string[]; msgs: number; first: string; last: string; n_off: number; n_dem: number; role: string; role_label: string
  zones: [string, number, number][]; med_rent: number; med_sale: number; med_budget_rent: number; med_budget_sale: number; sites: string[]
}
export interface BZone { zone: string; off_rent: number; off_sale: number; dem_rent: number; dem_sale: number; med_rent: number; med_sale: number; med_budget_rent: number; top_brokers: string[] }
export interface BMatch { dem: string; off: string; score: number; gap: number; price: number }
export interface Bolsa {
  generated: string; today: string; groups: { name: string; first: string; last: string; stats: Record<string, number> }[]
  offers: BItem[]; demands: BItem[]; matches: BMatch[]; brokers: BBroker[]; zones: BZone[]
}
export interface BolsaIndex extends Bolsa { offerBy: Map<string, BItem>; demandBy: Map<string, BItem>; brokerBy: Map<string, BBroker> }

const PATH = 'data.json.gz'
let cache: BolsaIndex | null = null
let meta: { updated?: string } = {}
const subs = new Set<() => void>()
const emit = () => subs.forEach((f) => f())

function index(b: Bolsa): BolsaIndex {
  return { ...b, offerBy: new Map(b.offers.map((o) => [o.key, o])), demandBy: new Map(b.demands.map((o) => [o.key, o])), brokerBy: new Map(b.brokers.map((o) => [o.id, o])) }
}
async function gzip(text: string) { return new Response(new Blob([text]).stream().pipeThrough(new CompressionStream('gzip'))).blob() }
async function gunzip(blob: Blob) { return new Response(blob.stream().pipeThrough(new DecompressionStream('gzip'))).text() }

function validate(j: unknown): Bolsa {
  const b = j as Bolsa
  if (!b || !Array.isArray(b.offers) || !Array.isArray(b.demands) || !Array.isArray(b.brokers)) throw new Error('This file is not a Bolsa de Brokers data.json')
  b.matches ??= []; b.zones ??= []; b.groups ??= []
  return b
}

/** Load from the private bucket (once per session). */
export async function loadBolsa(force = false): Promise<BolsaIndex | null> {
  if (cache && !force) return cache
  if (!supabase) return cache
  const { data, error } = await supabase.storage.from('bolsa').download(PATH)
  if (error || !data) return null
  cache = index(validate(JSON.parse(await gunzip(data))))
  const { data: list } = await supabase.storage.from('bolsa').list('', { search: PATH })
  meta = { updated: list?.find((f) => f.name === PATH)?.updated_at }
  emit(); return cache
}

/** Replace with a new data.json picked from disk; uploads it (gzipped) when Supabase is connected. */
export async function uploadBolsa(file: File): Promise<BolsaIndex> {
  const text = await file.text()
  const b = validate(JSON.parse(text))
  if (supabase) {
    const { error } = await supabase.storage.from('bolsa').upload(PATH, await gzip(text), { upsert: true, contentType: 'application/gzip' })
    if (error) throw new Error(error.message === 'Bucket not found' ? 'Bucket not found: run 7_admin_tools.sql in Supabase first.' : error.message)
    meta = { updated: new Date().toISOString() }
  }
  cache = index(b); emit(); return cache
}

export function useBolsa() {
  const [, tick] = useState(0)
  const [state, setState] = useState<'idle' | 'loading' | 'ready' | 'empty' | 'error'>(cache ? 'ready' : 'idle')
  useEffect(() => {
    const f = () => { tick((n) => n + 1); setState(cache ? 'ready' : 'empty') }
    subs.add(f)
    if (!cache) { setState('loading'); loadBolsa().then((b) => setState(b ? 'ready' : 'empty')).catch(() => setState('error')) }
    return () => { subs.delete(f) }
  }, [])
  return { data: cache, state, updated: meta.updated }
}

// ---------------------------------------------------------------- helpers
export const waNum = (phone?: string) => (phone ?? '').replace(/[^\d]/g, '')
export const brokerLabel = (b?: BBroker) => (b ? (b.named ? b.name : b.company || b.name) : '—')
export const isRent = (i: BItem) => (i.op ?? '').toLowerCase().includes('alquiler')
export const isSale = (i: BItem) => (i.op ?? '').toLowerCase().includes('venta')
export const bedsTxt = (i: BItem) => (i.beds_min == null ? '' : i.beds_max && i.beds_max !== i.beds_min ? `${i.beds_min}–${i.beds_max}` : String(i.beds_min))
export const money = (n?: number | null) => (n ? `$${n.toLocaleString('en-US')}` : '—')
const norm = (s: string) => s.normalize('NFKD').replace(/[̀-ͯ]/g, '').toLowerCase()

const TYPE_MAP: Record<string, string> = { apartamento: 'apartment', casa: 'house', penthouse: 'penthouse', ph: 'penthouse', estudio: 'studio', terreno: 'land', lote: 'land', local: 'commercial', 'local comercial': 'commercial', oficina: 'office', bodega: 'commercial' }
export const toPropertyType = (t?: string | null) => TYPE_MAP[norm(t ?? '')] ?? 'apartment'
export const toFurnishing = (f?: string | null) => { const n = norm(f ?? ''); return n.includes('amobl') ? 'furnished' : n.includes('linea') ? 'linea_blanca' : n.includes('sin') || n.includes('vacio') ? 'empty' : undefined }

/** Offers in the Bolsa that fit one of my clients (by operation, area, budget and bedrooms). */
export function offersForLead(b: BolsaIndex, lead: Lead, limit = 12) {
  const wantsRent = lead.interest === 'rent'
  const wantsBuy = lead.interest === 'buy'
  if (!wantsRent && !wantsBuy) return []
  const areas = norm(lead.areas ?? '').split(/[,/;]| y | and /).map((s) => s.trim()).filter(Boolean)
  const nums = [...String(lead.budget ?? '').toLowerCase().replace(/,/g, '').matchAll(/(\d+(?:\.\d+)?)\s*(k|m)?/g)].map((m) => Number(m[1]) * (m[2] === 'k' ? 1e3 : m[2] === 'm' ? 1e6 : 1))
  const max = nums.length ? Math.max(...nums) : 0
  const beds = Number(String(lead.bedrooms ?? '').replace(/[^\d]/g, '')) || 0
  return b.offers
    .filter((o) => o.active && o.price && (wantsRent ? isRent(o) : isSale(o)))
    .map((o) => {
      let s = 0
      const z = o.zones.map(norm)
      if (areas.length) { if (areas.some((a) => z.some((x) => x.includes(a) || a.includes(x)))) s += 50; else return null }
      if (max) { if (o.price! > max * 1.15) return null; s += o.price! <= max ? 30 : 15 }
      if (beds) { if ((o.beds_max ?? o.beds_min ?? 0) < beds) return null; s += 20 }
      return { o, s: s - Math.min(20, (Date.parse(b.today) - Date.parse(o.last_seen)) / 864e5 / 3) }
    })
    .filter(Boolean)
    .sort((a, c) => c!.s - a!.s)
    .slice(0, limit)
    .map((x) => x!.o)
}

/** Client-safe text for WhatsApp: no broker, group or source details. */
export function clientText(o: BItem, lang: 'en' | 'es' = 'es') {
  const zone = o.zones[0] ?? ''
  const line = [o.type, o.building, zone].filter(Boolean).join(' · ')
  const specs = [bedsTxt(o) && `${bedsTxt(o)} ${lang === 'es' ? 'rec.' : 'bd'}`, o.baths && `${o.baths} ${lang === 'es' ? 'baños' : 'ba'}`, o.m2 && `${o.m2} m²`, o.parking && `${o.parking} ${lang === 'es' ? 'estac.' : 'parking'}`, o.furnished].filter(Boolean).join(' · ')
  const price = `${money(o.price)}${isRent(o) ? (lang === 'es' ? '/mes' : '/mo') : ''}`
  return lang === 'es' ? `*${line}*\n${specs}\n${price}\n\n¿Te gustaría verla? Te confirmo disponibilidad y agendamos la visita.` : `*${line}*\n${specs}\n${price}\n\nWould you like to see it? I'll confirm availability and book the visit.`
}

// ---------------------------------------------------------------- WhatsApp exports → Bolsa
// Raw chats, uploaded photos and flyer readings are kept privately (bolsa/chats.json.gz, bolsa/media/*),
// so each new export of a group merges with the old ones and nothing is read twice.
interface ChatStore { groups: { name: string; key: string; texts: string[] }[]; media?: string[]; flyerText?: Record<string, string> }
const CHATS = 'chats.json.gz'
let chatsMem: ChatStore | null = null

async function loadChats(): Promise<ChatStore> {
  if (chatsMem) return chatsMem
  if (supabase) {
    const { data } = await supabase.storage.from('bolsa').download(CHATS)
    if (data) { chatsMem = JSON.parse(await gunzip(data)) as ChatStore; return chatsMem }
  }
  chatsMem = { groups: [] }; return chatsMem
}

type ZipEntry = { name: string; dir: boolean; async(t: 'blob'): Promise<Blob>; async(t: 'string'): Promise<string> }
async function readExport(f: File): Promise<{ text: string; inner: string; photos: Map<string, ZipEntry> }> {
  const photos = new Map<string, ZipEntry>()
  if (/\.zip$/i.test(f.name)) {
    const JSZip = (await import('jszip')).default
    const zip = await JSZip.loadAsync(f)
    const files = Object.values(zip.files) as unknown as (ZipEntry & { _data?: { uncompressedSize?: number } })[]
    const txt = files.filter((z) => !z.dir && /\.txt$/i.test(z.name)).sort((a, b) => (b._data?.uncompressedSize ?? 0) - (a._data?.uncompressedSize ?? 0))[0]
    if (!txt) throw new Error(`${f.name}: the zip has no chat (.txt)`)
    for (const z of files) { const n = z.name.split('/').pop()!; if (!z.dir && /\.(jpe?g|png|webp)$/i.test(n) && !/^STK-/i.test(n)) photos.set(n, z) }
    return { text: await txt.async('string'), inner: txt.name, photos }
  }
  return { text: await f.text(), inner: f.name, photos }
}

/** Shrinks a photo to max 1280px JPEG before storing it. */
async function shrink(blob: Blob): Promise<Blob> {
  try {
    const bmp = await createImageBitmap(blob)
    const k = Math.min(1, 1280 / Math.max(bmp.width, bmp.height))
    const c = document.createElement('canvas'); c.width = Math.round(bmp.width * k); c.height = Math.round(bmp.height * k)
    c.getContext('2d')!.drawImage(bmp, 0, 0, c.width, c.height)
    return await new Promise((r) => c.toBlob((b) => r(b ?? blob), 'image/jpeg', 0.82))
  } catch { return blob }
}

async function rebuild(store: ChatStore): Promise<Bolsa> {
  const Engine = (await import('./bolsaEngine')).default
  return Engine.build(store.groups.map((g) => ({ name: g.name, msgs: Engine.mergeMsgs(g.texts.map((t) => Engine.parseChat(t).msgs)) })), store.flyerText ?? {}, []) as unknown as Bolsa
}
async function saveAll(store: ChatStore, built: Bolsa) {
  if (supabase) {
    const a = await supabase.storage.from('bolsa').upload(CHATS, await gzip(JSON.stringify(store)), { upsert: true, contentType: 'application/gzip' })
    if (a.error) throw new Error(a.error.message === 'Bucket not found' ? 'Bucket not found: run 7_admin_tools.sql in Supabase first.' : a.error.message)
    const b = await supabase.storage.from('bolsa').upload(PATH, await gzip(JSON.stringify(built)), { upsert: true, contentType: 'application/gzip' })
    if (b.error) throw new Error(b.error.message)
    meta = { updated: new Date().toISOString() }
  }
  cache = index(validate(built)); emit()
}

export interface ImportResult { name: string; msgs: number; first: string; last: string; isNew: boolean; photos: number }

/** Add WhatsApp group exports (.zip with or without media, or .txt), rebuild the Bolsa and save it privately. */
export async function importExports(files: File[], onStep?: (s: string) => void): Promise<ImportResult[]> {
  const Engine = (await import('./bolsaEngine')).default
  const store = await loadChats()
  store.media ??= []; store.flyerText ??= {}
  const out: ImportResult[] = []
  const photos = new Map<string, ZipEntry>()
  for (const f of files) {
    onStep?.(f.name)
    const ex = await readExport(f)
    ex.photos.forEach((v, k) => photos.set(k, v))
    const r = Engine.parseChat(ex.text)
    const real = r.msgs.filter((m: { system?: boolean }) => !m.system)
    if (real.length < 3) throw new Error(`${f.name}: this doesn't look like a WhatsApp chat export`)
    const name: string = r.names[r.names.length - 1] || Engine.groupFromFile(ex.inner) || Engine.groupFromFile(f.name) || f.name
    const key: string = Engine.groupKey(name)
    let g = store.groups.find((x) => x.key === key)
    const isNew = !g
    if (!g) { g = { name, key, texts: [] }; store.groups.push(g) }
    if (!g.texts.includes(ex.text)) g.texts.push(ex.text)
    out.push({ name, msgs: real.length, first: real[0].dt.slice(0, 10), last: real[real.length - 1].dt.slice(0, 10), isNew, photos: ex.photos.size })
  }
  onStep?.('build')
  await new Promise((r) => setTimeout(r, 30))
  const built = await rebuild(store)
  // store only the photos that belong to an offer, a request or a flyer
  const wanted = new Set<string>([...built.offers, ...built.demands].flatMap((o) => o.images ?? []).concat((built as unknown as { flyers: { images: string[] }[] }).flyers.flatMap((f) => f.images)))
  const todo = [...photos.keys()].filter((n) => wanted.has(n) && !store.media!.includes(n))
  if (supabase && todo.length) {
    let done = 0
    const work = async () => {
      for (let n = todo.shift(); n; n = todo.shift()) {
        const blob = await shrink(await photos.get(n)!.async('blob'))
        const { error } = await supabase!.storage.from('bolsa').upload(`media/${n}`, blob, { upsert: true, contentType: 'image/jpeg' })
        if (error?.message === 'Bucket not found') throw new Error('Bucket not found: run 7_admin_tools.sql in Supabase first.')
        if (!error) store.media!.push(n)
        onStep?.(`photos ${++done}`)
      }
    }
    await Promise.all([work(), work(), work(), work()])
  }
  onStep?.('save')
  await saveAll(store, built)
  return out
}

/** Flyers (image-only posts) whose photo is stored but not read yet. */
export async function pendingFlyers(): Promise<string[]> {
  const store = await loadChats()
  const ft = store.flyerText ?? {}
  const media = new Set(store.media ?? [])
  return [...new Set((cache as unknown as { flyers?: { images: string[] }[] })?.flyers?.flatMap((f) => f.images) ?? [])].filter((n) => media.has(n) && !(n in ft))
}

/** Reads pending flyers with Claude (Edge Function "bolsa-flyer"), then rebuilds so they become offers. */
export async function readFlyers(names: string[], onStep?: (s: string) => void) {
  if (!supabase) throw new Error('Connect Supabase first')
  const store = await loadChats()
  store.flyerText ??= {}
  for (let i = 0; i < names.length; i += 5) {
    const batch = names.slice(i, i + 5)
    const { data, error } = await supabase.functions.invoke('bolsa-flyer', { body: { paths: batch.map((n) => `media/${n}`) } })
    if (error) throw new Error(error.message.includes('not found') || error.message.includes('Failed to send') ? 'Deploy the bolsa-flyer Edge Function first.' : error.message)
    for (const n of batch) store.flyerText[n] = (data?.texts?.[`media/${n}`] as string) ?? ''
    onStep?.(`${Math.min(i + 5, names.length)}/${names.length}`)
  }
  onStep?.('build')
  await saveAll(store, await rebuild(store))
}

const urlCache = new Map<string, string>()
/** Temporary links (1 hour) to stored photos. */
export async function photoUrls(names: string[]): Promise<string[]> {
  if (!supabase || !names.length) return []
  const missing = names.filter((n) => !urlCache.has(n))
  if (missing.length) {
    const { data } = await supabase.storage.from('bolsa').createSignedUrls(missing.map((n) => `media/${n}`), 3600)
    data?.forEach((d, i) => { if (d.signedUrl) urlCache.set(missing[i], d.signedUrl) })
  }
  return names.map((n) => urlCache.get(n)).filter(Boolean) as string[]
}

/** Downloads stored photos as blobs (to copy them into a public listing). */
export async function photoBlobs(names: string[]): Promise<Blob[]> {
  if (!supabase) return []
  const out: Blob[] = []
  for (const n of names) { const { data } = await supabase.storage.from('bolsa').download(`media/${n}`); if (data) out.push(data) }
  return out
}

export async function storedGroups() { return (await loadChats()).groups.map((g) => ({ name: g.name, exports: g.texts.length })) }
