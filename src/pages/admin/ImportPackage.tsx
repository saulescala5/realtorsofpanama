import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, FolderUp, Loader2, AlertTriangle } from 'lucide-react'
import { useI18n } from '@/i18n'
import { useStore, type PropertyInput } from '@/lib/store'
import { parseWebsitePackage, type ParsedPackage } from '@/lib/websitePackage'
import { PropertyCard } from '@/components/PropertyCard'
import { toJpeg } from './ListingEditor'

/** Imports the Website\ folder made by the listing workflow (website.json + photos + video). */
export default function ImportPackage() {
  const { t } = useI18n()
  const store = useStore()
  const nav = useNavigate()
  const P = t.admin.pkg
  const input = useRef<HTMLInputElement>(null)
  const [pkg, setPkg] = useState<ParsedPackage | null>(null)
  const [existingId, setExistingId] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [progress, setProgress] = useState<[number, number] | null>(null)

  const choose = async (files: FileList | null) => {
    setError(''); setPkg(null); setExistingId(null)
    if (!files?.length) return
    try {
      const parsed = await parseWebsitePackage([...files])
      if (!parsed) { setError(P.noJson); return }
      setPkg(parsed)
      if (parsed.source.sourceCode) setExistingId(await store.findBySourceCode(parsed.source.sourceCode))
    } catch (e) { setError(String((e as Error).message ?? e)) }
  }

  const run = async (status: 'active' | 'draft') => {
    if (!pkg) return
    const total = pkg.photos.length + (pkg.video ? 1 : 0) + (pkg.poster ? 1 : 0)
    let done = 0
    setProgress([0, total]); setError('')
    try {
      const images: string[] = []
      for (const f of pkg.photos) { images.push(await store.uploadPhoto(await toJpeg(f), 'photo.jpg')); setProgress([++done, total]) }
      const videoUrl = pkg.video ? await store.uploadPhoto(pkg.video, 'video.mp4') : undefined
      if (pkg.video) setProgress([++done, total])
      const videoPosterUrl = pkg.poster ? await store.uploadPhoto(await toJpeg(pkg.poster), 'poster.jpg') : undefined
      const old = existingId ? store.properties.find((p) => p.id === existingId) : undefined
      const input: PropertyInput = { ...pkg.listing, images, status, featured: old?.featured ?? false, ...(videoUrl && { videoUrl, videoPosterUrl }), id: existingId ?? undefined }
      const saved = await store.saveProperty(input)
      await store.saveSource({ ...pkg.source, propertyId: saved.id })
      nav('/admin/listings')
    } catch (e) { setError(String((e as Error).message ?? e)); setProgress(null) }
  }

  const preview = pkg && { ...pkg.listing, images: pkg.previews, id: 'preview', views: 0, createdAt: '', updatedAt: '', status: 'draft' as const, featured: false }

  return (
    <>
      <button onClick={() => nav(-1)} className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-ink-soft hover:text-ink"><ArrowLeft size={16} />{t.common.back}</button>
      <h1 className="text-2xl font-extrabold tracking-tight sm:text-[28px]">{P.title}</h1>
      <p className="mt-1 max-w-2xl text-sm text-ink-soft">{P.sub}</p>
      {error && <p className="mt-4 flex items-center gap-2 rounded-xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-600"><AlertTriangle size={16} />{error}</p>}

      {/* @ts-expect-error non-standard folder picker attributes */}
      <input ref={input} type="file" hidden multiple webkitdirectory="" directory="" onChange={(e) => choose(e.target.files)} />
      <button onClick={() => input.current?.click()} className="btn-primary mt-6"><FolderUp size={17} />{P.choose}</button>

      {pkg && preview && (
        <div className="mt-8 grid gap-6 lg:grid-cols-[320px_1fr]">
          <div className="card p-4"><PropertyCard p={preview} /></div>
          <div className="card p-6">
            <h2 className="font-extrabold">{P.ready}</h2>
            {existingId && <p className="mt-2 rounded-xl bg-brand-50 px-3 py-2 text-sm font-semibold text-brand-700">{P.existing}</p>}
            <dl className="mt-4 grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
              {pkg.summary.map(([k, v]) => <div key={k}><dt className="text-ink-mute">{k}</dt><dd className="truncate font-semibold">{v}</dd></div>)}
              <div><dt className="text-ink-mute">{P.photos}</dt><dd className="font-semibold">{pkg.photos.length}{pkg.video ? ` + ${P.video}` : ''}</dd></div>
            </dl>
            <div className="mt-6 flex flex-wrap gap-2">
              <button disabled={!!progress || !pkg.photos.length} onClick={() => run('active')} className="btn-primary">
                {progress ? <><Loader2 size={16} className="animate-spin" />{P.uploading(progress[0], progress[1])}</> : existingId ? P.update : P.publish}
              </button>
              <button disabled={!!progress} onClick={() => run('draft')} className="btn-ghost">{P.draft}</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
