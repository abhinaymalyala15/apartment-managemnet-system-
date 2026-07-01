# Apartment ERP — Development Plan

Phased execution per approved master instructions. **Do not skip phases.**

| Phase | Name | Status |
|-------|------|--------|
| 1 | Project Setup | ✅ Complete |
| 2 | Authentication | ⏳ Not started |
| 3 | Public Website | ⏳ Not started |
| 4 | Resident Dashboard | ✅ Complete — pending approval |
| 5 | Inspector Dashboard | ✅ Complete — pending approval |
| 6 | Apartment Admin Dashboard | ⏳ Deferred |
| 7 | Platform Super Admin | ⏳ Not started |

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

## Approval Gate

After each phase: summarize completed work, list remaining work, **wait for explicit approval** before starting the next phase.
