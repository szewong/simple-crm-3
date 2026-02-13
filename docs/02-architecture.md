# Technical Architecture Document

## Simple CRM — System Architecture

**Version:** 1.0
**Last Updated:** 2026-02-12

---

## Table of Contents

1. [High-Level Architecture](#1-high-level-architecture)
2. [Next.js Project Structure](#2-nextjs-project-structure)
3. [Authentication Architecture](#3-authentication-architecture)
4. [Data Access Patterns](#4-data-access-patterns)
5. [API Design](#5-api-design)
6. [Security Architecture](#6-security-architecture)
7. [Performance Strategy](#7-performance-strategy)
8. [Key Technical Decisions](#8-key-technical-decisions)
9. [Testing Architecture](#9-testing-architecture)

---

## 1. High-Level Architecture

### System Overview

Simple CRM is a multi-tenant CRM application built on a modern JAMstack-style architecture. The frontend is a Next.js application deployed to Vercel, communicating with Supabase as the all-in-one backend (database, auth, real-time, storage, and edge functions).

### Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         VERCEL (Frontend)                       │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                    Next.js 14+ (App Router)               │  │
│  │                                                           │  │
│  │  ┌─────────────────┐    ┌──────────────────────────────┐  │  │
│  │  │  Server          │    │  Client Components           │  │  │
│  │  │  Components      │    │                              │  │  │
│  │  │                  │    │  ┌────────────┐ ┌─────────┐  │  │  │
│  │  │  - Page renders  │    │  │ TanStack   │ │ React   │  │  │  │
│  │  │  - Data fetching │    │  │ Query      │ │ Hook    │  │  │  │
│  │  │  - Auth checks   │    │  │ (caching)  │ │ Form    │  │  │  │
│  │  │                  │    │  └──────┬─────┘ └────┬────┘  │  │  │
│  │  └────────┬─────────┘    └────────┼─────────────┼───────┘  │  │
│  │           │                       │             │          │  │
│  │           │  Supabase Server      │  Supabase   │  Zod     │  │
│  │           │  Client (SSR)         │  Browser    │  Schemas │  │
│  │           │                       │  Client     │          │  │
│  └───────────┼───────────────────────┼─────────────┼──────────┘  │
│              │                       │             │             │
└──────────────┼───────────────────────┼─────────────┼─────────────┘
               │                       │             │
               │         HTTPS         │             │
               ▼                       ▼             │
┌─────────────────────────────────────────────────────────────────┐
│                      SUPABASE (Backend)                         │
│                                                                 │
│  ┌──────────┐ ┌──────────┐ ┌───────────┐ ┌──────────────────┐  │
│  │ Auth     │ │ PostgREST│ │ Realtime  │ │ Edge Functions   │  │
│  │          │ │ (REST    │ │ (WebSocket│ │                  │  │
│  │ - Email/ │ │  API)    │ │  Subs)    │ │ - Aggregations   │  │
│  │   Pass   │ │          │ │           │ │ - CSV Import     │  │
│  │ - OAuth  │ │ - CRUD   │ │ - Live    │ │ - CSV Export     │  │
│  │ - JWT    │ │ - Filter │ │   updates │ │ - Pipeline Stats │  │
│  │          │ │ - Sort   │ │ - Presence│ │                  │  │
│  └────┬─────┘ └────┬─────┘ └─────┬─────┘ └────────┬─────────┘  │
│       │            │              │                │             │
│       ▼            ▼              ▼                ▼             │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                   PostgreSQL Database                     │   │
│  │                                                           │   │
│  │   ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌───────────┐   │   │
│  │   │ contacts │ │companies │ │  deals   │ │activities │   │   │
│  │   └──────────┘ └──────────┘ └──────────┘ └───────────┘   │   │
│  │                                                           │   │
│  │   Row Level Security (RLS) ── per-user data isolation     │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                     Storage (S3)                          │   │
│  │           Avatars, attachments, CSV uploads               │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### Rendering Strategy

| Context | Strategy | Reason |
|---------|----------|--------|
| Page shells, layouts | React Server Components (RSC) | Zero client JS, fast initial paint |
| List pages (contacts, deals) | RSC with Suspense streaming | Progressive data loading |
| Detail pages | RSC for initial load | SEO-friendly, fast TTFB |
| Interactive forms | Client Components | User input, validation feedback |
| Dashboards / charts | Client Components | Recharts requires browser APIs |
| Real-time updates | Client Components | WebSocket subscriptions |

### Data Flow Patterns

**Read Path (Server Components)**
```
Browser Request → Next.js Server → Supabase Server Client → PostgreSQL → RSC HTML Stream → Browser
```

**Read Path (Client Components with TanStack Query)**
```
Component Mount → useQuery Hook → Supabase Browser Client → PostgREST API → Cache → Render
```

**Write Path (Mutations)**
```
User Action → React Hook Form → Zod Validate → useMutation → Supabase Client → PostgREST → DB
                                                     │
                                                     ├── Optimistic Update (cache)
                                                     └── Invalidate Queries (on success)
```

**Real-time Path**
```
DB Change → Supabase Realtime (WebSocket) → Client Subscription → TanStack Query Cache Invalidation → Re-render
```

---

## 2. Next.js Project Structure

```
simple-crm-3/
├── src/
│   ├── app/                          # App Router (file-based routing)
│   │   ├── (auth)/                   # Auth route group (no layout nesting)
│   │   │   ├── login/
│   │   │   │   └── page.tsx          # Login page
│   │   │   ├── signup/
│   │   │   │   └── page.tsx          # Signup page
│   │   │   └── layout.tsx            # Centered card layout for auth
│   │   │
│   │   ├── (dashboard)/              # Dashboard route group
│   │   │   ├── layout.tsx            # Sidebar + Header + Auth guard
│   │   │   ├── page.tsx              # Dashboard overview
│   │   │   │
│   │   │   ├── contacts/
│   │   │   │   ├── page.tsx          # Contact list (table view)
│   │   │   │   ├── new/
│   │   │   │   │   └── page.tsx      # Create contact form
│   │   │   │   └── [id]/
│   │   │   │       ├── page.tsx      # Contact detail view
│   │   │   │       └── edit/
│   │   │   │           └── page.tsx  # Edit contact form
│   │   │   │
│   │   │   ├── companies/
│   │   │   │   ├── page.tsx          # Company list
│   │   │   │   ├── new/
│   │   │   │   │   └── page.tsx      # Create company
│   │   │   │   └── [id]/
│   │   │   │       ├── page.tsx      # Company detail
│   │   │   │       └── edit/
│   │   │   │           └── page.tsx  # Edit company
│   │   │   │
│   │   │   ├── deals/
│   │   │   │   ├── page.tsx          # Deal pipeline (Kanban + list)
│   │   │   │   ├── new/
│   │   │   │   │   └── page.tsx      # Create deal
│   │   │   │   └── [id]/
│   │   │   │       ├── page.tsx      # Deal detail
│   │   │   │       └── edit/
│   │   │   │           └── page.tsx  # Edit deal
│   │   │   │
│   │   │   ├── activities/
│   │   │   │   └── page.tsx          # Activity feed / timeline
│   │   │   │
│   │   │   └── settings/
│   │   │       ├── page.tsx          # General settings
│   │   │       └── profile/
│   │   │           └── page.tsx      # User profile settings
│   │   │
│   │   ├── auth/
│   │   │   └── callback/
│   │   │       └── route.ts          # OAuth callback handler
│   │   │
│   │   ├── layout.tsx                # Root layout (providers, fonts)
│   │   ├── globals.css               # Tailwind imports + custom styles
│   │   └── not-found.tsx             # 404 page
│   │
│   ├── components/
│   │   ├── ui/                       # shadcn/ui primitives
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── table.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── card.tsx
│   │   │   ├── dropdown-menu.tsx
│   │   │   ├── select.tsx
│   │   │   ├── sheet.tsx
│   │   │   ├── tabs.tsx
│   │   │   ├── toast.tsx
│   │   │   └── ...
│   │   │
│   │   ├── layout/
│   │   │   ├── sidebar.tsx           # Navigation sidebar
│   │   │   ├── header.tsx            # Top bar with search + user menu
│   │   │   ├── mobile-nav.tsx        # Mobile navigation drawer
│   │   │   └── breadcrumbs.tsx       # Breadcrumb navigation
│   │   │
│   │   ├── contacts/
│   │   │   ├── contact-table.tsx     # Contact data table
│   │   │   ├── contact-form.tsx      # Create/edit contact form
│   │   │   ├── contact-card.tsx      # Contact summary card
│   │   │   └── contact-filters.tsx   # Filter/search controls
│   │   │
│   │   ├── companies/
│   │   │   ├── company-table.tsx
│   │   │   ├── company-form.tsx
│   │   │   └── company-card.tsx
│   │   │
│   │   ├── deals/
│   │   │   ├── deal-pipeline.tsx     # Kanban board view
│   │   │   ├── deal-card.tsx         # Card in pipeline
│   │   │   ├── deal-table.tsx        # List/table view
│   │   │   ├── deal-form.tsx
│   │   │   └── deal-stage-badge.tsx  # Stage indicator
│   │   │
│   │   ├── activities/
│   │   │   ├── activity-feed.tsx     # Timeline view
│   │   │   ├── activity-item.tsx     # Single activity entry
│   │   │   └── activity-form.tsx     # Log new activity
│   │   │
│   │   ├── dashboard/
│   │   │   ├── stats-cards.tsx       # KPI summary cards
│   │   │   ├── revenue-chart.tsx     # Revenue over time (Recharts)
│   │   │   ├── pipeline-chart.tsx    # Deal pipeline funnel
│   │   │   ├── recent-activity.tsx   # Recent activity feed
│   │   │   └── upcoming-tasks.tsx    # Upcoming tasks/reminders
│   │   │
│   │   └── shared/
│   │       ├── data-table.tsx        # Reusable data table wrapper
│   │       ├── pagination.tsx        # Cursor-based pagination controls
│   │       ├── search-input.tsx      # Debounced search input
│   │       ├── confirm-dialog.tsx    # Confirmation modal
│   │       ├── empty-state.tsx       # Empty state placeholder
│   │       └── loading-skeleton.tsx  # Loading skeleton components
│   │
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts            # Browser Supabase client (singleton)
│   │   │   ├── server.ts            # Server-side Supabase client
│   │   │   ├── middleware.ts         # Auth session refresh logic
│   │   │   └── admin.ts             # Service-role client (Edge Functions)
│   │   │
│   │   ├── hooks/
│   │   │   ├── use-contacts.ts      # Contact CRUD queries/mutations
│   │   │   ├── use-companies.ts     # Company CRUD queries/mutations
│   │   │   ├── use-deals.ts         # Deal CRUD queries/mutations
│   │   │   ├── use-activities.ts    # Activity queries/mutations
│   │   │   ├── use-dashboard.ts     # Dashboard aggregation queries
│   │   │   ├── use-realtime.ts      # Generic realtime subscription hook
│   │   │   └── use-debounce.ts      # Debounce utility hook
│   │   │
│   │   ├── utils/
│   │   │   ├── cn.ts                # clsx + tailwind-merge helper
│   │   │   ├── format.ts            # Date, currency, phone formatters
│   │   │   └── constants.ts         # App-wide constants (deal stages, etc.)
│   │   │
│   │   ├── types/
│   │   │   ├── database.ts          # Supabase generated types
│   │   │   ├── contacts.ts          # Contact domain types
│   │   │   ├── companies.ts         # Company domain types
│   │   │   ├── deals.ts             # Deal domain types
│   │   │   └── activities.ts        # Activity domain types
│   │   │
│   │   └── validations/
│   │       ├── contact.ts           # Contact Zod schemas
│   │       ├── company.ts           # Company Zod schemas
│   │       ├── deal.ts              # Deal Zod schemas
│   │       └── activity.ts          # Activity Zod schemas
│   │
│   └── styles/                      # (optional) additional stylesheets
│
├── public/
│   ├── logo.svg
│   └── favicon.ico
│
├── supabase/
│   ├── migrations/                  # Ordered SQL migration files
│   │   ├── 00001_create_users_profile.sql
│   │   ├── 00002_create_contacts.sql
│   │   ├── 00003_create_companies.sql
│   │   ├── 00004_create_deals.sql
│   │   ├── 00005_create_activities.sql
│   │   ├── 00006_create_rls_policies.sql
│   │   └── 00007_create_indexes.sql
│   ├── functions/                   # Supabase Edge Functions (Deno)
│   │   ├── dashboard-stats/
│   │   │   └── index.ts
│   │   ├── csv-import/
│   │   │   └── index.ts
│   │   ├── csv-export/
│   │   │   └── index.ts
│   │   └── pipeline-analytics/
│   │       └── index.ts
│   └── seed.sql                     # Development seed data
│
├── .env.local                       # Local env vars (git-ignored)
├── .env.example                     # Template for env vars
├── next.config.ts                   # Next.js configuration
├── tailwind.config.ts               # Tailwind CSS configuration
├── tsconfig.json                    # TypeScript configuration
├── package.json
└── README.md
```

### Routing Convention

All routes use Next.js App Router conventions:

- **Route Groups** `(auth)` and `(dashboard)` organize routes by layout without affecting the URL path.
- **Dynamic Segments** `[id]` handle entity detail pages.
- **Route Handlers** `route.ts` files serve API endpoints (e.g., OAuth callback).
- **Layouts** cascade: Root → Route Group → Page.

---

## 3. Authentication Architecture

### Auth Flow Overview

```
┌──────────┐     ┌────────────┐     ┌───────────────┐     ┌──────────┐
│  Browser  │────▶│  Next.js   │────▶│  Supabase     │────▶│PostgreSQL│
│           │     │  Middleware │     │  Auth (GoTrue) │     │ auth.users│
│  Login    │     │            │     │               │     │          │
│  Form     │◀────│  Session   │◀────│  JWT Token    │◀────│  Verify  │
│           │     │  Cookie    │     │               │     │          │
└──────────┘     └────────────┘     └───────────────┘     └──────────┘
```

### Supported Auth Methods

| Method | Implementation |
|--------|----------------|
| Email + Password | Supabase Auth `signUp` / `signInWithPassword` |
| OAuth (Google) | Supabase Auth `signInWithOAuth` → callback route |
| OAuth (GitHub) | Supabase Auth `signInWithOAuth` → callback route |
| Password Reset | Supabase Auth `resetPasswordForEmail` |

### Middleware (Route Protection)

The Next.js middleware (`src/middleware.ts`) runs on every request to refresh the auth session and protect routes.

```
Request
  │
  ▼
middleware.ts
  │
  ├── Refresh Supabase session (exchange cookie for fresh JWT)
  │
  ├── Is route public? (/login, /signup, /auth/callback)
  │   └── Yes → Allow through
  │
  ├── Is user authenticated?
  │   ├── No  → Redirect to /login
  │   └── Yes → Allow through
  │
  └── Is authenticated user on /login or /signup?
      └── Yes → Redirect to /dashboard
```

**Matcher configuration:** The middleware matches all routes except static files and Next.js internals (`_next`, images, favicon).

### Supabase Client Configuration

Three Supabase client types are used depending on context:

| Client | File | Context | Auth |
|--------|------|---------|------|
| **Browser Client** | `lib/supabase/client.ts` | Client Components | User JWT from cookie |
| **Server Client** | `lib/supabase/server.ts` | Server Components, Route Handlers | User JWT from cookie (read-only) |
| **Admin Client** | `lib/supabase/admin.ts` | Edge Functions | Service role key (bypasses RLS) |

**Browser Client** — Created once via `createBrowserClient()` from `@supabase/ssr`. Automatically reads/writes the auth cookie.

**Server Client** — Created per-request via `createServerClient()` from `@supabase/ssr`. Reads cookies from the Next.js `cookies()` function. Used in Server Components and Route Handlers for authenticated data fetching.

**Admin Client** — Uses the `SUPABASE_SERVICE_ROLE_KEY`. Used exclusively in Edge Functions for operations that need to bypass RLS (e.g., aggregation queries across all user data in a tenant).

### OAuth Callback Handler

The `/auth/callback/route.ts` Route Handler exchanges the OAuth authorization code for a session:

```
OAuth Provider → Redirect to /auth/callback?code=xxx
                         │
                         ▼
               Exchange code for session
                         │
                         ▼
               Set session cookie
                         │
                         ▼
               Redirect to /dashboard
```

### Session Management

- Sessions are stored as HTTP-only cookies managed by `@supabase/ssr`.
- The middleware refreshes the JWT on each request if it's nearing expiry.
- Token refresh is transparent to the user.
- On sign-out, cookies are cleared and the user is redirected to `/login`.

---

## 4. Data Access Patterns

### Pattern 1: Server Components (Direct Queries)

Server Components fetch data directly on the server, eliminating client-side waterfalls.

```typescript
// src/app/(dashboard)/contacts/page.tsx (Server Component)
import { createServerClient } from '@/lib/supabase/server'

export default async function ContactsPage() {
  const supabase = await createServerClient()

  const { data: contacts } = await supabase
    .from('contacts')
    .select('*, company:companies(name)')
    .order('created_at', { ascending: false })
    .range(0, 24)

  return <ContactTable contacts={contacts} />
}
```

**When to use:** Initial page loads, data that doesn't need real-time updates, SEO-relevant content.

### Pattern 2: Client Components (TanStack Query)

For interactive features, Client Components use TanStack Query for caching, background refetching, and optimistic updates.

```typescript
// src/lib/hooks/use-contacts.ts
export function useContacts(filters: ContactFilters) {
  return useQuery({
    queryKey: ['contacts', filters],
    queryFn: async () => {
      const supabase = createBrowserClient()
      let query = supabase
        .from('contacts')
        .select('*, company:companies(name)', { count: 'exact' })

      if (filters.search) {
        query = query.or(
          `first_name.ilike.%${filters.search}%,last_name.ilike.%${filters.search}%,email.ilike.%${filters.search}%`
        )
      }

      const { data, count } = await query
        .order('created_at', { ascending: false })
        .range(filters.offset, filters.offset + filters.limit - 1)

      return { data, count }
    },
  })
}
```

**When to use:** Filtered/sorted lists, paginated views, data that changes frequently, after user interactions.

### Pattern 3: Mutations with Optimistic Updates

```typescript
// src/lib/hooks/use-contacts.ts
export function useCreateContact() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (newContact: ContactInsert) => {
      const supabase = createBrowserClient()
      const { data, error } = await supabase
        .from('contacts')
        .insert(newContact)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] })
    },
  })
}
```

For drag-and-drop operations (e.g., moving deals between pipeline stages), optimistic updates provide instant visual feedback:

```typescript
export function useUpdateDealStage() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ dealId, stage }: { dealId: string; stage: string }) => {
      const supabase = createBrowserClient()
      const { data, error } = await supabase
        .from('deals')
        .update({ stage })
        .eq('id', dealId)
        .select()
        .single()
      if (error) throw error
      return data
    },
    onMutate: async ({ dealId, stage }) => {
      await queryClient.cancelQueries({ queryKey: ['deals'] })
      const previous = queryClient.getQueryData(['deals'])

      queryClient.setQueryData(['deals'], (old: Deal[]) =>
        old.map(deal => deal.id === dealId ? { ...deal, stage } : deal)
      )

      return { previous }
    },
    onError: (_err, _vars, context) => {
      queryClient.setQueryData(['deals'], context?.previous)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['deals'] })
    },
  })
}
```

### Pattern 4: Real-time Subscriptions

Real-time updates keep shared views in sync. A reusable hook manages subscription lifecycle:

```typescript
// src/lib/hooks/use-realtime.ts
export function useRealtimeSubscription<T>(
  table: string,
  queryKey: string[],
  filter?: string
) {
  const queryClient = useQueryClient()
  const supabase = createBrowserClient()

  useEffect(() => {
    const channel = supabase
      .channel(`${table}-changes`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table,
          filter,
        },
        () => {
          queryClient.invalidateQueries({ queryKey })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [table, filter])
}
```

**Applied to:** Deal pipeline (stage changes), activity feed (new entries), contact updates.

### Data Access Summary

```
┌─────────────────────────────┐
│       Server Components      │  ← Initial page load (SSR)
│   Direct Supabase queries    │  ← No client JS overhead
│   via Server Client          │  ← RLS enforced via user JWT
└──────────────┬───────────────┘
               │ hydrate / stream
               ▼
┌─────────────────────────────┐
│       Client Components      │  ← Interactive features
│   TanStack Query + Supabase  │  ← Caching, deduplication
│   Browser Client             │  ← Optimistic updates
│                              │
│   + Realtime Subscriptions   │  ← Live updates via WebSocket
└──────────────────────────────┘
```

---

## 5. API Design

### Auto-Generated REST API (PostgREST)

Supabase automatically generates a RESTful API from the PostgreSQL schema. All standard CRUD operations use this API directly through the Supabase client SDK.

| Entity | Operations | Endpoint (auto-generated) |
|--------|-----------|---------------------------|
| Contacts | List, Create, Read, Update, Delete | `/rest/v1/contacts` |
| Companies | List, Create, Read, Update, Delete | `/rest/v1/companies` |
| Deals | List, Create, Read, Update, Delete | `/rest/v1/deals` |
| Activities | List, Create, Read, Update, Delete | `/rest/v1/activities` |

The Supabase client SDK abstracts these endpoints. No custom API routes are needed for standard CRUD.

**Filtering and querying** are handled via PostgREST operators:

```typescript
// Full-text search, filtering, sorting, pagination — all via PostgREST
supabase
  .from('contacts')
  .select('*, company:companies(name)')
  .ilike('email', '%@acme.com')
  .eq('status', 'active')
  .order('last_name', { ascending: true })
  .range(0, 24)
```

### Custom Edge Functions

For operations that go beyond simple CRUD, Supabase Edge Functions (Deno runtime) handle complex server-side logic.

#### Dashboard Stats Aggregation

**Endpoint:** `POST /functions/v1/dashboard-stats`

Aggregates metrics across tables for the dashboard overview. Uses the service-role client to run efficient SQL queries.

```
Request:  { period: "30d" | "90d" | "12m" }

Response: {
  total_contacts: number,
  new_contacts_period: number,
  total_deals: number,
  pipeline_value: number,
  won_deals_period: number,
  revenue_period: number,
  activities_period: number,
  conversion_rate: number,
  revenue_by_month: { month: string, revenue: number }[],
  deals_by_stage: { stage: string, count: number, value: number }[]
}
```

#### CSV Import

**Endpoint:** `POST /functions/v1/csv-import`

Parses and validates uploaded CSV files, then bulk-inserts records.

```
Request:  FormData { file: CSV, entity: "contacts" | "companies" | "deals" }

Response: {
  imported: number,
  skipped: number,
  errors: { row: number, message: string }[]
}
```

**Processing flow:**
1. Parse CSV with column mapping
2. Validate each row against the entity's Zod schema
3. Bulk insert valid rows via the admin client
4. Return import summary with per-row error details

#### CSV Export

**Endpoint:** `POST /functions/v1/csv-export`

Generates CSV files from filtered query results.

```
Request:  { entity: "contacts" | "companies" | "deals", filters?: object }

Response: text/csv (streamed)
```

#### Pipeline Analytics

**Endpoint:** `POST /functions/v1/pipeline-analytics`

Computes deal pipeline metrics: velocity, conversion rates between stages, average deal size, and time-in-stage analysis.

```
Request:  { period: "30d" | "90d" | "12m" }

Response: {
  stage_conversion_rates: { from: string, to: string, rate: number }[],
  avg_days_in_stage: { stage: string, days: number }[],
  avg_deal_size: number,
  win_rate: number,
  avg_sales_cycle_days: number
}
```

### API Authentication

All API calls are authenticated:

- **PostgREST API:** The Supabase client includes the user's JWT automatically. RLS policies enforce data access.
- **Edge Functions:** Receive the user's JWT in the `Authorization` header. Functions verify the JWT and extract user/tenant context.

---

## 6. Security Architecture

### Row Level Security (RLS)

RLS is the primary mechanism for multi-tenant data isolation. Every table has RLS enabled, and policies ensure users can only access data belonging to their tenant (organization).

```
┌─────────────────────────────────────────┐
│             PostgreSQL                   │
│                                          │
│  ┌─────────────────────────────────┐     │
│  │ contacts (RLS enabled)          │     │
│  │                                 │     │
│  │ Policy: SELECT                  │     │
│  │   USING (user_id = auth.uid())  │     │
│  │                                 │     │
│  │ Policy: INSERT                  │     │
│  │   WITH CHECK                    │     │
│  │     (user_id = auth.uid())      │     │
│  │                                 │     │
│  │ Policy: UPDATE                  │     │
│  │   USING (user_id = auth.uid())  │     │
│  │   WITH CHECK                    │     │
│  │     (user_id = auth.uid())      │     │
│  │                                 │     │
│  │ Policy: DELETE                  │     │
│  │   USING (user_id = auth.uid())  │     │
│  └─────────────────────────────────┘     │
│                                          │
│  (Same pattern for all tables)           │
└─────────────────────────────────────────┘
```

`auth.uid()` is a Supabase/PostgreSQL function that returns the currently authenticated user's ID from the JWT, ensuring policies are evaluated per-request.

### Security Layers

```
┌──────────────────────────────────────────────────┐
│ Layer 1: Next.js Middleware                       │
│   - Route protection (redirect unauthenticated)  │
│   - Session refresh                              │
├──────────────────────────────────────────────────┤
│ Layer 2: Input Validation (Zod)                   │
│   - Client-side form validation                  │
│   - Server-side re-validation in Edge Functions  │
│   - Type-safe schemas prevent malformed data     │
├──────────────────────────────────────────────────┤
│ Layer 3: Supabase Auth (JWT)                      │
│   - Signed JWT tokens with expiry                │
│   - HTTP-only session cookies                    │
│   - Automatic token refresh                      │
├──────────────────────────────────────────────────┤
│ Layer 4: Row Level Security (PostgreSQL)          │
│   - Per-table policies                           │
│   - Enforced at the database level               │
│   - Cannot be bypassed from the client           │
├──────────────────────────────────────────────────┤
│ Layer 5: Network Security                         │
│   - HTTPS everywhere (Vercel + Supabase)         │
│   - Supabase API keys scoped per project         │
│   - Service role key never exposed to client     │
└──────────────────────────────────────────────────┘
```

### CSRF Protection

- Supabase Auth uses HTTP-only cookies with `SameSite=Lax`, preventing cross-site request forgery for session cookies.
- All state-changing operations go through the Supabase client SDK, which includes the JWT in request headers (not cookies), adding a second layer of CSRF protection.

### Environment Variable Management

| Variable | Exposed to Client | Purpose |
|----------|-------------------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Public API key (safe with RLS) |
| `SUPABASE_SERVICE_ROLE_KEY` | No | Admin access (Edge Functions only) |
| `SUPABASE_DB_URL` | No | Direct DB connection (migrations) |

The `NEXT_PUBLIC_` prefix makes variables available to client-side code. The anon key is safe to expose because RLS enforces data access. The service role key is never exposed to the browser and is only used in server-side Edge Functions.

### Input Validation

Zod schemas are shared between client-side forms and server-side Edge Functions:

```typescript
// src/lib/validations/contact.ts
export const contactSchema = z.object({
  first_name: z.string().min(1, 'First name is required').max(100),
  last_name: z.string().min(1, 'Last name is required').max(100),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  company_id: z.string().uuid().optional(),
  status: z.enum(['active', 'inactive']).default('active'),
  notes: z.string().max(5000).optional(),
})
```

React Hook Form integrates with Zod via `@hookform/resolvers/zod` for client-side validation. Edge Functions re-validate using the same schema before writing to the database.

---

## 7. Performance Strategy

### Server-Side Rendering with Streaming

```
Browser Request
     │
     ▼
┌─────────────┐     ┌────────────────────────────────────┐
│ Next.js     │────▶│ Render layout shell immediately     │ ← Instant TTFB
│ Server      │     │ (sidebar, header, page skeleton)    │
│             │     │                                      │
│             │────▶│ Stream data-dependent sections       │ ← Progressive
│             │     │ as Supabase queries resolve          │   loading
└─────────────┘     └────────────────────────────────────┘
```

Each page uses Suspense boundaries to stream content progressively:

```tsx
// Suspense boundaries for progressive loading
export default function ContactsPage() {
  return (
    <div>
      <h1>Contacts</h1>
      <Suspense fallback={<TableSkeleton />}>
        <ContactTableServer />
      </Suspense>
    </div>
  )
}
```

### Client-Side Caching (TanStack Query)

| Feature | Configuration |
|---------|--------------|
| Stale time | 30 seconds (lists), 60 seconds (detail views) |
| Cache time | 5 minutes |
| Background refetch | On window focus, on reconnect |
| Deduplication | Automatic (same queryKey = one request) |
| Prefetching | On hover for detail links |

### Database Indexes

```sql
-- Frequently queried columns
CREATE INDEX idx_contacts_user_id ON contacts(user_id);
CREATE INDEX idx_contacts_company_id ON contacts(company_id);
CREATE INDEX idx_contacts_email ON contacts(email);
CREATE INDEX idx_contacts_created_at ON contacts(created_at DESC);

CREATE INDEX idx_companies_user_id ON companies(user_id);
CREATE INDEX idx_companies_name ON companies(name);

CREATE INDEX idx_deals_user_id ON deals(user_id);
CREATE INDEX idx_deals_stage ON deals(stage);
CREATE INDEX idx_deals_contact_id ON deals(contact_id);
CREATE INDEX idx_deals_company_id ON deals(company_id);

CREATE INDEX idx_activities_user_id ON activities(user_id);
CREATE INDEX idx_activities_contact_id ON activities(contact_id);
CREATE INDEX idx_activities_deal_id ON activities(deal_id);
CREATE INDEX idx_activities_created_at ON activities(created_at DESC);

-- Composite index for filtered + sorted queries
CREATE INDEX idx_contacts_user_status_created
  ON contacts(user_id, status, created_at DESC);

CREATE INDEX idx_deals_user_stage_created
  ON deals(user_id, stage, created_at DESC);
```

### Pagination Strategy

**Cursor-based pagination** is used for all list views. Cursor pagination is more performant than offset pagination for large datasets and handles real-time inserts gracefully.

```typescript
// Cursor-based pagination
const { data } = await supabase
  .from('contacts')
  .select('*')
  .order('created_at', { ascending: false })
  .lt('created_at', cursor)   // cursor = last item's created_at
  .limit(25)
```

For the initial load (no cursor), the query omits the `.lt()` filter.

### Bundle Optimization

- **React Server Components** keep interactive JS minimal — only Client Components ship JavaScript to the browser.
- **Dynamic imports** for heavy components (Recharts, CSV parsing).
- **Tree-shaking** on Lucide React icons — import individually, not the entire library.
- **Image optimization** via Next.js `<Image>` component with automatic WebP/AVIF conversion.

---

## 8. Key Technical Decisions

### Decision 1: Supabase over Custom Backend

| Factor | Supabase | Custom (Express/Fastify) |
|--------|----------|--------------------------|
| Development speed | Fast — auto-generated CRUD API | Slow — manual route/controller setup |
| Auth | Built-in (JWT, OAuth, MFA) | Manual implementation or third-party |
| Real-time | Built-in WebSocket | Manual WebSocket server |
| Security | RLS at database level | Manual middleware-based auth |
| Scalability | Managed, auto-scaling | Self-managed infrastructure |
| Vendor lock-in | Moderate (PostgreSQL is portable) | None |
| Complex queries | Edge Functions when needed | Full flexibility |

**Decision:** Supabase. The CRM's data model is relational and well-suited to PostgreSQL + auto-generated REST. RLS provides security at the data layer. Edge Functions cover the few cases needing custom logic. The trade-off is some vendor lock-in, but the underlying PostgreSQL database remains portable.

### Decision 2: App Router over Pages Router

| Factor | App Router | Pages Router |
|--------|-----------|--------------|
| Data fetching | Server Components (zero-bundle) | getServerSideProps (full bundle) |
| Streaming | Native Suspense support | Limited |
| Layouts | Nested layouts, preserved state | _app.tsx only |
| Maturity | Stable since Next.js 14 | Mature, well-documented |
| Ecosystem | Growing | Extensive |

**Decision:** App Router. Server Components reduce client-side JavaScript significantly for a data-heavy CRM. Nested layouts are natural for the sidebar + header pattern. Suspense streaming improves perceived performance on list pages.

### Decision 3: TanStack Query over SWR

| Factor | TanStack Query | SWR |
|--------|---------------|-----|
| Optimistic updates | First-class support | Manual implementation |
| Mutations | Built-in `useMutation` | Manual |
| Query invalidation | Fine-grained control | Manual |
| Devtools | Excellent | Basic |
| Bundle size | ~13KB | ~4KB |

**Decision:** TanStack Query. The CRM requires frequent mutations (create/edit contacts, move deals between stages) with optimistic UI updates. TanStack Query's mutation and cache invalidation primitives are significantly more capable than SWR for this use case. The ~9KB bundle size difference is negligible for the functionality gained.

### Decision 4: shadcn/ui over Pre-built Component Libraries

| Factor | shadcn/ui | Ant Design / MUI |
|--------|-----------|-------------------|
| Customization | Full control (copy-paste components) | Theme overrides, limited |
| Bundle size | Only what you use | Large (full library) |
| Styling | Tailwind CSS native | CSS-in-JS or custom |
| Ownership | Source code in your repo | External dependency |
| Accessibility | Radix UI primitives (excellent) | Varies |

**Decision:** shadcn/ui. Components are copied into the project, giving full control over styling and behavior. This avoids the "fighting the framework" problem common with opinionated component libraries. Tailwind CSS integration is native, and the underlying Radix UI primitives provide solid accessibility.

### Decision 5: Cursor-based over Offset Pagination

| Factor | Cursor-based | Offset-based |
|--------|-------------|--------------|
| Performance at scale | O(1) — index seek | O(n) — full scan to offset |
| Real-time consistency | Handles inserts/deletes | Duplicates or gaps on mutation |
| Implementation | Slightly more complex | Simple `OFFSET` / `LIMIT` |
| Random page access | Not supported | Supported |

**Decision:** Cursor-based pagination. The CRM's list views are naturally browsed sequentially (newest first). Cursor-based pagination performs consistently regardless of dataset size and avoids the "shifting rows" problem when records are added or deleted between page loads. The trade-off of not supporting random page access is acceptable for this use case.

### Decision 6: Realtime Strategy

Real-time subscriptions are used selectively, not globally:

| Feature | Real-time? | Rationale |
|---------|-----------|-----------|
| Deal pipeline (Kanban) | Yes | Multiple users may move deals simultaneously |
| Activity feed | Yes | New activities should appear instantly |
| Contact/company lists | No | Low-frequency changes; background refetch sufficient |
| Dashboard stats | No | Aggregated data; periodic refresh acceptable |

**Decision:** Apply real-time subscriptions only where immediate consistency provides clear user value. This avoids unnecessary WebSocket connections and reduces Supabase real-time costs.

---

## 9. Testing Architecture

Simple CRM uses a three-layer testing strategy based on the "testing trophy" model:

| Layer | Tool | Purpose | Speed |
|-------|------|---------|-------|
| **Unit** | Vitest | Pure functions, Zod schemas, utils, hooks | ~1ms/test |
| **Integration** | Vitest + React Testing Library + MSW | Component trees with mocked Supabase API | ~50ms/test |
| **E2E** | Playwright | Full user journeys in real browsers | ~2-5s/test |

**Supabase mocking** uses MSW (Mock Service Worker) to intercept HTTP requests at the network level — the most realistic approach that doesn't require changing application code.

**Coverage targets:** 80% statements, 75% branches, 80% functions across `src/`.

See [Testing Strategy](./06-testing-strategy.md) for full details including test examples, CI/CD configuration, and coverage maps.

---

## Appendix: Provider Hierarchy

The root layout wraps the application with necessary providers:

```
<html>
  <body>
    <QueryClientProvider>        ← TanStack Query
      <ThemeProvider>             ← Dark/light mode
        {children}                ← App content
        <Toaster />               ← Toast notifications
      </ThemeProvider>
    </QueryClientProvider>
  </body>
</html>
```

The `QueryClientProvider` is a Client Component boundary. The `ThemeProvider` manages the `class` attribute on `<html>` for Tailwind dark mode.
