# Visual Design System & Style Guide

> Simple CRM — A modern, beautiful CRM inspired by Linear, Vercel, Raycast, Notion, and Attio.

---

## Table of Contents

1. [Design Principles](#1-design-principles)
2. [Color System](#2-color-system)
3. [Typography](#3-typography)
4. [Spacing & Layout](#4-spacing--layout)
5. [Component Design Specs](#5-component-design-specs)
6. [Animation Guidelines](#6-animation-guidelines)
7. [Iconography](#7-iconography)
8. [Tailwind Configuration](#8-tailwind-configuration)
9. [shadcn/ui Customization](#9-shadcnui-customization)
10. [CSS Variables & Theme](#10-css-variables--theme)

---

## 1. Design Principles

| Principle | Description |
|-----------|-------------|
| **Spacious & Breathable** | Generous whitespace between elements. Never cramped. Let content breathe. |
| **Subtle Depth** | Light shadows and borders create hierarchy without heaviness. No flat design, no heavy 3D. |
| **Consistent & Predictable** | Every interaction follows the same patterns. Users build muscle memory. |
| **Dark Mode First** | Dark mode is not an afterthought. Both themes are designed with equal care. |
| **Micro-Animations** | Smooth, purposeful animations that provide feedback without slowing users down. |
| **Professional Warmth** | Polished enough for enterprise, warm enough to feel approachable. |

---

## 2. Color System

### 2.1 Light Mode Palette

#### Backgrounds

| Token | Hex | Tailwind Class | Usage |
|-------|-----|----------------|-------|
| `--background` | `#FFFFFF` | `bg-white` | Page background |
| `--background-subtle` | `#F9FAFB` | `bg-gray-50` | Alternating sections, table headers |
| `--background-muted` | `#F1F5F9` | `bg-slate-100` | Disabled areas, skeleton loaders |

#### Surfaces (Cards, Panels, Popovers)

| Token | Hex | Tailwind Class | Usage |
|-------|-----|----------------|-------|
| `--surface` | `#FFFFFF` | `bg-white` | Cards, modals, dropdowns |
| `--surface-border` | `#E5E7EB` | `border-gray-200` | Default card/panel borders |
| `--surface-shadow` | `0 1px 2px rgba(0,0,0,0.05)` | `shadow-sm` | Default card shadow |
| `--surface-shadow-hover` | `0 4px 6px -1px rgba(0,0,0,0.1)` | `shadow-md` | Hovered card shadow |

#### Primary (Brand — Indigo)

| Token | Hex | Tailwind Class | Usage |
|-------|-----|----------------|-------|
| `--primary` | `#4F46E5` | `bg-indigo-600` | Primary buttons, links, active states |
| `--primary-hover` | `#4338CA` | `bg-indigo-700` | Primary button hover |
| `--primary-active` | `#3730A3` | `bg-indigo-800` | Primary button active/pressed |
| `--primary-light` | `#EEF2FF` | `bg-indigo-50` | Selected row bg, highlights |
| `--primary-foreground` | `#FFFFFF` | `text-white` | Text on primary backgrounds |
| `--primary-ring` | `rgba(79,70,229,0.2)` | `ring-indigo-500/20` | Focus ring color |

#### Secondary (Slate)

| Token | Hex | Tailwind Class | Usage |
|-------|-----|----------------|-------|
| `--secondary` | `#F1F5F9` | `bg-slate-100` | Secondary button bg |
| `--secondary-hover` | `#E2E8F0` | `bg-slate-200` | Secondary button hover |
| `--secondary-foreground` | `#475569` | `text-slate-600` | Secondary button text |

#### Accent (Violet)

| Token | Hex | Tailwind Class | Usage |
|-------|-----|----------------|-------|
| `--accent` | `#7C3AED` | `bg-violet-600` | Special highlights, premium features |
| `--accent-hover` | `#6D28D9` | `bg-violet-700` | Accent hover state |
| `--accent-light` | `#F5F3FF` | `bg-violet-50` | Accent backgrounds |
| `--accent-foreground` | `#FFFFFF` | `text-white` | Text on accent backgrounds |

#### Semantic Colors

| Token | Hex | Tailwind Class | Usage |
|-------|-----|----------------|-------|
| `--success` | `#10B981` | `text-emerald-500` | Success messages, positive indicators |
| `--success-bg` | `#ECFDF5` | `bg-emerald-50` | Success background |
| `--success-border` | `#A7F3D0` | `border-emerald-200` | Success borders |
| `--success-text` | `#065F46` | `text-emerald-800` | Success text on light bg |
| `--warning` | `#F59E0B` | `text-amber-500` | Warning messages, caution indicators |
| `--warning-bg` | `#FFFBEB` | `bg-amber-50` | Warning background |
| `--warning-border` | `#FDE68A` | `border-amber-200` | Warning borders |
| `--warning-text` | `#92400E` | `text-amber-800` | Warning text on light bg |
| `--error` | `#F43F5E` | `text-rose-500` | Error messages, destructive actions |
| `--error-bg` | `#FFF1F2` | `bg-rose-50` | Error background |
| `--error-border` | `#FECDD3` | `border-rose-200` | Error borders |
| `--error-text` | `#9F1239` | `text-rose-800` | Error text on light bg |
| `--info` | `#0EA5E9` | `text-sky-500` | Info messages, neutral notices |
| `--info-bg` | `#F0F9FF` | `bg-sky-50` | Info background |
| `--info-border` | `#BAE6FD` | `border-sky-200` | Info borders |
| `--info-text` | `#075985` | `text-sky-800` | Info text on light bg |

#### Text Colors

| Token | Hex | Tailwind Class | Usage |
|-------|-----|----------------|-------|
| `--text-primary` | `#0F172A` | `text-slate-900` | Headings, primary body text |
| `--text-secondary` | `#64748B` | `text-slate-500` | Descriptions, secondary info |
| `--text-muted` | `#94A3B8` | `text-slate-400` | Placeholders, timestamps, captions |
| `--text-inverted` | `#FFFFFF` | `text-white` | Text on dark backgrounds |

#### Borders & Dividers

| Token | Hex | Tailwind Class | Usage |
|-------|-----|----------------|-------|
| `--border` | `#E5E7EB` | `border-gray-200` | Default borders |
| `--border-strong` | `#D1D5DB` | `border-gray-300` | Input borders, emphasized borders |
| `--divider` | `#F1F5F9` | `border-slate-100` | Section dividers, table row borders |

---

### 2.2 Dark Mode Palette

#### Backgrounds

| Token | Hex | Tailwind Class | Usage |
|-------|-----|----------------|-------|
| `--background` | `#020617` | `dark:bg-slate-950` | Page background |
| `--background-subtle` | `#0F172A` | `dark:bg-slate-900` | Alternating sections |
| `--background-muted` | `#1E293B` | `dark:bg-slate-800` | Disabled areas, skeleton loaders |

#### Surfaces

| Token | Hex | Tailwind Class | Usage |
|-------|-----|----------------|-------|
| `--surface` | `#0F172A` | `dark:bg-slate-900` | Cards, modals, dropdowns |
| `--surface-border` | `#1E293B` | `dark:border-slate-800` | Card/panel borders |
| `--surface-elevated` | `#1E293B` | `dark:bg-slate-800` | Elevated surfaces (popovers, tooltips) |
| `--surface-shadow` | `0 1px 2px rgba(0,0,0,0.3)` | `dark:shadow-sm` | Card shadow |

#### Primary (Dark Mode — Indigo 400)

| Token | Hex | Tailwind Class | Usage |
|-------|-----|----------------|-------|
| `--primary` | `#818CF8` | `dark:text-indigo-400` | Primary buttons, links, active states |
| `--primary-hover` | `#6366F1` | `dark:bg-indigo-500` | Primary button hover |
| `--primary-active` | `#4F46E5` | `dark:bg-indigo-600` | Primary button active |
| `--primary-light` | `rgba(129,140,248,0.1)` | `dark:bg-indigo-400/10` | Selected row bg |
| `--primary-foreground` | `#FFFFFF` | `dark:text-white` | Text on primary buttons |

#### Semantic Colors (Dark Mode Adjustments)

| Token | Light Hex | Dark Hex | Dark Tailwind |
|-------|-----------|----------|---------------|
| `--success` | `#10B981` | `#34D399` | `dark:text-emerald-400` |
| `--success-bg` | `#ECFDF5` | `rgba(52,211,153,0.1)` | `dark:bg-emerald-400/10` |
| `--success-text` | `#065F46` | `#6EE7B7` | `dark:text-emerald-300` |
| `--warning` | `#F59E0B` | `#FBBF24` | `dark:text-amber-400` |
| `--warning-bg` | `#FFFBEB` | `rgba(251,191,36,0.1)` | `dark:bg-amber-400/10` |
| `--warning-text` | `#92400E` | `#FDE68A` | `dark:text-amber-200` |
| `--error` | `#F43F5E` | `#FB7185` | `dark:text-rose-400` |
| `--error-bg` | `#FFF1F2` | `rgba(251,113,133,0.1)` | `dark:bg-rose-400/10` |
| `--error-text` | `#9F1239` | `#FDA4AF` | `dark:text-rose-300` |
| `--info` | `#0EA5E9` | `#38BDF8` | `dark:text-sky-400` |
| `--info-bg` | `#F0F9FF` | `rgba(56,189,248,0.1)` | `dark:bg-sky-400/10` |
| `--info-text` | `#075985` | `#7DD3FC` | `dark:text-sky-300` |

#### Text Colors (Dark Mode)

| Token | Hex | Tailwind Class | Usage |
|-------|-----|----------------|-------|
| `--text-primary` | `#F1F5F9` | `dark:text-slate-100` | Headings, primary body text |
| `--text-secondary` | `#94A3B8` | `dark:text-slate-400` | Descriptions, secondary info |
| `--text-muted` | `#64748B` | `dark:text-slate-500` | Placeholders, timestamps |

#### Borders (Dark Mode)

| Token | Hex | Tailwind Class | Usage |
|-------|-----|----------------|-------|
| `--border` | `#1E293B` | `dark:border-slate-800` | Default borders |
| `--border-strong` | `#334155` | `dark:border-slate-700` | Input borders |
| `--divider` | `#1E293B` | `dark:border-slate-800` | Dividers |

---

### 2.3 Pipeline Stage Colors

Each pipeline stage has a consistent color identity used across Kanban columns, badges, and charts.

| Stage | Light BG | Light Text | Light Border | Dark BG | Dark Text | Tailwind Prefix |
|-------|----------|------------|-------------|---------|-----------|-----------------|
| **Lead** | `#F1F5F9` | `#475569` | `#CBD5E1` | `rgba(148,163,184,0.1)` | `#CBD5E1` | `slate` |
| **Qualified** | `#EFF6FF` | `#1D4ED8` | `#BFDBFE` | `rgba(59,130,246,0.1)` | `#93C5FD` | `blue` |
| **Proposal** | `#F5F3FF` | `#6D28D9` | `#C4B5FD` | `rgba(139,92,246,0.1)` | `#C4B5FD` | `violet` |
| **Negotiation** | `#FFFBEB` | `#B45309` | `#FDE68A` | `rgba(245,158,11,0.1)` | `#FDE68A` | `amber` |
| **Won** | `#ECFDF5` | `#047857` | `#A7F3D0` | `rgba(16,185,129,0.1)` | `#6EE7B7` | `emerald` |
| **Lost** | `#FFF1F2` | `#BE123C` | `#FECDD3` | `rgba(244,63,94,0.1)` | `#FDA4AF` | `rose` |

#### Pipeline Stage Badge Classes

```tsx
const stageColors: Record<string, string> = {
  lead:        'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-400/10 dark:text-slate-300 dark:border-slate-700',
  qualified:   'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-400/10 dark:text-blue-300 dark:border-blue-800',
  proposal:    'bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-400/10 dark:text-violet-300 dark:border-violet-800',
  negotiation: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-400/10 dark:text-amber-300 dark:border-amber-800',
  won:         'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-400/10 dark:text-emerald-300 dark:border-emerald-800',
  lost:        'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-400/10 dark:text-rose-300 dark:border-rose-800',
};
```

#### Kanban Column Header Accent Bars

Each Kanban column has a small colored accent bar (3px height) at the top:

```tsx
const stageAccentColors: Record<string, string> = {
  lead:        'bg-slate-400',
  qualified:   'bg-blue-500',
  proposal:    'bg-violet-500',
  negotiation: 'bg-amber-500',
  won:         'bg-emerald-500',
  lost:        'bg-rose-500',
};
```

---

## 3. Typography

### 3.1 Font Family

| Token | Value | Usage |
|-------|-------|-------|
| `--font-sans` | `'Inter', ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif` | All UI text |
| `--font-mono` | `'JetBrains Mono', ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, monospace` | Code, IDs, technical data |

**Google Fonts import:**
```html
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
```

**Or with Next.js:**
```tsx
import { Inter } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});
```

### 3.2 Type Scale

| Name | Size (px/rem) | Line Height | Weight | Tracking | Tailwind Classes | Usage |
|------|---------------|-------------|--------|----------|-----------------|-------|
| **Display** | 36px / 2.25rem | 40px / 2.5rem | 700 (bold) | -0.025em (tight) | `text-4xl font-bold tracking-tight` | Page titles ("Deals", "Dashboard") |
| **H1** | 30px / 1.875rem | 36px / 2.25rem | 600 (semibold) | -0.025em (tight) | `text-3xl font-semibold tracking-tight` | Section headers |
| **H2** | 24px / 1.5rem | 32px / 2rem | 600 (semibold) | normal | `text-2xl font-semibold` | Subsection headers |
| **H3** | 20px / 1.25rem | 28px / 1.75rem | 500 (medium) | normal | `text-xl font-medium` | Card titles, dialog titles |
| **H4** | 18px / 1.125rem | 28px / 1.75rem | 500 (medium) | normal | `text-lg font-medium` | Sub-card titles |
| **Body** | 16px / 1rem | 24px / 1.5rem | 400 (normal) | normal | `text-base` | Default body text, descriptions |
| **Body Medium** | 16px / 1rem | 24px / 1.5rem | 500 (medium) | normal | `text-base font-medium` | Emphasized body text, nav labels |
| **Small** | 14px / 0.875rem | 20px / 1.25rem | 400 (normal) | normal | `text-sm` | Table cells, form labels, secondary info |
| **Small Medium** | 14px / 0.875rem | 20px / 1.25rem | 500 (medium) | normal | `text-sm font-medium` | Table headers, button text |
| **XS** | 12px / 0.75rem | 16px / 1rem | 500 (medium) | normal | `text-xs font-medium` | Badges, captions, timestamps |
| **XS Uppercase** | 12px / 0.75rem | 16px / 1rem | 500 (medium) | 0.05em (wider) | `text-xs font-medium uppercase tracking-wider` | Section labels, column group headers |

### 3.3 Font Weights

| Weight | Value | Tailwind | Usage |
|--------|-------|----------|-------|
| Normal | 400 | `font-normal` | Body text, descriptions |
| Medium | 500 | `font-medium` | Nav items, labels, emphasized text |
| Semibold | 600 | `font-semibold` | Headings (H1-H2), amounts, totals |
| Bold | 700 | `font-bold` | Display text, page titles |

### 3.4 Text Truncation

For content that may overflow:

```css
/* Single line truncation */
.truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Multi-line clamp (2 lines) */
.line-clamp-2 {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
}
```

---

## 4. Spacing & Layout

### 4.1 Spacing Scale

Base unit: **4px**

| Token | Value | Tailwind | Usage |
|-------|-------|----------|-------|
| `space-0.5` | 2px | `p-0.5` | Tiny gaps (icon-to-text in compact badges) |
| `space-1` | 4px | `p-1` | Minimal padding (tight icon buttons) |
| `space-1.5` | 6px | `p-1.5` | Badge padding, small gaps |
| `space-2` | 8px | `p-2` | Tight padding, gaps between inline items |
| `space-3` | 12px | `p-3` | Nav item padding, compact card padding |
| `space-4` | 16px | `p-4` | Standard element padding |
| `space-5` | 20px | `p-5` | Medium padding |
| `space-6` | 24px | `p-6` | Card padding, section padding (mobile) |
| `space-8` | 32px | `p-8` | Section gaps, page padding (tablet) |
| `space-10` | 40px | `p-10` | Large section padding |
| `space-12` | 48px | `p-12` | Page padding (desktop) |
| `space-16` | 64px | `p-16` | Major section dividers |

### 4.2 Layout Grid

| Property | Value | Tailwind |
|----------|-------|----------|
| **Content max-width** | 1280px | `max-w-7xl` |
| **Narrow content** | 768px | `max-w-3xl` |
| **Form max-width** | 640px | `max-w-xl` |
| **Sidebar (expanded)** | 256px | `w-64` |
| **Sidebar (collapsed)** | 64px | `w-16` |
| **Top bar height** | 64px | `h-16` |

### 4.3 Responsive Breakpoints

| Breakpoint | Min-width | Tailwind Prefix | Page Padding | Description |
|------------|-----------|-----------------|--------------|-------------|
| Mobile | 0px | (default) | 16px (`px-4`) | Phone screens |
| Small | 640px | `sm:` | 24px (`sm:px-6`) | Large phones, small tablets |
| Medium | 768px | `md:` | 32px (`md:px-8`) | Tablets |
| Large | 1024px | `lg:` | 32px (`lg:px-8`) | Small desktops, sidebar visible |
| XL | 1280px | `xl:` | 48px (`xl:px-12`) | Standard desktops |
| 2XL | 1536px | `2xl:` | 48px (`2xl:px-12`) | Large screens |

### 4.4 Page Layout Structure

```
+---------------------------------------------------+
| Top Bar (h-16, fixed, z-40)                       |
+----------+----------------------------------------+
| Sidebar  | Main Content Area                       |
| w-64     | px-8 py-6                               |
| (lg+)    |                                         |
|          | +------------------------------------+  |
|          | | Page Header                        |  |
|          | | (Display title + actions)          |  |
|          | | mb-8                               |  |
|          | +------------------------------------+  |
|          |                                         |
|          | +------------------------------------+  |
|          | | Content Section                    |  |
|          | | (Cards, tables, etc.)              |  |
|          | | gap-6                              |  |
|          | +------------------------------------+  |
|          |                                         |
+----------+----------------------------------------+
```

**Page header pattern:**
```tsx
<div className="flex items-center justify-between mb-8">
  <div>
    <h1 className="text-3xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
      Deals
    </h1>
    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
      Manage your sales pipeline
    </p>
  </div>
  <div className="flex items-center gap-3">
    {/* Action buttons */}
  </div>
</div>
```

### 4.5 Grid Layouts

**Dashboard stats grid:**
```tsx
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
  {/* Stat cards */}
</div>
```

**Two-column detail layout:**
```tsx
<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
  <div className="lg:col-span-2">{/* Main content */}</div>
  <div>{/* Sidebar/details */}</div>
</div>
```

---

## 5. Component Design Specs

### 5.1 Buttons

#### Size Variants

| Size | Height | Padding X | Font Size | Icon Size | Tailwind |
|------|--------|-----------|-----------|-----------|----------|
| **sm** | 32px (h-8) | 12px (px-3) | 13px (text-xs) | 14px | `h-8 px-3 text-xs` |
| **md** | 40px (h-10) | 16px (px-4) | 14px (text-sm) | 16px | `h-10 px-4 text-sm` |
| **lg** | 48px (h-12) | 24px (px-6) | 16px (text-base) | 20px | `h-12 px-6 text-base` |

#### Style Variants

**Primary Button:**
```tsx
// Base
className="inline-flex items-center justify-center h-10 px-4 text-sm font-medium
  rounded-lg bg-indigo-600 text-white shadow-sm
  hover:bg-indigo-700 hover:shadow
  active:bg-indigo-800 active:scale-[0.98]
  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/20 focus-visible:ring-offset-2
  disabled:opacity-50 disabled:pointer-events-none
  transition-all duration-150"

// Dark mode additions
"dark:bg-indigo-500 dark:hover:bg-indigo-400 dark:active:bg-indigo-600
 dark:focus-visible:ring-indigo-400/30 dark:focus-visible:ring-offset-slate-900"
```

**Secondary Button:**
```tsx
className="inline-flex items-center justify-center h-10 px-4 text-sm font-medium
  rounded-lg bg-white text-slate-700 border border-slate-300 shadow-sm
  hover:bg-slate-50 hover:border-slate-400
  active:bg-slate-100 active:scale-[0.98]
  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/20 focus-visible:ring-offset-2
  disabled:opacity-50 disabled:pointer-events-none
  transition-all duration-150
  dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700
  dark:hover:bg-slate-700 dark:hover:border-slate-600"
```

**Ghost Button:**
```tsx
className="inline-flex items-center justify-center h-10 px-4 text-sm font-medium
  rounded-lg text-slate-600
  hover:bg-slate-100 hover:text-slate-900
  active:bg-slate-200
  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/20
  disabled:opacity-50 disabled:pointer-events-none
  transition-all duration-150
  dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
```

**Destructive Button:**
```tsx
className="inline-flex items-center justify-center h-10 px-4 text-sm font-medium
  rounded-lg bg-rose-600 text-white shadow-sm
  hover:bg-rose-700
  active:bg-rose-800 active:scale-[0.98]
  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500/20 focus-visible:ring-offset-2
  disabled:opacity-50 disabled:pointer-events-none
  transition-all duration-150
  dark:bg-rose-500 dark:hover:bg-rose-400"
```

**Icon Button:**
```tsx
// Square button for icons only
className="inline-flex items-center justify-center h-10 w-10
  rounded-lg text-slate-500
  hover:bg-slate-100 hover:text-slate-700
  active:bg-slate-200
  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/20
  transition-all duration-150
  dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
```

#### Button with Loading State

```tsx
<button className="..." disabled>
  <svg className="animate-spin -ml-1 mr-2 h-4 w-4" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
  </svg>
  Saving...
</button>
```

---

### 5.2 Cards

#### Base Card

```tsx
className="rounded-xl border border-gray-200 bg-white shadow-sm
  dark:border-slate-800 dark:bg-slate-900"
```

**Card with padding:**
```tsx
<div className="rounded-xl border border-gray-200 bg-white shadow-sm p-6
  dark:border-slate-800 dark:bg-slate-900">
  <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100">
    Card Title
  </h3>
  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
    Card description
  </p>
</div>
```

#### Clickable/Interactive Card

```tsx
className="rounded-xl border border-gray-200 bg-white shadow-sm p-6
  cursor-pointer
  hover:shadow-md hover:-translate-y-[1px]
  active:shadow-sm active:translate-y-0
  transition-all duration-200
  dark:border-slate-800 dark:bg-slate-900
  dark:hover:border-slate-700"
```

#### Stat Card (Dashboard)

```tsx
<div className="rounded-xl border border-gray-200 bg-white shadow-sm p-6
  dark:border-slate-800 dark:bg-slate-900">
  <div className="flex items-center justify-between">
    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
      Total Revenue
    </p>
    <div className="h-10 w-10 rounded-lg bg-indigo-50 flex items-center justify-center
      dark:bg-indigo-400/10">
      <DollarSign className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
    </div>
  </div>
  <p className="mt-3 text-2xl font-semibold text-slate-900 dark:text-slate-100">
    $45,231
  </p>
  <div className="mt-2 flex items-center text-xs">
    <span className="flex items-center text-emerald-600 dark:text-emerald-400">
      <ArrowUp className="h-3 w-3 mr-0.5" />
      12.5%
    </span>
    <span className="ml-1.5 text-slate-500">from last month</span>
  </div>
</div>
```

---

### 5.3 Form Inputs

#### Text Input

```tsx
// Container
<div className="space-y-1.5">
  {/* Label */}
  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
    Company Name
  </label>

  {/* Input */}
  <input
    type="text"
    className="flex h-10 w-full rounded-lg border border-slate-300 bg-white px-3
      text-sm text-slate-900 placeholder:text-slate-400
      focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500
      disabled:cursor-not-allowed disabled:opacity-50
      transition-colors duration-150
      dark:bg-slate-900 dark:border-slate-700 dark:text-slate-100
      dark:placeholder:text-slate-500
      dark:focus:ring-indigo-400/20 dark:focus:border-indigo-400"
    placeholder="Enter company name..."
  />

  {/* Help text (optional) */}
  <p className="text-xs text-slate-500 dark:text-slate-400">
    The legal name of the company.
  </p>
</div>
```

#### Input Error State

```tsx
<input
  className="... border-rose-500
    focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500
    dark:border-rose-400 dark:focus:ring-rose-400/20 dark:focus:border-rose-400"
/>
<p className="text-xs text-rose-600 dark:text-rose-400 mt-1">
  Company name is required.
</p>
```

#### Select Input

```tsx
<select className="flex h-10 w-full rounded-lg border border-slate-300 bg-white px-3
  text-sm text-slate-900 appearance-none
  focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500
  dark:bg-slate-900 dark:border-slate-700 dark:text-slate-100">
  <option>Select...</option>
</select>
```

#### Textarea

```tsx
<textarea className="flex w-full rounded-lg border border-slate-300 bg-white px-3 py-2
  text-sm text-slate-900 placeholder:text-slate-400 min-h-[80px] resize-y
  focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500
  dark:bg-slate-900 dark:border-slate-700 dark:text-slate-100
  dark:placeholder:text-slate-500" />
```

#### Checkbox

```tsx
<label className="flex items-center gap-2 cursor-pointer">
  <input type="checkbox" className="h-4 w-4 rounded border-slate-300 text-indigo-600
    focus:ring-indigo-500/20 dark:border-slate-600 dark:bg-slate-800" />
  <span className="text-sm text-slate-700 dark:text-slate-300">Remember me</span>
</label>
```

---

### 5.4 Data Tables

#### Complete Table Structure

```tsx
<div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden
  dark:border-slate-800 dark:bg-slate-900">

  {/* Table toolbar */}
  <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100
    dark:border-slate-800">
    <div className="flex items-center gap-3">
      {/* Search input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <input className="h-9 w-64 pl-9 pr-3 rounded-lg border border-slate-200 text-sm
          bg-slate-50 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20
          dark:bg-slate-800 dark:border-slate-700 dark:focus:bg-slate-900"
          placeholder="Search..." />
      </div>
      {/* Filter buttons */}
    </div>
    <div className="flex items-center gap-2">
      {/* Actions */}
    </div>
  </div>

  {/* Table */}
  <table className="w-full">
    <thead>
      <tr className="border-b border-gray-100 bg-slate-50/50
        dark:border-slate-800 dark:bg-slate-800/50">
        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider
          text-slate-500 dark:text-slate-400">
          Name
        </th>
        {/* More columns */}
      </tr>
    </thead>
    <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
      <tr className="h-14 hover:bg-slate-50/50 transition-colors
        dark:hover:bg-slate-800/50">
        <td className="px-6 text-sm text-slate-900 dark:text-slate-100">
          Acme Corp
        </td>
        {/* More cells */}
      </tr>
    </tbody>
  </table>

  {/* Pagination */}
  <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100
    dark:border-slate-800">
    <p className="text-sm text-slate-500 dark:text-slate-400">
      Showing 1-10 of 48 results
    </p>
    <div className="flex items-center gap-1">
      {/* Pagination buttons */}
    </div>
  </div>
</div>
```

#### Selected Row

```tsx
<tr className="h-14 bg-indigo-50 border-l-2 border-l-indigo-500
  dark:bg-indigo-400/5 dark:border-l-indigo-400">
  {/* cells */}
</tr>
```

#### Sortable Column Header

```tsx
<th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider
  text-slate-500 cursor-pointer select-none hover:text-slate-700 group
  dark:text-slate-400 dark:hover:text-slate-200">
  <div className="flex items-center gap-1">
    Name
    <ArrowUpDown className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
  </div>
</th>
```

---

### 5.5 Sidebar Navigation

#### Sidebar Container

```tsx
<aside className="fixed inset-y-0 left-0 z-30 w-64 flex flex-col
  bg-slate-900 border-r border-slate-800">

  {/* Logo area */}
  <div className="flex items-center h-16 px-5 border-b border-slate-800">
    <span className="text-lg font-semibold text-white">Simple CRM</span>
  </div>

  {/* Navigation */}
  <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
    {/* Section label */}
    <p className="px-3 mb-2 text-xs font-medium uppercase tracking-wider text-slate-500">
      Main
    </p>

    {/* Nav items */}
    {/* Active item */}
    <a className="flex items-center gap-3 px-3 h-10 rounded-lg
      bg-slate-800 text-white font-medium
      transition-colors duration-150">
      <LayoutDashboard className="h-4.5 w-4.5" />
      <span className="text-sm">Dashboard</span>
    </a>

    {/* Inactive item */}
    <a className="flex items-center gap-3 px-3 h-10 rounded-lg
      text-slate-400
      hover:bg-slate-800/50 hover:text-slate-200
      transition-colors duration-150">
      <Users className="h-4.5 w-4.5" />
      <span className="text-sm">Contacts</span>
    </a>

    {/* Section divider */}
    <div className="pt-4 pb-2">
      <p className="px-3 text-xs font-medium uppercase tracking-wider text-slate-500">
        Settings
      </p>
    </div>
  </nav>

  {/* Bottom section (user profile) */}
  <div className="p-3 border-t border-slate-800">
    <div className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-800/50
      transition-colors cursor-pointer">
      <div className="h-8 w-8 rounded-full bg-indigo-600 flex items-center justify-center
        text-xs font-medium text-white">
        JD
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-200 truncate">John Doe</p>
        <p className="text-xs text-slate-500 truncate">john@company.com</p>
      </div>
    </div>
  </div>
</aside>
```

#### Collapsed Sidebar (64px)

```tsx
<aside className="fixed inset-y-0 left-0 z-30 w-16 flex flex-col items-center
  bg-slate-900 border-r border-slate-800">

  {/* Logo icon only */}
  <div className="flex items-center justify-center h-16">
    <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center">
      <span className="text-sm font-bold text-white">S</span>
    </div>
  </div>

  {/* Icon-only nav items */}
  <nav className="flex-1 flex flex-col items-center py-4 gap-1">
    <a className="flex items-center justify-center h-10 w-10 rounded-lg
      bg-slate-800 text-white" title="Dashboard">
      <LayoutDashboard className="h-5 w-5" />
    </a>
    <a className="flex items-center justify-center h-10 w-10 rounded-lg
      text-slate-400 hover:bg-slate-800/50 hover:text-slate-200" title="Contacts">
      <Users className="h-5 w-5" />
    </a>
  </nav>
</aside>
```

---

### 5.6 Status Badges

#### Badge Base

```tsx
className="inline-flex items-center rounded-full px-2.5 py-0.5
  text-xs font-medium border transition-colors"
```

#### Badge Variants

| Variant | Light Mode Classes | Dark Mode Classes |
|---------|-------------------|-------------------|
| **Default** | `bg-slate-100 text-slate-600 border-slate-200` | `dark:bg-slate-400/10 dark:text-slate-300 dark:border-slate-700` |
| **Primary** | `bg-indigo-50 text-indigo-700 border-indigo-200` | `dark:bg-indigo-400/10 dark:text-indigo-300 dark:border-indigo-800` |
| **Success** | `bg-emerald-50 text-emerald-700 border-emerald-200` | `dark:bg-emerald-400/10 dark:text-emerald-300 dark:border-emerald-800` |
| **Warning** | `bg-amber-50 text-amber-700 border-amber-200` | `dark:bg-amber-400/10 dark:text-amber-300 dark:border-amber-800` |
| **Error** | `bg-rose-50 text-rose-700 border-rose-200` | `dark:bg-rose-400/10 dark:text-rose-300 dark:border-rose-800` |
| **Info** | `bg-sky-50 text-sky-700 border-sky-200` | `dark:bg-sky-400/10 dark:text-sky-300 dark:border-sky-800` |

#### Badge with Dot Indicator

```tsx
<span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5
  text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200
  dark:bg-emerald-400/10 dark:text-emerald-300 dark:border-emerald-800">
  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400" />
  Active
</span>
```

---

### 5.7 Kanban Cards

#### Kanban Column

```tsx
<div className="flex flex-col w-80 min-w-[320px] shrink-0">
  {/* Column header */}
  <div className="mb-3">
    {/* Accent bar */}
    <div className="h-[3px] rounded-full bg-blue-500 mb-3" />
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <h3 className="text-sm font-medium text-slate-900 dark:text-slate-100">
          Qualified
        </h3>
        <span className="inline-flex items-center justify-center h-5 min-w-[20px] px-1.5
          rounded-full bg-slate-100 text-xs font-medium text-slate-600
          dark:bg-slate-800 dark:text-slate-400">
          5
        </span>
      </div>
      <button className="h-7 w-7 rounded-md text-slate-400 hover:bg-slate-100
        hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300
        transition-colors">
        <Plus className="h-4 w-4 mx-auto" />
      </button>
    </div>
    {/* Column total */}
    <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
      $125,000
    </p>
  </div>

  {/* Cards container */}
  <div className="flex flex-col gap-2 flex-1 min-h-[200px] p-1 -m-1
    rounded-lg transition-colors"
    {/* Drop zone active state: border-2 border-dashed border-indigo-300 bg-indigo-50/50
      dark:border-indigo-500/50 dark:bg-indigo-500/5 */}>

    {/* Kanban card */}
    <div className="group relative rounded-lg border border-gray-200 bg-white p-4
      shadow-sm cursor-grab
      hover:shadow-md hover:border-gray-300
      active:cursor-grabbing active:shadow-lg active:rotate-[2deg]
      transition-all duration-200
      dark:bg-slate-900 dark:border-slate-800
      dark:hover:border-slate-700">

      {/* Drag handle (visible on hover) */}
      <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-lg opacity-0
        group-hover:opacity-100 bg-slate-300 dark:bg-slate-600 transition-opacity" />

      {/* Card content */}
      <div className="space-y-3">
        <div>
          <h4 className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
            Enterprise License Deal
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">
            Acme Corporation
          </p>
        </div>

        <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">
          $48,000
        </p>

        <div className="flex items-center justify-between">
          {/* Contact avatar */}
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-full bg-violet-100 flex items-center justify-center
              dark:bg-violet-400/10">
              <span className="text-[10px] font-medium text-violet-700 dark:text-violet-300">
                JS
              </span>
            </div>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Jane Smith
            </span>
          </div>

          {/* Expected close */}
          <span className="text-xs text-slate-400 dark:text-slate-500">
            Mar 15
          </span>
        </div>
      </div>
    </div>
  </div>
</div>
```

---

### 5.8 Avatars

#### Size Variants

| Size | Dimensions | Font Size | Tailwind |
|------|------------|-----------|----------|
| **xs** | 24px | 10px | `h-6 w-6 text-[10px]` |
| **sm** | 32px | 12px | `h-8 w-8 text-xs` |
| **md** | 40px | 14px | `h-10 w-10 text-sm` |
| **lg** | 56px | 20px | `h-14 w-14 text-xl` |
| **xl** | 80px | 28px | `h-20 w-20 text-2xl` |

#### Avatar with Image

```tsx
<div className="h-10 w-10 rounded-full ring-2 ring-white dark:ring-slate-900 overflow-hidden">
  <img src={avatarUrl} alt={name} className="h-full w-full object-cover" />
</div>
```

#### Avatar Fallback (Initials)

```tsx
<div className="h-10 w-10 rounded-full ring-2 ring-white dark:ring-slate-900
  flex items-center justify-center text-sm font-medium"
  style={{ backgroundColor: getAvatarColor(name) }}>
  <span className="text-white">{getInitials(name)}</span>
</div>
```

#### Deterministic Avatar Color Function

```tsx
const avatarColors = [
  '#4F46E5', // Indigo
  '#7C3AED', // Violet
  '#2563EB', // Blue
  '#0891B2', // Cyan
  '#059669', // Emerald
  '#D97706', // Amber
  '#DC2626', // Red
  '#DB2777', // Pink
  '#9333EA', // Purple
  '#0D9488', // Teal
];

function getAvatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return avatarColors[Math.abs(hash) % avatarColors.length];
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}
```

#### Avatar Group (Stacked)

```tsx
<div className="flex -space-x-2">
  {avatars.map((avatar, i) => (
    <div key={i} className="h-8 w-8 rounded-full ring-2 ring-white dark:ring-slate-900
      flex items-center justify-center text-xs font-medium relative"
      style={{ backgroundColor: getAvatarColor(avatar.name), zIndex: avatars.length - i }}>
      <span className="text-white">{getInitials(avatar.name)}</span>
    </div>
  ))}
  {overflow > 0 && (
    <div className="h-8 w-8 rounded-full ring-2 ring-white dark:ring-slate-900
      flex items-center justify-center text-xs font-medium
      bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300">
      +{overflow}
    </div>
  )}
</div>
```

---

### 5.9 Modals / Dialogs

#### Modal Container

```tsx
{/* Backdrop */}
<div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm
  animate-in fade-in duration-200" />

{/* Modal */}
<div className="fixed inset-0 z-50 flex items-center justify-center p-4">
  <div className="w-full max-w-lg rounded-xl bg-white shadow-2xl border border-gray-200
    animate-in fade-in slide-in-from-bottom-4 duration-200
    dark:bg-slate-900 dark:border-slate-800">

    {/* Header */}
    <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100
      dark:border-slate-800">
      <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
        Create New Deal
      </h2>
      <button className="h-8 w-8 rounded-lg text-slate-400
        hover:bg-slate-100 hover:text-slate-600
        dark:hover:bg-slate-800 dark:hover:text-slate-300
        transition-colors">
        <X className="h-4 w-4 mx-auto" />
      </button>
    </div>

    {/* Body */}
    <div className="px-6 py-4">
      {/* Form content */}
    </div>

    {/* Footer */}
    <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100
      dark:border-slate-800">
      <button className="/* Secondary button styles */">Cancel</button>
      <button className="/* Primary button styles */">Create Deal</button>
    </div>
  </div>
</div>
```

#### Modal Size Variants

| Size | Max Width | Tailwind | Usage |
|------|-----------|----------|-------|
| **sm** | 400px | `max-w-sm` | Confirmations, simple forms |
| **md** | 500px | `max-w-md` | Standard forms |
| **lg** | 640px | `max-w-lg` | Complex forms, detail views |
| **xl** | 768px | `max-w-3xl` | Multi-section forms, previews |
| **full** | calc(100% - 4rem) | `max-w-[calc(100%-4rem)]` | Full-screen overlays |

---

### 5.10 Toast Notifications

#### Toast Container

```tsx
{/* Container: fixed bottom-right, stacking from bottom */}
<div className="fixed bottom-4 right-4 z-[100] flex flex-col-reverse gap-2
  max-w-sm w-full pointer-events-none">

  {/* Individual toast */}
  <div className="pointer-events-auto w-full rounded-lg border bg-white shadow-lg p-4
    animate-in slide-in-from-bottom-5 fade-in duration-300
    dark:bg-slate-900 dark:border-slate-800"
    role="alert">
    <div className="flex items-start gap-3">
      {/* Icon */}
      <div className="shrink-0 mt-0.5">
        <CheckCircle className="h-5 w-5 text-emerald-500" />
      </div>
      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
          Deal created successfully
        </p>
        <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
          "Enterprise License" has been added to Qualified stage.
        </p>
      </div>
      {/* Dismiss */}
      <button className="shrink-0 h-6 w-6 rounded text-slate-400 hover:text-slate-600
        dark:hover:text-slate-300 transition-colors">
        <X className="h-4 w-4 mx-auto" />
      </button>
    </div>
    {/* Optional action */}
    <div className="mt-3 flex justify-end">
      <button className="text-xs font-medium text-indigo-600 hover:text-indigo-700
        dark:text-indigo-400 dark:hover:text-indigo-300">
        View Deal
      </button>
    </div>
  </div>
</div>
```

#### Toast Variants

| Variant | Icon | Border Color |
|---------|------|-------------|
| **Success** | `CheckCircle` (emerald-500) | `border-emerald-200 dark:border-emerald-800` |
| **Error** | `XCircle` (rose-500) | `border-rose-200 dark:border-rose-800` |
| **Warning** | `AlertTriangle` (amber-500) | `border-amber-200 dark:border-amber-800` |
| **Info** | `Info` (sky-500) | `border-sky-200 dark:border-sky-800` |

**Auto-dismiss:** 5 seconds (configurable per toast). Exit animation: `animate-out fade-out slide-out-to-right-5 duration-200`.

---

### 5.11 Empty States

```tsx
<div className="flex flex-col items-center justify-center py-16 px-6">
  <div className="h-12 w-12 rounded-xl bg-slate-100 flex items-center justify-center mb-4
    dark:bg-slate-800">
    <Inbox className="h-6 w-6 text-slate-400 dark:text-slate-500" />
  </div>
  <h3 className="text-base font-medium text-slate-900 dark:text-slate-100">
    No deals yet
  </h3>
  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 text-center max-w-sm">
    Create your first deal to start tracking your pipeline.
  </p>
  <button className="mt-6 /* Primary button styles */">
    <Plus className="h-4 w-4 mr-2" />
    Create Deal
  </button>
</div>
```

---

### 5.12 Dropdown Menus

```tsx
<div className="rounded-lg border border-gray-200 bg-white shadow-lg py-1 min-w-[180px]
  animate-in fade-in zoom-in-95 duration-150 origin-top-left
  dark:bg-slate-900 dark:border-slate-800">

  {/* Menu item */}
  <button className="flex items-center gap-2 w-full px-3 py-2 text-sm text-slate-700
    hover:bg-slate-50 hover:text-slate-900
    dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-100
    transition-colors">
    <Edit className="h-4 w-4 text-slate-400" />
    Edit
  </button>

  {/* Separator */}
  <div className="my-1 h-px bg-gray-100 dark:bg-slate-800" />

  {/* Destructive item */}
  <button className="flex items-center gap-2 w-full px-3 py-2 text-sm text-rose-600
    hover:bg-rose-50
    dark:text-rose-400 dark:hover:bg-rose-400/10
    transition-colors">
    <Trash className="h-4 w-4" />
    Delete
  </button>
</div>
```

---

### 5.13 Tabs

```tsx
<div className="border-b border-gray-200 dark:border-slate-800">
  <nav className="flex gap-1 -mb-px px-1">
    {/* Active tab */}
    <button className="px-4 py-2.5 text-sm font-medium text-indigo-600
      border-b-2 border-indigo-600
      dark:text-indigo-400 dark:border-indigo-400
      transition-colors">
      Overview
    </button>

    {/* Inactive tab */}
    <button className="px-4 py-2.5 text-sm font-medium text-slate-500
      border-b-2 border-transparent
      hover:text-slate-700 hover:border-slate-300
      dark:text-slate-400 dark:hover:text-slate-300 dark:hover:border-slate-600
      transition-colors">
      Activity
    </button>
  </nav>
</div>
```

---

### 5.14 Search / Command Palette

```tsx
{/* Overlay */}
<div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-start justify-center pt-[20vh]
  animate-in fade-in duration-150">

  <div className="w-full max-w-lg rounded-xl bg-white shadow-2xl border border-gray-200 overflow-hidden
    animate-in fade-in zoom-in-95 slide-in-from-top-2 duration-200
    dark:bg-slate-900 dark:border-slate-800">

    {/* Search input */}
    <div className="flex items-center gap-3 px-4 border-b border-gray-100 dark:border-slate-800">
      <Search className="h-5 w-5 text-slate-400 shrink-0" />
      <input className="flex-1 h-12 bg-transparent text-base text-slate-900
        placeholder:text-slate-400 outline-none
        dark:text-slate-100"
        placeholder="Search deals, contacts, companies..." />
      <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded
        bg-slate-100 text-[10px] font-medium text-slate-500
        dark:bg-slate-800 dark:text-slate-500">
        ESC
      </kbd>
    </div>

    {/* Results */}
    <div className="max-h-80 overflow-y-auto py-2">
      {/* Group label */}
      <p className="px-4 py-1.5 text-xs font-medium text-slate-500 dark:text-slate-400">
        Deals
      </p>
      {/* Result item */}
      <button className="flex items-center gap-3 w-full px-4 py-2.5 text-sm
        hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
        <div className="h-8 w-8 rounded-lg bg-indigo-50 flex items-center justify-center
          dark:bg-indigo-400/10">
          <Briefcase className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
        </div>
        <div className="flex-1 text-left">
          <p className="font-medium text-slate-900 dark:text-slate-100">Enterprise License</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">Acme Corp - $48,000</p>
        </div>
        <ArrowRight className="h-4 w-4 text-slate-300 dark:text-slate-600" />
      </button>
    </div>
  </div>
</div>
```

---

## 6. Animation Guidelines

### 6.1 Duration Scale

| Token | Duration | Usage |
|-------|----------|-------|
| `--duration-fast` | 100ms | Opacity changes, color changes |
| `--duration-normal` | 150ms | Hover effects, button press, focus rings |
| `--duration-moderate` | 200ms | Dropdowns, tooltips, page transitions |
| `--duration-slow` | 300ms | Modal open/close, sidebar collapse, major transitions |
| `--duration-slower` | 500ms | Complex multi-step animations |

### 6.2 Easing Functions

| Token | Value | Usage |
|-------|-------|-------|
| `--ease-out` | `cubic-bezier(0.16, 1, 0.3, 1)` | Enter animations (elements appearing) |
| `--ease-in` | `cubic-bezier(0.55, 0, 1, 0.45)` | Exit animations (elements disappearing) |
| `--ease-in-out` | `cubic-bezier(0.45, 0, 0.55, 1)` | Continuous animations (hover, transitions) |
| `--ease-spring` | `cubic-bezier(0.34, 1.56, 0.64, 1)` | Bouncy/playful effects (drag, snap) |

### 6.3 Specific Animations

#### Page Transitions

```css
/* Fade in on mount */
@keyframes page-enter {
  from { opacity: 0; transform: translateY(4px); }
  to { opacity: 1; transform: translateY(0); }
}

.page-enter {
  animation: page-enter 200ms var(--ease-out);
}
```

#### Modal

```css
/* Modal backdrop */
@keyframes backdrop-enter {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* Modal content */
@keyframes modal-enter {
  from { opacity: 0; transform: scale(0.95) translateY(10px); }
  to { opacity: 1; transform: scale(1) translateY(0); }
}

@keyframes modal-exit {
  from { opacity: 1; transform: scale(1) translateY(0); }
  to { opacity: 0; transform: scale(0.95) translateY(10px); }
}

.modal-enter {
  animation: modal-enter 200ms var(--ease-out);
}

.modal-exit {
  animation: modal-exit 150ms var(--ease-in);
}
```

#### Sidebar Collapse

```css
.sidebar-transition {
  transition: width 200ms var(--ease-in-out);
}
```

#### Kanban Drag

```css
/* Card being dragged */
.kanban-dragging {
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  transform: rotate(2deg) scale(1.02);
  transition: box-shadow 200ms, transform 200ms var(--ease-spring);
  z-index: 100;
}

/* Drop zone highlight */
.kanban-drop-active {
  border: 2px dashed theme('colors.indigo.300');
  background: theme('colors.indigo.50/50');
  transition: border-color 200ms, background-color 200ms;
}
```

#### Hover Effects

```css
/* Card lift on hover */
.card-hover {
  transition: transform 200ms var(--ease-out),
              box-shadow 200ms var(--ease-out),
              border-color 200ms;
}

.card-hover:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}
```

#### Skeleton Loading

```css
@keyframes skeleton-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.skeleton {
  animation: skeleton-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  background-color: theme('colors.slate.200');
  border-radius: theme('borderRadius.md');
}

.dark .skeleton {
  background-color: theme('colors.slate.800');
}
```

#### Toast Notifications

```css
@keyframes toast-enter {
  from { opacity: 0; transform: translateY(100%) scale(0.95); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}

@keyframes toast-exit {
  from { opacity: 1; transform: translateX(0); }
  to { opacity: 0; transform: translateX(100%); }
}

.toast-enter {
  animation: toast-enter 300ms var(--ease-out);
}

.toast-exit {
  animation: toast-exit 200ms var(--ease-in);
}
```

#### Number Counter (Dashboard Stats)

```css
/* Use framer-motion for smooth number counting */
/* <motion.span> with useSpring for animating numeric values */
```

---

## 7. Iconography

### 7.1 Icon Library

**Primary:** [Lucide Icons](https://lucide.dev/) (MIT license, consistent with shadcn/ui)

```bash
npm install lucide-react
```

### 7.2 Icon Sizing

| Context | Size | Tailwind | Usage |
|---------|------|----------|-------|
| **Inline (XS)** | 14px | `h-3.5 w-3.5` | Inside badges, next to small text |
| **Default** | 16px | `h-4 w-4` | Buttons, nav items, table actions |
| **Medium** | 20px | `h-5 w-5` | Standalone icons, stat card icons |
| **Large** | 24px | `h-6 w-6` | Empty states, section headers |
| **XL** | 32px | `h-8 w-8` | Hero/feature icons |

### 7.3 Icon Colors

| Context | Light Mode | Dark Mode |
|---------|------------|-----------|
| **Default** | `text-slate-500` | `dark:text-slate-400` |
| **Muted** | `text-slate-400` | `dark:text-slate-500` |
| **Active** | `text-indigo-600` | `dark:text-indigo-400` |
| **On dark bg** | `text-white` | `text-white` |
| **Semantic** | Match the semantic color | Match dark variant |

### 7.4 Recommended Icons per Feature

| Feature | Icon | Lucide Name |
|---------|------|-------------|
| Dashboard | `LayoutDashboard` | `layout-dashboard` |
| Deals | `Briefcase` | `briefcase` |
| Contacts | `Users` | `users` |
| Companies | `Building2` | `building-2` |
| Activities | `Activity` | `activity` |
| Calendar | `Calendar` | `calendar` |
| Reports | `BarChart3` | `bar-chart-3` |
| Settings | `Settings` | `settings` |
| Search | `Search` | `search` |
| Add/Create | `Plus` | `plus` |
| Edit | `Pencil` | `pencil` |
| Delete | `Trash2` | `trash-2` |
| Close | `X` | `x` |
| Menu | `Menu` | `menu` |
| Filter | `Filter` | `filter` |
| Sort | `ArrowUpDown` | `arrow-up-down` |
| Email | `Mail` | `mail` |
| Phone | `Phone` | `phone` |
| Money | `DollarSign` | `dollar-sign` |
| Date | `CalendarDays` | `calendar-days` |
| Expand | `ChevronRight` | `chevron-right` |
| Collapse | `ChevronLeft` | `chevron-left` |
| More actions | `MoreHorizontal` | `more-horizontal` |
| Drag handle | `GripVertical` | `grip-vertical` |
| Upload | `Upload` | `upload` |
| Download | `Download` | `download` |
| Link | `ExternalLink` | `external-link` |
| Notification | `Bell` | `bell` |
| Success | `CheckCircle` | `check-circle` |
| Error | `XCircle` | `x-circle` |
| Warning | `AlertTriangle` | `alert-triangle` |
| Info | `Info` | `info` |

---

## 8. Tailwind Configuration

### Complete `tailwind.config.ts`

```typescript
import type { Config } from 'tailwindcss';
import tailwindAnimate from 'tailwindcss-animate';

const config: Config = {
  darkMode: 'class',
  content: [
    './src/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      // ─── Colors ────────────────────────────────────────────
      colors: {
        // Base backgrounds
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',

        // Card / Surface
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },

        // Popover
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },

        // Primary (Indigo)
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },

        // Secondary (Slate)
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },

        // Muted
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },

        // Accent (Violet)
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },

        // Destructive (Rose)
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },

        // Borders
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',

        // Sidebar
        sidebar: {
          DEFAULT: 'hsl(var(--sidebar-background))',
          foreground: 'hsl(var(--sidebar-foreground))',
          border: 'hsl(var(--sidebar-border))',
          accent: 'hsl(var(--sidebar-accent))',
          'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
          ring: 'hsl(var(--sidebar-ring))',
        },

        // Pipeline stage colors (direct use)
        pipeline: {
          lead: {
            bg: 'var(--pipeline-lead-bg)',
            text: 'var(--pipeline-lead-text)',
            border: 'var(--pipeline-lead-border)',
          },
          qualified: {
            bg: 'var(--pipeline-qualified-bg)',
            text: 'var(--pipeline-qualified-text)',
            border: 'var(--pipeline-qualified-border)',
          },
          proposal: {
            bg: 'var(--pipeline-proposal-bg)',
            text: 'var(--pipeline-proposal-text)',
            border: 'var(--pipeline-proposal-border)',
          },
          negotiation: {
            bg: 'var(--pipeline-negotiation-bg)',
            text: 'var(--pipeline-negotiation-text)',
            border: 'var(--pipeline-negotiation-border)',
          },
          won: {
            bg: 'var(--pipeline-won-bg)',
            text: 'var(--pipeline-won-text)',
            border: 'var(--pipeline-won-border)',
          },
          lost: {
            bg: 'var(--pipeline-lost-bg)',
            text: 'var(--pipeline-lost-text)',
            border: 'var(--pipeline-lost-border)',
          },
        },
      },

      // ─── Font Family ───────────────────────────────────────
      fontFamily: {
        sans: [
          'var(--font-sans)',
          'Inter',
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'sans-serif',
        ],
        mono: [
          'JetBrains Mono',
          'ui-monospace',
          'SFMono-Regular',
          'SF Mono',
          'Menlo',
          'Consolas',
          'Liberation Mono',
          'monospace',
        ],
      },

      // ─── Border Radius ─────────────────────────────────────
      borderRadius: {
        lg: 'var(--radius)',       // 8px — buttons, inputs
        md: 'calc(var(--radius) - 2px)', // 6px
        sm: 'calc(var(--radius) - 4px)', // 4px
        xl: 'calc(var(--radius) + 4px)', // 12px — cards
      },

      // ─── Shadows ───────────────────────────────────────────
      boxShadow: {
        'card': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'card-hover': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
        'dropdown': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
        'modal': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        'toast': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
        'inner-glow': 'inset 0 1px 0 0 rgba(255, 255, 255, 0.05)',
      },

      // ─── Animations ────────────────────────────────────────
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'fade-out': {
          from: { opacity: '1' },
          to: { opacity: '0' },
        },
        'slide-in-from-bottom': {
          from: { transform: 'translateY(10px)', opacity: '0' },
          to: { transform: 'translateY(0)', opacity: '1' },
        },
        'slide-in-from-top': {
          from: { transform: 'translateY(-10px)', opacity: '0' },
          to: { transform: 'translateY(0)', opacity: '1' },
        },
        'slide-in-from-right': {
          from: { transform: 'translateX(10px)', opacity: '0' },
          to: { transform: 'translateX(0)', opacity: '1' },
        },
        'slide-out-to-right': {
          from: { transform: 'translateX(0)', opacity: '1' },
          to: { transform: 'translateX(100%)', opacity: '0' },
        },
        'scale-in': {
          from: { transform: 'scale(0.95)', opacity: '0' },
          to: { transform: 'scale(1)', opacity: '1' },
        },
        'scale-out': {
          from: { transform: 'scale(1)', opacity: '0' },
          to: { transform: 'scale(0.95)', opacity: '0' },
        },
        'skeleton-pulse': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
        'spin-slow': {
          from: { transform: 'rotate(0deg)' },
          to: { transform: 'rotate(360deg)' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 200ms ease-out',
        'accordion-up': 'accordion-up 200ms ease-out',
        'fade-in': 'fade-in 200ms ease-out',
        'fade-out': 'fade-out 150ms ease-in',
        'slide-in-bottom': 'slide-in-from-bottom 200ms ease-out',
        'slide-in-top': 'slide-in-from-top 200ms ease-out',
        'slide-in-right': 'slide-in-from-right 200ms ease-out',
        'slide-out-right': 'slide-out-to-right 200ms ease-in',
        'scale-in': 'scale-in 200ms ease-out',
        'scale-out': 'scale-out 150ms ease-in',
        'skeleton': 'skeleton-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin-slow 3s linear infinite',
      },

      // ─── Transitions ──────────────────────────────────────
      transitionDuration: {
        'fast': '100ms',
        'normal': '150ms',
        'moderate': '200ms',
        'slow': '300ms',
      },

      // ─── Spacing (adding missing values) ───────────────────
      spacing: {
        '4.5': '1.125rem', // 18px
        '13': '3.25rem',   // 52px
        '15': '3.75rem',   // 60px
        '18': '4.5rem',    // 72px
        '22': '5.5rem',    // 88px
        '30': '7.5rem',    // 120px
      },

      // ─── Max Width ─────────────────────────────────────────
      maxWidth: {
        'sidebar': '256px',
        'sidebar-collapsed': '64px',
        'content': '1280px',
      },
    },
  },
  plugins: [tailwindAnimate],
};

export default config;
```

---

## 9. shadcn/ui Customization

### 9.1 Components to Install

Install these shadcn/ui components for the CRM:

```bash
# Core UI
npx shadcn@latest add button
npx shadcn@latest add input
npx shadcn@latest add label
npx shadcn@latest add textarea
npx shadcn@latest add select
npx shadcn@latest add checkbox
npx shadcn@latest add radio-group
npx shadcn@latest add switch

# Layout & Navigation
npx shadcn@latest add card
npx shadcn@latest add tabs
npx shadcn@latest add separator
npx shadcn@latest add badge
npx shadcn@latest add avatar
npx shadcn@latest add sidebar

# Overlays
npx shadcn@latest add dialog
npx shadcn@latest add sheet
npx shadcn@latest add popover
npx shadcn@latest add tooltip
npx shadcn@latest add dropdown-menu
npx shadcn@latest add command   # For command palette / search

# Feedback
npx shadcn@latest add toast
npx shadcn@latest add sonner    # Better toast alternative
npx shadcn@latest add alert
npx shadcn@latest add skeleton

# Data Display
npx shadcn@latest add table
npx shadcn@latest add scroll-area

# Forms
npx shadcn@latest add form
npx shadcn@latest add calendar
npx shadcn@latest add date-picker

# Charts (for dashboard)
npx shadcn@latest add chart
```

### 9.2 Custom Component Variants

#### Button Variants (extend shadcn default)

```tsx
// In components/ui/button.tsx — extend the variants
const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 active:scale-[0.98]",
        destructive: "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90 active:scale-[0.98]",
        outline: "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        // Custom variants for CRM
        success: "bg-emerald-600 text-white shadow-sm hover:bg-emerald-700 active:scale-[0.98] dark:bg-emerald-500 dark:hover:bg-emerald-400",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 rounded-lg px-3 text-xs",
        lg: "h-12 rounded-lg px-6 text-base",
        icon: "h-10 w-10",
        "icon-sm": "h-8 w-8",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);
```

#### Badge Variants (extend for pipeline stages)

```tsx
// In components/ui/badge.tsx
const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary/10 text-primary",
        secondary: "border-transparent bg-secondary text-secondary-foreground",
        destructive: "border-transparent bg-destructive/10 text-destructive",
        outline: "text-foreground",
        // Pipeline stages
        lead: "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-400/10 dark:text-slate-300 dark:border-slate-700",
        qualified: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-400/10 dark:text-blue-300 dark:border-blue-800",
        proposal: "bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-400/10 dark:text-violet-300 dark:border-violet-800",
        negotiation: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-400/10 dark:text-amber-300 dark:border-amber-800",
        won: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-400/10 dark:text-emerald-300 dark:border-emerald-800",
        lost: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-400/10 dark:text-rose-300 dark:border-rose-800",
        // Semantic
        success: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-400/10 dark:text-emerald-300 dark:border-emerald-800",
        warning: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-400/10 dark:text-amber-300 dark:border-amber-800",
        error: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-400/10 dark:text-rose-300 dark:border-rose-800",
        info: "bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-400/10 dark:text-sky-300 dark:border-sky-800",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);
```

### 9.3 Additional Libraries

| Library | Purpose | Install |
|---------|---------|---------|
| `@hello-pangea/dnd` | Kanban drag and drop | `npm install @hello-pangea/dnd` |
| `recharts` | Dashboard charts (bundled with shadcn chart) | `npm install recharts` |
| `date-fns` | Date formatting | `npm install date-fns` |
| `nuqs` | URL state management (for filters) | `npm install nuqs` |
| `@tanstack/react-table` | Advanced data tables | `npm install @tanstack/react-table` |
| `react-hook-form` | Form state management | `npm install react-hook-form` |
| `zod` | Schema validation | `npm install zod` |
| `@hookform/resolvers` | Zod + react-hook-form bridge | `npm install @hookform/resolvers` |
| `framer-motion` | Advanced animations | `npm install framer-motion` |
| `next-themes` | Dark mode toggling | `npm install next-themes` |

---

## 10. CSS Variables & Theme

### Complete `globals.css`

```css
@import 'tailwindcss';

@layer base {
  :root {
    /* ─── Base ─────────────────────────────────────────── */
    --background: 0 0% 100%;          /* #FFFFFF */
    --foreground: 222.2 47.4% 11.2%;  /* #0F172A (slate-900) */

    /* ─── Card / Surface ───────────────────────────────── */
    --card: 0 0% 100%;
    --card-foreground: 222.2 47.4% 11.2%;

    /* ─── Popover ──────────────────────────────────────── */
    --popover: 0 0% 100%;
    --popover-foreground: 222.2 47.4% 11.2%;

    /* ─── Primary (Indigo-600: #4F46E5) ────────────────── */
    --primary: 243.4 75.4% 58.6%;
    --primary-foreground: 0 0% 100%;

    /* ─── Secondary (Slate-100: #F1F5F9) ───────────────── */
    --secondary: 210 40% 96.1%;
    --secondary-foreground: 215.4 16.3% 46.9%;

    /* ─── Muted (Slate-100) ────────────────────────────── */
    --muted: 210 40% 96.1%;
    --muted-foreground: 215.4 16.3% 46.9%;

    /* ─── Accent (Violet-600: #7C3AED) ─────────────────── */
    --accent: 263.4 70% 50.4%;
    --accent-foreground: 0 0% 100%;

    /* ─── Destructive (Rose-500: #F43F5E) ──────────────── */
    --destructive: 349.7 89.2% 60.2%;
    --destructive-foreground: 0 0% 100%;

    /* ─── Borders & Inputs ─────────────────────────────── */
    --border: 220 13% 91%;            /* gray-200: #E5E7EB */
    --input: 214.3 31.8% 91.4%;       /* slate-300: #CBD5E1 */
    --ring: 243.4 75.4% 58.6%;        /* indigo-600 */

    /* ─── Border Radius ────────────────────────────────── */
    --radius: 0.5rem;                  /* 8px */

    /* ─── Sidebar ──────────────────────────────────────── */
    --sidebar-background: 222.2 47.4% 11.2%;   /* slate-900 */
    --sidebar-foreground: 210 40% 96.1%;        /* slate-100 */
    --sidebar-border: 217.2 32.6% 17.5%;       /* slate-800 */
    --sidebar-accent: 217.2 32.6% 17.5%;       /* slate-800 */
    --sidebar-accent-foreground: 0 0% 100%;     /* white */
    --sidebar-ring: 243.4 75.4% 58.6%;         /* indigo-600 */

    /* ─── Pipeline Stage Colors ────────────────────────── */
    --pipeline-lead-bg: #F1F5F9;
    --pipeline-lead-text: #475569;
    --pipeline-lead-border: #CBD5E1;
    --pipeline-qualified-bg: #EFF6FF;
    --pipeline-qualified-text: #1D4ED8;
    --pipeline-qualified-border: #BFDBFE;
    --pipeline-proposal-bg: #F5F3FF;
    --pipeline-proposal-text: #6D28D9;
    --pipeline-proposal-border: #C4B5FD;
    --pipeline-negotiation-bg: #FFFBEB;
    --pipeline-negotiation-text: #B45309;
    --pipeline-negotiation-border: #FDE68A;
    --pipeline-won-bg: #ECFDF5;
    --pipeline-won-text: #047857;
    --pipeline-won-border: #A7F3D0;
    --pipeline-lost-bg: #FFF1F2;
    --pipeline-lost-text: #BE123C;
    --pipeline-lost-border: #FECDD3;

    /* ─── Chart Colors ─────────────────────────────────── */
    --chart-1: 243.4 75.4% 58.6%;   /* indigo */
    --chart-2: 263.4 70% 50.4%;     /* violet */
    --chart-3: 160.1 84.1% 39.4%;   /* emerald */
    --chart-4: 37.7 92.1% 50.2%;    /* amber */
    --chart-5: 198.6 88.7% 48.4%;   /* sky */
  }

  .dark {
    /* ─── Base ─────────────────────────────────────────── */
    --background: 222.2 84% 4.9%;     /* #020617 (slate-950) */
    --foreground: 210 40% 96.1%;      /* #F1F5F9 (slate-100) */

    /* ─── Card / Surface ───────────────────────────────── */
    --card: 222.2 47.4% 11.2%;       /* #0F172A (slate-900) */
    --card-foreground: 210 40% 96.1%;

    /* ─── Popover ──────────────────────────────────────── */
    --popover: 222.2 47.4% 11.2%;
    --popover-foreground: 210 40% 96.1%;

    /* ─── Primary (Indigo-400: #818CF8) ────────────────── */
    --primary: 234.5 89.5% 73.9%;
    --primary-foreground: 0 0% 100%;

    /* ─── Secondary (Slate-800: #1E293B) ───────────────── */
    --secondary: 217.2 32.6% 17.5%;
    --secondary-foreground: 215 20.2% 65.1%;

    /* ─── Muted (Slate-800) ────────────────────────────── */
    --muted: 217.2 32.6% 17.5%;
    --muted-foreground: 215 20.2% 65.1%;

    /* ─── Accent (Violet-400) ──────────────────────────── */
    --accent: 270 95.2% 75.3%;
    --accent-foreground: 0 0% 100%;

    /* ─── Destructive (Rose-400) ───────────────────────── */
    --destructive: 351.3 94.5% 71.4%;
    --destructive-foreground: 0 0% 100%;

    /* ─── Borders & Inputs ─────────────────────────────── */
    --border: 217.2 32.6% 17.5%;     /* slate-800 */
    --input: 215.3 25% 26.7%;        /* slate-700 */
    --ring: 234.5 89.5% 73.9%;       /* indigo-400 */

    /* ─── Sidebar ──────────────────────────────────────── */
    --sidebar-background: 222.2 84% 4.9%;      /* slate-950 */
    --sidebar-foreground: 210 40% 96.1%;        /* slate-100 */
    --sidebar-border: 217.2 32.6% 17.5%;       /* slate-800 */
    --sidebar-accent: 217.2 32.6% 17.5%;       /* slate-800 */
    --sidebar-accent-foreground: 0 0% 100%;
    --sidebar-ring: 234.5 89.5% 73.9%;         /* indigo-400 */

    /* ─── Pipeline Stage Colors (Dark) ─────────────────── */
    --pipeline-lead-bg: rgba(148, 163, 184, 0.1);
    --pipeline-lead-text: #CBD5E1;
    --pipeline-lead-border: #334155;
    --pipeline-qualified-bg: rgba(59, 130, 246, 0.1);
    --pipeline-qualified-text: #93C5FD;
    --pipeline-qualified-border: #1E3A5F;
    --pipeline-proposal-bg: rgba(139, 92, 246, 0.1);
    --pipeline-proposal-text: #C4B5FD;
    --pipeline-proposal-border: #3B0764;
    --pipeline-negotiation-bg: rgba(245, 158, 11, 0.1);
    --pipeline-negotiation-text: #FDE68A;
    --pipeline-negotiation-border: #78350F;
    --pipeline-won-bg: rgba(16, 185, 129, 0.1);
    --pipeline-won-text: #6EE7B7;
    --pipeline-won-border: #064E3B;
    --pipeline-lost-bg: rgba(244, 63, 94, 0.1);
    --pipeline-lost-text: #FDA4AF;
    --pipeline-lost-border: #881337;

    /* ─── Chart Colors (Dark) ──────────────────────────── */
    --chart-1: 234.5 89.5% 73.9%;   /* indigo-400 */
    --chart-2: 270 95.2% 75.3%;     /* violet-400 */
    --chart-3: 160.1 84.1% 39.4%;   /* emerald-400 */
    --chart-4: 43.3 96.4% 56.3%;    /* amber-400 */
    --chart-5: 198.6 88.7% 48.4%;   /* sky-400 */
  }
}

@layer base {
  * {
    @apply border-border;
  }

  body {
    @apply bg-background text-foreground antialiased;
    font-feature-settings: "cv02", "cv03", "cv04", "cv11";
  }

  /* Smooth scrolling */
  html {
    scroll-behavior: smooth;
  }

  /* Selection color */
  ::selection {
    @apply bg-indigo-100 text-indigo-900;
  }

  .dark ::selection {
    @apply bg-indigo-900/50 text-indigo-100;
  }

  /* Focus visible styling */
  :focus-visible {
    @apply outline-none ring-2 ring-ring ring-offset-2 ring-offset-background;
  }

  /* Custom scrollbar (webkit) */
  ::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }

  ::-webkit-scrollbar-track {
    background: transparent;
  }

  ::-webkit-scrollbar-thumb {
    @apply bg-slate-300 dark:bg-slate-700 rounded-full;
  }

  ::-webkit-scrollbar-thumb:hover {
    @apply bg-slate-400 dark:bg-slate-600;
  }
}

/* ─── Utility Classes ──────────────────────────────────── */

@layer utilities {
  /* Skeleton loader */
  .skeleton {
    @apply animate-skeleton rounded-md bg-slate-200 dark:bg-slate-800;
  }

  /* Kanban drag states */
  .kanban-dragging {
    @apply shadow-modal rotate-[2deg] scale-[1.02] z-50;
  }

  .kanban-drop-active {
    @apply border-2 border-dashed border-indigo-300 bg-indigo-50/50
           dark:border-indigo-500/50 dark:bg-indigo-500/5;
  }

  /* Card hover lift */
  .card-interactive {
    @apply transition-all duration-moderate;
  }

  .card-interactive:hover {
    @apply shadow-card-hover -translate-y-[1px];
  }

  /* Page enter animation */
  .page-enter {
    @apply animate-slide-in-bottom;
  }

  /* Gradient text */
  .text-gradient {
    @apply bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600
           dark:from-indigo-400 dark:to-violet-400;
  }

  /* Glass effect (for overlays) */
  .glass {
    @apply bg-white/80 backdrop-blur-lg border border-white/20
           dark:bg-slate-900/80 dark:border-slate-800/50;
  }
}
```

---

## Quick Reference: Most Used Patterns

### Page Layout

```tsx
<div className="flex-1 overflow-auto">
  <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-8 xl:px-12 py-6">
    {/* Page header */}
    <div className="flex items-center justify-between mb-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Page Title</h1>
        <p className="mt-1 text-sm text-muted-foreground">Description</p>
      </div>
      <Button>Action</Button>
    </div>
    {/* Content */}
  </div>
</div>
```

### Stat Card

```tsx
<Card>
  <CardContent className="p-6">
    <div className="flex items-center justify-between">
      <p className="text-sm font-medium text-muted-foreground">Label</p>
      <Icon className="h-5 w-5 text-muted-foreground" />
    </div>
    <p className="mt-3 text-2xl font-semibold">$45,231</p>
    <p className="mt-2 text-xs text-emerald-600">+12.5% from last month</p>
  </CardContent>
</Card>
```

### Pipeline Badge

```tsx
<Badge variant={deal.stage}>{deal.stage}</Badge>
```

### Form Field

```tsx
<div className="space-y-1.5">
  <Label htmlFor="name">Name</Label>
  <Input id="name" placeholder="Enter name..." />
  <p className="text-xs text-muted-foreground">Help text here.</p>
</div>
```

---

*This design system is the single source of truth for all visual decisions in Simple CRM. Every component, color, and spacing value should reference this document.*
