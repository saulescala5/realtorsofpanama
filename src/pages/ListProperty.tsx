import { useState } from 'react'
import { MessageCircle } from 'lucide-react'
import { useI18n } from '@/i18n'
import { useStore } from '@/lib/store'
import { waLink } from '@/lib/whatsapp'
import type { PropertyType } from '@/lib/types'

const TYPES: PropertyType[] = ['apartment', 'penthouse', 'house', 'studio', 'land', 'commercial', 'office']

export default function ListProperty() {
  const { t } = useI18n()
  const { addWebLead } = useStore()
  const L = t.list
  const [f, setF] = useState({ name: '', phone: '', op: 'rent_out', type: 'apartment', where: '', price: '', details: '' })
  const [state, setState] = useState<'idle' | 'busy' | 'ok' | 'err'>('idle')
  const set = (k: keyof typeof f, v: string) => setF((x) => ({ ...x, [k]: v }))

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setState('busy')
    const message = [`${f.op === 'sell' ? L.sell : L.rentOut} · ${t.types[f.type as PropertyType]}`, f.where && `${L.where}: ${f.where}`, f.price && `${L.price}: ${f.price}`, f.details].filter(Boolean).join('\n')
    const ok = await addWebLead({ name: f.name.trim(), phone: f.phone.trim(), interest: f.op, message })
    setState(ok ? 'ok' : 'err')
  }

  return (
    <div className="container-x grid gap-12 py-14 lg:grid-cols-[1fr_440px]">
      <div>
                <h1 className="h-display max-w-[11ch]">{L.title}</h1>
        <p className="mt-6 max-w-[48ch] text-[18px] text-ink-soft">{L.sub}</p>
        <ol className="mt-8 space-y-4">
          {L.steps.map((s, i) => (
            <li key={s} className="flex items-center gap-4">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-ink text-[15px] font-medium text-white">{i + 1}</span>
              <span className="text-[18px]">{s}</span>
            </li>
          ))}
        </ol>
        <a href={waLink(L.waText)} target="_blank" rel="noreferrer" className="btn-wa mt-10"><MessageCircle size={17} />{L.orWa}</a>
      </div>

      <div className="card p-6 sm:p-8 lg:self-start">
        {state === 'ok' ? <p className="rounded-xl bg-mint-400/15 px-4 py-6 text-center font-semibold text-mint-600">{L.done}</p> : (
          <form onSubmit={submit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div><label className="label">{L.name}</label><input className="input" required maxLength={120} value={f.name} onChange={(e) => set('name', e.target.value)} /></div>
              <div><label className="label">{L.phone}</label><input className="input" required maxLength={40} inputMode="tel" placeholder="+507" value={f.phone} onChange={(e) => set('phone', e.target.value)} /></div>
            </div>
            <div>
              <label className="label">{L.operation}</label>
              <div className="flex gap-1 rounded-full bg-paper p-1 ring-1 ring-black/10">
                {([['rent_out', L.rentOut], ['sell', L.sell]] as const).map(([v, l]) => (
                  <button key={v} type="button" onClick={() => set('op', v)} className={`h-10 flex-1 rounded-full text-[14px] font-medium ${f.op === v ? 'bg-white shadow-sm' : 'text-ink-soft'}`}>{l}</button>
                ))}
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div><label className="label">{L.type}</label>
                <select className="input" value={f.type} onChange={(e) => set('type', e.target.value)}>{TYPES.map((x) => <option key={x} value={x}>{t.types[x]}</option>)}</select></div>
              <div><label className="label">{L.price}</label><input className="input" inputMode="numeric" value={f.price} onChange={(e) => set('price', e.target.value)} /></div>
            </div>
            <div><label className="label">{L.where}</label><input className="input" maxLength={200} value={f.where} onChange={(e) => set('where', e.target.value)} /></div>
            <div><label className="label">{L.details}</label><textarea className="input h-24 py-3" maxLength={1500} value={f.details} onChange={(e) => set('details', e.target.value)} /></div>
            <button disabled={state === 'busy'} className="btn-primary w-full">{L.submit}</button>
            {state === 'err' && <p className="text-sm text-rose-600">{t.property.error}</p>}
          </form>
        )}
      </div>
    </div>
  )
}
