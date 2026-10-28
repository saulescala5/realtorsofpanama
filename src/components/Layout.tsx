import { useEffect, useState } from 'react'
import { WhatsAppIcon } from './icons'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { Menu, X, ArrowUpRight, MapPin, Heart } from 'lucide-react'
import { useSaved } from '@/lib/saved'
import { useI18n } from '@/i18n'
import { useStore } from '@/lib/store'
import { waLink } from '@/lib/whatsapp'
import { NEIGHBORHOODS } from '@/lib/neighborhoods'
import { Logo } from './ui'

export function LangToggle({ dark = false }: { dark?: boolean }) {
  const { lang, setLang } = useI18n()
  return (
    <button onClick={() => setLang(lang === 'en' ? 'es' : 'en')}
      className={`h-10 rounded-full px-3 text-[14px] transition ${dark ? 'text-white/70 hover:text-white' : 'text-ink-soft hover:text-ink'}`}
      aria-label={lang === 'en' ? 'Cambiar a español' : 'Switch to English'}>
      {lang === 'en' ? 'Español' : 'English'}
    </button>
  )
}

export function Navbar() {
  const { t, lang } = useI18n()
  const saved = useSaved()
  const { user } = useStore()
  const { pathname, search } = useLocation()
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => setOpen(false), [pathname, search])
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 8)
    on(); window.addEventListener('scroll', on, { passive: true })
    return () => window.removeEventListener('scroll', on)
  }, [])
  useEffect(() => { document.body.style.overflow = open ? 'hidden' : ''; return () => { document.body.style.overflow = '' } }, [open])

  const links = [
    { to: '/properties?op=rent', label: t.nav.rent },
    { to: '/properties?op=sale', label: t.nav.buy },
    { to: '/neighborhoods', label: t.nav.neighborhoods },
    { to: '/guides', label: lang === 'es' ? 'Guías' : 'Guides' },
    { to: '/list-your-property', label: t.nav.list },
    { to: '/work-with-us', label: t.nav.network },
  ]

  return (
    <header className={`sticky top-0 z-40 transition ${scrolled || open ? 'bg-paper/85 backdrop-blur-xl shadow-[0_1px_0_rgba(0,0,0,.06)]' : 'bg-paper'}`}>
      <div className="container-x flex h-20 items-center justify-between gap-6">
        <Logo />
        <nav className="hidden items-center gap-8 xl:flex">
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} className={({ isActive }) => `text-[14px] transition ${isActive && !l.to.includes('?') ? 'text-ink' : 'text-ink-soft hover:text-ink'}`}>{l.label}</NavLink>
          ))}
        </nav>
        <div className="flex items-center gap-1.5">
          <LangToggle />
          <Link to="/saved" aria-label={lang === 'es' ? 'Guardadas' : 'Saved homes'} className="relative flex h-10 w-10 items-center justify-center rounded-full hover:bg-black/5">
            <Heart size={19} />{saved.ids.length > 0 && <span className="absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-ink px-1 text-[10px] text-white">{saved.ids.length}</span>}
          </Link>
          {user && <Link to="/admin" className="hidden h-10 items-center rounded-full px-3 text-[14px] text-ink-soft hover:text-ink sm:flex">{t.nav.admin}</Link>}
          <a href={waLink('')} target="_blank" rel="noreferrer" className="btn-wa btn-sm hidden sm:inline-flex"><WhatsAppIcon size={16} />WhatsApp</a>
          <button className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-black/5 xl:hidden" onClick={() => setOpen(!open)} aria-label="Menu" aria-expanded={open}>
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>
      {open && (
        <div className="container-x h-[calc(100svh-5rem)] overflow-y-auto pb-10 xl:hidden">
          <nav className="flex flex-col pt-4">
            {links.map((l, i) => (
              <Link key={l.to} to={l.to} className="font-display animate-rise py-3 text-[44px] font-semibold leading-none" style={{ animationDelay: `${i * 40}ms` }}>{l.label}</Link>
            ))}
            {user && <Link to="/admin" className="font-display py-3 text-[44px] font-semibold leading-none text-ink-soft">{t.nav.admin}</Link>}
          </nav>
          <a href={waLink('')} target="_blank" rel="noreferrer" className="btn-wa btn-lg mt-8 w-full"><WhatsAppIcon size={18} />WhatsApp +507 6854-8420</a>
        </div>
      )}
    </header>
  )
}

export function Footer() {
  const { t, lang } = useI18n()
  const F = t.footer
  const col = (title: string, items: [string, string][]) => (
    <div>
      <p className="text-[13px] text-white/40">{title}</p>
      <ul className="mt-4 space-y-2.5 text-[15px] text-white/80">
        {items.map(([to, label]) => <li key={to + label}><Link to={to} className="transition hover:text-white">{label}</Link></li>)}
      </ul>
    </div>
  )
  return (
    <footer className="bg-ink text-white">
      <div className="container-x pt-20 sm:pt-28">
        <div className="flex flex-col gap-10 border-b border-white/10 pb-16 lg:flex-row lg:items-end lg:justify-between">
          <p className="font-display max-w-[14ch] text-[44px] font-semibold leading-[.95] sm:text-[72px]">{F.cta}</p>
          <div className="flex flex-wrap gap-3">
            <a href={waLink('')} target="_blank" rel="noreferrer" className="btn-gold btn-lg"><WhatsAppIcon size={18} />{F.ctaWa}</a>
            <Link to="/properties" className="btn-outline-light btn-lg">{F.ctaBrowse}<ArrowUpRight size={18} /></Link>
          </div>
        </div>

        <div className="grid gap-12 py-16 sm:grid-cols-2 lg:grid-cols-[1.3fr_1fr_1fr_1fr]">
          <div className="space-y-4 text-[15px] text-white/80">
            <a href={waLink('')} target="_blank" rel="noreferrer" className="flex items-center gap-3 hover:text-white"><WhatsAppIcon size={17} className="text-mint-400" />+507 6854-8420</a>
            <p className="flex items-start gap-3"><MapPin size={17} className="mt-1 shrink-0 text-brand-400" />Calle 50, Torre Global Bank<br />Panama City, Panama</p>
            <p className="pt-2 text-[14px] text-white/50">{F.tagline}</p>
          </div>
          {col(F.explore, [['/properties?op=rent', t.nav.rent], ['/properties?op=sale', t.nav.buy], ['/properties', F.map], ['/neighborhoods', t.nav.neighborhoods], ['/guides', lang === 'es' ? 'Guías' : 'Guides'], ['/saved', lang === 'es' ? 'Guardadas' : 'Saved homes']])}
          {col(F.neighborhoods, NEIGHBORHOODS.filter((n) => n.featured).slice(0, 6).map((n) => [`/neighborhoods/${n.slug}`, n.name]))}
          {col(F.company, [['/list-your-property', t.nav.list], ['/work-with-us', t.nav.network], ['/contact', t.nav.contact], ['/login', t.nav.admin]])}
        </div>

        <img src="/brand/logo-white.png" alt="" aria-hidden className="w-full select-none opacity-[.07]" draggable={false} />
        <div className="flex flex-wrap items-center justify-between gap-4 py-8 text-[13px] text-white/40">
          <span>© {new Date().getFullYear()} Realtors of Panama. {F.rights}</span>
          <span>{lang === 'es' ? 'Hecho en Panamá' : 'Made in Panama'}</span>
        </div>
      </div>
    </footer>
  )
}

export function PublicLayout() {
  const { pathname } = useLocation()
  const { demo } = useStore()
  const { t } = useI18n()
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1"><Outlet /></main>
      {demo && <div className="bg-brand-100 px-4 py-2 text-center text-xs text-brand-900">{t.common.demo}</div>}
      <Footer />
      <a href={waLink('')} target="_blank" rel="noreferrer" aria-label="WhatsApp"
        className="fixed bottom-5 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lift transition hover:scale-105">
        <WhatsAppIcon size={28} />
      </a>
    </div>
  )
}
