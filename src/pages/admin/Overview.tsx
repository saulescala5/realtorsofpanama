import { Link } from 'react-router-dom'
import { Flame, Plus, FolderUp, MessageCircle } from 'lucide-react'
import { useI18n } from '@/i18n'
import { useStore } from '@/lib/store'
import { timeAgo } from '@/lib/format'
import { PageHeader } from '@/components/ui'

export default function Overview() {
  const { t, lang } = useI18n()
  const { leads, properties } = useStore()
  const O = t.admin.overview
  const L = t.admin.leads
  const hot = leads.filter((l) => l.score === 'hot' && !['won', 'lost'].includes(l.stage)).slice(0, 8)
  const cards = [
    { l: O.newLeads, v: leads.filter((l) => l.stage === 'new').length, to: '/admin/clients' },
    { l: O.whatsapp, v: leads.filter((l) => l.source === 'whatsapp').length, to: '/admin/clients?src=whatsapp' },
    { l: O.web, v: leads.filter((l) => l.source === 'web').length, to: '/admin/clients?src=web' },
    { l: O.active, v: properties.filter((p) => p.status === 'active').length, to: '/admin/listings' },
  ]
  return (
    <>
      <PageHeader title={O.title} action={
        <div className="flex gap-2">
          <Link to="/admin/listings/import" className="btn-ghost"><FolderUp size={16} />{O.importPackage}</Link>
          <Link to="/admin/listings/new" className="btn-primary"><Plus size={16} />{O.addListing}</Link>
        </div>} />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {cards.map((c) => (
          <Link key={c.l} to={c.to} className="card p-5 transition hover:shadow-lift">
            <p className="text-xs font-bold uppercase tracking-wide text-ink-mute">{c.l}</p>
            <p className="mt-2 text-3xl font-extrabold tabular-nums">{c.v}</p>
          </Link>
        ))}
      </div>
      <section className="card mt-6 p-5">
        <h2 className="flex items-center gap-2 font-extrabold"><Flame size={18} className="text-rose-500" />{O.hot}</h2>
        {hot.length === 0 ? <p className="mt-3 text-sm text-ink-soft">{O.none}</p> : (
          <ul className="mt-3 divide-y divide-line">
            {hot.map((l) => (
              <li key={l.id} className="flex items-center gap-3 py-3">
                <Link to={`/admin/clients?open=${l.id}`} className="min-w-0 flex-1">
                  <p className="truncate font-semibold">{l.name}</p>
                  <p className="truncate text-sm text-ink-soft">{[l.interest && (L.interest[l.interest] ?? l.interest), l.areas, l.budget, l.timeline].filter(Boolean).join(' · ')}</p>
                </Link>
                <span className="hidden text-xs text-ink-mute sm:block">{timeAgo(l.updatedAt, lang)}</span>
                {l.phone && <a href={`https://wa.me/${l.phone.replace(/\D/g, '')}`} target="_blank" rel="noreferrer" className="btn-wa btn-sm"><MessageCircle size={14} /></a>}
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  )
}
