import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowUpRight, Check } from 'lucide-react'
import { useI18n } from '@/i18n'
import { useStore } from '@/lib/store'
import { waLink } from '@/lib/whatsapp'
import { useSeo } from '@/lib/seo'
import { Spot, WhatsAppIcon, type SpotName } from '@/components/icons'

type Role = 'realtor' | 'developer' | 'owner' | 'company' | 'investor'
type Field = { k: string; l: string; type?: 'text' | 'tel' | 'number' | 'date' | 'textarea'; ph?: string; req?: boolean; opts?: string[]; multi?: boolean }
type T = { en: string; es: string }

const ROLES: { id: Role; icon: SpotName; t: T; d: T; perks: T[] }[] = [
  { id: 'realtor', icon: 'agent', t: { en: 'Licensed realtor', es: 'Corredor con licencia' }, d: { en: 'Get qualified clients and share listings with clear terms.', es: 'Recibe clientes calificados y comparte propiedades con reglas claras.' },
    perks: [{ en: 'Clients pre-qualified on WhatsApp', es: 'Clientes precalificados por WhatsApp' }, { en: 'Your listings shown across the network', es: 'Tus propiedades visibles en toda la red' }, { en: 'Commission split agreed up front', es: 'Comisión compartida acordada desde el inicio' }] },
  { id: 'developer', icon: 'building', t: { en: 'Developer', es: 'Desarrollador' }, d: { en: 'Put your project in front of buyers and investors.', es: 'Lleva tu proyecto a compradores e inversionistas.' },
    perks: [{ en: 'Buyers and investors ready to move', es: 'Compradores e inversionistas listos' }, { en: 'Project page and WhatsApp follow-up', es: 'Página del proyecto y seguimiento por WhatsApp' }, { en: 'Weekly reporting', es: 'Reportes semanales' }] },
  { id: 'owner', icon: 'home', t: { en: 'Property owner', es: 'Propietario' }, d: { en: 'Rent out or sell with a licensed professional.', es: 'Alquila o vende con un profesional con licencia.' },
    perks: [{ en: 'Professional photos and video', es: 'Fotos y video profesionales' }, { en: 'Screened visits only', es: 'Solo visitas filtradas' }, { en: 'You approve every step', es: 'Tú apruebas cada paso' }] },
  { id: 'company', icon: 'handshake', t: { en: 'Company / HR', es: 'Empresa / RR. HH.' }, d: { en: 'Housing for executives and relocating staff.', es: 'Vivienda para ejecutivos y personal reubicado.' },
    perks: [{ en: 'One point of contact', es: 'Un solo punto de contacto' }, { en: 'Shortlists in 48 hours', es: 'Opciones en 48 horas' }, { en: 'Corporate lease support', es: 'Apoyo con contratos corporativos' }] },
  { id: 'investor', icon: 'chart', t: { en: 'Investor', es: 'Inversionista' }, d: { en: 'Find units that rent, with numbers you can check.', es: 'Encuentra unidades que se alquilan, con números verificables.' },
    perks: [{ en: 'Off-market opportunities', es: 'Oportunidades fuera de mercado' }, { en: 'Rent and resale estimates', es: 'Estimados de alquiler y reventa' }, { en: 'Leasing after you buy', es: 'Alquiler después de comprar' }] },
]

const FIELDS: Record<'en' | 'es', Record<Role, Field[]>> = {
  en: {
    realtor: [
      { k: 'licence', l: 'Real estate licence number', ph: 'Issued by the Junta Técnica de Bienes Raíces (MICI)', req: true },
      { k: 'agency', l: 'Agency or independent' },
      { k: 'years', l: 'Years in real estate', opts: ['Under 2', '2–5', '5–10', '10+'] },
      { k: 'areas', l: 'Areas you cover', opts: ['Punta Pacífica / Paitilla', 'Costa del Este / Santa María', 'Obarrio / El Cangrejo', 'Casco Viejo / Balboa', 'Clayton / Panamá Pacífico', 'Beach / interior'], multi: true },
      { k: 'brings', l: 'What you bring', opts: ['Listings', 'Clients', 'Both'] },
    ],
    developer: [
      { k: 'project', l: 'Project name', req: true }, { k: 'location', l: 'Location' },
      { k: 'stage', l: 'Stage', opts: ['Pre-sale', 'Under construction', 'Ready to move in'] },
      { k: 'units', l: 'Units available', type: 'number' }, { k: 'prices', l: 'Price range (USD)', ph: 'e.g. 180,000 – 420,000' },
    ],
    owner: [
      { k: 'op', l: 'I want to', opts: ['Rent it out', 'Sell'] }, { k: 'where', l: 'Building and neighborhood', req: true },
    ],
    company: [
      { k: 'company', l: 'Company', req: true }, { k: 'people', l: 'People to house', type: 'number' },
      { k: 'budget', l: 'Monthly budget per home (USD)', ph: 'e.g. 2,500' }, { k: 'start', l: 'Start date', type: 'date' },
    ],
    investor: [
      { k: 'budget', l: 'Budget (USD)', opts: ['Under 200K', '200K–500K', '500K–1M', '1M+'] },
      { k: 'goal', l: 'Goal', opts: ['Rental income', 'Appreciation', 'Residency', 'Personal use + rent'], multi: true },
      { k: 'timeline', l: 'Timeline', opts: ['Now', '3 months', '6+ months'] },
    ],
  },
  es: {
    realtor: [
      { k: 'licence', l: 'Número de licencia de corredor', ph: 'Emitida por la Junta Técnica de Bienes Raíces (MICI)', req: true },
      { k: 'agency', l: 'Agencia o independiente' },
      { k: 'years', l: 'Años en bienes raíces', opts: ['Menos de 2', '2–5', '5–10', '10+'] },
      { k: 'areas', l: 'Zonas que cubres', opts: ['Punta Pacífica / Paitilla', 'Costa del Este / Santa María', 'Obarrio / El Cangrejo', 'Casco Viejo / Balboa', 'Clayton / Panamá Pacífico', 'Playa / interior'], multi: true },
      { k: 'brings', l: 'Qué aportas', opts: ['Propiedades', 'Clientes', 'Ambos'] },
    ],
    developer: [
      { k: 'project', l: 'Nombre del proyecto', req: true }, { k: 'location', l: 'Ubicación' },
      { k: 'stage', l: 'Etapa', opts: ['Preventa', 'En construcción', 'Listo para entrega'] },
      { k: 'units', l: 'Unidades disponibles', type: 'number' }, { k: 'prices', l: 'Rango de precios (USD)', ph: 'ej. 180,000 – 420,000' },
    ],
    owner: [
      { k: 'op', l: 'Quiero', opts: ['Alquilarla', 'Venderla'] }, { k: 'where', l: 'Edificio y zona', req: true },
    ],
    company: [
      { k: 'company', l: 'Empresa', req: true }, { k: 'people', l: 'Personas a ubicar', type: 'number' },
      { k: 'budget', l: 'Presupuesto mensual por vivienda (USD)', ph: 'ej. 2,500' }, { k: 'start', l: 'Fecha de inicio', type: 'date' },
    ],
    investor: [
      { k: 'budget', l: 'Presupuesto (USD)', opts: ['Menos de 200K', '200K–500K', '500K–1M', '1M+'] },
      { k: 'goal', l: 'Objetivo', opts: ['Renta', 'Plusvalía', 'Residencia', 'Uso propio + renta'], multi: true },
      { k: 'timeline', l: 'Plazo', opts: ['Ya', '3 meses', '6+ meses'] },
    ],
  },
}

const X = {
  en: {
    title: 'Work with Realtors of Panama', sub: 'A network of licensed real estate professionals across Panama. Tell us who you are and we’ll take it from there.',
    who: 'I am a…', name: 'Full name', phone: 'WhatsApp', message: 'Anything else we should know?', send: 'Send application', sendOther: 'Send',
    done: 'Received. We’ll write to you on WhatsApp.', licensedOnly: 'Only realtors with a valid licence issued in Panama can join the network. We verify every licence.',
    ownerHint: 'Want to give us all the details now?', ownerCta: 'Use the full property form', wa: 'Prefer WhatsApp?', err: 'That didn’t go through. Please write to us on WhatsApp.',
    confirm: 'I confirm my real estate licence is valid in Panama.', perks: 'What you get',
  },
  es: {
    title: 'Trabaja con Realtors of Panama', sub: 'Una red de profesionales inmobiliarios con licencia en todo Panamá. Cuéntanos quién eres y seguimos desde ahí.',
    who: 'Soy…', name: 'Nombre completo', phone: 'WhatsApp', message: '¿Algo más que debamos saber?', send: 'Enviar solicitud', sendOther: 'Enviar',
    done: 'Recibido. Te escribimos por WhatsApp.', licensedOnly: 'Solo corredores con licencia vigente en Panamá pueden unirse a la red. Verificamos cada licencia.',
    ownerHint: '¿Quieres darnos todos los detalles ahora?', ownerCta: 'Usa el formulario completo', wa: '¿Prefieres WhatsApp?', err: 'No se pudo enviar. Escríbenos por WhatsApp.',
    confirm: 'Confirmo que mi licencia de corredor está vigente en Panamá.', perks: 'Lo que obtienes',
  },
}

export default function Network() {
  const { lang } = useI18n()
  const { addWebLead } = useStore()
  const L = X[lang]
  useSeo({ title: `${L.title} · Panama`, description: L.sub })
  const [role, setRole] = useState<Role>('realtor')
  const [v, setV] = useState<Record<string, string>>({})
  const [base, setBase] = useState({ name: '', phone: '', message: '' })
  const [ok, setOk] = useState(false)
  const [state, setState] = useState<'idle' | 'busy' | 'ok' | 'err'>('idle')
  const r = ROLES.find((x) => x.id === role)!
  const fields = FIELDS[lang][role]
  const set = (k: string, val: string) => setV((x) => ({ ...x, [k]: val }))
  const toggle = (k: string, o: string) => { const cur = (v[k] ?? '').split(' · ').filter(Boolean); set(k, (cur.includes(o) ? cur.filter((c) => c !== o) : [...cur, o]).join(' · ')) }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setState('busy')
    const lines = [`${L.who.replace('…', '')} ${r.t[lang]}`, ...fields.filter((f) => v[f.k]).map((f) => `${f.l}: ${v[f.k]}`), base.message]
    const interest = role === 'realtor' ? 'broker' : role === 'owner' ? ((v.op ?? '').match(/sell|vend/i) ? 'sell' : 'rent_out') : role === 'investor' ? 'buy' : role === 'company' ? 'rent' : 'broker'
    const res = await addWebLead({ name: base.name.trim(), phone: base.phone.trim(), interest, message: lines.filter(Boolean).join('\n') })
    setState(res ? 'ok' : 'err')
  }

  return (
    <>
      <section className="container-x pt-10 sm:pt-16">
        <h1 className="h-display max-w-[12ch] animate-[lineup_.9s_cubic-bezier(.2,.7,.1,1)_both]">{L.title}</h1>
        <p className="mt-6 max-w-[56ch] text-[18px] text-ink-soft">{L.sub}</p>
      </section>

      <section className="container-x py-12 sm:py-16">
        <p className="mb-4 text-[15px] font-medium">{L.who}</p>
        <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-5" role="radiogroup">
          {ROLES.map((x) => (
            <button key={x.id} role="radio" aria-checked={x.id === role} onClick={() => { setRole(x.id); setV({}); setState('idle') }}
              className={`flex flex-col items-start gap-4 rounded-[24px] p-5 text-left transition ${x.id === role ? 'bg-ink text-white shadow-lift' : 'bg-white ring-1 ring-black/5 hover:ring-black/20'}`}>
              <Spot name={x.icon} size={48} tone={x.id === role ? 'light' : 'gold'} />
              <span><span className="block text-[17px] font-semibold leading-tight">{x.t[lang]}</span><span className={`mt-1 block text-[13px] leading-snug ${x.id === role ? 'text-white/60' : 'text-ink-soft'}`}>{x.d[lang]}</span></span>
            </button>
          ))}
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_1.4fr]">
          <aside key={role} className="animate-rise rounded-[28px] bg-white p-7 ring-1 ring-black/5 lg:self-start">
            <p className="text-[13px] font-medium uppercase tracking-[.14em] text-ink/60">{L.perks}</p>
            <ul className="mt-5 space-y-3">{r.perks.map((p) => <li key={p.en} className="flex gap-3 text-[16px]"><span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-ink text-white"><Check size={13} /></span>{p[lang]}</li>)}</ul>
            {role === 'realtor' && <p className="mt-6 rounded-2xl bg-paper p-4 text-[14px]">{L.licensedOnly}</p>}
            {role === 'owner' && <div className="mt-6 rounded-2xl bg-paper p-4 text-[14px]">{L.ownerHint}<Link to="/list-your-property" className="link mt-2 flex items-center gap-1">{L.ownerCta}<ArrowUpRight size={14} /></Link></div>}
          </aside>

          <div key={role + 'f'} className="animate-rise rounded-[28px] bg-white p-6 ring-1 ring-black/5 sm:p-8">
            {state === 'ok' ? <p className="py-10 text-center text-[18px] font-medium">{L.done}</p> : (
              <form onSubmit={submit} className="space-y-5">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div><label className="label" htmlFor="nw-name">{L.name}</label><input id="nw-name" className="input" required maxLength={120} value={base.name} onChange={(e) => setBase({ ...base, name: e.target.value })} /></div>
                  <div><label className="label" htmlFor="nw-phone">{L.phone}</label><input id="nw-phone" className="input" required maxLength={40} inputMode="tel" placeholder="+507" value={base.phone} onChange={(e) => setBase({ ...base, phone: e.target.value })} /></div>
                </div>
                {fields.map((f) => (
                  <div key={f.k}>
                    <label className="label" htmlFor={`nw-${f.k}`}>{f.l}{f.req && ' *'}</label>
                    {f.opts ? (
                      <div className="flex flex-wrap gap-2">
                        {f.opts.map((o) => {
                          const on = f.multi ? (v[f.k] ?? '').split(' · ').includes(o) : v[f.k] === o
                          return <button key={o} type="button" onClick={() => (f.multi ? toggle(f.k, o) : set(f.k, o))} aria-pressed={on}
                            className={`h-10 rounded-full px-4 text-[14px] transition ${on ? 'bg-ink text-white' : 'bg-paper hover:bg-black/10'}`}>{o}</button>
                        })}
                      </div>
                    ) : f.type === 'textarea' ? <textarea id={`nw-${f.k}`} className="input h-24 py-3" value={v[f.k] ?? ''} onChange={(e) => set(f.k, e.target.value)} />
                      : <input id={`nw-${f.k}`} className="input" type={f.type ?? 'text'} required={f.req} placeholder={f.ph} maxLength={200} value={v[f.k] ?? ''} onChange={(e) => set(f.k, e.target.value)} />}
                  </div>
                ))}
                <div><label className="label" htmlFor="nw-msg">{L.message}</label><textarea id="nw-msg" className="input h-24 py-3" maxLength={1500} value={base.message} onChange={(e) => setBase({ ...base, message: e.target.value })} /></div>
                {role === 'realtor' && <label className="flex items-start gap-3 text-[14px]"><input type="checkbox" required checked={ok} onChange={(e) => setOk(e.target.checked)} className="mt-0.5 h-5 w-5 accent-black" />{L.confirm}</label>}
                <button disabled={state === 'busy'} className="btn-primary btn-lg w-full">{role === 'realtor' ? L.send : L.sendOther}<ArrowUpRight size={18} /></button>
                {state === 'err' && <p className="text-sm text-rose-700">{L.err}</p>}
              </form>
            )}
            <a href={waLink(lang === 'es' ? `¡Hola! Soy ${r.t.es.toLowerCase()} y quiero trabajar con Realtors of Panama.` : `Hi! I'm a ${r.t.en.toLowerCase()} and I'd like to work with Realtors of Panama.`)} target="_blank" rel="noreferrer" className="mt-6 inline-flex items-center gap-2 text-[14px] text-ink-soft hover:text-ink"><WhatsAppIcon size={16} className="text-mint-500" />{L.wa}</a>
          </div>
        </div>
      </section>
    </>
  )
}
