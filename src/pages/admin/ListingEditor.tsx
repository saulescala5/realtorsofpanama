import { useEffect, useRef, useState, type ReactNode } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, ArrowUp, ArrowDown, Trash2, ImagePlus, Loader2, ChevronDown, Wand2, Lock } from 'lucide-react'
import { useI18n } from '@/i18n'
import { useStore, type PropertyInput } from '@/lib/store'
import type { Furnishing, ListingStatus, PropertySource, PropertyType } from '@/lib/types'
import { LOCATIONS, slugify } from '@/lib/locations'
import { PropertyCard } from '@/components/PropertyCard'
import { ImportPanel } from '@/components/ImportPanel'
import { Toggle } from '@/components/ui'
import type { ImportedListing } from '@/lib/importer'

const TYPES: PropertyType[] = ['apartment', 'penthouse', 'studio', 'house', 'land', 'commercial', 'office']
const AMENITIES = ['pool', 'gym', 'security', 'oceanView', 'elevator', 'terrace', 'ac', 'petFriendly', 'storage', 'garden', 'socialArea', 'playground', 'generator']

const blank: PropertyInput = {
  title: '', description: '', operation: 'rent', type: 'apartment', price: 0, beds: 2, baths: 2, area: 0, parking: 1,
  location: 'punta-pacifica', city: 'Panama City', features: [], amenities: [], images: [], status: 'draft', featured: false,
}

function Section({ title, children, aside }: { title: string; children: ReactNode; aside?: ReactNode }) {
  return (
    <section className="card p-6">
      <div className="mb-5 flex items-center justify-between gap-3"><h2 className="font-extrabold">{title}</h2>{aside}</div>
      {children}
    </section>
  )
}

function Fold({ title, icon, children, open: start = false }: { title: string; icon?: ReactNode; children: ReactNode; open?: boolean }) {
  const [open, setOpen] = useState(start)
  return (
    <section className="card">
      <button type="button" onClick={() => setOpen(!open)} className="flex w-full items-center justify-between gap-3 p-6 text-left">
        <span className="flex items-center gap-2 font-extrabold">{icon}{title}</span>
        <ChevronDown size={18} className={`text-ink-mute transition ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && <div className="px-6 pb-6">{children}</div>}
    </section>
  )
}

export default function ListingEditor() {
  const { id } = useParams()
  const { t } = useI18n()
  const store = useStore()
  const nav = useNavigate()
  const E = t.admin.editor
  const existing = store.properties.find((p) => p.id === id)
  const pre = (useLocation().state ?? {}) as { prefill?: Partial<PropertyInput>; source?: Partial<PropertySource> }
  const [d, setD] = useState<PropertyInput>(existing ?? { ...blank, ...pre.prefill })
  const [features, setFeatures] = useState((existing?.features ?? []).join('\n'))
  const [src, setSrc] = useState<PropertySource>({ propertyId: id ?? '', ...(!id ? pre.source : {}) })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [uploading, setUploading] = useState(0)
  const [showImport, setShowImport] = useState(false)
  const file = useRef<HTMLInputElement>(null)

  useEffect(() => { if (id) store.getSource(id).then((s) => s && setSrc(s)) }, [id]) // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (existing && !d.title) setD(existing) }, [existing]) // eslint-disable-line react-hooks/exhaustive-deps

  const set = <K extends keyof PropertyInput>(k: K, v: PropertyInput[K]) => setD((x) => ({ ...x, [k]: v }))
  const num = (k: 'price' | 'beds' | 'baths' | 'area' | 'parking' | 'hoa' | 'deposit') => ({
    type: 'number', min: 0, step: 'any', className: 'input', value: d[k] ?? '',
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => set(k, e.target.value === '' ? (k === 'hoa' || k === 'deposit' ? undefined : 0) : Number(e.target.value)),
  })

  const applyImport = ({ images, neighborhood, ...f }: ImportedListing, source: string) => {
    setD((x) => ({
      ...x,
      ...(f.title && { title: f.title }), ...(f.description && { description: f.description }), ...(f.operation && { operation: f.operation }),
      ...(f.type && { type: f.type }), ...(f.price && { price: f.price }), ...(f.city && { city: f.city }),
      ...(f.beds !== undefined && { beds: f.beds }), ...(f.baths !== undefined && { baths: f.baths }), ...(f.area && { area: f.area }), ...(f.parking !== undefined && { parking: f.parking }),
      ...(neighborhood && { location: LOCATIONS.find((l) => l.name === neighborhood)?.slug ?? slugify(neighborhood) }),
      ...(images?.length && { images }),
    }))
    if (source) setSrc((s) => ({ ...s, sourceLink: source }))
    setShowImport(false)
  }

  const upload = async (files: FileList | null) => {
    if (!files?.length) return
    const list = [...files]
    setUploading(list.length)
    const urls: string[] = []
    for (const f of list) {
      try { urls.push(await store.uploadPhoto(await toJpeg(f), f.name.replace(/\.[^.]+$/, '') + '.jpg')) } catch (e) { setError(String((e as Error).message ?? e)) }
      setUploading((n) => n - 1)
    }
    setD((x) => ({ ...x, images: [...x.images, ...urls] }))
    if (file.current) file.current.value = ''
  }
  const move = (i: number, dir: -1 | 1) => setD((x) => { const a = [...x.images]; const j = i + dir; if (j < 0 || j >= a.length) return x; [a[i], a[j]] = [a[j], a[i]]; return { ...x, images: a } })

  const save = async (status: ListingStatus) => {
    if (status === 'active' && (!d.title.trim() || !d.price || !d.images.length)) { setError(E.required); window.scrollTo({ top: 0, behavior: 'smooth' }); return }
    if (!d.title.trim()) { setError(E.required); return }
    setBusy(true); setError('')
    try {
      const saved = await store.saveProperty({ ...d, id: existing?.id, status, features: features.split('\n').map((s) => s.trim()).filter(Boolean) })
      if (src.sourceLink || src.contactName || src.contactPhone || src.commissionNote || src.notes || src.sourceCode) await store.saveSource({ ...src, propertyId: saved.id })
      nav('/admin/listings')
    } catch (e) { setError(String((e as Error).message ?? e)) } finally { setBusy(false) }
  }

  const preview = { ...d, id: existing?.id ?? 'preview', views: 0, createdAt: '', updatedAt: '' }

  return (
    <>
      <button onClick={() => nav(-1)} className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-ink-soft hover:text-ink"><ArrowLeft size={16} />{t.common.back}</button>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h1 className="text-2xl font-extrabold tracking-tight sm:text-[28px]">{existing ? E.editTitle : E.newTitle}</h1>
        {existing && <button type="button" onClick={() => nav(`/admin/contracts?property=${existing.id}`)} className="btn-ghost btn-sm">{t.nav.login === 'Entrar' ? 'Crear contrato' : 'Create contract'}</button>}
        {!existing && <button type="button" onClick={() => setShowImport(!showImport)} className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 hover:text-brand-700"><Wand2 size={15} />{E.importFromLink}</button>}
      </div>
      {!existing && src.sourceCode?.startsWith('bolsa:') && <p className="mt-4 rounded-xl bg-black/5 px-4 py-3 text-sm">{t.nav.login === 'Entrar' ? 'Rellenada desde la Bolsa. Agrega fotos y descripción; los datos del broker quedan guardados en Fuente (privado).' : 'Filled from the Bolsa. Add photos and a description; the broker details stay in Source (private).'}</p>}
      {error && <p className="mt-4 rounded-xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-600">{error}</p>}

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          {showImport && <ImportPanel onImport={applyImport} />}

          <Section title={E.basics}>
            <div className="grid gap-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="label">{E.operation}</label>
                  <div className="flex gap-1 rounded-xl bg-canvas p-1 ring-1 ring-line">
                    {(['rent', 'sale'] as const).map((o) => (
                      <button key={o} type="button" onClick={() => set('operation', o)} className={`h-9 flex-1 rounded-lg text-sm font-semibold ${d.operation === o ? 'bg-white shadow-sm' : 'text-ink-soft'}`}>{o === 'sale' ? t.common.sale : t.common.rent}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="label">{E.type}</label>
                  <select className="input" value={d.type} onChange={(e) => set('type', e.target.value as PropertyType)}>{TYPES.map((x) => <option key={x} value={x}>{t.types[x]}</option>)}</select>
                </div>
              </div>
              <div><label className="label">{E.title}</label><input className="input" value={d.title} onChange={(e) => set('title', e.target.value)} placeholder="2BR furnished with ocean view in Punta Pacífica" /></div>
              <div><label className="label">{d.operation === 'rent' ? E.priceRent : E.price}</label><input {...num('price')} /></div>
              <div><label className="label">{E.description}</label><textarea className="input h-32 py-3" value={d.description} onChange={(e) => set('description', e.target.value)} /></div>
            </div>
          </Section>

          <Section title={E.photos} aside={<span className="text-xs text-ink-mute">{d.images.length}</span>}>
            <p className="-mt-3 mb-4 text-xs text-ink-mute">{E.photosHint}</p>
            {d.images.length > 0 && (
              <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {d.images.map((u, i) => (
                  <div key={u + i} className={`group relative overflow-hidden rounded-2xl ring-2 ${i === 0 ? 'ring-brand-500' : 'ring-transparent'}`}>
                    <img src={u} alt="" className="aspect-[4/3] w-full object-cover" />
                    <div className="absolute inset-x-1 bottom-1 flex justify-between gap-1">
                      <span className="flex gap-1">
                        <button type="button" onClick={() => move(i, -1)} className="rounded-lg bg-white/90 p-1.5" aria-label="Move up"><ArrowUp size={14} /></button>
                        <button type="button" onClick={() => move(i, 1)} className="rounded-lg bg-white/90 p-1.5" aria-label="Move down"><ArrowDown size={14} /></button>
                      </span>
                      <button type="button" onClick={() => set('images', d.images.filter((_, j) => j !== i))} className="rounded-lg bg-white/90 p-1.5 text-rose-600" aria-label="Remove"><Trash2 size={14} /></button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <input ref={file} type="file" accept="image/*" multiple hidden onChange={(e) => upload(e.target.files)} />
            <button type="button" onClick={() => file.current?.click()} disabled={uploading > 0} className="btn-soft w-full">
              {uploading ? <><Loader2 size={16} className="animate-spin" />{E.uploading} {uploading}</> : <><ImagePlus size={16} />{E.upload}</>}
            </button>
          </Section>

          <Section title={E.location}>
            <div className="grid gap-4 sm:grid-cols-2">
              <div><label className="label">{E.neighborhood}</label>
                <select className="input" value={d.location} onChange={(e) => set('location', e.target.value)}>
                  {!LOCATIONS.some((l) => l.slug === d.location) && <option value={d.location}>{d.location}</option>}
                  {LOCATIONS.map((l) => <option key={l.slug} value={l.slug}>{l.name}</option>)}
                </select></div>
              <div><label className="label">{E.city}</label><input className="input" value={d.city} onChange={(e) => set('city', e.target.value)} /></div>
              <div className="sm:col-span-2"><label className="label">{E.address}</label><input className="input" value={d.address ?? ''} onChange={(e) => set('address', e.target.value)} /></div>
            </div>
          </Section>

          <Section title={E.specs}>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div><label className="label">{E.beds}</label><input {...num('beds')} /></div>
              <div><label className="label">{E.baths}</label><input {...num('baths')} /></div>
              <div><label className="label">{E.area}</label><input {...num('area')} /></div>
              <div><label className="label">{E.parking}</label><input {...num('parking')} /></div>
              <div className="col-span-2"><label className="label">{E.furnishing}</label>
                <select className="input" value={d.furnishing ?? ''} onChange={(e) => set('furnishing', (e.target.value || undefined) as Furnishing | undefined)}>
                  <option value="">—</option>{(['furnished', 'linea_blanca', 'empty'] as const).map((f) => <option key={f} value={f}>{t.furnishing[f]}</option>)}
                </select></div>
              <div><label className="label">{E.hoa}</label><input {...num('hoa')} /></div>
              <div><label className="label">{E.deposit}</label><input {...num('deposit')} /></div>
              <div className="col-span-2 sm:col-span-4"><label className="label">{E.pets}</label><input className="input" value={d.petPolicy ?? ''} onChange={(e) => set('petPolicy', e.target.value)} /></div>
            </div>
          </Section>

          <Section title={E.amenities}>
            <div className="flex flex-wrap gap-2">
              {AMENITIES.map((a) => {
                const on = d.amenities.includes(a)
                return <button key={a} type="button" onClick={() => set('amenities', on ? d.amenities.filter((x) => x !== a) : [...d.amenities, a])}
                  className={`chip h-8 px-3 ring-1 ${on ? 'bg-brand-500 text-white ring-brand-500' : 'text-ink-soft ring-line hover:ring-ink/30'}`}>{t.amenities[a]}</button>
              })}
            </div>
            <label className="label mt-5">{E.features}</label>
            <textarea className="input h-24 py-3" value={features} onChange={(e) => setFeatures(e.target.value)} />
          </Section>

          <Fold title={E.spanish}>
            <div className="grid gap-4">
              <div><label className="label">{E.titleEs}</label><input className="input" value={d.titleEs ?? ''} onChange={(e) => set('titleEs', e.target.value)} /></div>
              <div><label className="label">{E.descriptionEs}</label><textarea className="input h-28 py-3" value={d.descriptionEs ?? ''} onChange={(e) => set('descriptionEs', e.target.value)} /></div>
            </div>
          </Fold>

          <Fold title={E.video}>
            <div className="grid gap-4">
              <div><label className="label">{E.videoUrl}</label><input className="input" value={d.videoUrl ?? ''} onChange={(e) => set('videoUrl', e.target.value)} placeholder="https://…/video.mp4" /></div>
              <div><label className="label">3D tour URL (Matterport, Kuula…)</label><input className="input" value={d.tourUrl ?? ''} onChange={(e) => set('tourUrl', e.target.value)} placeholder="https://my.matterport.com/show/?m=…" /></div>
            </div>
          </Fold>

          <Fold title={E.source} icon={<Lock size={15} className="text-ink-mute" />}>
            <p className="-mt-2 mb-4 text-xs text-ink-mute">{E.sourceHint}</p>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2"><label className="label">{E.sourceLink}</label><input className="input" value={src.sourceLink ?? ''} onChange={(e) => setSrc({ ...src, sourceLink: e.target.value })} /></div>
              <div><label className="label">{E.contactName}</label><input className="input" value={src.contactName ?? ''} onChange={(e) => setSrc({ ...src, contactName: e.target.value })} /></div>
              <div><label className="label">{E.contactPhone}</label><input className="input" value={src.contactPhone ?? ''} onChange={(e) => setSrc({ ...src, contactPhone: e.target.value })} /></div>
              <div className="sm:col-span-2"><label className="label">{E.commission}</label><input className="input" value={src.commissionNote ?? ''} onChange={(e) => setSrc({ ...src, commissionNote: e.target.value })} placeholder="50/50, confirmed on WhatsApp 28/10" /></div>
              <div className="sm:col-span-2"><label className="label">{E.notes}</label><textarea className="input h-20 py-3" value={src.notes ?? ''} onChange={(e) => setSrc({ ...src, notes: e.target.value })} /></div>
            </div>
          </Fold>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-10 lg:self-start">
          <div className="card p-4">
            <p className="mb-3 text-xs font-bold uppercase tracking-wide text-ink-mute">{E.preview}</p>
            <div className="pointer-events-none"><PropertyCard p={preview} /></div>
          </div>
          <div className="card space-y-2 p-4">
            <Toggle checked={d.featured} onChange={(v) => set('featured', v)} label={E.featured} />
            <button disabled={busy || uploading > 0} onClick={() => save('active')} className="btn-primary w-full">{busy ? <Loader2 size={16} className="animate-spin" /> : E.publish}</button>
            <button disabled={busy || uploading > 0} onClick={() => save('draft')} className="btn-ghost w-full">{E.saveDraft}</button>
          </div>
        </aside>
      </div>
    </>
  )
}

/** Re-encode any image as a JPEG (max 1600 px): WhatsApp can't send WebP/HEIC. */
export async function toJpeg(f: Blob): Promise<Blob> {
  try {
    const bmp = await createImageBitmap(f)
    const s = Math.min(1, 1600 / Math.max(bmp.width, bmp.height))
    const c = document.createElement('canvas')
    c.width = Math.round(bmp.width * s); c.height = Math.round(bmp.height * s)
    c.getContext('2d')!.drawImage(bmp, 0, 0, c.width, c.height)
    return await new Promise<Blob>((res, rej) => c.toBlob((b) => (b ? res(b) : rej(new Error('encode'))), 'image/jpeg', 0.85))
  } catch { return f }
}
