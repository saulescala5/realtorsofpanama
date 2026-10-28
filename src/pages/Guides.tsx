import { Link, useParams } from 'react-router-dom'
import { WhatsAppIcon } from '@/components/icons'
import { ArrowUpRight, ArrowLeft } from 'lucide-react'
import { useI18n } from '@/i18n'
import { GUIDES, guide } from '@/lib/guides'
import { waLink } from '@/lib/whatsapp'
import { Img } from '@/components/ui'
import { useSeo, SITE_URL } from '@/lib/seo'

const G = {
  en: { title: 'Guides', sub: 'Straight answers about renting, buying and living in Panama City.', read: (m: number) => `${m} min read`, more: 'More guides', ask: 'Ask us on WhatsApp', readNow: 'Read the guide', contents: 'In this guide', helpTitle: 'Have a question?', helpSub: 'Write to us on WhatsApp. We answer in minutes.' },
  es: { title: 'Guías', sub: 'Respuestas claras sobre alquilar, comprar y vivir en Ciudad de Panamá.', read: (m: number) => `${m} min de lectura`, more: 'Más guías', ask: 'Pregúntanos por WhatsApp', readNow: 'Leer la guía', contents: 'En esta guía', helpTitle: '¿Tienes una pregunta?', helpSub: 'Escríbenos por WhatsApp. Respondemos en minutos.' },
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
  const [first, ...rest] = GUIDES
  return (
    <section className="container-x pb-24 pt-10 sm:pt-14">
      <h1 className="font-display text-[48px] font-semibold leading-[.95] sm:text-[72px]">{C.title}</h1>
      <p className="mt-4 max-w-[52ch] text-[17px] text-ink-soft">{C.sub}</p>
      <Link to={`/guides/${first.slug}`} className="group mt-10 grid overflow-hidden rounded-[32px] bg-white ring-1 ring-black/5 transition hover:shadow-lift lg:grid-cols-[1.2fr_1fr]">
        <div className="aspect-[16/10] overflow-hidden lg:aspect-auto"><Img src={first.image} alt="" className="h-full w-full transition duration-700 group-hover:scale-105" /></div>
        <div className="flex flex-col justify-center p-7 sm:p-10">
          <p className="text-[13px] text-ink-mute">{C.read(first.minutes)}</p>
          <p className="font-display mt-3 text-[34px] font-semibold leading-[1.02] sm:text-[44px]">{first.title[lang]}</p>
          <p className="mt-4 text-[16px] text-ink-soft">{first.excerpt[lang]}</p>
          <span className="btn-primary mt-8 self-start">{C.readNow}<ArrowUpRight size={16} /></span>
        </div>
      </Link>
      <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {rest.map((g) => <GuideCard key={g.slug} slug={g.slug} />)}
      </div>
    </section>
  )
}

export function GuidePage() {
  const { slug = '' } = useParams()
  const { lang } = useI18n()
  const C = G[lang]
  const g = guide(slug)
  useSeo(g ? { title: `${g.title[lang]} · Realtors of Panama`, description: g.excerpt[lang], image: g.image,
    jsonLd: { '@context': 'https://schema.org', '@type': 'Article', headline: g.title[lang], description: g.excerpt[lang], image: SITE_URL + g.image, inLanguage: lang, publisher: { '@type': 'Organization', name: 'Realtors of Panama' } } } : { title: C.title })
  if (!g) return <div className="container-x py-24"><Link to="/guides" className="link">{C.title}</Link></div>
  const heads = g.body[lang].map((b, i) => [i, b.h] as const).filter(([, h]) => h)
  return (
    <article className="pb-24 pt-8 sm:pt-12">
      <div className="container-x">
        <Link to="/guides" className="inline-flex items-center gap-1.5 text-[14px] text-ink-soft hover:text-ink"><ArrowLeft size={15} />{C.title}</Link>
        <header className="mt-6 grid items-center gap-8 lg:grid-cols-[1fr_1.1fr] lg:gap-14">
          <div>
            <p className="text-[13px] text-ink-mute">{C.read(g.minutes)}</p>
            <h1 className="font-display mt-3 text-[40px] font-semibold leading-[1] sm:text-[56px]">{g.title[lang]}</h1>
            <p className="mt-5 max-w-[48ch] text-[18px] leading-relaxed text-ink-soft">{g.excerpt[lang]}</p>
          </div>
          <div className="aspect-[4/3] overflow-hidden rounded-[32px] bg-white"><Img src={g.image} alt="" className="h-full w-full" /></div>
        </header>

        <div className="mt-14 grid gap-10 lg:grid-cols-[220px_minmax(0,1fr)_300px]">
          <nav className="hidden lg:block"><div className="sticky top-28 space-y-1 border-l border-black/10 pl-4">
            <p className="mb-3 text-[12px] font-medium uppercase tracking-[.14em] text-ink-mute">{C.contents}</p>
            {heads.map(([i, h]) => <a key={i} href={`#s${i}`} className="block py-1 text-[14px] text-ink-soft hover:text-ink">{h}</a>)}
          </div></nav>
          <div className="max-w-[720px] space-y-8">
            {g.body[lang].map((b, i) => (
              <section key={i} id={`s${i}`} className="scroll-mt-28">
                {b.h && <h2 className="font-display text-[28px] font-semibold leading-none">{b.h}</h2>}
                <p className={`${b.h ? 'mt-3' : 'text-[20px] text-ink'} text-[17px] leading-[1.75] text-ink/80`}>{b.p}</p>
              </section>
            ))}
          </div>
          <aside><div className="sticky top-28 rounded-[28px] bg-ink p-6 text-white">
            <p className="font-display text-[26px] font-semibold leading-[1.05]">{C.helpTitle}</p>
            <p className="mt-2 text-[14px] text-white/60">{C.helpSub}</p>
            <a href={waLink(g.title[lang])} target="_blank" rel="noreferrer" className="btn-wa mt-5 w-full"><WhatsAppIcon size={16} />{C.ask}</a>
            <Link to={g.cta.to} className="btn mt-2 w-full bg-white/10 text-white hover:bg-white/20">{g.cta.label[lang]}<ArrowUpRight size={16} /></Link>
          </div></aside>
        </div>
      </div>
      <div className="container-x mt-24">
        <h2 className="h-sub">{C.more}</h2>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{GUIDES.filter((x) => x.slug !== g.slug).slice(0, 4).map((x) => <GuideCard key={x.slug} slug={x.slug} />)}</div>
      </div>
    </article>
  )
}
