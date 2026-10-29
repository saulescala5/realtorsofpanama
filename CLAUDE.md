# Realtors of Panama: website

Public site + private admin for Realtors of Panama (RoP), a real estate network in Panama run by one
licensed broker (Saul) with AI. The site must look and read like a serious, larger company.

Live: https://realtorsofpanama.vercel.app (Vercel auto-deploys `main`; any other branch gets a preview URL).

## Stack
- Vite + React 18 + TypeScript + Tailwind 3 + react-router 6 + lucide-react
- Supabase project `zzxammemwajhwxydaclo` (Postgres, Auth, Storage bucket `listing-photos`, Edge Function `sofia-lead`)
- Maps: maplibre-gl with OpenFreeMap tiles (`src/components/MapView.tsx`, `City3D.tsx`)
- Without `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` the app runs on demo data (`src/lib/demo.ts`, localStorage).

## Commands
- `npm install`, `npm run dev`, `npm run build` (runs `tsc --noEmit` first), `npm run preview`
- Always run `npx tsc --noEmit` before committing. Check UI changes in a browser at desktop and 390px widths.

## Where things are
- `src/pages/`: Home, Explore (search + filters sheet), PropertyDetail, Neighborhoods, Guides, ListProperty
  ("Publish your property", 5 steps), Network ("Work with us", role-based form), Saved, Contact, Auth, `admin/*`
- `src/components/`: PropertyCard (carousel, photo/video/3D tabs, flip), HeroSearch, HeroCollage, HoodCards,
  Audiences, Interactive (matcher, mortgage calculator, alerts), icons (WhatsApp mark + duotone `Spot` icons)
- `src/lib/`: `store.tsx` (all data access, Supabase ↔ app mapping), `types.ts`, `neighborhoods.ts`,
  `market.ts` (per-area price ranges, labeled as our own market reading), `guides.ts` (blog, static), `seo.ts`
  (`useSeo` sets title/meta/JSON-LD per page)
- `src/i18n/en.ts`, `es.ts`: shared copy. Many components keep their own small `{ en, es }` objects.
- `supabase/schema.sql` + `supabase/migrations/*` (run by hand in the Supabase SQL editor)
- `public/llms.txt`, `public/sitemap.xml`, `public/robots.txt`: AI/SEO discoverability. Update them when pages are added.

## Database notes
- `properties` columns match what Sofia (the WhatsApp agent in n8n) queries. Don't rename columns.
- Sofia only offers rows with `status = 'active'` and `listing_by` not null. Sample listings have `listing_by` null
  and `is_sample = true`.
- `property_private` holds listing sources and broker contacts: admin-only, never shown on the site or to Sofia.
- Migrations run so far: schema.sql, 003_import_lovable_listings.sql (58 live listings). Pending until Saul confirms:
  004_virtual_tour.sql (3D tour URL) and 005_admin_tools.sql (private `bolsa` bucket, `contracts`, `admin_settings`).
  002_sample_listings.sql is optional.

## Admin tools (private)
- `/admin/bolsa` (`src/pages/admin/Bolsa.tsx`, `src/lib/bolsa.ts`): Bolsa de Brokers. Saul uploads WhatsApp group exports (.zip)
  (data.json also accepted). `src/lib/bolsaEngine.ts` (his Bolsa engine) builds offers/requests/brokers/matches in the browser.
  Raw chats (`chats.json.gz`) and the result (`data.json.gz`) live in the private bucket `bolsa` (admin-only RLS). Tabs: offers, requests, matches, brokers,
  zones. "Create listing" pre-fills the listing editor and stores the broker in `property_private` (source code `bolsa:<key>`).
  "Send to client" sends a client-safe text (no broker/source). The client drawer in `/admin/clients` shows matching
  published listings and Bolsa offers.
- `/admin/contracts` (`src/pages/admin/Contracts.tsx`, `src/lib/contracts.ts`): Saul's contract templates (authorization,
  lease, promise, sale). Saves to `contracts`; broker profile in `admin_settings.broker_profile`. Prefill with
  `?property=<id>` or `?lead=<id>`. ID photos are not saved to the database. The file is `@ts-nocheck` (ported JSX).

## Rules
- No personal info anywhere public: no personal email, no owner name. Public contact is WhatsApp
  +507 6854-8420 and the office "Calle 50, Torre Global Bank, Panama City".
- Never reveal the Bolsa de Brokers, WhatsApp broker groups, the listing workflow, or where listings come from.
  Say "our network".
- Copy is about the client and their needs. Don't keep repeating "licensed agents"; it's fine on Work with us.
- Never commit secrets. Only the Supabase publishable key goes in Vercel env vars.
- Bilingual: every visible string needs EN and ES.
- Design: light neutral (paper #F4F4F2, white cards, ink #000), gold #E3C46E only as small accents. Fonts: Instrument Sans
  (display, condensed) + Inter Tight. Rounded cards (22–32px), soft shadows, no busy motion.

## Next up
- Domain: point realtorsofpanama.com to Vercel, then update `SITE_URL` fallbacks, sitemap and llms.txt.
- Consider prerendering public pages for better SEO/LLM crawling.
