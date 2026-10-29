import { Suspense } from 'react'
import { Link, NavLink, Navigate, Outlet, useNavigate } from 'react-router-dom'
import { LayoutGrid, Building, Users, LogOut, ExternalLink, Database, FileSignature } from 'lucide-react'
import { useI18n } from '@/i18n'
import { useStore } from '@/lib/store'
import { Logo } from '@/components/ui'
import { LangToggle } from '@/components/Layout'

export default function AdminLayout() {
  const { t } = useI18n()
  const { user, ready, logout, leads, demo } = useStore()
  const nav = useNavigate()
  if (!ready) return <div className="p-10 text-center text-ink-soft">{t.common.loading}</div>
  if (!user) return <Navigate to="/login" replace />

  const n = t.admin.nav
  const fresh = leads.filter((l) => l.stage === 'new').length
  const items = [
    { to: '/admin', label: n.overview, Icon: LayoutGrid, end: true },
    { to: '/admin/listings', label: n.listings, Icon: Building },
    { to: '/admin/clients', label: n.clients, Icon: Users, badge: fresh },
    { to: '/admin/bolsa', label: 'Bolsa', Icon: Database },
    { to: '/admin/contracts', label: t.nav.login === 'Entrar' ? 'Contratos' : 'Contracts', Icon: FileSignature },
  ]
  const linkCls = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${isActive ? 'bg-brand-50 text-brand-700' : 'text-ink-soft hover:bg-canvas hover:text-ink'}`
  const out = async () => { await logout(); nav('/') }

  return (
    <div className="min-h-screen bg-canvas">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 flex-col border-r border-line bg-white px-4 py-5 lg:flex">
        <div className="px-2"><Logo to="/" /></div>
        <p className="mt-4 truncate px-2 text-xs text-ink-mute">{user.email}</p>
        <nav className="mt-5 flex flex-1 flex-col gap-0.5">
          {items.map(({ to, label, Icon, end, badge }) => (
            <NavLink key={to} to={to} end={end} className={linkCls}>
              <Icon size={18} /><span className="flex-1">{label}</span>
              {!!badge && <span className="rounded-full bg-brand-500 px-1.5 py-0.5 text-[10px] font-bold text-white">{badge}</span>}
            </NavLink>
          ))}
        </nav>
        <div className="space-y-0.5 border-t border-line pt-3">
          <Link to="/" className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold text-ink-soft hover:bg-canvas"><ExternalLink size={17} />{n.site}</Link>
          <button onClick={out} className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold text-ink-soft hover:bg-canvas"><LogOut size={17} />{t.nav.logout}</button>
          <div className="px-1 pt-1"><LangToggle /></div>
        </div>
      </aside>

      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-line bg-white/90 px-4 backdrop-blur lg:hidden">
        <Logo to="/" />
        <div className="flex items-center gap-1"><LangToggle /><button onClick={out} className="p-2 text-ink-soft" aria-label={t.nav.logout}><LogOut size={18} /></button></div>
      </header>

      <main className="px-4 pb-28 pt-6 sm:px-6 lg:ml-60 lg:px-10 lg:pb-12 lg:pt-10">
        {demo && <p className="mx-auto mb-4 max-w-6xl rounded-xl bg-sun-400/25 px-4 py-2 text-xs font-semibold text-amber-900">{t.common.demo}</p>}
        <div className="mx-auto max-w-6xl"><Suspense fallback={<div className="p-10 text-center text-ink-soft">{t.common.loading}</div>}><Outlet /></Suspense></div>
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-30 flex justify-around border-t border-line bg-white/95 px-2 pb-[max(env(safe-area-inset-bottom),8px)] pt-2 backdrop-blur lg:hidden">
        {[...items, { to: '/', label: n.site, Icon: ExternalLink, end: true, badge: 0 }].map(({ to, label, Icon, end }) => (
          <NavLink key={to} to={to} end={end} className={({ isActive }) => `flex min-w-[52px] flex-col items-center gap-0.5 rounded-xl px-2 py-1 text-[10px] font-semibold ${isActive ? 'text-brand-600' : 'text-ink-mute'}`}>
            <Icon size={20} /><span>{label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
