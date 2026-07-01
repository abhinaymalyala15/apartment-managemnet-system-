# ApartmentERP

Multi-tenant Apartment ERP Platform — phased frontend development with demo data.

## Stack

- Next.js (App Router) · TypeScript · Tailwind CSS · shadcn/ui
- Backend (planned): FastAPI · SQLAlchemy · Alembic · JWT · SQLite → PostgreSQL

## Current Phase

**Phase 1 — Project Setup** ✅

## Run

```bash
npm install
npm run dev
```

Open http://localhost:3000

## Portal shells

| Role | Route | Demo user |
|------|-------|-----------|
| Resident | `/resident` | Srinivas Malyala · Flat 110 |
| Inspector | `/inspector` | Apartment Inspector |
| Admin | `/admin` | Apartment Administrator |

Demo tenant: **Sylvan Shelter Apartment**, Dilsukhnagar, Hyderabad (55 flats, Block A).

Regenerate data: `npm run generate:data`

## Docs

- `docs/DEVELOPMENT_PLAN.md` — phased execution tracker
- `docs/ARCHITECTURE.md` — backend blueprint
- `docs/DESIGN_RESEARCH.md` — UI competitive research

## Payments

No payment gateway integration. Manual payment recording only (future admin phase).
