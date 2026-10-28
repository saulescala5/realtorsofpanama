import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { Menu, X, MessageCircle } from 'lucide-react'
import { useI18n } from '@/i18n'
import { useStore } from '@/lib/store'
import { waLink } from '@/lib/whatsapp'
import { Logo } from './ui'

export function LangToggle({ dark = false }: { dark?: boolean }) {
  const { lang, setLang } = useI18n()
  return (
    <button onClick={() => setLang(lang === 'en' ? 'es' : 'en')}
      className={`h-9 px-2 text-[13px] font-medium transition ${dark ? 'text-white/70 hover:text-white' : 'text-ink-soft hover:text-ink'}`}
      aria-label={lang === 'en' ? 'Cambiar a español' : 'Switch to English'}>
      {lang === 'en' ? 'Español' : 'English'}
    </button>
  )
}

export function Navbar() {
  const { t } = useI18n()
  const { user } = useStore()
  const { pathname, search } = useLocation()
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const overHero = pathname === '/' && !scrolled && !open

  useEffect(() => setOpen(false), [pathname, search])
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 40)
    on(); window.addEventListener('scroll', on, { passive: true })
    return () => window.removeEventListener('scroll', on)
  }, [])

  const links = [
    { to: '/properties?op=rent', label: t.nav.rent },
    { to: '/properties?op=sale', label: t.nav.buy },
    { to: '/neighborhoods', label: t.nav.neighborhoods },
    { to: '/list-your-property', label: t.nav.list },
    { to: '/work-with-us', label: t.nav.network },
  ]
  const tone = overHero ? 'text-white/80 hover:text-white' : 'text-ink-soft hover:text-ink'

  return (
    <header className={`${pathname === '/' ? 'fixed' : 'sticky'} inset-x-0 top-0 z-40 transition-colors duration-300 ${overHero ? 'bg-transparent' : 'bg-white/95 backdrop-blur border-b border-line'}`}>
      <div className="container-x flex h-[72px] items-center justify-between gap-6">
        <Logo white={overHero} />
        <nav className="hidden items-center gap-7 xl:flex">
          {links.map((l) => <NavLink key={l.to} to={l.to} className={`text-[14px] font-medium transition ${tone}`}>{l.label}</NavLink>)}
        </nav>
        <div className="flex items-center gap-2">
          <LangToggle dark={overHero} />
          {user && <Link to="/admin" className={`hidden px-2 text-[13px] font-medium sm:block ${tone}`}>{t.nav.admin}</Link>}
          <a href={waLink('')} target="_blank" rel="noreferrer" className={`btn-sm hidden sm:inline-flex ${overHero ? 'btn-gold' : 'btn-primary'}`}><MessageCircle size={15} />{t.nav.whatsapp}</a>
          <button className={`flex h-10 w-10 items-center justify-center xl:hidden ${overHero ? 'text-white' : 'text-ink'}`} onClick={() => setOpen(!open)} aria-label="Menu" aria-expanded={open}>
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>
      {open && (
        <div className="container-x border-t border-line bg-white pb-6 xl:hidden">
          <div className="flex flex-col pt-2">
            {links.map((l) => <Link key={l.to} to={l.to} className="border-b border-line py-4 font-display text-xl">{l.label}</Link>)}
            {user && <Link to="/admin" className="border-b border-line py-4 font-display text-xl">{t.nav.admin}</Link>}
            <a href={waLink('')} target="_blank" rel="noreferrer" className="btn-primary mt-5"><MessageCircle size={16} />WhatsApp +507 6854-8420</a>
          </div>
        </div>
      )}
    </header>
  )
}

export function Footer() {
  const { t } = useI18n()
  return (
    <footer className="bg-night text-white">
      <div className="container-x grid gap-12 py-16 md:grid-cols-[1.6fr_1fr_1fr]">
        <div>
          <Logo white />
          <p className="mt-5 max-w-xs text-[14px] text-white/60">{t.footer.tagline}</p>
          <a href={waLink('')} target="_blank" rel="noreferrer" className="mt-6 inline-flex items-center gap-2 text-[15px] text-brand-300 hover:text-brand-200"><MessageCircle size={16} />+507 6854-8420</a>
        </div>
        <div>
          <p className="mb-4 text-[13px] text-white/40">{t.footer.explore}</p>
          <ul className="space-y-2.5 text-[14px] text-white/75">
            <li><Link to="/properties?op=rent" className="hover:text-white">{t.nav.rent}</Link></li>
            <li><Link to="/properties?op=sale" className="hover:text-white">{t.nav.buy}</Link></li>
            <li><Link to="/neighborhoods" className="hover:text-white">{t.nav.neighborhoods}</Link></li>
          </ul>
        </div>
        <div>
          <p className="mb-4 text-[13px] text-white/40">{t.footer.company}</p>
          <ul className="space-y-2.5 text-[14px] text-white/75">
            <li><Link to="/list-your-property" className="hover:text-white">{t.nav.list}</Link></li>
            <li><Link to="/work-with-us" className="hover:text-white">{t.nav.network}</Link></li>
            <li><Link to="/contact" className="hover:text-white">{t.nav.contact}</Link></li>
            <li><Link to="/login" className="hover:text-white">{t.nav.admin}</Link></li>
          </ul>
        </div>
      </div>
      <div className="container-x border-t border-night-line py-6 text-xs text-white/40">© {new Date().getFullYear()} Realtors of Panama. {t.footer.rights}</div>
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
      {demo && <div className="bg-brand-100 px-4 py-2 text-center text-xs font-medium text-brand-900">{t.common.demo}</div>}
      <Footer />
      <a href={waLink('')} target="_blank" rel="noreferrer" aria-label="WhatsApp"
        className="fixed bottom-5 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-mint-500 text-white shadow-lift sm:hidden">
        <MessageCircle size={26} />
      </a>
    </div>
  )
}
