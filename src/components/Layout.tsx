import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { Menu, X, Globe, MessageCircle } from 'lucide-react'
import { useI18n } from '@/i18n'
import { useStore } from '@/lib/store'
import { waLink } from '@/lib/whatsapp'
import { Logo } from './ui'

export function LangToggle({ dark = false }: { dark?: boolean }) {
  const { lang, setLang } = useI18n()
  return (
    <button onClick={() => setLang(lang === 'en' ? 'es' : 'en')}
      className={`inline-flex h-9 items-center gap-1.5 rounded-full px-3 text-xs font-bold uppercase tracking-wide transition ${dark ? 'text-white/80 hover:bg-white/10' : 'text-ink-soft hover:bg-canvas'}`}
      aria-label="Change language">
      <Globe size={15} />{lang === 'en' ? 'ES' : 'EN'}
    </button>
  )
}

export function Navbar() {
  const { t } = useI18n()
  const { user } = useStore()
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const loc = useLocation()

  useEffect(() => setOpen(false), [loc.pathname, loc.search])
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 8)
    on(); window.addEventListener('scroll', on, { passive: true })
    return () => window.removeEventListener('scroll', on)
  }, [])

  const links = [
    { to: '/properties?op=rent', label: t.nav.rent },
    { to: '/properties?op=sale', label: t.nav.buy },
    { to: '/list-your-property', label: t.nav.list },
    { to: '/contact', label: t.nav.contact },
  ]

  return (
    <header className={`sticky top-0 z-40 transition ${scrolled || open ? 'bg-white/85 backdrop-blur-xl shadow-[0_1px_0_#E9EEF5]' : 'bg-white'}`}>
      <div className="container-x flex h-16 items-center justify-between gap-4">
        <Logo />
        <nav className="hidden items-center gap-1 lg:flex">
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} className="whitespace-nowrap rounded-full px-3.5 py-2 text-sm font-semibold text-ink-soft transition hover:text-ink">{l.label}</NavLink>
          ))}
        </nav>
        <div className="flex items-center gap-1.5">
          <LangToggle />
          {user && <Link to="/admin" className="hidden px-3 text-sm font-semibold text-ink-soft hover:text-ink sm:block">{t.nav.admin}</Link>}
          <a href={waLink('')} target="_blank" rel="noreferrer" className="btn-wa btn-sm hidden sm:inline-flex"><MessageCircle size={15} />{t.nav.whatsapp}</a>
          <button className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-canvas lg:hidden" onClick={() => setOpen(!open)} aria-label="Menu">
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>
      {open && (
        <div className="container-x animate-rise pb-5 lg:hidden">
          <div className="flex flex-col gap-1 border-t border-line pt-3">
            {links.map((l) => <Link key={l.to} to={l.to} className="rounded-xl px-3 py-3 text-[15px] font-semibold hover:bg-canvas">{l.label}</Link>)}
            {user && <Link to="/admin" className="rounded-xl px-3 py-3 text-[15px] font-semibold hover:bg-canvas">{t.nav.admin}</Link>}
            <a href={waLink('')} target="_blank" rel="noreferrer" className="btn-wa mt-2"><MessageCircle size={16} />{t.nav.whatsapp}</a>
          </div>
        </div>
      )}
    </header>
  )
}

export function Footer() {
  const { t } = useI18n()
  return (
    <footer className="border-t border-line bg-canvas">
      <div className="container-x grid gap-10 py-14 md:grid-cols-[1.5fr_1fr_1fr]">
        <div>
          <Logo />
          <p className="mt-3 max-w-xs text-sm text-ink-soft">{t.footer.tagline}</p>
        </div>
        <ul className="space-y-2 text-sm text-ink-soft">
          <li><Link to="/properties?op=rent" className="hover:text-ink">{t.nav.rent}</Link></li>
          <li><Link to="/properties?op=sale" className="hover:text-ink">{t.nav.buy}</Link></li>
          <li><Link to="/list-your-property" className="hover:text-ink">{t.nav.list}</Link></li>
        </ul>
        <ul className="space-y-2 text-sm text-ink-soft">
          <li><Link to="/contact" className="hover:text-ink">{t.nav.contact}</Link></li>
          <li><a href={waLink('')} target="_blank" rel="noreferrer" className="hover:text-ink">WhatsApp +507 6854-8420</a></li>
          <li><Link to="/login" className="hover:text-ink">{t.nav.admin}</Link></li>
        </ul>
      </div>
      <div className="container-x border-t border-line py-6 text-xs text-ink-mute">© {new Date().getFullYear()} Realtors of Panama. {t.footer.rights}</div>
    </footer>
  )
}

export function PublicLayout() {
  const { pathname } = useLocation()
  const { demo, t } = { ...useStore(), ...useI18n() }
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])
  return (
    <div className="flex min-h-screen flex-col">
      {demo && <div className="bg-sun-400/30 px-4 py-1.5 text-center text-xs font-semibold text-amber-900">{t.common.demo}</div>}
      <Navbar />
      <main className="flex-1"><Outlet /></main>
      <Footer />
      <a href={waLink('')} target="_blank" rel="noreferrer" aria-label="WhatsApp"
        className="fixed bottom-5 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-mint-500 text-white shadow-lift transition hover:scale-105 sm:hidden">
        <MessageCircle size={26} />
      </a>
    </div>
  )
}
