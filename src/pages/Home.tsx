import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Search, MessageCircle, KeyRound, Home as HomeIcon, Megaphone, ArrowRight } from 'lucide-react'
import { useI18n } from '@/i18n'
import { useStore } from '@/lib/store'
import { waLink } from '@/lib/whatsapp'
import { PropertyCard } from '@/components/PropertyCard'
import { CheckItem } from '@/components/ui'

export default function Home() {
  const { t } = useI18n()
  const { publicProperties } = useStore()
  const nav = useNavigate()
  const [q, setQ] = useState('')
  const [op, setOp] = useState<'rent' | 'sale'>('rent')
  const H = t.home
  const featured = [...publicProperties].sort((a, b) => Number(b.featured) - Number(a.featured)).slice(0, 8)
  const icons = [KeyRound, HomeIcon, Megaphone]
  const serviceLinks = ['/properties?op=rent', '/properties?op=sale', '/list-your-property']

  const go = () => nav(`/properties?op=${op}${q.trim() ? `&q=${encodeURIComponent(q.trim())}` : ''}`)

  return (
    <>
      <section className="relative overflow-hidden bg-gradient-to-b from-brand-50 to-white">
        <div className="grid-bg absolute inset-0 opacity-60" />
        <div className="container-x relative py-16 sm:py-24">
          <p className="eyebrow">{H.eyebrow}</p>
          <h1 className="h-display mt-4 max-w-3xl">{H.title}</h1>
          <p className="mt-5 max-w-2xl text-lg text-ink-soft">{H.sub}</p>

          <div className="mt-8 max-w-2xl rounded-3xl bg-white p-2 shadow-lift ring-1 ring-line">
            <div className="flex gap-1 p-1">
              {(['rent', 'sale'] as const).map((o) => (
                <button key={o} onClick={() => setOp(o)} className={`h-9 rounded-full px-4 text-sm font-semibold transition ${op === o ? 'bg-ink text-white' : 'text-ink-soft hover:text-ink'}`}>
                  {o === 'rent' ? t.nav.rent : t.nav.buy}
                </button>
              ))}
            </div>
            <form onSubmit={(e) => { e.preventDefault(); go() }} className="flex items-center gap-2 p-1">
              <label className="flex h-12 flex-1 items-center gap-2 rounded-2xl bg-canvas px-4">
                <Search size={18} className="text-ink-mute" />
                <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={H.searchPh} className="h-full flex-1 bg-transparent text-[15px] outline-none" />
              </label>
              <button className="btn-primary h-12 px-6">{H.search}</button>
            </form>
          </div>
          <a href={waLink('')} target="_blank" rel="noreferrer" className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-mint-600 hover:text-mint-500">
            <MessageCircle size={17} />{H.ctaWa} <ArrowRight size={15} />
          </a>
        </div>
      </section>

      {featured.length > 0 && (
        <section className="container-x py-16">
          <div className="flex items-end justify-between gap-4">
            <h2 className="h-section">{H.featured}</h2>
            <Link to="/properties" className="hidden text-sm font-bold text-brand-600 hover:text-brand-700 sm:block">{H.seeAll} →</Link>
          </div>
          <div className="mt-8 grid gap-x-5 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
            {featured.map((p) => <PropertyCard key={p.id} p={p} />)}
          </div>
          <Link to="/properties" className="btn-ghost mt-10 sm:hidden">{H.seeAll}</Link>
        </section>
      )}

      <section className="bg-canvas py-16">
        <div className="container-x">
          <h2 className="h-section">{H.servicesTitle}</h2>
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {H.services.map((s, i) => {
              const Icon = icons[i]
              return (
                <Link key={s.t} to={serviceLinks[i]} className="card group p-7 transition hover:shadow-lift">
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-50 text-brand-600"><Icon size={21} /></span>
                  <h3 className="mt-5 text-lg font-extrabold">{s.t}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-soft">{s.d}</p>
                  <ArrowRight size={18} className="mt-5 text-brand-500 transition group-hover:translate-x-1" />
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      <section className="container-x grid gap-10 py-16 lg:grid-cols-2 lg:items-center">
        <div>
          <h2 className="h-section">{H.whyTitle}</h2>
          <ul className="mt-6 space-y-3">{H.why.map((w) => <CheckItem key={w}>{w}</CheckItem>)}</ul>
        </div>
        <div className="rounded-[28px] bg-ink p-8 text-white sm:p-10">
          <h3 className="text-2xl font-extrabold tracking-tight">{H.ownerTitle}</h3>
          <p className="mt-3 text-white/75">{H.ownerSub}</p>
          <Link to="/list-your-property" className="btn mt-7 bg-white text-ink hover:bg-brand-50">{H.ownerCta}<ArrowRight size={16} /></Link>
        </div>
      </section>
    </>
  )
}
