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
    if (error) throw new Error(error.message)
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
