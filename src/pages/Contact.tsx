import { MapPin } from 'lucide-react'
import { WhatsAppIcon } from '@/components/icons'
import { useI18n } from '@/i18n'
import { waLink } from '@/lib/whatsapp'

export default function Contact() {
  const { t } = useI18n()
  return (
    <div className="container-x pb-24 pt-10 sm:pt-16">
      <h1 className="h-display">{t.contact.title}</h1>
      <p className="mt-6 text-[18px] text-ink-soft">{t.contact.sub}</p>
      <a href={waLink('')} target="_blank" rel="noreferrer" className="btn-wa btn-lg mt-8"><WhatsAppIcon size={19} />WhatsApp +507 6854-8420</a>
      <div className="mt-12 grid max-w-3xl gap-4 sm:grid-cols-2">
        <div className="card p-5"><p className="flex items-center gap-2 text-sm font-bold"><MapPin size={16} className="text-ink" />{t.contact.office}</p><p className="mt-2 text-sm text-ink-soft">Calle 50, Torre Global Bank, Panama City</p></div>
      </div>
    </div>
  )
}
