import { lazy, Suspense, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowDownUp, Map as MapIcon } from 'lucide-react'
import { useI18n } from '@/i18n'
import { useStore } from '@/lib/store'
import { NEIGHBORHOODS, hood, tr } from '@/lib/neighborhoods'
import { MARKET, TAGS, range, type Tag } from '@/lib/market'
import { coordsOf, shortPrice } from '@/lib/geo'
import { waLink } from '@/lib/whatsapp'
import { useSeo, SITE_URL } from '@/lib/seo'
import { PropertyCard } from '@/components/PropertyCard'
import { Spot, WhatsAppIcon } from '@/components/icons'
import { Img } from '@/components/ui'
import { HoodCard } from '@/components/HoodCards'

const City3D = lazy(() => import('@/components/City3D'))

const C = {
  en: {
    all: 'All', compare: 'Compare at a glance', hood: 'Neighborhood', rent: '2BR rent / mo', m2: 'Sale price / m²', commute: 'To Calle 50', walk: 'Walkability', demand: 'Demand',
    mins: (n: number) => `${n} min`, walkL: ['Car first', 'Mixed', 'Very walkable'], dem: { 'very-high': 'Very high', high: 'High', steady: 'Steady' },
    note: 'Realtors of Panama market reading: typical ranges we see asked and closed. Not official statistics; every building is different.',
    around: 'Around here', gallery: 'The look and feel', map: 'Show on map', hideMap: 'Hide map', live: 'Living here', count: (n: number) => `${n} homes`,
  },
  es: {
    all: 'Todas', compare: 'Compara de un vistazo', hood: 'Zona', rent: 'Alquiler 2 rec. / mes', m2: 'Venta por m²', commute: 'A Calle 50', walk: 'Caminabilidad', demand: 'Demanda',
    mins: (n: number) => `${n} min`, walkL: ['Más en carro', 'Mixta', 'Muy caminable'], dem: { 'very-high': 'Muy alta', high: 'Alta', steady: 'Estable' },
    note: 'Lectura de mercado de Realtors of Panama: rangos típicos que vemos pedir y cerrar. No son estadísticas oficiales; cada edificio es distinto.',
    around: 'Alrededor', gallery: 'Cómo se siente', map: 'Ver en el mapa', hideMap: 'Ocultar mapa', live: 'Vivir aquí', count: (n: number) => `${n} propiedades`,
  },
}
const demandDot = { 'very-high': 'bg-rose-500', high: 'bg-amber-500', steady: 'bg-mint-500' }

export function NeighborhoodList() {
  const { t, lang } = useI18n()
  const L = C[lang]
  const [tag, setTag] = useState<Tag | ''>('')
  const [sort, setSort] = useState<'rent' | 'm2' | 'commute' | ''>('')
  useSeo({ title: `${t.hoods.title} · Panama City · Realtors of Panama`, description: t.hoods.sub })
  const guides = NEIGHBORHOODS.filter((n) => n.featured)
  const shown = guides.filter((n) => !tag || MARKET[n.slug]?.vibe.includes(tag))
  const table = useMemo(() => [...guides].sort((a, b) => {
    const A = MARKET[a.slug], B = MARKET[b.slug]
    if (!sort || !A || !B) return 0
    return sort === 'rent' ? A.rent2br[0] - B.rent2br[0] : sort === 'm2' ? A.saleM2[0] - B.saleM2[0] : A.toCalle50 - B.toCalle50
  }), [sort]) // eslint-disable-line react-hooks/exhaustive-deps

  const th = (k: typeof sort, label: string) => (
    <th className="px-4 py-3 font-medium"><button onClick={() => setSort(sort === k ? '' : k)} className={`inline-flex items-center gap-1 ${sort === k ? 'text-ink' : ''}`}>{label}<ArrowDownUp size={13} /></button></th>
  )

  return (
    <>
      <section className="container-x pt-10 sm:pt-16">
        <h1 className="h-display max-w-[10ch]">{t.hoods.title}</h1>
        <p className="mt-6 max-w-[52ch] text-[18px] text-ink-soft">{t.hoods.sub}</p>
        <div className="no-scrollbar -mx-5 mt-10 flex gap-2 overflow-x-auto px-5 sm:mx-0 sm:flex-wrap sm:px-0">
          <button onClick={() => setTag('')} className={`h-11 shrink-0 rounded-full px-5 text-[14px] font-medium transition ${!tag ? 'bg-ink text-white' : 'bg-white ring-1 ring-black/10'}`}>{L.all}</button>
          {(Object.keys(TAGS) as Tag[]).map((k) => (
            <button key={k} onClick={() => setTag(tag === k ? '' : k)} className={`flex h-11 shrink-0 items-center gap-1.5 rounded-full pl-1.5 pr-4 text-[14px] font-medium transition ${tag === k ? 'bg-ink text-white' : 'bg-white ring-1 ring-black/10 hover:ring-black/30'}`}>
              <Spot name={TAGS[k].icon} size={30} tone={tag === k ? 'light' : 'gold'} />{TAGS[k][lang]}
            </button>
          ))}
        </div>
      </section>

      <section className="container-x grid gap-5 py-10 sm:grid-cols-2 lg:grid-cols-4">
        {shown.map((n) => <HoodCard key={n.slug} n={n} />)}
      </section>

      <section className="container-x pb-24">
        <h2 className="h-sub">{L.compare}</h2>
        <div className="mt-6 overflow-x-auto rounded-[28px] bg-white ring-1 ring-black/5">
          <table className="w-full min-w-[720px] text-left text-[14px]">
            <thead className="border-b border-black/10 text-[13px] text-ink-soft">
              <tr><th className="px-4 py-3 font-medium">{L.hood}</th>{th('rent', L.rent)}{th('m2', L.m2)}{th('commute', L.commute)}<th className="px-4 py-3 font-medium">{L.walk}</th><th className="px-4 py-3 font-medium">{L.demand}</th></tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {table.map((n) => { const m = MARKET[n.slug]; if (!m) return null; return (
                <tr key={n.slug} className="transition hover:bg-paper">
                  <td className="px-4 py-3"><Link to={`/neighborhoods/${n.slug}`} className="font-medium hover:underline">{n.name}</Link></td>
                  <td className="px-4 py-3 tabular-nums">{range(m.rent2br)}</td>
                  <td className="px-4 py-3 tabular-nums">{range(m.saleM2)}</td>
                  <td className="px-4 py-3 tabular-nums">{L.mins(m.toCalle50)}</td>
                  <td className="px-4 py-3"><span className="flex gap-1">{[1, 2, 3].map((x) => <i key={x} className={`h-1.5 w-5 rounded-full ${x <= m.walk ? 'bg-ink' : 'bg-black/10'}`} />)}</span></td>
                  <td className="px-4 py-3"><span className="flex items-center gap-1.5"><i className={`h-2 w-2 rounded-full ${demandDot[m.demand]}`} />{L.dem[m.demand]}</span></td>
                </tr>
              ) })}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-[12px] text-ink-mute">{L.note}</p>
      </section>
    </>
  )
}

export function NeighborhoodPage() {
  const { slug = '' } = useParams()
  const { t, lang } = useI18n()
  const { publicProperties } = useStore()
  const nav = useNavigate()
  const L = C[lang]
  const [op, setOp] = useState<'' | 'rent' | 'sale'>('')
  const [map, setMap] = useState(false)
  const n = hood(slug)
  const m = MARKET[slug]
  useSeo(n ? {
    title: `${n.name}, Panama City: homes, prices and lifestyle · Realtors of Panama`,
    description: `${tr(n.tagline, lang)}. ${m ? `${L.rent}: ${range(m.rent2br)}. ${L.m2}: ${range(m.saleM2)}.` : ''}`,
    image: `/hoods/hood-${n.slug}.jpg`,
    jsonLd: { '@context': 'https://schema.org', '@type': 'Place', name: `${n.name}, Panama City`, url: `${SITE_URL}/neighborhoods/${n.slug}`, description: tr(n.about, lang), geo: { '@type': 'GeoCoordinates', latitude: n.lat, longitude: n.lng }, containedInPlace: { '@type': 'City', name: 'Panama City', containedInPlace: { '@type': 'Country', name: 'Panama' } } },
  } : { title: 'Realtors of Panama' })
  if (!n) return <div className="container-x py-24"><Link to="/neighborhoods" className="link">{t.hoods.title}</Link></div>
  const here = publicProperties.filter((p) => p.location === n.slug)
  const list = here.filter((p) => !op || p.operation === op)
  const pins = here.flatMap((p) => { const c = coordsOf(p); return c ? [{ id: p.id, ...c, label: shortPrice(p) }] : [] })
  const others = NEIGHBORHOODS.filter((x) => x.featured && x.slug !== n.slug)

  return (
    <>
      <section className="mx-auto max-w-[1320px] px-3 pt-4 sm:px-10 sm:pt-8">
        <div className="relative h-[62vh] min-h-[420px] overflow-hidden rounded-5xl bg-ink text-white">
          <Img src={`/hoods/hood-${n.slug}.jpg`} alt={n.name} className="absolute inset-0 h-full w-full" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/10" />
          <div className="absolute inset-x-6 bottom-6 sm:inset-x-12 sm:bottom-12">
            <Link to="/neighborhoods" className="text-[14px] text-white/70 hover:text-white">← {t.hoods.title}</Link>
            <h1 className="font-display mt-3 animate-[lineup_.9s_cubic-bezier(.2,.7,.1,1)_both] text-[56px] font-semibold leading-[.92] sm:text-[104px]">{n.name}</h1>
            {n.tagline && <p className="mt-4 max-w-[34ch] text-[20px] leading-snug text-white/85 sm:text-[24px]">{tr(n.tagline, lang)}</p>}
            {m && <div className="mt-5 flex flex-wrap gap-2">{m.vibe.map((v) => <span key={v} className="flex items-center gap-1 rounded-full bg-white/15 py-1 pl-1 pr-3 text-[13px] backdrop-blur"><Spot name={TAGS[v].icon} size={24} tone="light" className="text-white" />{TAGS[v][lang]}</span>)}</div>}
          </div>
        </div>
      </section>

      {m && (
        <section className="container-x pt-10">
          <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {[
              ['coins', L.rent, range(m.rent2br)], ['chart', L.m2, range(m.saleM2)], ['car', L.commute, L.mins(m.toCalle50)],
              ['cup', L.walk, L.walkL[m.walk - 1]], ['sun', L.demand, L.dem[m.demand]],
            ].map(([icon, k, v]) => (
              <div key={k} className="flex items-center gap-4 rounded-[24px] bg-white p-5 ring-1 ring-black/5">
                <Spot name={icon as 'coins'} size={44} />
                <div><dt className="text-[13px] text-ink-soft">{k}</dt><dd className="font-display text-[24px] font-semibold leading-tight">{v}</dd></div>
              </div>
            ))}
          </dl>
          <p className="mt-3 text-[12px] text-ink-mute">{L.note}</p>
        </section>
      )}

      <section className="container-x grid gap-12 py-16 lg:grid-cols-[1.2fr_1fr]">
        <div>
          <h2 className="h-sub">{L.live}</h2>
          {n.about && <p className="mt-6 max-w-[56ch] text-[19px] leading-relaxed">{tr(n.about, lang)}</p>}
          <div className="mt-6 flex flex-wrap gap-2">{n.highlights?.[lang].map((h) => <span key={h} className="rounded-full bg-white px-4 py-2 text-[15px] ring-1 ring-black/5">{h}</span>)}</div>
          {n.bestFor && <div className="mt-6 rounded-[24px] bg-ink px-6 py-5 text-white"><p className="text-[13px] text-white/50">{t.hoods.bestFor}</p><p className="mt-1 text-[17px]">{tr(n.bestFor, lang)}</p></div>}
        </div>
        {m && (
          <div>
            <h2 className="h-sub">{L.around}</h2>
            <ul className="mt-6 grid gap-3">
              {m.spots.map((sp) => (
                <li key={sp.name} className="flex items-center gap-4 rounded-[24px] bg-white p-4 ring-1 ring-black/5 transition hover:ring-black/20">
                  <Spot name={sp.icon} size={48} tone="mint" />
                  <div><p className="text-[16px] font-semibold">{sp.name}</p><p className="text-[14px] text-ink-soft">{sp.note[lang]}</p></div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      {m && m.gallery.length > 1 && (
        <section className="container-x pb-16">
          <h2 className="h-sub">{L.gallery}</h2>
          <div className={`mt-6 grid gap-3 ${m.gallery.length > 3 ? 'sm:grid-cols-3' : 'sm:grid-cols-2'}`}>
            {m.gallery.slice(1, 4).map((src) => <div key={src} className="h-[300px] overflow-hidden rounded-[24px]"><img src={src} alt="" loading="lazy" className="h-full w-full object-cover transition duration-700 hover:scale-105" /></div>)}
          </div>
        </section>
      )}

      <section className="container-x pb-24">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h2 className="h-sub">{t.hoods.available} {n.name}</h2>
          <div className="flex flex-wrap gap-2">
            <div className="flex gap-0.5 rounded-full bg-white p-1 ring-1 ring-black/10">
              {([['', L.all], ['rent', t.nav.rent], ['sale', t.nav.buy]] as const).map(([v, l]) => <button key={v} onClick={() => setOp(v)} className={`h-9 rounded-full px-4 text-[14px] font-medium ${op === v ? 'bg-ink text-white' : 'text-ink-soft'}`}>{l}</button>)}
            </div>
            {pins.length > 0 && <button onClick={() => setMap(!map)} className="btn-ghost btn-sm"><MapIcon size={15} />{map ? L.hideMap : L.map}</button>}
            <a href={waLink(t.hoods.ask(n.name))} target="_blank" rel="noreferrer" className="btn-wa btn-sm"><WhatsAppIcon size={15} />{t.hoods.askCta}</a>
          </div>
        </div>
        {map && <div className="mt-6 h-[380px] overflow-hidden rounded-[28px] ring-1 ring-black/5"><Suspense fallback={null}><City3D key={n.slug} theme="light" center={[n.lng, n.lat]} zoom={15} points={pins} onSelect={(id) => nav(`/property/${id}`)} /></Suspense></div>}
        {list.length ? <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{list.map((p) => <PropertyCard key={p.id} p={p} />)}</div>
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
