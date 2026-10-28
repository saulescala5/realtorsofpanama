import { lazy, Suspense, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Search, MessageCircle, Map as MapIcon, List } from 'lucide-react'
import { useI18n } from '@/i18n'
import { useStore } from '@/lib/store'
import { PropertyCard } from '@/components/PropertyCard'
import type { PropertyType } from '@/lib/types'
import { LOCATIONS, locationName } from '@/lib/locations'
import { coordsOf, shortPrice } from '@/lib/geo'
import { waLink } from '@/lib/whatsapp'

const MapView = lazy(() => import('@/components/MapView'))
const TYPES: PropertyType[] = ['apartment', 'penthouse', 'studio', 'house', 'land', 'commercial', 'office']

export default function Explore() {
  const { t } = useI18n()
  const { publicProperties: properties } = useStore()
  const nav = useNavigate()
  const [params, setParams] = useSearchParams()
  const [hover, setHover] = useState<string | null>(null)
  const [mobileMap, setMobileMap] = useState(false)
  const q = params.get('q') ?? ''
  const op = params.get('op') ?? ''
  const type = params.get('type') ?? ''
  const area = params.get('area') ?? ''
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
      .filter((p) => !area || p.location === area)
      .filter((p) => !max || p.price <= max)
      .filter((p) => !beds || p.beds >= beds)
      .sort((a, b) => sort === 'low' ? a.price - b.price : sort === 'high' ? b.price - a.price : Number(b.featured) - Number(a.featured) || b.createdAt.localeCompare(a.createdAt))
  }, [properties, q, op, type, area, max, beds, sort])

  const pins = useMemo(() => list.flatMap((p) => { const c = coordsOf(p); return c ? [{ id: p.id, ...c, label: shortPrice(p) }] : [] }), [list])
  const prices = op === 'sale' ? [150000, 250000, 400000, 600000, 1000000] : op === 'rent' ? [1000, 1500, 2000, 3000, 5000] : [1500, 3000, 250000, 500000, 1000000]
  const select = 'h-10 shrink-0 rounded-[3px] bg-white px-3 pr-8 text-[14px] text-ink ring-1 ring-inset ring-line outline-none focus:ring-brand-500'
  const seg = (a: boolean) => `h-10 px-4 text-[14px] font-medium transition ${a ? 'bg-ink text-white' : 'bg-white text-ink-soft hover:text-ink'}`

  return (
    <div>
      <div className="border-b border-line">
        <div className="container-x py-8">
          <h1 className="font-display text-[36px] leading-tight sm:text-[44px]">{t.explore.title}</h1>
          <div className="mt-6 flex flex-col gap-3 lg:flex-row lg:items-center">
            <label className="flex h-10 flex-1 items-center gap-2 rounded-[3px] px-3 ring-1 ring-inset ring-line focus-within:ring-2 focus-within:ring-brand-500 lg:max-w-xs">
              <Search size={16} className="text-ink-mute" />
              <input value={q} onChange={(e) => set('q', e.target.value)} placeholder={t.explore.searchPh} className="h-full flex-1 bg-transparent text-[14px] outline-none" aria-label={t.explore.searchPh} />
            </label>
            <div className="no-scrollbar flex items-center gap-2 overflow-x-auto">
              <div className="flex shrink-0 overflow-hidden rounded-[3px] ring-1 ring-inset ring-line">
                <button className={seg(!op)} onClick={() => set('op', '')}>{t.common.all}</button>
                <button className={seg(op === 'rent')} onClick={() => set('op', 'rent')}>{t.nav.rent}</button>
                <button className={seg(op === 'sale')} onClick={() => set('op', 'sale')}>{t.nav.buy}</button>
              </div>
              <select className={select} value={area} onChange={(e) => set('area', e.target.value)} aria-label={t.explore.neighborhood}>
                <option value="">{t.explore.neighborhood}</option>
                {LOCATIONS.filter((l) => l.slug !== 'other').map((l) => <option key={l.slug} value={l.slug}>{l.name}</option>)}
              </select>
              <select className={select} value={type} onChange={(e) => set('type', e.target.value)} aria-label={t.explore.type}>
                <option value="">{t.explore.type}</option>
                {TYPES.map((x) => <option key={x} value={x}>{t.types[x]}</option>)}
              </select>
              <select className={select} value={beds || ''} onChange={(e) => set('beds', e.target.value)} aria-label={t.explore.beds}>
                <option value="">{t.explore.beds}</option>
                {[1, 2, 3, 4].map((n) => <option key={n} value={n}>{n}+</option>)}
              </select>
              <select className={select} value={max || ''} onChange={(e) => set('max', e.target.value)} aria-label={t.explore.maxPrice}>
                <option value="">{t.explore.maxPrice}</option>
                {prices.map((n) => <option key={n} value={n}>${n.toLocaleString()}</option>)}
              </select>
              <select className={select} value={sort} onChange={(e) => set('sort', e.target.value === 'new' ? '' : e.target.value)} aria-label={t.explore.sort}>
                <option value="new">{t.explore.sortNew}</option>
                <option value="low">{t.explore.sortLow}</option>
                <option value="high">{t.explore.sortHigh}</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)]">
        <div className={`container-x py-8 lg:max-w-none lg:pr-8 ${mobileMap ? 'hidden lg:block' : ''}`}>
          <p className="mb-6 text-[14px] text-ink-soft">{t.explore.results(list.length)}</p>
          {list.length ? (
            <div className="grid gap-x-6 gap-y-12 sm:grid-cols-2">
              {list.map((p) => <PropertyCard key={p.id} p={p} onHover={setHover} />)}
            </div>
          ) : (
            <div className="border-t border-line py-12">
              <p className="max-w-[48ch] text-[17px]">{t.explore.none}</p>
              <div className="mt-6 flex flex-wrap gap-3">
                <a href={waLink('')} target="_blank" rel="noreferrer" className="btn-wa"><MessageCircle size={16} />{t.explore.askWa}</a>
                <button className="btn-ghost" onClick={() => setParams({})}>{t.explore.clear}</button>
              </div>
            </div>
          )}
        </div>
        <div className={`${mobileMap ? 'block' : 'hidden'} h-[calc(100vh-72px)] lg:sticky lg:top-[72px] lg:block`}>
          <Suspense fallback={<div className="h-full w-full bg-canvas" />}>
            <MapView points={pins} selected={hover} onSelect={(id) => nav(`/property/${id}`)} />
          </Suspense>
        </div>
      </div>

      <button onClick={() => setMobileMap(!mobileMap)} className="btn-primary fixed bottom-6 left-1/2 z-30 -translate-x-1/2 shadow-lift lg:hidden">
        {mobileMap ? <><List size={16} />{t.explore.list}</> : <><MapIcon size={16} />{t.explore.map}</>}
      </button>
    </div>
  )
}
