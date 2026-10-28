import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowUpRight, Sparkles } from 'lucide-react'
import { useI18n } from '@/i18n'
import { parseQuery } from '@/lib/nlsearch'

const EXAMPLES = {
  en: ['2 bedrooms in Punta Pacífica under $2,000', 'A house in Costa del Este to buy', 'Furnished studio near Calle 50', 'Penthouse with ocean view', 'Invest in Casco Viejo under $400k'],
  es: ['2 recámaras en Punta Pacífica hasta $2,000', 'Casa en Costa del Este para comprar', 'Estudio amoblado cerca de Calle 50', 'Penthouse con vista al mar', 'Invertir en Casco Viejo hasta $400k'],
}

/** Placeholder that types example searches, one after another. */
function useTyped(list: string[]) {
  const [text, setText] = useState('')
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { setText(list[0]); return }
    let i = 0, c = 0, del = false, timer = 0
    const tick = () => {
      const w = list[i % list.length]
      c += del ? -1 : 1
      setText(w.slice(0, c))
      if (!del && c === w.length) { del = true; timer = window.setTimeout(tick, 1800); return }
      if (del && c === 0) { del = false; i++ }
      timer = window.setTimeout(tick, del ? 22 : 48)
    }
    timer = window.setTimeout(tick, 400)
    return () => window.clearTimeout(timer)
  }, [list])
  return text
}

export function SmartSearch({ dark = true, onFocusArea }: { dark?: boolean; onFocusArea?: (slug: string | null) => void }) {
  const { lang } = useI18n()
  const nav = useNavigate()
  const [q, setQ] = useState('')
  const typed = useTyped(EXAMPLES[lang])
  useEffect(() => { onFocusArea?.(q ? parseQuery(q).get('area') : null) }, [q]) // eslint-disable-line react-hooks/exhaustive-deps
  const go = () => nav(`/properties?${parseQuery(q || EXAMPLES[lang][0]).toString()}`)
  const label = lang === 'es' ? 'Describe la propiedad que buscas' : 'Describe the home you want'
  return (
    <form onSubmit={(e) => { e.preventDefault(); go() }}
      className={`group flex w-full items-center gap-3 rounded-full p-2 pl-5 transition ${dark ? 'bg-white/[.07] ring-1 ring-white/15 backdrop-blur-xl focus-within:ring-[#E3C46E]/70' : 'bg-white ring-1 ring-black/10 shadow-[0_20px_60px_-30px_rgba(0,0,0,.35)] focus-within:ring-black/40'}`}>
      <Sparkles size={18} className={dark ? 'shrink-0 text-[#E3C46E]' : 'shrink-0 text-black'} />
      <input value={q} onChange={(e) => setQ(e.target.value)} aria-label={label} placeholder={typed + '▍'}
        className={`h-12 min-w-0 flex-1 bg-transparent text-[16px] outline-none sm:text-[17px] ${dark ? 'text-white placeholder:text-white/45' : 'text-black placeholder:text-black/40'}`} style={{ fontFamily: '"Inter Tight", system-ui' }} />
      <button aria-label={lang === 'es' ? 'Buscar' : 'Search'} className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full transition group-focus-within:scale-105 ${dark ? 'bg-[#E3C46E] text-black' : 'bg-black text-white'}`}>
        <ArrowUpRight size={20} />
      </button>
    </form>
  )
}
