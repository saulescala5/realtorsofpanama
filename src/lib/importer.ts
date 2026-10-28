import { parseListingText, type ImportResult } from '../../supabase/functions/_shared/listing-import'
import { supabase } from './supabase'

export { parseListingText }
export type { ImportedListing, ImportResult } from '../../supabase/functions/_shared/listing-import'

/** Reads a listing link server-side (browsers can't fetch other sites directly). */
export async function importFromUrl(url: string): Promise<ImportResult> {
  try {
    if (supabase) {
      const { data, error } = await supabase.functions.invoke<ImportResult>('import-listing', { body: { url } })
      if (error || !data) throw error
      return data
    }
    const res = await fetch('/api/import-listing', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ url }) })
    return (await res.json()) as ImportResult
  } catch {
    return { ok: false, source: url, reason: 'failed' }
  }
}
