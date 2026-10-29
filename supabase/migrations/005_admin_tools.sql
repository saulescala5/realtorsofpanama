-- Admin-only tools: Bolsa de Brokers file, saved contracts and admin settings.
-- Nothing here is readable by visitors or by Sofia.

-- Private bucket for the Bolsa de Brokers data file (data.json, stored gzipped).
insert into storage.buckets (id, name, public) values ('bolsa', 'bolsa', false)
on conflict (id) do nothing;
drop policy if exists "admin reads bolsa" on storage.objects;
drop policy if exists "admin writes bolsa" on storage.objects;
drop policy if exists "admin updates bolsa" on storage.objects;
drop policy if exists "admin deletes bolsa" on storage.objects;
create policy "admin reads bolsa" on storage.objects for select to authenticated using (bucket_id = 'bolsa' and public.is_admin());
create policy "admin writes bolsa" on storage.objects for insert to authenticated with check (bucket_id = 'bolsa' and public.is_admin());
create policy "admin updates bolsa" on storage.objects for update to authenticated using (bucket_id = 'bolsa' and public.is_admin());
create policy "admin deletes bolsa" on storage.objects for delete to authenticated using (bucket_id = 'bolsa' and public.is_admin());

-- Saved contracts.
create table if not exists public.contracts (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('auth', 'rental', 'promise', 'sale')),
  title text not null default '',
  status text not null default 'draft' check (status in ('draft', 'sent', 'signed', 'cancelled')),
  data jsonb not null default '{}'::jsonb,
  property_id uuid references public.properties(id) on delete set null,
  lead_id uuid references public.leads(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.contracts enable row level security;
drop policy if exists "admin manages contracts" on public.contracts;
create policy "admin manages contracts" on public.contracts for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- Small key/value settings (broker profile used to prefill contracts).
create table if not exists public.admin_settings (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);
alter table public.admin_settings enable row level security;
drop policy if exists "admin manages settings" on public.admin_settings;
create policy "admin manages settings" on public.admin_settings for all to authenticated
  using (public.is_admin()) with check (public.is_admin());
