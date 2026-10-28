-- Realtors of Panama — database schema (Supabase / Postgres)
-- Paste this whole file into Supabase → SQL Editor → Run, once, on a new project.
--
-- Who can do what:
--   * Anyone (anon): read ACTIVE listings and their photos; submit a lead from the website.
--   * Admin (you):   everything. Admins are listed in public.admins.
--   * Sofia (n8n):   reads active listings with the public key (same as the website);
--                    writes leads only through the sofia-lead Edge Function (service role).
--
-- Column names of properties/property_images match what Sofia's n8n tools query,
-- so Sofia keeps working by only changing supabase_url / supabase_key in her Config.


-- ---------------------------------------------------------------- admins
create table public.admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);
alter table public.admins enable row level security;

create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;

create policy "admins read admins" on public.admins for select to authenticated using (public.is_admin());

-- The first account created with this e-mail becomes admin automatically.
create or replace function public.make_owner_admin() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if lower(new.email) = 'escala.saul@gmail.com' then
    insert into public.admins (user_id) values (new.id) on conflict do nothing;
  end if;
  return new;
end; $$;
create trigger on_auth_user_created_admin after insert on auth.users
  for each row execute function public.make_owner_admin();

-- ---------------------------------------------------------------- listings
create table public.properties (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  title_es text,
  description text not null default '',
  description_es text,
  type text not null check (type in ('sale', 'rent')),
  property_type text not null default 'apartment'
    check (property_type in ('apartment', 'penthouse', 'studio', 'house', 'land', 'commercial', 'office')),
  price numeric not null check (price >= 0),
  currency text not null default 'USD',
  bedrooms int not null default 0,
  bathrooms numeric not null default 0,
  area numeric not null default 0,
  parking int not null default 0,
  location text not null default '',          -- neighborhood slug, e.g. punta-pacifica
  city text not null default 'Panama City',
  full_address text,
  latitude double precision,
  longitude double precision,
  furnishing_status text check (furnishing_status in ('empty', 'linea_blanca', 'furnished')),
  pet_policy text,
  features jsonb not null default '[]'::jsonb,
  property_amenities jsonb not null default '[]'::jsonb,
  hoa numeric,
  deposit numeric,
  floor_number int,
  utilities_included text,
  available_date date,
  lease_length text,
  financing_available boolean,
  video_url text,
  video_poster_url text,
  status text not null default 'draft' check (status in ('draft', 'active', 'rented', 'sold', 'archived')),
  listing_by text not null default 'broker',  -- Sofia only searches listings where this is set
  featured boolean not null default false,
  views int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index properties_status_idx on public.properties (status, type);

create table public.property_images (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties(id) on delete cascade,
  image_url text not null,
  display_order int not null default 0,
  created_at timestamptz not null default now()
);
create index property_images_property_idx on public.property_images (property_id, display_order);

-- Where a listing came from. Admin only; never visible on the website or to Sofia.
create table public.property_private (
  property_id uuid primary key references public.properties(id) on delete cascade,
  source_code text unique,          -- external_code from the listing workflow (re-import updates)
  source_link text,
  source_contact_name text,
  source_contact_phone text,
  source_contact_email text,
  commission_note text,             -- e.g. "50/50 con Juan, confirmado por WhatsApp 28/10"
  notes text,
  updated_at timestamptz not null default now()
);

alter table public.properties enable row level security;
alter table public.property_images enable row level security;
alter table public.property_private enable row level security;

create policy "public reads active listings" on public.properties for select
  using (status = 'active' or public.is_admin());
create policy "admin writes listings" on public.properties for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

create policy "public reads photos of active listings" on public.property_images for select
  using (public.is_admin() or exists (select 1 from public.properties p where p.id = property_id and p.status = 'active'));
create policy "admin writes photos" on public.property_images for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

create policy "admin only private data" on public.property_private for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- Visitors may bump the view counter, nothing else.
create or replace function public.add_view(pid uuid) returns void
language sql security definer set search_path = public as $$
  update public.properties set views = views + 1 where id = pid and status = 'active';
$$;
grant execute on function public.add_view(uuid) to anon, authenticated;

-- ---------------------------------------------------------------- leads (CRM)
create table public.leads (
  id uuid primary key default gen_random_uuid(),
  phone text,
  name text not null default '',
  email text,
  language text,
  interest text,                     -- rent | buy | sell | rent_out | broker
  property_type text,
  bedrooms text,
  areas text,
  budget text,
  budget_min numeric,
  budget_max numeric,
  timeline text,
  financing text,
  score text,                        -- hot | warm | cold (from Sofia)
  bot_stage text,                    -- Sofia's own stage
  stage text not null default 'new'
    check (stage in ('new', 'contacted', 'showing', 'negotiating', 'won', 'lost')),
  stage_set_by_hand boolean not null default false,
  listings_sent text,
  sofia_notes text,                  -- what Sofia learned
  my_notes text,                     -- yours; Sofia never writes here
  message text,                      -- first message from a website form
  source text not null default 'web' check (source in ('whatsapp', 'web')),
  source_ad text,
  property_id uuid references public.properties(id) on delete set null,
  last_inbound_at timestamptz,
  last_message text,
  raw jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index leads_phone_whatsapp_idx on public.leads (phone) where source = 'whatsapp';
create index leads_stage_idx on public.leads (stage, updated_at desc);
alter table public.leads enable row level security;

create policy "admin manages leads" on public.leads for all to authenticated
  using (public.is_admin()) with check (public.is_admin());
-- Website forms: anyone can create a web lead, but can't read or change any.
create policy "website creates web leads" on public.leads for insert to anon, authenticated
  with check (source = 'web' and stage = 'new' and char_length(name) between 1 and 120
              and coalesce(char_length(message), 0) <= 2000 and coalesce(char_length(phone), 0) <= 40);

-- A stage you change by hand is never moved by Sofia again.
create or replace function public.leads_touch() returns trigger
language plpgsql set search_path = public as $$
begin
  new.updated_at := now();
  if tg_op = 'UPDATE' and new.stage is distinct from old.stage and current_user = 'authenticated' then
    new.stage_set_by_hand := true;
  end if;
  return new;
end; $$;
create trigger leads_touch before update on public.leads for each row execute function public.leads_touch();

create or replace function public.touch_updated_at() returns trigger
language plpgsql as $$ begin new.updated_at := now(); return new; end; $$;
create trigger properties_touch before update on public.properties for each row execute function public.touch_updated_at();
create trigger property_private_touch before update on public.property_private for each row execute function public.touch_updated_at();

-- ---------------------------------------------------------------- photo storage
insert into storage.buckets (id, name, public) values ('listing-photos', 'listing-photos', true)
  on conflict (id) do nothing;
create policy "public reads listing photos" on storage.objects for select using (bucket_id = 'listing-photos');
create policy "admin uploads listing photos" on storage.objects for insert to authenticated
  with check (bucket_id = 'listing-photos' and public.is_admin());
create policy "admin updates listing photos" on storage.objects for update to authenticated
  using (bucket_id = 'listing-photos' and public.is_admin());
create policy "admin deletes listing photos" on storage.objects for delete to authenticated
  using (bucket_id = 'listing-photos' and public.is_admin());
