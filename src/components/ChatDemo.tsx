import { useEffect, useRef, useState } from 'react'
import { Check, CheckCheck, BadgeCheck, CalendarCheck, Phone, Video, ChevronLeft } from 'lucide-react'
import { useI18n } from '@/i18n'
import { WhatsAppIcon } from './icons'

type Msg =
  | { k: 'in' | 'out'; who?: 'bot' | 'agent'; text: string }
  | { k: 'home'; img: string; title: string; meta: string; price: string }
  | { k: 'chips'; items: string[]; pick: number }
  | { k: 'event'; icon: 'calendar' | 'agent'; text: string }

const SCRIPT: Record<'en' | 'es', Msg[]> = {
  en: [
    { k: 'out', text: 'Hi! I’m moving to Panama in December. Looking for a 2-bedroom to rent near the ocean, around $2,200.' },
    { k: 'in', who: 'bot', text: 'Welcome to Realtors of Panama 👋 I checked our network: 3 verified homes fit. Here’s the best match.' },
    { k: 'home', img: '/samples/sample-01.jpg', title: 'Ocean-view 2BR · Punta Pacífica', meta: '2 bd · 2 ba · 125 m² · furnished', price: '$2,400/mo' },
    { k: 'out', text: 'Love it. Can I see it this week?' },
    { k: 'in', who: 'bot', text: 'Of course. Which time works for you?' },
    { k: 'chips', items: ['Thu 4:00 pm', 'Fri 10:00 am', 'Sat 11:00 am'], pick: 0 },
    { k: 'event', icon: 'calendar', text: 'Visit scheduled · Thursday 4:00 pm' },
    { k: 'event', icon: 'agent', text: 'Daniela, licensed agent, joined the chat' },
    { k: 'in', who: 'agent', text: 'Hi! I’m Daniela. I’ll meet you in the lobby on Thursday and walk you through the lease and the documents you’ll need.' },
    { k: 'out', text: 'Perfect, thank you! 🙌' },
  ],
  es: [
    { k: 'out', text: '¡Hola! Me mudo a Panamá en diciembre. Busco alquilar un 2 recámaras cerca del mar, unos $2,200.' },
    { k: 'in', who: 'bot', text: 'Bienvenido a Realtors of Panama 👋 Revisé nuestra red: 3 propiedades verificadas encajan. Esta es la mejor.' },
    { k: 'home', img: '/samples/sample-01.jpg', title: '2 rec. con vista al mar · Punta Pacífica', meta: '2 rec · 2 baños · 125 m² · amoblado', price: '$2,400/mes' },
    { k: 'out', text: 'Me encanta. ¿Puedo verlo esta semana?' },
    { k: 'in', who: 'bot', text: 'Claro. ¿Qué horario te queda mejor?' },
    { k: 'chips', items: ['Jue 4:00 pm', 'Vie 10:00 am', 'Sáb 11:00 am'], pick: 0 },
    { k: 'event', icon: 'calendar', text: 'Visita agendada · jueves 4:00 pm' },
    { k: 'event', icon: 'agent', text: 'Daniela, agente con licencia, se unió al chat' },
    { k: 'in', who: 'agent', text: '¡Hola! Soy Daniela. Te espero en el lobby el jueves y te explico el contrato y los documentos que necesitas.' },
    { k: 'out', text: '¡Perfecto, gracias! 🙌' },
  ],
}
const T = {
  en: { name: 'Realtors of Panama', online: 'online', typing: 'typing…', bot: 'Assistant', agent: 'Licensed agent', example: 'Example conversation', msg: 'Message' },
  es: { name: 'Realtors of Panama', online: 'en línea', typing: 'escribiendo…', bot: 'Asistente', agent: 'Agente con licencia', example: 'Conversación de ejemplo', msg: 'Mensaje' },
}

/** A WhatsApp-style chat that plays itself on a loop. Shows the whole script at once if the user prefers reduced motion. */
export function ChatDemo() {
  const { lang } = useI18n()
  const script = SCRIPT[lang]
  const L = T[lang]
  const reduce = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  const [shown, setShown] = useState(reduce ? script.length : 0)
  const [typing, setTyping] = useState(false)
  const box = useRef<HTMLDivElement>(null)

  useEffect(() => { setShown(reduce ? script.length : 0) }, [lang]) // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (reduce) return
    if (shown >= script.length) { const r = setTimeout(() => setShown(0), 5200); return () => clearTimeout(r) }
    const next = script[shown]
    const incoming = next.k === 'in' || next.k === 'home'
    const wait = shown === 0 ? 900 : next.k === 'event' ? 1100 : incoming ? 1500 : 1300
    if (incoming) setTyping(true)
    const id = setTimeout(() => { setTyping(false); setShown((n) => n + 1) }, wait)
    return () => clearTimeout(id)
  }, [shown, script, reduce])
  useEffect(() => { const el = box.current; if (el) el.scrollTo({ top: el.scrollHeight, behavior: reduce ? 'auto' : 'smooth' }) }, [shown, typing, reduce])

  const agentOn = script.slice(0, shown).some((m) => m.k === 'event' && m.icon === 'agent')

  return (
    <div className="relative mx-auto w-full max-w-[400px]" aria-label={L.example} role="img">
      <div className="absolute -inset-6 -z-10 rounded-[60px] bg-gradient-to-br from-brand-300/50 via-white/0 to-mint-400/30 blur-2xl" />
      <div className="overflow-hidden rounded-[40px] bg-[#0B141A] p-2.5 shadow-[0_50px_100px_-40px_rgba(0,0,0,.6)] ring-1 ring-black/10">
        <div className="overflow-hidden rounded-[32px] bg-[#EFE7DE]">
          {/* header */}
          <div className="flex items-center gap-2.5 bg-[#075E54] px-3 py-3 text-white">
            <ChevronLeft size={20} className="opacity-80" />
            <span className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white"><img src="/brand/icon.png" alt="" className="h-7 w-7 object-contain" /></span>
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-1 truncate text-[15px] font-medium leading-tight">{L.name}<BadgeCheck size={15} className="shrink-0 text-[#25D366]" fill="white" /></p>
              <p className="text-[12px] leading-tight text-white/75">{typing ? L.typing : agentOn ? `${L.bot} + Daniela` : L.online}</p>
            </div>
            <Video size={19} className="opacity-80" /><Phone size={17} className="ml-3 opacity-80" />
          </div>

          {/* messages */}
          <div ref={box} className="no-scrollbar h-[460px] space-y-2 overflow-y-auto px-3 py-4 [background-image:radial-gradient(rgba(0,0,0,.035)_1px,transparent_1px)] [background-size:14px_14px]">
            <p className="mx-auto w-fit rounded-lg bg-white/80 px-2.5 py-1 text-[11px] text-black/50 shadow-sm">{L.example}</p>
            {script.slice(0, shown).map((m, i) => {
              const anim = 'animate-[chatin_.35s_cubic-bezier(.2,.8,.2,1)_both]'
              if (m.k === 'out') return (
                <div key={i} className={`ml-auto max-w-[82%] rounded-2xl rounded-tr-md bg-[#D9FDD3] px-3 py-2 text-[13.5px] leading-snug text-black/85 shadow-sm ${anim}`}>
                  {m.text}<span className="ml-2 inline-flex translate-y-0.5 items-center gap-0.5 text-[10px] text-black/40">9:4{i}<CheckCheck size={13} className="text-[#53BDEB]" /></span>
                </div>
              )
              if (m.k === 'in') return (
                <div key={i} className={`max-w-[84%] rounded-2xl rounded-tl-md bg-white px-3 py-2 text-[13.5px] leading-snug text-black/85 shadow-sm ${anim}`}>
                  <p className={`mb-0.5 text-[11.5px] font-semibold ${m.who === 'agent' ? 'text-[#B7791F]' : 'text-[#128C7E]'}`}>{m.who === 'agent' ? `Daniela · ${L.agent}` : L.bot}</p>
                  {m.text}<span className="ml-2 text-[10px] text-black/40">9:4{i}</span>
                </div>
              )
              if (m.k === 'home') return (
                <div key={i} className={`w-[78%] overflow-hidden rounded-2xl rounded-tl-md bg-white shadow-sm ${anim}`}>
                  <img src={m.img} alt="" className="h-32 w-full object-cover" />
                  <div className="px-3 py-2.5">
                    <p className="flex items-center gap-1 text-[11px] font-semibold text-[#128C7E]"><BadgeCheck size={13} />{lang === 'es' ? 'Disponibilidad verificada hoy' : 'Availability verified today'}</p>
                    <p className="mt-1 text-[13.5px] font-semibold leading-tight text-black/85">{m.title}</p>
                    <p className="mt-0.5 text-[12px] text-black/50">{m.meta}</p>
                    <p className="mt-1.5 text-[15px] font-semibold text-black">{m.price}</p>
                  </div>
                </div>
              )
              if (m.k === 'chips') return (
                <div key={i} className={`flex flex-wrap gap-1.5 ${anim}`}>
                  {m.items.map((c, j) => <span key={c} className={`rounded-full px-3 py-1.5 text-[12.5px] font-medium shadow-sm transition ${j === m.pick ? 'bg-[#128C7E] text-white' : 'bg-white text-[#128C7E]'}`}>{j === m.pick && <Check size={12} className="-mt-0.5 mr-1 inline" />}{c}</span>)}
                </div>
              )
              return (
                <p key={i} className={`mx-auto flex w-fit items-center gap-1.5 rounded-lg bg-[#FFF5C4] px-3 py-1.5 text-[12px] font-medium text-black/70 shadow-sm ${anim}`}>
                  {m.k === 'event' && m.icon === 'calendar' ? <CalendarCheck size={14} className="text-[#B7791F]" /> : <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#B7791F] text-[9px] font-bold text-white">D</span>}{m.text}
                </p>
              )
            })}
            {typing && (
              <div className="w-fit rounded-2xl rounded-tl-md bg-white px-3.5 py-3 shadow-sm">
                <span className="sr-only">{L.typing}</span>
                <span className="flex gap-1">{[0, 1, 2].map((d) => <span key={d} className="h-1.5 w-1.5 animate-[blink_1s_infinite] rounded-full bg-black/35" style={{ animationDelay: `${d * 150}ms` }} />)}</span>
              </div>
            )}
          </div>

          {/* composer */}
          <div className="flex items-center gap-2 bg-[#F0F2F5] px-3 py-2.5">
            <span className="flex-1 rounded-full bg-white px-4 py-2 text-[13px] text-black/35">{L.msg}</span>
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#25D366] text-white"><WhatsAppIcon size={18} /></span>
          </div>
        </div>
      </div>
    </div>
  )
}
