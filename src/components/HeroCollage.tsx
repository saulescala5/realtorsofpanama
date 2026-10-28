import { BadgeCheck, CalendarCheck, MapPin, BedDouble, Bath, Maximize, Star, Clock } from 'lucide-react'
import { useI18n } from '@/i18n'
import { WhatsAppIcon } from './icons'

const T = {
  en: {
    verified: 'Verified today', price: '$2,400', mo: '/mo', title: 'Ocean-view 2BR', where: 'Punta Pacífica',
    ask: 'Looking for a 2BR near the ocean, around $2,200', reply: '3 verified homes match. Want to visit Thursday?',
    agent: 'Daniela R.', role: 'Licensed agent', area: 'Punta Pacífica · Paitilla',
    visit: 'Visit booked', when: 'Thu · 4:00 pm', fast: 'Replies in minutes', licensed: 'Licensed in Panama', match: 'Match', score: '96%',
  },
  es: {
    verified: 'Verificada hoy', price: '$2,400', mo: '/mes', title: '2 rec. con vista al mar', where: 'Punta Pacífica',
    ask: 'Busco 2 recámaras cerca del mar, unos $2,200', reply: '3 propiedades verificadas encajan. ¿Visitamos el jueves?',
    agent: 'Daniela R.', role: 'Agente con licencia', area: 'Punta Pacífica · Paitilla',
    visit: 'Visita agendada', when: 'Jue · 4:00 pm', fast: 'Respuesta en minutos', licensed: 'Licencia en Panamá', match: 'Coincidencia', score: '96%',
  },
}

const card = 'rounded-[22px] bg-white shadow-[0_24px_60px_-28px_rgba(0,0,0,.35)] ring-1 ring-black/[.06]'

/** Static brand composition: a property, the conversation, the agent and the visit, floating gently. */
export function HeroCollage() {
  const { lang } = useI18n()
  const L = T[lang]
  return (
    <div className="relative mx-auto h-[560px] w-full max-w-[560px] select-none sm:h-[600px]" aria-hidden>
      {/* property */}
      <div className={`absolute left-[8%] top-[6%] w-[64%] overflow-hidden ${card}`}>
        <div className="relative aspect-[4/3.4]">
          <img src="/samples/sample-01.jpg" alt="" className="h-full w-full object-cover" />
          <span className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1.5 text-[12px] font-semibold backdrop-blur"><BadgeCheck size={14} className="text-mint-600" />{L.verified}</span>
        </div>
        <div className="p-4">
          <div className="flex items-baseline justify-between gap-2">
            <p className="text-[15px] font-semibold">{L.title}</p>
            <p className="text-[17px] font-semibold">{L.price}<span className="text-[12px] font-normal text-ink-mute">{L.mo}</span></p>
          </div>
          <p className="mt-0.5 flex items-center gap-1 text-[13px] text-ink-soft"><MapPin size={13} />{L.where}</p>
          <div className="mt-3 flex gap-4 text-[13px] text-ink-soft"><span className="flex items-center gap-1"><BedDouble size={14} />2</span><span className="flex items-center gap-1"><Bath size={14} />2</span><span className="flex items-center gap-1"><Maximize size={14} />125 m²</span></div>
        </div>
      </div>

      {/* client message */}
      <div className="bob absolute right-0 top-[3%] w-[52%]" style={{ animationDelay: '-1s' }}>
        <div className="rounded-[20px] rounded-br-md bg-ink px-4 py-3 text-[13.5px] leading-snug text-white shadow-[0_24px_50px_-24px_rgba(0,0,0,.5)]">{L.ask}</div>
      </div>

      {/* reply */}
      <div className="bob absolute right-[2%] top-[23%] w-[50%]" style={{ animationDelay: '-3s' }}>
        <div className={`${card} rounded-bl-md px-4 py-3`}>
          <p className="mb-1 flex items-center gap-1.5 text-[11.5px] font-semibold text-mint-600"><WhatsAppIcon size={13} />Realtors of Panama</p>
          <p className="text-[13.5px] leading-snug">{L.reply}</p>
        </div>
      </div>

      {/* agent */}
      <div className="bob absolute bottom-[14%] left-0 w-[56%]" style={{ animationDelay: '-2s' }}>
        <div className={`${card} flex items-center gap-3 p-3.5`}>
          <span className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-ink text-[17px] font-semibold text-white">D<i className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-mint-500 ring-2 ring-white" /></span>
          <div className="min-w-0">
            <p className="flex items-center gap-1 text-[14px] font-semibold">{L.agent}<BadgeCheck size={15} className="text-ink" /></p>
            <p className="truncate text-[12.5px] text-ink-soft">{L.role} · {L.area}</p>
            <p className="mt-0.5 flex items-center gap-0.5 text-[11px] text-ink-soft">{[0, 1, 2, 3, 4].map((i) => <Star key={i} size={11} className="fill-brand-400 text-brand-400" />)}<span className="ml-1">4.9</span></p>
          </div>
        </div>
      </div>

      {/* visit */}
      <div className="bob absolute bottom-[30%] right-0" style={{ animationDelay: '-4s' }}>
        <div className={`${card} flex items-center gap-3 py-3 pl-3 pr-5`}>
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-paper"><CalendarCheck size={19} /></span>
          <div><p className="text-[12px] text-ink-soft">{L.visit}</p><p className="text-[14px] font-semibold">{L.when}</p></div>
        </div>
      </div>

      {/* badges */}
      <div className="absolute bottom-[2%] right-[6%] flex flex-col items-end gap-2">
        <span className="flex items-center gap-1.5 rounded-full bg-white px-3.5 py-2 text-[12.5px] font-medium shadow-sm ring-1 ring-black/[.06]"><BadgeCheck size={14} />{L.licensed}</span>
        <span className="flex items-center gap-1.5 rounded-full bg-white px-3.5 py-2 text-[12.5px] font-medium shadow-sm ring-1 ring-black/[.06]"><Clock size={14} />{L.fast}</span>
      </div>
      <div className="absolute left-[2%] top-[50%] hidden h-16 sm:flex w-16 flex-col items-center justify-center rounded-full bg-ink text-white shadow-lg">
        <span className="text-[15px] font-semibold leading-none">{L.score}</span><span className="mt-0.5 text-[9px] uppercase tracking-wider text-white/60">{L.match}</span>
      </div>
    </div>
  )
}
