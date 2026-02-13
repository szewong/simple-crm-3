-- ============================================================
-- Enable required extensions
-- ============================================================
create extension if not exists "pgcrypto";   -- gen_random_uuid()
create extension if not exists "pg_trgm";    -- trigram indexes for fuzzy search

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

-- ============================================================
-- contact_tags — many-to-many contacts ↔ tags
-- ============================================================
create table public.contact_tags (
  contact_id uuid not null references public.contacts(id) on delete cascade,
  tag_id     uuid not null references public.tags(id) on delete cascade,
  primary key (contact_id, tag_id)
);

comment on table public.contact_tags is 'Junction table linking contacts to tags.';

-- ============================================================
-- deal_tags — many-to-many deals ↔ tags
-- ============================================================
create table public.deal_tags (
  deal_id uuid not null references public.deals(id) on delete cascade,
  tag_id  uuid not null references public.tags(id) on delete cascade,
  primary key (deal_id, tag_id)
);

comment on table public.deal_tags is 'Junction table linking deals to tags.';

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
