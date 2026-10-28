import { lazy, Suspense, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { MessageCircle, ArrowUpRight } from 'lucide-react'
import { useI18n } from '@/i18n'
import { useStore } from '@/lib/store'
import { NEIGHBORHOODS, hood, tr } from '@/lib/neighborhoods'
import { coordsOf, shortPrice } from '@/lib/geo'
import { waLink } from '@/lib/whatsapp'
import { PropertyCard } from '@/components/PropertyCard'

const City3D = lazy(() => import('@/components/City3D'))

export function NeighborhoodList() {
  const { t, lang } = useI18n()
  const { publicProperties } = useStore()
  const nav = useNavigate()
  const [area, setArea] = useState<string | null>(null)
  const guides = NEIGHBORHOODS.filter((n) => n.featured)
  const focus = area ? hood(area) ?? null : null
  return (
    <>
      <section className="container-x pt-10 sm:pt-16">
        <h1 className="h-display max-w-[10ch]">{t.hoods.title}</h1>
        <p className="mt-6 max-w-[52ch] text-[18px] text-ink-soft">{t.hoods.sub}</p>
      </section>
      <section className="container-x grid gap-8 py-14 lg:grid-cols-[1fr_1.1fr]">
        <ul className="divide-y divide-black/10 border-y border-black/10">
          {guides.map((n) => (
            <li key={n.slug}>
              <Link to={`/neighborhoods/${n.slug}`} onMouseEnter={() => setArea(n.slug)} onFocus={() => setArea(n.slug)}
                className="group flex items-center justify-between gap-6 py-5">
                <span>
                  <span className={`font-display block text-[34px] font-semibold leading-none transition sm:text-[42px] ${area === n.slug ? 'text-ink' : 'text-ink/70 group-hover:text-ink'}`}>{n.name}</span>
                  <span className="mt-2 block text-[15px] text-ink-soft">{tr(n.tagline, lang)}</span>
                </span>
                <span className="flex shrink-0 items-center gap-2 text-[13px] text-ink-mute">{t.hoods.listings(publicProperties.filter((p) => p.location === n.slug).length)}<ArrowUpRight size={16} className="transition group-hover:rotate-45" /></span>
              </Link>
            </li>
          ))}
        </ul>
        <div className="sticky top-24 hidden h-[calc(100vh-8rem)] overflow-hidden rounded-5xl bg-white ring-1 ring-black/5 lg:block">
          <Suspense fallback={null}><City3D theme="light" focus={focus} zoom={13.6} points={guides.map((n) => ({ id: n.slug, lat: n.lat, lng: n.lng, label: n.name }))} onSelect={(s) => nav(`/neighborhoods/${s}`)} /></Suspense>
        </div>
      </section>
    </>
  )
}

export function NeighborhoodPage() {
  const { slug = '' } = useParams()
  const { t, lang } = useI18n()
  const { publicProperties } = useStore()
  const nav = useNavigate()
  const n = hood(slug)
  if (!n) return <div className="container-x py-24"><Link to="/neighborhoods" className="link">{t.hoods.title}</Link></div>
  const here = publicProperties.filter((p) => p.location === n.slug)
  const pins = here.flatMap((p) => { const c = coordsOf(p); return c ? [{ id: p.id, ...c, label: shortPrice(p) }] : [] })
  const others = NEIGHBORHOODS.filter((x) => x.featured && x.slug !== n.slug)

  return (
    <>
      <section className="container-x pt-10 sm:pt-16">
        <Link to="/neighborhoods" className="text-[14px] text-ink-soft hover:text-ink">{t.hoods.title}</Link>
        <h1 className="h-display mt-4 animate-[lineup_.9s_cubic-bezier(.2,.7,.1,1)_both]">{n.name}</h1>
        {n.tagline && <p className="mt-5 max-w-[34ch] text-[22px] leading-snug sm:text-[26px]">{tr(n.tagline, lang)}</p>}
      </section>

      <section className="mx-auto mt-12 max-w-[1320px] px-3 sm:px-10">
        <div className="h-[56vh] min-h-[380px] overflow-hidden rounded-5xl bg-white ring-1 ring-black/5">
          <Suspense fallback={null}><City3D key={n.slug} theme="light" center={[n.lng, n.lat]} zoom={15.2} points={pins} onSelect={(id) => nav(`/property/${id}`)} /></Suspense>
        </div>
      </section>

      <section className="container-x grid gap-12 py-20 lg:grid-cols-[1.2fr_1fr]">
        {n.about && <p className="max-w-[56ch] text-[20px] leading-relaxed">{tr(n.about, lang)}</p>}
        <div className="space-y-3">
          {n.highlights?.[lang].map((h) => <p key={h} className="rounded-2xl bg-white px-5 py-4 text-[17px] ring-1 ring-black/5">{h}</p>)}
          {n.bestFor && <div className="rounded-2xl bg-ink px-5 py-4 text-white"><p className="text-[13px] text-white/50">{t.hoods.bestFor}</p><p className="mt-1 text-[17px]">{tr(n.bestFor, lang)}</p></div>}
        </div>
      </section>

      <section className="container-x pb-24">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <h2 className="h-sub">{t.hoods.available} {n.name}</h2>
          <a href={waLink(t.hoods.ask(n.name))} target="_blank" rel="noreferrer" className="btn-primary"><MessageCircle size={16} />{t.hoods.askCta}</a>
        </div>
        {here.length ? <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{here.map((p) => <PropertyCard key={p.id} p={p} />)}</div>
          : <p className="mt-6 max-w-[50ch] rounded-[28px] bg-white p-8 text-[17px] ring-1 ring-black/5">{t.hoods.none}</p>}
      </section>

      <section className="border-t border-black/10 bg-white">
        <div className="container-x flex flex-wrap gap-2 py-10">
          {others.map((o) => <Link key={o.slug} to={`/neighborhoods/${o.slug}`} className="rounded-full px-4 py-2 text-[15px] ring-1 ring-black/10 hover:bg-ink hover:text-white">{o.name}</Link>)}
        </div>
      </section>
    </>
  )
}
