# Testing Strategy — Simple CRM

> **Version:** 1.0
> **Last Updated:** 2026-02-12
> **Status:** Draft

---

## Table of Contents

1. [Testing Philosophy](#1-testing-philosophy)
2. [Testing Stack](#2-testing-stack)
3. [Test Architecture](#3-test-architecture)
4. [Unit Tests](#4-unit-tests)
5. [Integration Tests](#5-integration-tests)
6. [End-to-End Tests](#6-end-to-end-tests)
7. [Test Organization](#7-test-organization)
8. [Mocking Strategy](#8-mocking-strategy)
9. [Coverage Targets](#9-coverage-targets)
10. [CI/CD Integration](#10-cicd-integration)

---

## 1. Testing Philosophy

### Testing Trophy Approach

We follow the "testing trophy" model (Kent C. Dodds), emphasizing integration tests as the highest-value layer, backed by unit tests for pure logic and E2E tests for critical user journeys.

```
         ╱╲
        ╱ E2E ╲           Few — critical user journeys only
       ╱────────╲
      ╱Integration╲       Many — component + hook + API tests
     ╱──────────────╲
    ╱   Unit Tests    ╲    Targeted — pure functions, validators, utils
   ╱────────────────────╲
  ╱    Static Analysis    ╲  TypeScript + ESLint (always on)
 ╱──────────────────────────╲
```

### Guiding Principles

| Principle | Description |
|-----------|-------------|
| **Test behavior, not implementation** | Tests assert what the user sees and does, not internal state or DOM structure |
| **Confidence over coverage** | Prioritize tests that catch real bugs over hitting arbitrary coverage numbers |
| **Fast feedback** | Unit and integration tests run in <30s; E2E tests in <5min |
| **Maintainable** | Tests use accessible queries (getByRole, getByLabelText) — resilient to refactors |
| **Realistic** | Integration tests render full component trees; E2E tests use real browser + Supabase |

---

## 2. Testing Stack

### Unit & Integration Tests

| Package | Purpose |
|---------|---------|
| `vitest` | Test runner — fast, native ESM, Vite-compatible, Jest-compatible API |
| `@testing-library/react` | Component rendering and queries (accessible selectors) |
| `@testing-library/jest-dom` | Custom matchers (toBeInTheDocument, toBeVisible, etc.) |
| `@testing-library/user-event` | Simulate realistic user interactions (click, type, tab) |
| `msw` | API mocking — intercepts Supabase HTTP requests at network level |
| `@faker-js/faker` | Generate realistic test data |

### End-to-End Tests

| Package | Purpose |
|---------|---------|
| `playwright` | Browser automation — Chromium, Firefox, WebKit |
| `@playwright/test` | Test runner with built-in assertions, fixtures, and parallelism |

### Static Analysis (always on)

| Tool | Purpose |
|------|---------|
| TypeScript (`strict` mode) | Type checking across entire codebase |
| ESLint + `eslint-config-next` | Code quality and Next.js best practices |

---

## 3. Test Architecture

### Layer Overview

```
┌──────────────────────────────────────────────────────────────────────┐
│                        E2E Tests (Playwright)                         │
│   Real browser → Next.js dev server → Supabase local (test schema)    │
│   Tests: Auth flows, CRUD journeys, pipeline drag-drop, search        │
└────────────────────────────────┬─────────────────────────────────────┘
                                 │
┌────────────────────────────────┴─────────────────────────────────────┐
│                   Integration Tests (Vitest + RTL)                     │
│   Component tree rendering with mocked Supabase (MSW)                 │
│   Tests: Page components, forms, data tables, Kanban, dashboard       │
└────────────────────────────────┬─────────────────────────────────────┘
                                 │
┌────────────────────────────────┴─────────────────────────────────────┐
│                      Unit Tests (Vitest)                               │
│   Pure functions, no DOM, no network                                   │
│   Tests: Zod schemas, utils, formatters, hooks (renderHook)           │
└──────────────────────────────────────────────────────────────────────┘
```

### Test Environments

| Layer | Environment | Supabase | Speed |
|-------|-------------|----------|-------|
| Unit | Vitest (Node) | Not used | ~1ms per test |
| Integration | Vitest + jsdom | Mocked via MSW | ~50ms per test |
| E2E | Playwright (real browser) | Local Supabase instance | ~2-5s per test |

---

## 4. Unit Tests

Unit tests cover pure logic with no DOM or network dependencies.

### What to Unit Test

#### Zod Validation Schemas (`src/lib/validations/`)
```typescript
// __tests__/lib/validations/contact.test.ts
import { describe, it, expect } from 'vitest'
import { contactSchema } from '@/lib/validations/contact'

describe('contactSchema', () => {
  it('accepts valid contact data', () => {
    const result = contactSchema.safeParse({
      first_name: 'John',
      last_name: 'Doe',
      email: 'john@example.com',
    })
    expect(result.success).toBe(true)
  })

  it('rejects missing first_name', () => {
    const result = contactSchema.safeParse({
      last_name: 'Doe',
    })
    expect(result.success).toBe(false)
    expect(result.error?.issues[0].path).toEqual(['first_name'])
  })

  it('rejects invalid email format', () => {
    const result = contactSchema.safeParse({
      first_name: 'John',
      last_name: 'Doe',
      email: 'not-an-email',
    })
    expect(result.success).toBe(false)
  })

  it('accepts contact without optional fields', () => {
    const result = contactSchema.safeParse({
      first_name: 'John',
      last_name: 'Doe',
    })
    expect(result.success).toBe(true)
  })
})
```

#### Utility Functions (`src/lib/utils/`)
```typescript
// __tests__/lib/utils/format.test.ts
import { describe, it, expect } from 'vitest'
import { formatCurrency, formatPhoneNumber, getInitials, getAvatarColor } from '@/lib/utils/format'

describe('formatCurrency', () => {
  it('formats whole numbers', () => {
    expect(formatCurrency(1000)).toBe('$1,000.00')
  })
  it('formats decimals', () => {
    expect(formatCurrency(1234.5)).toBe('$1,234.50')
  })
  it('handles zero', () => {
    expect(formatCurrency(0)).toBe('$0.00')
  })
  it('handles null/undefined gracefully', () => {
    expect(formatCurrency(null)).toBe('—')
  })
})

describe('getInitials', () => {
  it('returns first letters of first and last name', () => {
    expect(getInitials('John', 'Doe')).toBe('JD')
  })
  it('handles single name', () => {
    expect(getInitials('John', '')).toBe('J')
  })
})

describe('getAvatarColor', () => {
  it('returns consistent color for same name', () => {
    const color1 = getAvatarColor('John Doe')
    const color2 = getAvatarColor('John Doe')
    expect(color1).toBe(color2)
  })
  it('returns different colors for different names', () => {
    const color1 = getAvatarColor('John Doe')
    const color2 = getAvatarColor('Jane Smith')
    expect(color1).not.toBe(color2)
  })
})
```

#### Data Transformation & Business Logic
```typescript
// __tests__/lib/utils/pipeline.test.ts
import { describe, it, expect } from 'vitest'
import { calculatePipelineValue, groupDealsByStage, calculateConversionRate } from '@/lib/utils/pipeline'

describe('calculatePipelineValue', () => {
  it('sums values of active deals weighted by probability', () => {
    const deals = [
      { value: 10000, probability: 50, stage: { is_won: false, is_lost: false } },
      { value: 20000, probability: 80, stage: { is_won: false, is_lost: false } },
    ]
    expect(calculatePipelineValue(deals)).toBe(21000) // 5000 + 16000
  })

  it('excludes won and lost deals', () => {
    const deals = [
      { value: 10000, probability: 100, stage: { is_won: true, is_lost: false } },
      { value: 5000, probability: 50, stage: { is_won: false, is_lost: false } },
    ]
    expect(calculatePipelineValue(deals)).toBe(2500)
  })

  it('returns 0 for empty deals array', () => {
    expect(calculatePipelineValue([])).toBe(0)
  })
})

describe('groupDealsByStage', () => {
  it('groups deals into stage buckets ordered by position', () => {
    const deals = [
      { id: '1', stage_id: 'a', stage: { position: 1 } },
      { id: '2', stage_id: 'b', stage: { position: 2 } },
      { id: '3', stage_id: 'a', stage: { position: 1 } },
    ]
    const grouped = groupDealsByStage(deals)
    expect(grouped[0].deals).toHaveLength(2)
    expect(grouped[1].deals).toHaveLength(1)
  })
})
```

#### Custom Hooks (with `renderHook`)
```typescript
// __tests__/lib/hooks/use-debounce.test.ts
import { describe, it, expect, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useDebounce } from '@/lib/hooks/use-debounce'

describe('useDebounce', () => {
  it('returns initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('hello', 300))
    expect(result.current).toBe('hello')
  })

  it('debounces value updates', async () => {
    vi.useFakeTimers()
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 300),
      { initialProps: { value: 'hello' } }
    )

    rerender({ value: 'world' })
    expect(result.current).toBe('hello') // still old value

    act(() => { vi.advanceTimersByTime(300) })
    expect(result.current).toBe('world') // updated after delay

    vi.useRealTimers()
  })
})
```

### Full Unit Test Coverage Map

| Module | Test File | What to Test |
|--------|-----------|-------------|
| `validations/contact.ts` | `contact.test.ts` | Valid/invalid inputs for all fields, edge cases |
| `validations/company.ts` | `company.test.ts` | Required fields, optional fields, size enum |
| `validations/deal.ts` | `deal.test.ts` | Value ranges, probability 0-100, date validation |
| `validations/activity.ts` | `activity.test.ts` | Type enum, due date logic |
| `utils/format.ts` | `format.test.ts` | Currency, phone, dates, initials, avatar colors |
| `utils/pipeline.ts` | `pipeline.test.ts` | Pipeline value, stage grouping, conversion rates |
| `utils/csv.ts` | `csv.test.ts` | CSV parsing, export formatting, error handling |
| `utils/search.ts` | `search.test.ts` | Search query parsing, filtering logic |
| `hooks/use-debounce.ts` | `use-debounce.test.ts` | Debounce timing, cleanup |
| `hooks/use-pagination.ts` | `use-pagination.test.ts` | Cursor tracking, page state |

---

## 5. Integration Tests

Integration tests render component trees with mocked network calls via MSW.

### MSW Setup (Supabase Mocking)

```typescript
// __tests__/mocks/handlers.ts
import { http, HttpResponse } from 'msw'

const SUPABASE_URL = 'http://localhost:54321'

export const handlers = [
  // GET contacts
  http.get(`${SUPABASE_URL}/rest/v1/contacts`, ({ request }) => {
    const url = new URL(request.url)
    const select = url.searchParams.get('select')

    return HttpResponse.json([
      {
        id: '1',
        first_name: 'John',
        last_name: 'Doe',
        email: 'john@example.com',
        company: { id: '1', name: 'Acme Corp' },
      },
      {
        id: '2',
        first_name: 'Jane',
        last_name: 'Smith',
        email: 'jane@example.com',
        company: null,
      },
    ])
  }),

  // POST contacts
  http.post(`${SUPABASE_URL}/rest/v1/contacts`, async ({ request }) => {
    const body = await request.json()
    return HttpResponse.json(
      { id: 'new-id', ...body, created_at: new Date().toISOString() },
      { status: 201 }
    )
  }),

  // GET deals with stage join
  http.get(`${SUPABASE_URL}/rest/v1/deals`, () => {
    return HttpResponse.json([
      {
        id: '1',
        title: 'Enterprise Deal',
        value: 50000,
        probability: 60,
        stage: { id: 's1', name: 'Proposal', position: 3, color: '#7C3AED' },
        contact: { id: '1', first_name: 'John', last_name: 'Doe' },
      },
    ])
  }),

  // GET deal_stages
  http.get(`${SUPABASE_URL}/rest/v1/deal_stages`, () => {
    return HttpResponse.json([
      { id: 's1', name: 'Lead', position: 1, color: '#64748B', is_won: false, is_lost: false },
      { id: 's2', name: 'Qualified', position: 2, color: '#3B82F6', is_won: false, is_lost: false },
      { id: 's3', name: 'Proposal', position: 3, color: '#7C3AED', is_won: false, is_lost: false },
      { id: 's4', name: 'Negotiation', position: 4, color: '#F59E0B', is_won: false, is_lost: false },
      { id: 's5', name: 'Won', position: 5, color: '#10B981', is_won: true, is_lost: false },
      { id: 's6', name: 'Lost', position: 6, color: '#F43F5E', is_won: false, is_lost: true },
    ])
  }),

  // Auth session
  http.get(`${SUPABASE_URL}/auth/v1/session`, () => {
    return HttpResponse.json({
      user: { id: 'user-1', email: 'test@example.com' },
      access_token: 'mock-token',
    })
  }),
]
```

```typescript
// __tests__/mocks/server.ts
import { setupServer } from 'msw/node'
import { handlers } from './handlers'

export const server = setupServer(...handlers)
```

```typescript
// __tests__/setup.ts
import { beforeAll, afterAll, afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import { server } from './mocks/server'

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
afterEach(() => {
  cleanup()
  server.resetHandlers()
})
afterAll(() => server.close())
```

### Test Wrapper (Providers)

```typescript
// __tests__/utils/test-wrapper.tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactNode } from 'react'

export function createTestWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
      mutations: { retry: false },
    },
  })

  return function TestWrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    )
  }
}
```

### Component Integration Tests

#### Contacts List Page
```typescript
// __tests__/components/contacts/contacts-list.test.tsx
import { describe, it, expect } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ContactsList } from '@/components/contacts/contacts-list'
import { createTestWrapper } from '../../utils/test-wrapper'

describe('ContactsList', () => {
  it('renders contact data in table', async () => {
    render(<ContactsList />, { wrapper: createTestWrapper() })

    expect(await screen.findByText('John Doe')).toBeInTheDocument()
    expect(screen.getByText('jane@example.com')).toBeInTheDocument()
  })

  it('shows loading skeleton initially', () => {
    render(<ContactsList />, { wrapper: createTestWrapper() })
    expect(screen.getByTestId('contacts-skeleton')).toBeInTheDocument()
  })

  it('filters contacts by search term', async () => {
    const user = userEvent.setup()
    render(<ContactsList />, { wrapper: createTestWrapper() })

    await screen.findByText('John Doe')
    const searchInput = screen.getByPlaceholderText(/search contacts/i)
    await user.type(searchInput, 'Jane')

    expect(screen.getByText('Jane Smith')).toBeInTheDocument()
  })

  it('opens add contact dialog on button click', async () => {
    const user = userEvent.setup()
    render(<ContactsList />, { wrapper: createTestWrapper() })

    await user.click(screen.getByRole('button', { name: /add contact/i }))
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByLabelText(/first name/i)).toBeInTheDocument()
  })

  it('shows empty state when no contacts', async () => {
    // Override handler to return empty array
    server.use(
      http.get('*/rest/v1/contacts', () => HttpResponse.json([]))
    )
    render(<ContactsList />, { wrapper: createTestWrapper() })

    expect(await screen.findByText(/no contacts yet/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /add your first contact/i })).toBeInTheDocument()
  })
})
```

#### Contact Form
```typescript
// __tests__/components/contacts/contact-form.test.tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ContactForm } from '@/components/contacts/contact-form'
import { createTestWrapper } from '../../utils/test-wrapper'

describe('ContactForm', () => {
  it('submits valid form data', async () => {
    const onSuccess = vi.fn()
    const user = userEvent.setup()
    render(<ContactForm onSuccess={onSuccess} />, { wrapper: createTestWrapper() })

    await user.type(screen.getByLabelText(/first name/i), 'John')
    await user.type(screen.getByLabelText(/last name/i), 'Doe')
    await user.type(screen.getByLabelText(/email/i), 'john@example.com')
    await user.click(screen.getByRole('button', { name: /save/i }))

    await waitFor(() => expect(onSuccess).toHaveBeenCalled())
  })

  it('shows validation errors for required fields', async () => {
    const user = userEvent.setup()
    render(<ContactForm />, { wrapper: createTestWrapper() })

    await user.click(screen.getByRole('button', { name: /save/i }))

    expect(await screen.findByText(/first name is required/i)).toBeInTheDocument()
    expect(screen.getByText(/last name is required/i)).toBeInTheDocument()
  })

  it('shows error for invalid email', async () => {
    const user = userEvent.setup()
    render(<ContactForm />, { wrapper: createTestWrapper() })

    await user.type(screen.getByLabelText(/first name/i), 'John')
    await user.type(screen.getByLabelText(/last name/i), 'Doe')
    await user.type(screen.getByLabelText(/email/i), 'not-valid')
    await user.click(screen.getByRole('button', { name: /save/i }))

    expect(await screen.findByText(/invalid email/i)).toBeInTheDocument()
  })

  it('pre-fills form in edit mode', () => {
    const contact = {
      id: '1',
      first_name: 'John',
      last_name: 'Doe',
      email: 'john@example.com',
    }
    render(<ContactForm contact={contact} />, { wrapper: createTestWrapper() })

    expect(screen.getByLabelText(/first name/i)).toHaveValue('John')
    expect(screen.getByLabelText(/last name/i)).toHaveValue('Doe')
  })
})
```

#### Deals Pipeline (Kanban)
```typescript
// __tests__/components/deals/pipeline-board.test.tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { PipelineBoard } from '@/components/deals/pipeline-board'
import { createTestWrapper } from '../../utils/test-wrapper'

describe('PipelineBoard', () => {
  it('renders all pipeline stages as columns', async () => {
    render(<PipelineBoard />, { wrapper: createTestWrapper() })

    expect(await screen.findByText('Lead')).toBeInTheDocument()
    expect(screen.getByText('Qualified')).toBeInTheDocument()
    expect(screen.getByText('Proposal')).toBeInTheDocument()
    expect(screen.getByText('Negotiation')).toBeInTheDocument()
    expect(screen.getByText('Won')).toBeInTheDocument()
    expect(screen.getByText('Lost')).toBeInTheDocument()
  })

  it('renders deal cards in correct columns', async () => {
    render(<PipelineBoard />, { wrapper: createTestWrapper() })

    const proposalColumn = await screen.findByTestId('stage-column-Proposal')
    expect(within(proposalColumn).getByText('Enterprise Deal')).toBeInTheDocument()
    expect(within(proposalColumn).getByText('$50,000')).toBeInTheDocument()
  })

  it('shows total value per stage column', async () => {
    render(<PipelineBoard />, { wrapper: createTestWrapper() })
    const proposalColumn = await screen.findByTestId('stage-column-Proposal')
    expect(within(proposalColumn).getByText(/\$50,000/)).toBeInTheDocument()
  })
})
```

#### Dashboard
```typescript
// __tests__/components/dashboard/dashboard.test.tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Dashboard } from '@/components/dashboard/dashboard'
import { createTestWrapper } from '../../utils/test-wrapper'

describe('Dashboard', () => {
  it('renders KPI cards', async () => {
    render(<Dashboard />, { wrapper: createTestWrapper() })

    expect(await screen.findByText(/total contacts/i)).toBeInTheDocument()
    expect(screen.getByText(/active deals/i)).toBeInTheDocument()
    expect(screen.getByText(/pipeline value/i)).toBeInTheDocument()
  })

  it('renders recent activity feed', async () => {
    render(<Dashboard />, { wrapper: createTestWrapper() })
    expect(await screen.findByText(/recent activity/i)).toBeInTheDocument()
  })
})
```

### Full Integration Test Coverage Map

| Component | Test File | Key Scenarios |
|-----------|-----------|---------------|
| `ContactsList` | `contacts-list.test.tsx` | Render, search, filter, add button, empty state, pagination |
| `ContactDetail` | `contact-detail.test.tsx` | Tabs (overview/activities/deals/notes), edit, delete |
| `ContactForm` | `contact-form.test.tsx` | Create, edit, validation errors, submit, company select |
| `CompaniesList` | `companies-list.test.tsx` | Render, search, add, empty state |
| `CompanyForm` | `company-form.test.tsx` | Create, edit, validation, industry/size selects |
| `PipelineBoard` | `pipeline-board.test.tsx` | Stages render, cards in columns, stage totals |
| `DealCard` | `deal-card.test.tsx` | Display value, contact, close date, probability badge |
| `DealForm` | `deal-form.test.tsx` | Create, stage select, contact/company linking |
| `DealSlideOver` | `deal-slide-over.test.tsx` | Open/close, display data, close deal action |
| `ActivitiesList` | `activities-list.test.tsx` | Filter by type, timeline grouping, complete toggle |
| `ActivityForm` | `activity-form.test.tsx` | Type select, entity linking, due date |
| `Dashboard` | `dashboard.test.tsx` | KPI cards, charts render, activity feed |
| `Sidebar` | `sidebar.test.tsx` | Navigation links, active state, collapse/expand |
| `CommandPalette` | `command-palette.test.tsx` | Open (Cmd+K), search, navigate results |
| `DataTable` | `data-table.test.tsx` | Sort, filter, select, pagination, bulk actions |
| `DeleteDialog` | `delete-dialog.test.tsx` | Confirm, cancel, loading state |
| `TagInput` | `tag-input.test.tsx` | Add, remove, autocomplete |

---

## 6. End-to-End Tests

E2E tests use Playwright with a real browser against a local Next.js dev server and Supabase local instance.

### Playwright Configuration

```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? 'github' : 'html',
  timeout: 30_000,

  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'on-first-retry',
  },

  projects: [
    // Setup: authenticate and save session state
    { name: 'setup', testMatch: /.*\.setup\.ts/, teardown: 'teardown' },
    { name: 'teardown', testMatch: /.*\.teardown\.ts/ },

    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'e2e/.auth/user.json',
      },
      dependencies: ['setup'],
    },
    {
      name: 'firefox',
      use: {
        ...devices['Desktop Firefox'],
        storageState: 'e2e/.auth/user.json',
      },
      dependencies: ['setup'],
    },
    {
      name: 'mobile-chrome',
      use: {
        ...devices['Pixel 7'],
        storageState: 'e2e/.auth/user.json',
      },
      dependencies: ['setup'],
    },
  ],

  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
})
```

### Auth Setup Fixture

```typescript
// e2e/auth.setup.ts
import { test as setup, expect } from '@playwright/test'

const TEST_USER = {
  email: 'e2e-test@example.com',
  password: 'test-password-123',
}

setup('authenticate', async ({ page }) => {
  await page.goto('/login')
  await page.getByLabel(/email/i).fill(TEST_USER.email)
  await page.getByLabel(/password/i).fill(TEST_USER.password)
  await page.getByRole('button', { name: /sign in/i }).click()

  // Wait for redirect to dashboard
  await expect(page).toHaveURL('/')
  await expect(page.getByText(/dashboard/i)).toBeVisible()

  // Save authenticated session state
  await page.context().storageState({ path: 'e2e/.auth/user.json' })
})
```

### E2E Test Suites

#### Authentication Flow
```typescript
// e2e/auth.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Authentication', () => {
  test.use({ storageState: { cookies: [], origins: [] } }) // unauthenticated

  test('redirects unauthenticated users to login', async ({ page }) => {
    await page.goto('/contacts')
    await expect(page).toHaveURL(/\/login/)
  })

  test('logs in with email and password', async ({ page }) => {
    await page.goto('/login')
    await page.getByLabel(/email/i).fill('e2e-test@example.com')
    await page.getByLabel(/password/i).fill('test-password-123')
    await page.getByRole('button', { name: /sign in/i }).click()

    await expect(page).toHaveURL('/')
    await expect(page.getByText(/dashboard/i)).toBeVisible()
  })

  test('shows validation errors for invalid credentials', async ({ page }) => {
    await page.goto('/login')
    await page.getByLabel(/email/i).fill('wrong@example.com')
    await page.getByLabel(/password/i).fill('wrong-password')
    await page.getByRole('button', { name: /sign in/i }).click()

    await expect(page.getByText(/invalid/i)).toBeVisible()
  })

  test('signs up a new user', async ({ page }) => {
    await page.goto('/signup')
    await page.getByLabel(/full name/i).fill('Test User')
    await page.getByLabel(/email/i).fill(`test-${Date.now()}@example.com`)
    await page.getByLabel(/password/i).fill('secure-password-123')
    await page.getByRole('button', { name: /sign up/i }).click()

    await expect(page.getByText(/check your email|dashboard/i)).toBeVisible()
  })
})
```

#### Contacts CRUD Journey
```typescript
// e2e/contacts.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Contacts', () => {
  test('full contact lifecycle: create, view, edit, delete', async ({ page }) => {
    // Navigate to contacts
    await page.goto('/contacts')
    await expect(page.getByRole('heading', { name: /contacts/i })).toBeVisible()

    // Create new contact
    await page.getByRole('button', { name: /add contact/i }).click()
    await page.getByLabel(/first name/i).fill('E2E Test')
    await page.getByLabel(/last name/i).fill('Contact')
    await page.getByLabel(/email/i).fill('e2e-contact@test.com')
    await page.getByLabel(/phone/i).fill('+1 555-0123')
    await page.getByRole('button', { name: /save/i }).click()

    // Verify toast notification
    await expect(page.getByText(/contact created/i)).toBeVisible()

    // Verify contact appears in list
    await expect(page.getByText('E2E Test Contact')).toBeVisible()

    // Click to view detail
    await page.getByText('E2E Test Contact').click()
    await expect(page.getByRole('heading', { name: /E2E Test Contact/i })).toBeVisible()
    await expect(page.getByText('e2e-contact@test.com')).toBeVisible()

    // Edit contact
    await page.getByRole('button', { name: /edit/i }).click()
    await page.getByLabel(/first name/i).clear()
    await page.getByLabel(/first name/i).fill('Updated E2E')
    await page.getByRole('button', { name: /save/i }).click()

    await expect(page.getByText(/contact updated/i)).toBeVisible()
    await expect(page.getByRole('heading', { name: /Updated E2E Contact/i })).toBeVisible()

    // Delete contact
    await page.getByRole('button', { name: /delete/i }).click()
    await page.getByRole('button', { name: /confirm/i }).click()

    await expect(page.getByText(/contact deleted/i)).toBeVisible()
    await expect(page).toHaveURL('/contacts')
  })

  test('searches and filters contacts', async ({ page }) => {
    await page.goto('/contacts')
    await expect(page.getByRole('heading', { name: /contacts/i })).toBeVisible()

    // Search by name
    const searchInput = page.getByPlaceholderText(/search/i)
    await searchInput.fill('John')
    await expect(page.getByText('John')).toBeVisible()

    // Clear search
    await searchInput.clear()
  })
})
```

#### Deals Pipeline Journey
```typescript
// e2e/deals.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Deals Pipeline', () => {
  test('creates a deal and moves it through pipeline stages', async ({ page }) => {
    await page.goto('/deals')

    // Verify Kanban board renders
    await expect(page.getByText('Lead')).toBeVisible()
    await expect(page.getByText('Qualified')).toBeVisible()

    // Create new deal
    await page.getByRole('button', { name: /add deal/i }).click()
    await page.getByLabel(/title/i).fill('E2E Test Deal')
    await page.getByLabel(/value/i).fill('25000')
    await page.getByRole('button', { name: /save/i }).click()

    await expect(page.getByText(/deal created/i)).toBeVisible()
    await expect(page.getByText('E2E Test Deal')).toBeVisible()

    // Click deal card to open detail
    await page.getByText('E2E Test Deal').click()
    await expect(page.getByText('$25,000')).toBeVisible()

    // Change stage via dropdown
    await page.getByRole('combobox', { name: /stage/i }).click()
    await page.getByRole('option', { name: /qualified/i }).click()

    await expect(page.getByText(/deal updated/i)).toBeVisible()

    // Close the deal as Won
    await page.getByRole('button', { name: /close deal/i }).click()
    await page.getByRole('button', { name: /won/i }).click()

    await expect(page.getByText(/deal closed/i)).toBeVisible()
  })

  test('switches between Kanban and list views', async ({ page }) => {
    await page.goto('/deals')

    // Default: Kanban view
    await expect(page.getByTestId('pipeline-board')).toBeVisible()

    // Switch to list view
    await page.getByRole('button', { name: /list/i }).click()
    await expect(page.getByRole('table')).toBeVisible()

    // Switch back to Kanban
    await page.getByRole('button', { name: /board/i }).click()
    await expect(page.getByTestId('pipeline-board')).toBeVisible()
  })
})
```

#### Dashboard
```typescript
// e2e/dashboard.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Dashboard', () => {
  test('displays KPI cards and charts', async ({ page }) => {
    await page.goto('/')

    await expect(page.getByText(/total contacts/i)).toBeVisible()
    await expect(page.getByText(/active deals/i)).toBeVisible()
    await expect(page.getByText(/pipeline value/i)).toBeVisible()
    await expect(page.getByText(/recent activity/i)).toBeVisible()
  })
})
```

#### Global Search
```typescript
// e2e/search.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Global Search', () => {
  test('opens command palette and navigates to result', async ({ page }) => {
    await page.goto('/')

    // Open with keyboard shortcut
    await page.keyboard.press('Meta+k')
    await expect(page.getByRole('dialog')).toBeVisible()

    // Type search query
    await page.getByPlaceholderText(/search/i).fill('John')

    // Verify grouped results
    await expect(page.getByText(/contacts/i)).toBeVisible()

    // Click result to navigate
    await page.getByText('John Doe').click()
    await expect(page).toHaveURL(/\/contacts\//)
  })
})
```

#### Responsive / Mobile
```typescript
// e2e/responsive.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Responsive Design', () => {
  test('mobile: sidebar hidden, hamburger menu works', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 })
    await page.goto('/')

    // Sidebar should be hidden
    await expect(page.getByTestId('sidebar')).not.toBeVisible()

    // Hamburger menu should be visible
    await page.getByRole('button', { name: /menu/i }).click()
    await expect(page.getByTestId('sidebar')).toBeVisible()

    // Navigate and sidebar closes
    await page.getByRole('link', { name: /contacts/i }).click()
    await expect(page).toHaveURL('/contacts')
    await expect(page.getByTestId('sidebar')).not.toBeVisible()
  })
})
```

### Full E2E Test Coverage Map

| Suite | File | Critical User Journeys |
|-------|------|----------------------|
| Auth | `auth.spec.ts` | Login, signup, logout, invalid credentials, redirect |
| Contacts | `contacts.spec.ts` | Create, view, edit, delete, search, filter, CSV import |
| Companies | `companies.spec.ts` | Create, view, edit, delete, linked contacts |
| Deals | `deals.spec.ts` | Create, move stages, close (won/lost), Kanban/list toggle |
| Activities | `activities.spec.ts` | Create activity, complete task, filter by type |
| Dashboard | `dashboard.spec.ts` | KPIs visible, charts render, recent activity |
| Search | `search.spec.ts` | Cmd+K, search, navigate to result |
| Settings | `settings.spec.ts` | Edit profile, reorder pipeline stages |
| Responsive | `responsive.spec.ts` | Mobile sidebar, tablet collapsed, desktop full |

---

## 7. Test Organization

### Directory Structure

```
simple-crm-3/
├── __tests__/                          # Unit & Integration tests
│   ├── setup.ts                        # Vitest global setup (MSW, jest-dom)
│   ├── mocks/
│   │   ├── handlers.ts                 # MSW request handlers
│   │   ├── server.ts                   # MSW server setup
│   │   └── data.ts                     # Shared test data factories
│   ├── utils/
│   │   └── test-wrapper.tsx            # Provider wrappers for tests
│   ├── lib/
│   │   ├── validations/
│   │   │   ├── contact.test.ts
│   │   │   ├── company.test.ts
│   │   │   ├── deal.test.ts
│   │   │   └── activity.test.ts
│   │   ├── utils/
│   │   │   ├── format.test.ts
│   │   │   ├── pipeline.test.ts
│   │   │   ├── csv.test.ts
│   │   │   └── search.test.ts
│   │   └── hooks/
│   │       ├── use-debounce.test.ts
│   │       └── use-pagination.test.ts
│   └── components/
│       ├── contacts/
│       │   ├── contacts-list.test.tsx
│       │   ├── contact-detail.test.tsx
│       │   └── contact-form.test.tsx
│       ├── companies/
│       │   ├── companies-list.test.tsx
│       │   └── company-form.test.tsx
│       ├── deals/
│       │   ├── pipeline-board.test.tsx
│       │   ├── deal-card.test.tsx
│       │   ├── deal-form.test.tsx
│       │   └── deal-slide-over.test.tsx
│       ├── activities/
│       │   ├── activities-list.test.tsx
│       │   └── activity-form.test.tsx
│       ├── dashboard/
│       │   └── dashboard.test.tsx
│       └── layout/
│           ├── sidebar.test.tsx
│           ├── command-palette.test.tsx
│           └── data-table.test.tsx
├── e2e/                                # End-to-End tests (Playwright)
│   ├── .auth/
│   │   └── user.json                   # Saved auth state (gitignored)
│   ├── auth.setup.ts                   # Auth fixture
│   ├── auth.teardown.ts                # Cleanup fixture
│   ├── auth.spec.ts
│   ├── contacts.spec.ts
│   ├── companies.spec.ts
│   ├── deals.spec.ts
│   ├── activities.spec.ts
│   ├── dashboard.spec.ts
│   ├── search.spec.ts
│   ├── settings.spec.ts
│   └── responsive.spec.ts
├── vitest.config.ts                    # Vitest configuration
└── playwright.config.ts                # Playwright configuration
```

### Vitest Configuration

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./__tests__/setup.ts'],
    include: ['__tests__/**/*.test.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'text-summary', 'lcov', 'html'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/app/**/layout.tsx',
        'src/app/**/loading.tsx',
        'src/app/**/error.tsx',
        'src/components/ui/**',     // shadcn/ui components (third-party)
        'src/lib/types/**',         // Generated types
      ],
      thresholds: {
        statements: 80,
        branches: 75,
        functions: 80,
        lines: 80,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
```

### Test Data Factories

```typescript
// __tests__/mocks/data.ts
import { faker } from '@faker-js/faker'

export function createContact(overrides = {}) {
  return {
    id: faker.string.uuid(),
    first_name: faker.person.firstName(),
    last_name: faker.person.lastName(),
    email: faker.internet.email(),
    phone: faker.phone.number(),
    company_id: null,
    position: faker.person.jobTitle(),
    status: 'active',
    created_at: faker.date.past().toISOString(),
    updated_at: faker.date.recent().toISOString(),
    ...overrides,
  }
}

export function createCompany(overrides = {}) {
  return {
    id: faker.string.uuid(),
    name: faker.company.name(),
    domain: faker.internet.domainName(),
    industry: faker.company.buzzNoun(),
    size: faker.helpers.arrayElement(['1-10', '11-50', '51-200', '201-500', '500+']),
    website: faker.internet.url(),
    created_at: faker.date.past().toISOString(),
    ...overrides,
  }
}

export function createDeal(overrides = {}) {
  return {
    id: faker.string.uuid(),
    title: `${faker.company.name()} Deal`,
    value: faker.number.float({ min: 1000, max: 100000, fractionDigits: 2 }),
    probability: faker.number.int({ min: 0, max: 100 }),
    expected_close_date: faker.date.future().toISOString().split('T')[0],
    created_at: faker.date.past().toISOString(),
    ...overrides,
  }
}

export function createActivity(overrides = {}) {
  return {
    id: faker.string.uuid(),
    type: faker.helpers.arrayElement(['call', 'email', 'meeting', 'task', 'note']),
    title: faker.lorem.sentence({ min: 3, max: 6 }),
    description: faker.lorem.paragraph(),
    is_completed: faker.datatype.boolean(),
    due_date: faker.date.soon().toISOString(),
    created_at: faker.date.past().toISOString(),
    ...overrides,
  }
}
```

---

## 8. Mocking Strategy

### What to Mock

| Dependency | Mock Method | Reason |
|------------|-------------|--------|
| Supabase REST API | MSW (`http.get/post/patch/delete`) | Intercept at network level — most realistic |
| Supabase Auth | MSW + mock session context | Test auth-dependent UI without real auth |
| Supabase Realtime | Not mocked in unit/integration | Tested only in E2E |
| Next.js Router | `next/navigation` mock via vitest | Test navigation behavior |
| Date/Time | `vi.useFakeTimers()` | Test debounce, relative dates, due date logic |
| Drag & Drop | `@dnd-kit` test utilities | Test Kanban reorder |

### What NOT to Mock

| Thing | Why Not |
|-------|---------|
| Zod schemas | They're pure — test with real validation |
| Utility functions | They're pure — test with real logic |
| React components | Render the real tree — test behavior, not implementation |
| TanStack Query | Use real QueryClient in tests — just with short cache times |

---

## 9. Coverage Targets

### Overall Targets

| Metric | Target | Notes |
|--------|--------|-------|
| Statements | 80% | Across all source files |
| Branches | 75% | Conditional paths |
| Functions | 80% | Named functions and methods |
| Lines | 80% | Executable lines |

### Per-Module Targets

| Module | Coverage Target | Rationale |
|--------|----------------|-----------|
| `lib/validations/` | 95%+ | Critical — guards all data entry |
| `lib/utils/` | 90%+ | Pure functions — easy to test, high value |
| `lib/hooks/` | 85%+ | Custom hooks power data flow |
| `components/contacts/` | 80%+ | Primary feature — high interaction |
| `components/deals/` | 80%+ | Complex UI (Kanban, drag-drop) |
| `components/dashboard/` | 70%+ | Charts are hard to test deeply |
| `components/layout/` | 75%+ | Navigation, sidebar behavior |
| `components/ui/` | Excluded | Third-party (shadcn) — not our code to test |

### Excluded from Coverage

- `src/components/ui/` — shadcn/ui primitives (tested by the library)
- `src/lib/types/` — Auto-generated TypeScript types
- Layout/loading/error files — Minimal logic, framework boilerplate

---

## 10. CI/CD Integration

### GitHub Actions Workflow

```yaml
# .github/workflows/test.yml
name: Test Suite

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  unit-and-integration:
    name: Unit & Integration Tests
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'
      - run: npm ci
      - run: npx vitest run --coverage
      - uses: actions/upload-artifact@v4
        if: always()
        with:
          name: coverage-report
          path: coverage/

  e2e:
    name: E2E Tests
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'
      - run: npm ci
      - run: npx playwright install --with-deps chromium

      # Start Supabase local
      - uses: supabase/setup-cli@v1
      - run: supabase start
      - run: supabase db reset

      # Run E2E tests
      - run: npx playwright test --project=chromium
      - uses: actions/upload-artifact@v4
        if: always()
        with:
          name: playwright-report
          path: playwright-report/

  type-check:
    name: Type Check
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'
      - run: npm ci
      - run: npx tsc --noEmit

  lint:
    name: Lint
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'
      - run: npm ci
      - run: npx next lint
```

### NPM Scripts

```json
{
  "scripts": {
    "test": "vitest",
    "test:run": "vitest run",
    "test:coverage": "vitest run --coverage",
    "test:ui": "vitest --ui",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:e2e:chromium": "playwright test --project=chromium",
    "test:all": "vitest run --coverage && playwright test --project=chromium"
  }
}
```

---

## Summary

| Layer | Tool | Count (Est.) | Runs In |
|-------|------|-------------|---------|
| Static | TypeScript + ESLint | Always on | CI + IDE |
| Unit | Vitest | ~50-70 tests | <10s |
| Integration | Vitest + RTL + MSW | ~80-120 tests | <30s |
| E2E | Playwright | ~30-40 tests | <5min |
| **Total** | | **~160-230 tests** | **<6min** |
