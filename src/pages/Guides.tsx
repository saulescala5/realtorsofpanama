import { Link, useParams } from 'react-router-dom'
import { WhatsAppIcon } from '@/components/icons'
import { ArrowUpRight, ArrowLeft } from 'lucide-react'
import { useI18n } from '@/i18n'
import { GUIDES, guide } from '@/lib/guides'
import { waLink } from '@/lib/whatsapp'
import { Img } from '@/components/ui'

const G = {
  en: { title: 'Guides', sub: 'Straight answers about renting, buying and living in Panama City.', read: (m: number) => `${m} min read`, more: 'More guides', ask: 'Ask us on WhatsApp' },
  es: { title: 'Guías', sub: 'Respuestas claras sobre alquilar, comprar y vivir en Ciudad de Panamá.', read: (m: number) => `${m} min de lectura`, more: 'Más guías', ask: 'Pregúntanos por WhatsApp' },
}

export function GuideCard({ slug, big = false }: { slug: string; big?: boolean }) {
  const { lang } = useI18n()
  const g = guide(slug)!
  return (
    <Link to={`/guides/${g.slug}`} className="group block rounded-[28px] bg-white p-2 ring-1 ring-black/5 transition hover:-translate-y-1 hover:shadow-lift">
      <div className={`overflow-hidden rounded-[22px] bg-paper ${big ? 'aspect-[16/10]' : 'aspect-[16/9]'}`}><Img src={g.image} alt="" className="h-full w-full transition duration-700 group-hover:scale-105" /></div>
      <div className="p-4">
        <p className="text-[13px] text-ink-mute">{G[lang].read(g.minutes)}</p>
        <p className={`mt-1.5 font-medium leading-snug ${big ? 'text-[24px]' : 'text-[18px]'}`}>{g.title[lang]}</p>
        {big && <p className="mt-2 text-[15px] text-ink-soft">{g.excerpt[lang]}</p>}
      </div>
    </Link>
  )
}

export function GuideList() {
  const { lang } = useI18n()
  const C = G[lang]
  return (
    <section className="container-x pb-24 pt-10 sm:pt-16">
      <h1 className="h-display">{C.title}</h1>
      <p className="mt-6 max-w-[48ch] text-[18px] text-ink-soft">{C.sub}</p>
      <div className="mt-14 grid gap-5 lg:grid-cols-2">
        {GUIDES.map((g, i) => <GuideCard key={g.slug} slug={g.slug} big={i < 2} />)}
      </div>
    </section>
  )
}

export function GuidePage() {
  const { slug = '' } = useParams()
  const { lang } = useI18n()
  const C = G[lang]
  const g = guide(slug)
  if (!g) return <div className="container-x py-24"><Link to="/guides" className="link">{C.title}</Link></div>
  return (
    <article className="pb-24 pt-10 sm:pt-16">
      <div className="container-x max-w-[880px]">
        <Link to="/guides" className="inline-flex items-center gap-1.5 text-[14px] text-ink-soft hover:text-ink"><ArrowLeft size={15} />{C.title}</Link>
        <h1 className="font-display mt-6 text-[44px] font-semibold leading-[.98] sm:text-[68px]">{g.title[lang]}</h1>
        <p className="mt-6 text-[19px] text-ink-soft">{g.excerpt[lang]}</p>
        <p className="mt-4 text-[14px] text-ink-mute">{C.read(g.minutes)}</p>
      </div>
      <div className="mx-auto mt-10 max-w-[1100px] px-3 sm:px-10"><div className="aspect-[16/8] overflow-hidden rounded-5xl bg-white"><Img src={g.image} alt="" className="h-full w-full" /></div></div>
      <div className="container-x mt-14 max-w-[720px] space-y-8">
        {g.body[lang].map((b, i) => (
          <section key={i}>
            {b.h && <h2 className="font-display text-[30px] font-semibold leading-none">{b.h}</h2>}
            <p className={`${b.h ? 'mt-3' : ''} text-[18px] leading-[1.75] text-ink/80`}>{b.p}</p>
          </section>
        ))}
        <div className="flex flex-wrap gap-3 pt-4">
          <Link to={g.cta.to} className="btn-primary">{g.cta.label[lang]}<ArrowUpRight size={17} /></Link>
          <a href={waLink(g.title[lang])} target="_blank" rel="noreferrer" className="btn-ghost"><WhatsAppIcon size={16} />{C.ask}</a>
        </div>
      </div>
      <div className="container-x mt-24">
        <h2 className="h-sub">{C.more}</h2>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{GUIDES.filter((x) => x.slug !== g.slug).map((x) => <GuideCard key={x.slug} slug={x.slug} />)}</div>
      </div>
    </article>
  )
}
