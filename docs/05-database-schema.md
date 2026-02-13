# 05 — Database Schema & Supabase Configuration

> Simple CRM — Production-ready Supabase database schema with RLS, triggers, storage, and seed data.

---

## Table of Contents

1. [Entity Relationship Overview](#1-entity-relationship-overview)
2. [Complete SQL Schema](#2-complete-sql-schema)
3. [Indexes](#3-indexes)
4. [Row Level Security (RLS)](#4-row-level-security-rls)
5. [Triggers and Functions](#5-triggers-and-functions)
6. [Storage Buckets](#6-storage-buckets)
7. [Seed Data](#7-seed-data)

---

## 1. Entity Relationship Overview

```
┌──────────────────────────────────────────────────────────────────────────┐
│                          auth.users (Supabase)                          │
│                              id (uuid, PK)                              │
└──────────────────────┬───────────────────────────────────────────────────┘
                       │ 1:1
                       ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                              profiles                                    │
│  id (uuid, PK, FK → auth.users)                                         │
│  full_name, avatar_url, created_at, updated_at                           │
└──┬───────────┬───────────┬───────────┬──────────┬───────────┬────────────┘
   │           │           │           │          │           │
   │ 1:N       │ 1:N       │ 1:N       │ 1:N      │ 1:N       │ 1:N
   ▼           ▼           ▼           ▼          ▼           ▼
┌────────┐ ┌────────┐ ┌──────────┐ ┌───────┐ ┌──────────┐ ┌──────┐
│contacts│ │companies│ │deal_stages│ │ deals │ │activities│ │ tags │
└──┬─────┘ └──┬─────┘ └────┬─────┘ └───┬───┘ └──────────┘ └──┬───┘
   │           │            │           │                      │
   │    ┌──────┘            │           │                      │
   │    │  contacts.company_id ─────────┤                      │
   │    │                   │           │                      │
   │    │     deals.stage_id ───────────┘                      │
   │    │     deals.contact_id ─────────── contacts            │
   │    │     deals.company_id ─────────── companies           │
   │    │                                                      │
   │    │  activities.contact_id ────────── contacts            │
   │    │  activities.company_id ────────── companies           │
   │    │  activities.deal_id ───────────── deals               │
   │    │                                                      │
   │    │  notes.contact_id ─────────────── contacts            │
   │    │  notes.company_id ─────────────── companies           │
   │    │  notes.deal_id ────────────────── deals               │
   │    │                                                      │
   │    └──────────────────────────────────────────────────────┘
   │
   │  N:M (via contact_tags)             N:M (via deal_tags)
   ├──────────────────── tags ◄──────────── deals
   │
   └─── contact_tags (contact_id, tag_id)
        deal_tags    (deal_id, tag_id)
```

### Relationship Summary

| Relationship | Type | Description |
|---|---|---|
| auth.users → profiles | 1:1 | Each auth user has exactly one profile |
| profiles → contacts | 1:N | A user owns many contacts |
| profiles → companies | 1:N | A user owns many companies |
| profiles → deal_stages | 1:N | A user owns their pipeline stages |
| profiles → deals | 1:N | A user owns many deals |
| profiles → activities | 1:N | A user owns many activities |
| profiles → notes | 1:N | A user owns many notes |
| profiles → tags | 1:N | A user owns many tags |
| companies → contacts | 1:N | A company has many contacts |
| deal_stages → deals | 1:N | A stage contains many deals |
| contacts → deals | 1:N | A contact can be linked to many deals |
| companies → deals | 1:N | A company can be linked to many deals |
| contacts ↔ tags | N:M | Via contact_tags junction table |
| deals ↔ tags | N:M | Via deal_tags junction table |

---

## 2. Complete SQL Schema

### 2.1 Extensions

```sql
-- ============================================================
-- Enable required extensions
-- ============================================================
create extension if not exists "pgcrypto";   -- gen_random_uuid()
create extension if not exists "pg_trgm";    -- trigram indexes for fuzzy search
```

### 2.2 profiles

```sql
-- ============================================================
-- profiles — extends Supabase auth.users
-- ============================================================
create table public.profiles (
  id         uuid        primary key references auth.users(id) on delete cascade,
  full_name  text        not null default '',
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table  public.profiles            is 'User profiles extending Supabase auth.users.';
comment on column public.profiles.id         is 'References auth.users(id). Set automatically on sign-up.';
comment on column public.profiles.full_name  is 'Display name shown throughout the CRM.';
comment on column public.profiles.avatar_url is 'URL to avatar image in the avatars storage bucket.';
```

### 2.3 companies

```sql
-- ============================================================
-- companies
-- ============================================================
create table public.companies (
  id         uuid        primary key default gen_random_uuid(),
  user_id    uuid        not null references public.profiles(id) on delete cascade,
  name       text        not null,
  domain     text,
  industry   text,
  size       text        check (size in ('1-10', '11-50', '51-200', '201-500', '500+')),
  address    jsonb,                -- {street, city, state, zip, country}
  phone      text,
  website    text,
  logo_url   text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table  public.companies         is 'Companies / organizations in the CRM.';
comment on column public.companies.size    is 'Employee headcount range: 1-10, 11-50, 51-200, 201-500, 500+.';
comment on column public.companies.address is 'JSON object: {street, city, state, zip, country}.';
```

### 2.4 contacts

```sql
-- ============================================================
-- contacts
-- ============================================================
create table public.contacts (
  id           uuid        primary key default gen_random_uuid(),
  user_id      uuid        not null references public.profiles(id) on delete cascade,
  first_name   text        not null,
  last_name    text        not null,
  email        text,
  phone        text,
  company_id   uuid        references public.companies(id) on delete set null,
  position     text,
  address      jsonb,               -- {street, city, state, zip, country}
  social_links jsonb,               -- {linkedin, twitter, ...}
  notes        text,
  avatar_url   text,
  status       text        not null default 'active'
                           check (status in ('active', 'inactive', 'archived')),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

comment on table  public.contacts              is 'Individual contacts / people in the CRM.';
comment on column public.contacts.status       is 'Lifecycle status: active, inactive, or archived.';
comment on column public.contacts.address      is 'JSON object: {street, city, state, zip, country}.';
comment on column public.contacts.social_links is 'JSON object: {linkedin, twitter, ...}.';
```

### 2.5 deal_stages

```sql
-- ============================================================
-- deal_stages — user-customizable pipeline stages
-- ============================================================
create table public.deal_stages (
  id         uuid        primary key default gen_random_uuid(),
  user_id    uuid        not null references public.profiles(id) on delete cascade,
  name       text        not null,
  color      text        not null,           -- hex color e.g. '#3B82F6'
  position   integer     not null,           -- ordering within the pipeline
  is_won     boolean     not null default false,
  is_lost    boolean     not null default false,
  created_at timestamptz not null default now(),

  -- A stage cannot be both won and lost
  constraint deal_stages_won_lost_check check (not (is_won and is_lost)),
  -- Unique ordering per user
  constraint deal_stages_user_position_unique unique (user_id, position)
);

comment on table  public.deal_stages          is 'Customizable pipeline stages per user.';
comment on column public.deal_stages.position is 'Display order. Lower numbers appear first (left in Kanban).';
comment on column public.deal_stages.is_won   is 'True if this stage represents a won deal.';
comment on column public.deal_stages.is_lost  is 'True if this stage represents a lost deal.';
```

### 2.6 deals

```sql
-- ============================================================
-- deals
-- ============================================================
create table public.deals (
  id                  uuid          primary key default gen_random_uuid(),
  user_id             uuid          not null references public.profiles(id) on delete cascade,
  title               text          not null,
  value               numeric(12,2),
  stage_id            uuid          not null references public.deal_stages(id) on delete restrict,
  contact_id          uuid          references public.contacts(id) on delete set null,
  company_id          uuid          references public.companies(id) on delete set null,
  probability         integer       check (probability >= 0 and probability <= 100),
  expected_close_date date,
  closed_at           timestamptz,
  close_reason        text,
  description         text,
  created_at          timestamptz   not null default now(),
  updated_at          timestamptz   not null default now()
);

comment on table  public.deals                    is 'Sales deals / opportunities in the pipeline.';
comment on column public.deals.value               is 'Monetary value of the deal (up to 9,999,999,999.99).';
comment on column public.deals.probability         is 'Win probability percentage (0-100).';
comment on column public.deals.expected_close_date is 'Forecasted close date.';
comment on column public.deals.closed_at           is 'Timestamp when the deal was closed (won or lost).';
comment on column public.deals.close_reason        is 'Free-text reason when closing a deal.';
```

### 2.7 activities

```sql
-- ============================================================
-- activities — calls, emails, meetings, tasks, notes
-- ============================================================
create table public.activities (
  id           uuid        primary key default gen_random_uuid(),
  user_id      uuid        not null references public.profiles(id) on delete cascade,
  type         text        not null
                           check (type in ('call', 'email', 'meeting', 'task', 'note')),
  title        text        not null,
  description  text,
  contact_id   uuid        references public.contacts(id) on delete set null,
  company_id   uuid        references public.companies(id) on delete set null,
  deal_id      uuid        references public.deals(id) on delete set null,
  due_date     timestamptz,
  completed_at timestamptz,
  is_completed boolean     not null default false,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

comment on table  public.activities      is 'Activity log: calls, emails, meetings, tasks, notes.';
comment on column public.activities.type is 'One of: call, email, meeting, task, note.';
```

### 2.8 notes

```sql
-- ============================================================
-- notes — standalone notes linked to contacts, companies, or deals
-- ============================================================
create table public.notes (
  id         uuid        primary key default gen_random_uuid(),
  user_id    uuid        not null references public.profiles(id) on delete cascade,
  content    text        not null,
  contact_id uuid        references public.contacts(id) on delete cascade,
  company_id uuid        references public.companies(id) on delete cascade,
  deal_id    uuid        references public.deals(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.notes is 'Rich-text notes attached to contacts, companies, or deals.';
```

### 2.9 tags

```sql
-- ============================================================
-- tags — user-scoped labels
-- ============================================================
create table public.tags (
  id         uuid        primary key default gen_random_uuid(),
  user_id    uuid        not null references public.profiles(id) on delete cascade,
  name       text        not null,
  color      text        not null,        -- hex color e.g. '#EF4444'
  created_at timestamptz not null default now(),

  constraint tags_user_name_unique unique (user_id, name)
);

comment on table public.tags is 'User-scoped tags/labels applied to contacts and deals.';
```

### 2.10 contact_tags (junction)

```sql
-- ============================================================
-- contact_tags — many-to-many contacts ↔ tags
-- ============================================================
create table public.contact_tags (
  contact_id uuid not null references public.contacts(id) on delete cascade,
  tag_id     uuid not null references public.tags(id) on delete cascade,
  primary key (contact_id, tag_id)
);

comment on table public.contact_tags is 'Junction table linking contacts to tags.';
```

### 2.11 deal_tags (junction)

```sql
-- ============================================================
-- deal_tags — many-to-many deals ↔ tags
-- ============================================================
create table public.deal_tags (
  deal_id uuid not null references public.deals(id) on delete cascade,
  tag_id  uuid not null references public.tags(id) on delete cascade,
  primary key (deal_id, tag_id)
);

comment on table public.deal_tags is 'Junction table linking deals to tags.';
```

---

## 3. Indexes

```sql
-- ============================================================
-- Indexes
-- ============================================================

-- contacts
create index idx_contacts_user_id            on public.contacts (user_id);
create index idx_contacts_user_name          on public.contacts (user_id, last_name, first_name);
create index idx_contacts_user_email         on public.contacts (user_id, email);
create index idx_contacts_company_id         on public.contacts (company_id);
create index idx_contacts_status             on public.contacts (user_id, status);

-- companies
create index idx_companies_user_id           on public.companies (user_id);
create index idx_companies_user_name         on public.companies (user_id, name);

-- deal_stages
create index idx_deal_stages_user_id         on public.deal_stages (user_id);

-- deals
create index idx_deals_user_id               on public.deals (user_id);
create index idx_deals_user_stage            on public.deals (user_id, stage_id);
create index idx_deals_user_close_date       on public.deals (user_id, expected_close_date);
create index idx_deals_contact_id            on public.deals (contact_id);
create index idx_deals_company_id            on public.deals (company_id);
create index idx_deals_stage_id              on public.deals (stage_id);

-- activities
create index idx_activities_user_id          on public.activities (user_id);
create index idx_activities_user_due_date    on public.activities (user_id, due_date);
create index idx_activities_user_contact     on public.activities (user_id, contact_id);
create index idx_activities_user_deal        on public.activities (user_id, deal_id);
create index idx_activities_company_id       on public.activities (company_id);
create index idx_activities_is_completed     on public.activities (user_id, is_completed) where not is_completed;

-- notes
create index idx_notes_user_id               on public.notes (user_id);
create index idx_notes_contact_id            on public.notes (contact_id);
create index idx_notes_company_id            on public.notes (company_id);
create index idx_notes_deal_id               on public.notes (deal_id);

-- tags
create index idx_tags_user_id                on public.tags (user_id);

-- junction tables (PKs already create indexes on both columns)
create index idx_contact_tags_tag_id         on public.contact_tags (tag_id);
create index idx_deal_tags_tag_id            on public.deal_tags (tag_id);

-- Full-text search (GIN indexes using pg_trgm for fuzzy matching)
create index idx_contacts_search_name        on public.contacts
  using gin ((first_name || ' ' || last_name) gin_trgm_ops);

create index idx_companies_search_name       on public.companies
  using gin (name gin_trgm_ops);
```

---

## 4. Row Level Security (RLS)

All tables use the same pattern: users can only access rows where `user_id = auth.uid()`.

```sql
-- ============================================================
-- Row Level Security — enable on every table
-- ============================================================
alter table public.profiles      enable row level security;
alter table public.contacts      enable row level security;
alter table public.companies     enable row level security;
alter table public.deal_stages   enable row level security;
alter table public.deals         enable row level security;
alter table public.activities    enable row level security;
alter table public.notes         enable row level security;
alter table public.tags          enable row level security;
alter table public.contact_tags  enable row level security;
alter table public.deal_tags     enable row level security;
```

### 4.1 profiles

```sql
-- profiles: users can read/update their own profile
create policy "profiles_select_own"
  on public.profiles for select
  using (id = auth.uid());

create policy "profiles_insert_own"
  on public.profiles for insert
  with check (id = auth.uid());

create policy "profiles_update_own"
  on public.profiles for update
  using (id = auth.uid())
  with check (id = auth.uid());

-- No delete policy — profiles are removed via auth.users cascade
```

### 4.2 Standard owner-based policies (contacts, companies, deal_stages, deals, activities, notes, tags)

```sql
-- ============================================================
-- Macro: owner-based CRUD policies
-- Applied to: contacts, companies, deal_stages, deals,
--             activities, notes, tags
-- ============================================================

-- contacts
create policy "contacts_select_own" on public.contacts
  for select using (user_id = auth.uid());
create policy "contacts_insert_own" on public.contacts
  for insert with check (user_id = auth.uid());
create policy "contacts_update_own" on public.contacts
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "contacts_delete_own" on public.contacts
  for delete using (user_id = auth.uid());

-- companies
create policy "companies_select_own" on public.companies
  for select using (user_id = auth.uid());
create policy "companies_insert_own" on public.companies
  for insert with check (user_id = auth.uid());
create policy "companies_update_own" on public.companies
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "companies_delete_own" on public.companies
  for delete using (user_id = auth.uid());

-- deal_stages
create policy "deal_stages_select_own" on public.deal_stages
  for select using (user_id = auth.uid());
create policy "deal_stages_insert_own" on public.deal_stages
  for insert with check (user_id = auth.uid());
create policy "deal_stages_update_own" on public.deal_stages
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "deal_stages_delete_own" on public.deal_stages
  for delete using (user_id = auth.uid());

-- deals
create policy "deals_select_own" on public.deals
  for select using (user_id = auth.uid());
create policy "deals_insert_own" on public.deals
  for insert with check (user_id = auth.uid());
create policy "deals_update_own" on public.deals
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "deals_delete_own" on public.deals
  for delete using (user_id = auth.uid());

-- activities
create policy "activities_select_own" on public.activities
  for select using (user_id = auth.uid());
create policy "activities_insert_own" on public.activities
  for insert with check (user_id = auth.uid());
create policy "activities_update_own" on public.activities
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "activities_delete_own" on public.activities
  for delete using (user_id = auth.uid());

-- notes
create policy "notes_select_own" on public.notes
  for select using (user_id = auth.uid());
create policy "notes_insert_own" on public.notes
  for insert with check (user_id = auth.uid());
create policy "notes_update_own" on public.notes
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "notes_delete_own" on public.notes
  for delete using (user_id = auth.uid());

-- tags
create policy "tags_select_own" on public.tags
  for select using (user_id = auth.uid());
create policy "tags_insert_own" on public.tags
  for insert with check (user_id = auth.uid());
create policy "tags_update_own" on public.tags
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "tags_delete_own" on public.tags
  for delete using (user_id = auth.uid());
```

### 4.3 Junction table policies

Junction tables don't have their own `user_id`. We validate ownership by joining to the parent table.

```sql
-- contact_tags: user must own the contact
create policy "contact_tags_select_own" on public.contact_tags
  for select using (
    exists (select 1 from public.contacts where id = contact_id and user_id = auth.uid())
  );
create policy "contact_tags_insert_own" on public.contact_tags
  for insert with check (
    exists (select 1 from public.contacts where id = contact_id and user_id = auth.uid())
  );
create policy "contact_tags_delete_own" on public.contact_tags
  for delete using (
    exists (select 1 from public.contacts where id = contact_id and user_id = auth.uid())
  );

-- deal_tags: user must own the deal
create policy "deal_tags_select_own" on public.deal_tags
  for select using (
    exists (select 1 from public.deals where id = deal_id and user_id = auth.uid())
  );
create policy "deal_tags_insert_own" on public.deal_tags
  for insert with check (
    exists (select 1 from public.deals where id = deal_id and user_id = auth.uid())
  );
create policy "deal_tags_delete_own" on public.deal_tags
  for delete using (
    exists (select 1 from public.deals where id = deal_id and user_id = auth.uid())
  );
```

---

## 5. Triggers and Functions

### 5.1 Auto-update `updated_at` timestamp

```sql
-- ============================================================
-- auto_update_timestamp() — sets updated_at = now() on UPDATE
-- ============================================================
create or replace function public.auto_update_timestamp()
returns trigger
language plpgsql
security definer
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

comment on function public.auto_update_timestamp()
  is 'Trigger function: automatically sets updated_at to current timestamp on row update.';

-- Apply to all tables with an updated_at column
create trigger trg_profiles_updated_at
  before update on public.profiles
  for each row execute function public.auto_update_timestamp();

create trigger trg_contacts_updated_at
  before update on public.contacts
  for each row execute function public.auto_update_timestamp();

create trigger trg_companies_updated_at
  before update on public.companies
  for each row execute function public.auto_update_timestamp();

create trigger trg_deals_updated_at
  before update on public.deals
  for each row execute function public.auto_update_timestamp();

create trigger trg_activities_updated_at
  before update on public.activities
  for each row execute function public.auto_update_timestamp();

create trigger trg_notes_updated_at
  before update on public.notes
  for each row execute function public.auto_update_timestamp();
```

### 5.2 Auto-create profile on sign-up

```sql
-- ============================================================
-- handle_new_user() — creates a profile row when a user signs up
-- ============================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    new.raw_user_meta_data ->> 'avatar_url'
  );
  return new;
end;
$$;

comment on function public.handle_new_user()
  is 'Trigger function: auto-creates a profiles row when a new user signs up via Supabase Auth.';

-- Attach to Supabase auth.users
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
```

### 5.3 Deal stage change tracking

When a deal moves between stages, we automatically set `closed_at` when entering a won/lost stage and clear it when moved back to an open stage.

```sql
-- ============================================================
-- handle_deal_stage_change() — tracks won/lost transitions
-- ============================================================
create or replace function public.handle_deal_stage_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_is_won  boolean;
  v_is_lost boolean;
begin
  -- Only fire when stage_id actually changes
  if old.stage_id is distinct from new.stage_id then
    select is_won, is_lost
      into v_is_won, v_is_lost
      from public.deal_stages
     where id = new.stage_id;

    if v_is_won or v_is_lost then
      -- Deal moved to a closed stage
      new.closed_at = coalesce(new.closed_at, now());
    else
      -- Deal moved back to an open stage
      new.closed_at = null;
      new.close_reason = null;
    end if;
  end if;

  return new;
end;
$$;

comment on function public.handle_deal_stage_change()
  is 'Trigger function: auto-sets closed_at when a deal enters a won/lost stage, clears it when returned to open.';

create trigger trg_deals_stage_change
  before update on public.deals
  for each row execute function public.handle_deal_stage_change();
```

### 5.4 Seed default pipeline stages on profile creation

```sql
-- ============================================================
-- seed_default_deal_stages() — creates default pipeline for new users
-- ============================================================
create or replace function public.seed_default_deal_stages()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.deal_stages (user_id, name, color, position, is_won, is_lost) values
    (new.id, 'Lead',        '#6B7280', 0, false, false),
    (new.id, 'Qualified',   '#3B82F6', 1, false, false),
    (new.id, 'Proposal',    '#8B5CF6', 2, false, false),
    (new.id, 'Negotiation', '#F59E0B', 3, false, false),
    (new.id, 'Closed Won',  '#10B981', 4, true,  false),
    (new.id, 'Closed Lost', '#EF4444', 5, false, true);
  return new;
end;
$$;

comment on function public.seed_default_deal_stages()
  is 'Trigger function: seeds the default 6-stage pipeline when a new profile is created.';

create trigger on_profile_created_seed_stages
  after insert on public.profiles
  for each row execute function public.seed_default_deal_stages();
```

---

## 6. Storage Buckets

```sql
-- ============================================================
-- Storage Buckets
-- ============================================================

-- avatars: public read, authenticated upload, max 2 MB, images only
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'avatars',
  'avatars',
  true,
  2097152,    -- 2 MB
  array['image/jpeg', 'image/png', 'image/gif', 'image/webp']
);

-- attachments: private, authenticated read/write, max 10 MB
insert into storage.buckets (id, name, public, file_size_limit)
values (
  'attachments',
  'attachments',
  false,
  10485760    -- 10 MB
);
```

### Storage RLS Policies

```sql
-- ============================================================
-- avatars bucket policies
-- ============================================================

-- Anyone can read avatars (bucket is public)
create policy "avatars_public_read"
  on storage.objects for select
  using (bucket_id = 'avatars');

-- Authenticated users can upload their own avatar (path: {user_id}/*)
create policy "avatars_auth_insert"
  on storage.objects for insert
  with check (
    bucket_id = 'avatars'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Users can update their own avatar
create policy "avatars_auth_update"
  on storage.objects for update
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Users can delete their own avatar
create policy "avatars_auth_delete"
  on storage.objects for delete
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- ============================================================
-- attachments bucket policies
-- ============================================================

-- Authenticated users can read their own attachments
create policy "attachments_auth_read"
  on storage.objects for select
  using (
    bucket_id = 'attachments'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Authenticated users can upload to their own folder
create policy "attachments_auth_insert"
  on storage.objects for insert
  with check (
    bucket_id = 'attachments'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Users can update their own attachments
create policy "attachments_auth_update"
  on storage.objects for update
  using (
    bucket_id = 'attachments'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Users can delete their own attachments
create policy "attachments_auth_delete"
  on storage.objects for delete
  using (
    bucket_id = 'attachments'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
```

---

## 7. Seed Data

> **Note:** This seed data is for development only. The test user UUID is hardcoded; in production, users are created via Supabase Auth and profiles are auto-populated by the `handle_new_user` trigger.

```sql
-- ============================================================
-- SEED DATA — Development Only
-- ============================================================

-- Fixed test user UUID
-- In development, create this user via Supabase Auth first, then
-- the handle_new_user trigger will create the profile automatically.
-- The seed below manually inserts data assuming that user exists.

do $$
declare
  v_user_id uuid := '00000000-0000-0000-0000-000000000001';

  -- Company IDs
  v_co_acme     uuid := gen_random_uuid();
  v_co_globex   uuid := gen_random_uuid();
  v_co_initech  uuid := gen_random_uuid();
  v_co_umbrella uuid := gen_random_uuid();
  v_co_stark    uuid := gen_random_uuid();
  v_co_wayne    uuid := gen_random_uuid();
  v_co_hooli    uuid := gen_random_uuid();
  v_co_piedpiper uuid := gen_random_uuid();

  -- Deal stage IDs (matching the default pipeline)
  v_stage_lead        uuid;
  v_stage_qualified   uuid;
  v_stage_proposal    uuid;
  v_stage_negotiation uuid;
  v_stage_won         uuid;
  v_stage_lost        uuid;

  -- Contact IDs (declared for deal/activity/note linking)
  v_c01 uuid := gen_random_uuid();
  v_c02 uuid := gen_random_uuid();
  v_c03 uuid := gen_random_uuid();
  v_c04 uuid := gen_random_uuid();
  v_c05 uuid := gen_random_uuid();
  v_c06 uuid := gen_random_uuid();
  v_c07 uuid := gen_random_uuid();
  v_c08 uuid := gen_random_uuid();
  v_c09 uuid := gen_random_uuid();
  v_c10 uuid := gen_random_uuid();
  v_c11 uuid := gen_random_uuid();
  v_c12 uuid := gen_random_uuid();
  v_c13 uuid := gen_random_uuid();
  v_c14 uuid := gen_random_uuid();
  v_c15 uuid := gen_random_uuid();
  v_c16 uuid := gen_random_uuid();
  v_c17 uuid := gen_random_uuid();
  v_c18 uuid := gen_random_uuid();

  -- Deal IDs
  v_d01 uuid := gen_random_uuid();
  v_d02 uuid := gen_random_uuid();
  v_d03 uuid := gen_random_uuid();
  v_d04 uuid := gen_random_uuid();
  v_d05 uuid := gen_random_uuid();
  v_d06 uuid := gen_random_uuid();
  v_d07 uuid := gen_random_uuid();
  v_d08 uuid := gen_random_uuid();
  v_d09 uuid := gen_random_uuid();
  v_d10 uuid := gen_random_uuid();
  v_d11 uuid := gen_random_uuid();
  v_d12 uuid := gen_random_uuid();
  v_d13 uuid := gen_random_uuid();

  -- Tag IDs
  v_tag_hot     uuid := gen_random_uuid();
  v_tag_vip     uuid := gen_random_uuid();
  v_tag_partner uuid := gen_random_uuid();
  v_tag_ref     uuid := gen_random_uuid();
  v_tag_churned uuid := gen_random_uuid();
  v_tag_enterprise uuid := gen_random_uuid();

begin
  -- --------------------------------------------------------
  -- 1. Test profile (assumes auth.users row already exists)
  -- --------------------------------------------------------
  insert into public.profiles (id, full_name, avatar_url)
  values (v_user_id, 'Alex Johnson', null)
  on conflict (id) do nothing;

  -- --------------------------------------------------------
  -- 2. Look up the default deal stages (created by trigger)
  -- --------------------------------------------------------
  select id into v_stage_lead        from public.deal_stages where user_id = v_user_id and name = 'Lead';
  select id into v_stage_qualified   from public.deal_stages where user_id = v_user_id and name = 'Qualified';
  select id into v_stage_proposal    from public.deal_stages where user_id = v_user_id and name = 'Proposal';
  select id into v_stage_negotiation from public.deal_stages where user_id = v_user_id and name = 'Negotiation';
  select id into v_stage_won         from public.deal_stages where user_id = v_user_id and name = 'Closed Won';
  select id into v_stage_lost        from public.deal_stages where user_id = v_user_id and name = 'Closed Lost';

  -- --------------------------------------------------------
  -- 3. Companies (8)
  -- --------------------------------------------------------
  insert into public.companies (id, user_id, name, domain, industry, size, phone, website, address) values
    (v_co_acme,      v_user_id, 'Acme Corp',           'acme.com',        'Manufacturing',  '201-500', '(555) 100-0001', 'https://acme.com',        '{"street":"100 Industrial Pkwy","city":"Austin","state":"TX","zip":"73301","country":"US"}'::jsonb),
    (v_co_globex,    v_user_id, 'Globex Corporation',   'globex.com',      'Technology',     '51-200',  '(555) 100-0002', 'https://globex.com',      '{"street":"200 Innovation Dr","city":"San Jose","state":"CA","zip":"95110","country":"US"}'::jsonb),
    (v_co_initech,   v_user_id, 'Initech',              'initech.com',     'Software',       '51-200',  '(555) 100-0003', 'https://initech.com',     '{"street":"300 Tech Blvd","city":"Dallas","state":"TX","zip":"75201","country":"US"}'::jsonb),
    (v_co_umbrella,  v_user_id, 'Umbrella Industries',  'umbrella.io',     'Biotechnology',  '500+',    '(555) 100-0004', 'https://umbrella.io',     '{"street":"400 Research Way","city":"Raccoon City","state":"CO","zip":"80201","country":"US"}'::jsonb),
    (v_co_stark,     v_user_id, 'Stark Ventures',       'starkv.com',      'Venture Capital','11-50',   '(555) 100-0005', 'https://starkv.com',      '{"street":"500 Market St","city":"San Francisco","state":"CA","zip":"94105","country":"US"}'::jsonb),
    (v_co_wayne,     v_user_id, 'Wayne Enterprises',    'wayne-ent.com',   'Conglomerate',   '500+',    '(555) 100-0006', 'https://wayne-ent.com',   '{"street":"1 Wayne Tower","city":"Gotham","state":"NJ","zip":"07001","country":"US"}'::jsonb),
    (v_co_hooli,     v_user_id, 'Hooli',                'hooli.xyz',       'Technology',     '500+',    '(555) 100-0007', 'https://hooli.xyz',       '{"street":"700 Campus Dr","city":"Palo Alto","state":"CA","zip":"94304","country":"US"}'::jsonb),
    (v_co_piedpiper, v_user_id, 'Pied Piper',           'piedpiper.com',   'Technology',     '1-10',    '(555) 100-0008', 'https://piedpiper.com',   '{"street":"5230 Newell Rd","city":"Palo Alto","state":"CA","zip":"94303","country":"US"}'::jsonb);

  -- --------------------------------------------------------
  -- 4. Contacts (18)
  -- --------------------------------------------------------
  insert into public.contacts (id, user_id, first_name, last_name, email, phone, company_id, position, status, address, social_links, notes) values
    (v_c01, v_user_id, 'Sarah',    'Chen',       'sarah.chen@acme.com',          '(555) 200-0001', v_co_acme,      'VP of Engineering',       'active',   '{"city":"Austin","state":"TX","country":"US"}'::jsonb,                     '{"linkedin":"linkedin.com/in/sarachen"}'::jsonb,             'Key technical decision-maker.'),
    (v_c02, v_user_id, 'Marcus',   'Williams',   'marcus.w@globex.com',          '(555) 200-0002', v_co_globex,    'CTO',                     'active',   '{"city":"San Jose","state":"CA","country":"US"}'::jsonb,                   '{"linkedin":"linkedin.com/in/marcusw","twitter":"@marcusw"}'::jsonb, 'Met at SaaStr 2024.'),
    (v_c03, v_user_id, 'Emily',    'Rodriguez',  'emily.r@initech.com',          '(555) 200-0003', v_co_initech,   'Director of Operations',  'active',   '{"city":"Dallas","state":"TX","country":"US"}'::jsonb,                     null,                                                          null),
    (v_c04, v_user_id, 'James',    'O''Brien',   'james.ob@umbrella.io',         '(555) 200-0004', v_co_umbrella,  'Head of Procurement',     'active',   '{"city":"Denver","state":"CO","country":"US"}'::jsonb,                     '{"linkedin":"linkedin.com/in/jamesob"}'::jsonb,              'Budget cycle starts Q3.'),
    (v_c05, v_user_id, 'Aisha',    'Patel',      'aisha@starkv.com',             '(555) 200-0005', v_co_stark,     'Managing Partner',        'active',   '{"city":"San Francisco","state":"CA","country":"US"}'::jsonb,              '{"linkedin":"linkedin.com/in/aishapatel","twitter":"@aishap"}'::jsonb, 'Warm intro from David Kim.'),
    (v_c06, v_user_id, 'David',    'Kim',        'david.kim@wayne-ent.com',      '(555) 200-0006', v_co_wayne,     'CFO',                     'active',   '{"city":"New York","state":"NY","country":"US"}'::jsonb,                   '{"linkedin":"linkedin.com/in/davidkim"}'::jsonb,             null),
    (v_c07, v_user_id, 'Lisa',     'Thompson',   'lisa.t@hooli.xyz',             '(555) 200-0007', v_co_hooli,     'Product Manager',         'active',   '{"city":"Palo Alto","state":"CA","country":"US"}'::jsonb,                  null,                                                          'Interested in enterprise plan.'),
    (v_c08, v_user_id, 'Robert',   'Garcia',     'robert.g@piedpiper.com',       '(555) 200-0008', v_co_piedpiper, 'CEO',                     'active',   '{"city":"Palo Alto","state":"CA","country":"US"}'::jsonb,                  '{"linkedin":"linkedin.com/in/rgarcia"}'::jsonb,              'Early-stage startup. Price-sensitive.'),
    (v_c09, v_user_id, 'Priya',    'Sharma',     'priya.sharma@acme.com',        '(555) 200-0009', v_co_acme,      'Software Engineer',       'active',   '{"city":"Austin","state":"TX","country":"US"}'::jsonb,                     null,                                                          'Technical evaluator for Acme deal.'),
    (v_c10, v_user_id, 'Michael',  'Johnson',    'michael.j@globex.com',         '(555) 200-0010', v_co_globex,    'VP of Sales',             'active',   '{"city":"San Jose","state":"CA","country":"US"}'::jsonb,                   '{"linkedin":"linkedin.com/in/mjohnson"}'::jsonb,             'Champion for our product internally.'),
    (v_c11, v_user_id, 'Jennifer', 'Lee',        'jennifer.lee@email.com',       '(555) 200-0011', null,           'Freelance Consultant',    'active',   '{"city":"Seattle","state":"WA","country":"US"}'::jsonb,                    '{"linkedin":"linkedin.com/in/jenniferlee"}'::jsonb,          'Potential channel partner.'),
    (v_c12, v_user_id, 'Thomas',   'Anderson',   'thomas.a@email.com',           '(555) 200-0012', null,           null,                      'active',   '{"city":"Chicago","state":"IL","country":"US"}'::jsonb,                    null,                                                          'Inbound lead from website.'),
    (v_c13, v_user_id, 'Maria',    'Santos',     'maria.santos@umbrella.io',     '(555) 200-0013', v_co_umbrella,  'IT Director',             'active',   '{"city":"Denver","state":"CO","country":"US"}'::jsonb,                     null,                                                          null),
    (v_c14, v_user_id, 'Kevin',    'Brown',      'kevin.b@wayne-ent.com',        '(555) 200-0014', v_co_wayne,     'VP of Technology',        'inactive', '{"city":"New York","state":"NY","country":"US"}'::jsonb,                   null,                                                          'Left the company in Jan 2025.'),
    (v_c15, v_user_id, 'Amanda',   'Foster',     'amanda.f@email.com',           '(555) 200-0015', null,           'Independent Consultant',  'active',   '{"city":"Boston","state":"MA","country":"US"}'::jsonb,                     '{"linkedin":"linkedin.com/in/amandaf","twitter":"@amandaf"}'::jsonb, 'Referred by Lisa Thompson.'),
    (v_c16, v_user_id, 'Daniel',   'Wright',     'daniel.w@initech.com',         '(555) 200-0016', v_co_initech,   'CEO',                     'active',   '{"city":"Dallas","state":"TX","country":"US"}'::jsonb,                     '{"linkedin":"linkedin.com/in/danielw"}'::jsonb,              'Final decision-maker at Initech.'),
    (v_c17, v_user_id, 'Rachel',   'Green',      'rachel.g@hooli.xyz',           '(555) 200-0017', v_co_hooli,     'Engineering Manager',     'active',   '{"city":"Mountain View","state":"CA","country":"US"}'::jsonb,              null,                                                          null),
    (v_c18, v_user_id, 'Chris',    'Martinez',   'chris.m@starkv.com',           '(555) 200-0018', v_co_stark,     'Associate',               'archived', '{"city":"San Francisco","state":"CA","country":"US"}'::jsonb,              null,                                                          'No longer at Stark Ventures.');

  -- --------------------------------------------------------
  -- 5. Deals (13)
  -- --------------------------------------------------------
  insert into public.deals (id, user_id, title, value, stage_id, contact_id, company_id, probability, expected_close_date, closed_at, close_reason, description) values
    -- Lead stage
    (v_d01, v_user_id, 'Acme Corp — Platform License',        25000.00,  v_stage_lead,        v_c01, v_co_acme,      10, '2025-06-15', null, null, 'Initial interest in annual platform license.'),
    (v_d02, v_user_id, 'Pied Piper — Starter Plan',           5000.00,   v_stage_lead,        v_c08, v_co_piedpiper, 15, '2025-05-30', null, null, 'Small startup exploring our starter tier.'),

    -- Qualified stage
    (v_d03, v_user_id, 'Globex — Enterprise Suite',           75000.00,  v_stage_qualified,   v_c02, v_co_globex,    35, '2025-05-01', null, null, 'Qualified after demo. CTO is champion.'),
    (v_d04, v_user_id, 'Wayne Enterprises — Analytics Add-on', 30000.00, v_stage_qualified,   v_c06, v_co_wayne,     40, '2025-06-01', null, null, 'Upsell opportunity on existing account.'),

    -- Proposal stage
    (v_d05, v_user_id, 'Initech — Full Platform Migration',   120000.00, v_stage_proposal,    v_c16, v_co_initech,   55, '2025-04-15', null, null, 'Proposal sent 2025-02-20. Awaiting feedback.'),
    (v_d06, v_user_id, 'Umbrella — Research Division',        45000.00,  v_stage_proposal,    v_c04, v_co_umbrella,  50, '2025-05-15', null, null, 'Proposal for research division license.'),

    -- Negotiation stage
    (v_d07, v_user_id, 'Hooli — Department License',          60000.00,  v_stage_negotiation, v_c07, v_co_hooli,     70, '2025-04-01', null, null, 'Negotiating seat count and pricing.'),
    (v_d08, v_user_id, 'Acme Corp — Support Package',         15000.00,  v_stage_negotiation, v_c09, v_co_acme,      75, '2025-03-25', null, null, 'Premium support add-on. Almost closed.'),
    (v_d09, v_user_id, 'Stark Ventures — Portfolio Tools',    35000.00,  v_stage_negotiation, v_c05, v_co_stark,     65, '2025-04-10', null, null, 'Custom portfolio management integration.'),

    -- Closed Won
    (v_d10, v_user_id, 'Globex — Phase 1 Deployment',        50000.00,  v_stage_won,         v_c10, v_co_globex,    100, '2025-02-01', '2025-02-01 10:00:00+00', 'Signed after successful pilot.', 'Phase 1 of 3-phase rollout.'),
    (v_d11, v_user_id, 'Wayne — Core Platform',               90000.00,  v_stage_won,         v_c06, v_co_wayne,     100, '2025-01-15', '2025-01-12 14:30:00+00', 'Multi-year contract.', '3-year enterprise agreement.'),

    -- Closed Lost
    (v_d12, v_user_id, 'Umbrella — HQ License',              80000.00,  v_stage_lost,        v_c13, v_co_umbrella,  0,  '2025-01-31', '2025-01-28 09:00:00+00', 'Went with competitor (lower price).', 'Lost to competitor on price.'),
    (v_d13, v_user_id, 'Freelancer Network — Group Plan',    12000.00,  v_stage_lost,        v_c11, null,           0,  '2025-02-10', '2025-02-08 16:00:00+00', 'Budget not approved.',              'Independent consultants group plan.');

  -- --------------------------------------------------------
  -- 6. Activities (30)
  -- --------------------------------------------------------
  insert into public.activities (user_id, type, title, description, contact_id, company_id, deal_id, due_date, completed_at, is_completed) values
    -- Calls
    (v_user_id, 'call',    'Discovery call with Sarah Chen',          'Discussed platform requirements and timeline.',                v_c01, v_co_acme,      v_d01, '2025-02-10 10:00:00+00', '2025-02-10 10:45:00+00', true),
    (v_user_id, 'call',    'Follow-up call with Marcus Williams',     'Reviewed enterprise features and pricing.',                    v_c02, v_co_globex,    v_d03, '2025-02-12 14:00:00+00', '2025-02-12 14:30:00+00', true),
    (v_user_id, 'call',    'Pricing discussion with James O''Brien',  'Discussed volume discounts for research division.',            v_c04, v_co_umbrella,  v_d06, '2025-02-15 11:00:00+00', null,                     false),
    (v_user_id, 'call',    'Check-in with Lisa Thompson',             'Monthly check-in on department rollout progress.',             v_c07, v_co_hooli,     v_d07, '2025-02-18 15:00:00+00', null,                     false),
    (v_user_id, 'call',    'Intro call with Thomas Anderson',         'Inbound lead qualification.',                                 v_c12, null,           null,  '2025-02-20 09:00:00+00', null,                     false),

    -- Emails
    (v_user_id, 'email',   'Send proposal to Initech',                'Attach updated pricing and SOW.',                             v_c16, v_co_initech,   v_d05, '2025-02-08 09:00:00+00', '2025-02-08 09:30:00+00', true),
    (v_user_id, 'email',   'Send case study to Globex',               'Enterprise deployment case study requested by CTO.',           v_c02, v_co_globex,    v_d03, '2025-02-11 10:00:00+00', '2025-02-11 10:15:00+00', true),
    (v_user_id, 'email',   'Contract draft to Hooli',                 'Send initial contract with negotiated terms.',                 v_c07, v_co_hooli,     v_d07, '2025-02-13 08:00:00+00', '2025-02-13 08:45:00+00', true),
    (v_user_id, 'email',   'Follow-up with Robert Garcia',            'Check on budget approval for starter plan.',                   v_c08, v_co_piedpiper, v_d02, '2025-02-19 10:00:00+00', null,                     false),
    (v_user_id, 'email',   'Thank you note to David Kim',             'Thank for signing 3-year agreement.',                         v_c06, v_co_wayne,     v_d11, '2025-01-13 08:00:00+00', '2025-01-13 08:10:00+00', true),

    -- Meetings
    (v_user_id, 'meeting', 'Demo for Acme engineering team',          'Full platform demo for Sarah and her engineering leads.',      v_c01, v_co_acme,      v_d01, '2025-02-22 14:00:00+00', null,                     false),
    (v_user_id, 'meeting', 'Quarterly review with Globex',            'Review Phase 1 deployment metrics and plan Phase 2.',          v_c10, v_co_globex,    v_d10, '2025-03-01 10:00:00+00', null,                     false),
    (v_user_id, 'meeting', 'Negotiation meeting with Hooli',          'Final terms discussion with Lisa and legal team.',             v_c07, v_co_hooli,     v_d07, '2025-02-25 11:00:00+00', null,                     false),
    (v_user_id, 'meeting', 'Initech stakeholder presentation',        'Present platform to Initech C-suite.',                        v_c16, v_co_initech,   v_d05, '2025-02-28 15:00:00+00', null,                     false),
    (v_user_id, 'meeting', 'Stark Ventures integration planning',     'Technical deep-dive on portfolio tools integration.',          v_c05, v_co_stark,     v_d09, '2025-02-24 13:00:00+00', null,                     false),
    (v_user_id, 'meeting', 'Coffee with Jennifer Lee',                'Discuss channel partnership opportunities.',                   v_c11, null,           null,  '2025-02-26 09:30:00+00', null,                     false),

    -- Tasks
    (v_user_id, 'task',    'Prepare Initech proposal deck',           'Include ROI analysis and implementation timeline.',            null,  v_co_initech,   v_d05, '2025-02-07 17:00:00+00', '2025-02-07 16:30:00+00', true),
    (v_user_id, 'task',    'Update CRM with Hooli deal notes',        'Log latest negotiation terms and next steps.',                 null,  v_co_hooli,     v_d07, '2025-02-14 17:00:00+00', '2025-02-14 16:00:00+00', true),
    (v_user_id, 'task',    'Research Umbrella competitors',           'Analyze competitor offerings for next meeting.',                null,  v_co_umbrella,  v_d06, '2025-02-17 17:00:00+00', null,                     false),
    (v_user_id, 'task',    'Draft Stark integration spec',            'Technical spec for portfolio tools API integration.',           null,  v_co_stark,     v_d09, '2025-02-21 17:00:00+00', null,                     false),
    (v_user_id, 'task',    'Review Acme support package terms',       'Finalize SLA and support tiers for Acme add-on.',              null,  v_co_acme,      v_d08, '2025-02-16 17:00:00+00', null,                     false),
    (v_user_id, 'task',    'Send Wayne onboarding materials',         'Share implementation guide and training schedule.',             v_c06, v_co_wayne,     v_d11, '2025-01-20 17:00:00+00', '2025-01-20 15:00:00+00', true),
    (v_user_id, 'task',    'Qualify Thomas Anderson lead',            'Score lead and determine appropriate pipeline stage.',          v_c12, null,           null,  '2025-02-21 12:00:00+00', null,                     false),
    (v_user_id, 'task',    'Update forecast spreadsheet',             'Include latest pipeline changes in Q1 forecast.',              null,  null,           null,  '2025-02-23 17:00:00+00', null,                     false),

    -- Notes (activity type)
    (v_user_id, 'note',    'Acme budget cycle starts in April',       'Sarah mentioned they finalize next FY budget in April.',       v_c01, v_co_acme,      v_d01, null,                     null,                     false),
    (v_user_id, 'note',    'Globex evaluating 3 vendors',            'We are one of 3 vendors in final evaluation.',                 v_c02, v_co_globex,    v_d03, null,                     null,                     false),
    (v_user_id, 'note',    'Umbrella HQ loss post-mortem',           'Key takeaway: need more competitive pricing for 500+ orgs.',   v_c13, v_co_umbrella,  v_d12, null,                     null,                     false),
    (v_user_id, 'note',    'Hooli legal review in progress',         'Their legal team is reviewing contract. ETA 1 week.',          v_c07, v_co_hooli,     v_d07, null,                     null,                     false),
    (v_user_id, 'note',    'Jennifer interested in referral program', 'Wants to refer clients in exchange for commission.',           v_c11, null,           null,  null,                     null,                     false),
    (v_user_id, 'note',    'Pied Piper may raise Series A',         'If funded, could upgrade to professional plan.',               v_c08, v_co_piedpiper, v_d02, null,                     null,                     false);

  -- --------------------------------------------------------
  -- 7. Notes (standalone)
  -- --------------------------------------------------------
  insert into public.notes (user_id, content, contact_id, company_id, deal_id) values
    (v_user_id, 'Sarah is the primary technical decision-maker at Acme. Always loop her in on technical discussions.',                          v_c01, v_co_acme,      null),
    (v_user_id, 'Globex Phase 1 completed successfully. Plan Phase 2 kickoff for Q2.',                                                          v_c10, v_co_globex,    v_d10),
    (v_user_id, 'Initech migration is complex — they have 15 years of legacy data. Budget for extra implementation support.',                    null,  v_co_initech,   v_d05),
    (v_user_id, 'Wayne Enterprises signed a 3-year deal. Biggest contract to date. Key reference account.',                                      v_c06, v_co_wayne,     v_d11),
    (v_user_id, 'Umbrella loss: competitor offered 30% lower price. Need to revisit enterprise pricing strategy.',                               null,  v_co_umbrella,  v_d12),
    (v_user_id, 'Hooli department license could expand to company-wide if pilot succeeds.',                                                      v_c07, v_co_hooli,     v_d07),
    (v_user_id, 'Amanda Foster was referred by Lisa Thompson at Hooli. Specializes in CRM consulting — potential partner.',                      v_c15, null,           null),
    (v_user_id, 'Q1 pipeline looking strong. Total weighted value: ~$285K. Need to close Hooli and Acme Support by end of March.',               null,  null,           null);

  -- --------------------------------------------------------
  -- 8. Tags
  -- --------------------------------------------------------
  insert into public.tags (id, user_id, name, color) values
    (v_tag_hot,        v_user_id, 'Hot Lead',    '#EF4444'),
    (v_tag_vip,        v_user_id, 'VIP',         '#F59E0B'),
    (v_tag_partner,    v_user_id, 'Partner',     '#8B5CF6'),
    (v_tag_ref,        v_user_id, 'Referral',    '#3B82F6'),
    (v_tag_churned,    v_user_id, 'Churned',     '#6B7280'),
    (v_tag_enterprise, v_user_id, 'Enterprise',  '#10B981');

  -- --------------------------------------------------------
  -- 9. Contact tags
  -- --------------------------------------------------------
  insert into public.contact_tags (contact_id, tag_id) values
    (v_c01, v_tag_hot),         -- Sarah Chen: Hot Lead
    (v_c02, v_tag_enterprise),  -- Marcus Williams: Enterprise
    (v_c05, v_tag_vip),         -- Aisha Patel: VIP
    (v_c06, v_tag_vip),         -- David Kim: VIP
    (v_c06, v_tag_enterprise),  -- David Kim: Enterprise
    (v_c07, v_tag_hot),         -- Lisa Thompson: Hot Lead
    (v_c08, v_tag_ref),         -- Robert Garcia: Referral
    (v_c10, v_tag_enterprise),  -- Michael Johnson: Enterprise
    (v_c11, v_tag_partner),     -- Jennifer Lee: Partner
    (v_c12, v_tag_hot),         -- Thomas Anderson: Hot Lead
    (v_c14, v_tag_churned),     -- Kevin Brown: Churned
    (v_c15, v_tag_ref),         -- Amanda Foster: Referral
    (v_c15, v_tag_partner),     -- Amanda Foster: Partner
    (v_c16, v_tag_enterprise),  -- Daniel Wright: Enterprise
    (v_c18, v_tag_churned);     -- Chris Martinez: Churned

  -- --------------------------------------------------------
  -- 10. Deal tags
  -- --------------------------------------------------------
  insert into public.deal_tags (deal_id, tag_id) values
    (v_d03, v_tag_enterprise),  -- Globex Enterprise Suite
    (v_d05, v_tag_enterprise),  -- Initech Full Platform
    (v_d07, v_tag_hot),         -- Hooli Department License
    (v_d08, v_tag_hot),         -- Acme Support Package
    (v_d09, v_tag_vip),         -- Stark Portfolio Tools
    (v_d10, v_tag_enterprise),  -- Globex Phase 1
    (v_d11, v_tag_vip),         -- Wayne Core Platform
    (v_d11, v_tag_enterprise);  -- Wayne Core Platform

end $$;
```

---

## Appendix: Full Migration Script

To run the entire schema as a single migration, execute the SQL blocks in this order:

1. **Extensions** (Section 2.1)
2. **Tables** (Sections 2.2–2.11) — order matters due to foreign keys:
   - `profiles` → `companies` → `contacts` → `deal_stages` → `deals` → `activities` → `notes` → `tags` → `contact_tags` → `deal_tags`
3. **Indexes** (Section 3)
4. **RLS policies** (Section 4)
5. **Triggers and functions** (Section 5)
6. **Storage buckets** (Section 6)
7. **Seed data** (Section 7) — development only

### Supabase CLI Migration

```bash
# Generate a new migration
supabase migration new initial_schema

# Paste the full SQL into the generated file at:
# supabase/migrations/<timestamp>_initial_schema.sql

# Apply locally
supabase db reset

# Push to remote
supabase db push
```

---

## Appendix: TypeScript Type Generation

After applying the schema, generate TypeScript types for the frontend:

```bash
# Generate types from your Supabase project
npx supabase gen types typescript --project-id <your-project-id> > src/lib/database.types.ts

# Or from a local instance
npx supabase gen types typescript --local > src/lib/database.types.ts
```

The generated types integrate directly with the Supabase JS client:

```typescript
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/database.types';

export const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
```
