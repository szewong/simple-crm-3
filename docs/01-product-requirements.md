# Product Requirements Document — Simple CRM

> **Version:** 1.0
> **Last Updated:** 2026-02-12
> **Status:** Draft

---

## Table of Contents

1. [Product Vision](#1-product-vision)
2. [Target Users & Personas](#2-target-users--personas)
3. [Core Features](#3-core-features)
   - 3.1 [Contacts Management](#31-contacts-management)
   - 3.2 [Companies / Organizations](#32-companies--organizations)
   - 3.3 [Deals / Pipeline](#33-deals--pipeline)
   - 3.4 [Activities & Tasks](#34-activities--tasks)
   - 3.5 [Dashboard & Analytics](#35-dashboard--analytics)
   - 3.6 [Authentication & Settings](#36-authentication--settings)
4. [Non-Functional Requirements](#4-non-functional-requirements)
5. [Out of Scope (v1)](#5-out-of-scope-v1)
6. [Glossary](#6-glossary)

---

## 1. Product Vision

Simple CRM is a modern, lightweight customer relationship management tool built for small-to-medium businesses and sales teams. It replaces bloated enterprise CRM software with a fast, intuitive, and beautiful experience that lets users focus on building relationships and closing deals — not fighting their tools.

### Core Principles

| Principle | Description |
|-----------|-------------|
| **Speed** | Every interaction feels instant. No spinners, no waiting. |
| **Simplicity** | A clean interface anyone can use without training. |
| **Beauty** | A polished, modern design that people enjoy using. |
| **Focus** | Only the features that matter — no bloat. |

### Success Metrics

- Users can create a contact in under 10 seconds
- Users can view their full pipeline in a single screen
- 90%+ of users complete onboarding without support
- Page load times consistently under 1 second

---

## 2. Target Users & Personas

### Persona 1: Small Business Owner — "Sarah"

- **Role:** Owner of a 10-person marketing agency
- **Goal:** Keep track of clients and prospects without a complex system
- **Pain Points:** Current spreadsheets are disorganized; enterprise CRMs are too expensive and complicated
- **Usage Pattern:** Checks CRM 2-3 times per day, primarily on desktop

### Persona 2: Sales Team Member — "Marcus"

- **Role:** Account executive at a B2B SaaS startup (team of 8 salespeople)
- **Goal:** Manage his pipeline, log activities, and close deals efficiently
- **Pain Points:** Existing CRM requires too many clicks; spends more time on data entry than selling
- **Usage Pattern:** Lives in the CRM all day, needs quick data entry and pipeline visibility

### Persona 3: Freelance Consultant — "Aisha"

- **Role:** Independent UX design consultant
- **Goal:** Track client relationships, project leads, and follow-ups
- **Pain Points:** No CRM fits her solo workflow; most are designed for teams
- **Usage Pattern:** Checks in weekly, needs a clear view of who to follow up with

---

## 3. Core Features

### 3.1 Contacts Management

Contacts are the foundational entity in Simple CRM. Every interaction, deal, and activity ultimately ties back to a person.

#### 3.1.1 Contact Data Model

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| First Name | text | yes | |
| Last Name | text | yes | |
| Email | email | no | Supports multiple emails |
| Phone | phone | no | Supports multiple phone numbers |
| Company | relation | no | Links to Companies entity |
| Position / Title | text | no | |
| Address | structured | no | Street, city, state, zip, country |
| Social Links | url[] | no | LinkedIn, Twitter/X, etc. |
| Tags | tag[] | no | User-defined tags |
| Custom Fields | key-value[] | no | Flexible extension mechanism |
| Avatar | image | no | Auto-generated from initials if not provided |
| Notes | rich text | no | Free-form notes |
| Owner | relation | no | Assigned user |
| Created At | timestamp | auto | |
| Updated At | timestamp | auto | |

#### 3.1.2 User Stories

**US-C1: Create a Contact**
> As a **sales team member**, I want to **quickly create a new contact with basic info** so that **I can start tracking our relationship immediately**.

Acceptance Criteria:
- [ ] User can create a contact with first name and last name (minimum required fields)
- [ ] Optional fields can be filled in at creation or added later
- [ ] Contact is immediately searchable after creation
- [ ] Duplicate detection warns if a contact with the same email already exists
- [ ] Creation can be done via a modal (quick-add) or a full-page form

**US-C2: View and Edit a Contact**
> As a **user**, I want to **view a contact's full profile and edit their details** so that **I always have up-to-date information**.

Acceptance Criteria:
- [ ] Contact detail page shows all fields, associated company, deals, and activity timeline
- [ ] All fields are inline-editable
- [ ] Changes save automatically (optimistic updates)
- [ ] Edit history is preserved

**US-C3: Search, Filter, and Sort Contacts**
> As a **user**, I want to **search, filter, and sort my contact list** so that **I can quickly find the people I need**.

Acceptance Criteria:
- [ ] Global search bar searches across name, email, company, phone, and tags
- [ ] Filters available: by tag, by company, by owner, by creation date range
- [ ] Sort by: name (A-Z, Z-A), company, created date, last activity date
- [ ] Pagination with configurable page size (25, 50, 100)
- [ ] List view loads in under 1 second for up to 10,000 contacts

**US-C4: Contact List View**
> As a **user**, I want to **see my contacts in a clean table view** so that **I can scan and manage them efficiently**.

Acceptance Criteria:
- [ ] Table columns: name, email, company, phone, tags, last activity, owner
- [ ] Columns are resizable and togglable
- [ ] Bulk actions: delete, add tag, assign owner, export selected
- [ ] Row click navigates to contact detail page
- [ ] Empty state with clear call to action for new users

**US-C5: Import Contacts from CSV**
> As a **small business owner**, I want to **import my existing contacts from a CSV file** so that **I don't have to re-enter everything manually**.

Acceptance Criteria:
- [ ] User can upload a CSV file
- [ ] Column mapping UI lets user map CSV columns to CRM fields
- [ ] Preview of first 5 rows before confirming import
- [ ] Duplicate handling options: skip, overwrite, or create new
- [ ] Import progress indicator for large files
- [ ] Summary report after import (created, updated, skipped, errors)

**US-C6: Export Contacts to CSV**
> As a **user**, I want to **export my contacts to a CSV file** so that **I can use the data in other tools or create backups**.

Acceptance Criteria:
- [ ] Export all contacts or filtered/selected subset
- [ ] All standard fields included in export
- [ ] CSV downloads immediately for up to 10,000 contacts

**US-C7: Tag and Segment Contacts**
> As a **sales team member**, I want to **tag contacts and create segments** so that **I can organize contacts into meaningful groups**.

Acceptance Criteria:
- [ ] Users can create, rename, and delete tags
- [ ] Tags can be added/removed from contacts individually or in bulk
- [ ] Tags are color-coded
- [ ] Filter contact list by one or more tags
- [ ] Tag management UI in settings

---

### 3.2 Companies / Organizations

Companies group contacts together and provide an organizational view of customer relationships.

#### 3.2.1 Company Data Model

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| Name | text | yes | |
| Domain | url | no | Company website |
| Industry | select | no | Predefined + custom industries |
| Company Size | select | no | 1-10, 11-50, 51-200, 201-500, 500+ |
| Address | structured | no | Street, city, state, zip, country |
| Phone | phone | no | |
| Description | rich text | no | |
| Logo | image | no | Auto-fetched from domain if possible |
| Tags | tag[] | no | |
| Owner | relation | no | Assigned user |
| Created At | timestamp | auto | |
| Updated At | timestamp | auto | |

#### 3.2.2 User Stories

**US-O1: Create a Company**
> As a **user**, I want to **create a company record** so that **I can organize contacts by their organization**.

Acceptance Criteria:
- [ ] Company can be created with just a name
- [ ] Optional: auto-populate logo and details from domain if provided
- [ ] Duplicate detection warns if company with same name or domain exists

**US-O2: View Company Details**
> As a **user**, I want to **view a company's full profile** so that **I can see all related contacts, deals, and activities in one place**.

Acceptance Criteria:
- [ ] Company detail page shows all company fields
- [ ] "Contacts" tab lists all contacts linked to this company
- [ ] "Deals" tab lists all deals associated with this company
- [ ] "Activities" tab shows a timeline of all activities across contacts and deals for this company
- [ ] All fields are inline-editable

**US-O3: Link Contacts to Companies**
> As a **user**, I want to **link contacts to their company** so that **I can see organizational relationships**.

Acceptance Criteria:
- [ ] Contact form includes a company selector (search-as-you-type)
- [ ] A contact belongs to at most one company (many-to-one)
- [ ] Company can be set/changed from contact detail page
- [ ] Company detail page lists all linked contacts

**US-O4: Search, Filter, and Sort Companies**
> As a **user**, I want to **search and filter my company list** so that **I can find organizations quickly**.

Acceptance Criteria:
- [ ] Search by company name, domain, or industry
- [ ] Filter by industry, size, tags, owner
- [ ] Sort by name, contact count, deal value, created date
- [ ] Pagination consistent with contacts list

---

### 3.3 Deals / Pipeline

Deals represent sales opportunities and move through customizable pipeline stages.

#### 3.3.1 Deal Data Model

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| Title | text | yes | |
| Value | currency | no | Deal monetary value |
| Currency | select | no | Default: USD |
| Stage | select | yes | From pipeline configuration |
| Probability | percentage | no | Auto-set by stage, manually adjustable |
| Expected Close Date | date | no | |
| Contact | relation | no | Primary contact for this deal |
| Company | relation | no | Associated company |
| Owner | relation | no | Assigned user |
| Priority | select | no | Low, Medium, High |
| Tags | tag[] | no | |
| Notes | rich text | no | |
| Won/Lost Reason | text | no | Populated when deal is closed |
| Closed At | timestamp | no | Set when deal moves to Won or Lost |
| Created At | timestamp | auto | |
| Updated At | timestamp | auto | |

#### 3.3.2 Default Pipeline Stages

| Stage | Order | Probability | Color |
|-------|-------|-------------|-------|
| Lead | 1 | 10% | Blue |
| Qualified | 2 | 25% | Cyan |
| Proposal | 3 | 50% | Yellow |
| Negotiation | 4 | 75% | Orange |
| Won | 5 (closed) | 100% | Green |
| Lost | 6 (closed) | 0% | Red |

#### 3.3.3 User Stories

**US-D1: Create a Deal**
> As a **sales team member**, I want to **create a new deal** so that **I can track a sales opportunity through my pipeline**.

Acceptance Criteria:
- [ ] Deal requires a title and stage (minimum)
- [ ] Can associate a contact and/or company
- [ ] Default probability auto-fills based on selected stage
- [ ] Deal appears immediately in both Kanban and list views

**US-D2: Kanban Board View**
> As a **sales team member**, I want to **view my deals on a Kanban board** so that **I can visually manage my pipeline at a glance**.

Acceptance Criteria:
- [ ] Columns represent pipeline stages (excluding closed stages by default, toggleable)
- [ ] Deal cards show: title, value, contact name, expected close date, owner avatar
- [ ] Drag-and-drop to move deals between stages
- [ ] Stage headers show deal count and total value
- [ ] Smooth animations on drag-and-drop
- [ ] Filter deals by owner, value range, close date range, tags

**US-D3: Deal List View**
> As a **user**, I want to **view deals in a table/list format** so that **I can sort and analyze deals efficiently**.

Acceptance Criteria:
- [ ] Table columns: title, value, stage, probability, contact, company, expected close, owner
- [ ] All standard sort/filter/search capabilities
- [ ] Toggle between Kanban and list views
- [ ] Bulk actions: change stage, assign owner, delete

**US-D4: Deal Detail Page**
> As a **user**, I want to **view the full details of a deal** so that **I can understand the opportunity and its history**.

Acceptance Criteria:
- [ ] All deal fields displayed and inline-editable
- [ ] Activity timeline showing all related activities
- [ ] Stage progression indicator (visual progress bar)
- [ ] Quick actions: log activity, change stage, mark won/lost
- [ ] Related contact and company cards with quick links

**US-D5: Close a Deal (Won/Lost)**
> As a **sales team member**, I want to **mark a deal as won or lost** so that **I can track outcomes and learn from results**.

Acceptance Criteria:
- [ ] "Mark as Won" and "Mark as Lost" actions available from deal detail and Kanban card
- [ ] Closing prompts for a reason (required for lost, optional for won)
- [ ] Closed date is automatically set
- [ ] Closed deals move out of active Kanban view
- [ ] Won/lost metrics update in dashboard

**US-D6: Customize Pipeline Stages**
> As a **small business owner**, I want to **customize my pipeline stages** so that **the CRM matches my actual sales process**.

Acceptance Criteria:
- [ ] Add, rename, reorder, and delete stages in settings
- [ ] Each stage has a name, default probability, and color
- [ ] Cannot delete a stage that has active deals (must reassign first)
- [ ] Won and Lost are system stages that cannot be deleted

---

### 3.4 Activities & Tasks

Activities track every interaction and to-do related to contacts, companies, and deals.

#### 3.4.1 Activity Data Model

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| Type | select | yes | Call, Email, Meeting, Task, Note |
| Subject | text | yes | Brief description |
| Description | rich text | no | Detailed notes |
| Due Date | datetime | no | Required for Tasks; optional for others |
| Completed | boolean | no | Default: false for Tasks; true for logged activities |
| Completed At | timestamp | no | Auto-set on completion |
| Contact | relation | no | Associated contact |
| Company | relation | no | Associated company |
| Deal | relation | no | Associated deal |
| Owner | relation | yes | Assigned user |
| Priority | select | no | Low, Medium, High (for Tasks) |
| Duration | integer | no | Minutes (for Calls and Meetings) |
| Created At | timestamp | auto | |
| Updated At | timestamp | auto | |

#### 3.4.2 Activity Types

| Type | Icon | Default Behavior | Notes |
|------|------|-------------------|-------|
| **Call** | Phone | Logged as completed | Record calls made |
| **Email** | Mail | Logged as completed | Record emails sent |
| **Meeting** | Calendar | Logged as completed | Record meetings held |
| **Task** | Checkbox | Created as incomplete | Action items with due dates |
| **Note** | Pencil | Logged as completed | Free-form notes |

#### 3.4.3 User Stories

**US-A1: Log an Activity**
> As a **sales team member**, I want to **quickly log a call, email, or meeting** so that **I have a record of all customer interactions**.

Acceptance Criteria:
- [ ] Quick-log modal accessible from contact, company, or deal detail pages
- [ ] Activity type, subject required; description optional
- [ ] Auto-links to the entity the user is viewing
- [ ] Activity appears immediately in the relevant timeline(s)

**US-A2: Create a Task**
> As a **user**, I want to **create a task with a due date** so that **I don't forget important follow-ups**.

Acceptance Criteria:
- [ ] Task requires subject and owner; due date strongly recommended
- [ ] Can be linked to contact, company, and/or deal
- [ ] Priority can be set (Low, Medium, High)
- [ ] Task appears in the user's task list and on relevant entity timelines

**US-A3: View Activity Timeline**
> As a **user**, I want to **see a chronological timeline of all activities** on a contact, company, or deal so that **I have full context for every relationship**.

Acceptance Criteria:
- [ ] Timeline shows all activity types in reverse chronological order
- [ ] Each entry shows: type icon, subject, description preview, date, owner
- [ ] Filter timeline by activity type
- [ ] Infinite scroll or paginated loading for long timelines
- [ ] Activities display on the entity they are linked to (contact, company, deal)

**US-A4: Manage My Tasks**
> As a **user**, I want to **see all my open tasks in one place** so that **I know what I need to do today**.

Acceptance Criteria:
- [ ] "My Tasks" view lists all tasks assigned to the current user
- [ ] Grouped or filterable by: overdue, due today, due this week, upcoming
- [ ] One-click to mark a task as complete
- [ ] Completed tasks can be shown/hidden
- [ ] Sort by due date, priority, or associated entity

**US-A5: Activity Reminders**
> As a **user**, I want to **receive reminders for upcoming tasks and scheduled activities** so that **I never miss a follow-up**.

Acceptance Criteria:
- [ ] In-app notification for tasks due today
- [ ] Visual indicator (badge) on navigation for overdue tasks
- [ ] Overdue tasks highlighted in red in task lists

---

### 3.5 Dashboard & Analytics

The dashboard provides an at-a-glance overview of CRM health and personal performance.

#### 3.5.1 User Stories

**US-DA1: View Dashboard KPIs**
> As a **user**, I want to **see key metrics on my dashboard** so that **I understand business health at a glance**.

Acceptance Criteria:
- [ ] KPI cards displayed at the top of the dashboard:
  - Total Contacts
  - Active Deals (count)
  - Total Pipeline Value (sum of active deal values)
  - Conversion Rate (won / total closed deals)
  - Activities This Week (count)
- [ ] Each KPI card shows current value and trend indicator (vs. previous period)
- [ ] Cards are clickable — navigating to the relevant list view

**US-DA2: Pipeline Funnel Chart**
> As a **sales team member**, I want to **see a pipeline funnel visualization** so that **I can identify bottlenecks in my sales process**.

Acceptance Criteria:
- [ ] Funnel chart shows deal count and total value per stage
- [ ] Color-coded by stage
- [ ] Hover to see detailed numbers
- [ ] Click a stage to filter to those deals

**US-DA3: Revenue Forecast**
> As a **small business owner**, I want to **see a revenue forecast** so that **I can plan for upcoming months**.

Acceptance Criteria:
- [ ] Bar or line chart showing expected revenue by month
- [ ] Based on deal values weighted by probability
- [ ] Configurable time range (3, 6, 12 months)
- [ ] Shows actual closed-won revenue for past months overlaid

**US-DA4: Recent Activity Feed**
> As a **user**, I want to **see a feed of recent activities across all entities** so that **I stay informed about what's happening**.

Acceptance Criteria:
- [ ] Feed shows the most recent 20 activities (with "load more")
- [ ] Each entry shows: activity type, subject, related entity link, user, timestamp
- [ ] Real-time updates — new activities appear without page refresh

**US-DA5: Deals by Stage Chart**
> As a **user**, I want to **see a chart showing the distribution of deals across stages** so that **I understand pipeline composition**.

Acceptance Criteria:
- [ ] Horizontal bar chart or pie chart showing deal count per stage
- [ ] Value and count toggle
- [ ] Color-coded by stage
- [ ] Interactive — click to drill into deals in that stage

---

### 3.6 Authentication & Settings

#### 3.6.1 User Stories

**US-AU1: Sign Up with Email and Password**
> As a **new user**, I want to **create an account with my email and password** so that **I can start using Simple CRM**.

Acceptance Criteria:
- [ ] Registration form: email, password, confirm password, full name
- [ ] Password requirements: minimum 8 characters, at least one uppercase, one lowercase, one number
- [ ] Email verification required before full access
- [ ] Duplicate email check with clear error message

**US-AU2: Log In**
> As a **returning user**, I want to **log in with my credentials** so that **I can access my CRM data**.

Acceptance Criteria:
- [ ] Login form: email and password
- [ ] "Remember me" option
- [ ] "Forgot password" link with email-based reset flow
- [ ] Clear error messages for invalid credentials
- [ ] Redirect to dashboard after successful login

**US-AU3: OAuth Login (Google, GitHub)**
> As a **user**, I want to **sign in with Google or GitHub** so that **I don't have to create a separate password**.

Acceptance Criteria:
- [ ] "Sign in with Google" and "Sign in with GitHub" buttons on login/signup pages
- [ ] OAuth flow creates account if it doesn't exist
- [ ] Links to existing account if email matches
- [ ] Profile picture imported from OAuth provider

**US-AU4: Manage User Profile**
> As a **user**, I want to **update my profile information** so that **my teammates see accurate details**.

Acceptance Criteria:
- [ ] Edit: full name, avatar, email (with re-verification), password
- [ ] Profile photo upload or use OAuth provider photo
- [ ] Changes saved with confirmation message

**US-AU5: Application Settings**
> As an **admin/owner**, I want to **configure application settings** so that **Simple CRM works for my team**.

Acceptance Criteria:
- [ ] Settings sections:
  - **Pipeline:** Customize stages (see US-D6)
  - **Tags:** Manage tags and colors
  - **Custom Fields:** Define custom fields for contacts, companies, deals
  - **Team:** Invite users, manage roles (admin, member)
  - **Profile:** Personal settings (see US-AU4)
- [ ] Changes apply immediately
- [ ] Only admins can access team and pipeline settings

---

## 4. Non-Functional Requirements

### 4.1 Performance

| Metric | Target |
|--------|--------|
| Initial page load (cold) | < 2 seconds |
| Subsequent navigation (SPA) | < 500ms |
| List view render (1,000 records) | < 1 second |
| List view render (10,000 records) | < 2 seconds (virtualized) |
| Search results | < 500ms |
| Form save (optimistic) | < 100ms perceived |
| Kanban drag-and-drop | < 100ms visual feedback |

### 4.2 Security

- **Authentication:** JWT-based sessions via Supabase Auth
- **Authorization:** Row-Level Security (RLS) policies in Supabase — users can only access their own organization's data
- **Data Encryption:** TLS in transit; AES-256 at rest (Supabase default)
- **OWASP Compliance:** Protection against SQL injection, XSS, CSRF, and other OWASP Top 10 vulnerabilities
- **Input Validation:** Server-side validation for all user inputs
- **Rate Limiting:** API rate limiting to prevent abuse

### 4.3 Responsiveness

| Breakpoint | Min Width | Layout |
|------------|-----------|--------|
| Mobile | 0px | Single column, bottom nav, stacked cards |
| Tablet | 768px | Sidebar collapsible, two-column layouts |
| Desktop | 1024px | Full sidebar, multi-column layouts, Kanban board |
| Wide | 1440px | Optimized spacing, wider content areas |

### 4.4 Accessibility (WCAG 2.1 AA)

- All interactive elements keyboard-navigable
- Screen reader compatible (proper ARIA labels, roles, landmarks)
- Minimum contrast ratio of 4.5:1 for normal text
- Focus indicators visible on all interactive elements
- Form inputs have associated labels
- Error messages are programmatically associated with inputs
- No information conveyed by color alone
- Supports reduced motion preferences

### 4.5 Real-Time Updates

- Leverage Supabase Realtime for live data synchronization
- Changes made by one user reflect immediately for other users viewing the same data
- Real-time updates for:
  - Deal stage changes on Kanban board
  - New activities on timeline views
  - Task completion status
  - Dashboard KPI updates
- Graceful fallback if WebSocket connection drops (auto-reconnect + refresh)

### 4.6 Browser Support

| Browser | Minimum Version |
|---------|-----------------|
| Chrome | Last 2 versions |
| Firefox | Last 2 versions |
| Safari | Last 2 versions |
| Edge | Last 2 versions |

---

## 5. Out of Scope (v1)

The following features are explicitly **not** included in version 1 but may be considered for future releases:

- Email integration (sending/receiving emails from within CRM)
- Calendar integration (Google Calendar, Outlook)
- Workflow automation / triggers
- Custom reports builder
- API access for third-party integrations
- Mobile native apps (iOS, Android) — responsive web only for v1
- Multi-language / i18n support
- Multi-currency with live exchange rates
- File attachments on entities
- Team permissions beyond admin/member roles
- Audit log

---

## 6. Glossary

| Term | Definition |
|------|-----------|
| **Contact** | An individual person tracked in the CRM |
| **Company** | An organization that contacts may belong to |
| **Deal** | A sales opportunity with a monetary value moving through pipeline stages |
| **Pipeline** | The series of stages a deal passes through from lead to close |
| **Stage** | A step in the pipeline (e.g., Lead, Qualified, Won) |
| **Activity** | Any interaction or action related to a contact, company, or deal |
| **Task** | A type of activity that represents an action item with a due date |
| **Tag** | A user-defined label for organizing entities |
| **Owner** | The user assigned responsibility for a contact, company, deal, or task |
| **KPI** | Key Performance Indicator — a measurable metric on the dashboard |
| **RLS** | Row-Level Security — database policy restricting data access by user |
