// Reads a property flyer (image) from the private "bolsa" bucket with Claude and returns its text,
// so image-only WhatsApp posts become offers in the Bolsa de Brokers. Admin only.
// Deploy: name "bolsa-flyer", keep "Verify JWT" ON. Secret: ANTHROPIC_API_KEY.
import { createClient } from 'npm:@supabase/supabase-js@2.45.4'

const cors = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type' }
const json = (status: number, body: unknown) => new Response(JSON.stringify(body), { status, headers: { ...cors, 'Content-Type': 'application/json' } })

const PROMPT = `This image was posted in a real estate brokers' WhatsApp group in Panama.
If it is a property flyer or listing, transcribe ALL the property information exactly as written, in its original language, as plain text lines:
operation (alquiler/venta), property type, building or project name, area/neighborhood, price, bedrooms, bathrooms, m2, parking, furnished or línea blanca, pets, availability, and any phone or agent name.
If the image is not about a property for rent or sale (or a client request), reply with exactly: NONE`

const b64 = (buf: ArrayBuffer) => { let s = ''; const u = new Uint8Array(buf); for (let i = 0; i < u.length; i += 0x8000) s += String.fromCharCode(...u.subarray(i, i + 0x8000)); return btoa(s) }

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })
  const auth = req.headers.get('Authorization') ?? ''
  const url = Deno.env.get('SUPABASE_URL')!
  const asUser = createClient(url, Deno.env.get('SUPABASE_ANON_KEY')!, { global: { headers: { Authorization: auth } } })
  const { data: admin } = await asUser.rpc('is_admin')
  if (!admin) return json(403, { error: 'admin only' })
  const key = Deno.env.get('ANTHROPIC_API_KEY')
  if (!key) return json(500, { error: 'Set the ANTHROPIC_API_KEY secret' })

  const { paths } = await req.json() as { paths: string[] }
  const db = createClient(url, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)
  const out: Record<string, string> = {}
  for (const path of (paths ?? []).slice(0, 10)) {
    const { data: file } = await db.storage.from('bolsa').download(path)
    if (!file) { out[path] = ''; continue }
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'x-api-key': key, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
      body: JSON.stringify({
        model: Deno.env.get('FLYER_MODEL') ?? 'claude-haiku-5-5', max_tokens: 600,
        messages: [{ role: 'user', content: [
          { type: 'image', source: { type: 'base64', media_type: 'image/jpeg', data: b64(await file.arrayBuffer()) } },
          { type: 'text', text: PROMPT },
        ] }],
      }),
    })
    const j = await res.json()
    if (!res.ok) return json(502, { error: j?.error?.message ?? 'Claude error', done: out })
    const text = (j.content?.[0]?.text ?? '').trim()
    out[path] = text === 'NONE' ? '' : text
  }
  return json(200, { texts: out })
})
