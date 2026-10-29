// Saved contracts + admin settings. Admin only (RLS). Falls back to localStorage in demo mode.
import { supabase } from './supabase'

export interface SavedContract { id: string; kind: string; title: string; status: string; data: any; property_id?: string | null; lead_id?: string | null; created_at: string; updated_at: string } // eslint-disable-line @typescript-eslint/no-explicit-any

const LS = 'rop:contracts:v1'
const read = (): SavedContract[] => { try { return JSON.parse(localStorage.getItem(LS) ?? '[]') } catch { return [] } }
const write = (v: SavedContract[]) => { try { localStorage.setItem(LS, JSON.stringify(v)) } catch { /* full */ } }

export async function listContracts(): Promise<SavedContract[]> {
  if (!supabase) return read().sort((a, b) => b.updated_at.localeCompare(a.updated_at))
  const { data, error } = await supabase.from('contracts').select('*').order('updated_at', { ascending: false }).limit(100)
  if (error) throw error
  return data as SavedContract[]
}

export async function saveContract(c: Partial<SavedContract> & { kind: string }): Promise<SavedContract> {
  const now = new Date().toISOString()
  if (!supabase) {
    const all = read(); const id = c.id ?? crypto.randomUUID()
    const prev = all.find((x) => x.id === id)
    const row = { ...prev, ...c, id, created_at: prev?.created_at ?? now, updated_at: now } as SavedContract
    write([row, ...all.filter((x) => x.id !== id)]); return row
  }
  const row = { kind: c.kind, title: c.title ?? '', status: c.status ?? 'draft', data: c.data ?? {}, property_id: c.property_id ?? null, lead_id: c.lead_id ?? null, updated_at: now }
  const q = c.id ? supabase.from('contracts').update(row).eq('id', c.id).select().single() : supabase.from('contracts').insert(row).select().single()
  const { data, error } = await q
  if (error) throw error
  return data as SavedContract
}

export async function deleteContract(id: string) {
  if (!supabase) { write(read().filter((x) => x.id !== id)); return }
  await supabase.from('contracts').delete().eq('id', id)
}

export async function getSetting<T = unknown>(key: string): Promise<T | null> {
  if (!supabase) { try { return JSON.parse(localStorage.getItem('rop:setting:' + key) ?? 'null') } catch { return null } }
  const { data } = await supabase.from('admin_settings').select('value').eq('key', key).maybeSingle()
  return (data?.value as T) ?? null
}

export async function setSetting(key: string, value: unknown) {
  if (!supabase) { localStorage.setItem('rop:setting:' + key, JSON.stringify(value)); return }
  const { error } = await supabase.from('admin_settings').upsert({ key, value, updated_at: new Date().toISOString() })
  if (error) throw error
}
