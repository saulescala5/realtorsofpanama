import { Link } from 'react-router-dom'
import type { Property } from '@/lib/types'
import { useI18n } from '@/i18n'
import { money } from '@/lib/format'
import { locationName } from '@/lib/locations'
import { Img } from './ui'

export const titleOf = (p: Property, lang: string) => (lang === 'es' && p.titleEs) || p.title

export function PropertyCard({ p, large = false, onHover }: { p: Property; large?: boolean; onHover?: (id: string | null) => void }) {
  const { t, lang } = useI18n()
  const specs = [p.beds > 0 && `${p.beds} ${t.common.beds.toLowerCase()}`, p.baths > 0 && `${p.baths} ${t.common.baths.toLowerCase()}`, p.area > 0 && `${p.area.toLocaleString()} m²`].filter(Boolean).join(', ')
  return (
    <Link to={`/property/${p.id}`} className="group block" onMouseEnter={() => onHover?.(p.id)} onMouseLeave={() => onHover?.(null)}>
      <div className={`relative overflow-hidden rounded-[3px] bg-canvas ${large ? 'aspect-[16/10]' : 'aspect-[4/3]'}`}>
        <Img src={p.images[0]} alt={titleOf(p, lang)} className="h-full w-full transition duration-700 group-hover:scale-[1.03]" />
        <span className="absolute left-3 top-3 bg-white px-2 py-0.5 text-[12px] font-medium text-ink">{p.operation === 'sale' ? t.common.sale : t.common.rent}</span>
      </div>
      <div className="pt-4">
        <p className="text-[13px] text-ink-soft">{locationName(p.location)} · {t.types[p.type]}</p>
        <p className={`mt-1 font-display font-medium leading-snug text-ink ${large ? 'text-[26px]' : 'text-[21px]'}`}>{titleOf(p, lang)}</p>
        <p className="mt-2 flex flex-wrap items-baseline justify-between gap-x-4 text-[14px]">
          <span className="font-medium text-ink">{money(p.price, lang)}{p.operation === 'rent' && <span className="text-ink-soft">{t.common.perMonth}</span>}</span>
          {specs && <span className="text-ink-soft">{specs}</span>}
        </p>
      </div>
    </Link>
  )
}
