import { Link } from 'react-router-dom'
import { BedDouble, Bath, Maximize, Star, PlayCircle } from 'lucide-react'
import type { Property } from '@/lib/types'
import { useI18n } from '@/i18n'
import { money } from '@/lib/format'
import { locationName } from '@/lib/locations'
import { Img } from './ui'

export const titleOf = (p: Property, lang: string) => (lang === 'es' && p.titleEs) || p.title

export function PropertyCard({ p }: { p: Property }) {
  const { t, lang } = useI18n()
  return (
    <Link to={`/property/${p.id}`} className="group block">
      <div className="relative aspect-[4/3] overflow-hidden rounded-3xl bg-canvas">
        <Img src={p.images[0]} alt={titleOf(p, lang)} className="h-full w-full transition duration-500 group-hover:scale-[1.04]" />
        <div className="absolute inset-x-3 top-3 flex flex-wrap gap-1.5">
          <span className="chip bg-white/95 text-ink shadow-sm backdrop-blur">{p.operation === 'sale' ? t.common.sale : t.common.rent}</span>
          {p.featured && <span className="chip bg-sun-400 text-ink shadow-sm"><Star size={11} className="fill-current" />{t.common.featured}</span>}
        </div>
        {p.videoUrl && <span className="chip absolute bottom-3 left-3 bg-ink/75 text-white backdrop-blur"><PlayCircle size={13} />Video</span>}
      </div>
      <div className="px-1 pt-3">
        <div className="flex items-baseline justify-between gap-2">
          <p className="text-lg font-extrabold tracking-tight">
            {money(p.price, lang)}{p.operation === 'rent' && <span className="text-sm font-semibold text-ink-soft">{t.common.perMonth}</span>}
          </p>
          <span className="text-xs font-semibold text-ink-mute">{t.types[p.type]}</span>
        </div>
        <p className="mt-0.5 truncate text-[15px] font-semibold text-ink">{titleOf(p, lang)}</p>
        <p className="truncate text-sm text-ink-soft">{locationName(p.location)}, {p.city}</p>
        <div className="mt-2 flex items-center gap-3.5 text-[13px] text-ink-soft">
          {p.beds > 0 && <span className="flex items-center gap-1"><BedDouble size={15} />{p.beds}</span>}
          {p.baths > 0 && <span className="flex items-center gap-1"><Bath size={15} />{p.baths}</span>}
          {p.area > 0 && <span className="flex items-center gap-1"><Maximize size={14} />{p.area.toLocaleString()} {t.common.area}</span>}
        </div>
      </div>
    </Link>
  )
}
