import { NEIGHBORHOODS } from './neighborhoods'

// Neighborhood slugs (stored in properties.location; Sofia searches by them).
export const LOCATIONS: { slug: string; name: string }[] = [
  ...[...NEIGHBORHOODS].sort((a, b) => a.name.localeCompare(b.name)).map(({ slug, name }) => ({ slug, name })),
  { slug: 'other', name: 'Other' },
]

export const locationName = (slug: string) =>
  LOCATIONS.find((l) => l.slug === slug)?.name ?? slug.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')

export const slugify = (s: string) =>
  s.normalize('NFKD').replace(/[̀-ͯ]/g, '').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
