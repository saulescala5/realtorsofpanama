import { Link } from 'react-router-dom'
import { ArrowUpRight, Home as HomeIcon, Car } from 'lucide-react'
import { useI18n } from '@/i18n'
import { useStore } from '@/lib/store'
import { NEIGHBORHOODS, tr, type Neighborhood } from '@/lib/neighborhoods'
import { MARKET, TAGS, range } from '@/lib/market'
import { Img } from './ui'

const C = {
  en: { rent: '2BR rent', sale: 'Buy / m²', homes: (n: number) => `${n} ${n === 1 ? 'home' : 'homes'}`, min: 'min to Calle 50', mo: '/mo' },
  es: { rent: 'Alquiler 2 rec.', sale: 'Compra / m²', homes: (n: number) => `${n} ${n === 1 ? 'propiedad' : 'propiedades'}`, min: 'min a Calle 50', mo: '/mes' },
}

export function HoodCard({ n }: { n: Neighborhood }) {
  const { lang } = useI18n()
  const { publicProperties } = useStore()
  const L = C[lang]
  const m = MARKET[n.slug]
  const count = publicProperties.filter((p) => p.location === n.slug).length
  return (
    <Link to={`/neighborhoods/${n.slug}`} className="group flex flex-col rounded-[26px] bg-white p-2 ring-1 ring-black/5 transition duration-300 hover:-translate-y-1 hover:shadow-lift">
      <div className="relative aspect-[4/3] overflow-hidden rounded-[20px] bg-paper">
        <Img src={`/hoods/hood-${n.slug}.jpg`} alt={n.name} className="h-full w-full transition duration-700 group-hover:scale-105" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        <p className="font-display absolute bottom-3 left-4 text-[30px] font-semibold leading-none text-white">{n.name}</p>
        <span className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-sm transition group-hover:bg-ink group-hover:text-white"><ArrowUpRight size={17} /></span>
      </div>
      <div className="flex flex-1 flex-col px-3 pb-3 pt-4">
        <p className="text-[14px] text-ink-soft">{tr(n.tagline, lang)}</p>
        {m && (<>
          <dl className="mt-4 grid grid-cols-2 gap-2">
            <div className="rounded-2xl bg-paper px-3 py-2.5"><dt className="text-[12px] text-ink-soft">{L.rent}</dt><dd className="text-[15px] font-semibold">{range(m.rent2br)}<span className="text-[12px] font-normal text-ink-soft">{L.mo}</span></dd></div>
            <div className="rounded-2xl bg-paper px-3 py-2.5"><dt className="text-[12px] text-ink-soft">{L.sale}</dt><dd className="text-[15px] font-semibold">{range(m.saleM2)}</dd></div>
          </dl>
          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px] text-ink-soft">
            <span className="flex items-center gap-1.5 font-medium text-ink"><HomeIcon size={14} />{L.homes(count)}</span>
            <span className="flex items-center gap-1.5"><Car size={14} />{m.toCalle50} {L.min}</span>
          </div>
          <div className="mt-3 flex flex-wrap gap-1.5">{m.vibe.map((v) => <span key={v} className="rounded-full px-2.5 py-1 text-[12px] ring-1 ring-black/10">{TAGS[v][lang]}</span>)}</div>
        </>)}
      </div>
    </Link>
  )
}

export function HoodCards({ limit = 8 }: { limit?: number }) {
  const list = NEIGHBORHOODS.filter((n) => n.featured).slice(0, limit)
  return <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{list.map((n) => <HoodCard key={n.slug} n={n} />)}</div>
}
