// "2 bedrooms in Punta Pacífica under $2,000" → search params. Works in English and Spanish.
import { NEIGHBORHOODS } from './neighborhoods'
import type { PropertyType } from './types'

const strip = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()

const TYPE_WORDS: [RegExp, PropertyType][] = [
  [/\b(penthouse|ph)\b/, 'penthouse'], [/\b(studio|estudio|apartaestudio|loft)\b/, 'studio'], [/\b(house|casa|home|villa)\b/, 'house'],
  [/\b(land|lote|terreno|lot)\b/, 'land'], [/\b(office|oficina)\b/, 'office'], [/\b(local|commercial|comercial|retail|galera|bodega)\b/, 'commercial'],
  [/\b(apartment|apartamento|apto|depa|flat|condo)\b/, 'apartment'],
]

export function parseQuery(input: string): URLSearchParams {
  const t = strip(input)
  const out = new URLSearchParams()
  if (/\b(rent|rental|alquil\w*|arriend\w*|renta)\b/.test(t)) out.set('op', 'rent')
  else if (/\b(buy|purchase|sale|compr\w*|venta|vend\w*|invest\w*|invert\w*)\b/.test(t)) out.set('op', 'sale')

  const hood = [...NEIGHBORHOODS].sort((a, b) => b.name.length - a.name.length).find((n) => t.includes(strip(n.name)))
  if (hood) out.set('area', hood.slug)

  const beds = t.match(/(\d+)\s*(?:bed|br\b|bd\b|bedroom|rec|recamara|habitaci|cuarto|dormitorio)/)
  if (beds) out.set('beds', beds[1])

  const money = t.match(/(?:under|below|less than|max|up to|hasta|menos de|maximo|por|budget|presupuesto)?\s*\$?\s*(\d[\d.,]*)\s*(k|mil|m\b|million|millon)?/g)
  if (money) {
    const vals = money.map((m) => {
      const mm = m.match(/\$?\s*(\d[\d.,]*)\s*(k|mil|m\b|million|millon)?/)!
      let n = Number(mm[1].replace(/,/g, ''))
      const u = mm[2]
      if (u === 'k' || u === 'mil') n *= 1000
      if (u === 'm' || u === 'million' || u === 'millon') n *= 1_000_000
      return { n, explicit: /\$|k|mil|under|hasta|max|budget|presupuesto|menos/.test(m) }
    }).filter((v) => v.explicit && v.n >= 300)
    if (vals.length) out.set('max', String(Math.max(...vals.map((v) => v.n))))
    if (!out.get('op') && vals.length) out.set('op', Math.max(...vals.map((v) => v.n)) > 20000 ? 'sale' : 'rent')
  }
  const type = TYPE_WORDS.find(([re]) => re.test(t))
  if (type) out.set('type', type[1])
  if (![...out.keys()].length && input.trim()) out.set('q', input.trim())
  return out
}
