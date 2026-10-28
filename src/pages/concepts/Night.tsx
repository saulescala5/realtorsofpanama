import { lazy, Suspense, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { MessageCircle, ArrowUpRight } from 'lucide-react'
import { useI18n } from '@/i18n'
import { useStore } from '@/lib/store'
import { NEIGHBORHOODS, hood } from '@/lib/neighborhoods'
import { coordsOf, shortPrice } from '@/lib/geo'
import { money } from '@/lib/format'
import { locationName } from '@/lib/locations'
import { waLink } from '@/lib/whatsapp'
import { Img } from '@/components/ui'
import { LangToggle } from '@/components/Layout'
import { SmartSearch } from './SmartSearch'

const City3D = lazy(() => import('@/components/City3D'))
const D = { fontFamily: 'Unbounded, system-ui', letterSpacing: '-0.02em' }
const B = { fontFamily: '"Inter Tight", system-ui' }

const COPY = {
  en: {
    nav: ['Rent', 'Buy', 'Neighborhoods', 'Work with us'],
    h1: ['Find it before', 'it’s listed.'],
    sub: 'Homes to rent and buy in Panama City. Describe what you want and we send real options on WhatsApp, including homes that never reach the portals.',
    hoods: 'Fly to',
    stepsTitle: 'Three messages to your keys',
    steps: [['Tell us', 'Budget, area, dates. In a WhatsApp message, in your words.'], ['Get matched', 'Published and off-market options that fit, the same day.'], ['Move in', 'We visit with you, negotiate, and handle the paperwork.']],
    now: 'On the market now', all: 'See everything',
    proTitle: 'Brokers, developers, owners.', proSub: 'Plug into a network that closes. Bring listings, clients or projects.', pro: 'Work with us',
  },
  es: {
    nav: ['Alquilar', 'Comprar', 'Zonas', 'Trabaja con nosotros'],
    h1: ['Encuéntrala antes', 'de que se publique.'],
    sub: 'Propiedades para alquilar y comprar en Ciudad de Panamá. Describe lo que buscas y te enviamos opciones reales por WhatsApp, incluso las que nunca llegan a los portales.',
    hoods: 'Ir a',
    stepsTitle: 'Tres mensajes hasta tus llaves',
    steps: [['Cuéntanos', 'Presupuesto, zona, fechas. En un WhatsApp, con tus palabras.'], ['Recibe opciones', 'Publicadas y fuera del mercado, el mismo día.'], ['Múdate', 'Visitamos contigo, negociamos y llevamos el papeleo.']],
    now: 'En el mercado ahora', all: 'Ver todo',
    proTitle: 'Brokers, desarrolladores, propietarios.', proSub: 'Conéctate a una red que cierra. Trae propiedades, clientes o proyectos.', pro: 'Trabaja con nosotros',
  },
}

export default function Night() {
  const { lang } = useI18n()
  const { publicProperties } = useStore()
  const nav = useNavigate()
  const C = COPY[lang]
  const [area, setArea] = useState<string | null>(null)
  const focus = area ? hood(area) ?? null : null
  const pins = useMemo(() => publicProperties.flatMap((p) => { const c = coordsOf(p); return c ? [{ id: p.id, ...c, label: shortPrice(p) }] : [] }), [publicProperties])
  const quick = NEIGHBORHOODS.filter((n) => n.featured).slice(0, 7)
  const links = ['/properties?op=rent', '/properties?op=sale', '/neighborhoods', '/work-with-us']

  return (
    <div className="bg-black text-white" style={B}>
      <section className="relative h-[100svh] min-h-[640px] overflow-hidden">
        <div className="absolute inset-0 animate-[fadein_1.6s_ease-out_both]">
          <Suspense fallback={null}><City3D theme="dark" points={pins} focus={focus} onSelect={(id) => nav(`/property/${id}`)} /></Suspense>
        </div>
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_20%_70%,rgba(0,0,0,.92)_0%,rgba(0,0,0,.55)_45%,rgba(0,0,0,0)_75%)]" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-black/80 to-transparent" />

        <header className="relative z-10 mx-auto flex h-20 max-w-[1320px] items-center justify-between px-5 sm:px-10">
          <Link to="/"><img src="/brand/logo-white.png" alt="Realtors of Panama" className="h-7" /></Link>
          <nav className="hidden items-center gap-1 rounded-full bg-white/[.06] p-1 ring-1 ring-white/10 backdrop-blur-xl lg:flex">
            {C.nav.map((l, i) => <Link key={l} to={links[i]} className="rounded-full px-4 py-2 text-[14px] text-white/75 transition hover:bg-white/10 hover:text-white">{l}</Link>)}
          </nav>
          <div className="flex items-center gap-2">
            <LangToggle dark />
            <a href={waLink('')} target="_blank" rel="noreferrer" className="flex h-10 items-center gap-2 rounded-full bg-white px-4 text-[14px] font-medium text-black"><MessageCircle size={16} />WhatsApp</a>
          </div>
        </header>

        <div className="relative z-10 mx-auto flex h-[calc(100%-5rem)] max-w-[1320px] flex-col justify-end px-5 pb-10 sm:px-10 sm:pb-14">
          <h1 className="text-[44px] font-medium leading-[1.02] sm:text-[72px] lg:text-[96px]" style={D}>
            {C.h1.map((l, i) => <span key={l} className="block animate-[lineup_.9s_cubic-bezier(.2,.7,.1,1)_both]" style={{ animationDelay: `${0.25 + i * 0.12}s` }}>{l}</span>)}
          </h1>
          <p className="mt-6 max-w-[54ch] text-[17px] leading-relaxed text-white/70 animate-[fadein_1s_.6s_both]">{C.sub}</p>
          <div className="mt-8 max-w-[720px] animate-[fadein_1s_.75s_both]"><SmartSearch onFocusArea={setArea} /></div>
          <div className="mt-6 flex flex-wrap items-center gap-2 animate-[fadein_1s_.9s_both]">
            <span className="mr-1 text-[13px] text-white/45">{C.hoods}</span>
            {quick.map((n) => (
              <button key={n.slug} onMouseEnter={() => setArea(n.slug)} onFocus={() => setArea(n.slug)} onClick={() => nav(`/neighborhoods/${n.slug}`)}
                className={`rounded-full px-3.5 py-1.5 text-[13px] ring-1 transition ${area === n.slug ? 'bg-[#E3C46E] text-black ring-[#E3C46E]' : 'text-white/80 ring-white/15 hover:ring-white/40'}`}>{n.name}</button>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1320px] px-5 py-24 sm:px-10 sm:py-32">
        <h2 className="max-w-[16ch] text-[34px] font-medium leading-[1.05] sm:text-[52px]" style={D}>{C.stepsTitle}</h2>
        <ol className="mt-16 grid gap-px overflow-hidden rounded-3xl bg-white/10 md:grid-cols-3">
          {C.steps.map(([t, d], i) => (
            <li key={t} className="bg-black p-8 sm:p-10">
              <span className="text-[13px] text-[#E3C46E]">0{i + 1}</span>
              <p className="mt-10 text-[26px] font-medium" style={D}>{t}</p>
              <p className="mt-3 text-[16px] leading-relaxed text-white/60">{d}</p>
            </li>
          ))}
        </ol>
      </section>

      {publicProperties.length > 0 && (
        <section className="pb-24 sm:pb-32">
          <div className="mx-auto flex max-w-[1320px] items-end justify-between px-5 sm:px-10">
            <h2 className="text-[28px] font-medium sm:text-[40px]" style={D}>{C.now}</h2>
            <Link to="/properties" className="flex items-center gap-1 text-[15px] text-white/70 hover:text-white">{C.all}<ArrowUpRight size={16} /></Link>
          </div>
          <div className="no-scrollbar mt-10 flex snap-x gap-5 overflow-x-auto px-5 sm:px-10 lg:px-[max(2.5rem,calc((100vw-1320px)/2+2.5rem))]">
            {publicProperties.slice(0, 10).map((p) => (
              <Link key={p.id} to={`/property/${p.id}`} className="group w-[78vw] shrink-0 snap-start sm:w-[420px]">
                <div className="relative aspect-[4/5] overflow-hidden rounded-[28px] bg-white/5">
                  <Img src={p.images[0]} alt={p.title} className="h-full w-full transition duration-700 group-hover:scale-105" />
                  <div className="absolute inset-x-3 bottom-3 rounded-2xl bg-black/55 p-4 ring-1 ring-white/10 backdrop-blur-xl">
                    <p className="text-[13px] text-white/60">{locationName(p.location)}</p>
                    <p className="mt-1 truncate text-[17px] font-medium">{p.title}</p>
                    <p className="mt-2 text-[15px] text-[#E3C46E]">{money(p.price, lang)}{p.operation === 'rent' ? (lang === 'es' ? '/mes' : '/mo') : ''}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="mx-auto max-w-[1320px] px-5 pb-24 sm:px-10">
        <div className="relative overflow-hidden rounded-[32px] bg-[#E3C46E] p-10 text-black sm:p-16">
          <p className="max-w-[18ch] text-[34px] font-medium leading-[1.05] sm:text-[56px]" style={D}>{C.proTitle}</p>
          <p className="mt-5 max-w-[46ch] text-[18px]">{C.proSub}</p>
          <Link to="/work-with-us" className="mt-10 inline-flex h-12 items-center gap-2 rounded-full bg-black px-6 text-[15px] font-medium text-white">{C.pro}<ArrowUpRight size={18} /></Link>
        </div>
      </section>
    </div>
  )
}
