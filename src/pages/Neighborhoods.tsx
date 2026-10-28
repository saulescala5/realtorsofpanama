import { lazy, Suspense } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { MessageCircle } from 'lucide-react'
import { useI18n } from '@/i18n'
import { useStore } from '@/lib/store'
import { NEIGHBORHOODS, hood, tr } from '@/lib/neighborhoods'
import { coordsOf, shortPrice } from '@/lib/geo'
import { waLink } from '@/lib/whatsapp'
import { PropertyCard } from '@/components/PropertyCard'

const MapView = lazy(() => import('@/components/MapView'))

export function NeighborhoodList() {
  const { t, lang } = useI18n()
  const { publicProperties } = useStore()
  const nav = useNavigate()
  const guides = NEIGHBORHOODS.filter((n) => n.featured)
  return (
    <>
      <section className="container-x py-14 sm:py-20">
        <h1 className="h-section">{t.hoods.title}</h1>
        <p className="mt-4 max-w-[56ch] text-[17px] text-ink-soft">{t.hoods.sub}</p>
      </section>
      <div className="h-[420px] border-y border-line">
        <Suspense fallback={<div className="h-full bg-canvas" />}>
          <MapView points={guides.map((n) => ({ id: n.slug, lat: n.lat, lng: n.lng, label: n.name }))} onSelect={(s) => nav(`/neighborhoods/${s}`)} />
        </Suspense>
      </div>
      <section className="container-x grid gap-x-10 gap-y-14 py-16 sm:grid-cols-2 lg:grid-cols-3 sm:py-20">
        {guides.map((n) => (
          <Link key={n.slug} to={`/neighborhoods/${n.slug}`} className="group border-t border-ink pt-6">
            <h2 className="font-display text-[28px] leading-tight transition group-hover:text-brand-700">{n.name}</h2>
            <p className="mt-2 text-[15px] text-ink-soft">{tr(n.tagline, lang)}</p>
            <p className="mt-4 text-[13px] text-ink-mute">{t.hoods.listings(publicProperties.filter((p) => p.location === n.slug).length)}</p>
          </Link>
        ))}
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
  const others = NEIGHBORHOODS.filter((x) => x.featured && x.slug !== n.slug).slice(0, 6)

  return (
    <>
      <section className="bg-night text-white">
        <div className="container-x grid gap-10 py-16 sm:py-24 lg:grid-cols-[1.2fr_1fr] lg:items-end">
          <div>
            <Link to="/neighborhoods" className="text-[14px] text-white/60 hover:text-white">{t.hoods.title}</Link>
            <h1 className="h-display mt-4">{n.name}</h1>
            {n.tagline && <p className="mt-5 max-w-[40ch] font-display text-[24px] leading-snug text-brand-300">{tr(n.tagline, lang)}</p>}
          </div>
          {n.about && <p className="max-w-[54ch] text-[17px] leading-[1.75] text-white/70">{tr(n.about, lang)}</p>}
        </div>
      </section>

      {n.highlights && (
        <section className="container-x grid gap-10 border-b border-line py-14 lg:grid-cols-[1.2fr_1fr]">
          <ul className="grid gap-6 sm:grid-cols-3">
            {n.highlights[lang].map((h) => <li key={h} className="border-t border-ink pt-4 text-[17px] font-medium">{h}</li>)}
          </ul>
          {n.bestFor && <div><p className="text-[14px] text-ink-mute">{t.hoods.bestFor}</p><p className="mt-2 font-display text-[22px] leading-snug">{tr(n.bestFor, lang)}</p></div>}
        </section>
      )}

      <section className="lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)]">
        <div className="container-x py-14 lg:max-w-none">
          <h2 className="h-sub">{t.hoods.available} {n.name}</h2>
          {here.length ? (
            <div className="mt-8 grid gap-x-6 gap-y-12 sm:grid-cols-2">{here.map((p) => <PropertyCard key={p.id} p={p} />)}</div>
          ) : <p className="mt-4 max-w-[46ch] text-ink-soft">{t.hoods.none}</p>}
          <a href={waLink(t.hoods.ask(n.name))} target="_blank" rel="noreferrer" className="btn-primary mt-10"><MessageCircle size={16} />{t.hoods.askCta}</a>
        </div>
        <div className="h-[420px] lg:sticky lg:top-[72px] lg:h-[calc(100vh-72px)]">
          <Suspense fallback={<div className="h-full bg-canvas" />}>
            <MapView points={pins} center={[n.lng, n.lat]} zoom={14} onSelect={(id) => nav(`/property/${id}`)} />
          </Suspense>
        </div>
      </section>

      <section className="border-t border-line bg-canvas">
        <div className="container-x flex flex-wrap gap-x-8 gap-y-3 py-10 text-[15px]">
          {others.map((o) => <Link key={o.slug} to={`/neighborhoods/${o.slug}`} className="font-display text-[20px] hover:text-brand-700">{o.name}</Link>)}
        </div>
      </section>
    </>
  )
}
