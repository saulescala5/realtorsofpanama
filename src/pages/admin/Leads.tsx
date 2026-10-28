import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Search, X, MessageCircle, Flame, Users, Home as HomeIcon, Bot, Globe } from 'lucide-react'
import { useI18n } from '@/i18n'
import { useStore } from '@/lib/store'
import { timeAgo } from '@/lib/format'
import type { Lead, LeadStage } from '@/lib/types'
import { Avatar, Empty, PageHeader } from '@/components/ui'

const STAGES: LeadStage[] = ['new', 'contacted', 'showing', 'negotiating', 'won', 'lost']
const DOT: Record<LeadStage, string> = { new: 'bg-brand-400', contacted: 'bg-sky-400', showing: 'bg-sun-500', negotiating: 'bg-violet-500', won: 'bg-mint-500', lost: 'bg-ink-mute' }
const SCORE: Record<string, string> = { hot: 'bg-rose-50 text-rose-600', warm: 'bg-sun-400/20 text-amber-700', cold: 'bg-ink/5 text-ink-soft' }

function ScoreChip({ score }: { score?: string }) {
  const { t } = useI18n()
  if (!score) return null
  return <span className={`chip ${SCORE[score] ?? SCORE.cold}`}>{score === 'hot' && <Flame size={11} />}{t.admin.leads.score[score] ?? score}</span>
}

function Drawer({ lead, onClose }: { lead: Lead; onClose: () => void }) {
  const { t, lang } = useI18n()
  const { properties, updateLead } = useStore()
  const L = t.admin.leads
  const [notes, setNotes] = useState(lead.myNotes ?? '')
  const p = properties.find((x) => x.id === lead.propertyId)
  const F = L.fields
  const facts = ([
    [F.budget, lead.budget], [F.areas, lead.areas], [F.bedrooms, lead.bedrooms], [F.type, lead.propertyType],
    [F.timeline, lead.timeline], [F.financing, lead.financing], [F.email, lead.email],
  ] as [string, string | undefined][]).filter(([, v]) => v)
  const blocks = ([[L.sofia, lead.sofiaNotes], [F.message, lead.message], [F.listingsSent, lead.listingsSent], [F.lastMessage, lead.lastMessage], [F.ad, lead.sourceAd]] as [string, string | undefined][]).filter(([, v]) => v)

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-ink/30 backdrop-blur-[2px]" onClick={onClose}>
      <div className="flex h-full w-full max-w-lg animate-rise flex-col bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start gap-3 border-b border-line p-5">
          <Avatar name={lead.name} className="h-12 w-12 text-sm" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-lg font-extrabold">{lead.name}</p>
            <p className="text-sm text-ink-soft">{[lead.phone, timeAgo(lead.createdAt, lang)].filter(Boolean).join(' · ')}</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              <ScoreChip score={lead.score} />
              {lead.interest && <span className="chip bg-brand-50 text-brand-700">{L.interest[lead.interest] ?? lead.interest}</span>}
              <span className="chip bg-canvas text-ink-soft">{lead.source === 'whatsapp' ? <><Bot size={11} />{L.fromSofia}{lead.botStage ? ` · ${lead.botStage}` : ''}</> : <><Globe size={11} />{L.fromWeb}</>}</span>
            </div>
          </div>
          <button onClick={onClose} className="rounded-full p-1.5 hover:bg-canvas" aria-label="Close"><X size={18} /></button>
        </div>

        <div className="flex-1 space-y-6 overflow-y-auto p-5">
          <div className="flex flex-wrap gap-1.5">
            {STAGES.map((s) => (
              <button key={s} onClick={() => updateLead(lead.id, { stage: s })}
                className={`chip ring-1 transition ${lead.stage === s ? 'bg-ink text-white ring-ink' : 'text-ink-soft ring-line hover:ring-ink/30'}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${DOT[s]}`} />{L.stages[s]}
              </button>
            ))}
          </div>
          {facts.length > 0 && <div className="grid grid-cols-2 gap-2">
            {facts.map(([l, v]) => (
              <div key={l} className="rounded-2xl bg-canvas p-3">
                <p className="text-[11px] font-bold uppercase tracking-wide text-ink-mute">{l}</p>
                <p className="mt-1 text-sm font-bold">{v}</p>
              </div>
            ))}
          </div>}
          {p && (
            <Link to={`/property/${p.id}`} className="flex items-center gap-3 rounded-2xl p-3 ring-1 ring-line hover:bg-canvas">
              <HomeIcon size={18} className="shrink-0 text-brand-500" />
              <div className="min-w-0"><p className="text-[11px] font-bold uppercase tracking-wide text-ink-mute">{F.property}</p><p className="truncate text-sm font-semibold">{p.title}</p></div>
            </Link>
          )}
          {blocks.map(([l, v]) => (
            <div key={l}><p className="mb-1 text-sm font-extrabold">{l}</p><p className="whitespace-pre-line rounded-2xl bg-canvas p-3 text-sm text-ink-soft">{v}</p></div>
          ))}
          <div>
            <label className="mb-2 block text-sm font-extrabold">{L.myNotes}</label>
            <textarea className="input h-28 py-3" value={notes} onChange={(e) => setNotes(e.target.value)} onBlur={() => notes !== (lead.myNotes ?? '') && updateLead(lead.id, { myNotes: notes })} />
          </div>
        </div>
        {lead.phone && <div className="border-t border-line p-4">
          <a href={`https://wa.me/${lead.phone.replace(/\D/g, '')}`} target="_blank" rel="noreferrer" className="btn-wa w-full"><MessageCircle size={17} />{L.openWa}</a>
        </div>}
      </div>
    </div>
  )
}

export default function Leads() {
  const { t, lang } = useI18n()
  const { leads } = useStore()
  const L = t.admin.leads
  const [params, setParams] = useSearchParams()
  const [q, setQ] = useState('')
  const stage = params.get('stage') ?? ''
  const src = params.get('src') ?? ''
  const hot = params.get('hot') === '1'
  const open = leads.find((l) => l.id === params.get('open'))
  const set = (k: string, v: string) => { const n = new URLSearchParams(params); if (v) n.set(k, v); else n.delete(k); setParams(n, { replace: true }) }

  const list = useMemo(() => {
    const needle = q.toLowerCase()
    return leads
      .filter((l) => !stage || l.stage === stage)
      .filter((l) => !src || l.source === src)
      .filter((l) => !hot || l.score === 'hot')
      .filter((l) => !needle || `${l.name} ${l.phone ?? ''} ${l.areas ?? ''} ${l.sofiaNotes ?? ''} ${l.message ?? ''}`.toLowerCase().includes(needle))
  }, [leads, q, stage, src, hot])

  const pill = (a: boolean) => `h-8 shrink-0 rounded-full px-3 text-[13px] font-semibold transition ${a ? 'bg-ink text-white' : 'bg-white text-ink-soft ring-1 ring-line hover:text-ink'}`

  return (
    <>
      <PageHeader title={L.title} sub={L.sub} />
      <div className="mb-4 flex flex-col gap-3">
        <label className="flex h-11 items-center gap-2 rounded-full bg-white px-4 ring-1 ring-line focus-within:ring-2 focus-within:ring-brand-400 sm:max-w-sm">
          <Search size={17} className="text-ink-mute" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={L.search} className="h-full flex-1 bg-transparent text-sm outline-none" />
        </label>
        <div className="no-scrollbar flex gap-2 overflow-x-auto">
          <button className={pill(!stage)} onClick={() => set('stage', '')}>{L.all} · {leads.length}</button>
          {STAGES.map((s) => <button key={s} className={pill(stage === s)} onClick={() => set('stage', s)}>{L.stages[s]} · {leads.filter((l) => l.stage === s).length}</button>)}
          <span className="mx-1 w-px shrink-0 bg-line" />
          <button className={pill(hot)} onClick={() => set('hot', hot ? '' : '1')}><Flame size={12} className="mr-1 inline" />{L.onlyHot}</button>
          <button className={pill(src === 'whatsapp')} onClick={() => set('src', src === 'whatsapp' ? '' : 'whatsapp')}>{L.fromSofia}</button>
          <button className={pill(src === 'web')} onClick={() => set('src', src === 'web' ? '' : 'web')}>{L.fromWeb}</button>
        </div>
      </div>

      {list.length === 0 ? <Empty icon={<Users size={22} />} text={L.empty} /> : (
        <div className="card divide-y divide-line">
          {list.map((l) => (
            <button key={l.id} onClick={() => set('open', l.id)} className="flex w-full items-center gap-3 p-4 text-left hover:bg-canvas/70">
              <Avatar name={l.name} />
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-2 truncate font-semibold">{l.name}<ScoreChip score={l.score} /></p>
                <p className="truncate text-sm text-ink-soft">{[l.interest && (L.interest[l.interest] ?? l.interest), l.areas, l.budget, l.timeline].filter(Boolean).join(' · ') || l.message || l.lastMessage}</p>
              </div>
              <span className="chip hidden bg-canvas text-ink-soft sm:inline-flex"><span className={`h-1.5 w-1.5 rounded-full ${DOT[l.stage]}`} />{L.stages[l.stage]}</span>
              <span className="hidden w-24 text-right text-xs text-ink-mute md:block">{timeAgo(l.updatedAt, lang)}</span>
            </button>
          ))}
        </div>
      )}
      {open && <Drawer key={open.id} lead={open} onClose={() => set('open', '')} />}
    </>
  )
}
