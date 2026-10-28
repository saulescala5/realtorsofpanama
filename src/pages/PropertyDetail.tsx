import { lazy, Suspense, useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, MapPin, Share2, Check, ChevronLeft, ChevronRight, Heart, X, Images, Play, Box, Clock, CalendarCheck, ArrowUpRight } from 'lucide-react'
import { useI18n } from '@/i18n'
import { useStore } from '@/lib/store'
import { useSaved } from '@/lib/saved'
import { money } from '@/lib/format'
import { locationName } from '@/lib/locations'
import { waLink } from '@/lib/whatsapp'
import { PropertyCard, Specs, titleOf } from '@/components/PropertyCard'
import { Img, Toast, useToast } from '@/components/ui'
import { WhatsAppIcon, Spot } from '@/components/icons'
import { hood, tr } from '@/lib/neighborhoods'
import { MARKET, range } from '@/lib/market'
import { coordsOf, shortPrice } from '@/lib/geo'
import { useSeo, SITE_URL } from '@/lib/seo'

const MapView = lazy(() => import('@/components/MapView'))

const C = {
  en: {
    all: (n: number) => `See all ${n} photos`, photos: 'Photos', video: 'Video', tour: '3D tour', save: 'Save', saved: 'Saved',
    overview: 'Overview', details: 'Details', amenities: 'Amenities', location: 'Location', hood: 'Neighborhood',
    type: 'Type', op: 'Operation', price: 'Price', perM2: 'Price per m²', area: 'Area', beds: 'Bedrooms', baths: 'Bathrooms', parking: 'Parking', ref: 'Reference',
    leave: 'Leave your details', visit: 'Book a visit', fast: 'Replies in minutes', confirm: 'Availability confirmed before your visit',
    visitText: (title: string, url: string) => `Hi! I'd like to visit "${title}" ${url}. When could I see it?`,
    formTitle: 'We’ll contact you', formSub: 'Leave your details and we’ll write to you on WhatsApp about this home.',
    typical: 'Typical 2BR here', m2here: 'Typical price / m²', commute: 'To Calle 50', walk: 'Walkability', walkL: ['Car first', 'Mixed', 'Very walkable'], min: 'min',
    around: 'Around here', guide: 'Read the neighborhood guide', thisHome: 'This home', mo: '/mo', now: 'Now',
  },
  es: {
    all: (n: number) => `Ver las ${n} fotos`, photos: 'Fotos', video: 'Video', tour: 'Tour 3D', save: 'Guardar', saved: 'Guardada',
    overview: 'Resumen', details: 'Detalles', amenities: 'Amenidades', location: 'Ubicación', hood: 'La zona',
    type: 'Tipo', op: 'Operación', price: 'Precio', perM2: 'Precio por m²', area: 'Área', beds: 'Recámaras', baths: 'Baños', parking: 'Estacionamientos', ref: 'Referencia',
    leave: 'Déjanos tus datos', visit: 'Agendar visita', fast: 'Respuesta en minutos', confirm: 'Disponibilidad confirmada antes de tu visita',
    visitText: (title: string, url: string) => `¡Hola! Quisiera visitar "${title}" ${url}. ¿Cuándo podría verla?`,
    formTitle: 'Te contactamos', formSub: 'Déjanos tus datos y te escribimos por WhatsApp sobre esta propiedad.',
    typical: '2 rec. típico aquí', m2here: 'Precio típico / m²', commute: 'A Calle 50', walk: 'Caminabilidad', walkL: ['Más en carro', 'Mixta', 'Muy caminable'], min: 'min',
    around: 'Alrededor', guide: 'Leer la guía de la zona', thisHome: 'Esta propiedad', mo: '/mes', now: 'Inmediata',
  },
}

type Media = 'photos' | 'video' | 'tour'

function Modal({ onClose, children, wide = false, dark = false }: { onClose: () => void; children: React.ReactNode; wide?: boolean; dark?: boolean }) {
  useEffect(() => {
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', esc); document.body.style.overflow = 'hidden'
    return () => { document.removeEventListener('keydown', esc); document.body.style.overflow = '' }
  }, [onClose])
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center" role="dialog" aria-modal="true">
      <div className={`absolute inset-0 animate-[fadein_.2s_both] ${dark ? 'bg-black/90' : 'bg-black/40 backdrop-blur-sm'}`} onClick={onClose} />
      <div className={`relative w-full animate-rise ${wide ? 'h-full max-w-none' : 'max-w-[480px] rounded-t-[28px] bg-white p-6 sm:rounded-[28px] sm:p-8'}`}>
        <button onClick={onClose} aria-label="Close" className={`absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full ${dark ? 'bg-white/10 text-white hover:bg-white/20' : 'hover:bg-black/5'}`}><X size={20} /></button>
        {children}
      </div>
    </div>
  )
}

function Section({ id: sid, title: st, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={sid} className="grid scroll-mt-40 gap-4 border-t border-black/10 py-10 md:grid-cols-[200px_1fr] md:gap-10">
      <h2 className="font-display text-[26px] font-semibold leading-none">{st}</h2><div className="min-w-0">{children}</div>
    </section>
  )
}

export default function PropertyDetail() {
  const { id } = useParams()
  const { t, lang } = useI18n()
  const L = C[lang]
  const store = useStore()
  const saved = useSaved()
  const nav = useNavigate()
  const toast = useToast()
  const p = store.properties.find((x) => x.id === id && (x.status === 'active' || store.user))
  const [img, setImg] = useState(0)
  const [viewer, setViewer] = useState<Media | null>(null)
  const [form, setForm] = useState(false)
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [msg, setMsg] = useState('')
  const [sent, setSent] = useState<'ok' | 'err' | null>(null)

  useEffect(() => { if (id && !store.user) store.viewProperty(id); setImg(0) }, [id]) // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (viewer !== 'photos' || !p) return
    const k = (e: KeyboardEvent) => { if (e.key === 'ArrowRight') setImg((i) => (i + 1) % p.images.length); if (e.key === 'ArrowLeft') setImg((i) => (i - 1 + p.images.length) % p.images.length) }
    document.addEventListener('keydown', k); return () => document.removeEventListener('keydown', k)
  }, [viewer, p])
  useSeo(p ? {
    title: `${titleOf(p, lang)} · ${locationName(p.location)} · Realtors of Panama`,
    description: ((lang === 'es' && p.descriptionEs) || p.description).slice(0, 160),
    image: p.images[0],
    jsonLd: {
      '@context': 'https://schema.org', '@type': 'RealEstateListing', name: titleOf(p, lang), url: `${SITE_URL}/property/${p.id}`,
      description: (lang === 'es' && p.descriptionEs) || p.description, image: p.images.map((i) => (i.startsWith('http') ? i : SITE_URL + i)), datePosted: p.createdAt,
      offers: { '@type': 'Offer', price: p.price, priceCurrency: 'USD', businessFunction: p.operation === 'rent' ? 'http://purl.org/goodrelations/v1#LeaseOut' : 'http://purl.org/goodrelations/v1#Sell', availability: 'https://schema.org/InStock', seller: { '@type': 'RealEstateAgent', name: 'Realtors of Panama' } },
      about: { '@type': p.type === 'house' ? 'SingleFamilyResidence' : 'Apartment', numberOfRooms: p.beds || undefined, numberOfBathroomsTotal: p.baths || undefined, floorSize: p.area ? { '@type': 'QuantitativeValue', value: p.area, unitCode: 'MTK' } : undefined, address: { '@type': 'PostalAddress', addressLocality: locationName(p.location), addressRegion: p.city, addressCountry: 'PA' } },
    },
  } : { title: 'Realtors of Panama' })

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
  const waVisit = waLink(`${L.visitText(title, url)} (${t.property.ref} ${ref})`)
  const imgs = p.images.length ? p.images : ['']
  const n = Math.max(1, p.images.length)
  const coords = coordsOf(p)
  const area = hood(p.location)
  const m = MARKET[p.location]
  const isSaved = saved.has(p.id)
  const priceTxt = <>{money(p.price, lang)}{p.operation === 'rent' && <span className="ml-0.5 text-[0.55em] font-medium text-ink-soft">{t.common.perMonth}</span>}</>
  const similar = store.publicProperties.filter((x) => x.id !== p.id && x.operation === p.operation)
    .sort((a, b) => Number(b.location === p.location) - Number(a.location === p.location)).slice(0, 3)
  const media: Media[] = ['photos', ...(p.videoUrl ? ['video' as const] : []), ...(p.tourUrl ? ['tour' as const] : [])]

  const facts = [
    [L.type, t.types[p.type]], [L.op, p.operation === 'sale' ? t.common.sale : t.common.rent], [L.price, money(p.price, lang) + (p.operation === 'rent' ? t.common.perMonth : '')],
    p.operation === 'sale' && p.area > 0 && [L.perM2, money(Math.round(p.price / p.area), lang)],
    p.area > 0 && [L.area, `${p.area.toLocaleString('en-US')} m²`], p.beds > 0 && [L.beds, String(p.beds)], p.baths > 0 && [L.baths, String(p.baths)], p.parking > 0 && [L.parking, String(p.parking)],
    p.furnishing && [t.property.furnishing, t.furnishing[p.furnishing]], p.hoa && [t.property.hoa, money(p.hoa, lang)], p.deposit && [t.property.deposit, money(p.deposit, lang)],
    [t.property.available, p.availableDate ? new Date(p.availableDate).toLocaleDateString(lang, { dateStyle: 'medium' }) : L.now], p.petPolicy && [t.property.pets, p.petPolicy], [L.ref, ref],
  ].filter(Boolean) as [string, string][]
  const amen = [...p.amenities.map((a) => t.amenities[a] ?? a), ...p.features]
  const sections = [['overview', L.overview], ['details', L.details], amen.length && ['amenities', L.amenities], coords && ['location', L.location], area && ['hood', L.hood]].filter(Boolean) as [string, string][]

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
  const open = (i: number) => { setImg(i); setViewer('photos') }

  return (
    <div className="container-x pb-28 pt-5 lg:pb-16">
      <div className="mb-4 flex items-center justify-between gap-4">
        <button onClick={() => nav(-1)} className="inline-flex items-center gap-1.5 text-[14px] font-medium text-ink-soft hover:text-ink"><ArrowLeft size={16} />{t.common.back}</button>
        <div className="flex gap-2">
          <button onClick={share} className="btn-ghost btn-sm"><Share2 size={15} /><span className="hidden sm:inline">{t.property.share}</span></button>
          <button onClick={() => saved.toggle(p.id)} aria-pressed={isSaved} className="btn-ghost btn-sm"><Heart size={15} className={isSaved ? 'fill-rose-500 text-rose-500' : ''} /><span className="hidden sm:inline">{isSaved ? L.saved : L.save}</span></button>
        </div>
      </div>

      {/* gallery: main + 3 */}
      <div className={`grid h-[300px] gap-2 sm:h-[460px] lg:h-[540px] ${n > 1 ? 'lg:grid-cols-[2fr_1fr]' : ''}`} style={{ gridTemplateRows: n > 1 ? `repeat(${Math.min(3, n - 1)}, minmax(0, 1fr))` : undefined }}>
        <button onClick={() => open(0)} style={{ gridRow: n > 1 ? `span ${Math.min(3, n - 1)}` : undefined }} className={`group relative overflow-hidden rounded-[28px] bg-paper ${n > 1 ? 'lg:rounded-r-xl' : ''}`}>
          <Img src={imgs[0]} alt={title} className="h-full w-full transition duration-700 group-hover:scale-[1.02]" />
          <span className="absolute bottom-4 left-4 flex gap-2 lg:hidden"><span className="flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-[13px] font-medium shadow"><Images size={14} />{n}</span></span>
        </button>
        {[1, 2, 3].filter((i) => i < n).map((i, k, arr) => (
          <button key={i} onClick={() => open(Math.min(i, n - 1))} className={`group relative hidden overflow-hidden rounded-xl bg-paper lg:block ${k === 0 ? 'rounded-tr-[28px]' : ''} ${k === arr.length - 1 ? 'rounded-br-[28px]' : ''}`}>
            <Img src={imgs[i] ?? imgs[0]} alt="" className="h-full w-full transition duration-700 group-hover:scale-105" />
            {k === arr.length - 1 && <span className="absolute inset-0 flex items-center justify-center bg-black/45 text-[15px] font-semibold text-white transition group-hover:bg-black/55"><Images size={18} className="mr-2" />{L.all(n)}</span>}
          </button>
        ))}
      </div>
      {media.length > 1 && (
        <div className="mt-3 flex gap-2">
          {media.map((md) => <button key={md} onClick={() => setViewer(md)} className="btn-ghost btn-sm">{md === 'photos' ? <Images size={15} /> : md === 'video' ? <Play size={15} /> : <Box size={15} />}{L[md]}</button>)}
        </div>
      )}

      <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_380px] lg:gap-14">
        <div className="min-w-0">
          {/* header */}
          <div className="flex flex-wrap items-center gap-2 text-[13px]">
            <span className="rounded-full bg-ink px-3 py-1 font-medium text-white">{p.operation === 'sale' ? t.common.sale : t.common.rent}</span>
            <span className="rounded-full bg-white px-3 py-1 ring-1 ring-black/10">{t.types[p.type]}</span>
            {p.sample && <span className="rounded-full bg-white px-3 py-1 text-ink-soft ring-1 ring-black/10">Sample</span>}
          </div>
          <h1 className="font-display mt-4 text-[38px] font-semibold leading-[1] sm:text-[52px]">{title}</h1>
          <p className="mt-3 flex items-center gap-1.5 text-[16px] text-ink-soft"><MapPin size={17} className="shrink-0 text-ink" />{[locationName(p.location), p.city || 'Panamá'].join(', ')}</p>
          <p className="mt-5 text-[34px] font-semibold tracking-tight lg:hidden">{priceTxt}</p>
          <div className="mt-6"><Specs p={p} size="lg" /></div>

          {/* section nav */}
          <nav className="no-scrollbar sticky top-20 z-20 -mx-5 mt-10 flex gap-1 overflow-x-auto bg-paper/90 px-5 py-3 backdrop-blur sm:mx-0 sm:px-0">
            {sections.map(([sid, l]) => <a key={sid} href={`#${sid}`} className="shrink-0 rounded-full px-4 py-2 text-[14px] font-medium text-ink-soft transition hover:bg-white hover:text-ink">{l}</a>)}
          </nav>

          <Section id="overview" title={L.overview}>
            {p.videoUrl && <video src={p.videoUrl} poster={p.videoPosterUrl || imgs[0]} controls playsInline className="mb-6 max-h-[520px] w-full rounded-[22px] bg-ink" />}
            <p className="max-w-[68ch] whitespace-pre-line text-[16px] leading-relaxed text-ink-soft">{description}</p>
          </Section>

          <Section id="details" title={L.details}>
            <dl className="grid grid-cols-2 overflow-hidden rounded-[22px] bg-white ring-1 ring-black/5 sm:grid-cols-3">
              {facts.map(([k, v]) => <div key={k} className="border-b border-r border-black/5 px-4 py-3.5"><dt className="text-[12.5px] text-ink-soft">{k}</dt><dd className="mt-0.5 text-[15px] font-semibold">{v}</dd></div>)}
            </dl>
          </Section>

          {amen.length > 0 && (
            <Section id="amenities" title={L.amenities}>
              <ul className="grid gap-x-6 gap-y-3 sm:grid-cols-2 xl:grid-cols-3">
                {amen.map((a) => <li key={a} className="flex items-center gap-3 text-[15px]"><span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-paper"><Check size={14} strokeWidth={2.5} /></span>{a}</li>)}
              </ul>
            </Section>
          )}

          {coords && (
            <Section id="location" title={L.location}>
              <div className="h-[340px] overflow-hidden rounded-[22px] ring-1 ring-black/5">
                <Suspense fallback={<div className="h-full bg-canvas" />}><MapView points={[{ id: p.id, ...coords, label: shortPrice(p) }]} /></Suspense>
              </div>
              <p className="mt-3 flex items-center gap-1.5 text-[14px] text-ink-soft"><MapPin size={15} />{locationName(p.location)}, {p.city || 'Panamá'}</p>
            </Section>
          )}

          {area && (
            <Section id="hood" title={L.hood}>
              <div className="overflow-hidden rounded-[22px] bg-white ring-1 ring-black/5">
                <div className="relative h-52"><Img src={`/hoods/hood-${area.slug}.jpg`} alt={area.name} className="h-full w-full" /><div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-4 left-5 text-white"><p className="font-display text-[34px] font-semibold leading-none">{area.name}</p><p className="mt-1 text-[14px] text-white/80">{tr(area.tagline, lang)}</p></div></div>
                <div className="p-5 sm:p-6">
                  {m && (
                    <dl className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                      {[[L.typical, `${range(m.rent2br)}${L.mo}`], [L.m2here, range(m.saleM2)], [L.commute, `${m.toCalle50} ${L.min}`], [L.walk, L.walkL[m.walk - 1]]].map(([k, v]) => (
                        <div key={k} className="rounded-2xl bg-paper px-3 py-2.5"><dt className="text-[12px] text-ink-soft">{k}</dt><dd className="text-[14.5px] font-semibold">{v}</dd></div>
                      ))}
                    </dl>
                  )}
                  {area.about && <p className="mt-5 max-w-[66ch] text-[15px] leading-relaxed text-ink-soft">{tr(area.about, lang)}</p>}
                  {m && (
                    <>
                      <p className="mt-6 text-[14px] font-semibold">{L.around}</p>
                      <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                        {m.spots.map((sp) => <li key={sp.name} className="flex items-center gap-3 rounded-2xl bg-paper p-3"><Spot name={sp.icon} size={36} /><div><p className="text-[14px] font-semibold">{sp.name}</p><p className="text-[12.5px] text-ink-soft">{sp.note[lang]}</p></div></li>)}
                      </ul>
                    </>
                  )}
                  <Link to={`/neighborhoods/${area.slug}`} className="btn-ghost mt-6">{L.guide}<ArrowUpRight size={16} /></Link>
                </div>
              </div>
            </Section>
          )}
        </div>

        {/* contact */}
        <aside className="hidden lg:block">
          <div className="sticky top-24 space-y-3">
            <div className="rounded-[28px] bg-white p-6 shadow-[0_30px_60px_-30px_rgba(0,0,0,.25)] ring-1 ring-black/5">
              <p className="text-[36px] font-semibold leading-none tracking-tight">{priceTxt}</p>
              {m && p.operation === 'rent' && p.beds === 2 && <p className="mt-2 text-[13px] text-ink-soft">{L.typical}: {range(m.rent2br)}</p>}
              {m && p.operation === 'sale' && p.area > 0 && <p className="mt-2 text-[13px] text-ink-soft">{money(Math.round(p.price / p.area), lang)}/m² · {L.m2here.toLowerCase()} {range(m.saleM2)}</p>}
              <p className="mt-4 text-[15px] font-medium">{t.property.contactTitle}</p>
              <p className="mt-1 text-[14px] text-ink-soft">{t.property.contactSub}</p>
              <a href={wa} target="_blank" rel="noreferrer" className="btn-wa btn-lg mt-5 w-full"><WhatsAppIcon size={18} />{t.property.whatsapp}</a>
              <div className="mt-2 grid grid-cols-2 gap-2">
                <a href={waVisit} target="_blank" rel="noreferrer" className="btn-ghost h-12 px-3 text-[14px]"><CalendarCheck size={16} />{L.visit}</a>
                <button onClick={() => { setForm(true); setSent(null) }} className="btn-ghost h-12 px-3 text-[14px]">{L.leave}</button>
              </div>
              <ul className="mt-5 space-y-2 border-t border-black/5 pt-4 text-[13px] text-ink-soft">
                <li className="flex items-center gap-2"><Clock size={14} />{L.fast}</li>
                <li className="flex items-center gap-2"><Check size={14} />{L.confirm}</li>
              </ul>
            </div>
            <p className="px-2 text-[12px] text-ink-mute">{t.property.ref} {ref}</p>
          </div>
        </aside>
      </div>

      {similar.length > 0 && (
        <section className="mt-16 border-t border-black/10 pt-12">
          <h2 className="h-sub">{t.property.similar}</h2>
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{similar.map((s) => <PropertyCard key={s.id} p={s} />)}</div>
        </section>
      )}

      {/* mobile bar */}
      <div className="fixed inset-x-0 bottom-0 z-40 flex items-center gap-3 border-t border-black/10 bg-white/95 px-4 py-3 backdrop-blur lg:hidden">
        <div className="min-w-0 flex-1"><p className="text-[20px] font-semibold leading-none">{priceTxt}</p><button onClick={() => { setForm(true); setSent(null) }} className="mt-1 text-[13px] text-ink-soft underline underline-offset-2">{L.leave}</button></div>
        <a href={wa} target="_blank" rel="noreferrer" className="btn-wa h-12 px-5"><WhatsAppIcon size={18} />WhatsApp</a>
      </div>

      {form && (
        <Modal onClose={() => setForm(false)}>
          <p className="font-display text-[30px] font-semibold leading-none">{L.formTitle}</p>
          <p className="mt-2 pr-8 text-[14px] text-ink-soft">{L.formSub}</p>
          <div className="mt-4 flex items-center gap-3 rounded-2xl bg-paper p-2"><Img src={imgs[0]} alt="" className="h-14 w-16 rounded-xl" /><div className="min-w-0"><p className="truncate text-[14px] font-semibold">{title}</p><p className="text-[13px] text-ink-soft">{priceTxt}</p></div></div>
          {sent === 'ok' ? <p className="mt-6 rounded-2xl bg-mint-500/10 px-4 py-5 text-center text-[15px] font-medium text-mint-600">{t.property.sent}</p> : (
            <form onSubmit={submit} className="mt-5 space-y-3">
              <input className="input" placeholder={t.property.name} aria-label={t.property.name} value={name} onChange={(e) => setName(e.target.value)} required maxLength={120} autoFocus />
              <input className="input" placeholder={t.property.phone} aria-label={t.property.phone} value={phone} onChange={(e) => setPhone(e.target.value)} required maxLength={40} inputMode="tel" />
              <textarea className="input h-24 py-3" placeholder={t.property.message} aria-label={t.property.message} value={msg} onChange={(e) => setMsg(e.target.value)} maxLength={2000} />
              <button className="btn-primary btn-lg w-full">{t.property.send}</button>
              {sent === 'err' && <p className="text-sm text-rose-600">{t.property.error}</p>}
            </form>
          )}
        </Modal>
      )}

      {viewer && (
        <Modal onClose={() => setViewer(null)} wide dark>
          <div className="flex h-full flex-col">
            <div className="flex items-center justify-center gap-1 p-4 pr-16">
              {media.map((md) => <button key={md} onClick={() => setViewer(md)} className={`h-9 rounded-full px-4 text-[14px] font-medium ${viewer === md ? 'bg-white text-ink' : 'text-white/70 hover:text-white'}`}>{L[md]}</button>)}
            </div>
            <div className="relative flex min-h-0 flex-1 items-center justify-center px-4 sm:px-16">
              {viewer === 'photos' && <>
                <img src={imgs[img]} alt="" className="max-h-full max-w-full rounded-xl object-contain" />
                {n > 1 && <>
                  <button onClick={() => setImg((img - 1 + n) % n)} className="absolute left-3 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20" aria-label="Previous"><ChevronLeft size={22} /></button>
                  <button onClick={() => setImg((img + 1) % n)} className="absolute right-3 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20" aria-label="Next"><ChevronRight size={22} /></button>
                </>}
              </>}
              {viewer === 'video' && p.videoUrl && <video src={p.videoUrl} poster={p.videoPosterUrl} controls autoPlay playsInline className="max-h-full max-w-full rounded-xl" />}
              {viewer === 'tour' && p.tourUrl && <iframe src={p.tourUrl} title={L.tour} className="h-full w-full max-w-[1400px] rounded-xl" allow="fullscreen; xr-spatial-tracking" allowFullScreen />}
            </div>
            {viewer === 'photos' && n > 1 && (
              <div className="no-scrollbar flex justify-start gap-2 overflow-x-auto p-4 sm:justify-center">
                {p.images.map((src, i) => <button key={src + i} onClick={() => setImg(i)} className={`h-14 w-20 shrink-0 overflow-hidden rounded-lg ring-2 transition ${i === img ? 'ring-white' : 'opacity-50 ring-transparent hover:opacity-80'}`}><Img src={src} alt="" className="h-full w-full" /></button>)}
              </div>
            )}
            {viewer === 'photos' && <p className="pb-4 text-center text-[13px] text-white/60">{img + 1} / {n}</p>}
          </div>
        </Modal>
      )}
      <Toast text={toast.text} />
    </div>
  )
}
