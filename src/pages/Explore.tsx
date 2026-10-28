import { useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search, SlidersHorizontal, SearchX, MessageCircle } from 'lucide-react'
import { useI18n } from '@/i18n'
import { useStore } from '@/lib/store'
import { PropertyCard } from '@/components/PropertyCard'
import { Empty } from '@/components/ui'
import type { PropertyType } from '@/lib/types'
import { locationName } from '@/lib/locations'
import { waLink } from '@/lib/whatsapp'

const TYPES: PropertyType[] = ['apartment', 'penthouse', 'studio', 'house', 'land', 'commercial', 'office']

export default function Explore() {
  const { t } = useI18n()
  const { publicProperties: properties } = useStore()
  const [params, setParams] = useSearchParams()
  const q = params.get('q') ?? ''
  const op = params.get('op') ?? ''
  const type = params.get('type') ?? ''
  const max = Number(params.get('max') ?? 0)
  const beds = Number(params.get('beds') ?? 0)
  const sort = params.get('sort') ?? 'new'

  const set = (k: string, v: string) => {
    const next = new URLSearchParams(params)
    if (v) next.set(k, v); else next.delete(k)
    setParams(next, { replace: true })
  }

  const list = useMemo(() => {
    const needle = q.toLowerCase()
    return properties
      .filter((p) => !needle || `${p.title} ${p.titleEs ?? ''} ${locationName(p.location)} ${p.address ?? ''} ${p.city} ${p.description}`.toLowerCase().includes(needle))
      .filter((p) => !op || p.operation === op)
      .filter((p) => !type || p.type === type)
      .filter((p) => !max || p.price <= max)
      .filter((p) => !beds || p.beds >= beds)
      .sort((a, b) => sort === 'new' && !!b.featured !== !!a.featured ? Number(!!b.featured) - Number(!!a.featured) : sort === 'low' ? a.price - b.price : sort === 'high' ? b.price - a.price : b.createdAt.localeCompare(a.createdAt))
  }, [properties, q, op, type, max, beds, sort])

  const pill = (active: boolean) => `h-9 shrink-0 rounded-full px-4 text-sm font-semibold transition ${active ? 'bg-ink text-white' : 'bg-white text-ink-soft ring-1 ring-line hover:text-ink'}`
  const select = 'h-9 shrink-0 rounded-full bg-white px-3 pr-8 text-sm font-semibold text-ink-soft ring-1 ring-line outline-none'

  return (
    <div className="container-x py-10">
      <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">{t.explore.title}</h1>
      <p className="mt-2 text-ink-soft">{t.explore.subtitle}</p>

      <div className="sticky top-16 z-30 -mx-4 mt-6 bg-white/90 px-4 py-3 backdrop-blur-xl sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <label className="flex h-11 flex-1 items-center gap-2 rounded-full bg-canvas px-4 ring-1 ring-line focus-within:ring-2 focus-within:ring-brand-400 lg:max-w-sm">
            <Search size={17} className="text-ink-mute" />
            <input value={q} onChange={(e) => set('q', e.target.value)} placeholder={t.explore.searchPh} className="h-full flex-1 bg-transparent text-sm outline-none" />
          </label>
          <div className="no-scrollbar flex items-center gap-2 overflow-x-auto">
            <SlidersHorizontal size={16} className="shrink-0 text-ink-mute" />
            <button className={pill(!op)} onClick={() => set('op', '')}>{t.common.all}</button>
            <button className={pill(op === 'sale')} onClick={() => set('op', 'sale')}>{t.common.sale}</button>
            <button className={pill(op === 'rent')} onClick={() => set('op', 'rent')}>{t.common.rent}</button>
            <span className="mx-1 h-5 w-px shrink-0 bg-line" />
            <select className={select} value={type} onChange={(e) => set('type', e.target.value)} aria-label={t.explore.type}>
              <option value="">{t.explore.type}: {t.common.any}</option>
              {TYPES.map((x) => <option key={x} value={x}>{t.types[x]}</option>)}
            </select>
            <select className={select} value={beds || ''} onChange={(e) => set('beds', e.target.value)} aria-label={t.explore.beds}>
              <option value="">{t.explore.beds}: {t.common.any}</option>
              {[1, 2, 3, 4].map((n) => <option key={n} value={n}>{n}+</option>)}
            </select>
            <select className={select} value={max || ''} onChange={(e) => set('max', e.target.value)} aria-label={t.explore.maxPrice}>
              <option value="">{t.explore.maxPrice}: {t.common.any}</option>
              {(op === 'sale' ? [150000, 250000, 400000, 600000, 1000000] : op === 'rent' ? [1000, 1500, 2000, 3000, 5000] : [1500, 3000, 250000, 500000, 1000000]).map((n) => <option key={n} value={n}>≤ ${n.toLocaleString()}</option>)}
            </select>
            <select className={select} value={sort} onChange={(e) => set('sort', e.target.value === 'new' ? '' : e.target.value)} aria-label={t.explore.sort}>
              <option value="new">{t.explore.sortNew}</option>
              <option value="low">{t.explore.sortLow}</option>
              <option value="high">{t.explore.sortHigh}</option>
            </select>
          </div>
        </div>
      </div>

      <p className="mb-6 mt-4 text-sm font-semibold text-ink-soft">{t.explore.results(list.length)}</p>
      {list.length ? (
        <div className="grid gap-x-5 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {list.map((p) => <PropertyCard key={p.id} p={p} />)}
        </div>
      ) : (
        <Empty icon={<SearchX size={22} />} text={t.explore.none} action={<div className="flex flex-wrap justify-center gap-2"><a href={waLink('')} target="_blank" rel="noreferrer" className="btn-wa"><MessageCircle size={16} />{t.explore.askWa}</a><button className="btn-ghost" onClick={() => setParams({})}>{t.explore.clear}</button></div>} />
      )}
    </div>
  )
}
