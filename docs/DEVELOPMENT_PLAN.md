# Apartment ERP — Development Plan

Phased execution per approved master instructions. **Do not skip phases.**

| Phase | Name | Status |
|-------|------|--------|
| 1 | Project Setup | ✅ Complete |
| 2 | Public Website | ✅ Complete |
| 3 | Resident Dashboard | ✅ Complete |
| 4 | Inspector Dashboard | ✅ Complete |
| 5 | Product Polish | ✅ Complete |
| 6 | Product Enhancement & UX Validation | ✅ Complete |
| 7 | Apartment Admin Portal | ⏳ In design — Phase 7A pending approval |
| 7A | Admin Product Architecture v2 | ⏳ Pending final approval |
| 7B | Admin Operations Dashboard | ⛔ Blocked |
| 7C | Community Explorer + Block + Floor | ⛔ Blocked |
| 7D | Flat Operations Hub | ⛔ Blocked |
| 7E | Bills + Follow-up Queue | ⛔ Blocked |
| 7F | Assets + Services | ⛔ Blocked |
| 7G | Notices + Documents | ⛔ Blocked |
| 7H | Reports + Settings | ⛔ Blocked |
| 8 | Platform Super Admin | ⏳ Not started |
| 8+ | Backend, Auth, Database, Notifications | ⏳ Not started |

Backend (FastAPI, SQLAlchemy, Alembic, JWT) will follow the blueprint in `docs/ARCHITECTURE.md` after frontend phases or in parallel as directed.

## Payment Policy

**No payment gateway integration** (Razorpay, Stripe, UPI, etc.). Residents view dues/history/receipts only. Admins record payments manually in later phases. Architecture supports future gateway addition.

## Phase 1 Deliverables

- [x] Next.js + TypeScript + Tailwind + shadcn/ui initialized
- [x] `src/config/` — app, routes, navigation
- [x] Demo JSON data in `src/data/`
- [x] Types in `src/types/`
- [x] Data access layer in `src/lib/data.ts`
- [x] Public layout (header + footer)
- [x] Unified `DashboardLayout` — sidebar + topbar
- [x] Four role shells: Resident, Inspector, Admin, Platform
- [x] Config-driven navigation (future modules disabled with phase badges)
- [x] Route placeholders — no business modules
- [x] Prior MVP feature components archived in `archive/phase-4-5-preview/` for Phase 4–5

## Folder Structure

```
src/
├── app/
│   ├── (public)/          # Marketing routes
│   ├── resident/          # Resident shell
│   ├── inspector/         # Inspector shell
│   ├── admin/             # Apartment admin shell
│   └── platform/          # Super admin shell
├── config/                # App config, routes, navigation
├── components/
│   ├── layouts/           # DashboardLayout, PublicLayout
│   ├── shared/            # Reusable non-UI helpers
│   └── ui/                # shadcn components
├── data/                  # Demo JSON
├── lib/                   # Utilities, data access
└── types/                 # TypeScript types

archive/                   # Inactive preview code for future phases
```

## Phase 4 Deliverables (Resident)

- [x] Dashboard overview with stats, notices preview, payment summary
- [x] My Flat — flat and owner details
- [x] Family — registered family members
- [x] Payments — history and receipts (view-only)
- [x] Notices — society announcements
- [x] Services — scheduled maintenance
- [x] Profile — resident contact and ownership info
- [x] Navigation enabled for all resident routes

## Phase 5 Deliverables (Inspector)

- [x] Overview — occupancy, financial snapshot, blocks preview
- [x] Blocks & Flats — browse blocks, searchable flats table, flat detail drill-down
- [x] Residents — searchable list across all flats
- [x] Maintenance — collection summary and outstanding dues
- [x] Reports — occupancy and payment breakdown
- [x] Navigation enabled for all inspector routes

## Phase 5 Deliverables (Product Polish)

- [x] Resident dashboard — answers key questions without clicking
- [x] Inspector dashboard — dues, vacant flats, visits, search at a glance
- [x] Information architecture — Dashboard / My home / Community / Maintenance / Account
- [x] Plain-language navigation (Maintenance, Scheduled maintenance, Find residents)
- [x] Inspector search — flat, name, phone, family, maintenance status
- [x] Empty states on all list screens
- [x] Design system tokens (success, warning, danger, cards, typography)
- [x] User journey documentation (`docs/USER_JOURNEYS.md`)

## Phase 6 Deliverables (Product Enhancement)

- [x] Resident dashboard — 10-second answers, today actions, week visits, contacts
- [x] Inspector dashboard — control center with financial snapshot, overdue, notices
- [x] Global inspector search in header (⌘K)
- [x] Search, filter, sort on all list screens
- [x] Receipt download (demo) + print history
- [x] Emergency & committee contacts
- [x] Flat timeline + maintenance history (inspector)
- [x] Design system utilities (surface-card, ListToolbar, EmptyState)
- [x] Demo date anchor for consistent “today/this week”
- [x] Phase 6 report (`docs/PHASE_6_REPORT.md`)

## Phase 7 — Apartment Admin Portal

See [`docs/PHASE_7A_ADMIN_ARCHITECTURE.md`](./PHASE_7A_ADMIN_ARCHITECTURE.md) **v2.0** for complete product architecture (Community Explorer, Block Dashboard, Floor View, Assets, Follow-up Queue).

Sub-phases (each requires approval before next):

- **7A** — Product architecture v2 (design only) — pending final approval
- **7B** — Operations Dashboard (all widgets, follow-up preview)
- **7C** — Community Explorer + Block Dashboard + Floor View
- **7D** — Flat Operations Hub (full source of truth)
- **7E** — Bills + Follow-up Queue
- **7F** — Community Assets + Services
- **7G** — Notices + Documents
- **7H** — Reports (drill-down) + Settings

## Backend — Master Data First

Backend work follows the **data model**, not authentication. See [`docs/MASTER_DATABASE_ARCHITECTURE.md`](./MASTER_DATABASE_ARCHITECTURE.md) for the complete schema (48 tables, all FKs, cascades, indexes, audit, timeline).

| Phase | Name | Status |
|-------|------|--------|
| B1 | Master Database Design | ✅ Approved |
| B2 | Apartment Structure (Apartment → Block → Floor → Flat) | ✅ Complete |
| B3 | People (Person, Owner, Tenant, Family, Staff) | ✅ Complete |
| B4 | Authentication (User → Role → Permission) | ✅ Complete |
| B5 | Finance | ✅ Complete |
| B6 | Communication + Notifications | ✅ Complete |
| B7 | Services & Assets | ✅ Complete |
| B8 | Visitors | ✅ Complete |
| B9 | Complaints | ✅ Complete |
| B10 | Reports & Settings | ✅ Complete |
| B11 | Production | ✅ Complete |

General backend blueprint (API standards, auth strategy): [`docs/ARCHITECTURE.md`](./ARCHITECTURE.md).

## Backend complete

All B1–B11 phases are implemented. Next step: wire the Next.js frontend to `/api/v1` (replace JSON demo data with API calls).
