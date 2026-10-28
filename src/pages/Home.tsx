import { lazy, Suspense, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Search, MessageCircle } from 'lucide-react'
import { useI18n } from '@/i18n'
import { useStore } from '@/lib/store'
import { waLink } from '@/lib/whatsapp'
import { NEIGHBORHOODS, tr } from '@/lib/neighborhoods'
import { PropertyCard } from '@/components/PropertyCard'

const MapView = lazy(() => import('@/components/MapView'))

export default function Home() {
  const { t, lang } = useI18n()
  const { publicProperties } = useStore()
  const nav = useNavigate()
  const [q, setQ] = useState('')
  const [op, setOp] = useState<'rent' | 'sale'>('rent')
  const H = t.home
  const featured = [...publicProperties].sort((a, b) => Number(b.featured) - Number(a.featured) || b.createdAt.localeCompare(a.createdAt)).slice(0, 7)
  const guides = NEIGHBORHOODS.filter((n) => n.featured)
  const countIn = (slug: string) => publicProperties.filter((p) => p.location === slug).length
  const hoodPins = useMemo(() => guides.filter((n) => n.lng > -79.545 && n.lng < -79.46).map((n) => ({ id: n.slug, lat: n.lat, lng: n.lng, label: n.name })), []) // eslint-disable-line react-hooks/exhaustive-deps
  const go = () => nav(`/properties?op=${op}${q.trim() ? `&q=${encodeURIComponent(q.trim())}` : ''}`)

  return (
    <>
      {/* hero: the city itself */}
      <section className="relative min-h-[680px] overflow-hidden bg-night text-white sm:min-h-[760px]">
        <div className="absolute inset-0" aria-hidden>
          <Suspense fallback={null}>
            <MapView dark interactive={false} points={hoodPins} pinClass="hood-pin" center={[-79.552, 8.988]} zoom={12.7} onSelect={(slug) => nav(`/neighborhoods/${slug}`)} />
          </Suspense>
        </div>
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black from-30% via-black/70 via-50% to-transparent" />
        <div className="container-x relative flex min-h-[680px] flex-col justify-end pb-16 pt-32 sm:min-h-[760px] sm:pb-20">
          <h1 className="h-display max-w-[15ch] animate-rise">{H.title}</h1>
          <p className="mt-6 max-w-[52ch] text-[17px] text-white/70">{H.sub}</p>

          <form onSubmit={(e) => { e.preventDefault(); go() }} className="mt-10 flex max-w-2xl flex-col bg-white text-ink sm:flex-row">
            <div className="flex border-b border-line sm:border-b-0 sm:border-r">
              {(['rent', 'sale'] as const).map((o) => (
                <button key={o} type="button" onClick={() => setOp(o)} aria-pressed={op === o}
                  className={`h-14 flex-1 px-5 text-[14px] font-medium transition sm:flex-none ${op === o ? 'bg-ink text-white' : 'text-ink-soft hover:text-ink'}`}>
                  {o === 'rent' ? t.nav.rent : t.nav.buy}
                </button>
              ))}
            </div>
            <label className="flex h-14 shrink-0 items-center gap-3 px-4 sm:flex-1">
              <Search size={18} className="shrink-0 text-ink-mute" />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={H.searchPh} className="h-full w-full bg-transparent text-[15px] outline-none" aria-label={H.searchPh} />
            </label>
            <button className="btn-gold h-14 px-8">{H.search}</button>
          </form>
          <a href={waLink('')} target="_blank" rel="noreferrer" className="pointer-events-auto mt-5 inline-flex w-fit items-center gap-2 text-[14px] text-white/75 underline decoration-white/30 underline-offset-4 hover:text-white">
            <MessageCircle size={16} className="text-mint-400" />{H.ctaWa}
          </a>
        </div>
      </section>

      {/* selected properties */}
      {featured.length > 0 && (
        <section className="container-x py-20 sm:py-28">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <h2 className="h-section">{H.featured}</h2>
              <p className="mt-3 max-w-[56ch] text-ink-soft">{H.featuredSub}</p>
            </div>
            <Link to="/properties" className="link">{H.seeAll}</Link>
          </div>
          <div className="mt-12 grid gap-x-8 gap-y-14 lg:grid-cols-3">
            <div className="lg:col-span-2 lg:row-span-2"><PropertyCard p={featured[0]} large /></div>
            {featured.slice(1).map((p) => <PropertyCard key={p.id} p={p} />)}
          </div>
        </section>
      )}

      {/* neighborhoods */}
      <section className="bg-canvas py-20 sm:py-28">
        <div className="container-x grid gap-12 lg:grid-cols-[1fr_1.4fr]">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <h2 className="h-section">{H.hoodsTitle}</h2>
            <p className="mt-4 max-w-[44ch] text-ink-soft">{H.hoodsSub}</p>
            <Link to="/neighborhoods" className="link mt-6 inline-block">{H.allHoods}</Link>
          </div>
          <ul className="border-t border-ink/15">
            {guides.map((n) => (
              <li key={n.slug} className="border-b border-ink/15">
                <Link to={`/neighborhoods/${n.slug}`} className="group flex items-baseline justify-between gap-6 py-6">
                  <span>
                    <span className="block font-display text-[26px] leading-tight transition group-hover:text-brand-700 sm:text-[30px]">{n.name}</span>
                    <span className="mt-1 block text-[14px] text-ink-soft">{tr(n.tagline, lang)}</span>
                  </span>
                  <span className="shrink-0 text-right text-[13px] text-ink-mute">{t.hoods.listings(countIn(n.slug))}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* services */}
      <section className="container-x py-20 sm:py-28">
        <h2 className="h-section max-w-[18ch]">{H.servicesTitle}</h2>
        <div className="mt-14 grid gap-x-10 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
          {H.services.map((s) => (
            <div key={s.t} className="border-t border-ink pt-6">
              <h3 className="font-display text-[24px]">{s.t}</h3>
              <p className="mt-3 text-[15px] text-ink-soft">{s.d}</p>
            </div>
          ))}
        </div>
        <div className="mt-16 flex flex-wrap gap-3">
          <Link to="/properties?op=rent" className="btn-primary">{t.nav.rent}</Link>
          <Link to="/properties?op=sale" className="btn-ghost">{t.nav.buy}</Link>
          <Link to="/list-your-property" className="btn-ghost">{H.ownerCta}</Link>
        </div>
      </section>

      {/* why us */}
      <section className="border-t border-line">
        <div className="container-x grid gap-12 py-20 sm:py-28 lg:grid-cols-[1fr_1.4fr]">
          <h2 className="h-section">{H.betterTitle}</h2>
          <dl className="grid gap-x-10 gap-y-10 sm:grid-cols-2">
            {H.better.map((b) => (
              <div key={b.t}>
                <dt className="text-[17px] font-medium">{b.t}</dt>
                <dd className="mt-2 text-[15px] text-ink-soft">{b.d}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* network */}
      <section className="bg-night text-white">
        <div className="container-x grid gap-10 py-20 sm:py-28 lg:grid-cols-[1.3fr_1fr] lg:items-end">
          <div>
            <h2 className="h-section max-w-[20ch]">{H.networkTitle}</h2>
            <p className="mt-5 max-w-[58ch] text-white/65">{H.networkSub}</p>
          </div>
          <div className="flex flex-wrap gap-3 lg:justify-end">
            <Link to="/work-with-us" className="btn-gold">{H.networkCta}</Link>
            <a href={waLink(t.network.waText)} target="_blank" rel="noreferrer" className="btn-outline-light"><MessageCircle size={16} />WhatsApp</a>
          </div>
        </div>
      </section>
    </>
  )
}
