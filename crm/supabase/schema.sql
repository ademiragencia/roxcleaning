-- ============================================================================
-- Rox Cleaning CRM — database schema
-- Run this in the Supabase SQL Editor (Dashboard → SQL → New query → Run).
-- Safe to run once on a fresh project.
-- ============================================================================

-- Extensions ----------------------------------------------------------------
create extension if not exists "pgcrypto";

-- ============================================================================
-- PROFILES (one row per app user, linked to Supabase Auth)
-- ============================================================================
create table if not exists public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  full_name   text,
  phone       text,
  role        text not null default 'staff' check (role in ('admin', 'staff')),
  created_at  timestamptz not null default now()
);

-- Admin check as SECURITY DEFINER to avoid RLS recursion on profiles.
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- New auth users automatically get a profile. The FIRST user becomes admin
-- (the business owner), everyone after is staff by default.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  is_first boolean;
begin
  select count(*) = 0 into is_first from public.profiles;
  insert into public.profiles (id, full_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.email),
    case when is_first then 'admin' else 'staff' end
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================================
-- CLIENTS
-- ============================================================================
create table if not exists public.clients (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  email       text,
  phone       text,
  address     text,
  city        text,
  notes       text,
  created_by  uuid references public.profiles (id) on delete set null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ============================================================================
-- LEADS (estimate requests — the website form inserts straight into here)
-- ============================================================================
create table if not exists public.leads (
  id             uuid primary key default gen_random_uuid(),
  name           text not null,
  email          text,
  phone          text,
  location       text,
  bedrooms       text,
  bathrooms      text,
  cleaning_type  text,
  kids           text,
  pets           text,
  frequency      text,
  message        text,
  source         text default 'website',
  status         text not null default 'new'
                 check (status in ('new', 'contacted', 'quoted', 'won', 'lost')),
  client_id      uuid references public.clients (id) on delete set null,
  created_at     timestamptz not null default now()
);

-- ============================================================================
-- JOBS (scheduled cleanings)
-- ============================================================================
create table if not exists public.jobs (
  id            uuid primary key default gen_random_uuid(),
  client_id     uuid references public.clients (id) on delete set null,
  title         text not null,
  service_type  text default 'house'
                check (service_type in ('house', 'office', 'store', 'str', 'other')),
  scheduled_at  timestamptz,
  duration_min  int default 120,
  status        text not null default 'scheduled'
                check (status in ('scheduled', 'done', 'canceled')),
  recurrence    text not null default 'none'
                check (recurrence in ('none', 'weekly', 'biweekly', 'monthly')),
  assigned_to   uuid references public.profiles (id) on delete set null,
  price         numeric(10,2),
  notes         text,
  created_at    timestamptz not null default now()
);

-- ============================================================================
-- DOCUMENTS (quotes + invoices share one table via `kind`)
-- ============================================================================
create table if not exists public.documents (
  id          uuid primary key default gen_random_uuid(),
  kind        text not null default 'invoice' check (kind in ('quote', 'invoice')),
  number      text,
  client_id   uuid references public.clients (id) on delete set null,
  job_id      uuid references public.jobs (id) on delete set null,
  issue_date  date default current_date,
  due_date    date,
  status      text not null default 'draft'
              check (status in ('draft', 'sent', 'paid', 'overdue', 'accepted', 'declined')),
  subtotal    numeric(10,2) not null default 0,
  tax         numeric(10,2) not null default 0,
  total       numeric(10,2) not null default 0,
  notes       text,
  created_at  timestamptz not null default now()
);

create table if not exists public.document_items (
  id           uuid primary key default gen_random_uuid(),
  document_id  uuid not null references public.documents (id) on delete cascade,
  description  text not null,
  qty          numeric(10,2) not null default 1,
  unit_price   numeric(10,2) not null default 0,
  amount       numeric(10,2) not null default 0
);

-- Helpful indexes -----------------------------------------------------------
create index if not exists idx_leads_status on public.leads (status);
create index if not exists idx_jobs_scheduled on public.jobs (scheduled_at);
create index if not exists idx_jobs_assigned on public.jobs (assigned_to);
create index if not exists idx_documents_client on public.documents (client_id);

-- ============================================================================
-- ROW LEVEL SECURITY
-- Model: admins do everything. Staff read clients, read leads, and read/update
-- only the jobs assigned to them. The public website may INSERT leads only.
-- ============================================================================
alter table public.profiles       enable row level security;
alter table public.clients        enable row level security;
alter table public.leads          enable row level security;
alter table public.jobs           enable row level security;
alter table public.documents      enable row level security;
alter table public.document_items enable row level security;

-- Profiles: anyone signed in can read (needed for assignee names); you can edit
-- yourself; admins can edit anyone.
drop policy if exists profiles_select on public.profiles;
create policy profiles_select on public.profiles
  for select to authenticated using (true);
drop policy if exists profiles_update_self on public.profiles;
create policy profiles_update_self on public.profiles
  for update to authenticated using (id = auth.uid() or public.is_admin());
drop policy if exists profiles_admin_all on public.profiles;
create policy profiles_admin_all on public.profiles
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- Clients: admins full; staff read only.
drop policy if exists clients_admin on public.clients;
create policy clients_admin on public.clients
  for all to authenticated using (public.is_admin()) with check (public.is_admin());
drop policy if exists clients_staff_read on public.clients;
create policy clients_staff_read on public.clients
  for select to authenticated using (true);

-- Leads: admins full; the public website can insert (estimate form).
drop policy if exists leads_admin on public.leads;
create policy leads_admin on public.leads
  for all to authenticated using (public.is_admin()) with check (public.is_admin());
drop policy if exists leads_public_insert on public.leads;
create policy leads_public_insert on public.leads
  for insert to anon with check (true);

-- Jobs: admins full; staff read + update their own assigned jobs.
drop policy if exists jobs_admin on public.jobs;
create policy jobs_admin on public.jobs
  for all to authenticated using (public.is_admin()) with check (public.is_admin());
drop policy if exists jobs_staff_read on public.jobs;
create policy jobs_staff_read on public.jobs
  for select to authenticated using (assigned_to = auth.uid() or public.is_admin());
drop policy if exists jobs_staff_update on public.jobs;
create policy jobs_staff_update on public.jobs
  for update to authenticated using (assigned_to = auth.uid()) with check (assigned_to = auth.uid());

-- Documents (quotes/invoices): admins only.
drop policy if exists documents_admin on public.documents;
create policy documents_admin on public.documents
  for all to authenticated using (public.is_admin()) with check (public.is_admin());
drop policy if exists document_items_admin on public.document_items;
create policy document_items_admin on public.document_items
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- ============================================================================
-- APPLICANTS  (job applications from the standalone careers.html form)
-- The public careers page may INSERT only. Admins see/manage everything.
-- ============================================================================
create table if not exists public.applicants (
  id                 uuid primary key default gen_random_uuid(),
  created_at         timestamptz not null default now(),
  full_name          text not null,
  email              text,
  phone              text,
  location           text,
  legal_to_work      text,
  has_transport      text,
  english_self       text,
  has_experience     text,
  years_experience   text,
  experience_details text,
  availability       text,
  start_date         date,
  hours_note         text,
  test_answers       jsonb not null default '{}'::jsonb,
  writing_sample     text,
  why_join           text,
  status             text not null default 'new'
                     check (status in ('new','screening','interview','hired','rejected')),
  source             text
);

create index if not exists idx_applicants_created on public.applicants (created_at desc);
create index if not exists idx_applicants_status on public.applicants (status);

alter table public.applicants enable row level security;

drop policy if exists applicants_admin on public.applicants;
create policy applicants_admin on public.applicants
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists applicants_public_insert on public.applicants;
create policy applicants_public_insert on public.applicants
  for insert to anon with check (true);
