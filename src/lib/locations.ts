// Neighborhood slugs (stored in properties.location; Sofia searches by them).
export const LOCATIONS: { slug: string; name: string }[] = [
  ['punta-pacifica', 'Punta Pacífica'], ['paitilla', 'Paitilla'], ['punta-paitilla', 'Punta Paitilla'], ['avenida-balboa', 'Avenida Balboa'],
  ['costa-del-este', 'Costa del Este'], ['santa-maria', 'Santa María'], ['coco-del-mar', 'Coco del Mar'], ['san-francisco', 'San Francisco'],
  ['obarrio', 'Obarrio'], ['marbella', 'Marbella'], ['bella-vista', 'Bella Vista'], ['el-cangrejo', 'El Cangrejo'], ['via-espana', 'Vía España'],
  ['casco-viejo', 'Casco Viejo'], ['carrasquilla', 'Carrasquilla'], ['condado-del-rey', 'Condado del Rey'], ['villa-lucre', 'Villa Lucre'],
  ['brisas-del-golf', 'Brisas del Golf'], ['parque-lefevre', 'Parque Lefevre'], ['clayton', 'Clayton'], ['albrook', 'Albrook'],
  ['panama-pacifico', 'Panamá Pacífico'], ['costa-sur', 'Costa Sur'], ['coronado', 'Coronado'], ['boquete', 'Boquete'], ['other', 'Other'],
].map(([slug, name]) => ({ slug, name }))

export const locationName = (slug: string) =>
  LOCATIONS.find((l) => l.slug === slug)?.name ?? slug.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')

export const slugify = (s: string) =>
  s.normalize('NFKD').replace(/[̀-ͯ]/g, '').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
