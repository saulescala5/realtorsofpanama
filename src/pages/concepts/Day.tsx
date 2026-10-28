import { lazy, Suspense, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { MessageCircle, ArrowUpRight } from 'lucide-react'
import { useI18n } from '@/i18n'
import { useStore } from '@/lib/store'
import { NEIGHBORHOODS, hood, tr } from '@/lib/neighborhoods'
import { coordsOf, shortPrice } from '@/lib/geo'
import { money } from '@/lib/format'
import { locationName } from '@/lib/locations'
import { waLink } from '@/lib/whatsapp'
import { Img } from '@/components/ui'
import { LangToggle } from '@/components/Layout'
import { SmartSearch } from './SmartSearch'

const City3D = lazy(() => import('@/components/City3D'))
const D = { fontFamily: '"Instrument Sans", system-ui', fontStretch: '78%', letterSpacing: '-0.035em' }
const B = { fontFamily: '"Inter Tight", system-ui' }

const COPY = {
  en: {
    nav: ['Rent', 'Buy', 'Neighborhoods', 'Work with us'],
    h1: 'Real estate, minus the noise.',
    sub: 'Tell us what you want. Get the right homes in Panama City, published or not, the same day.',
    gets: [['Same-day options', 'Real homes on WhatsApp, not a form reply.'], ['Off-market access', 'What never reaches the portals reaches you.'], ['One advisor', 'From the first visit to the keys, licensed.']],
    hoodsTitle: 'Pick a neighborhood', now: 'Available now', all: 'See everything',
    proTitle: 'In real estate? Let’s work together.', pro: 'Work with us',
  },
  es: {
    nav: ['Alquilar', 'Comprar', 'Zonas', 'Trabaja con nosotros'],
    h1: 'Bienes raíces, sin ruido.',
    sub: 'Dinos qué buscas. Recibe las propiedades correctas en Ciudad de Panamá, publicadas o no, el mismo día.',
    gets: [['Opciones el mismo día', 'Propiedades reales por WhatsApp, no una respuesta automática.'], ['Fuera del mercado', 'Lo que nunca llega a los portales, te llega a ti.'], ['Un solo asesor', 'De la primera visita a las llaves, con licencia.']],
    hoodsTitle: 'Elige una zona', now: 'Disponible ahora', all: 'Ver todo',
    proTitle: '¿Trabajas en bienes raíces? Hagámoslo juntos.', pro: 'Trabaja con nosotros',
  },
}

export default function Day() {
  const { lang } = useI18n()
  const { publicProperties } = useStore()
  const nav = useNavigate()
  const C = COPY[lang]
  const [area, setArea] = useState<string | null>(null)
  const focus = area ? hood(area) ?? null : null
  const pins = useMemo(() => publicProperties.flatMap((p) => { const c = coordsOf(p); return c ? [{ id: p.id, ...c, label: shortPrice(p) }] : [] }), [publicProperties])
  const guides = NEIGHBORHOODS.filter((n) => n.featured)
  const links = ['/properties?op=rent', '/properties?op=sale', '/neighborhoods', '/work-with-us']

  return (
    <div className="bg-[#F4F4F2] text-black" style={B}>
      <header className="mx-auto flex h-20 max-w-[1320px] items-center justify-between px-5 sm:px-10">
        <Link to="/"><img src="/brand/logo.png" alt="Realtors of Panama" className="h-7" /></Link>
        <nav className="hidden items-center gap-8 lg:flex">
          {C.nav.map((l, i) => <Link key={l} to={links[i]} className="text-[14px] text-black/60 transition hover:text-black">{l}</Link>)}
        </nav>
        <div className="flex items-center gap-2">
          <LangToggle />
          <a href={waLink('')} target="_blank" rel="noreferrer" className="flex h-10 items-center gap-2 rounded-full bg-black px-4 text-[14px] font-medium text-white"><MessageCircle size={16} />WhatsApp</a>
        </div>
      </header>

      <section className="mx-auto max-w-[1320px] px-5 pt-10 text-center sm:px-10 sm:pt-16">
        <div className="flex items-center justify-center gap-5 sm:gap-8">
          <span className="hidden h-px flex-1 origin-right bg-black sm:block animate-[growline_1.2s_.3s_cubic-bezier(.2,.7,.1,1)_both]" />
          <h1 className="text-[52px] font-semibold leading-[.95] sm:text-[88px] lg:text-[124px] animate-[lineup_1s_cubic-bezier(.2,.7,.1,1)_both]" style={D}>{C.h1}</h1>
          <span className="hidden h-px flex-1 origin-left bg-black sm:block animate-[growline_1.2s_.3s_cubic-bezier(.2,.7,.1,1)_both]" />
        </div>
        <p className="mx-auto mt-6 max-w-[46ch] text-[18px] leading-relaxed text-black/60 animate-[fadein_1s_.5s_both]">{C.sub}</p>
        <div className="mx-auto mt-9 max-w-[680px] text-left animate-[fadein_1s_.65s_both]"><SmartSearch dark={false} onFocusArea={setArea} /></div>
      </section>

      <section className="mx-auto mt-14 max-w-[1320px] px-3 sm:px-10">
        <div className="relative h-[62vh] min-h-[440px] overflow-hidden rounded-[36px] bg-white ring-1 ring-black/5 animate-[fadein_1.6s_.4s_both]">
          <Suspense fallback={null}><City3D theme="light" points={pins} focus={focus} zoom={14} onSelect={(id) => nav(`/property/${id}`)} /></Suspense>
          <div className="absolute inset-x-4 bottom-4 flex gap-2 overflow-x-auto no-scrollbar sm:inset-x-6 sm:bottom-6">
            {guides.map((n) => (
              <button key={n.slug} onMouseEnter={() => setArea(n.slug)} onFocus={() => setArea(n.slug)} onClick={() => nav(`/neighborhoods/${n.slug}`)}
                className={`shrink-0 rounded-full px-4 py-2 text-[14px] backdrop-blur-xl transition ${area === n.slug ? 'bg-black text-white' : 'bg-white/80 text-black ring-1 ring-black/10 hover:bg-white'}`}>{n.name}</button>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-[1320px] gap-10 px-5 py-24 sm:px-10 md:grid-cols-3 sm:py-32">
        {C.gets.map(([t, d]) => (
          <div key={t}>
            <p className="text-[34px] font-semibold leading-none sm:text-[44px]" style={D}>{t}</p>
            <p className="mt-4 max-w-[30ch] text-[17px] text-black/60">{d}</p>
          </div>
        ))}
      </section>

      <section className="overflow-hidden border-y border-black/10 bg-white py-10">
        <div className="flex w-max animate-[drift_60s_linear_infinite] gap-12 whitespace-nowrap hover:[animation-play-state:paused]">
          {[...guides, ...guides].map((n, i) => (
            <Link key={n.slug + i} to={`/neighborhoods/${n.slug}`} className="group flex items-baseline gap-4">
              <span className="text-[48px] font-semibold leading-none text-black/15 transition group-hover:text-black sm:text-[72px]" style={D}>{n.name}</span>
              <span className="max-w-[22ch] whitespace-normal text-[14px] text-black/0 transition group-hover:text-black/60">{tr(n.tagline, lang)}</span>
            </Link>
          ))}
        </div>
      </section>

      {publicProperties.length > 0 && (
        <section className="mx-auto max-w-[1320px] px-5 py-24 sm:px-10">
          <div className="flex items-end justify-between">
            <h2 className="text-[40px] font-semibold leading-none sm:text-[56px]" style={D}>{C.now}</h2>
            <Link to="/properties" className="flex items-center gap-1 text-[15px] text-black/60 hover:text-black">{C.all}<ArrowUpRight size={16} /></Link>
          </div>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {publicProperties.slice(0, 6).map((p) => (
              <Link key={p.id} to={`/property/${p.id}`} className="group rounded-[28px] bg-white p-2 ring-1 ring-black/5 transition hover:-translate-y-1 hover:shadow-[0_30px_60px_-30px_rgba(0,0,0,.35)]">
                <div className="aspect-[4/3] overflow-hidden rounded-[22px] bg-[#F4F4F2]"><Img src={p.images[0]} alt={p.title} className="h-full w-full transition duration-700 group-hover:scale-105" /></div>
                <div className="flex items-end justify-between gap-3 p-4">
                  <div className="min-w-0"><p className="text-[13px] text-black/50">{locationName(p.location)}</p><p className="mt-1 truncate text-[17px] font-medium">{p.title}</p></div>
                  <p className="shrink-0 text-[16px] font-semibold">{money(p.price, lang)}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="mx-auto max-w-[1320px] px-5 pb-24 sm:px-10">
        <div className="flex flex-col items-start justify-between gap-8 rounded-[36px] bg-black p-10 text-white sm:flex-row sm:items-end sm:p-16">
          <p className="max-w-[16ch] text-[40px] font-semibold leading-[.98] sm:text-[64px]" style={D}>{C.proTitle}</p>
          <Link to="/work-with-us" className="inline-flex h-12 shrink-0 items-center gap-2 rounded-full bg-[#E3C46E] px-6 text-[15px] font-medium text-black">{C.pro}<ArrowUpRight size={18} /></Link>
        </div>
      </section>
    </div>
  )
}
