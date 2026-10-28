import { lazy, Suspense, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowUpRight, Plus, Check, MessageCircle } from 'lucide-react'
import { useI18n } from '@/i18n'
import { useStore } from '@/lib/store'
import { NEIGHBORHOODS, hood, tr } from '@/lib/neighborhoods'
import { coordsOf, shortPrice } from '@/lib/geo'
import { waLink } from '@/lib/whatsapp'
import { PropertyCard } from '@/components/PropertyCard'
import { SmartSearch } from '@/components/SmartSearch'

const City3D = lazy(() => import('@/components/City3D'))

export default function Home() {
  const { t, lang } = useI18n()
  const { publicProperties } = useStore()
  const nav = useNavigate()
  const H = t.home
  const [area, setArea] = useState<string | null>(null)
  const [faq, setFaq] = useState<number | null>(0)
  const focus = area ? hood(area) ?? null : null
  const pins = useMemo(() => publicProperties.flatMap((p) => { const c = coordsOf(p); return c ? [{ id: p.id, ...c, label: shortPrice(p) }] : [] }), [publicProperties])
  const guides = NEIGHBORHOODS.filter((n) => n.featured)
  const listings = [...publicProperties].sort((a, b) => Number(b.featured) - Number(a.featured) || b.createdAt.localeCompare(a.createdAt)).slice(0, 6)
  const countIn = (slug: string) => publicProperties.filter((p) => p.location === slug).length

  return (
    <>
      {/* hero */}
      <section className="container-x pt-10 text-center sm:pt-16">
        <div className="flex items-center justify-center gap-6 sm:gap-10">
          <span className="hidden h-px flex-1 origin-right bg-ink lg:block animate-[growline_1.2s_.3s_cubic-bezier(.2,.7,.1,1)_both]" />
          <h1 className="h-display max-w-[11ch] animate-[lineup_1s_cubic-bezier(.2,.7,.1,1)_both] lg:max-w-[9ch]">{H.h1}</h1>
          <span className="hidden h-px flex-1 origin-left bg-ink lg:block animate-[growline_1.2s_.3s_cubic-bezier(.2,.7,.1,1)_both]" />
        </div>
        <p className="mx-auto mt-6 max-w-[46ch] text-[18px] leading-relaxed text-ink-soft animate-[fadein_1s_.5s_both]">{H.sub}</p>
        <div className="mx-auto mt-9 max-w-[680px] text-left animate-[fadein_1s_.65s_both]"><SmartSearch dark={false} onFocusArea={setArea} /></div>
        <div className="mt-5 flex flex-wrap justify-center gap-2 animate-[fadein_1s_.8s_both]">
          {H.quick.map(([l, to]) => <Link key={l} to={to} className="rounded-full px-4 py-2 text-[14px] text-ink-soft ring-1 ring-black/10 transition hover:bg-white hover:text-ink">{l}</Link>)}
        </div>
      </section>

      {/* the city */}
      <section className="mx-auto mt-14 max-w-[1320px] px-3 sm:px-10">
        <div className="relative h-[64vh] min-h-[440px] overflow-hidden rounded-5xl bg-white ring-1 ring-black/5 animate-[fadein_1.6s_.4s_both]">
          <Suspense fallback={null}><City3D theme="light" points={pins} focus={focus} zoom={14} onSelect={(id) => nav(`/property/${id}`)} /></Suspense>
          <p className="pointer-events-none absolute left-5 top-5 hidden rounded-full bg-white/80 px-3 py-1.5 text-[13px] text-ink-soft backdrop-blur sm:block">{H.mapHint}</p>
          <div className="no-scrollbar absolute inset-x-4 bottom-4 flex gap-2 overflow-x-auto sm:inset-x-6 sm:bottom-6">
            {guides.map((n) => (
              <button key={n.slug} onMouseEnter={() => setArea(n.slug)} onFocus={() => setArea(n.slug)} onClick={() => nav(`/neighborhoods/${n.slug}`)}
                className={`shrink-0 rounded-full px-4 py-2 text-[14px] backdrop-blur-xl transition ${area === n.slug ? 'bg-ink text-white' : 'bg-white/85 ring-1 ring-black/10 hover:bg-white'}`}>{n.name}</button>
            ))}
          </div>
        </div>
      </section>

      {/* promises */}
      <section className="container-x grid gap-10 py-24 md:grid-cols-3 sm:py-32">
        {H.gets.map(([title, d]) => (
          <div key={title}>
            <p className="font-display text-[36px] font-semibold leading-none sm:text-[46px]">{title}</p>
            <p className="mt-4 max-w-[30ch] text-[17px] text-ink-soft">{d}</p>
          </div>
        ))}
      </section>

      {/* listings */}
      <section className="container-x pb-24 sm:pb-32">
        <div className="flex items-end justify-between gap-6">
          <h2 className="h-section">{H.now}</h2>
          <Link to="/properties" className="flex shrink-0 items-center gap-1 text-[15px] text-ink-soft hover:text-ink">{H.all}<ArrowUpRight size={16} /></Link>
        </div>
        {listings.length ? (
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{listings.map((p) => <PropertyCard key={p.id} p={p} />)}</div>
        ) : (
          <div className="mt-10 flex flex-col items-start gap-6 rounded-5xl bg-white p-10 ring-1 ring-black/5 sm:flex-row sm:items-center sm:justify-between">
            <p className="max-w-[44ch] text-[18px]">{H.nowEmpty}</p>
            <a href={waLink('')} target="_blank" rel="noreferrer" className="btn-primary"><MessageCircle size={16} />{H.nowAsk}</a>
          </div>
        )}
      </section>

      {/* how it works */}
      <section className="bg-white py-24 sm:py-32">
        <div className="container-x">
          <h2 className="h-section max-w-[12ch]">{H.stepsTitle}</h2>
          <ol className="mt-16 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
            {H.steps.map(([title, d], i) => (
              <li key={title} className="relative">
                <div className="flex items-center gap-4">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-ink text-[15px] font-medium text-white">{i + 1}</span>
                  {i < H.steps.length - 1 && <span className="hidden h-px flex-1 bg-black/15 lg:block" />}
                </div>
                <p className="font-display mt-6 text-[30px] font-semibold leading-none">{title}</p>
                <p className="mt-3 max-w-[28ch] text-[16px] text-ink-soft">{d}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* neighborhoods */}
      <section className="py-24 sm:py-32">
        <div className="container-x flex flex-wrap items-end justify-between gap-6">
          <div>
            <h2 className="h-section">{H.hoodsTitle}</h2>
            <p className="mt-4 max-w-[44ch] text-[17px] text-ink-soft">{H.hoodsSub}</p>
          </div>
          <Link to="/neighborhoods" className="flex items-center gap-1 text-[15px] text-ink-soft hover:text-ink">{H.hoodsAll}<ArrowUpRight size={16} /></Link>
        </div>
        <div className="mt-14 overflow-hidden border-y border-black/10 bg-white py-10">
          <div className="flex w-max animate-[drift_70s_linear_infinite] gap-14 whitespace-nowrap hover:[animation-play-state:paused]">
            {[...guides, ...guides].map((n, i) => (
              <Link key={n.slug + i} to={`/neighborhoods/${n.slug}`} className="group flex items-baseline gap-4" tabIndex={i >= guides.length ? -1 : 0}>
                <span className="font-display text-[56px] font-semibold leading-none text-black/15 transition group-hover:text-ink sm:text-[80px]">{n.name}</span>
                <span className="w-[22ch] whitespace-normal text-[14px] text-ink-soft opacity-0 transition group-hover:opacity-100">{tr(n.tagline, lang)} · {t.hoods.listings(countIn(n.slug))}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* services bento */}
      <section className="container-x pb-24 sm:pb-32">
        <h2 className="h-section max-w-[16ch]">{H.servicesTitle}</h2>
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
          {H.services.map(([title, d, to], i) => (
            <Link key={title} to={to}
              className={`group flex min-h-[220px] flex-col justify-between rounded-[28px] p-8 transition hover:-translate-y-1 ${i < 2 ? 'lg:col-span-3' : 'lg:col-span-2'} ${i === 0 ? 'bg-ink text-white' : 'bg-white ring-1 ring-black/5'}`}>
              <ArrowUpRight size={22} className={`self-end transition group-hover:rotate-45 ${i === 0 ? 'text-brand-400' : ''}`} />
              <div>
                <p className="font-display text-[34px] font-semibold leading-none sm:text-[40px]">{title}</p>
                <p className={`mt-3 max-w-[34ch] text-[16px] ${i === 0 ? 'text-white/65' : 'text-ink-soft'}`}>{d}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* owners */}
      <section className="container-x pb-24 sm:pb-32">
        <div className="grid gap-12 overflow-hidden rounded-5xl bg-brand-400 p-8 sm:p-14 lg:grid-cols-[1.2fr_1fr] lg:items-end">
          <div>
            <h2 className="font-display max-w-[16ch] text-[40px] font-semibold leading-[.98] sm:text-[60px]">{H.ownersTitle}</h2>
            <p className="mt-5 max-w-[44ch] text-[18px]">{H.ownersSub}</p>
            <Link to="/list-your-property" className="btn-primary btn-lg mt-10">{H.ownersCta}<ArrowUpRight size={18} /></Link>
          </div>
          <ul className="space-y-3">
            {H.ownersPoints.map((pt) => (
              <li key={pt} className="flex items-center gap-3 rounded-2xl bg-white/50 px-5 py-4 text-[17px] backdrop-blur"><Check size={18} className="shrink-0" />{pt}</li>
            ))}
          </ul>
        </div>
      </section>

      {/* FAQ */}
      <section className="container-x grid gap-12 pb-24 sm:pb-32 lg:grid-cols-[1fr_1.4fr]">
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
        <div className="flex flex-col items-start justify-between gap-8 rounded-5xl bg-white p-10 ring-1 ring-black/5 sm:p-16 lg:flex-row lg:items-end">
          <div>
            <p className="font-display max-w-[16ch] text-[40px] font-semibold leading-[.98] sm:text-[60px]">{H.proTitle}</p>
            <p className="mt-5 max-w-[46ch] text-[17px] text-ink-soft">{H.proSub}</p>
          </div>
          <Link to="/work-with-us" className="btn-primary btn-lg shrink-0">{H.proCta}<ArrowUpRight size={18} /></Link>
        </div>
      </section>
    </>
  )
}
