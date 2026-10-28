import { Link } from 'react-router-dom'
import { Heart } from 'lucide-react'
import { useSaved } from '@/lib/saved'
import type { Property } from '@/lib/types'
import { useI18n } from '@/i18n'
import { money } from '@/lib/format'
import { locationName } from '@/lib/locations'
import { Img } from './ui'

export const titleOf = (p: Property, lang: string) => (lang === 'es' && p.titleEs) || p.title

export function PropertyCard({ p, onHover }: { p: Property; onHover?: (id: string | null) => void }) {
  const { t, lang } = useI18n()
  const saved = useSaved()
  const on = saved.has(p.id)
  const specs = [p.beds > 0 && `${p.beds} ${t.common.beds.toLowerCase()}`, p.baths > 0 && `${p.baths} ${t.common.baths.toLowerCase()}`, p.area > 0 && `${p.area.toLocaleString()} m²`].filter(Boolean).join(' · ')
  return (
    <Link to={`/property/${p.id}`} onMouseEnter={() => onHover?.(p.id)} onMouseLeave={() => onHover?.(null)}
      className="group block rounded-[28px] bg-white p-2 ring-1 ring-black/5 transition duration-300 hover:-translate-y-1 hover:shadow-lift">
      <div className="relative aspect-[4/3] overflow-hidden rounded-[22px] bg-paper">
        <Img src={p.images[0]} alt={titleOf(p, lang)} className="h-full w-full transition duration-700 group-hover:scale-105" />
        <span className="absolute left-3 top-3 flex gap-1.5">
          <span className="rounded-full bg-white/90 px-3 py-1 text-[12px] font-medium backdrop-blur">{p.operation === 'sale' ? t.common.sale : t.common.rent}</span>
          {p.sample && <span className="rounded-full bg-ink/70 px-3 py-1 text-[12px] text-white backdrop-blur">{lang === 'es' ? 'Muestra' : 'Sample'}</span>}
        </span>
        <button type="button" aria-label={on ? (lang === 'es' ? 'Quitar de guardadas' : 'Remove from saved') : (lang === 'es' ? 'Guardar' : 'Save')} aria-pressed={on}
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); saved.toggle(p.id) }}
          className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 backdrop-blur transition hover:scale-110 active:scale-95">
          <Heart size={18} className={on ? 'fill-rose-500 text-rose-500' : ''} />
        </button>
      </div>
      <div className="p-4">
        <div className="flex items-baseline justify-between gap-3">
          <p className="text-[13px] text-ink-mute">{locationName(p.location)} · {t.types[p.type]}</p>
          <p className="shrink-0 text-[16px] font-semibold">{money(p.price, lang)}{p.operation === 'rent' && <span className="text-[13px] font-normal text-ink-soft">{t.common.perMonth}</span>}</p>
        </div>
        <p className="mt-1.5 truncate text-[17px] font-medium">{titleOf(p, lang)}</p>
        {specs && <p className="mt-1 text-[14px] text-ink-soft">{specs}</p>}
      </div>
    </Link>
  )
}
