import { useState, type ReactNode, type ImgHTMLAttributes } from 'react'
import { Link } from 'react-router-dom'
import { Building2, Check } from 'lucide-react'
import { initials } from '@/lib/format'

export function Logo({ white = false, to = '/' }: { white?: boolean; to?: string }) {
  return (
    <Link to={to} className="flex shrink-0 items-center" aria-label="Realtors of Panama">
      <img src={white ? '/brand/logo-white.png' : '/brand/logo.png'} alt="Realtors of Panama" draggable={false} className="h-7 w-auto" />
    </Link>
  )
}

const FALLBACK = 'linear-gradient(160deg,#F3F2EF 0%,#E9E7E1 100%)'

/** Image with a branded gradient fallback when the remote file is missing. */
export function Img({ className = '', ...rest }: ImgHTMLAttributes<HTMLImageElement>) {
  const [broken, setBroken] = useState(false)
  if (broken || !rest.src) return <div className={`${className} flex items-center justify-center`} style={{ background: FALLBACK }}><Building2 className="h-9 w-9 text-ink/15" strokeWidth={1.25} /></div>
  return <img loading="lazy" {...rest} className={`${className} object-cover`} onError={() => setBroken(true)} />
}

export function Avatar({ name, className = 'h-9 w-9 text-xs' }: { name: string; className?: string }) {
  const hue = [...name].reduce((a, c) => a + c.charCodeAt(0), 0) % 4
  const tones = ['bg-brand-100 text-brand-700', 'bg-mint-400/20 text-mint-600', 'bg-sun-400/25 text-amber-700', 'bg-ink/5 text-ink']
  return <span className={`inline-flex shrink-0 items-center justify-center rounded-full font-bold ${tones[hue]} ${className}`}>{initials(name)}</span>
}

export function ScoreBadge({ score }: { score: number }) {
  const tone = score >= 75 ? 'bg-mint-400/15 text-mint-600' : score >= 50 ? 'bg-sun-400/20 text-amber-700' : 'bg-ink/5 text-ink-soft'
  return <span className={`chip ${tone} tabular-nums`}><span className="h-1.5 w-1.5 rounded-full bg-current" />{score}</span>
}

export function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label?: ReactNode }) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-4 py-1.5 text-sm">
      {label && <span className="font-medium">{label}</span>}
      <button type="button" role="switch" aria-checked={checked} onClick={() => onChange(!checked)}
        className={`relative h-6 w-11 shrink-0 rounded-full transition ${checked ? 'bg-brand-500' : 'bg-ink/15'}`}>
        <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${checked ? 'left-[22px]' : 'left-0.5'}`} />
      </button>
    </label>
  )
}

export function PageHeader({ title, sub, action }: { title: string; sub?: string; action?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight sm:text-[28px]">{title}</h1>
        {sub && <p className="mt-1 text-sm text-ink-soft">{sub}</p>}
      </div>
      {action}
    </div>
  )
}

export function Empty({ icon, text, action }: { icon: ReactNode; text: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-line bg-canvas/60 px-6 py-14 text-center">
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-brand-500 shadow-soft">{icon}</div>
      <p className="max-w-sm text-sm text-ink-soft">{text}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}

export function CheckItem({ children, light = false }: { children: ReactNode; light?: boolean }) {
  return (
    <li className="flex items-start gap-2.5 text-sm">
      <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${light ? 'bg-white/15 text-white' : 'bg-brand-50 text-brand-600'}`}><Check size={13} strokeWidth={3} /></span>
      <span>{children}</span>
    </li>
  )
}

export function Toast({ text }: { text: string | null }) {
  if (!text) return null
  return (
    <div className="fixed bottom-6 left-1/2 z-[60] -translate-x-1/2 animate-rise rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white shadow-lift">
      {text}
    </div>
  )
}

export function useToast() {
  const [text, setText] = useState<string | null>(null)
  const show = (t: string) => { setText(t); window.setTimeout(() => setText(null), 2600) }
  return { text, show }
}
