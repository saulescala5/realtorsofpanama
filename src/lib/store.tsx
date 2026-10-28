/**
 * Data layer.
 *
 * With VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY set, everything reads and
 * writes the Supabase database (supabase/schema.sql). Without them the site
 * runs on a small local demo store (localStorage) so it can be previewed.
 */
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { AdminUser, Lead, LeadStage, ListingStatus, Property, PropertySource } from './types'
import { supabase, supabaseEnabled } from './supabase'
import { DEMO_LEADS, DEMO_PROPERTIES } from './demo'

export type PropertyInput = Omit<Property, 'id' | 'views' | 'createdAt' | 'updatedAt'> & { id?: string }
export type WebLeadInput = { name: string; phone?: string; email?: string; message?: string; interest?: string; propertyId?: string }

interface Store {
  ready: boolean
  demo: boolean
  user: AdminUser | null
  /** Active listings (public) — or every listing when the admin is signed in. */
  properties: Property[]
  publicProperties: Property[]
  leads: Lead[]
  login: (email: string, password: string) => Promise<string | null>
  logout: () => Promise<void>
  refresh: () => Promise<void>
  saveProperty: (p: PropertyInput) => Promise<Property>
  setStatus: (id: string, status: ListingStatus) => Promise<void>
  deleteProperty: (id: string) => Promise<void>
  deleteSamples: () => Promise<number>
  getSource: (propertyId: string) => Promise<PropertySource | null>
  saveSource: (s: PropertySource) => Promise<void>
  findBySourceCode: (code: string) => Promise<string | null>
  uploadPhoto: (file: File | Blob, name: string) => Promise<string>
  viewProperty: (id: string) => void
  addWebLead: (l: WebLeadInput) => Promise<boolean>
  updateLead: (id: string, patch: Partial<Lead>) => Promise<void>
}

const Ctx = createContext<Store | null>(null)

// ---------------------------------------------------------------- mapping
type Row = Record<string, any> // eslint-disable-line @typescript-eslint/no-explicit-any

const toProperty = (r: Row): Property => ({
  id: r.id, title: r.title, titleEs: r.title_es ?? undefined, description: r.description ?? '', descriptionEs: r.description_es ?? undefined,
  operation: r.type, type: r.property_type, price: Number(r.price), beds: r.bedrooms ?? 0, baths: Number(r.bathrooms ?? 0),
  area: Number(r.area ?? 0), parking: r.parking ?? 0, location: r.location ?? '', city: r.city ?? 'Panama City',
  address: r.full_address ?? undefined, latitude: r.latitude ?? undefined, longitude: r.longitude ?? undefined,
  furnishing: r.furnishing_status ?? undefined, petPolicy: r.pet_policy ?? undefined,
  features: Array.isArray(r.features) ? r.features : [], amenities: Array.isArray(r.property_amenities) ? r.property_amenities : [],
  hoa: r.hoa ?? undefined, deposit: r.deposit ?? undefined, availableDate: r.available_date ?? undefined,
  videoUrl: r.video_url ?? undefined, videoPosterUrl: r.video_poster_url ?? undefined,
  images: ((r.property_images ?? []) as Row[]).sort((a, b) => a.display_order - b.display_order).map((i) => i.image_url),
  status: r.status, featured: !!r.featured, sample: !!r.is_sample, views: r.views ?? 0, createdAt: r.created_at, updatedAt: r.updated_at,
})

const fromProperty = (p: PropertyInput): Row => ({
  title: p.title, title_es: p.titleEs || null, description: p.description, description_es: p.descriptionEs || null,
  type: p.operation, property_type: p.type, price: p.price, bedrooms: p.beds, bathrooms: p.baths, area: p.area, parking: p.parking,
  location: p.location, city: p.city, full_address: p.address || null, latitude: p.latitude ?? null, longitude: p.longitude ?? null,
  furnishing_status: p.furnishing || null, pet_policy: p.petPolicy || null, features: p.features, property_amenities: p.amenities,
  hoa: p.hoa ?? null, deposit: p.deposit ?? null, available_date: p.availableDate || null,
  video_url: p.videoUrl || null, video_poster_url: p.videoPosterUrl || null, status: p.status, featured: p.featured,
})

const toLead = (r: Row): Lead => ({
  id: r.id, phone: r.phone ?? undefined, name: r.name || r.phone || '—', email: r.email ?? undefined, language: r.language ?? undefined,
  interest: r.interest ?? undefined, propertyType: r.property_type ?? undefined, bedrooms: r.bedrooms ?? undefined, areas: r.areas ?? undefined,
  budget: r.budget ?? undefined, timeline: r.timeline ?? undefined, financing: r.financing ?? undefined, score: r.score ?? undefined,
  botStage: r.bot_stage ?? undefined, stage: r.stage, listingsSent: r.listings_sent ?? undefined, sofiaNotes: r.sofia_notes ?? undefined,
  myNotes: r.my_notes ?? undefined, message: r.message ?? undefined, source: r.source, sourceAd: r.source_ad ?? undefined,
  propertyId: r.property_id ?? undefined, lastInboundAt: r.last_inbound_at ?? undefined, lastMessage: r.last_message ?? undefined,
  createdAt: r.created_at, updatedAt: r.updated_at,
})

const PROP_SELECT = '*, property_images(image_url, display_order)'

// ---------------------------------------------------------------- demo persistence
const DEMO_KEY = 'rop:demo:v2'
type DemoState = { properties: Property[]; leads: Lead[]; sources: Record<string, PropertySource>; signedIn: boolean }
const loadDemo = (): DemoState => {
  try { const raw = localStorage.getItem(DEMO_KEY); if (raw) return JSON.parse(raw) } catch { /* ignore */ }
  return { properties: DEMO_PROPERTIES, leads: DEMO_LEADS, sources: {}, signedIn: false }
}
const uid = () => (crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2))
const now = () => new Date().toISOString()

export function StoreProvider({ children }: { children: ReactNode }) {
  const demo = !supabaseEnabled
  const [ready, setReady] = useState(false)
  const [user, setUser] = useState<AdminUser | null>(null)
  const [properties, setProperties] = useState<Property[]>([])
  const [leads, setLeads] = useState<Lead[]>([])
  const [d, setD] = useState<DemoState>(loadDemo)

  useEffect(() => { if (demo) try { localStorage.setItem(DEMO_KEY, JSON.stringify(d)) } catch { /* ignore */ } }, [d, demo])

  const refresh = useCallback(async () => {
    if (demo) { setReady(true); return }
    const sb = supabase!
    const { data: sess } = await sb.auth.getSession()
    let admin: AdminUser | null = null
    if (sess.session) {
      const { data: isAdmin } = await sb.rpc('is_admin')
      if (isAdmin) admin = { id: sess.session.user.id, email: sess.session.user.email ?? '' }
    }
    setUser(admin)
    const { data: rows } = await sb.from('properties').select(PROP_SELECT).order('featured', { ascending: false }).order('created_at', { ascending: false })
    setProperties((rows ?? []).map(toProperty))
    if (admin) {
      const { data: lr } = await sb.from('leads').select('*').order('updated_at', { ascending: false }).limit(1000)
      setLeads((lr ?? []).map(toLead))
    } else setLeads([])
    setReady(true)
  }, [demo])

  useEffect(() => {
    refresh()
    if (demo) return
    const { data } = supabase!.auth.onAuthStateChange((e) => { if (e === 'SIGNED_IN' || e === 'SIGNED_OUT') refresh() })
    return () => data.subscription.unsubscribe()
  }, [refresh, demo])

  const store = useMemo<Store>(() => {
    const demoUser: AdminUser | null = d.signedIn ? { id: 'demo-admin', email: 'demo@realtorsofpanama.com' } : null
    const curUser = demo ? demoUser : user
    const props = demo ? (curUser ? d.properties : d.properties.filter((p) => p.status === 'active')) : properties
    const sb = supabase

    return {
      ready, demo, user: curUser,
      properties: props,
      publicProperties: props.filter((p) => p.status === 'active'),
      leads: demo ? (curUser ? d.leads : []) : leads,

      login: async (email, password) => {
        if (demo) { setD((s) => ({ ...s, signedIn: true })); return null }
        const { error } = await sb!.auth.signInWithPassword({ email, password })
        if (error) return error.message
        const { data: isAdmin } = await sb!.rpc('is_admin')
        if (!isAdmin) { await sb!.auth.signOut(); return 'not-admin' }
        await refresh()
        return null
      },
      logout: async () => { if (demo) setD((s) => ({ ...s, signedIn: false })); else { await sb!.auth.signOut(); await refresh() } },
      refresh,

      saveProperty: async (input) => {
        if (demo) {
          const existing = input.id ? d.properties.find((p) => p.id === input.id) : undefined
          const p: Property = { ...(existing ?? { views: 0, createdAt: now() }), ...input, id: existing?.id ?? uid(), updatedAt: now() } as Property
          setD((s) => ({ ...s, properties: existing ? s.properties.map((x) => (x.id === p.id ? p : x)) : [p, ...s.properties] }))
          return p
        }
        const row = fromProperty(input)
        const q = input.id ? sb!.from('properties').update(row).eq('id', input.id) : sb!.from('properties').insert(row)
        const { data, error } = await q.select('id').single()
        if (error || !data) throw error ?? new Error('save failed')
        const id = data.id as string
        await sb!.from('property_images').delete().eq('property_id', id)
        if (input.images.length) {
          const { error: imgErr } = await sb!.from('property_images').insert(input.images.map((image_url, i) => ({ property_id: id, image_url, display_order: i })))
          if (imgErr) throw imgErr
        }
        await refresh()
        const { data: fresh } = await sb!.from('properties').select(PROP_SELECT).eq('id', id).single()
        return toProperty(fresh!)
      },
      setStatus: async (id, status) => {
        if (demo) { setD((s) => ({ ...s, properties: s.properties.map((p) => (p.id === id ? { ...p, status } : p)) })); return }
        await sb!.from('properties').update({ status }).eq('id', id); await refresh()
      },
      deleteProperty: async (id) => {
        if (demo) { setD((s) => ({ ...s, properties: s.properties.filter((p) => p.id !== id) })); return }
        await sb!.from('properties').delete().eq('id', id); await refresh()
      },
      deleteSamples: async () => {
        if (demo) { const n = d.properties.filter((p) => p.sample).length; setD((s) => ({ ...s, properties: s.properties.filter((p) => !p.sample) })); return n }
        const { data } = await sb!.from('properties').delete().eq('is_sample', true).select('id')
        await refresh(); return data?.length ?? 0
      },
      getSource: async (pid) => {
        if (demo) return d.sources[pid] ?? null
        const { data } = await sb!.from('property_private').select('*').eq('property_id', pid).maybeSingle()
        return data ? { propertyId: pid, sourceCode: data.source_code ?? undefined, sourceLink: data.source_link ?? undefined, contactName: data.source_contact_name ?? undefined,
          contactPhone: data.source_contact_phone ?? undefined, contactEmail: data.source_contact_email ?? undefined, commissionNote: data.commission_note ?? undefined, notes: data.notes ?? undefined } : null
      },
      saveSource: async (s) => {
        if (demo) { setD((x) => ({ ...x, sources: { ...x.sources, [s.propertyId]: s } })); return }
        const { error } = await sb!.from('property_private').upsert({
          property_id: s.propertyId, source_code: s.sourceCode || null, source_link: s.sourceLink || null, source_contact_name: s.contactName || null,
          source_contact_phone: s.contactPhone || null, source_contact_email: s.contactEmail || null, commission_note: s.commissionNote || null, notes: s.notes || null,
        })
        if (error) throw error
      },
      findBySourceCode: async (code) => {
        if (demo) return Object.values(d.sources).find((s) => s.sourceCode === code)?.propertyId ?? null
        const { data } = await sb!.from('property_private').select('property_id').eq('source_code', code).maybeSingle()
        return (data?.property_id as string) ?? null
      },
      uploadPhoto: async (file, name) => {
        if (demo) return await new Promise<string>((res) => { const r = new FileReader(); r.onload = () => res(String(r.result)); r.readAsDataURL(file) })
        const ext = (name.split('.').pop() || 'jpg').toLowerCase()
        const path = `${new Date().toISOString().slice(0, 10)}/${uid()}.${ext}`
        const type = ext === 'mp4' ? 'video/mp4' : ext === 'png' ? 'image/png' : 'image/jpeg'
        const { error } = await sb!.storage.from('listing-photos').upload(path, file, { contentType: type, upsert: false })
        if (error) throw error
        return sb!.storage.from('listing-photos').getPublicUrl(path).data.publicUrl
      },
      viewProperty: (id) => {
        if (demo) { setD((s) => ({ ...s, properties: s.properties.map((p) => (p.id === id ? { ...p, views: p.views + 1 } : p)) })); return }
        sb!.rpc('add_view', { pid: id }).then(() => {}, () => {})
      },
      addWebLead: async (l) => {
        if (demo) {
          const lead: Lead = { id: uid(), name: l.name, phone: l.phone, email: l.email, message: l.message, interest: l.interest, propertyId: l.propertyId, stage: 'new', source: 'web', createdAt: now(), updatedAt: now() }
          setD((s) => ({ ...s, leads: [lead, ...s.leads] })); return true
        }
        const { error } = await sb!.from('leads').insert({ name: l.name, phone: l.phone || null, email: l.email || null, message: l.message || null, interest: l.interest || null, property_id: l.propertyId || null, source: 'web', stage: 'new' })
        return !error
      },
      updateLead: async (id, patch) => {
        if (demo) { setD((s) => ({ ...s, leads: s.leads.map((x) => (x.id === id ? { ...x, ...patch, updatedAt: now() } : x)) })); return }
        const row: Row = {}
        if (patch.stage) row.stage = patch.stage as LeadStage
        if (patch.myNotes !== undefined) row.my_notes = patch.myNotes
        if (patch.name !== undefined) row.name = patch.name
        setLeads((ls) => ls.map((x) => (x.id === id ? { ...x, ...patch } : x)))
        await sb!.from('leads').update(row).eq('id', id)
      },
    }
  }, [ready, demo, user, properties, leads, d, refresh])

  return <Ctx.Provider value={store}>{children}</Ctx.Provider>
}

export function useStore() {
  const c = useContext(Ctx)
  if (!c) throw new Error('useStore must be used inside <StoreProvider>')
  return c
}
