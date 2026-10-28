import { useState } from 'react'
import { MessageCircle } from 'lucide-react'
import { useI18n } from '@/i18n'
import { useStore } from '@/lib/store'
import { waLink } from '@/lib/whatsapp'

export default function Network() {
  const { t } = useI18n()
  const { addWebLead } = useStore()
  const N = t.network
  const [f, setF] = useState({ name: '', company: '', phone: '', role: N.roles[0], message: '' })
  const [state, setState] = useState<'idle' | 'busy' | 'ok' | 'err'>('idle')
  const set = (k: keyof typeof f, v: string) => setF((x) => ({ ...x, [k]: v }))

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setState('busy')
    const ok = await addWebLead({ name: f.name.trim(), phone: f.phone.trim(), interest: 'broker', message: [`${N.role}: ${f.role}`, f.company && `${N.company.replace(/ \(.*\)/, '')}: ${f.company}`, f.message].filter(Boolean).join('\n') })
    setState(ok ? 'ok' : 'err')
  }

  return (
    <>
      <section className="bg-night text-white">
        <div className="container-x py-20 sm:py-28">
          <h1 className="h-display max-w-[16ch]">{N.title}</h1>
          <p className="mt-6 max-w-[56ch] text-[17px] text-white/70">{N.sub}</p>
        </div>
      </section>
      <section className="container-x grid gap-16 py-16 sm:py-24 lg:grid-cols-[1.1fr_1fr]">
        <dl className="grid gap-x-10 gap-y-10 sm:grid-cols-2 lg:self-start">
          {N.who.map((w) => (
            <div key={w.t} className="border-t border-ink pt-5">
              <dt className="font-display text-[22px]">{w.t}</dt>
              <dd className="mt-2 text-[15px] text-ink-soft">{w.d}</dd>
            </div>
          ))}
        </dl>
        <div className="bg-canvas p-6 sm:p-8">
          <h2 className="font-display text-[26px]">{N.form}</h2>
          {state === 'ok' ? <p className="mt-6 text-[17px]">{N.done}</p> : (
            <form onSubmit={submit} className="mt-6 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div><label className="label" htmlFor="nw-name">{N.name}</label><input id="nw-name" className="input" required maxLength={120} value={f.name} onChange={(e) => set('name', e.target.value)} /></div>
                <div><label className="label" htmlFor="nw-phone">{N.phone}</label><input id="nw-phone" className="input" required maxLength={40} inputMode="tel" placeholder="+507" value={f.phone} onChange={(e) => set('phone', e.target.value)} /></div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div><label className="label" htmlFor="nw-role">{N.role}</label>
                  <select id="nw-role" className="input" value={f.role} onChange={(e) => set('role', e.target.value)}>{N.roles.map((r) => <option key={r}>{r}</option>)}</select></div>
                <div><label className="label" htmlFor="nw-co">{N.company}</label><input id="nw-co" className="input" maxLength={120} value={f.company} onChange={(e) => set('company', e.target.value)} /></div>
              </div>
              <div><label className="label" htmlFor="nw-msg">{N.message}</label><textarea id="nw-msg" className="input h-28 py-3" maxLength={1500} value={f.message} onChange={(e) => set('message', e.target.value)} /></div>
              <button disabled={state === 'busy'} className="btn-primary w-full">{N.submit}</button>
              {state === 'err' && <p className="text-sm text-rose-700">{t.property.error}</p>}
            </form>
          )}
          <a href={waLink(N.waText)} target="_blank" rel="noreferrer" className="mt-6 inline-flex items-center gap-2 text-[14px] text-ink-soft hover:text-ink"><MessageCircle size={16} className="text-mint-500" />{N.wa}</a>
        </div>
      </section>
    </>
  )
}
