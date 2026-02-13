# Simple CRM — Design Overview & Implementation Roadmap

> **Version:** 1.0
> **Last Updated:** 2026-02-12
> **Status:** Ready for Implementation

---

## Executive Summary

Simple CRM is a modern, lightweight customer relationship management application built for small-to-medium businesses and sales teams. It replaces bloated enterprise CRM software with a fast, intuitive, and beautiful experience.

**Tech Stack:**
- **Frontend:** Next.js 14+ (App Router), TypeScript, React 18+
- **Styling:** Tailwind CSS v4, shadcn/ui, Lucide React icons
- **Backend:** Supabase (PostgreSQL, Auth, Realtime, Storage, Edge Functions)
- **State:** React Server Components + TanStack Query (client-side caching)
- **Forms:** React Hook Form + Zod validation
- **Charts:** Recharts
- **Deployment:** Vercel (frontend) + Supabase Cloud (backend)

**Design Aesthetic:** Clean, spacious SaaS design inspired by Linear, Vercel, Notion, and Attio. Dark mode as a first-class citizen. Indigo primary color with professional warmth.

---

## Design Documents Index

| # | Document | Description |
|---|----------|-------------|
| 01 | [Product Requirements](./01-product-requirements.md) | Product vision, 3 user personas, 32 user stories across 6 feature areas, acceptance criteria, non-functional requirements |
| 02 | [Technical Architecture](./02-architecture.md) | System architecture diagram, Next.js project structure, auth flows, data access patterns, API design, security model, performance strategy, 6 key technical decisions |
| 03 | [UX Design](./03-ux-design.md) | Information architecture, navigation design, ASCII wireframes for 10 screens, responsive behavior, 4 key user flows, accessibility guidelines |
| 04 | [Visual Design System](./04-visual-design-system.md) | Color system (light/dark), typography, spacing, 12+ component specs, animation guidelines, Tailwind config, shadcn/ui customization |
| 05 | [Database Schema](./05-database-schema.md) | 11 tables with full SQL, 25+ indexes, RLS policies, triggers/functions, storage buckets, comprehensive seed data |
| 06 | [Testing Strategy](./06-testing-strategy.md) | 3-layer test architecture (unit/integration/E2E), Vitest + RTL + MSW + Playwright, coverage targets, CI/CD, ~160-230 tests |

---

## Core Features

### 1. Contacts Management
- Full CRUD with rich fields (email, phone, address, social links, custom fields)
- Table view with search, filter by tag/company/date, sort, pagination
- Detail page with activity timeline, associated deals, and notes
- CSV import/export, tagging and segmentation

### 2. Companies / Organizations
- Full CRUD with industry, size, domain, address
- Link contacts to companies (many-to-one)
- Company detail showing associated contacts, deals, activities

### 3. Deals / Pipeline
- Visual Kanban board with drag-and-drop between stages
- Customizable pipeline stages (Lead → Qualified → Proposal → Negotiation → Won/Lost)
- Deal details: value, probability, expected close date, associated contact/company
- Table list view as alternative to Kanban
- Won/Lost tracking with close reasons

### 4. Activities & Tasks
- Activity types: Call, Email, Meeting, Task, Note
- Schedule with due dates, link to contacts/companies/deals
- Timeline view with date grouping
- My Tasks filtered view with overdue/today/upcoming sections

### 5. Dashboard & Analytics
- KPI cards: Total Contacts, Active Deals, Pipeline Value, Activities This Week
- Pipeline funnel chart, revenue by month bar chart
- Recent activity feed, upcoming tasks list

### 6. Authentication & Settings
- Email/password + OAuth (Google, GitHub) via Supabase Auth
- User profile management (avatar, name)
- Customizable pipeline stages (drag to reorder, color picker)

---

## Database Schema Overview

```
profiles (extends auth.users)
    │
    ├── contacts ──── contact_tags ──── tags
    │       │                            │
    │       └──────────────┐      deal_tags
    │                      │         │
    ├── companies ─────────┤         │
    │                      │         │
    ├── deals ─────────────┘─────────┘
    │     │
    │     └── deal_stages
    │
    ├── activities (linked to contacts, companies, deals)
    │
    └── notes (linked to contacts, companies, deals)
```

**11 tables** | **25+ indexes** | **Row Level Security on all tables** | **4 triggers/functions**

---

## Project Structure

```
simple-crm-3/
├── docs/                           # Design documents (this folder)
├── src/
│   ├── app/                        # Next.js App Router
│   │   ├── (auth)/                 # Auth pages (login, signup)
│   │   │   └── layout.tsx          # Centered card layout
│   │   ├── (dashboard)/            # Main app pages
│   │   │   ├── layout.tsx          # Sidebar + Header + Auth guard
│   │   │   ├── page.tsx            # Dashboard
│   │   │   ├── contacts/           # List, Detail, New, Edit
│   │   │   ├── companies/          # List, Detail, New, Edit
│   │   │   ├── deals/              # Pipeline (Kanban), List, Detail
│   │   │   ├── activities/         # All Activities, My Tasks
│   │   │   └── settings/           # Profile, Pipeline, Account
│   │   ├── auth/callback/          # OAuth callback handler
│   │   ├── layout.tsx              # Root layout
│   │   └── globals.css             # Global styles + CSS variables
│   ├── components/
│   │   ├── ui/                     # shadcn/ui base components
│   │   ├── layout/                 # Sidebar, Header, Breadcrumbs
│   │   ├── contacts/               # Contact-specific components
│   │   ├── companies/              # Company-specific components
│   │   ├── deals/                  # Deal cards, Kanban board, Pipeline
│   │   ├── activities/             # Activity forms, timeline
│   │   └── dashboard/              # KPI cards, charts
│   ├── lib/
│   │   ├── supabase/               # Client configs (browser, server, admin)
│   │   ├── hooks/                  # Custom React hooks (useContacts, etc.)
│   │   ├── utils/                  # Utility functions
│   │   ├── types/                  # TypeScript types (generated + custom)
│   │   └── validations/            # Zod schemas for all entities
│   └── styles/                     # Additional style files
├── public/                         # Static assets
├── supabase/
│   ├── migrations/                 # SQL migration files
│   ├── functions/                  # Edge Functions
│   └── seed.sql                    # Development seed data
├── __tests__/                      # Unit & integration tests
│   ├── setup.ts                    # Vitest global setup (MSW, jest-dom)
│   ├── mocks/                      # MSW handlers and test data factories
│   ├── utils/                      # Test wrapper (providers)
│   ├── lib/                        # Unit tests (validations, utils, hooks)
│   └── components/                 # Integration tests (component trees)
├── e2e/                            # Playwright E2E tests
│   ├── auth.setup.ts               # Auth fixture
│   ├── contacts.spec.ts
│   ├── deals.spec.ts
│   └── ...
├── vitest.config.ts                # Vitest configuration
├── playwright.config.ts            # Playwright configuration
├── tailwind.config.ts
├── next.config.ts
├── tsconfig.json
├── package.json
└── .env.local                      # Supabase keys (not committed)
```

---

## NPM Packages

### Core
| Package | Purpose |
|---------|---------|
| `next` | React framework (App Router) |
| `react`, `react-dom` | UI library |
| `typescript` | Type safety |

### Supabase
| Package | Purpose |
|---------|---------|
| `@supabase/supabase-js` | Supabase client SDK |
| `@supabase/ssr` | Server-side rendering helpers |

### UI & Styling
| Package | Purpose |
|---------|---------|
| `tailwindcss` | Utility-first CSS |
| `@tailwindcss/postcss` | PostCSS plugin for Tailwind v4 |
| `class-variance-authority` | Component variant management (shadcn) |
| `clsx` | Conditional class names |
| `tailwind-merge` | Merge Tailwind classes without conflicts |
| `lucide-react` | Icon library |
| `@radix-ui/*` | Headless UI primitives (via shadcn/ui) |

### State & Data
| Package | Purpose |
|---------|---------|
| `@tanstack/react-query` | Client-side data fetching and caching |

### Forms & Validation
| Package | Purpose |
|---------|---------|
| `react-hook-form` | Performant form handling |
| `@hookform/resolvers` | Zod integration for react-hook-form |
| `zod` | Schema validation |

### Charts & Visualization
| Package | Purpose |
|---------|---------|
| `recharts` | Chart library for dashboard |

### Utilities
| Package | Purpose |
|---------|---------|
| `date-fns` | Date formatting and manipulation |
| `@dnd-kit/core`, `@dnd-kit/sortable` | Drag and drop for Kanban board |
| `sonner` | Toast notifications |
| `cmdk` | Command palette (Cmd+K search) |
| `nuqs` | URL search params state management |
| `papaparse` | CSV parsing for import/export |

### Testing
| Package | Purpose |
|---------|---------|
| `vitest` | Test runner (unit + integration) |
| `@vitejs/plugin-react` | React support for Vitest |
| `@testing-library/react` | Component rendering and accessible queries |
| `@testing-library/jest-dom` | Custom DOM matchers |
| `@testing-library/user-event` | Realistic user interaction simulation |
| `msw` | API mocking at network level (Supabase) |
| `@faker-js/faker` | Realistic test data generation |
| `playwright`, `@playwright/test` | E2E browser testing (Chromium, Firefox, WebKit) |

### Dev Dependencies
| Package | Purpose |
|---------|---------|
| `@types/react`, `@types/node` | TypeScript type definitions |
| `eslint`, `eslint-config-next` | Linting |
| `supabase` | Supabase CLI (local dev, migrations, type gen) |

---

## Implementation Roadmap

### Phase 1: Project Setup & Authentication
**Goal:** Scaffold project, configure Supabase, implement auth

- [ ] Initialize Next.js project with TypeScript and Tailwind CSS v4
- [ ] Install all npm packages
- [ ] Configure Tailwind with custom design tokens from visual design system
- [ ] Install and configure shadcn/ui components
- [ ] Set up Supabase project (local dev with CLI)
- [ ] Run database migrations (all tables, indexes, RLS, triggers)
- [ ] Set up Supabase client utilities (browser, server, middleware)
- [ ] Implement auth pages (Login, Signup) with email/password
- [ ] Configure OAuth providers (Google, GitHub)
- [ ] Auth callback route handler
- [ ] Middleware for route protection
- [ ] Profile creation trigger on signup
- [ ] Set up Vitest with jsdom, React Testing Library, MSW
- [ ] Set up Playwright with auth fixture and project config
- [ ] Create MSW handlers for Supabase API mocking
- [ ] Create test data factories with @faker-js/faker
- [ ] Create test wrapper (QueryClientProvider)
- [ ] E2E: Auth flow tests (login, signup, redirect, invalid credentials)

**Key Files:** `middleware.ts`, `src/lib/supabase/`, `src/app/(auth)/`, `vitest.config.ts`, `playwright.config.ts`, `__tests__/setup.ts`

### Phase 2: Layout & Navigation
**Goal:** Build the app shell that all pages share

- [ ] Root layout with theme provider (dark/light mode)
- [ ] Dashboard layout with collapsible sidebar
- [ ] Sidebar navigation component (icons, labels, active states)
- [ ] Header with breadcrumbs and user menu
- [ ] Global search command palette (Cmd+K)
- [ ] Responsive sidebar behavior (collapse on tablet, hamburger on mobile)
- [ ] Integration tests: Sidebar (nav links, active state, collapse/expand)
- [ ] Integration tests: Command palette (open, search, navigate)
- [ ] E2E: Responsive sidebar test (mobile hamburger, tablet collapse)

**Key Files:** `src/app/(dashboard)/layout.tsx`, `src/components/layout/`, `__tests__/components/layout/`

### Phase 3: Contacts & Companies
**Goal:** Full CRUD for the two primary entities

- [ ] Zod validation schemas for contacts and companies
- [ ] TypeScript types (generate from Supabase)
- [ ] Contacts list page (server component with Suspense)
- [ ] Data table component (sortable, filterable, paginated)
- [ ] Contact detail page with tabs (Overview, Activities, Deals, Notes)
- [ ] Add/Edit contact forms (modal + full page)
- [ ] Contact delete with confirmation dialog
- [ ] Companies list page
- [ ] Company detail page with tabs
- [ ] Add/Edit company forms
- [ ] Link contacts to companies
- [ ] Tags system (create, assign, filter by)
- [ ] CSV import/export for contacts
- [ ] Empty states and loading skeletons
- [ ] Unit tests: Zod schemas for contacts and companies (valid/invalid inputs)
- [ ] Unit tests: Utility functions (formatCurrency, getInitials, CSV parsing)
- [ ] Integration tests: ContactsList (render, search, filter, empty state, pagination)
- [ ] Integration tests: ContactForm (create, edit, validation errors)
- [ ] Integration tests: ContactDetail (tabs, edit, delete)
- [ ] Integration tests: CompaniesList, CompanyForm
- [ ] Integration tests: DataTable (sort, filter, select, bulk actions)
- [ ] E2E: Full contact lifecycle (create → view → edit → delete)
- [ ] E2E: Contact search and filter
- [ ] E2E: Companies CRUD journey

**Key Files:** `src/app/(dashboard)/contacts/`, `src/app/(dashboard)/companies/`, `__tests__/components/contacts/`, `__tests__/components/companies/`, `e2e/contacts.spec.ts`, `e2e/companies.spec.ts`

### Phase 4: Deals & Pipeline
**Goal:** Pipeline management with Kanban and list views

- [ ] Deal stages setup (default stages seeded)
- [ ] Deals pipeline page (Kanban board)
- [ ] Kanban column component with deal cards
- [ ] Drag and drop between stages (@dnd-kit)
- [ ] Deals list view (table)
- [ ] View toggle (Kanban ↔ List)
- [ ] Deal detail slide-over panel
- [ ] Add/Edit deal forms
- [ ] Close deal flow (Won/Lost with reason)
- [ ] Link deals to contacts and companies
- [ ] Pipeline stages settings (reorder, color, add/remove)
- [ ] Unit tests: Pipeline value calculation, stage grouping, conversion rates
- [ ] Unit tests: Deal Zod schema validation
- [ ] Integration tests: PipelineBoard (stages, cards in columns, totals)
- [ ] Integration tests: DealCard, DealForm, DealSlideOver
- [ ] E2E: Create deal and move through pipeline stages
- [ ] E2E: Kanban ↔ List view toggle
- [ ] E2E: Close deal (won/lost)

**Key Files:** `src/app/(dashboard)/deals/`, `src/components/deals/`, `__tests__/components/deals/`, `e2e/deals.spec.ts`

### Phase 5: Activities & Tasks
**Goal:** Activity tracking and task management

- [ ] Activities list page with timeline view
- [ ] Filter by type (Call, Email, Meeting, Task, Note)
- [ ] My Tasks view (overdue, today, upcoming groupings)
- [ ] Quick-add activity form (linked to contact/company/deal)
- [ ] Activity detail and edit
- [ ] Task completion toggle
- [ ] Notes system (add notes to contacts, companies, deals)
- [ ] Activity timeline on entity detail pages
- [ ] Unit tests: Activity Zod schema validation
- [ ] Integration tests: ActivitiesList (filter by type, timeline, complete toggle)
- [ ] Integration tests: ActivityForm (type select, entity linking)
- [ ] E2E: Create activity, complete task, filter by type

**Key Files:** `src/app/(dashboard)/activities/`, `src/components/activities/`, `__tests__/components/activities/`, `e2e/activities.spec.ts`

### Phase 6: Dashboard & Analytics
**Goal:** Data visualization and overview

- [ ] Dashboard page with KPI cards
- [ ] Pipeline funnel chart (Recharts)
- [ ] Revenue by month bar chart
- [ ] Recent activity feed component
- [ ] Upcoming tasks widget
- [ ] Dashboard data aggregation (Edge Function or server query)
- [ ] Real-time subscription for live dashboard updates
- [ ] Integration tests: Dashboard (KPI cards, charts render, activity feed)
- [ ] E2E: Dashboard displays KPIs and charts
- [ ] E2E: Global search (Cmd+K, search, navigate to result)

**Key Files:** `src/app/(dashboard)/page.tsx`, `src/components/dashboard/`, `__tests__/components/dashboard/`, `e2e/dashboard.spec.ts`, `e2e/search.spec.ts`

### Phase 7: Polish & Production Readiness
**Goal:** Responsive design, dark mode, performance, final touches

- [ ] Dark mode toggle and persistence
- [ ] Responsive design pass on all screens
- [ ] Loading states (skeletons) for all pages
- [ ] Error boundaries and error states
- [ ] Toast notifications for all actions
- [ ] Optimistic updates for mutations
- [ ] Real-time subscriptions for cross-tab updates
- [ ] Keyboard shortcuts (documented)
- [ ] Accessibility audit (focus management, ARIA labels, contrast)
- [ ] Performance audit (bundle size, Core Web Vitals)
- [ ] SEO meta tags
- [ ] Seed data verification
- [ ] Environment variable documentation
- [ ] Deployment configuration (Vercel + Supabase)
- [ ] Final test coverage audit (target: 80% statements)
- [ ] CI/CD: GitHub Actions workflow (unit/integration + E2E + type check + lint)
- [ ] E2E: Settings tests (profile edit, pipeline stage reorder)
- [ ] E2E: Full cross-browser run (Chromium, Firefox, Mobile Chrome)

---

## Key Technical Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Backend | Supabase | All-in-one (DB, Auth, Realtime, Storage), no custom API needed, generous free tier |
| Frontend Framework | Next.js 14+ App Router | Server Components for performance, file-based routing, Vercel deployment |
| Styling | Tailwind CSS + shadcn/ui | Utility-first for rapid development, shadcn gives accessible, customizable components |
| State Management | TanStack Query | Excellent caching, optimistic updates, query invalidation — no Redux needed |
| Forms | React Hook Form + Zod | Performant (uncontrolled), type-safe validation, shared schemas with API |
| Drag & Drop | @dnd-kit | Modern, accessible, lightweight — purpose-built for React |
| Charts | Recharts | React-native, composable, good documentation, sufficient for CRM dashboards |
| Auth | Supabase Auth | Built-in email + OAuth, JWT tokens, integrates with RLS — zero custom auth code |
| Data Isolation | Row Level Security | Database-level enforcement — impossible to leak data even with frontend bugs |
| Pagination | Cursor-based | Better performance at scale than offset, consistent with Supabase patterns |
| Unit/Integration Testing | Vitest + RTL + MSW | Fast, ESM-native, Jest-compatible API; MSW mocks Supabase at network level |
| E2E Testing | Playwright | Multi-browser, fast, built-in assertions, auth fixtures, CI-ready |
| API Mocking | MSW (Mock Service Worker) | Network-level interception — most realistic, no app code changes needed |

---

## Getting Started (for implementation)

```bash
# 1. Create Next.js project
npx create-next-app@latest simple-crm-3 --typescript --tailwind --eslint --app --src-dir

# 2. Install dependencies
npm install @supabase/supabase-js @supabase/ssr @tanstack/react-query \
  react-hook-form @hookform/resolvers zod recharts date-fns \
  @dnd-kit/core @dnd-kit/sortable sonner cmdk nuqs papaparse \
  lucide-react class-variance-authority clsx tailwind-merge

npm install -D supabase @types/papaparse \
  vitest @vitejs/plugin-react @testing-library/react @testing-library/jest-dom \
  @testing-library/user-event msw @faker-js/faker playwright @playwright/test

# 2b. Initialize Playwright browsers
npx playwright install

# 3. Initialize Supabase
npx supabase init
npx supabase start

# 4. Run migrations
npx supabase db reset  # applies migrations + seed

# 5. Generate TypeScript types
npx supabase gen types typescript --local > src/lib/types/database.ts

# 6. Configure environment
cp .env.example .env.local
# Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY

# 7. Start development
npm run dev
```

---

*This document serves as the master reference for the Simple CRM implementation. All design decisions are documented in the linked specification files. Implementation should follow the phased roadmap above.*
