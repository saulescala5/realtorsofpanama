import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'
import { useI18n } from '@/i18n'
import { Spot, type SpotName } from './icons'

type L = { en: string; es: string }
interface Aud { id: string; icon: SpotName; label: L; title: L; facts: { k: string; v: L }[]; tips: L[]; cta: [string, L]; img: string }

const A: Aud[] = [
  {
    id: 'renters', icon: 'key', img: '/life/life-10.jpg',
    label: { en: 'Renters', es: 'Inquilinos' },
    title: { en: 'Rent in Panama City without the runaround', es: 'Alquila en Panamá sin vueltas' },
    facts: [
      { k: '1 + 1', v: { en: 'Usual move-in: one month’s deposit plus the first month', es: 'Entrada usual: un mes de depósito más el primer mes' } },
      { k: '12 mo', v: { en: 'Typical lease length; shorter terms cost more', es: 'Plazo típico del contrato; plazos cortos cuestan más' } },
      { k: '$900+', v: { en: 'Where good 2-bedroom rents start in central areas', es: 'Desde donde arrancan buenos 2 recámaras en zonas céntricas' } },
    ],
    tips: [{ en: 'Ask if the rent includes HOA and parking', es: 'Pregunta si el alquiler incluye mantenimiento y estacionamiento' }, { en: '“Línea blanca” means appliances, not furniture', es: '“Línea blanca” es con electrodomésticos, sin muebles' }],
    cta: ['/properties?op=rent', { en: 'Homes for rent', es: 'Propiedades en alquiler' }],
  },
  {
    id: 'buyers', icon: 'home', img: '/life/life-01.jpg',
    label: { en: 'Buyers', es: 'Compradores' },
    title: { en: 'Buy with a licensed professional on your side', es: 'Compra con un profesional con licencia de tu lado' },
    facts: [
      { k: '2%', v: { en: 'Transfer tax on the higher of price or cadastral value, usually paid by the seller', es: 'Impuesto de transferencia sobre el mayor entre precio y valor catastral, usualmente lo paga el vendedor' } },
      { k: '$0', v: { en: 'Annual property tax on the first $30,000 of value; higher brackets apply above that', es: 'Impuesto anual sobre los primeros $30,000; luego aplican tramos' } },
      { k: '100%', v: { en: 'Same ownership rights for foreigners and Panamanians in the city', es: 'Mismos derechos de propiedad para extranjeros y panameños en la ciudad' } },
    ],
    tips: [{ en: 'Always check the finca at the Public Registry before signing', es: 'Revisa siempre la finca en el Registro Público antes de firmar' }, { en: 'Use an independent lawyer for the purchase contract', es: 'Usa un abogado independiente para el contrato' }],
    cta: ['/properties?op=sale', { en: 'Homes for sale', es: 'Propiedades en venta' }],
  },
  {
    id: 'investors', icon: 'chart', img: '/life/life-30.jpg',
    label: { en: 'Investors', es: 'Inversionistas' },
    title: { en: 'Know where rent demand actually is', es: 'Conoce dónde está la demanda de alquiler' },
    facts: [
      { k: 'USD', v: { en: 'Panama uses the US dollar: no currency risk for dollar investors', es: 'Panamá usa el dólar: sin riesgo cambiario' } },
      { k: '3%', v: { en: 'Capital gains option on resale: 3% of price, or 10% of the profit', es: 'Ganancia de capital en reventa: 3% del precio, o 10% de la ganancia' } },
      { k: '1BR–2BR', v: { en: 'Furnished units near Calle 50 rent fastest to executives', es: 'Las unidades amobladas cerca de Calle 50 se alquilan más rápido' } },
    ],
    tips: [{ en: 'Price per m² tells you more than the sticker price', es: 'El precio por m² dice más que el precio total' }, { en: 'Check the building’s HOA and reserve fund', es: 'Revisa la cuota y el fondo de reserva del edificio' }],
    cta: ['/neighborhoods', { en: 'Compare neighborhoods', es: 'Compara zonas' }],
  },
  {
    id: 'expats', icon: 'passport', img: '/life/life-11.jpg',
    label: { en: 'Expats', es: 'Expatriados' },
    title: { en: 'Moving to Panama? Start with the right area', es: '¿Te mudas a Panamá? Empieza por la zona correcta' },
    facts: [
      { k: '$1,000', v: { en: 'Monthly lifetime pension for the Pensionado visa; less if you own property over $100K', es: 'Pensión vitalicia mensual para la visa de Pensionado; menos si tienes propiedad de más de $100K' } },
      { k: '0', v: { en: 'Residency needed to rent or to buy', es: 'Residencia necesaria para alquilar o comprar' } },
      { k: 'Video', v: { en: 'Tours from abroad before you fly in', es: 'Recorridos por video antes de viajar' } },
    ],
    tips: [{ en: 'Bring passport and proof of income for leases', es: 'Trae pasaporte y comprobante de ingresos para el contrato' }, { en: 'Visa rules change: confirm with an immigration lawyer', es: 'Las reglas migratorias cambian: confirma con un abogado' }],
    cta: ['/guides/renting-in-panama-as-a-foreigner', { en: 'Read the expat guide', es: 'Lee la guía para extranjeros' }],
  },
  {
    id: 'locals', icon: 'family', img: '/life/life-25.jpg',
    label: { en: 'Locals', es: 'Locales' },
    title: { en: 'Your next home, closer to your life', es: 'Tu próximo hogar, más cerca de tu vida' },
    facts: [
      { k: '25 min', v: { en: 'What a smart move can cut from a daily commute', es: 'Lo que una buena mudanza puede quitarle al tráfico diario' } },
      { k: '$120K', v: { en: 'Primary-residence value exempt from property tax (registered as vivienda principal)', es: 'Valor exento de impuesto de inmueble para vivienda principal registrada' } },
      { k: 'Off-market', v: { en: 'Many homes are shared between agents before reaching portals', es: 'Muchas propiedades circulan entre agentes antes de publicarse' } },
    ],
    tips: [{ en: 'Register your home as vivienda principal at the DGI', es: 'Registra tu casa como vivienda principal en la DGI' }, { en: 'Compare total monthly cost: rent or mortgage plus HOA', es: 'Compara el costo mensual total: cuota más mantenimiento' }],
    cta: ['/properties', { en: 'Explore homes', es: 'Explora propiedades' }],
  },
  {
    id: 'owners', icon: 'coins', img: '/life/life-28.jpg',
    label: { en: 'Owners', es: 'Propietarios' },
    title: { en: 'Your property, in front of qualified clients', es: 'Tu propiedad, frente a clientes calificados' },
    facts: [
      { k: '24 h', v: { en: 'To review your property and call you back', es: 'Para revisar tu propiedad y llamarte' } },
      { k: 'Pro', v: { en: 'Photos, video and a listing written to sell', es: 'Fotos, video y un anuncio escrito para vender' } },
      { k: 'Verified', v: { en: 'Only screened clients visit your home', es: 'Solo clientes filtrados visitan tu propiedad' } },
    ],
    tips: [{ en: 'Have your finca number and location code ready', es: 'Ten a mano tu número de finca y código de ubicación' }, { en: 'Price on what’s closing, not what’s listed', es: 'Pon precio según lo que se cierra, no lo publicado' }],
    cta: ['/list-your-property', { en: 'Publish your property', es: 'Publica tu propiedad' }],
  },
]

export function Audiences() {
  const { lang } = useI18n()
  const [id, setId] = useState(A[0].id)
  const a = A.find((x) => x.id === id)!
  return (
    <div>
      <div className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5 sm:mx-0 sm:flex-wrap sm:px-0" role="tablist">
        {A.map((x) => (
          <button key={x.id} role="tab" aria-selected={x.id === id} onClick={() => setId(x.id)}
            className={`flex h-12 shrink-0 items-center gap-2 rounded-full pl-2 pr-5 text-[15px] font-medium transition ${x.id === id ? 'bg-ink text-white' : 'bg-white ring-1 ring-black/10 hover:ring-black/30'}`}>
            <Spot name={x.icon} size={34} tone={x.id === id ? 'light' : 'gold'} />{x.label[lang]}
          </button>
        ))}
      </div>
      <div key={a.id} className="mt-6 grid animate-rise overflow-hidden rounded-5xl bg-white ring-1 ring-black/5 lg:grid-cols-[1.25fr_1fr]">
        <div className="p-7 sm:p-12">
          <h3 className="font-display max-w-[20ch] text-[34px] font-semibold leading-[1] sm:text-[46px]">{a.title[lang]}</h3>
          <dl className="mt-10 grid gap-6 sm:grid-cols-3">
            {a.facts.map((f) => (
              <div key={f.k} className="border-t border-ink pt-4">
                <dt className="font-display text-[38px] font-semibold leading-none">{f.k}</dt>
                <dd className="mt-2 text-[14px] leading-snug text-ink-soft">{f.v[lang]}</dd>
              </div>
            ))}
          </dl>
          <ul className="mt-8 space-y-2">
            {a.tips.map((t) => <li key={t.en} className="flex gap-3 text-[15px]"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500" />{t[lang]}</li>)}
          </ul>
          <Link to={a.cta[0]} className="btn-primary mt-10">{a.cta[1][lang]}<ArrowUpRight size={17} /></Link>
        </div>
        <div className="relative min-h-[260px]"><img src={a.img} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover" /></div>
      </div>
      <p className="mt-4 text-[12px] text-ink-mute">{lang === 'es' ? 'Información general, no asesoría legal ni fiscal. Las reglas cambian; confirma con un abogado.' : 'General information, not legal or tax advice. Rules change; confirm with a lawyer.'}</p>
    </div>
  )
}
