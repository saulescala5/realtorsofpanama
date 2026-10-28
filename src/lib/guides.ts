// Guides (blog). Static for now; can move to the database when you want to write posts from the admin.
import type { Lang } from './types'

type T = Record<Lang, string>
export interface Guide { slug: string; image: string; minutes: number; title: T; excerpt: T; body: Record<Lang, { h?: string; p: string }[]>; cta: { to: string; label: T } }

export const GUIDES: Guide[] = [
  {
    slug: 'renting-in-panama-as-a-foreigner', image: '/guides/guide-1.jpg', minutes: 4,
    title: { en: 'Renting in Panama as a foreigner: what you need', es: 'Alquilar en Panamá siendo extranjero: lo que necesitas' },
    excerpt: { en: 'The documents landlords ask for, what you pay up front, and how to move fast when the right place appears.', es: 'Los documentos que piden los propietarios, lo que pagas al inicio y cómo moverte rápido cuando aparece el lugar correcto.' },
    body: {
      en: [
        { p: 'Good apartments in Panama City rarely stay available for long. Having your paperwork ready before you visit is the easiest way to win the place you want.' },
        { h: 'Documents to have ready', p: 'Most landlords ask for your passport (or cédula), proof of income such as a work contract, recent pay slips or bank statements, and sometimes a reference from a previous landlord. Companies relocating staff can usually sign on the employee’s behalf.' },
        { h: 'What you pay up front', p: 'The usual arrangement is a security deposit plus the first month in advance. The deposit is returned at the end of the lease once the apartment is checked. Ask whether maintenance fees, water and internet are included, because it varies by building.' },
        { h: 'Lease length', p: 'One year is the standard. Shorter terms exist, especially furnished, but they tend to cost more per month.' },
        { h: 'How we help', p: 'Tell us your budget, area and dates on WhatsApp. We send options that fit, including homes that are not published yet, and tell you exactly what each landlord asks for before you visit.' },
      ],
      es: [
        { p: 'Los buenos apartamentos en Ciudad de Panamá no duran mucho disponibles. Tener tus documentos listos antes de visitar es la forma más fácil de quedarte con el lugar que quieres.' },
        { h: 'Documentos que debes tener', p: 'La mayoría de los propietarios pide pasaporte (o cédula), comprobante de ingresos como contrato de trabajo, talonarios recientes o estados de cuenta, y a veces una referencia de un arrendador anterior. Las empresas que trasladan personal suelen poder firmar por el empleado.' },
        { h: 'Lo que pagas al inicio', p: 'Lo habitual es un depósito de garantía más el primer mes por adelantado. El depósito se devuelve al terminar el contrato, después de revisar el apartamento. Pregunta si el mantenimiento, el agua e internet están incluidos, porque varía según el edificio.' },
        { h: 'Duración del contrato', p: 'Lo estándar es un año. Existen plazos más cortos, sobre todo amoblados, pero suelen costar más al mes.' },
        { h: 'Cómo te ayudamos', p: 'Dinos tu presupuesto, zona y fechas por WhatsApp. Te enviamos opciones que encajan, incluso las que aún no están publicadas, y te decimos exactamente qué pide cada propietario antes de visitar.' },
      ],
    },
    cta: { to: '/properties?op=rent', label: { en: 'See homes for rent', es: 'Ver propiedades en alquiler' } },
  },
  {
    slug: 'buying-property-in-panama-as-a-foreigner', image: '/guides/guide-2.jpg', minutes: 5,
    title: { en: 'Buying property in Panama as a foreigner, step by step', es: 'Comprar propiedad en Panamá siendo extranjero, paso a paso' },
    excerpt: { en: 'From the first offer to the public deed: how a purchase works in Panama and where buyers get caught out.', es: 'De la primera oferta a la escritura pública: cómo funciona una compra en Panamá y dónde se equivocan los compradores.' },
    body: {
      en: [
        { p: 'Foreigners can buy property in Panama with essentially the same rights as nationals, with a few location-specific exceptions. The process is clear once you know the steps.' },
        { h: '1. Offer and promise to sell', p: 'Once price and terms are agreed, buyer and seller sign a promise to sell (promesa de compraventa) and the buyer pays a deposit. It sets the price, the deadline to close and what happens if either side backs out.' },
        { h: '2. Due diligence', p: 'Your lawyer checks the property at the Registro Público: that the seller is the owner, that there are no liens or mortgages, and that taxes, utilities and building fees are paid up.' },
        { h: '3. Financing', p: 'If you are using a mortgage, the bank appraises the property and approves the loan in parallel. Local banks lend to foreigners, with requirements that vary by bank.' },
        { h: '4. Public deed and registration', p: 'The sale is signed as a public deed before a notary and then registered at the Registro Público. Registration is what makes you the legal owner.' },
        { h: 'Before you sign anything', p: 'Work with a Panamanian lawyer from the start. We coordinate with your lawyer and bank, and can do video tours if you are buying from abroad.' },
      ],
      es: [
        { p: 'Los extranjeros pueden comprar propiedad en Panamá con prácticamente los mismos derechos que los nacionales, con algunas excepciones según la ubicación. El proceso es claro cuando conoces los pasos.' },
        { h: '1. Oferta y promesa de compraventa', p: 'Al acordar precio y condiciones, comprador y vendedor firman una promesa de compraventa y el comprador entrega un abono. Define el precio, el plazo para cerrar y qué pasa si alguna parte desiste.' },
        { h: '2. Revisión legal', p: 'Tu abogado revisa la propiedad en el Registro Público: que el vendedor sea el dueño, que no haya gravámenes ni hipotecas, y que impuestos, servicios y cuotas del edificio estén al día.' },
        { h: '3. Financiamiento', p: 'Si usas hipoteca, el banco avalúa la propiedad y aprueba el préstamo en paralelo. Los bancos locales prestan a extranjeros, con requisitos que varían por banco.' },
        { h: '4. Escritura pública e inscripción', p: 'La venta se firma en escritura pública ante notario y luego se inscribe en el Registro Público. La inscripción es lo que te convierte en el dueño legal.' },
        { h: 'Antes de firmar', p: 'Trabaja con un abogado panameño desde el inicio. Nosotros coordinamos con tu abogado y tu banco, y hacemos recorridos por video si compras desde el extranjero.' },
      ],
    },
    cta: { to: '/properties?op=sale', label: { en: 'See homes for sale', es: 'Ver propiedades en venta' } },
  },
  {
    slug: 'choosing-a-neighborhood-in-panama-city', image: '/guides/guide-3.jpg', minutes: 3,
    title: { en: 'How to choose a neighborhood in Panama City', es: 'Cómo elegir zona en Ciudad de Panamá' },
    excerpt: { en: 'Traffic decides more than square meters. A simple way to pick the area that fits your week.', es: 'El tráfico decide más que los metros cuadrados. Una forma simple de elegir la zona que encaja con tu semana.' },
    body: {
      en: [
        { p: 'In Panama City, where you live shapes your day more than the apartment itself. Start from your routine, not from the listing.' },
        { h: 'Start with the commute', p: 'If you work around Calle 50 or the banking district, Obarrio, El Cangrejo and Bella Vista keep you within walking distance. Costa del Este and Santa María suit people working east of the city.' },
        { h: 'Then think about weekends', p: 'Casco Viejo and El Cangrejo for restaurants and culture, Avenida Balboa for the Cinta Costera, Clayton and Panamá Pacífico for green space.' },
        { h: 'Families and schools', p: 'Costa del Este, Clayton and Santa María are close to international schools and have quieter streets and larger homes.' },
        { h: 'Try our matcher', p: 'Answer three questions and get your three best areas, then see what is available in each one.' },
      ],
      es: [
        { p: 'En Ciudad de Panamá, dónde vives define tu día más que el apartamento. Empieza por tu rutina, no por el anuncio.' },
        { h: 'Empieza por el trayecto', p: 'Si trabajas cerca de Calle 50 o el centro bancario, Obarrio, El Cangrejo y Bella Vista te dejan a pocos pasos. Costa del Este y Santa María convienen a quienes trabajan al este de la ciudad.' },
        { h: 'Luego piensa en los fines de semana', p: 'Casco Viejo y El Cangrejo para restaurantes y cultura, Avenida Balboa para la Cinta Costera, Clayton y Panamá Pacífico para áreas verdes.' },
        { h: 'Familias y colegios', p: 'Costa del Este, Clayton y Santa María están cerca de colegios internacionales y tienen calles más tranquilas y casas más amplias.' },
        { h: 'Prueba nuestro buscador', p: 'Responde tres preguntas, recibe tus tres mejores zonas y mira qué hay disponible en cada una.' },
      ],
    },
    cta: { to: '/neighborhoods', label: { en: 'Explore neighborhoods', es: 'Explorar zonas' } },
  },
  {
    slug: 'furnished-or-linea-blanca', image: '/guides/guide-4.jpg', minutes: 3,
    title: { en: 'Furnished, línea blanca or empty: what to choose', es: 'Amoblado, línea blanca o vacío: qué elegir' },
    excerpt: { en: 'What each term means in Panama, and which one makes sense for how long you plan to stay.', es: 'Qué significa cada término en Panamá y cuál conviene según cuánto tiempo piensas quedarte.' },
    body: {
      en: [
        { p: 'Listings in Panama use three terms you will see everywhere. Knowing them avoids surprises on move-in day.' },
        { h: 'Furnished (amoblado)', p: 'Furniture, kitchenware and usually appliances. Best for short stays or if you are arriving with a suitcase. Expect a higher monthly rent.' },
        { h: 'Línea blanca', p: 'Appliances included (fridge, stove, washer and dryer, sometimes air conditioning) but no furniture. The most common option for one-year leases.' },
        { h: 'Empty (sin amoblar)', p: 'No appliances or furniture. Usually the lowest rent, and the best choice if you are staying long term and bringing your own things.' },
        { h: 'Our advice', p: 'Staying under a year? Go furnished. Staying longer? Línea blanca gives the best balance between price and convenience.' },
      ],
      es: [
        { p: 'Los anuncios en Panamá usan tres términos que verás en todas partes. Conocerlos evita sorpresas el día de la mudanza.' },
        { h: 'Amoblado', p: 'Muebles, utensilios de cocina y normalmente electrodomésticos. Ideal para estadías cortas o si llegas con una maleta. Espera un alquiler mensual más alto.' },
        { h: 'Línea blanca', p: 'Incluye electrodomésticos (refrigeradora, estufa, lavadora y secadora, a veces aire acondicionado) pero no muebles. La opción más común en contratos de un año.' },
        { h: 'Sin amoblar', p: 'Sin electrodomésticos ni muebles. Normalmente el alquiler más bajo, y la mejor opción si te quedas a largo plazo y traes tus cosas.' },
        { h: 'Nuestro consejo', p: '¿Menos de un año? Amoblado. ¿Más tiempo? Línea blanca da el mejor equilibrio entre precio y comodidad.' },
      ],
    },
    cta: { to: '/properties?op=rent', label: { en: 'See homes for rent', es: 'Ver propiedades en alquiler' } },
  },
  {
    slug: 'renting-out-your-apartment-in-panama', image: '/guides/guide-5.jpg', minutes: 4,
    title: { en: 'Renting out your apartment in Panama: get it right', es: 'Alquilar tu apartamento en Panamá: hazlo bien' },
    excerpt: { en: 'Price, photos and tenant screening: the three things that decide how fast you rent and who you rent to.', es: 'Precio, fotos y selección del inquilino: las tres cosas que deciden qué tan rápido alquilas y a quién.' },
    body: {
      en: [
        { p: 'An apartment that sits empty for two months costs more than a slightly lower rent. These three things make the difference.' },
        { h: 'Price on what is closing', p: 'Asking prices online are not what tenants pay. We price on what similar homes in your building and area are actually renting for.' },
        { h: 'Photos and video sell the visit', p: 'Most tenants decide whether to visit from the first photo. Bright, ordered rooms and a short video bring better tenants faster.' },
        { h: 'Screen before you sign', p: 'Confirm identity, income and references, and put everything in a written lease with a clear inventory. It protects you and the tenant.' },
        { h: 'How we help', p: 'We visit, produce photos and video, show the home only to qualified clients and handle the paperwork. You approve every step.' },
      ],
      es: [
        { p: 'Un apartamento vacío dos meses cuesta más que un alquiler un poco más bajo. Estas tres cosas marcan la diferencia.' },
        { h: 'Precio según lo que se cierra', p: 'Los precios publicados no son lo que pagan los inquilinos. Ponemos precio según lo que realmente se alquilan propiedades similares en tu edificio y zona.' },
        { h: 'Fotos y video venden la visita', p: 'La mayoría decide si visitar desde la primera foto. Espacios iluminados y ordenados y un video corto atraen mejores inquilinos más rápido.' },
        { h: 'Revisa antes de firmar', p: 'Confirma identidad, ingresos y referencias, y deja todo en un contrato escrito con inventario claro. Te protege a ti y al inquilino.' },
        { h: 'Cómo te ayudamos', p: 'Visitamos, hacemos fotos y video, mostramos la propiedad solo a clientes calificados y llevamos el papeleo. Tú apruebas cada paso.' },
      ],
    },
    cta: { to: '/list-your-property', label: { en: 'List your property', es: 'Publica tu propiedad' } },
  },
]

export const guide = (slug: string) => GUIDES.find((g) => g.slug === slug)
