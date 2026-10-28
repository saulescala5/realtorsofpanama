import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Heart, MapPin, BedDouble, Bath, Ruler, Car, Info, X, ChevronLeft, ChevronRight, ArrowUpRight } from 'lucide-react'
import { useSaved } from '@/lib/saved'
import type { Property } from '@/lib/types'
import { useI18n } from '@/i18n'
import { money } from '@/lib/format'
import { locationName } from '@/lib/locations'
import { waLink } from '@/lib/whatsapp'
import { Img } from './ui'
import { WhatsAppIcon } from './icons'

export const titleOf = (p: Property, lang: string) => (lang === 'es' && p.titleEs) || p.title

const C = {
  en: { photos: 'Photos', video: 'Video', tour: '3D tour', info: 'More info', close: 'Close', view: 'View property', ask: 'Ask', avail: 'Available', hoa: 'HOA', deposit: 'Deposit', now: 'Now', sample: 'Sample', save: 'Save', unsave: 'Remove from saved', prev: 'Previous photo', next: 'Next photo' },
  es: { photos: 'Fotos', video: 'Video', tour: 'Tour 3D', info: 'Más info', close: 'Cerrar', view: 'Ver propiedad', ask: 'Preguntar', avail: 'Disponible', hoa: 'Mantenimiento', deposit: 'Depósito', now: 'Ya', sample: 'Muestra', save: 'Guardar', unsave: 'Quitar de guardadas', prev: 'Foto anterior', next: 'Foto siguiente' },
}

type Mode = 'photos' | 'video' | 'tour'

/** Spec icons row, used on cards and the property page. */
export function Specs({ p, size = 'sm' }: { p: Property; size?: 'sm' | 'lg' }) {
  const items = [
    p.beds > 0 && { I: BedDouble, v: p.beds },
    p.baths > 0 && { I: Bath, v: p.baths },
    p.area > 0 && { I: Ruler, v: `${p.area.toLocaleString('en-US')} m²` },
    p.parking > 0 && { I: Car, v: p.parking },
  ].filter(Boolean) as { I: typeof Bath; v: string | number }[]
  if (!items.length) return null
  return (
    <div className={`flex flex-wrap items-center ${size === 'lg' ? 'gap-2' : 'gap-1.5'}`}>
      {items.map(({ I, v }, i) => (
        <span key={i} className={`inline-flex items-center gap-1.5 rounded-full bg-paper font-semibold ${size === 'lg' ? 'h-10 px-4 text-[15px]' : 'h-8 px-2.5 text-[13px]'}`}>
          <I size={size === 'lg' ? 17 : 15} strokeWidth={2.2} />{v}
        </span>
      ))}
    </div>
  )
}

export function PropertyCard({ p, onHover }: { p: Property; onHover?: (id: string | null) => void }) {
  const { t, lang } = useI18n()
  const L = C[lang]
  const saved = useSaved()
  const on = saved.has(p.id)
  const [mode, setMode] = useState<Mode>('photos')
  const [idx, setIdx] = useState(0)
  const [flip, setFlip] = useState(false)
  const track = useRef<HTMLDivElement>(null)
  const imgs = p.images.slice(0, 12)
  const modes: Mode[] = ['photos', ...(p.videoUrl ? ['video' as const] : []), ...(p.tourUrl ? ['tour' as const] : [])]
  const href = `/property/${p.id}`
  const title = titleOf(p, lang)

  const go = (e: React.MouseEvent, d: number) => {
    e.preventDefault(); e.stopPropagation()
    const el = track.current; if (!el) return
    const n = Math.max(0, Math.min(imgs.length - 1, idx + d))
    el.scrollTo({ left: n * el.clientWidth, behavior: 'smooth' })
  }
  const stop = (e: React.MouseEvent) => { e.preventDefault(); e.stopPropagation() }
  const details = [
    [L.avail, p.availableDate ? new Date(p.availableDate).toLocaleDateString(lang, { month: 'short', day: 'numeric' }) : L.now],
    p.furnishing && [t.property.furnishing, t.furnishing[p.furnishing]],
    p.hoa && [L.hoa, money(p.hoa, lang)],
    p.deposit && [L.deposit, money(p.deposit, lang)],
  ].filter(Boolean) as [string, string][]

  return (
    <div className="group [perspective:1600px]" onMouseEnter={() => onHover?.(p.id)} onMouseLeave={() => onHover?.(null)}>
      <div className={`relative h-full transition-transform duration-700 [transform-style:preserve-3d] ${flip ? '[transform:rotateY(180deg)]' : ''}`}>
        {/* front */}
        <article className="h-full rounded-[26px] bg-white p-2 ring-1 ring-black/5 transition duration-300 [backface-visibility:hidden] group-hover:shadow-lift" aria-hidden={flip}>
          <div className="relative aspect-[4/3] overflow-hidden rounded-[20px] bg-paper">
            {mode === 'photos' && (
              <Link to={href} tabIndex={flip ? -1 : 0} aria-label={title} className="block h-full">
                <div ref={track} onScroll={(e) => setIdx(Math.round(e.currentTarget.scrollLeft / e.currentTarget.clientWidth))}
                  className="no-scrollbar flex h-full snap-x snap-mandatory overflow-x-auto">
                  {(imgs.length ? imgs : ['']).map((src, i) => <Img key={i} src={src} alt={i ? '' : title} className="h-full w-full shrink-0 snap-center" />)}
                </div>
              </Link>
            )}
            {mode === 'video' && p.videoUrl && <video src={p.videoUrl} poster={p.videoPosterUrl || imgs[0]} className="h-full w-full object-cover" autoPlay muted loop playsInline controls />}
            {mode === 'tour' && p.tourUrl && <iframe src={p.tourUrl} title={L.tour} className="h-full w-full" allow="fullscreen; xr-spatial-tracking" allowFullScreen loading="lazy" />}

            {/* top bar */}
            <span className="pointer-events-none absolute left-3 top-3 flex gap-1.5">
              <span className="rounded-full bg-white px-2.5 py-1 text-[12px] font-semibold shadow-sm">{p.operation === 'sale' ? t.common.sale : t.common.rent}</span>
              {p.sample && <span className="rounded-full bg-ink/70 px-2.5 py-1 text-[12px] text-white backdrop-blur">{L.sample}</span>}
            </span>
            {modes.length > 1 && (
              <div className="absolute left-1/2 top-3 flex -translate-x-1/2 gap-0.5 rounded-full bg-black/45 p-0.5 backdrop-blur" role="tablist">
                {modes.map((m) => <button key={m} role="tab" aria-selected={mode === m} onClick={(e) => { stop(e); setMode(m) }}
                  className={`h-7 rounded-full px-2.5 text-[12px] font-medium transition ${mode === m ? 'bg-white text-ink' : 'text-white hover:bg-white/15'}`}>{L[m]}</button>)}
              </div>
            )}
            <button type="button" aria-label={on ? L.unsave : L.save} aria-pressed={on} onClick={(e) => { stop(e); saved.toggle(p.id) }}
              className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-sm transition hover:scale-110 active:scale-95">
              <Heart size={17} className={on ? 'fill-rose-500 text-rose-500' : ''} />
            </button>

            {/* carousel controls */}
            {mode === 'photos' && imgs.length > 1 && (<>
              <button type="button" aria-label={L.prev} onClick={(e) => go(e, -1)} className={`absolute left-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 opacity-0 shadow transition group-hover:opacity-100 ${idx === 0 ? 'invisible' : ''}`}><ChevronLeft size={17} /></button>
              <button type="button" aria-label={L.next} onClick={(e) => go(e, 1)} className={`absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 opacity-0 shadow transition group-hover:opacity-100 ${idx >= imgs.length - 1 ? 'invisible' : ''}`}><ChevronRight size={17} /></button>
              <div className="pointer-events-none absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1">
                {imgs.slice(0, 7).map((_, i) => <i key={i} className={`h-1.5 rounded-full bg-white shadow transition-all ${i === Math.min(idx, 6) ? 'w-4' : 'w-1.5 opacity-60'}`} />)}
              </div>
            </>)}
          </div>

          <div className="flex items-start gap-3 px-3 pb-3 pt-4">
            <Link to={href} tabIndex={flip ? -1 : 0} className="min-w-0 flex-1">
              <p className="text-[22px] font-semibold leading-none tracking-tight">{money(p.price, lang)}{p.operation === 'rent' && <span className="ml-0.5 text-[14px] font-medium text-ink-soft">{t.common.perMonth}</span>}</p>
              <p className="mt-2 truncate text-[15px] font-medium">{title}</p>
              <p className="mt-1 flex items-center gap-1 truncate text-[13px] text-ink-soft"><MapPin size={13} className="shrink-0" />{locationName(p.location)}, {p.city || 'Panamá'} · {t.types[p.type]}</p>
              <div className="mt-3"><Specs p={p} /></div>
            </Link>
            <button type="button" onClick={() => setFlip(true)} aria-label={L.info} title={L.info}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full ring-1 ring-black/10 transition hover:bg-ink hover:text-white"><Info size={17} /></button>
          </div>
        </article>

        {/* back */}
        <article className="absolute inset-0 flex flex-col overflow-hidden rounded-[26px] bg-ink p-5 text-white [backface-visibility:hidden] [transform:rotateY(180deg)]" aria-hidden={!flip}>
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[12px] uppercase tracking-[.14em] text-white/50">{t.types[p.type]} · {p.operation === 'sale' ? t.common.sale : t.common.rent}</p>
              <p className="mt-1.5 line-clamp-2 text-[17px] font-semibold leading-snug">{title}</p>
            </div>
            <button type="button" onClick={() => setFlip(false)} tabIndex={flip ? 0 : -1} aria-label={L.close} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/10 hover:bg-white/20"><X size={17} /></button>
          </div>
          <p className="mt-3 line-clamp-3 text-[13.5px] leading-relaxed text-white/65">{(lang === 'es' && p.descriptionEs) || p.description}</p>
          <dl className="mt-4 grid grid-cols-2 gap-2">
            {details.map(([k, v]) => <div key={k} className="rounded-2xl bg-white/[.07] px-3 py-2"><dt className="text-[11px] text-white/50">{k}</dt><dd className="text-[14px] font-semibold">{v}</dd></div>)}
          </dl>
          {p.amenities.length > 0 && <div className="mt-3 flex flex-wrap gap-1.5 overflow-hidden">{p.amenities.slice(0, 6).map((a) => <span key={a} className="rounded-full bg-white/10 px-2.5 py-1 text-[12px]">{t.amenities[a] ?? a}</span>)}</div>}
          <div className="mt-auto flex gap-2 pt-4">
            <Link to={href} tabIndex={flip ? 0 : -1} className="btn h-11 flex-1 bg-white text-[14px] text-ink hover:bg-white/90">{L.view}<ArrowUpRight size={16} /></Link>
            <a href={waLink(t.property.waText(title, `${location.origin}${href}`))} target="_blank" rel="noreferrer" tabIndex={flip ? 0 : -1} aria-label="WhatsApp" className="btn h-11 w-11 bg-mint-500 p-0 text-white hover:bg-mint-600"><WhatsAppIcon size={18} /></a>
          </div>
        </article>
      </div>
    </div>
  )
}
