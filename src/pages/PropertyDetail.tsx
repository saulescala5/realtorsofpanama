import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Bath, BedDouble, Car, Maximize, MapPin, MessageCircle, Share2, Check, ChevronLeft, ChevronRight } from 'lucide-react'
import { useI18n } from '@/i18n'
import { useStore } from '@/lib/store'
import { money } from '@/lib/format'
import { locationName } from '@/lib/locations'
import { waLink } from '@/lib/whatsapp'
import { PropertyCard, titleOf } from '@/components/PropertyCard'
import { Img, Toast, useToast } from '@/components/ui'

export default function PropertyDetail() {
  const { id } = useParams()
  const { t, lang } = useI18n()
  const store = useStore()
  const nav = useNavigate()
  const toast = useToast()
  const p = store.properties.find((x) => x.id === id && (x.status === 'active' || store.user))
  const [img, setImg] = useState(0)
  const [form, setForm] = useState(false)
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [msg, setMsg] = useState('')
  const [sent, setSent] = useState<'ok' | 'err' | null>(null)

  useEffect(() => { if (id && !store.user) store.viewProperty(id); setImg(0) }, [id]) // eslint-disable-line react-hooks/exhaustive-deps

  if (!store.ready) return <div className="container-x py-24 text-center text-ink-soft">{t.common.loading}</div>
  if (!p) return (
    <div className="container-x py-24 text-center">
      <p className="text-lg font-semibold">{t.property.notFound}</p>
      <Link to="/properties" className="btn-primary mt-6">{t.property.backToSearch}</Link>
    </div>
  )

  const title = titleOf(p, lang)
  const description = (lang === 'es' && p.descriptionEs) || p.description
  const url = `${location.origin}/property/${p.id}`
  const ref = p.id.slice(0, 6).toUpperCase()
  const wa = waLink(`${t.property.waText(title, url)} (${t.property.ref} ${ref})`)
  const n = p.images.length
  const similar = store.publicProperties.filter((x) => x.id !== p.id && x.operation === p.operation)
    .sort((a, b) => Number(b.location === p.location) - Number(a.location === p.location)).slice(0, 4)

  const facts = [
    p.beds > 0 && { icon: BedDouble, v: p.beds, l: t.common.beds },
    p.baths > 0 && { icon: Bath, v: p.baths, l: t.common.baths },
    p.area > 0 && { icon: Maximize, v: p.area.toLocaleString(), l: t.common.area },
    p.parking > 0 && { icon: Car, v: p.parking, l: t.common.parking },
  ].filter(Boolean) as { icon: typeof Bath; v: string | number; l: string }[]

  const details = [
    p.furnishing && [t.property.furnishing, t.furnishing[p.furnishing]],
    p.hoa && [t.property.hoa, money(p.hoa, lang)],
    p.deposit && [t.property.deposit, money(p.deposit, lang)],
    p.petPolicy && [t.property.pets, p.petPolicy],
    p.availableDate && [t.property.available, p.availableDate],
  ].filter(Boolean) as [string, string][]

  const share = async () => {
    try { if (navigator.share) { await navigator.share({ title, url }); return } } catch { return }
    navigator.clipboard?.writeText(url).catch(() => {}); toast.show(t.property.copied)
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !phone.trim()) return
    const ok = await store.addWebLead({ name: name.trim(), phone: phone.trim(), message: msg.trim() || undefined, interest: p.operation === 'rent' ? 'rent' : 'buy', propertyId: p.id })
    setSent(ok ? 'ok' : 'err')
  }

  return (
    <div className="container-x py-6 lg:py-8">
      <button onClick={() => nav(-1)} className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-ink-soft hover:text-ink"><ArrowLeft size={16} />{t.common.back}</button>

      {/* gallery */}
      <div className="relative overflow-hidden rounded-[28px] bg-canvas">
        <Img src={p.images[img]} alt={title} className="aspect-[4/3] w-full sm:aspect-[16/8]" />
        {n > 1 && <>
          <button onClick={() => setImg((img - 1 + n) % n)} className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 shadow" aria-label="Previous"><ChevronLeft size={20} /></button>
          <button onClick={() => setImg((img + 1) % n)} className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 shadow" aria-label="Next"><ChevronRight size={20} /></button>
          <span className="chip absolute bottom-3 right-3 bg-ink/75 text-white">{img + 1} / {n}</span>
        </>}
      </div>
      {n > 1 && (
        <div className="no-scrollbar mt-3 flex gap-2 overflow-x-auto">
          {p.images.map((src, i) => (
            <button key={src + i} onClick={() => setImg(i)} className={`h-16 w-24 shrink-0 overflow-hidden rounded-xl ring-2 ${i === img ? 'ring-brand-500' : 'ring-transparent opacity-80'}`}>
              <Img src={src} alt="" className="h-full w-full" />
            </button>
          ))}
        </div>
      )}

      <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_380px]">
        <div>
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="chip bg-brand-50 text-brand-700">{p.operation === 'sale' ? t.common.sale : t.common.rent}</span>
                <span className="chip bg-canvas text-ink-soft">{t.types[p.type]}</span>
                <span className="chip bg-canvas text-ink-mute">{t.property.ref} {ref}</span>
              </div>
              <h1 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">{title}</h1>
              <p className="mt-2 flex items-center gap-1.5 text-ink-soft"><MapPin size={16} />{[p.address, locationName(p.location), p.city].filter(Boolean).join(', ')}</p>
            </div>
            <button onClick={share} className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-ink-soft ring-1 ring-line hover:bg-canvas hover:text-ink" aria-label={t.property.share} title={t.property.share}><Share2 size={17} /></button>
          </div>
          <p className="mt-5 text-3xl font-extrabold text-brand-600">{money(p.price, lang)}{p.operation === 'rent' && <span className="text-base font-semibold text-ink-soft">{t.common.perMonth}</span>}</p>

          {facts.length > 0 && <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {facts.map(({ icon: Icon, v, l }) => (
              <div key={l} className="rounded-2xl bg-canvas p-4">
                <Icon size={20} className="text-brand-500" />
                <p className="mt-2 text-xl font-extrabold">{v}</p>
                <p className="text-xs font-semibold uppercase tracking-wide text-ink-mute">{l}</p>
              </div>
            ))}
          </div>}

          {p.videoUrl && <video src={p.videoUrl} poster={p.videoPosterUrl} controls playsInline className="mt-8 max-h-[560px] w-full rounded-3xl bg-ink" />}

          {description && <>
            <h2 className="mt-10 text-xl font-extrabold">{t.property.about}</h2>
            <p className="mt-3 max-w-2xl whitespace-pre-line leading-relaxed text-ink-soft">{description}</p>
          </>}

          {details.length > 0 && <>
            <h2 className="mt-10 text-xl font-extrabold">{t.property.details}</h2>
            <dl className="mt-4 grid max-w-xl grid-cols-2 gap-x-6 gap-y-3 text-sm">
              {details.map(([k, v]) => <div key={k}><dt className="text-ink-mute">{k}</dt><dd className="font-semibold">{v}</dd></div>)}
            </dl>
          </>}

          {(p.amenities.length > 0 || p.features.length > 0) && <>
            <h2 className="mt-10 text-xl font-extrabold">{t.property.amenities}</h2>
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {[...p.amenities.map((a) => t.amenities[a] ?? a), ...p.features].map((a) => (
                <div key={a} className="flex items-center gap-2.5 text-sm font-medium">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600"><Check size={14} strokeWidth={3} /></span>{a}
                </div>
              ))}
            </div>
          </>}

          {p.latitude && p.longitude && <>
            <h2 className="mt-10 text-xl font-extrabold">{t.property.location}</h2>
            <iframe title="map" loading="lazy" className="mt-4 h-72 w-full rounded-3xl ring-1 ring-line"
              src={`https://www.openstreetmap.org/export/embed.html?bbox=${p.longitude - 0.008},${p.latitude - 0.005},${p.longitude + 0.008},${p.latitude + 0.005}&layer=mapnik&marker=${p.latitude},${p.longitude}`} />
          </>}
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="card p-6">
            <p className="text-lg font-extrabold">{t.property.contactTitle}</p>
            <p className="mt-1 text-sm text-ink-soft">{t.property.contactSub}</p>
            <a href={wa} target="_blank" rel="noreferrer" className="btn-wa mt-5 w-full"><MessageCircle size={18} />{t.property.whatsapp}</a>
            {sent === 'ok' ? <p className="mt-4 rounded-xl bg-mint-400/15 px-4 py-3 text-sm font-semibold text-mint-600">{t.property.sent}</p>
              : !form ? <button onClick={() => setForm(true)} className="mt-3 w-full text-center text-sm font-semibold text-ink-soft hover:text-ink">{t.property.or}</button>
              : (
                <form onSubmit={submit} className="mt-4 space-y-3">
                  <input className="input" placeholder={t.property.name} value={name} onChange={(e) => setName(e.target.value)} required maxLength={120} />
                  <input className="input" placeholder={t.property.phone} value={phone} onChange={(e) => setPhone(e.target.value)} required maxLength={40} inputMode="tel" />
                  <textarea className="input h-20 py-3" placeholder={t.property.message} value={msg} onChange={(e) => setMsg(e.target.value)} maxLength={2000} />
                  <button className="btn-dark w-full">{t.property.send}</button>
                  {sent === 'err' && <p className="text-sm text-rose-600">{t.property.error}</p>}
                </form>
              )}
          </div>
        </aside>
      </div>

      {similar.length > 0 && (
        <section className="mt-20">
          <h2 className="text-2xl font-extrabold tracking-tight">{t.property.similar}</h2>
          <div className="mt-6 grid gap-x-5 gap-y-9 sm:grid-cols-2 lg:grid-cols-4">{similar.map((s) => <PropertyCard key={s.id} p={s} />)}</div>
        </section>
      )}
      <Toast text={toast.text} />
    </div>
  )
}
