// Sofia (n8n) → CRM. Called after every WhatsApp reply with the lead's Google Sheet row.
// POST { lead: { phone, name, interest, budget, ... } }  header x-sofia-secret: <SOFIA_SYNC_SECRET>
// Deploy with JWT verification off: supabase functions deploy sofia-lead --no-verify-jwt
import { createClient } from 'npm:@supabase/supabase-js@2.45.4'

const json = (status: number, body: unknown) => new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } })
const s = (v: unknown) => (v === null || v === undefined ? '' : String(v).trim())
const orNull = (v: unknown) => s(v) || null

/** "1,500/month" → [null, 1500] · "200-250k" → [200000, 250000] · "300k" → [null, 300000] */
export function parseBudget(text: string): [number | null, number | null] {
  const nums = [...text.toLowerCase().replace(/,/g, '').matchAll(/(\d+(?:\.\d+)?)\s*(k|mil|m)?/g)].map((m) => {
    const n = Number(m[1]); const u = m[2]
    return u === 'k' || u === 'mil' ? n * 1000 : u === 'm' ? n * 1_000_000 : n
  }).filter((n) => n > 0)
  if (/k\b/.test(text.toLowerCase()) && nums.length === 2 && nums[0] < 1000) nums[0] *= 1000
  if (!nums.length) return [null, null]
  return nums.length > 1 ? [Math.min(...nums), Math.max(...nums)] : [null, nums[0]]
}

export function nextStage(current: string | null, byHand: boolean, botStage: string): string | null {
  if (current === null) return 'new'
  if (byHand || current !== 'new') return null
  if (botStage === 'matched' || botStage === 'human' || botStage === 'booked') return 'contacted'
  if (botStage === 'closed') return 'lost'
  return null
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') return json(405, { error: 'Method not allowed' })
  const secret = Deno.env.get('SOFIA_SYNC_SECRET')
  if (!secret || req.headers.get('x-sofia-secret') !== secret) return json(401, { error: 'Unauthorized' })

  let lead: Record<string, unknown>
  try { lead = (await req.json())?.lead } catch { return json(400, { error: 'Bad JSON' }) }
  const phone = s(lead?.phone)
  if (!phone) return json(400, { error: 'phone required' })

  const db = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)
  const digits = phone.replace(/\D/g, '')
  const { data: existing } = await db.from('leads').select('id, stage, stage_set_by_hand, phone').eq('source', 'whatsapp')
    .in('phone', [phone, `+${digits}`, digits]).maybeSingle()

  const [budgetMin, budgetMax] = parseBudget(s(lead.budget))
  const botStage = s(lead.stage).toLowerCase()
  const row: Record<string, unknown> = {
    phone: `+${digits}`, source: 'whatsapp',
    name: s(lead.name) || s(lead.whatsapp_name) || `+${digits}`,
    language: orNull(lead.language), interest: orNull(lead.interest), property_type: orNull(lead.property_type),
    bedrooms: orNull(lead.bedrooms), areas: orNull(lead.areas), budget: orNull(lead.budget), budget_min: budgetMin, budget_max: budgetMax,
    timeline: orNull(lead.move_in) ?? orNull(lead.timeline), financing: orNull(lead.financing), score: orNull(lead.score)?.toString().toLowerCase(),
    bot_stage: botStage || null, listings_sent: orNull(lead.listings_sent),
    sofia_notes: [s(lead.notes), s(lead.appointment) && `Visit request: ${s(lead.appointment)}`].filter(Boolean).join('\n') || null,
    source_ad: orNull(lead.source_ad), last_message: orNull(lead.last_message),
    last_inbound_at: s(lead.last_inbound_at) && !isNaN(Date.parse(s(lead.last_inbound_at))) ? s(lead.last_inbound_at) : null,
    raw: lead,
  }
  const stage = nextStage(existing?.stage ?? null, !!existing?.stage_set_by_hand, botStage)
  if (stage) row.stage = stage

  const q = existing ? db.from('leads').update(row).eq('id', existing.id) : db.from('leads').insert(row)
  const { data, error } = await q.select('id').single()
  if (error) return json(500, { error: error.message })
  return json(200, { ok: true, id: data.id })
})
