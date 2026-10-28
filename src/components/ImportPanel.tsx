import { useState } from 'react'
import { Link2, ClipboardPaste, Loader2, CheckCircle2, AlertTriangle, Download } from 'lucide-react'
import { useI18n } from '@/i18n'
import { importFromUrl, parseListingText, type ImportedListing } from '@/lib/importer'

type Mode = 'link' | 'text'

/** "Already listed elsewhere?" — pre-fills the listing form from a link or pasted text. */
export function ImportPanel({ onImport }: { onImport: (listing: ImportedListing, source: string) => void }) {
  const { t } = useI18n()
  const I = t.admin.import
  const [mode, setMode] = useState<Mode>('link')
  const [url, setUrl] = useState('')
  const [text, setText] = useState('')
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null)

  const run = async () => {
    setMsg(null)
    if (mode === 'text') {
      const listing = parseListingText(text)
      const firstLine = text.trim().split('\n')[0]?.slice(0, 120)
      const full: ImportedListing = { title: firstLine, description: text.trim().slice(0, 2000), ...listing }
      const n = Object.keys(listing).length
      if (!n) return setMsg({ ok: false, text: I.nothing })
      onImport(full, '')
      return setMsg({ ok: true, text: I.doneText(n) })
    }
    if (!/^https?:\/\/\S+\.\S+/.test(url.trim())) return setMsg({ ok: false, text: I.invalidUrl })
    setBusy(true)
    const r = await importFromUrl(url.trim())
    setBusy(false)
    if (r.ok) {
      onImport(r.listing, url.trim())
      setMsg({ ok: true, text: I.done(r.fields, r.source) })
    } else {
      setMsg({ ok: false, text: r.reason === 'blocked' ? I.blocked(r.source) : r.reason === 'invalid' ? I.invalidUrl : r.reason === 'nothing' ? I.nothing : I.failed })
      if (r.reason === 'blocked' || r.reason === 'nothing') setMode('text')
    }
  }

  const tab = (m: Mode) => `flex h-9 flex-1 items-center justify-center gap-1.5 rounded-lg text-sm font-semibold transition ${mode === m ? 'bg-white shadow-sm' : 'text-ink-soft'}`
  const ready = (mode === 'link' ? url.trim() : text.trim().length > 20)

  return (
    <section className="overflow-hidden rounded-3xl ring-1 ring-line">
      <div className="rounded-[23px] bg-white p-6">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600"><Download size={19} /></span>
          <div>
            <h2 className="font-extrabold">{I.title}</h2>
            <p className="mt-0.5 text-sm text-ink-soft">{I.sub}</p>
          </div>
        </div>

        <div className="mt-5 flex max-w-xs gap-1 rounded-xl bg-canvas p-1 ring-1 ring-line">
          <button type="button" className={tab('link')} onClick={() => setMode('link')}><Link2 size={15} />{I.link}</button>
          <button type="button" className={tab('text')} onClick={() => setMode('text')}><ClipboardPaste size={15} />{I.text}</button>
        </div>

        <div className="mt-3">
          {mode === 'link'
            ? <input className="input" type="url" inputMode="url" placeholder={I.urlPh} value={url} onChange={(e) => setUrl(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && ready && !busy && run()} />
            : <textarea className="input h-32 py-3" placeholder={I.textPh} value={text} onChange={(e) => setText(e.target.value)} />}
        </div>


        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button type="button" disabled={!ready || busy} onClick={run} className="btn-primary">
            {busy ? <><Loader2 size={16} className="animate-spin" />{I.loading}</> : I.cta}
          </button>
          {msg && (
            <p className={`flex items-start gap-1.5 text-sm ${msg.ok ? 'text-mint-600' : 'text-amber-700'}`}>
              {msg.ok ? <CheckCircle2 size={16} className="mt-0.5 shrink-0" /> : <AlertTriangle size={16} className="mt-0.5 shrink-0" />}{msg.text}
            </p>
          )}
        </div>
      </div>
    </section>
  )
}
