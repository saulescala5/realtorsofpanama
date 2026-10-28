import { Link } from 'react-router-dom'
import { Plus, FolderUp, Building, Eye, Pencil, Trash2 } from 'lucide-react'
import { useI18n } from '@/i18n'
import { useStore } from '@/lib/store'
import { money } from '@/lib/format'
import { locationName } from '@/lib/locations'
import type { ListingStatus } from '@/lib/types'
import { Empty, Img, PageHeader } from '@/components/ui'

const TONE: Record<ListingStatus, string> = { draft: 'bg-ink/5 text-ink-soft', active: 'bg-mint-400/15 text-mint-600', rented: 'bg-brand-50 text-brand-700', sold: 'bg-brand-50 text-brand-700', archived: 'bg-ink/5 text-ink-mute' }

export default function Listings() {
  const { t, lang } = useI18n()
  const { properties, setStatus, deleteProperty } = useStore()
  const L = t.admin.listings
  const sorted = [...properties].sort((a, b) => Number(b.status === 'active') - Number(a.status === 'active') || b.updatedAt.localeCompare(a.updatedAt))

  return (
    <>
      <PageHeader title={L.title} sub={L.sub} action={
        <div className="flex gap-2">
          <Link to="/admin/listings/import" className="btn-ghost"><FolderUp size={16} />{L.import}</Link>
          <Link to="/admin/listings/new" className="btn-primary"><Plus size={16} />{L.new}</Link>
        </div>} />
      {sorted.length === 0 ? <Empty icon={<Building size={22} />} text={L.empty} action={<Link to="/admin/listings/new" className="btn-primary">{L.new}</Link>} /> : (
        <div className="space-y-3">
          {sorted.map((p) => (
            <div key={p.id} className="card flex flex-col gap-4 p-3 sm:flex-row sm:items-center">
              <Img src={p.images[0]} alt="" className="h-24 w-full shrink-0 rounded-2xl sm:w-36" />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`chip ${TONE[p.status]}`}>{L.status[p.status]}</span>
                  <span className="text-xs font-semibold text-ink-mute">{p.operation === 'sale' ? t.common.sale : t.common.rent} · {t.types[p.type]}</span>
                </div>
                <p className="mt-1 truncate font-bold">{p.title}</p>
                <p className="truncate text-sm text-ink-soft">{money(p.price, lang)}{p.operation === 'rent' ? t.common.perMonth : ''} · {locationName(p.location)} · {p.beds} {t.common.beds}</p>
                <p className="mt-0.5 flex items-center gap-1 text-xs text-ink-mute"><Eye size={12} />{p.views}</p>
              </div>
              <div className="flex flex-wrap gap-1.5 sm:justify-end">
                {p.status === 'active'
                  ? <button className="btn-ghost btn-sm" onClick={() => setStatus(p.id, p.operation === 'rent' ? 'rented' : 'sold')}>{p.operation === 'rent' ? L.markRented : L.markSold}</button>
                  : <button className="btn-soft btn-sm" onClick={() => setStatus(p.id, 'active')} disabled={!p.images.length}>{L.publish}</button>}
                {p.status === 'active' && <button className="btn-ghost btn-sm" onClick={() => setStatus(p.id, 'draft')}>{L.unpublish}</button>}
                <Link to={`/property/${p.id}`} className="btn-ghost btn-sm" aria-label={t.common.view}><Eye size={14} /></Link>
                <Link to={`/admin/listings/${p.id}`} className="btn-ghost btn-sm" aria-label={t.common.edit}><Pencil size={14} /></Link>
                <button className="btn-ghost btn-sm text-rose-600" aria-label={t.common.delete} onClick={() => { if (confirm(L.confirmDelete)) deleteProperty(p.id) }}><Trash2 size={14} /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  )
}
