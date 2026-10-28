import { useEffect } from 'react'

export const SITE_URL = (import.meta.env.VITE_SITE_URL as string | undefined)?.replace(/\/$/, '') || (typeof window !== 'undefined' ? window.location.origin : '')
export const ORG = {
  '@type': 'RealEstateAgent',
  '@id': '#organization',
  name: 'Realtors of Panama',
  description: 'Panama’s network of licensed real estate professionals. Clients start on WhatsApp and are connected with a licensed, verified agent for renting, buying, selling or investing in Panama.',
  telephone: '+507 6854-8420',
  areaServed: { '@type': 'Country', name: 'Panama' },
  address: { '@type': 'PostalAddress', streetAddress: 'Calle 50, Torre Global Bank', addressLocality: 'Panama City', addressCountry: 'PA' },
  knowsLanguage: ['en', 'es'],
  contactPoint: { '@type': 'ContactPoint', telephone: '+507 6854-8420', contactType: 'customer service', availableLanguage: ['English', 'Spanish'] },
}

function meta(attr: 'name' | 'property', key: string, value: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`)
  if (!el) { el = document.createElement('meta'); el.setAttribute(attr, key); document.head.appendChild(el) }
  el.content = value
}

/** Per-page title, description, Open Graph and JSON-LD. */
export function useSeo({ title, description, image, jsonLd }: { title: string; description?: string; image?: string; jsonLd?: object | object[] }) {
  const ld = jsonLd ? JSON.stringify(jsonLd) : ''
  useEffect(() => {
    document.title = title
    meta('property', 'og:title', title)
    if (description) { meta('name', 'description', description); meta('property', 'og:description', description) }
    if (image) meta('property', 'og:image', image.startsWith('http') ? image : SITE_URL + image)
    meta('property', 'og:url', SITE_URL + window.location.pathname)
    let link = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')
    if (!link) { link = document.createElement('link'); link.rel = 'canonical'; document.head.appendChild(link) }
    link.href = SITE_URL + window.location.pathname
    let s = document.getElementById('ld-page') as HTMLScriptElement | null
    if (ld) {
      if (!s) { s = document.createElement('script'); s.id = 'ld-page'; s.type = 'application/ld+json'; document.head.appendChild(s) }
      s.textContent = ld
    } else s?.remove()
  }, [title, description, image, ld])
}
