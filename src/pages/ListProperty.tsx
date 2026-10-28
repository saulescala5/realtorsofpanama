import { useState } from 'react'
import { ArrowLeft, ArrowRight, Check, Info, BedDouble, Bath, Maximize, BadgeCheck } from 'lucide-react'
import { useI18n } from '@/i18n'
import { useStore } from '@/lib/store'
import { waLink } from '@/lib/whatsapp'
import { useSeo } from '@/lib/seo'
import { LOCATIONS, locationName } from '@/lib/locations'
import { MARKET, range } from '@/lib/market'
import type { PropertyType } from '@/lib/types'
import { Spot, WhatsAppIcon, type SpotName } from '@/components/icons'

const TYPES: [PropertyType, SpotName][] = [['apartment', 'building'], ['house', 'home'], ['penthouse', 'sun'], ['studio', 'key'], ['land', 'leaf'], ['commercial', 'bag'], ['office', 'document']]
const AMEN = ['pool', 'gym', 'security', 'oceanView', 'elevator', 'garden', 'petFriendly', 'terrace', 'ac', 'generator', 'socialArea', 'storage']

const X = {
  en: {
    eyebrow: 'For owners', title: 'Publish your property', sub: 'Five short steps. A licensed professional from our network reviews it, verifies the registry and calls you within 24 hours.',
    steps: ['Operation', 'Location & registry', 'Details', 'Price & status', 'Contact'],
    op: 'What do you want to do?', sell: 'Sell', rentOut: 'Rent it out', both: 'Either', type: 'Property type',
    hood: 'Neighborhood', building: 'Building / street', unit: 'Floor and unit', finca: 'Finca number (folio real)', code: 'Location code (código de ubicación)', cadastral: 'Cadastral value (optional, USD)',
    regHint: 'Both numbers appear on your Public Registry certificate and on your property tax receipt (DGI). They let us verify ownership and liens before we publish. Not sure? Leave them blank and we’ll help you find them.',
    beds: 'Bedrooms', baths: 'Bathrooms', area: 'Built area (m²)', parking: 'Parking spots', year: 'Year built', furnish: 'Furnishing', amen: 'Amenities',
    price: (sale: boolean) => (sale ? 'Asking price (USD)' : 'Monthly rent (USD)'), hoa: 'HOA / maintenance per month (USD)', avail: 'Available from',
    whoAmI: 'I am', roles: ['The owner', 'Representing the owner', 'The developer'], mortgage: 'Is there a mortgage on it?', yes: 'Yes', no: 'No',
    occupied: 'Right now it is', occ: ['Empty', 'Rented', 'Owner lives there'], guide: (n: string) => `Typical in ${n}`, perM2: '/m²', twoBr: '2BR',
    name: 'Your name', phone: 'WhatsApp', email: 'Email (optional)', when: 'Best time to call', times: ['Morning', 'Afternoon', 'Evening'],
    consent: 'I authorize Realtors of Panama to verify this property at the Public Registry and to contact me about it.',
    back: 'Back', next: 'Continue', submit: 'Publish my property', done: 'Received. A licensed agent will review your property and write to you on WhatsApp within 24 hours.',
    preview: 'Preview', untitled: 'Your property', orWa: 'Prefer to send photos on WhatsApp?', err: 'That didn’t go through. Please write to us on WhatsApp.',
    trust: ['Registry verified before publishing', 'Screened clients only', 'Professional photos and video'],
  },
  es: {
    eyebrow: 'Para propietarios', title: 'Publica tu propiedad', sub: 'Cinco pasos cortos. Un profesional con licencia de nuestra red la revisa, verifica el registro y te llama en menos de 24 horas.',
    steps: ['Operación', 'Ubicación y registro', 'Detalles', 'Precio y estado', 'Contacto'],
    op: '¿Qué quieres hacer?', sell: 'Vender', rentOut: 'Alquilar', both: 'Cualquiera', type: 'Tipo de propiedad',
    hood: 'Zona', building: 'Edificio / calle', unit: 'Piso y unidad', finca: 'Número de finca (folio real)', code: 'Código de ubicación', cadastral: 'Valor catastral (opcional, USD)',
    regHint: 'Ambos números aparecen en tu certificado del Registro Público y en el recibo del impuesto de inmueble (DGI). Nos permiten verificar propiedad y gravámenes antes de publicar. ¿No los tienes? Déjalos en blanco y te ayudamos a encontrarlos.',
    beds: 'Recámaras', baths: 'Baños', area: 'Área construida (m²)', parking: 'Estacionamientos', year: 'Año de construcción', furnish: 'Amoblado', amen: 'Amenidades',
    price: (sale: boolean) => (sale ? 'Precio de venta (USD)' : 'Alquiler mensual (USD)'), hoa: 'Mantenimiento mensual (USD)', avail: 'Disponible desde',
    whoAmI: 'Soy', roles: ['El propietario', 'Representante del propietario', 'El desarrollador'], mortgage: '¿Tiene hipoteca?', yes: 'Sí', no: 'No',
    occupied: 'Actualmente está', occ: ['Vacía', 'Alquilada', 'La habita el dueño'], guide: (n: string) => `Típico en ${n}`, perM2: '/m²', twoBr: '2 rec.',
    name: 'Tu nombre', phone: 'WhatsApp', email: 'Correo (opcional)', when: 'Mejor hora para llamarte', times: ['Mañana', 'Tarde', 'Noche'],
    consent: 'Autorizo a Realtors of Panama a verificar esta propiedad en el Registro Público y a contactarme sobre ella.',
    back: 'Atrás', next: 'Continuar', submit: 'Publicar mi propiedad', done: 'Recibido. Un agente con licencia revisará tu propiedad y te escribirá por WhatsApp en menos de 24 horas.',
    preview: 'Vista previa', untitled: 'Tu propiedad', orWa: '¿Prefieres enviar fotos por WhatsApp?', err: 'No se pudo enviar. Escríbenos por WhatsApp.',
    trust: ['Registro verificado antes de publicar', 'Solo clientes filtrados', 'Fotos y video profesionales'],
  },
}

type F = Record<string, string>

export default function ListProperty() {
  const { t, lang } = useI18n()
  const { addWebLead } = useStore()
  const L = X[lang]
  useSeo({ title: `${L.title} in Panama · Realtors of Panama`, description: L.sub })
  const [step, setStep] = useState(0)
  const [f, setF] = useState<F>({ op: 'rent_out', type: 'apartment', hood: '', furnish: '', amen: '', role: '0', mortgage: '', occ: '', when: '' })
  const [consent, setConsent] = useState(false)
  const [state, setState] = useState<'idle' | 'busy' | 'ok' | 'err'>('idle')
  const set = (k: string, v: string) => setF((x) => ({ ...x, [k]: v }))
  const sale = f.op === 'sell'
  const m = MARKET[f.hood]
  const amen = f.amen ? f.amen.split(',') : []

  const canNext = [true, !!f.hood && !!f.building, true, !!f.price, !!f.name && !!f.phone && consent][step]

  const submit = async () => {
    setState('busy')
    const lines = [
      `${f.op === 'sell' ? L.sell : f.op === 'either' ? `${L.sell}/${L.rentOut}` : L.rentOut} · ${t.types[f.type as PropertyType]}`,
      `${L.hood}: ${locationName(f.hood)} · ${f.building ?? ''} ${f.unit ? `· ${f.unit}` : ''}`,
      f.finca && `${L.finca}: ${f.finca}`, f.code && `${L.code}: ${f.code}`, f.cadastral && `${L.cadastral}: ${f.cadastral}`,
      [f.beds && `${f.beds} ${L.beds}`, f.baths && `${f.baths} ${L.baths}`, f.area && `${f.area} m²`, f.parking && `${f.parking} ${L.parking}`, f.year && `${L.year} ${f.year}`].filter(Boolean).join(' · '),
      f.furnish && `${L.furnish}: ${t.furnishing[f.furnish as 'furnished']}`, amen.length && `${L.amen}: ${amen.map((a) => t.amenities[a]).join(', ')}`,
      `${L.price(sale)}: ${f.price}`, f.hoa && `${L.hoa}: ${f.hoa}`, f.avail && `${L.avail}: ${f.avail}`,
      `${L.whoAmI}: ${L.roles[Number(f.role)]}`, f.mortgage && `${L.mortgage} ${f.mortgage}`, f.occ && `${L.occupied}: ${f.occ}`,
      f.when && `${L.when}: ${f.when}`, f.notes,
    ].filter(Boolean).join('\n')
    const ok = await addWebLead({ name: f.name.trim(), phone: f.phone.trim(), email: f.email?.trim() || undefined, interest: f.op === 'sell' ? 'sell' : 'rent_out', message: lines })
    setState(ok ? 'ok' : 'err')
  }

  const chips = (k: string, opts: [string, string][], multi = false) => (
    <div className="flex flex-wrap gap-2">
      {opts.map(([v, l]) => {
        const on = multi ? amen.includes(v) : f[k] === v
        return <button key={v} type="button" aria-pressed={on} onClick={() => (multi ? set(k, (on ? amen.filter((a) => a !== v) : [...amen, v]).join(',')) : set(k, on ? '' : v))}
          className={`h-10 rounded-full px-4 text-[14px] transition ${on ? 'bg-ink text-white' : 'bg-paper hover:bg-black/10'}`}>{on && multi && <Check size={13} className="-mt-0.5 mr-1 inline" />}{l}</button>
      })}
    </div>
  )
  const input = (k: string, label: string, props: React.InputHTMLAttributes<HTMLInputElement> = {}) => (
    <div><label className="label" htmlFor={`lp-${k}`}>{label}</label><input id={`lp-${k}`} className="input" value={f[k] ?? ''} onChange={(e) => set(k, e.target.value)} maxLength={200} {...props} /></div>
  )
  const stepper = (k: string, label: string) => (
    <div><p className="label">{label}</p>
      <div className="flex h-12 items-center justify-between rounded-2xl bg-white px-2 ring-1 ring-inset ring-black/10">
        <button type="button" className="h-9 w-9 rounded-full text-[20px] hover:bg-paper" onClick={() => set(k, String(Math.max(0, Number(f[k] ?? 0) - 1)))} aria-label="-">−</button>
        <span className="text-[16px] font-semibold tabular-nums">{f[k] ?? 0}</span>
        <button type="button" className="h-9 w-9 rounded-full text-[20px] hover:bg-paper" onClick={() => set(k, String(Number(f[k] ?? 0) + 1))} aria-label="+">+</button>
      </div>
    </div>
  )

  return (
    <div className="container-x py-10 sm:py-14">
      <p className="text-[13px] font-medium uppercase tracking-[.14em] text-ink-soft">{L.eyebrow}</p>
      <h1 className="h-display mt-3 max-w-[11ch]">{L.title}</h1>
      <p className="mt-6 max-w-[56ch] text-[18px] text-ink-soft">{L.sub}</p>

      <div className="mt-12 grid gap-8 lg:grid-cols-[1.5fr_1fr]">
        <div className="rounded-5xl bg-white p-6 ring-1 ring-black/5 sm:p-10">
          {state === 'ok' ? (
            <div className="py-12 text-center"><Spot name="verified" size={80} className="mx-auto" /><p className="mx-auto mt-6 max-w-[40ch] text-[19px] font-medium">{L.done}</p></div>
          ) : (
            <>
              {/* progress */}
              <ol className="flex gap-1.5">
                {L.steps.map((s, i) => (
                  <li key={s} className="flex-1">
                    <button type="button" disabled={i > step} onClick={() => setStep(i)} className="w-full text-left disabled:cursor-default">
                      <span className={`block h-1.5 rounded-full transition-colors ${i <= step ? 'bg-ink' : 'bg-black/10'}`} />
                      <span className={`mt-2 hidden text-[12px] sm:block ${i === step ? 'font-semibold text-ink' : 'text-ink-mute'}`}>{i + 1}. {s}</span>
                    </button>
                  </li>
                ))}
              </ol>

              <div key={step} className="mt-10 animate-rise space-y-6">
                {step === 0 && (<>
                  <div><p className="label">{L.op}</p>
                    <div className="grid grid-cols-3 gap-2">
                      {([['rent_out', L.rentOut, 'key'], ['sell', L.sell, 'coins'], ['either', L.both, 'handshake']] as [string, string, SpotName][]).map(([v, l, ic]) => (
                        <button key={v} type="button" onClick={() => set('op', v)} className={`flex flex-col items-center gap-2 rounded-[22px] p-4 text-[15px] font-medium transition ${f.op === v ? 'bg-ink text-white' : 'bg-paper hover:bg-black/10'}`}><Spot name={ic} size={44} />{l}</button>
                      ))}
                    </div>
                  </div>
                  <div><p className="label">{L.type}</p>
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                      {TYPES.map(([v, ic]) => (
                        <button key={v} type="button" onClick={() => set('type', v)} className={`flex items-center gap-2 rounded-[18px] p-3 text-[14px] font-medium transition ${f.type === v ? 'bg-ink text-white' : 'bg-paper hover:bg-black/10'}`}><Spot name={ic} size={34} />{t.types[v]}</button>
                      ))}
                    </div>
                  </div>
                </>)}

                {step === 1 && (<>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div><label className="label" htmlFor="lp-hood">{L.hood} *</label>
                      <select id="lp-hood" className="input" value={f.hood} onChange={(e) => set('hood', e.target.value)}>
                        <option value="">—</option>{LOCATIONS.map((l) => <option key={l.slug} value={l.slug}>{l.name}</option>)}
                      </select></div>
                    {input('building', `${L.building} *`)}
                  </div>
                  <div className="grid gap-4 sm:grid-cols-3">
                    {input('unit', L.unit, { placeholder: '12-B' })}
                    {input('finca', L.finca, { placeholder: '30123456', inputMode: 'numeric' })}
                    {input('code', L.code, { placeholder: '8701' })}
                  </div>
                  {input('cadastral', L.cadastral, { inputMode: 'numeric' })}
                  <p className="flex gap-3 rounded-2xl bg-paper p-4 text-[14px] leading-relaxed text-ink-soft"><Info size={18} className="mt-0.5 shrink-0 text-ink" />{L.regHint}</p>
                </>)}

                {step === 2 && (<>
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">{stepper('beds', L.beds)}{stepper('baths', L.baths)}{stepper('parking', L.parking)}{input('area', L.area, { inputMode: 'numeric' })}</div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    {input('year', L.year, { inputMode: 'numeric', placeholder: '2018' })}
                    <div><p className="label">{L.furnish}</p>{chips('furnish', (['empty', 'linea_blanca', 'furnished'] as const).map((v) => [v, t.furnishing[v]]))}</div>
                  </div>
                  <div><p className="label">{L.amen}</p>{chips('amen', AMEN.map((a) => [a, t.amenities[a]]), true)}</div>
                </>)}

                {step === 3 && (<>
                  <div className="grid gap-4 sm:grid-cols-2">
                    {input('price', `${L.price(sale)} *`, { inputMode: 'numeric', placeholder: sale ? '350,000' : '1,800' })}
                    {input('hoa', L.hoa, { inputMode: 'numeric' })}
                  </div>
                  {m && <div className="flex items-center gap-4 rounded-2xl bg-paper p-4"><Spot name="chart" size={44} /><p className="text-[14px]"><span className="font-semibold">{L.guide(locationName(f.hood))}:</span> {L.twoBr} {range(m.rent2br)}{t.common.perMonth} · {range(m.saleM2)}{L.perM2}</p></div>}
                  {input('avail', L.avail, { type: 'date' })}
                  <div><p className="label">{L.whoAmI}</p>{chips('role', L.roles.map((r, i) => [String(i), r]))}</div>
                  <div className="grid gap-6 sm:grid-cols-2">
                    <div><p className="label">{L.mortgage}</p>{chips('mortgage', [[L.yes, L.yes], [L.no, L.no]])}</div>
                    <div><p className="label">{L.occupied}</p>{chips('occ', L.occ.map((o) => [o, o]))}</div>
                  </div>
                </>)}

                {step === 4 && (<>
                  <div className="grid gap-4 sm:grid-cols-2">{input('name', `${L.name} *`, { required: true })}{input('phone', `${L.phone} *`, { inputMode: 'tel', placeholder: '+507' })}</div>
                  {input('email', L.email, { type: 'email' })}
                  <div><p className="label">{L.when}</p>{chips('when', L.times.map((x) => [x, x]))}</div>
                  <label className="flex items-start gap-3 text-[14px]"><input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-0.5 h-5 w-5 accent-black" />{L.consent}</label>
                </>)}
              </div>

              <div className="mt-10 flex items-center justify-between gap-3 border-t border-black/10 pt-6">
                <button type="button" onClick={() => setStep(step - 1)} className={`btn-ghost ${step === 0 ? 'invisible' : ''}`}><ArrowLeft size={16} />{L.back}</button>
                {step < 4 ? <button type="button" disabled={!canNext} onClick={() => setStep(step + 1)} className="btn-primary disabled:opacity-40">{L.next}<ArrowRight size={16} /></button>
                  : <button type="button" disabled={!canNext || state === 'busy'} onClick={submit} className="btn-primary disabled:opacity-40">{L.submit}<ArrowRight size={16} /></button>}
              </div>
              {state === 'err' && <p className="mt-3 text-sm text-rose-600">{L.err}</p>}
            </>
          )}
        </div>

        {/* live preview */}
        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <p className="text-[13px] font-medium uppercase tracking-[.14em] text-ink-soft">{L.preview}</p>
          <div className="overflow-hidden rounded-[28px] bg-white ring-1 ring-black/5">
            <div className="relative aspect-[4/3] bg-paper">
              <img src={f.hood && MARKET[f.hood] ? `/hoods/hood-${f.hood}.jpg` : '/life/life-02.jpg'} alt="" className="h-full w-full object-cover opacity-90" />
              <span className="absolute left-3 top-3 rounded-full bg-white px-3 py-1 text-[12px] font-semibold">{f.op === 'sell' ? t.common.sale : t.common.rent}</span>
              {f.finca && <span className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-ink px-3 py-1 text-[12px] font-medium text-white"><BadgeCheck size={13} className="text-brand-400" />Finca {f.finca}</span>}
            </div>
            <div className="p-5">
              <p className="text-[22px] font-semibold">{f.price ? `$${Number(f.price.replace(/[^\d.]/g, '') || 0).toLocaleString('en-US')}${sale ? '' : t.common.perMonth}` : '—'}</p>
              <p className="mt-1 text-[15px]">{t.types[f.type as PropertyType]}{f.building ? ` · ${f.building}` : ''}</p>
              <p className="text-[14px] text-ink-soft">{f.hood ? locationName(f.hood) : L.untitled}</p>
              <div className="mt-4 flex gap-4 text-[14px] text-ink-soft">
                <span className="flex items-center gap-1.5"><BedDouble size={16} />{f.beds ?? 0}</span><span className="flex items-center gap-1.5"><Bath size={16} />{f.baths ?? 0}</span>{f.area && <span className="flex items-center gap-1.5"><Maximize size={16} />{f.area} m²</span>}
              </div>
            </div>
          </div>
          <ul className="space-y-2 rounded-[28px] bg-ink p-6 text-[15px] text-white">
            {L.trust.map((x) => <li key={x} className="flex items-center gap-3"><Check size={16} className="text-brand-400" />{x}</li>)}
          </ul>
          <a href={waLink(t.list.waText)} target="_blank" rel="noreferrer" className="btn-wa w-full"><WhatsAppIcon size={17} />{L.orWa}</a>
        </aside>
      </div>
    </div>
  )
}
