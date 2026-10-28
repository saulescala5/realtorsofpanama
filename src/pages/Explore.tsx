import { lazy, Suspense, useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Map as MapIcon, List, SlidersHorizontal, X, ChevronDown } from 'lucide-react'
import { SmartSearch } from '@/components/SmartSearch'
import { useI18n } from '@/i18n'
import { useStore } from '@/lib/store'
import { PropertyCard } from '@/components/PropertyCard'
import type { Property, PropertyType } from '@/lib/types'
import { LOCATIONS, locationName } from '@/lib/locations'
import { coordsOf, shortPrice } from '@/lib/geo'
import { waLink } from '@/lib/whatsapp'
import { useSeo } from '@/lib/seo'
import { WhatsAppIcon } from '@/components/icons'

const MapView = lazy(() => import('@/components/MapView'))
const TYPES: PropertyType[] = ['apartment', 'house', 'penthouse', 'studio', 'land', 'commercial', 'office']
const AMEN = ['pool', 'gym', 'security', 'oceanView', 'petFriendly', 'terrace', 'garden', 'elevator', 'generator', 'ac']
const KEYS = ['type', 'area', 'min', 'max', 'beds', 'baths', 'furn', 'amen', 'park'] as const
type F = Partial<Record<(typeof KEYS)[number], string>>

const TX = {
  en: { filters: 'Filters', clear: 'Clear all', show: (n: number) => `Show ${n} ${n === 1 ? 'home' : 'homes'}`, type: 'Property type', area: 'Neighborhood', price: 'Price (USD)', min: 'Min', max: 'Max', beds: 'Bedrooms', baths: 'Bathrooms', park: 'Parking', furn: 'Furnishing', amen: 'Amenities', any: 'Any', all: 'All', more: 'More', less: 'Less', title: 'Homes in Panama' },
  es: { filters: 'Filtros', clear: 'Limpiar', show: (n: number) => `Ver ${n} ${n === 1 ? 'propiedad' : 'propiedades'}`, type: 'Tipo de propiedad', area: 'Zona', price: 'Precio (USD)', min: 'Mín', max: 'Máx', beds: 'Recámaras', baths: 'Baños', park: 'Estacionamientos', furn: 'Amoblado', amen: 'Amenidades', any: 'Cualquiera', all: 'Todas', more: 'Ver más', less: 'Ver menos', title: 'Propiedades en Panamá' },
}

function match(p: Property, q: string, op: string, f: F) {
  const n = q.toLowerCase()
  const amen = f.amen ? f.amen.split(',') : []
  return (!n || `${p.title} ${p.titleEs ?? ''} ${locationName(p.location)} ${p.address ?? ''} ${p.city} ${p.description}`.toLowerCase().includes(n))
    && (!op || p.operation === op) && (!f.type || f.type.split(',').includes(p.type)) && (!f.area || f.area.split(',').includes(p.location))
    && (!f.min || p.price >= Number(f.min)) && (!f.max || p.price <= Number(f.max))
    && (!f.beds || p.beds >= Number(f.beds)) && (!f.baths || p.baths >= Number(f.baths)) && (!f.park || p.parking >= Number(f.park))
    && (!f.furn || p.furnishing === f.furn) && amen.every((a) => p.amenities.includes(a))
}

function Chip({ on, children, onClick }: { on: boolean; children: React.ReactNode; onClick: () => void }) {
  return <button type="button" aria-pressed={on} onClick={onClick} className={`h-10 rounded-full px-4 text-[14px] transition ${on ? 'bg-ink text-white' : 'bg-white ring-1 ring-inset ring-black/10 hover:ring-black/30'}`}>{children}</button>
}

function FiltersSheet({ open, onClose, value, onApply, count }: { open: boolean; onClose: () => void; value: F; onApply: (f: F) => void; count: (f: F) => number }) {
  const { t, lang } = useI18n()
  const L = TX[lang]
  const [d, setD] = useState<F>(value)
  const [allAreas, setAllAreas] = useState(false)
  useEffect(() => { if (open) setD(value) }, [open]) // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!open) return
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', esc); document.body.style.overflow = 'hidden'
    return () => { document.removeEventListener('keydown', esc); document.body.style.overflow = '' }
  }, [open, onClose])
  if (!open) return null
  const set = (k: keyof F, v: string) => setD((x) => ({ ...x, [k]: v || undefined }))
  const multi = (k: keyof F, v: string) => { const cur = d[k] ? d[k]!.split(',') : []; set(k, (cur.includes(v) ? cur.filter((c) => c !== v) : [...cur, v]).join(',')) }
  const has = (k: keyof F, v: string) => (d[k] ?? '').split(',').includes(v)
  const nums = (k: keyof F) => (
    <div className="flex flex-wrap gap-2">{['', '1', '2', '3', '4'].map((v) => <Chip key={v} on={(d[k] ?? '') === v} onClick={() => set(k, v)}>{v ? `${v}+` : L.any}</Chip>)}</div>
  )
  const areas = LOCATIONS.filter((l) => l.slug !== 'other')
  const sec = (title: string, body: React.ReactNode) => <section className="border-b border-black/5 py-6 last:border-0"><h3 className="mb-3 text-[15px] font-semibold">{title}</h3>{body}</section>

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center" role="dialog" aria-modal="true" aria-label={L.filters}>
      <div className="absolute inset-0 animate-[fadein_.2s_both] bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative flex max-h-[92vh] w-full max-w-[680px] animate-rise flex-col overflow-hidden rounded-t-[28px] bg-paper shadow-2xl sm:rounded-[28px]">
        <header className="flex items-center justify-between border-b border-black/5 bg-white px-6 py-4">
          <button type="button" onClick={() => setD({})} className="text-[14px] font-medium underline underline-offset-4">{L.clear}</button>
          <p className="text-[16px] font-semibold">{L.filters}</p>
          <button type="button" onClick={onClose} aria-label="Close" className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-black/5"><X size={19} /></button>
        </header>
        <div className="overflow-y-auto px-6">
          {sec(L.type, <div className="flex flex-wrap gap-2">{TYPES.map((x) => <Chip key={x} on={has('type', x)} onClick={() => multi('type', x)}>{t.types[x]}</Chip>)}</div>)}
          {sec(L.price, (
            <div className="grid grid-cols-2 gap-3">
              <label className="block"><span className="label">{L.min}</span><input className="input" inputMode="numeric" placeholder="$0" value={d.min ?? ''} onChange={(e) => set('min', e.target.value.replace(/\D/g, ''))} /></label>
              <label className="block"><span className="label">{L.max}</span><input className="input" inputMode="numeric" placeholder={L.any} value={d.max ?? ''} onChange={(e) => set('max', e.target.value.replace(/\D/g, ''))} /></label>
            </div>
          ))}
          {sec(L.area, (
            <>
              <div className="flex flex-wrap gap-2">{(allAreas ? areas : areas.slice(0, 12)).map((l) => <Chip key={l.slug} on={has('area', l.slug)} onClick={() => multi('area', l.slug)}>{l.name}</Chip>)}</div>
              {areas.length > 12 && <button type="button" onClick={() => setAllAreas(!allAreas)} className="mt-3 text-[14px] font-medium underline underline-offset-4">{allAreas ? L.less : L.more}</button>}
            </>
          ))}
          {sec(L.beds, nums('beds'))}
          {sec(L.baths, nums('baths'))}
          {sec(L.park, nums('park'))}
          {sec(L.furn, <div className="flex flex-wrap gap-2"><Chip on={!d.furn} onClick={() => set('furn', '')}>{L.any}</Chip>{(['furnished', 'linea_blanca', 'empty'] as const).map((v) => <Chip key={v} on={d.furn === v} onClick={() => set('furn', d.furn === v ? '' : v)}>{t.furnishing[v]}</Chip>)}</div>)}
          {sec(L.amen, <div className="flex flex-wrap gap-2">{AMEN.map((a) => <Chip key={a} on={has('amen', a)} onClick={() => multi('amen', a)}>{t.amenities[a]}</Chip>)}</div>)}
        </div>
        <footer className="border-t border-black/5 bg-white px-6 py-4">
          <button type="button" onClick={() => { onApply(d); onClose() }} className="btn-primary btn-lg w-full">{L.show(count(d))}</button>
        </footer>
      </div>
    </div>
  )
}

export default function Explore() {
  const { t, lang } = useI18n()
  const { publicProperties: properties } = useStore()
  const nav = useNavigate()
  const L = TX[lang]
  const [params, setParams] = useSearchParams()
  const [hover, setHover] = useState<string | null>(null)
  const [mobileMap, setMobileMap] = useState(false)
  const [sheet, setSheet] = useState(false)
  const q = params.get('q') ?? ''
  const op = params.get('op') ?? ''
  const sort = params.get('sort') ?? 'new'
  const f: F = Object.fromEntries(KEYS.map((k) => [k, params.get(k) ?? undefined]).filter(([, v]) => v)) as F
  useSeo({ title: `${op === 'rent' ? (lang === 'es' ? 'Alquiler' : 'Homes for rent') : op === 'sale' ? (lang === 'es' ? 'Venta' : 'Homes for sale') : L.title} · Realtors of Panama` })

  const set = (k: string, v: string) => { const next = new URLSearchParams(params); if (v) next.set(k, v); else next.delete(k); setParams(next, { replace: true }) }
  const apply = (nf: F) => { const next = new URLSearchParams(params); KEYS.forEach((k) => { if (nf[k]) next.set(k, nf[k]!); else next.delete(k) }); setParams(next, { replace: true }) }

  const list = useMemo(() => properties.filter((p) => match(p, q, op, f))
    .sort((a, b) => sort === 'low' ? a.price - b.price : sort === 'high' ? b.price - a.price : Number(b.featured) - Number(a.featured) || b.createdAt.localeCompare(a.createdAt)),
  [properties, params]) // eslint-disable-line react-hooks/exhaustive-deps
  const pins = useMemo(() => list.flatMap((p) => { const c = coordsOf(p); return c ? [{ id: p.id, ...c, label: shortPrice(p) }] : [] }), [list])

  const active: [string, string, () => void][] = []
  if (f.type) f.type.split(',').forEach((x) => active.push([x, t.types[x as PropertyType], () => apply({ ...f, type: f.type!.split(',').filter((y) => y !== x).join(',') })]))
  if (f.area) f.area.split(',').forEach((x) => active.push([x, locationName(x), () => apply({ ...f, area: f.area!.split(',').filter((y) => y !== x).join(',') })]))
  if (f.min || f.max) active.push(['price', `${f.min ? `$${Number(f.min).toLocaleString()}` : '$0'} – ${f.max ? `$${Number(f.max).toLocaleString()}` : '∞'}`, () => apply({ ...f, min: undefined, max: undefined })])
  if (f.beds) active.push(['beds', `${f.beds}+ ${t.common.beds.toLowerCase()}`, () => apply({ ...f, beds: undefined })])
  if (f.baths) active.push(['baths', `${f.baths}+ ${t.common.baths.toLowerCase()}`, () => apply({ ...f, baths: undefined })])
  if (f.park) active.push(['park', `${f.park}+ ${L.park.toLowerCase()}`, () => apply({ ...f, park: undefined })])
  if (f.furn) active.push(['furn', t.furnishing[f.furn as 'furnished'], () => apply({ ...f, furn: undefined })])
  if (f.amen) f.amen.split(',').forEach((x) => active.push([x, t.amenities[x], () => apply({ ...f, amen: f.amen!.split(',').filter((y) => y !== x).join(',') })]))
  const seg = (a: boolean) => `h-10 rounded-full px-5 text-[14px] font-medium transition ${a ? 'bg-ink text-white' : 'text-ink-soft hover:text-ink'}`

  return (
    <div>
      <div className="sticky top-20 z-30 border-b border-black/10 bg-paper/90 backdrop-blur-xl">
        <div className="container-x py-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="min-w-0 lg:w-[460px]"><SmartSearch dark={false} /></div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex gap-0.5 rounded-full bg-white p-1 ring-1 ring-inset ring-black/10">
                <button className={seg(!op)} onClick={() => set('op', '')}>{t.common.all}</button>
                <button className={seg(op === 'rent')} onClick={() => set('op', 'rent')}>{t.nav.rent}</button>
                <button className={seg(op === 'sale')} onClick={() => set('op', 'sale')}>{t.nav.buy}</button>
              </div>
              <button onClick={() => setSheet(true)} className={`flex h-12 items-center gap-2 rounded-full px-5 text-[14px] font-medium ring-1 ring-inset transition ${active.length ? 'bg-ink text-white ring-ink' : 'bg-white ring-black/10 hover:ring-black/30'}`}>
                <SlidersHorizontal size={16} />{L.filters}{active.length > 0 && <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-white px-1.5 text-[11px] text-ink">{active.length}</span>}
              </button>
              <label className="relative">
                <span className="sr-only">{t.explore.sort}</span>
                <select className="h-12 appearance-none rounded-full bg-white pl-5 pr-10 text-[14px] font-medium ring-1 ring-inset ring-black/10 outline-none hover:ring-black/30" value={sort} onChange={(e) => set('sort', e.target.value === 'new' ? '' : e.target.value)}>
                  <option value="new">{t.explore.sortNew}</option><option value="low">{t.explore.sortLow}</option><option value="high">{t.explore.sortHigh}</option>
                </select>
                <ChevronDown size={16} className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2" />
              </label>
            </div>
          </div>
          {active.length > 0 && (
            <div className="no-scrollbar mt-3 flex gap-2 overflow-x-auto">
              {active.map(([k, label, rm]) => <button key={k} onClick={rm} className="flex h-8 shrink-0 items-center gap-1.5 rounded-full bg-white pl-3 pr-2 text-[13px] ring-1 ring-black/10 hover:ring-black/30">{label}<X size={13} /></button>)}
              <button onClick={() => apply({})} className="h-8 shrink-0 px-2 text-[13px] font-medium underline underline-offset-4">{L.clear}</button>
            </div>
          )}
        </div>
      </div>

      <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,0.85fr)]">
        <div className={`container-x py-8 lg:max-w-none lg:pr-8 ${mobileMap ? 'hidden lg:block' : ''}`}>
          <div className="mb-6 flex items-baseline justify-between gap-4">
            <h1 className="font-display text-[34px] font-semibold leading-none">{L.title}</h1>
            <p className="shrink-0 text-[14px] text-ink-soft">{t.explore.results(list.length)}</p>
          </div>
          {list.length ? (
            <div className="grid gap-5 sm:grid-cols-2">{list.map((p) => <PropertyCard key={p.id} p={p} onHover={setHover} />)}</div>
          ) : (
            <div className="rounded-[28px] bg-white p-8 ring-1 ring-black/5">
              <p className="max-w-[48ch] text-[17px]">{t.explore.none}</p>
              <div className="mt-6 flex flex-wrap gap-3">
                <a href={waLink('')} target="_blank" rel="noreferrer" className="btn-wa"><WhatsAppIcon size={16} />{t.explore.askWa}</a>
                <button className="btn-ghost" onClick={() => setParams({})}>{t.explore.clear}</button>
              </div>
            </div>
          )}
        </div>
        <div className={`${mobileMap ? 'block' : 'hidden'} h-[calc(100vh-160px)] lg:sticky lg:top-[160px] lg:block`}>
          <Suspense fallback={<div className="h-full w-full bg-canvas" />}>
            <MapView points={pins} selected={hover} onSelect={(id) => nav(`/property/${id}`)} />
          </Suspense>
        </div>
      </div>

      <button onClick={() => setMobileMap(!mobileMap)} className="btn-primary fixed bottom-6 left-1/2 z-30 -translate-x-1/2 shadow-lift lg:hidden">
        {mobileMap ? <><List size={16} />{t.explore.list}</> : <><MapIcon size={16} />{t.explore.map}</>}
      </button>
      <FiltersSheet open={sheet} onClose={() => setSheet(false)} value={f} onApply={apply} count={(nf) => properties.filter((p) => match(p, q, op, nf)).length} />
    </div>
  )
}
