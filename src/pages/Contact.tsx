import { MessageCircle, Mail, MapPin } from 'lucide-react'
import { useI18n } from '@/i18n'
import { waLink } from '@/lib/whatsapp'

export default function Contact() {
  const { t } = useI18n()
  return (
    <div className="container-x max-w-3xl py-16">
      <h1 className="h-section">{t.contact.title}</h1>
      <p className="mt-3 text-lg text-ink-soft">{t.contact.sub}</p>
      <a href={waLink('')} target="_blank" rel="noreferrer" className="btn-wa btn-lg mt-8"><MessageCircle size={19} />WhatsApp +507 6854-8420</a>
      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        <div className="card p-5"><p className="flex items-center gap-2 text-sm font-bold"><MapPin size={16} className="text-brand-500" />{t.contact.office}</p><p className="mt-2 text-sm text-ink-soft">Calle 50, Torre Global Bank, Piso 15, Panama City</p></div>
        <div className="card p-5"><p className="flex items-center gap-2 text-sm font-bold"><Mail size={16} className="text-brand-500" />{t.contact.email}</p><a href="mailto:escala.saul@gmail.com" className="mt-2 block text-sm text-ink-soft hover:text-ink">escala.saul@gmail.com</a></div>
      </div>
    </div>
  )
}
