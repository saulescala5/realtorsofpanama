import { Link } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'
import { useI18n } from '@/i18n'
import { useStore } from '@/lib/store'
import { NEIGHBORHOODS, tr } from '@/lib/neighborhoods'
import { Img } from './ui'
import { MARKET, range } from '@/lib/market'

/** Photo cards for neighborhoods; the first is large. Images: /hoods/hood-<slug>.jpg */
export function HoodCards({ limit = 8 }: { limit?: number }) {
  const { lang, t } = useI18n()
  const { publicProperties } = useStore()
  const list = NEIGHBORHOODS.filter((n) => n.featured).slice(0, limit)
  return (
    <div className="grid auto-rows-[260px] gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {list.map((n, i) => {
        const count = publicProperties.filter((p) => p.location === n.slug).length
        return (
          <Link key={n.slug} to={`/neighborhoods/${n.slug}`}
            className={`group relative overflow-hidden rounded-[28px] bg-ink text-white ${i === 0 ? 'sm:col-span-2 sm:row-span-2' : ''} ${i === 3 ? 'lg:col-span-2' : ''}`}>
            <Img src={`/hoods/hood-${n.slug}.jpg`} alt="" className="absolute inset-0 h-full w-full opacity-90 transition duration-700 group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
            <span className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/15 backdrop-blur transition group-hover:bg-white group-hover:text-ink"><ArrowUpRight size={18} /></span>
            <div className="absolute inset-x-5 bottom-5">
              <p className={`font-display font-semibold leading-none ${i === 0 ? 'text-[48px] sm:text-[64px]' : 'text-[30px]'}`}>{n.name}</p>
              <p className="mt-2 max-w-[40ch] text-[14px] text-white/75">{tr(n.tagline, lang)}</p>
              <div className="mt-3 flex flex-wrap gap-1.5 text-[12px]">
                {MARKET[n.slug] && <span className="rounded-full bg-white/15 px-2.5 py-1 backdrop-blur">2BR {range(MARKET[n.slug].rent2br)}{t.common.perMonth}</span>}
                <span className="rounded-full bg-white/15 px-2.5 py-1 backdrop-blur">{t.hoods.listings(count)}</span>
              </div>
            </div>
          </Link>
        )
      })}
    </div>
  )
}
