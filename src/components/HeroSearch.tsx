import { useEffect, useRef, useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronDown, Search, Sparkles, SlidersHorizontal } from 'lucide-react'
import { useI18n } from '@/i18n'
import type { PropertyType } from '@/lib/types'
import { SmartSearch } from './SmartSearch'

const TYPES: PropertyType[] = ['apartment', 'house', 'penthouse', 'studio', 'land', 'commercial', 'office']
const PRICES = { rent: [800, 1200, 1500, 2000, 3000, 5000], sale: [150000, 250000, 400000, 600000, 1000000, 2000000] }
const L = {
  en: { filters: 'Filters', describe: 'Describe it', rent: 'Rent', buy: 'Buy', type: 'Type', anyType: 'Any type', price: 'Price', anyPrice: 'Any price', upTo: 'Up to', beds: 'Beds', baths: 'Baths', any: 'Any', search: 'Search', clear: 'Clear' },
  es: { filters: 'Filtros', describe: 'Descríbela', rent: 'Alquilar', buy: 'Comprar', type: 'Tipo', anyType: 'Cualquier tipo', price: 'Precio', anyPrice: 'Cualquier precio', upTo: 'Hasta', beds: 'Rec.', baths: 'Baños', any: 'Cualquiera', search: 'Buscar', clear: 'Limpiar' },
}
const fmt = (n: number) => (n >= 1_000_000 ? `$${n / 1_000_000}M` : n >= 10_000 ? `$${n / 1000}K` : `$${n.toLocaleString('en-US')}`)

/** A field that opens a small panel below it. Closes on outside click or Escape. */
function Field({ label, value, children, wide = false, right = false }: { label: string; value: string; children: (close: () => void) => ReactNode; wide?: boolean; right?: boolean }) {
  const [open, setOpen] = useState(false)
  const box = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!open) return
    const out = (e: MouseEvent) => { if (!box.current?.contains(e.target as Node)) setOpen(false) }
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('mousedown', out); document.addEventListener('keydown', esc)
    return () => { document.removeEventListener('mousedown', out); document.removeEventListener('keydown', esc) }
  }, [open])
  return (
    <div ref={box} className="relative min-w-0 flex-1">
      <button type="button" onClick={() => setOpen(!open)} aria-expanded={open}
        className={`flex w-full flex-col items-start rounded-2xl px-4 py-2.5 text-left transition ${open ? 'bg-paper' : 'hover:bg-paper'}`}>
        <span className="text-[12px] text-ink-mute">{label}</span>
        <span className="flex w-full items-center justify-between gap-2 text-[15px] font-medium">{value}<ChevronDown size={15} className={`shrink-0 text-ink-mute transition ${open ? 'rotate-180' : ''}`} /></span>
      </button>
      {open && (
        <div className={`absolute top-[calc(100%+8px)] z-50 max-h-[360px] animate-rise overflow-y-auto rounded-3xl bg-white p-3 shadow-[0_30px_60px_-20px_rgba(0,0,0,.35)] ring-1 ring-black/5 ${right ? 'right-0' : 'left-0'} ${wide ? 'w-[300px]' : 'w-[260px]'}`}>
          {children(() => setOpen(false))}
        </div>
      )}
    </div>
  )
}

function Chips<T extends string | number>({ options, value, onPick, label }: { options: [T, string][]; value: T; onPick: (v: T) => void; label?: string }) {
  return (
    <div className="flex flex-wrap gap-1.5" role="radiogroup" aria-label={label}>
      {options.map(([v, l]) => (
        <button key={String(v)} type="button" role="radio" aria-checked={value === v} onClick={() => onPick(v)}
          className={`h-10 min-w-10 rounded-full px-3.5 text-[14px] transition ${value === v ? 'bg-ink text-white' : 'bg-paper hover:bg-black/10'}`}>{l}</button>
      ))}
    </div>
  )
}

export function HeroSearch({ compact = false }: { compact?: boolean }) {
  const { t, lang } = useI18n()
  const C = L[lang]
  const nav = useNavigate()
  const [mode, setMode] = useState<'filters' | 'describe'>('filters')
  const [op, setOp] = useState<'rent' | 'sale'>('rent')
  const [type, setType] = useState<PropertyType | ''>('')
  const [max, setMax] = useState(0)
  const [beds, setBeds] = useState(0)
  const [baths, setBaths] = useState(0)
  useEffect(() => setMax(0), [op])

  const go = () => {
    const p = new URLSearchParams({ op })
    if (type) p.set('type', type)
    if (max) p.set('max', String(max))
    if (beds) p.set('beds', String(beds))
    if (baths) p.set('baths', String(baths))
    nav(`/properties?${p}`)
  }
  const nums: [number, string][] = [[0, C.any], [1, '1+'], [2, '2+'], [3, '3+'], [4, '4+']]
  const tab = (m: typeof mode) => `flex h-10 items-center gap-2 rounded-full px-4 text-[14px] font-medium transition ${mode === m ? 'bg-ink text-white' : 'text-ink-soft hover:text-ink'}`

  return (
    <div className={`w-full text-left ${compact ? '' : 'mx-auto max-w-[920px]'}`}>
      <div className={`mb-3 flex gap-1 ${compact ? '' : 'justify-center'}`}>
        <button type="button" className={tab('filters')} onClick={() => setMode('filters')}><SlidersHorizontal size={15} />{C.filters}</button>
        <button type="button" className={tab('describe')} onClick={() => setMode('describe')}><Sparkles size={15} />{C.describe}</button>
      </div>
      {mode === 'describe' ? <SmartSearch dark={false} /> : (
        <form onSubmit={(e) => { e.preventDefault(); go() }} className="rounded-[28px] bg-white p-2 shadow-[0_30px_70px_-35px_rgba(0,0,0,.35)] ring-1 ring-black/5">
          <div className={`flex flex-col gap-1 ${compact ? '' : 'md:flex-row md:items-center'}`}>
            <div className="flex shrink-0 gap-0.5 rounded-full bg-paper p-1" role="radiogroup" aria-label={C.rent + ' / ' + C.buy}>
              {(['rent', 'sale'] as const).map((o) => (
                <button key={o} type="button" role="radio" aria-checked={op === o} onClick={() => setOp(o)}
                  className={`h-11 flex-1 rounded-full px-5 text-[15px] font-medium transition ${compact ? '' : 'md:flex-none'} ${op === o ? 'bg-white shadow-sm' : 'text-ink-soft'}`}>{o === 'rent' ? C.rent : C.buy}</button>
              ))}
            </div>
            <div className={compact ? 'grid grid-cols-2 sm:grid-cols-3' : 'grid grid-cols-2 md:flex md:flex-1 md:divide-x md:divide-black/5'}>
              <Field label={C.type} value={type ? t.types[type] : C.anyType}>
                {(close) => (
                  <div className="grid gap-0.5">
                    {([['', C.anyType], ...TYPES.map((x) => [x, t.types[x]])] as [PropertyType | '', string][]).map(([v, l]) => (
                      <button key={v || 'any'} type="button" onClick={() => { setType(v); close() }}
                        className={`rounded-xl px-3 py-2.5 text-left text-[15px] transition ${type === v ? 'bg-ink text-white' : 'hover:bg-paper'}`}>{l}</button>
                    ))}
                  </div>
                )}
              </Field>
              <Field label={C.price} value={max ? `${C.upTo} ${fmt(max)}` : C.anyPrice} right>
                {(close) => (
                  <div className="grid grid-cols-2 gap-1.5">
                    {[0, ...PRICES[op]].map((v) => (
                      <button key={v} type="button" onClick={() => { setMax(v); close() }}
                        className={`rounded-xl px-3 py-2.5 text-[14px] transition ${max === v ? 'bg-ink text-white' : 'bg-paper hover:bg-black/10'}`}>{v ? `${C.upTo} ${fmt(v)}${op === 'rent' ? t.common.perMonth : ''}` : C.anyPrice}</button>
                    ))}
                  </div>
                )}
              </Field>
              <Field label={`${C.beds} · ${C.baths}`} value={`${beds ? beds + '+' : C.any} · ${baths ? baths + '+' : C.any}`} wide right>
                {() => (
                  <div className="space-y-3 p-1">
                    <div><p className="mb-2 text-[13px] text-ink-soft">{t.admin.editor.beds}</p><Chips options={nums} value={beds} onPick={setBeds} label={C.beds} /></div>
                    <div><p className="mb-2 text-[13px] text-ink-soft">{t.admin.editor.baths}</p><Chips options={nums} value={baths} onPick={setBaths} label={C.baths} /></div>
                  </div>
                )}
              </Field>
            </div>
            <button className={`btn-primary h-14 shrink-0 rounded-[22px] px-7 text-[16px] ${compact ? 'w-full' : ''}`}><Search size={18} />{C.search}</button>
          </div>
        </form>
      )}
    </div>
  )
}
