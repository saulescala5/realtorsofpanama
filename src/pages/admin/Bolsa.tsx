import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Upload, Lock, Search, ChevronDown, Copy, Building, Send, TrendingDown, X, Loader2, Users, MapPin, Handshake } from 'lucide-react'
import { useI18n } from '@/i18n'
import { useStore } from '@/lib/store'
import { useBolsa, uploadBolsa, importExports, pendingFlyers, readFlyers, photoUrls, photoBlobs, type ImportResult, waNum, brokerLabel, isRent, isSale, bedsTxt, money, toPropertyType, toFurnishing, clientText, type BItem, type BolsaIndex } from '@/lib/bolsa'
import { LOCATIONS, slugify } from '@/lib/locations'
import { WhatsAppIcon } from '@/components/icons'
import type { Lead } from '@/lib/types'

type Tab = 'offers' | 'demands' | 'matches' | 'brokers' | 'zones'
const T = {
  es: {
    title: 'Bolsa de Brokers', priv: 'Privado · solo tú lo ves', update: 'Agregar exportaciones de WhatsApp', updating: 'Guardando…', reading: 'Leyendo…', photos: 'Fotos', copying: 'Copiando fotos…', flyersMsg: (n: number) => `${n} flyers (fotos sin texto) aún no se han leído. Leerlos con IA los convierte en ofertas. Usa tu clave de Anthropic: unos 1,500 tokens por imagen, menos de 1 centavo cada uno, y cada foto se lee una sola vez.`, flyersBtn: (n: number) => `Leer ${n} flyers`, building: 'Procesando…', addedOk: 'Listo:', newGroup: 'grupo nuevo', merged: 'actualizado', hint: 'Exporta cada grupo desde WhatsApp (Más → Exportar chat → Incluir archivos, para traer las fotos) y sube los .zip aquí. Puedes elegir varios a la vez. La primera vez sube todos tus grupos; después, solo la exportación nueva de cada grupo.', updated: 'Actualizada', generated: 'Generada',
    empty: 'Aún no hay datos. Sube las exportaciones .zip de tus grupos de WhatsApp. Se guardan privadas en tu Supabase; ni el sitio ni Sofia las leen.',
    tabs: { offers: 'Ofertas', demands: 'Pedidos', matches: 'Matches', brokers: 'Brokers', zones: 'Zonas' },
    search: 'Buscar edificio, zona, texto…', all: 'Todo', rent: 'Alquiler', sale: 'Venta', zone: 'Zona', type: 'Tipo', any: 'Cualquiera', maxPrice: 'Precio máx.', beds: 'Rec. mín.',
    activeOnly: 'Solo activas', drops: 'Bajaron de precio', results: (n: number) => `${n.toLocaleString()} resultados`, more: 'Ver más',
    seen: 'Visto', times: (n: number) => `${n}× publicado`, createListing: 'Crear propiedad', waBroker: 'WhatsApp broker', toClient: 'Enviar a cliente', copy: 'Copiar texto', copied: 'Copiado',
    budget: 'Presupuesto', matchesFor: 'Ofertas que le sirven', noMatches: 'Sin matches activos.', score: 'Puntaje',
    request: 'Pedido', offer: 'Oferta', bName: 'Broker', company: 'Empresa', offers: 'Ofertas', requests: 'Pedidos', last: 'Última actividad', zones: 'Zonas',
    offRent: 'Ofertas alq.', offSale: 'Ofertas venta', demRent: 'Pedidos alq.', demSale: 'Pedidos venta', medRent: 'Alquiler mediano', medSale: 'Venta mediana', medBudget: 'Presupuesto mediano',
    pickClient: 'Elige el cliente', noClients: 'No hay clientes con WhatsApp todavía.', clientNote: 'Se envía sin datos del broker ni de la fuente.',
    closed: 'Cerrada', inactive: 'Inactiva', drop: 'Bajó', gap: 'diferencia', fileErr: 'No se pudo leer el archivo.',
  },
  en: {
    title: 'Bolsa de Brokers', priv: 'Private · only you can see this', update: 'Add WhatsApp exports', updating: 'Saving…', reading: 'Reading…', photos: 'Photos', copying: 'Copying photos…', flyersMsg: (n: number) => `${n} flyers (photo-only posts) haven't been read yet. Reading them with AI turns them into offers. It uses your Anthropic key: about 1,500 tokens per image, under 1 cent each, and each photo is read only once.`, flyersBtn: (n: number) => `Read ${n} flyers`, building: 'Processing…', addedOk: 'Done:', newGroup: 'new group', merged: 'updated', hint: 'Export each group from WhatsApp (More → Export chat → Include media, to bring the photos) and upload the .zip files here. You can pick several at once. The first time, upload all your groups; after that, only the new export of each group.', updated: 'Updated', generated: 'Generated',
    empty: 'No data yet. Upload the .zip exports of your WhatsApp groups. They are stored privately in your Supabase; neither the site nor Sofia can read them.',
    tabs: { offers: 'Offers', demands: 'Requests', matches: 'Matches', brokers: 'Brokers', zones: 'Zones' },
    search: 'Search building, area, text…', all: 'All', rent: 'Rent', sale: 'Sale', zone: 'Area', type: 'Type', any: 'Any', maxPrice: 'Max price', beds: 'Min beds',
    activeOnly: 'Active only', drops: 'Price drops', results: (n: number) => `${n.toLocaleString()} results`, more: 'Show more',
    seen: 'Seen', times: (n: number) => `posted ${n}×`, createListing: 'Create listing', waBroker: 'WhatsApp broker', toClient: 'Send to client', copy: 'Copy text', copied: 'Copied',
    budget: 'Budget', matchesFor: 'Offers that fit', noMatches: 'No active matches.', score: 'Score',
    request: 'Request', offer: 'Offer', bName: 'Broker', company: 'Company', offers: 'Offers', requests: 'Requests', last: 'Last active', zones: 'Areas',
    offRent: 'Rent offers', offSale: 'Sale offers', demRent: 'Rent requests', demSale: 'Sale requests', medRent: 'Median rent', medSale: 'Median sale', medBudget: 'Median budget',
    pickClient: 'Pick the client', noClients: 'No clients with WhatsApp yet.', clientNote: 'Sent without broker or source details.',
    closed: 'Closed', inactive: 'Inactive', drop: 'Dropped', gap: 'gap', fileErr: 'Could not read that file.',
  },
}

const PAGE = 40
const fmtDate = (d?: string | null) => (d ? new Date(d).toLocaleDateString('es-PA', { day: 'numeric', month: 'short' }) : '—')

function useFilters(items: BItem[]) {
  const [q, setQ] = useState('')
  const [op, setOp] = useState<'' | 'rent' | 'sale'>('')
  const [zone, setZone] = useState('')
  const [type, setType] = useState('')
  const [max, setMax] = useState('')
  const [beds, setBeds] = useState('')
  const [active, setActive] = useState(true)
  const [drops, setDrops] = useState(false)
  const list = useMemo(() => {
    const n = q.trim().toLowerCase()
    return items.filter((i) => (!active || i.active) && (!drops || i.price_drop)
      && (!op || (op === 'rent' ? isRent(i) : isSale(i))) && (!zone || i.zones.includes(zone)) && (!type || i.type === type)
      && (!max || (i.price ?? 0) <= Number(max)) && (!beds || (i.beds_max ?? i.beds_min ?? 0) >= Number(beds))
      && (!n || `${i.title} ${i.building ?? ''} ${i.zones.join(' ')} ${i.text}`.toLowerCase().includes(n)))
      .sort((a, b) => b.last_dt.localeCompare(a.last_dt))
  }, [items, q, op, zone, type, max, beds, active, drops])
  return { list, q, setQ, op, setOp, zone, setZone, type, setType, max, setMax, beds, setBeds, active, setActive, drops, setDrops }
}

function Filters({ f, data, L, offers }: { f: ReturnType<typeof useFilters>; data: BolsaIndex; L: typeof T.es; offers: boolean }) {
  const zones = useMemo(() => [...new Set(data.zones.map((z) => z.zone))].sort(), [data])
  const types = useMemo(() => [...new Set(data.offers.map((o) => o.type).filter(Boolean) as string[])].sort(), [data])
  const sel = 'h-10 rounded-xl bg-white px-3 text-[14px] ring-1 ring-inset ring-black/10 outline-none'
  const seg = (a: boolean) => `h-8 rounded-lg px-3 text-[13px] font-medium ${a ? 'bg-ink text-white' : 'text-ink-soft'}`
  return (
    <div className="flex flex-wrap items-center gap-2">
      <label className="relative min-w-[220px] flex-1"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-mute" />
        <input className={`${sel} w-full pl-9`} placeholder={L.search} value={f.q} onChange={(e) => f.setQ(e.target.value)} /></label>
      <div className="flex rounded-xl bg-white p-1 ring-1 ring-inset ring-black/10">
        {([['', L.all], ['rent', L.rent], ['sale', L.sale]] as const).map(([v, l]) => <button key={v} className={seg(f.op === v)} onClick={() => f.setOp(v)}>{l}</button>)}
      </div>
      <select className={sel} value={f.zone} onChange={(e) => f.setZone(e.target.value)} aria-label={L.zone}><option value="">{L.zone}: {L.any}</option>{zones.map((z) => <option key={z}>{z}</option>)}</select>
      <select className={sel} value={f.type} onChange={(e) => f.setType(e.target.value)} aria-label={L.type}><option value="">{L.type}: {L.any}</option>{types.map((z) => <option key={z}>{z}</option>)}</select>
      <input className={`${sel} w-[120px]`} inputMode="numeric" placeholder={L.maxPrice} value={f.max} onChange={(e) => f.setMax(e.target.value.replace(/\D/g, ''))} />
      <select className={sel} value={f.beds} onChange={(e) => f.setBeds(e.target.value)} aria-label={L.beds}><option value="">{L.beds}</option>{[1, 2, 3, 4].map((n) => <option key={n} value={n}>{n}+</option>)}</select>
      <label className="flex h-10 items-center gap-2 rounded-xl bg-white px-3 text-[13px] ring-1 ring-inset ring-black/10"><input type="checkbox" checked={f.active} onChange={(e) => f.setActive(e.target.checked)} className="accent-black" />{L.activeOnly}</label>
      {offers && <label className="flex h-10 items-center gap-2 rounded-xl bg-white px-3 text-[13px] ring-1 ring-inset ring-black/10"><input type="checkbox" checked={f.drops} onChange={(e) => f.setDrops(e.target.checked)} className="accent-black" />{L.drops}</label>}
    </div>
  )
}

function ItemRow({ i, data, L, onListing, onClient, children }: { i: BItem; data: BolsaIndex; L: typeof T.es; onListing?: (i: BItem) => void; onClient?: (i: BItem) => void; children?: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const [pics, setPics] = useState<string[]>([])
  useEffect(() => { if (open && i.images?.length && !pics.length) photoUrls(i.images.slice(0, 8)).then(setPics) }, [open]) // eslint-disable-line react-hooks/exhaustive-deps
  const b = data.brokerBy.get(i.broker)
  const isOffer = i.kind === 'Oferta'
  return (
    <li className="rounded-2xl bg-white ring-1 ring-black/5">
      <button onClick={() => setOpen(!open)} className="flex w-full items-start gap-4 p-4 text-left">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5 text-[12px]">
            <span className={`rounded-md px-2 py-0.5 font-semibold ${isRent(i) && !isSale(i) ? 'bg-sky-100 text-sky-800' : isSale(i) && !isRent(i) ? 'bg-violet-100 text-violet-800' : 'bg-black/5'}`}>{i.op ?? '—'}</span>
            {i.type && <span className="rounded-md bg-black/5 px-2 py-0.5">{i.type}</span>}
            {!i.active && <span className="rounded-md bg-black/5 px-2 py-0.5 text-ink-mute">{i.closed ? L.closed : L.inactive}</span>}
            {i.price_drop && <span className="flex items-center gap-1 rounded-md bg-rose-50 px-2 py-0.5 font-medium text-rose-700"><TrendingDown size={12} />{L.drop} {i.drop_pct}%</span>}
          </div>
          <p className="mt-1.5 truncate text-[15px] font-semibold">{i.title}</p>
          <p className="mt-0.5 flex flex-wrap gap-x-3 text-[13px] text-ink-soft">
            <span className="flex items-center gap-1"><MapPin size={12} />{i.zones.join(', ') || '—'}</span>
            {[bedsTxt(i) && `${bedsTxt(i)} rec`, i.baths && `${i.baths} baños`, i.m2 && `${i.m2} m²`, i.parking && `${i.parking} estac.`, i.furnished].filter(Boolean).join(' · ')}
          </p>
        </div>
        <div className="shrink-0 text-right">
          <p className="text-[16px] font-semibold">{money(i.price)}</p>
          <p className="mt-0.5 text-[12px] text-ink-mute">{L.seen} {fmtDate(i.last_seen)} · {L.times(i.times)}</p>
          <p className="mt-0.5 truncate text-[12px] text-ink-soft">{brokerLabel(b)}</p>
        </div>
        <ChevronDown size={18} className={`mt-1 shrink-0 text-ink-mute transition ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="border-t border-black/5 p-4">
          {pics.length > 0 && <div className="no-scrollbar mb-3 flex gap-2 overflow-x-auto">{pics.map((u) => <a key={u} href={u} target="_blank" rel="noreferrer" className="shrink-0"><img src={u} alt="" className="h-28 w-36 rounded-xl object-cover" /></a>)}</div>}
          <pre className="max-h-64 overflow-auto whitespace-pre-wrap rounded-xl bg-paper p-3 font-sans text-[13px] leading-relaxed">{i.text}</pre>
          <p className="mt-2 text-[12px] text-ink-mute">{i.groups.join(' · ')} · {fmtDate(i.first_seen)} → {fmtDate(i.last_seen)}{i.price_history.length > 1 && ` · ${i.price_history.map(([, p]) => money(p)).join(' → ')}`}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {isOffer && onListing && <button onClick={() => onListing(i)} className="btn-primary btn-sm"><Building size={15} />{L.createListing}</button>}
            {isOffer && onClient && <button onClick={() => onClient(i)} className="btn-soft btn-sm"><Send size={15} />{L.toClient}</button>}
            {b?.phone && <a href={`https://wa.me/${waNum(b.phone)}`} target="_blank" rel="noreferrer" className="btn-soft btn-sm"><WhatsAppIcon size={15} className="text-mint-600" />{L.waBroker} · {b.phone}</a>}
            <button onClick={() => { navigator.clipboard?.writeText(i.text); setCopied(true); setTimeout(() => setCopied(false), 1500) }} className="btn-soft btn-sm"><Copy size={15} />{copied ? L.copied : L.copy}</button>
          </div>
          {children}
        </div>
      )}
    </li>
  )
}

function ClientPicker({ offer, leads, L, onClose }: { offer: BItem; leads: Lead[]; L: typeof T.es; onClose: () => void }) {
  const [q, setQ] = useState('')
  const list = leads.filter((l) => l.phone && `${l.name} ${l.phone} ${l.areas ?? ''}`.toLowerCase().includes(q.toLowerCase())).slice(0, 30)
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-3xl bg-white p-6">
        <button onClick={onClose} className="absolute right-4 top-4 rounded-full p-1 hover:bg-black/5" aria-label="Close"><X size={18} /></button>
        <p className="text-[18px] font-semibold">{L.pickClient}</p>
        <p className="mt-1 text-[13px] text-ink-soft">{L.clientNote}</p>
        <pre className="mt-3 whitespace-pre-wrap rounded-xl bg-paper p-3 font-sans text-[13px]">{clientText(offer)}</pre>
        <input className="input mt-3" placeholder="Buscar…" value={q} onChange={(e) => setQ(e.target.value)} />
        <ul className="mt-2 max-h-64 divide-y divide-black/5 overflow-auto">
          {list.length ? list.map((l) => (
            <li key={l.id}><a href={`https://wa.me/${waNum(l.phone)}?text=${encodeURIComponent(clientText(offer, l.language === 'en' ? 'en' : 'es'))}`} target="_blank" rel="noreferrer" onClick={onClose}
              className="flex items-center justify-between gap-3 py-2.5 text-[14px] hover:text-ink"><span><span className="font-medium">{l.name}</span> <span className="text-ink-mute">{l.areas}</span></span><WhatsAppIcon size={16} className="text-mint-600" /></a></li>
          )) : <li className="py-3 text-[13px] text-ink-soft">{L.noClients}</li>}
        </ul>
      </div>
    </div>
  )
}

export default function Bolsa() {
  const { lang } = useI18n()
  const L = T[lang]
  const { leads } = useStore()
  const nav = useNavigate()
  const { data, state, updated } = useBolsa()
  const [tab, setTab] = useState<Tab>('offers')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const [shown, setShown] = useState(PAGE)
  const [client, setClient] = useState<BItem | null>(null)
  const [bq, setBq] = useState('')
  const [zsort, setZsort] = useState<'dem_rent' | 'off_rent' | 'med_rent' | 'dem_sale'>('dem_rent')
  const file = useRef<HTMLInputElement>(null)
  const offers = useFilters(data?.offers ?? [])
  const demands = useFilters(data?.demands ?? [])

  const [step, setStep] = useState('')
  const [done, setDone] = useState<ImportResult[]>([])
  const pick = async (list?: FileList | null) => {
    const files = [...(list ?? [])]
    if (!files.length) return
    setBusy(true); setErr(''); setDone([])
    try {
      const json = files.find((f) => /\.json$/i.test(f.name))
      if (json) await uploadBolsa(json)
      const chats = files.filter((f) => /\.(zip|txt)$/i.test(f.name))
      if (chats.length) setDone(await importExports(chats, setStep))
    } catch (e) { setErr(e instanceof Error ? e.message : L.fileErr) }
    setBusy(false); setStep(''); if (file.current) file.current.value = ''
  }
  const { findBySourceCode, uploadPhoto } = useStore()
  const [flyers, setFlyers] = useState<string[]>([])
  useEffect(() => { if (data) pendingFlyers().then(setFlyers).catch(() => {}) }, [data])
  const doFlyers = async () => {
    setBusy(true); setErr('')
    try { await readFlyers(flyers, setStep); setFlyers([]) } catch (e) { setErr(e instanceof Error ? e.message : String(e)) }
    setBusy(false); setStep('')
  }
  const toListing = async (o: BItem) => {
    const ex = await findBySourceCode(`bolsa:${o.key}`)
    if (ex) { nav(`/admin/listings/${ex}`); return }
    const zone = o.zones[0] ?? ''
    let images: string[] = []
    if (o.images?.length) {
      setBusy(true); setStep('copy')
      try { const blobs = await photoBlobs(o.images.slice(0, 12)); images = await Promise.all(blobs.map((b, n) => uploadPhoto(b, `bolsa-${o.key}-${n}.jpg`))) } catch { /* continue without photos */ }
      setBusy(false); setStep('')
    }
    nav('/admin/listings/new', { state: {
      prefill: {
        title: o.title, description: '', operation: isRent(o) ? 'rent' : 'sale', type: toPropertyType(o.type), price: o.price ?? 0,
        beds: o.beds_min ?? 0, baths: o.baths ?? 0, area: o.m2 ?? 0, parking: o.parking ?? 0, furnishing: toFurnishing(o.furnished),
        location: LOCATIONS.find((l) => l.name === zone)?.slug ?? slugify(zone), images,
      },
      source: { sourceCode: `bolsa:${o.key}`, sourceLink: o.urls[0], contactName: brokerLabel(data?.brokerBy.get(o.broker)), contactPhone: data?.brokerBy.get(o.broker)?.phone, notes: o.text },
    } })
  }

  const head = (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-extrabold">{L.title}<span className="flex items-center gap-1 rounded-full bg-black/5 px-2.5 py-1 text-[11px] font-semibold text-ink-soft"><Lock size={11} />{L.priv}</span></h1>
        {data && <p className="mt-1 text-[13px] text-ink-soft">{L.generated} {fmtDate(data.generated)}{updated && ` · ${L.updated} ${fmtDate(updated)}`} · {data.offers.length.toLocaleString()} {L.tabs.offers.toLowerCase()} · {data.demands.length.toLocaleString()} {L.tabs.demands.toLowerCase()} · {data.brokers.length} brokers · {data.groups.length} grupos</p>}
      </div>
      <div>
        <input ref={file} type="file" multiple accept=".zip,.txt,.json" className="hidden" onChange={(e) => pick(e.target.files)} />
        <button onClick={() => file.current?.click()} disabled={busy} className="btn-primary">{busy ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}{busy ? (step === 'build' ? L.building : step === 'save' ? L.updating : step === 'copy' ? L.copying : step.startsWith('photos') ? `${L.photos} ${step.slice(7)}` : /^\d+\/\d+$/.test(step) ? `${L.reading} ${step}` : L.reading) : L.update}</button>
      </div>
      <p className="w-full text-[13px] text-ink-soft">{L.hint}</p>
      {flyers.length > 0 && <div className="flex w-full flex-wrap items-center justify-between gap-3 rounded-xl bg-white px-4 py-3 ring-1 ring-black/5"><p className="max-w-[80ch] text-[13px] text-ink-soft">{L.flyersMsg(flyers.length)}</p><button onClick={doFlyers} disabled={busy} className="btn-soft btn-sm">{L.flyersBtn(flyers.length)}</button></div>}
      {done.length > 0 && <p className="w-full rounded-xl bg-mint-500/10 px-4 py-3 text-[13px] text-mint-600">{L.addedOk} {done.map((d) => `${d.name} (${d.msgs} msgs, ${d.first} → ${d.last}, ${d.photos} {L.photos.toLowerCase()}, {d.isNew ? L.newGroup : L.merged})`).join(' · ')}</p>}
    </div>
  )
  if (!data) return (
    <div className="space-y-6">{head}
      {err && <p className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{err}</p>}
      <div className="card p-8 text-center">{state === 'loading' ? <Loader2 className="mx-auto animate-spin text-ink-mute" /> : <p className="mx-auto max-w-lg text-[15px] text-ink-soft">{L.empty}</p>}</div>
    </div>
  )

  const actOff = data.offers.filter((o) => o.active).length
  const actDem = data.demands.filter((o) => o.active).length
  const matches = data.matches.map((m) => ({ m, d: data.demandBy.get(m.dem), o: data.offerBy.get(m.off) })).filter((x) => x.d?.active && x.o?.active).sort((a, b) => b.m.score - a.m.score)
  const gm = new Map<string, { d: BItem; list: { m: typeof matches[number]['m']; o: BItem }[] }>()
  for (const { m, d, o } of matches) { const g = gm.get(m.dem) ?? { d: d!, list: [] }; g.list.push({ m, o: o! }); gm.set(m.dem, g) }
  const groups = [...gm.values()].sort((a, b) => b.d.last_dt.localeCompare(a.d.last_dt))
  const brokers = data.brokers.filter((b) => !bq || `${b.name} ${b.company ?? ''} ${b.phone} ${b.zones.map((z) => z[0]).join(' ')}`.toLowerCase().includes(bq.toLowerCase())).sort((a, b) => b.last.localeCompare(a.last) || b.msgs - a.msgs)
  const counts: Record<Tab, number> = { offers: actOff, demands: actDem, matches: groups.length, brokers: data.brokers.length, zones: data.zones.length }
  const tabIcon = { offers: Building, demands: Users, matches: Handshake, brokers: Users, zones: MapPin }

  return (
    <div className="space-y-6">
      {head}
      {err && <p className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{err}</p>}
      <div className="no-scrollbar flex gap-1 overflow-x-auto rounded-2xl bg-white p-1 ring-1 ring-black/5">
        {(Object.keys(L.tabs) as Tab[]).map((k) => { const I = tabIcon[k]; return (
          <button key={k} onClick={() => { setTab(k); setShown(PAGE) }} className={`flex h-10 shrink-0 items-center gap-2 rounded-xl px-4 text-[14px] font-semibold transition ${tab === k ? 'bg-ink text-white' : 'text-ink-soft hover:bg-black/5'}`}>
            <I size={15} />{L.tabs[k]}<span className={`text-[12px] ${tab === k ? 'text-white/60' : 'text-ink-mute'}`}>{counts[k].toLocaleString()}</span></button>
        ) })}
      </div>

      {(tab === 'offers' || tab === 'demands') && (() => {
        const f = tab === 'offers' ? offers : demands
        return (
          <>
            <Filters f={f} data={data} L={L} offers={tab === 'offers'} />
            <p className="text-[13px] text-ink-soft">{L.results(f.list.length)}</p>
            <ul className="space-y-2">
              {f.list.slice(0, shown).map((i) => (
                <ItemRow key={i.key} i={i} data={data} L={L} onListing={toListing} onClient={setClient}>
                  {tab === 'demands' && (() => {
                    const ms = data.matches.filter((m) => m.dem === i.key).map((m) => ({ m, o: data.offerBy.get(m.off) })).filter((x) => x.o?.active).slice(0, 6)
                    return (
                      <div className="mt-4">
                        <p className="text-[13px] font-semibold">{L.matchesFor}</p>
                        {ms.length ? <ul className="mt-2 space-y-1.5">{ms.map(({ m, o }) => (
                          <li key={m.off} className="flex items-center justify-between gap-3 rounded-xl bg-paper px-3 py-2 text-[13px]">
                            <span className="min-w-0 truncate"><span className="font-semibold">{m.score}</span> · {o!.title}</span>
                            <span className="shrink-0">{money(o!.price)} · {brokerLabel(data.brokerBy.get(o!.broker))}</span>
                          </li>))}</ul> : <p className="mt-1 text-[13px] text-ink-mute">{L.noMatches}</p>}
                      </div>
                    )
                  })()}
                </ItemRow>
              ))}
            </ul>
            {f.list.length > shown && <button onClick={() => setShown(shown + PAGE)} className="btn-ghost w-full">{L.more}</button>}
          </>
        )
      })()}

      {tab === 'matches' && (
        <>
          <ul className="space-y-3">
            {groups.slice(0, shown).map(({ d, list }) => {
              const bd = data.brokerBy.get(d.broker)
              return (
                <li key={d.key} className="rounded-2xl bg-white p-4 ring-1 ring-black/5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0"><p className="text-[12px] font-semibold text-amber-700">{L.request} · {brokerLabel(bd)} · {fmtDate(d.last_seen)}</p><p className="truncate text-[15px] font-semibold">{d.title}</p>
                      <p className="text-[13px] text-ink-soft">{L.budget} {money(d.price)} · {d.zones.join(', ')}{bedsTxt(d) && ` · ${bedsTxt(d)} rec`}</p></div>
                    {bd?.phone && <a href={`https://wa.me/${waNum(bd.phone)}`} target="_blank" rel="noreferrer" className="btn-soft btn-sm shrink-0"><WhatsAppIcon size={14} className="text-mint-600" />{bd.phone}</a>}
                  </div>
                  <ul className="mt-3 space-y-1.5">
                    {list.slice(0, 4).map(({ m, o }) => { const bo = data.brokerBy.get(o.broker); return (
                      <li key={m.off} className="flex flex-wrap items-center gap-x-4 gap-y-1 rounded-xl bg-paper px-3 py-2 text-[13px]">
                        <span className="w-10 font-bold">{m.score}</span>
                        <span className="min-w-0 flex-1 truncate">{o.title}</span>
                        <span className="font-semibold">{money(o.price)}</span>
                        <span className="text-ink-soft">{brokerLabel(bo)}</span>
                        {bo?.phone && <a href={`https://wa.me/${waNum(bo.phone)}`} target="_blank" rel="noreferrer" className="text-mint-600" aria-label="WhatsApp"><WhatsAppIcon size={15} /></a>}
                      </li>) })}
                  </ul>
                </li>
              )
            })}
          </ul>
          {groups.length > shown && <button onClick={() => setShown(shown + PAGE)} className="btn-ghost w-full">{L.more}</button>}
        </>
      )}

      {tab === 'brokers' && (
        <>
          <label className="relative block"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-mute" /><input className="input pl-9" placeholder={L.search} value={bq} onChange={(e) => setBq(e.target.value)} /></label>
          <div className="overflow-x-auto rounded-2xl bg-white ring-1 ring-black/5">
            <table className="w-full min-w-[820px] text-left text-[13px]">
              <thead className="border-b border-black/5 text-ink-soft"><tr><th className="px-4 py-3 font-medium">{L.bName}</th><th className="px-4 py-3 font-medium">{L.offers}</th><th className="px-4 py-3 font-medium">{L.requests}</th><th className="px-4 py-3 font-medium">{L.zones}</th><th className="px-4 py-3 font-medium">{L.last}</th><th /></tr></thead>
              <tbody className="divide-y divide-black/5">
                {brokers.slice(0, shown).map((b) => (
                  <tr key={b.id} className="hover:bg-paper">
                    <td className="px-4 py-3"><p className="font-semibold">{b.named ? b.name : b.company || b.name}</p><p className="text-ink-mute">{[b.named && b.company, b.phone, b.role_label].filter(Boolean).join(' · ')}</p></td>
                    <td className="px-4 py-3 tabular-nums">{b.n_off}</td><td className="px-4 py-3 tabular-nums">{b.n_dem}</td>
                    <td className="px-4 py-3 text-ink-soft">{b.zones.slice(0, 3).map((z) => z[0]).join(', ')}</td>
                    <td className="px-4 py-3 text-ink-soft">{fmtDate(b.last)}</td>
                    <td className="px-4 py-3">{b.phone && <a href={`https://wa.me/${waNum(b.phone)}`} target="_blank" rel="noreferrer" className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-mint-500 text-white" aria-label="WhatsApp"><WhatsAppIcon size={15} /></a>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {brokers.length > shown && <button onClick={() => setShown(shown + PAGE)} className="btn-ghost w-full">{L.more}</button>}
        </>
      )}

      {tab === 'zones' && (
        <div className="overflow-x-auto rounded-2xl bg-white ring-1 ring-black/5">
          <table className="w-full min-w-[820px] text-left text-[13px]">
            <thead className="border-b border-black/5 text-ink-soft"><tr>
              <th className="px-4 py-3 font-medium">{L.zone}</th>
              {([['off_rent', L.offRent], ['dem_rent', L.demRent]] as const).map(([k, l]) => <th key={k} className="px-4 py-3 font-medium"><button onClick={() => setZsort(k)} className={zsort === k ? 'text-ink' : ''}>{l} ↓</button></th>)}
              <th className="px-4 py-3 font-medium">{L.offSale}</th>
              <th className="px-4 py-3 font-medium"><button onClick={() => setZsort('dem_sale')} className={zsort === 'dem_sale' ? 'text-ink' : ''}>{L.demSale} ↓</button></th>
              <th className="px-4 py-3 font-medium"><button onClick={() => setZsort('med_rent')} className={zsort === 'med_rent' ? 'text-ink' : ''}>{L.medRent} ↓</button></th>
              <th className="px-4 py-3 font-medium">{L.medBudget}</th><th className="px-4 py-3 font-medium">{L.medSale}</th>
            </tr></thead>
            <tbody className="divide-y divide-black/5">
              {[...data.zones].sort((a, b) => b[zsort] - a[zsort]).map((z) => (
                <tr key={z.zone} className="hover:bg-paper">
                  <td className="px-4 py-3 font-semibold">{z.zone}</td><td className="px-4 py-3 tabular-nums">{z.off_rent}</td><td className="px-4 py-3 tabular-nums">{z.dem_rent}</td>
                  <td className="px-4 py-3 tabular-nums">{z.off_sale}</td><td className="px-4 py-3 tabular-nums">{z.dem_sale}</td>
                  <td className="px-4 py-3 tabular-nums">{money(z.med_rent)}</td><td className="px-4 py-3 tabular-nums">{money(z.med_budget_rent)}</td><td className="px-4 py-3 tabular-nums">{money(z.med_sale)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {client && <ClientPicker offer={client} leads={leads} L={L} onClose={() => setClient(null)} />}
    </div>
  )
}
