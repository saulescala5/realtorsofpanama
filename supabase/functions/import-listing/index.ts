// Supabase Edge Function — reads a listing link the signed-in owner/broker
// pasted and returns a draft. Deploy: supabase functions deploy import-listing
import { importListingFromUrl } from '../_shared/listing-import.ts'

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })
  // Only signed-in users may import (verify_jwt is on by default for this function).
  const { url } = await req.json().catch(() => ({ url: '' }))
  const result = await importListingFromUrl(String(url ?? ''))
  return new Response(JSON.stringify(result), { headers: { ...cors, 'Content-Type': 'application/json' } })
})
