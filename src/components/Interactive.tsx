import { useMemo, useState } from 'react'
import { WhatsAppIcon } from './icons'
import { Link } from 'react-router-dom'
import { ArrowUpRight, RotateCcw, Bell, Check } from 'lucide-react'
import { useI18n } from '@/i18n'
import { useStore } from '@/lib/store'
import { NEIGHBORHOODS, tr } from '@/lib/neighborhoods'
import { locationName } from '@/lib/locations'
import { money } from '@/lib/format'
import { waLink } from '@/lib/whatsapp'
import { Img } from './ui'
import { titleOf } from './PropertyCard'

// ------------------------------------------------------------------ neighborhood matcher
const TAGS: Record<string, string[]> = {
  'punta-pacifica': ['views', 'luxury', 'walk', 'single'], 'costa-del-este': ['family', 'schools', 'green', 'space'],
  'avenida-balboa': ['views', 'value', 'walk', 'single'], 'casco-viejo': ['culture', 'invest', 'single', 'walk'],
  'el-cangrejo': ['walk', 'culture', 'value', 'single'], obarrio: ['walk', 'single', 'invest'],
  'san-francisco': ['family', 'walk', 'green'], 'coco-del-mar': ['family', 'space', 'quiet'], paitilla: ['views', 'space', 'value', 'quiet'],
  'santa-maria': ['luxury', 'family', 'green', 'space', 'quiet'], clayton: ['green', 'schools', 'family', 'quiet'], 'panama-pacifico': ['value', 'family', 'space', 'green', 'invest'],
}
const MQ = {
  en: {
    title: 'Find your neighborhood in 20 seconds', sub: 'Three taps. We match you with the areas that fit how you live.',
    q1: 'Who’s moving?', who: [['single', 'Just me'], ['couple', 'A couple'], ['family', 'A family'], ['invest', 'I’m investing']],
    q2: 'What matters most? Pick up to two', pri: [['walk', 'Walk everywhere'], ['views', 'Ocean views'], ['green', 'Green and space'], ['culture', 'Culture and nightlife'], ['schools', 'Great schools'], ['value', 'Best value'], ['luxury', 'Luxury']],
    q3: 'Renting or buying?', op: [['rent', 'Renting'], ['sale', 'Buying']],
    result: 'Your best matches', see: 'See homes', again: 'Start over', send: 'Send me options for these',
    wa: (names: string) => `Hi! The neighborhood matcher suggested ${names}. Can you send me options?`, next: 'Next',
  },
  es: {
    title: 'Encuentra tu zona en 20 segundos', sub: 'Tres toques. Te recomendamos las zonas que encajan con tu forma de vivir.',
    q1: '¿Quién se muda?', who: [['single', 'Solo yo'], ['couple', 'En pareja'], ['family', 'En familia'], ['invest', 'Voy a invertir']],
    q2: '¿Qué es lo más importante? Elige hasta dos', pri: [['walk', 'Caminar a todo'], ['views', 'Vista al mar'], ['green', 'Verde y espacio'], ['culture', 'Cultura y vida nocturna'], ['schools', 'Buenos colegios'], ['value', 'Mejor precio'], ['luxury', 'Lujo']],
    q3: '¿Alquilas o compras?', op: [['rent', 'Alquilo'], ['sale', 'Compro']],
    result: 'Tus mejores zonas', see: 'Ver propiedades', again: 'Empezar de nuevo', send: 'Envíenme opciones en estas zonas',
    wa: (names: string) => `¡Hola! El buscador de zonas me sugirió ${names}. ¿Me envían opciones?`, next: 'Siguiente',
  },
}

export function NeighborhoodMatcher() {
  const { lang, t } = useI18n()
  const { publicProperties } = useStore()
  const C = MQ[lang]
  const [step, setStep] = useState(0)
  const [who, setWho] = useState('')
  const [pri, setPri] = useState<string[]>([])
  const [op, setOp] = useState<'rent' | 'sale'>('rent')

  const results = useMemo(() => {
    const want = [who === 'couple' ? 'single' : who, ...pri, ...pri]
    return NEIGHBORHOODS.filter((n) => n.featured).map((n) => ({ n, score: want.filter((w) => TAGS[n.slug]?.includes(w)).length + publicProperties.filter((p) => p.location === n.slug && p.operation === op).length * 0.1 }))
      .sort((a, b) => b.score - a.score).slice(0, 3)
  }, [who, pri, op, publicProperties])

  const pill = (on: boolean) => `rounded-full px-5 py-3 text-[16px] transition ${on ? 'bg-ink text-white' : 'bg-white ring-1 ring-black/10 hover:ring-black/40'}`
  const reset = () => { setStep(0); setWho(''); setPri([]) }

  return (
    <div className="grid gap-10 rounded-5xl bg-white p-6 ring-1 ring-black/5 sm:p-12 lg:grid-cols-[1fr_1.3fr]">
      <div>
        <h2 className="h-section max-w-[12ch]">{C.title}</h2>
        <p className="mt-5 max-w-[36ch] text-[17px] text-ink-soft">{C.sub}</p>
        <div className="mt-8 flex gap-1.5" aria-hidden>{[0, 1, 2, 3].map((i) => <span key={i} className={`h-1.5 flex-1 rounded-full transition ${i <= step ? 'bg-ink' : 'bg-black/10'}`} />)}</div>
      </div>
      <div className="min-h-[300px]" aria-live="polite">
        {step === 0 && <div className="animate-rise"><p className="text-[20px] font-medium">{C.q1}</p>
          <div className="mt-5 flex flex-wrap gap-2">{C.who.map(([v, l]) => <button key={v} className={pill(who === v)} onClick={() => { setWho(v); setStep(1) }}>{l}</button>)}</div></div>}
        {step === 1 && <div className="animate-rise"><p className="text-[20px] font-medium">{C.q2}</p>
          <div className="mt-5 flex flex-wrap gap-2">{C.pri.map(([v, l]) => {
            const on = pri.includes(v)
            return <button key={v} className={pill(on)} aria-pressed={on} onClick={() => setPri(on ? pri.filter((x) => x !== v) : [...pri, v].slice(-2))}>{l}</button>
          })}</div>
          <button disabled={!pri.length} onClick={() => setStep(2)} className="btn-primary mt-8">{C.next}<ArrowUpRight size={17} /></button></div>}
        {step === 2 && <div className="animate-rise"><p className="text-[20px] font-medium">{C.q3}</p>
          <div className="mt-5 flex flex-wrap gap-2">{C.op.map(([v, l]) => <button key={v} className={pill(op === v)} onClick={() => { setOp(v as 'rent' | 'sale'); setStep(3) }}>{l}</button>)}</div></div>}
        {step === 3 && <div className="animate-rise">
          <p className="text-[20px] font-medium">{C.result}</p>
          <ol className="mt-5 space-y-3">
            {results.map(({ n }, i) => (
              <li key={n.slug}>
                <Link to={`/properties?op=${op}&area=${n.slug}`} className="group flex items-center gap-5 rounded-3xl bg-paper p-5 transition hover:bg-black/5">
                  <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-[15px] font-medium ${i === 0 ? 'bg-brand-400' : 'bg-white'}`}>{i + 1}</span>
                  <span className="min-w-0 flex-1"><span className="font-display block text-[28px] font-semibold leading-none">{n.name}</span><span className="mt-1.5 block truncate text-[14px] text-ink-soft">{tr(n.tagline, lang)}</span></span>
                  <span className="hidden shrink-0 items-center gap-1 text-[14px] sm:flex">{C.see}<ArrowUpRight size={16} className="transition group-hover:rotate-45" /></span>
                </Link>
              </li>
            ))}
          </ol>
          <div className="mt-6 flex flex-wrap gap-3">
            <a href={waLink(C.wa(results.map((r) => r.n.name).join(', ')))} target="_blank" rel="noreferrer" className="btn-wa"><WhatsAppIcon size={16} />{C.send}</a>
            <button onClick={reset} className="btn-ghost"><RotateCcw size={16} />{C.again}</button>
          </div>
          <p className="sr-only">{t.hoods.title}</p>
        </div>}
      </div>
    </div>
  )
}

// ------------------------------------------------------------------ mortgage calculator
const MC = {
  en: { title: 'What would it cost a month?', sub: 'A quick estimate to see what fits. Your bank sets the final rate.', price: 'Home price', down: 'Down payment', rate: 'Interest rate', years: 'Years', monthly: 'Estimated monthly payment', loan: 'Loan amount', ask: 'Ask us about financing', wa: (p: string) => `Hi! I'd like help with financing for a home around ${p}.` },
  es: { title: '¿Cuánto pagarías al mes?', sub: 'Un cálculo rápido para ver qué te conviene. La tasa final la define tu banco.', price: 'Precio de la propiedad', down: 'Abono inicial', rate: 'Tasa de interés', years: 'Años', monthly: 'Pago mensual estimado', loan: 'Monto del préstamo', ask: 'Pregúntanos por financiamiento', wa: (p: string) => `¡Hola! Quisiera ayuda con financiamiento para una propiedad de unos ${p}.` },
}

export function MortgageCalculator({ initialPrice = 350000, compact = false }: { initialPrice?: number; compact?: boolean }) {
  const { lang } = useI18n()
  const C = MC[lang]
  const [price, setPrice] = useState(initialPrice)
  const [down, setDown] = useState(20)
  const [rate, setRate] = useState(7)
  const [years, setYears] = useState(25)
  const loan = price * (1 - down / 100)
  const r = rate / 100 / 12, n = years * 12
  const monthly = r ? (loan * r) / (1 - Math.pow(1 + r, -n)) : loan / n
  const row = (label: string, value: string, input: JSX.Element) => (
    <label className="block">
      <span className="flex justify-between text-[14px]"><span className="text-ink-soft">{label}</span><span className="font-medium">{value}</span></span>
      {input}
    </label>
  )
  const range = 'mt-3 w-full accent-black'
  return (
    <div className={`rounded-5xl bg-white ring-1 ring-black/5 ${compact ? 'p-6' : 'p-6 sm:p-10'}`}>
      {!compact && <><h2 className="h-sub max-w-[14ch]">{C.title}</h2><p className="mt-3 max-w-[40ch] text-[16px] text-ink-soft">{C.sub}</p></>}
      {compact && <p className="font-display text-[28px] font-semibold leading-none">{C.title}</p>}
      <div className="mt-8 space-y-6">
        {row(C.price, money(price, lang), <input type="range" className={range} min={80000} max={2500000} step={5000} value={price} onChange={(e) => setPrice(Number(e.target.value))} />)}
        {row(C.down, `${down}% · ${money(price * down / 100, lang)}`, <input type="range" className={range} min={10} max={60} step={5} value={down} onChange={(e) => setDown(Number(e.target.value))} />)}
        <div className="grid grid-cols-2 gap-6">
          {row(C.rate, `${rate.toFixed(2)}%`, <input type="range" className={range} min={4} max={10} step={0.25} value={rate} onChange={(e) => setRate(Number(e.target.value))} />)}
          {row(C.years, String(years), <input type="range" className={range} min={10} max={30} step={5} value={years} onChange={(e) => setYears(Number(e.target.value))} />)}
        </div>
      </div>
      <div className="mt-8 rounded-3xl bg-ink p-6 text-white">
        <p className="text-[14px] text-white/60">{C.monthly}</p>
        <p className="font-display mt-1 text-[48px] font-semibold leading-none tabular-nums">{money(Math.round(monthly), lang)}</p>
        <p className="mt-2 text-[14px] text-white/50">{C.loan}: {money(Math.round(loan), lang)}</p>
      </div>
      <a href={waLink(C.wa(money(price, lang)))} target="_blank" rel="noreferrer" className="btn-ghost mt-4 w-full"><WhatsAppIcon size={16} />{C.ask}</a>
    </div>
  )
}

// ------------------------------------------------------------------ listing alerts
const AL = {
  en: { title: 'Be first to see new homes', sub: 'Tell us what you’re after. When something fits, we send it to your WhatsApp before it’s published anywhere.', phone: 'Your WhatsApp', op: 'I want to', rent: 'Rent', buy: 'Buy', area: 'Neighborhood', anyArea: 'Anywhere in the city', budget: 'Max budget (USD)', name: 'Your name', submit: 'Turn on alerts', done: 'Alerts are on. We’ll message you when something fits.' },
  es: { title: 'Sé el primero en ver lo nuevo', sub: 'Dinos qué buscas. Cuando algo encaje, te lo enviamos por WhatsApp antes de publicarlo.', phone: 'Tu WhatsApp', op: 'Quiero', rent: 'Alquilar', buy: 'Comprar', area: 'Zona', anyArea: 'Cualquier zona', budget: 'Presupuesto máx. (USD)', name: 'Tu nombre', submit: 'Activar alertas', done: 'Alertas activadas. Te escribimos cuando algo encaje.' },
}

export function AlertsForm() {
  const { lang } = useI18n()
  const { addWebLead } = useStore()
  const C = AL[lang]
  const [f, setF] = useState({ name: '', phone: '', op: 'rent', area: '', budget: '' })
  const [state, setState] = useState<'idle' | 'busy' | 'ok' | 'err'>('idle')
  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setState('busy')
    const ok = await addWebLead({ name: f.name.trim(), phone: f.phone.trim(), interest: f.op === 'rent' ? 'rent' : 'buy', message: `Listing alert · ${f.op === 'rent' ? 'rent' : 'buy'} · ${f.area ? locationName(f.area) : 'any area'}${f.budget ? ` · up to $${f.budget}` : ''}` })
    setState(ok ? 'ok' : 'err')
  }
  return (
    <div className="flex h-full flex-col rounded-5xl bg-brand-400 p-6 sm:p-10">
      <Bell size={26} />
      <h2 className="h-sub mt-6 max-w-[12ch]">{C.title}</h2>
      <p className="mt-3 max-w-[40ch] text-[16px]">{C.sub}</p>
      {state === 'ok' ? <p className="mt-8 flex items-center gap-3 rounded-3xl bg-white/60 p-5 text-[17px]"><Check size={20} />{C.done}</p> : (
        <form onSubmit={submit} className="mt-8 grid gap-3 sm:grid-cols-2">
          <input className="input bg-white/80" placeholder={C.name} aria-label={C.name} required maxLength={120} value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} />
          <input className="input bg-white/80" placeholder={C.phone} aria-label={C.phone} required maxLength={40} inputMode="tel" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} />
          <select className="input bg-white/80" aria-label={C.op} value={f.op} onChange={(e) => setF({ ...f, op: e.target.value })}><option value="rent">{C.rent}</option><option value="sale">{C.buy}</option></select>
          <select className="input bg-white/80" aria-label={C.area} value={f.area} onChange={(e) => setF({ ...f, area: e.target.value })}>
            <option value="">{C.anyArea}</option>{NEIGHBORHOODS.filter((n) => n.featured).map((n) => <option key={n.slug} value={n.slug}>{n.name}</option>)}
          </select>
          <input className="input bg-white/80 sm:col-span-2" placeholder={C.budget} aria-label={C.budget} inputMode="numeric" value={f.budget} onChange={(e) => setF({ ...f, budget: e.target.value.replace(/[^\d]/g, '') })} />
          <button disabled={state === 'busy'} className="btn-primary sm:col-span-2">{C.submit}</button>
        </form>
      )}
    </div>
  )
}

// ------------------------------------------------------------------ live listings strip
export function ListingStrip() {
  const { publicProperties } = useStore()
  const { t, lang } = useI18n()
  const list = publicProperties.slice(0, 12)
  if (list.length < 3) return null
  return (
    <div className="relative overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_8%,#000_92%,transparent)]">
      <div className="flex w-max animate-[drift_80s_linear_infinite] gap-4 py-2 hover:[animation-play-state:paused]">
        {[...list, ...list].map((p, i) => (
          <Link key={p.id + i} to={`/property/${p.id}`} tabIndex={i >= list.length ? -1 : 0} className="group flex w-[300px] shrink-0 items-center gap-3 rounded-[22px] bg-white p-2 pr-4 ring-1 ring-black/5 transition hover:shadow-lift">
            <div className="h-16 w-20 shrink-0 overflow-hidden rounded-2xl bg-paper"><Img src={p.images[0]} alt="" className="h-full w-full" /></div>
            <div className="min-w-0">
              <p className="truncate text-[14px] font-medium">{titleOf(p, lang)}</p>
              <p className="truncate text-[13px] text-ink-soft">{locationName(p.location)} · {money(p.price, lang)}{p.operation === 'rent' ? t.common.perMonth : ''}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
