import { Link } from 'react-router-dom'
import { WhatsAppIcon } from '@/components/icons'
import { Heart } from 'lucide-react'
import { useI18n } from '@/i18n'
import { useStore } from '@/lib/store'
import { useSaved } from '@/lib/saved'
import { waLink } from '@/lib/whatsapp'
import { PropertyCard, titleOf } from '@/components/PropertyCard'

const S = {
  en: { title: 'Saved homes', sub: 'Your shortlist lives in this browser. Send it to us and we’ll check availability and set up visits.', empty: 'Tap the heart on any home to save it here.', browse: 'Browse homes', send: 'Send my list on WhatsApp', wa: 'Hi! These are the homes I saved:' },
  es: { title: 'Guardadas', sub: 'Tu lista vive en este navegador. Envíanosla y confirmamos disponibilidad y coordinamos visitas.', empty: 'Toca el corazón de cualquier propiedad para guardarla aquí.', browse: 'Ver propiedades', send: 'Enviar mi lista por WhatsApp', wa: '¡Hola! Estas son las propiedades que guardé:' },
}

export default function Saved() {
  const { lang } = useI18n()
  const { publicProperties } = useStore()
  const { ids } = useSaved()
  const C = S[lang]
  const list = publicProperties.filter((p) => ids.includes(p.id))
  const msg = [C.wa, ...list.map((p) => `• ${titleOf(p, lang)} ${location.origin}/property/${p.id}`)].join('\n')
  return (
    <section className="container-x pb-24 pt-10 sm:pt-16">
      <h1 className="h-display">{C.title}</h1>
      <p className="mt-6 max-w-[50ch] text-[18px] text-ink-soft">{C.sub}</p>
      {list.length ? <>
        <a href={waLink(msg)} target="_blank" rel="noreferrer" className="btn-wa btn-lg mt-8"><WhatsAppIcon size={18} />{C.send}</a>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{list.map((p) => <PropertyCard key={p.id} p={p} />)}</div>
      </> : (
        <div className="mt-12 flex flex-col items-start gap-6 rounded-5xl bg-white p-10 ring-1 ring-black/5">
          <Heart size={28} /><p className="text-[18px]">{C.empty}</p><Link to="/properties" className="btn-primary">{C.browse}</Link>
        </div>
      )}
    </section>
  )
}
