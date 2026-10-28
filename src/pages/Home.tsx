import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowUpRight, Plus, Check, BadgeCheck } from 'lucide-react'
import { useI18n } from '@/i18n'
import { useStore } from '@/lib/store'
import { waLink } from '@/lib/whatsapp'
import { GUIDES } from '@/lib/guides'
import { PropertyCard } from '@/components/PropertyCard'
import { HeroSearch } from '@/components/HeroSearch'
import { HoodCards } from '@/components/HoodCards'
import { ChatDemo } from '@/components/ChatDemo'
import { Audiences } from '@/components/Audiences'
import { Spot, WhatsAppIcon, type SpotName } from '@/components/icons'
import { NeighborhoodMatcher, MortgageCalculator, AlertsForm } from '@/components/Interactive'
import { GuideCard } from './Guides'
import { useSeo } from '@/lib/seo'

const X = {
  en: {
    startWa: 'Start on WhatsApp', browse: 'Browse homes',
    trust: ['Licensed in Panama', 'Verified listings', 'English & Spanish'],
    howEyebrow: 'How it works', howTitle: 'From one message to your keys',
    how: [
      ['chat', 'You write on WhatsApp', 'Our assistant answers right away, day or night, and learns what you need.'],
      ['agent', 'We connect you with an agent', 'A licensed, verified real estate professional who knows the area takes over.'],
      ['calendar', 'You visit verified homes', 'Availability is confirmed before you go. Visits are scheduled in the chat.'],
      ['key', 'You close with confidence', 'Offer, contract review and keys, with your agent beside you.'],
    ] as [SpotName, string, string][],
    nowEyebrow: 'Ready to close', all: 'All', rent: 'For rent', sale: 'For sale',
    netTitle: 'A network, not a portal',
    netSub: 'Portals show you everything and help with nothing. Realtors of Panama connects you with licensed professionals who answer, verify and close.',
    net: [['100%', 'Licensed agents: every professional in our network holds a Panama real estate licence'], ['12', 'Neighborhood guides with real price ranges'], ['24/7', 'First answer on WhatsApp, any time'], ['2', 'Languages, English and Spanish, end to end']],
    audTitle: 'Useful, whoever you are', hoodsEyebrow: 'Neighborhoods',
    hoodsTitle: 'Pick the life, then the home', lifeTitle: 'Life in Panama City',
    life: [['/life/life-36.jpg', 'Sunday in Casco Viejo'], ['/life/life-29.jpg', 'Bay walks'], ['/life/life-18.jpg', 'Café streets'], ['/life/life-07.jpg', 'Green Clayton'], ['/life/life-14.jpg', 'Avenida Balboa'], ['/life/life-23.jpg', 'Quiet residential'], ['/life/life-15.jpg', 'Costa del Este'], ['/life/life-34.jpg', 'Balconies & views']],
    guidesTitle: 'Guides', guidesAll: 'All guides',
    ownersEyebrow: 'For owners',
  },
  es: {
    startWa: 'Empieza por WhatsApp', browse: 'Ver propiedades',
    trust: ['Con licencia en Panamá', 'Propiedades verificadas', 'Inglés y español'],
    howEyebrow: 'Cómo funciona', howTitle: 'De un mensaje a tus llaves',
    how: [
      ['chat', 'Escribes por WhatsApp', 'Nuestro asistente responde al instante, de día o de noche, y entiende lo que necesitas.'],
      ['agent', 'Te conectamos con un agente', 'Un profesional inmobiliario con licencia, verificado y que conoce la zona, toma el caso.'],
      ['calendar', 'Visitas propiedades verificadas', 'Confirmamos disponibilidad antes de ir. Las visitas se agendan en el chat.'],
      ['key', 'Cierras con confianza', 'Oferta, revisión del contrato y llaves, con tu agente al lado.'],
    ] as [SpotName, string, string][],
    nowEyebrow: 'Listas para cerrar', all: 'Todas', rent: 'Alquiler', sale: 'Venta',
    netTitle: 'Una red, no un portal',
    netSub: 'Los portales te muestran todo y no te ayudan con nada. Realtors of Panama te conecta con profesionales con licencia que responden, verifican y cierran.',
    net: [['100%', 'Agentes con licencia: cada profesional de la red tiene licencia de corredor en Panamá'], ['12', 'Guías de zonas con rangos de precio reales'], ['24/7', 'Primera respuesta por WhatsApp, a cualquier hora'], ['2', 'Idiomas, inglés y español, de principio a fin']],
    audTitle: 'Útil, seas quien seas', hoodsEyebrow: 'Zonas',
    hoodsTitle: 'Elige la vida, luego la casa', lifeTitle: 'La vida en Ciudad de Panamá',
    life: [['/life/life-36.jpg', 'Domingo en el Casco'], ['/life/life-29.jpg', 'Paseos por la bahía'], ['/life/life-18.jpg', 'Calles de cafés'], ['/life/life-07.jpg', 'Clayton verde'], ['/life/life-14.jpg', 'Avenida Balboa'], ['/life/life-23.jpg', 'Residencial tranquilo'], ['/life/life-15.jpg', 'Costa del Este'], ['/life/life-34.jpg', 'Balcones y vistas']],
    guidesTitle: 'Guías', guidesAll: 'Todas las guías',
    ownersEyebrow: 'Para propietarios',
  },
}

const Eyebrow = ({ children, light = false }: { children: string; light?: boolean }) => (
  <p className={`mb-4 flex items-center gap-2 text-[13px] font-medium uppercase tracking-[.14em] ${light ? 'text-brand-400' : 'text-ink-soft'}`}><span className="h-px w-6 bg-current" />{children}</p>
)

export default function Home() {
  const { t, lang } = useI18n()
  const { publicProperties } = useStore()
  const H = t.home
  const L = X[lang]
  useSeo({ title: lang === 'es' ? 'Realtors of Panama · Red de corredores con licencia en Panamá' : 'Realtors of Panama · Panama’s network of licensed realtors', description: H.sub })
  const [faq, setFaq] = useState<number | null>(0)
  const [op, setOp] = useState<'' | 'rent' | 'sale'>('')
  const sorted = [...publicProperties].sort((a, b) => Number(b.featured) - Number(a.featured) || b.createdAt.localeCompare(a.createdAt))
  const listings = sorted.filter((p) => !op || p.operation === op).slice(0, 6)
  const ownerPics = ['/life/life-02.jpg', '/samples/sample-04.jpg', '/samples/sample-05.jpg', '/life/life-08.jpg']

  return (
    <>
      {/* hero */}
      <section className="relative overflow-hidden">
        <div className="aurora" /><div className="grain" />
        <div className="container-x relative grid items-center gap-14 pb-20 pt-10 sm:pt-14 lg:grid-cols-[1.05fr_1fr] lg:gap-10 lg:pb-28">
          <div className="min-w-0">
            <p className="inline-flex animate-[fadein_.8s_both] items-center gap-2 rounded-full bg-white/70 py-1.5 pl-1.5 pr-4 text-[13px] font-medium ring-1 ring-black/5 backdrop-blur">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-400"><BadgeCheck size={14} /></span>{H.eyebrow}
            </p>
            <h1 className="font-display mt-6 max-w-[13ch] animate-[lineup_1s_cubic-bezier(.2,.7,.1,1)_both] text-[50px] font-semibold leading-[.95] sm:text-[76px] xl:text-[88px]">{H.h1}</h1>
            <p className="mt-6 max-w-[46ch] animate-[fadein_1s_.4s_both] text-[18px] leading-relaxed text-ink-soft">{H.sub}</p>
            <div className="mt-8 flex animate-[fadein_1s_.55s_both] flex-wrap gap-3">
              <a href={waLink('')} target="_blank" rel="noreferrer" className="btn-wa btn-lg"><WhatsAppIcon size={19} />{L.startWa}</a>
              <Link to="/properties" className="btn-ghost btn-lg">{L.browse}<ArrowUpRight size={18} /></Link>
            </div>
            <div className="mt-10 animate-[fadein_1s_.7s_both]"><HeroSearch compact /></div>
            <ul className="mt-6 flex animate-[fadein_1s_.85s_both] flex-wrap gap-x-6 gap-y-2 text-[14px] text-ink-soft">
              {L.trust.map((x) => <li key={x} className="flex items-center gap-2"><Check size={15} className="text-mint-600" />{x}</li>)}
            </ul>
          </div>
          <div className="animate-[fadein_1.2s_.3s_both]"><ChatDemo /></div>
        </div>
      </section>

      {/* how it works */}
      <section className="bg-white py-20 sm:py-28">
        <div className="container-x">
          <Eyebrow>{L.howEyebrow}</Eyebrow>
          <h2 className="h-section max-w-[14ch]">{L.howTitle}</h2>
          <ol className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {L.how.map(([icon, title, d], i) => (
              <li key={title} className="group relative rounded-[28px] bg-paper p-7 transition hover:-translate-y-1 hover:bg-brand-100">
                <div className="flex items-center justify-between">
                  <Spot name={icon} size={56} />
                  <span className="font-display text-[48px] font-semibold leading-none text-black/10">0{i + 1}</span>
                </div>
                <p className="font-display mt-8 text-[26px] font-semibold leading-[1.05]">{title}</p>
                <p className="mt-3 text-[15px] leading-relaxed text-ink-soft">{d}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* listings */}
      <section className="container-x py-20 sm:py-28">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div><Eyebrow>{L.nowEyebrow}</Eyebrow><h2 className="h-section">{H.now}</h2></div>
          <div className="flex items-center gap-3">
            <div className="flex gap-0.5 rounded-full bg-white p-1 ring-1 ring-black/10">
              {([['', L.all], ['rent', L.rent], ['sale', L.sale]] as const).map(([v, l]) => (
                <button key={v} onClick={() => setOp(v)} className={`h-9 rounded-full px-4 text-[14px] font-medium transition ${op === v ? 'bg-ink text-white' : 'text-ink-soft hover:text-ink'}`}>{l}</button>
              ))}
            </div>
            <Link to={`/properties${op ? `?op=${op}` : ''}`} className="hidden items-center gap-1 text-[15px] text-ink-soft hover:text-ink sm:flex">{H.all}<ArrowUpRight size={16} /></Link>
          </div>
        </div>
        {listings.length ? (
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{listings.map((p) => <PropertyCard key={p.id} p={p} />)}</div>
        ) : (
          <div className="mt-10 flex flex-col items-start gap-6 rounded-5xl bg-white p-10 ring-1 ring-black/5 sm:flex-row sm:items-center sm:justify-between">
            <p className="max-w-[44ch] text-[18px]">{H.nowEmpty}</p>
            <a href={waLink('')} target="_blank" rel="noreferrer" className="btn-wa"><WhatsAppIcon size={16} />{H.nowAsk}</a>
          </div>
        )}
        <Link to="/properties" className="btn-ghost mt-8 sm:hidden">{H.all}<ArrowUpRight size={16} /></Link>
      </section>

      {/* network */}
      <section className="container-x pb-20 sm:pb-28">
        <div className="relative overflow-hidden rounded-5xl bg-ink p-8 text-white sm:p-14">
          <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-brand-400/20 blur-3xl" />
          <div className="relative grid gap-12 lg:grid-cols-[1fr_1.2fr] lg:items-end">
            <div>
              <Eyebrow light>Realtors of Panama</Eyebrow>
              <h2 className="font-display max-w-[12ch] text-[44px] font-semibold leading-[.95] sm:text-[64px]">{L.netTitle}</h2>
              <p className="mt-6 max-w-[46ch] text-[17px] text-white/65">{L.netSub}</p>
            </div>
            <dl className="grid gap-px overflow-hidden rounded-[28px] bg-white/10 sm:grid-cols-2">
              {L.net.map(([k, v]) => (
                <div key={k} className="bg-ink p-6">
                  <dt className="font-display text-[52px] font-semibold leading-none text-brand-400">{k}</dt>
                  <dd className="mt-3 text-[14px] leading-snug text-white/65">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      {/* audiences */}
      <section className="container-x pb-20 sm:pb-28">
        <h2 className="h-section mb-10 max-w-[16ch]">{L.audTitle}</h2>
        <Audiences />
      </section>

      {/* neighborhoods */}
      <section className="container-x pb-20 sm:pb-28">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div><Eyebrow>{L.hoodsEyebrow}</Eyebrow><h2 className="h-section max-w-[14ch]">{L.hoodsTitle}</h2><p className="mt-4 max-w-[44ch] text-[17px] text-ink-soft">{H.hoodsSub}</p></div>
          <Link to="/neighborhoods" className="flex items-center gap-1 text-[15px] text-ink-soft hover:text-ink">{H.hoodsAll}<ArrowUpRight size={16} /></Link>
        </div>
        <div className="mt-10"><HoodCards /></div>
      </section>

      {/* life gallery */}
      <section className="pb-20 sm:pb-28">
        <div className="container-x"><h2 className="h-sub mb-8">{L.lifeTitle}</h2></div>
        <div className="relative overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_6%,#000_94%,transparent)]">
          <div className="flex w-max animate-[drift_70s_linear_infinite] gap-4 hover:[animation-play-state:paused]">
            {[...L.life, ...L.life].map(([src, cap], i) => (
              <figure key={i} className={`relative shrink-0 overflow-hidden rounded-[28px] ${i % 3 === 1 ? 'h-[360px] w-[280px]' : 'h-[360px] w-[440px]'}`}>
                <img src={src} alt={cap} loading="lazy" className="h-full w-full object-cover" />
                <figcaption className="absolute bottom-4 left-4 rounded-full bg-white/85 px-3.5 py-1.5 text-[13px] font-medium backdrop-blur">{cap}</figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* matcher */}
      <section className="container-x pb-20 sm:pb-28"><NeighborhoodMatcher /></section>

      {/* tools */}
      <section className="container-x grid gap-5 pb-20 sm:pb-28 lg:grid-cols-2">
        <MortgageCalculator />
        <AlertsForm />
      </section>

      {/* owners */}
      <section className="container-x pb-20 sm:pb-28">
        <div className="grid gap-10 overflow-hidden rounded-5xl bg-white p-6 ring-1 ring-black/5 sm:p-12 lg:grid-cols-[1.1fr_1fr] lg:items-center">
          <div>
            <Eyebrow>{L.ownersEyebrow}</Eyebrow>
            <h2 className="font-display max-w-[16ch] text-[40px] font-semibold leading-[.98] sm:text-[56px]">{H.ownersTitle}</h2>
            <p className="mt-5 max-w-[44ch] text-[18px] text-ink-soft">{H.ownersSub}</p>
            <ul className="mt-8 grid gap-3 sm:grid-cols-2">
              {H.ownersPoints.map((pt, i) => <li key={pt} className="flex items-center gap-3 text-[16px]"><Spot name={(['camera', 'chart', 'verified', 'handshake'] as SpotName[])[i] ?? 'verified'} size={36} />{pt}</li>)}
            </ul>
            <Link to="/list-your-property" className="btn-primary btn-lg mt-10">{H.ownersCta}<ArrowUpRight size={18} /></Link>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {ownerPics.map((src, i) => (
              <div key={i} className={`overflow-hidden rounded-[22px] bg-paper ${i % 2 ? 'mt-8' : ''} aspect-[4/5]`}><img src={src} alt="" loading="lazy" className="h-full w-full object-cover" /></div>
            ))}
          </div>
        </div>
      </section>

      {/* guides */}
      <section className="container-x pb-20 sm:pb-28">
        <div className="flex items-end justify-between gap-6">
          <h2 className="h-section">{L.guidesTitle}</h2>
          <Link to="/guides" className="flex items-center gap-1 text-[15px] text-ink-soft hover:text-ink">{L.guidesAll}<ArrowUpRight size={16} /></Link>
        </div>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{GUIDES.slice(0, 3).map((g) => <GuideCard key={g.slug} slug={g.slug} />)}</div>
      </section>

      {/* FAQ */}
      <section className="container-x grid gap-12 pb-20 sm:pb-28 lg:grid-cols-[1fr_1.4fr]">
        <h2 className="h-section max-w-[10ch]">{H.faqTitle}</h2>
        <div className="divide-y divide-black/10 border-y border-black/10">
          {H.faq.map(([q, a], i) => (
            <div key={q}>
              <button onClick={() => setFaq(faq === i ? null : i)} aria-expanded={faq === i} className="flex w-full items-center justify-between gap-6 py-6 text-left">
                <span className="text-[19px] font-medium">{q}</span>
                <Plus size={20} className={`shrink-0 transition ${faq === i ? 'rotate-45' : ''}`} />
              </button>
              {faq === i && <p className="max-w-[62ch] animate-rise pb-6 text-[16px] leading-relaxed text-ink-soft">{a}</p>}
            </div>
          ))}
        </div>
      </section>

      {/* professionals */}
      <section className="container-x pb-24">
        <div className="flex flex-col items-start justify-between gap-8 rounded-5xl bg-brand-100 p-10 sm:p-16 lg:flex-row lg:items-end">
          <div>
            <Spot name="handshake" size={64} tone="light" className="mb-6 text-ink [&>path:first-child]:fill-brand-400" />
            <p className="font-display max-w-[16ch] text-[40px] font-semibold leading-[.98] sm:text-[60px]">{H.proTitle}</p>
            <p className="mt-5 max-w-[46ch] text-[17px] text-ink/70">{H.proSub}</p>
          </div>
          <Link to="/work-with-us" className="btn-primary btn-lg shrink-0">{H.proCta}<ArrowUpRight size={18} /></Link>
        </div>
      </section>
    </>
  )
}
