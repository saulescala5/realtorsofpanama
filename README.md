# Realtors of Panama — website

Public site + private admin for one broker. Built from the Homzty MVP, trimmed down:
no sign-ups, no roles, no pricing, no calendar. Every contact button opens WhatsApp
with Sofia (+507 6854-8420).

| Area | Route | What it does |
|---|---|---|
| Home | `/` | Search, featured listings, services, owner call to action |
| Properties | `/properties` | Filters (rent/sale, type, beds, price), search |
| Property | `/property/:id` | Gallery, video, details, map, WhatsApp button (with listing ref), optional contact form |
| Owners | `/list-your-property` | Owner form → lands in Clients as "Owner (sell / rent out)" |
| Contact | `/contact` | |
| Admin | `/admin` (sign in at `/login`) | Overview with hot clients, Listings, Clients (CRM), Import package |

## Set up (once)

1. **Supabase**: new project → SQL Editor → paste `supabase/schema.sql` → Run.
   Authentication → Providers → Email: turn **off** "Allow new users to sign up" after you create your account.
   Create your account (Authentication → Users → Add user) with **escala.saul@gmail.com**: it becomes admin automatically.
2. **Vercel**: Add New → Project → import this repo. Environment variables:
   `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` (Supabase → Settings → API). Deploy.
   Without them the site runs in preview mode with demo data.
3. **Sofia → CRM**: deploy the lead endpoint
   `supabase functions deploy sofia-lead --no-verify-jwt` and set secret `SOFIA_SYNC_SECRET`.
   In n8n Config: `supabase_url` / `supabase_key` = the new project, `website_sync_url` =
   `https://<project>.supabase.co/functions/v1/sofia-lead`, `website_sync_secret` = same secret,
   `listing_url_base` = `https://<your domain>/property/`.
4. **Domain**: point realtorsofpanama.com to Vercel when ready.

## Publishing a listing

- **From the listing workflow**: Admin → Listings → Import package → pick the listing folder
  (or its `Website` folder). Photos, video, details and the private source contact come in;
  the same `external_code` again updates instead of duplicating.
- **By hand**: Admin → Listings → New listing. "Fill from a link or pasted text" reads a broker's
  WhatsApp post. The **Source (private)** section is only visible to you: never on the site or to Sofia.

## Develop

```bash
npm install
npm run dev      # http://localhost:5173
npm run build
```
