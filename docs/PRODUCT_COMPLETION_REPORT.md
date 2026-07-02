# ApartmentERP — Product Completion Report

**Status:** Frontend complete · Backend not started  
**Date:** July 2026  
**Demo tenant:** Sylvan Shelter Apartment (55 flats, Block A)  
**Build:** 192 static/dynamic routes · Next.js 16 · TypeScript · Tailwind · shadcn/ui

---

## Executive Summary

ApartmentERP frontend is **feature-complete** for the approved product scope. All portals (Public, Resident, Inspector, Admin, Platform shell), operational modules (Mission Control, Community Explorer, Flat Operations Hub, Accounting, Communication, Assets, Reports, Configuration), and shared architecture patterns are implemented using JSON demo data.

**Per product directive: backend development must not begin until this report is approved.**

---

## 1. Every Module Implemented

### 1.1 Foundation & Public Website
| Module | Routes | Status |
|--------|--------|--------|
| Project foundation | App shell, theme, navigation, types | ✅ |
| Public home | `/` | ✅ |
| About | `/about` | ✅ |
| Features | `/features` | ✅ |
| Gallery | `/gallery` | ✅ |
| Contact | `/contact` | ✅ |
| Login (demo) | `/login` | ✅ |

### 1.2 Resident Portal — *"My Home"*
| Module | Routes | Status |
|--------|--------|--------|
| Dashboard | `/resident` | ✅ |
| Flat details | `/resident/flat` | ✅ |
| Family | `/resident/family` | ✅ |
| Payments | `/resident/payments` | ✅ |
| Notices | `/resident/notices` | ✅ |
| Services | `/resident/services` | ✅ |
| Timeline | `/resident/timeline` | ✅ |
| Profile | `/resident/profile` | ✅ |

### 1.3 Inspector Portal — *"Monitoring"*
| Module | Routes | Status |
|--------|--------|--------|
| Dashboard | `/inspector` | ✅ |
| Flats | `/inspector/flats`, `/inspector/flats/[flatId]` | ✅ |
| Blocks | `/inspector/blocks`, nested flat drill-down | ✅ |
| Maintenance | `/inspector/maintenance` | ✅ |
| Residents | `/inspector/residents` | ✅ |
| Reports | `/inspector/reports` | ✅ |
| Global search | Inspector quick search | ✅ |

### 1.4 Admin Operations — *"Operations"*
| Module | Routes | Status |
|--------|--------|--------|
| Mission Control (Dashboard) | `/admin` | ✅ |
| Community Explorer | Sidebar + block/floor navigation | ✅ |
| Block Dashboard | `/admin/blocks/[blockId]` | ✅ |
| Floor View | `/admin/blocks/[blockId]/floors/[floor]` | ✅ |
| Flat Operations Hub | `/admin/flats/[flatId]` | ✅ Phase 7D |
| Accounting & Finance | `/admin/finance/*` | ✅ Phase 7E |
| Communication | `/admin/communication/*` | ✅ Phase 7F |
| Assets & Facilities | `/admin/assets/*` | ✅ Phase 7G |
| Reports & Analytics | `/admin/reports/*` | ✅ Phase 7H |
| Apartment Configuration | `/admin/settings/*` | ✅ Phase 7I |
| Documents repository | `/admin/documents/*` | ✅ |
| Residents directory | `/admin/residents` | ✅ |

### 1.5 Platform Shell — *"Business"*
| Module | Routes | Status |
|--------|--------|--------|
| Platform dashboard | `/platform` | ✅ Shell only |
| Apartments registry | `/platform/apartments` | 🔜 Future |
| Users | `/platform/users` | 🔜 Future |
| Reports | `/platform/reports` | 🔜 Future |

### 1.6 Legacy Redirects
| Module | Status |
|--------|--------|
| Structure (legacy) | `/admin/structure` → `/admin/settings/structure` |

---

## 2. Folder Structure

```
apartment/
├── docs/                          # Architecture & product docs
│   ├── PRODUCT_COMPLETION_REPORT.md
│   ├── ARCHITECTURE.md
│   ├── ACCOUNTING_ARCHITECTURE.md
│   ├── COMMUNICATION_ARCHITECTURE.md
│   ├── FACILITY_ARCHITECTURE.md
│   ├── ADMIN_PRODUCT_DESIGN.md
│   ├── DEVELOPMENT_PLAN.md
│   └── USER_JOURNEYS.md
├── src/
│   ├── app/                       # Next.js App Router
│   │   ├── (public)/              # Marketing pages
│   │   ├── admin/                 # Admin operations portal
│   │   │   ├── page.tsx           # Mission Control
│   │   │   ├── blocks/            # Block + floor views
│   │   │   ├── flats/             # Flat Operations Hub
│   │   │   ├── finance/           # Accounting workspace
│   │   │   ├── communication/     # Notices workspace
│   │   │   ├── assets/            # Facility operations
│   │   │   ├── reports/           # Analytics workspace
│   │   │   ├── settings/          # Apartment configuration
│   │   │   └── structure/         # Redirect → settings/structure
│   │   ├── inspector/             # Inspector monitoring portal
│   │   ├── resident/              # Resident "My Home" portal
│   │   ├── platform/              # Platform operator shell
│   │   └── login/
│   ├── components/
│   │   ├── admin/                 # Admin-specific UI
│   │   │   ├── explorer/          # Community Explorer
│   │   │   ├── flat/              # Flat Operations Hub
│   │   │   ├── finance/           # Accounting components
│   │   │   ├── communication/     # Notice management
│   │   │   ├── facility/          # Asset operations
│   │   │   ├── reports/           # Interactive reports
│   │   │   ├── settings/          # Configuration UI
│   │   │   └── widgets/           # Mission Control widgets
│   │   ├── dashboard/             # Shared dashboard primitives
│   │   ├── inspector/             # Inspector portal UI
│   │   ├── resident/              # Resident portal UI
│   │   ├── layouts/               # Shells, sidebar, topbar
│   │   ├── shared/                # Cross-portal shared UI
│   │   └── ui/                    # shadcn/ui primitives
│   ├── config/                    # Module registries & routes
│   ├── data/                      # JSON demo data (32 files)
│   ├── lib/                       # Data access layers
│   └── types/                     # Central TypeScript types
├── public/
├── package.json
└── AGENTS.md
```

---

## 3. Component Structure

### 3.1 Architecture Pattern (Every Admin Module)

```
Module Layout (server)
  ├── Provider (client) — drawer/action state
  ├── Module Nav (client) — tab navigation from *-workspace.ts
  ├── Page content (server) — fetches from *-data.ts
  └── Drawers (client) — workflow actions, demo save banners
```

### 3.2 Component Inventory by Domain

| Domain | Key Components |
|--------|----------------|
| **Explorer** | `CommunityExplorer`, `FlatStatusDot`, `ExplorerProvider` |
| **Flat Ops** | `FlatOperationsHub`, `FlatOpsSection`, `FlatOpsDrawers` |
| **Finance** | `FinanceNav`, `OutstandingQueue`, `PaymentTrendChart`, `BlockFinanceDashboard` |
| **Communication** | `CommunicationDashboard`, `NoticeWorkspace`, `NoticeAdminList` |
| **Assets** | `FacilityDashboard`, `AssetCard`, `AssetTimeline`, `ServiceList`, `AmcWorkspace` |
| **Reports** | `ReportsHub`, `ReportScopeBar`, `ReportDrillTable`, 7 report views |
| **Settings** | `SettingsHub`, `ProfileWorkspace`, `StructureWorkspace`, `TeamWorkspace` |
| **Mission Control** | `AttentionAlertsWidget`, `FollowUpQueueWidget`, `CommunityHealthWidget`, `TodaysOperationsWidget` |
| **Shared** | `StatCard`, `ActivityTimeline`, `OccupancyBar`, `ContactCards`, `EmptyState`, `ListToolbar` |
| **UI** | Button, Sheet, Badge, Input, Card, Tabs, Dropdown, Avatar, Skeleton |

### 3.3 Portal Shells
- `AdminShell` — sidebar + Community Explorer + topbar
- `InspectorShell` — monitoring layout + global search
- `ResidentBottomNav` — mobile-first resident navigation
- `PublicLayout` — marketing site wrapper

---

## 4. Data Architecture

### 4.1 Layering Model

```
UI Components (server + client)
       ↓
Module Data Layer (*-data.ts)     ← finance-data, asset-data, reports-data, etc.
       ↓
Base Data Layer (data.ts)         ← apartment, blocks, flats, payments, notices
       ↓
JSON Files (src/data/*.json)      ← Replace with FastAPI later
```

**Design rule:** UI never imports JSON directly. All access goes through `src/lib/*-data.ts` or `data.ts`.

### 4.2 Data Service Files

| File | Responsibility |
|------|----------------|
| `data.ts` | Core entities: apartment, blocks, flats, residents, payments, notices, committee |
| `admin-data.ts` | Mission Control aggregations, alerts, follow-ups, search |
| `explorer-data.ts` | Community Explorer tree, block dashboards |
| `flat-ops-data.ts` | Flat Operations Hub — owner, tenant, family, timeline, documents |
| `finance-data.ts` | Collections, outstanding queue, block finance, statements |
| `communication-data.ts` | Notices, drafts, scheduled, archived, history |
| `asset-data.ts` | Assets, AMC, vendors, services, documents |
| `reports-data.ts` | Cross-module report aggregations with drill-down scope |
| `settings-data.ts` | Profile, structure, billing config, staff, roles, preferences |
| `resident-context.ts` | Resident portal session context |
| `admin-scale.ts` | Scale tier helpers (20 / 200 / 5000+ flats) |

### 4.3 JSON Data Files (32)

| Category | Files |
|----------|-------|
| Core | `apartment.json`, `blocks.json`, `flats.json`, `owners.json`, `tenants.json`, `family-members.json`, `residents.json` |
| Finance | `payments.json`, `maintenance-summary.json`, `maintenance-config.json`, `follow-ups.json` |
| Communication | `notices.json`, `notice-drafts.json`, `notice-scheduled.json`, `notice-archived.json`, `notice-history.json` |
| Flat CRM | `flat-internal-notes.json`, `flat-communications.json`, `resident-requests.json` |
| Assets | `community-assets.json`, `asset-vendors.json`, `asset-amc.json`, `asset-services.json`, `asset-documents.json`, `asset-internal-notes.json` |
| Settings | `committee-contacts.json`, `staff.json`, `apartment-settings.json` |
| Other | `services.json`, `documents.json`, `gallery.json`, `demo-users.json` |

### 4.4 Module Registries (`src/config/`)

| File | Purpose |
|------|---------|
| `routes.ts` | Central route constants |
| `navigation.ts` | Sidebar config per portal role |
| `accounting-workspace.ts` | Finance nav modules |
| `communication-workspace.ts` | Communication channels |
| `facility-workspace.ts` | Asset categories + nav |
| `reports-workspace.ts` | Report definitions |
| `settings-workspace.ts` | Configuration nav modules |
| `admin-dashboard-widgets.ts` | Mission Control widget registry |
| `theme.ts` | Design tokens |

---

## 5. Reusable Components

These components are **generic and reused** across modules:

| Component | Used In |
|-----------|---------|
| `StatCard` | Admin dashboard, finance, assets, reports, settings |
| `ActivityTimeline` | Flat Ops, asset profile, resident timeline |
| `OccupancyBar` | Reports, inspector, resident |
| `PaymentTrendChart` | Finance dashboard, reports |
| `ReportDrillTable` | All interactive reports |
| `ReportScopeBar` | Drill-down breadcrumb navigation |
| `ListToolbar` | Finance, communication, facility lists |
| `EmptyState` | All list views |
| `ContactCards` | Resident, settings contacts |
| `FlatOpsSection` | Flat Operations Hub sections |
| `AssetCard` / `AssetStatusBadge` | Asset catalog, reports |
| `NoticeAdminList` | Communication workspaces |
| `Sheet` (drawers) | All workflow modules |
| `Badge` | Status indicators everywhere |
| `CommunityExplorer` | Admin shell — hierarchy navigation |

---

## 6. Missing Future Modules

Architecture is **ready**; these are intentionally not implemented:

| Module | Readiness |
|--------|-----------|
| Visitor Management | Nav/widget placeholders, hierarchy hooks |
| Complaint Management | Follow-up pattern exists; no ticket entity |
| Parking Management | Flat has `parkingSlots`; no parking module |
| Facility Booking | Facility workspace registry entry |
| Inventory | Facility future module |
| Purchase Orders | Facility future module |
| Full Accounting (GL) | Finance evolves from billing → accounting |
| Vendor Bills | Asset vendor data exists |
| Work Orders | Asset service pattern exists |
| SMS / WhatsApp / Email | Settings integration registry |
| Push Notifications | Settings integration registry |
| Payment Gateway | Finance payment recording exists |
| Online Payments | Resident payments read-only |
| Auto Billing | Maintenance config + finance pipeline |
| AI Reports | Reports workspace future list |
| Platform Apartments/Users | Platform shell only |

---

## 7. Backend Requirements

### 7.1 Core Platform
- **FastAPI** (recommended) or equivalent async Python API
- **PostgreSQL** primary database
- **Redis** for caching, sessions, job queues
- **S3-compatible storage** for documents, receipts, asset files
- **Celery / ARQ** for async jobs (billing runs, notice sends, report generation)

### 7.2 Functional Requirements
- CRUD for all entities in hierarchy (Platform → Apartment → Block → Floor → Flat → Household)
- Transaction-safe payment recording with receipt generation
- Notice publish pipeline with scheduling and channel dispatch
- Asset service lifecycle with AMC renewal alerts
- Audit log for all admin mutations (settings, finance, communication)
- Full-text search index (apartment, block, flat, owner, tenant, phone)
- Report aggregation endpoints with scope parameters
- Webhook endpoints for payment gateway, SMS, WhatsApp providers

### 7.3 Non-Functional
- API response < 200ms for search and list endpoints at 5000-flat scale
- Pagination/cursor on all list endpoints
- Idempotent payment webhooks
- Rate limiting per tenant
- Structured logging with `apartment_id` context
- OpenAPI spec generated from FastAPI

---

## 8. Database Entities

### 8.1 Platform Layer
```
Platform
├── PlatformUser (super_admin)
├── SubscriptionPlan
└── Apartment (tenant)
```

### 8.2 Apartment Hierarchy
```
Apartment
├── Block
│   └── Floor (derived or explicit)
│       └── Flat
│           ├── Owner (historical)
│           ├── Tenant (historical, lease dates)
│           ├── FamilyMember
│           └── Vehicle (future)
├── CommitteeMember
├── EmergencyContact
├── StaffMember
├── Role / Permission
└── ApartmentSettings
```

### 8.3 Business Modules
```
MaintenanceBill
├── Payment
├── Receipt
└── FollowUp

Notice
├── NoticeDraft
├── NoticeSchedule
└── NoticeDeliveryLog

CommunityAsset
├── AssetAmc
├── AssetService
├── AssetVendor
└── AssetDocument

FlatNote (internal)
FlatCommunication
ResidentRequest

ReportSnapshot (cached aggregates, optional)
AuditLog
```

---

## 9. API Requirements

### 9.1 Authentication & Context
```
POST   /api/v1/auth/login
POST   /api/v1/auth/refresh
GET    /api/v1/auth/me
```

### 9.2 Hierarchy & Search
```
GET    /api/v1/apartments/{id}
GET    /api/v1/apartments/{id}/blocks
GET    /api/v1/blocks/{id}/floors/{n}/flats
GET    /api/v1/flats/{id}                    # Full ops hub payload
GET    /api/v1/search?q=&scope=              # Global search
```

### 9.3 Finance
```
GET    /api/v1/finance/summary?scope=
GET    /api/v1/finance/outstanding?priority=
POST   /api/v1/finance/payments
GET    /api/v1/finance/payments/{id}/receipt
GET    /api/v1/finance/statements/{flatId}
POST   /api/v1/finance/bills/generate        # Auto billing
```

### 9.4 Communication
```
GET    /api/v1/notices?status=
POST   /api/v1/notices
POST   /api/v1/notices/{id}/publish
POST   /api/v1/notices/{id}/schedule
POST   /api/v1/notices/emergency
```

### 9.5 Assets
```
GET    /api/v1/assets?type=&status=
GET    /api/v1/assets/{id}
POST   /api/v1/assets/{id}/services
POST   /api/v1/assets/{id}/amc/renew
```

### 9.6 Reports
```
GET    /api/v1/reports/collection?block=&floor=&flatId=
GET    /api/v1/reports/occupancy?...
GET    /api/v1/reports/financial?...
# Same scope pattern for all report types
```

### 9.7 Settings
```
GET    /api/v1/settings
PATCH  /api/v1/settings/profile
PATCH  /api/v1/settings/maintenance-config
CRUD   /api/v1/settings/committee
CRUD   /api/v1/settings/staff
```

**All list endpoints:** `?page=&limit=&sort=&filter=`  
**All scoped endpoints:** accept `block_id`, `floor`, `flat_id` query params matching frontend `ReportScope`.

---

## 10. Authentication Requirements

### 10.1 Roles (Maps to Frontend)
| Role | Portal | Scope |
|------|--------|-------|
| `resident` | `/resident` | Own flat + household |
| `inspector` | `/inspector` | Apartment read-only monitoring |
| `admin` | `/admin` | Full apartment operations |
| `super_admin` | `/platform` | Multi-apartment management |

### 10.2 Staff Sub-Roles (from settings)
- Office Manager, Accountant, Committee Member, Security Supervisor, Maintenance Staff

### 10.3 Implementation
- JWT access + refresh tokens (or session cookies for web)
- `apartment_id` claim on every token for tenant isolation
- RBAC middleware: `permission` checks on routes
- Resident tokens scoped to `flat_id`
- Inspector: read-only enforcement at API layer
- MFA for admin and platform roles (production)
- Invite flow for staff onboarding

---

## 11. Multi-Tenant Requirements

### 11.1 Tenant Model
- **Tenant = Apartment** (single DB, row-level isolation)
- Every table includes `apartment_id` (except platform-level)
- Platform admin can impersonate apartment admin (audited)

### 11.2 Data Isolation
- Row Level Security (PostgreSQL RLS) recommended
- S3 prefix per apartment: `/{apartment_id}/documents/`
- Search index partitioned by `apartment_id`
- Background jobs tagged with tenant context

### 11.3 Scale Tiers (from `admin-scale.ts`)
| Tier | Flats | Considerations |
|------|-------|------------------|
| Small | 20 | Single block, minimal pagination |
| Medium | 200 | Block-scoped queries, lazy explorer |
| Large | 5000+ | Cursor pagination, cached aggregates, read replicas |

### 11.4 Subscription (SaaS)
- Plans: Starter / Professional / Enterprise
- Feature flags per plan (assets, reports, integrations)
- Usage metering: flats count, SMS sends, storage

---

## 12. Deployment Architecture

```
                    ┌─────────────┐
                    │   CDN/WAF   │
                    └──────┬──────┘
                           │
              ┌────────────┴────────────┐
              │                         │
       ┌──────▼──────┐          ┌─────▼─────┐
       │  Next.js    │          │  FastAPI  │
       │  (Vercel/   │  API     │  (K8s/   │
       │   Node)     ├─────────►│  Railway) │
       └─────────────┘          └─────┬─────┘
                                      │
                    ┌─────────────────┼─────────────────┐
                    │                 │                 │
             ┌──────▼──────┐  ┌───────▼──────┐  ┌──────▼──────┐
             │ PostgreSQL  │  │    Redis     │  │  S3/R2      │
             │  (Primary)  │  │ Cache/Queue  │  │  Storage    │
             └─────────────┘  └──────────────┘  └─────────────┘
```

### Environments
- `development` — local JSON → local API
- `staging` — full stack, demo tenants
- `production` — multi-tenant SaaS

### CI/CD
- Frontend: build + typecheck on PR, deploy preview
- Backend: pytest + migration check, deploy on merge
- Database migrations via Alembic

---

## 13. SaaS Architecture

```
Platform Owner (super_admin)
        │
        ├── Subscription & Billing (Stripe)
        ├── Apartment Provisioning
        └── Platform Analytics
                │
        ┌───────┴───────┐
        │   Apartment   │  ← Tenant boundary
        │   (SaaS unit) │
        └───────┬───────┘
                │
    ┌───────────┼───────────┐
    │           │           │
  Admin     Inspector    Residents
(Operations) (Monitoring) (My Home)
```

### Key SaaS Principles (Implemented in Frontend)
1. **Hierarchy-first** — nothing exists outside Platform → Apartment → Block → Floor → Flat
2. **Module independence** — each workspace has own data layer + config registry
3. **Workflow-first** — drawers and timelines, not CRUD pages
4. **Search-first** — global search in admin and inspector
5. **Scale without redesign** — scope parameters, lazy explorer, pagination-ready lists

---

## 14. Recommended Backend Folder Structure

```
backend/
├── app/
│   ├── main.py
│   ├── core/
│   │   ├── config.py
│   │   ├── security.py          # JWT, RBAC
│   │   ├── database.py
│   │   └── tenancy.py           # apartment_id context
│   ├── models/                  # SQLAlchemy models
│   │   ├── platform.py
│   │   ├── apartment.py
│   │   ├── hierarchy.py         # Block, Flat, Household
│   │   ├── finance.py
│   │   ├── communication.py
│   │   ├── assets.py
│   │   └── settings.py
│   ├── schemas/                 # Pydantic request/response
│   │   └── ...                  # Mirror frontend types
│   ├── api/
│   │   └── v1/
│   │       ├── auth.py
│   │       ├── search.py
│   │       ├── finance.py
│   │       ├── communication.py
│   │       ├── assets.py
│   │       ├── reports.py
│   │       ├── settings.py
│   │       └── flats.py
│   ├── services/                # Business logic
│   │   ├── finance_service.py
│   │   ├── billing_service.py
│   │   ├── notice_service.py
│   │   ├── report_service.py
│   │   └── search_service.py
│   ├── workers/                 # Celery tasks
│   │   ├── billing_jobs.py
│   │   └── notification_jobs.py
│   └── utils/
├── alembic/                     # Migrations
├── tests/
├── pyproject.toml
└── Dockerfile
```

---

## 15. Recommended Database Schema

### Core Tables (Abbreviated)

```sql
-- Platform
CREATE TABLE platform_users (
  id UUID PRIMARY KEY,
  email VARCHAR UNIQUE NOT NULL,
  password_hash VARCHAR NOT NULL,
  role VARCHAR DEFAULT 'super_admin',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Tenant root
CREATE TABLE apartments (
  id UUID PRIMARY KEY,
  name VARCHAR NOT NULL,
  slug VARCHAR UNIQUE NOT NULL,
  address TEXT,
  city VARCHAR,
  state VARCHAR,
  pincode VARCHAR,
  phone VARCHAR,
  email VARCHAR,
  registration_number VARCHAR,
  subscription_plan VARCHAR DEFAULT 'starter',
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE blocks (
  id UUID PRIMARY KEY,
  apartment_id UUID REFERENCES apartments(id),
  name VARCHAR NOT NULL,
  code VARCHAR NOT NULL,
  floor_count INT NOT NULL,
  description TEXT,
  UNIQUE(apartment_id, code)
);

CREATE TABLE flats (
  id UUID PRIMARY KEY,
  apartment_id UUID REFERENCES apartments(id),
  block_id UUID REFERENCES blocks(id),
  flat_number VARCHAR NOT NULL,
  floor INT NOT NULL,
  area_sqft DECIMAL,
  bedrooms INT,
  flat_type VARCHAR,
  parking_slots INT DEFAULT 0,
  occupancy_status VARCHAR DEFAULT 'vacant',
  UNIQUE(block_id, flat_number)
);

CREATE TABLE owners (
  id UUID PRIMARY KEY,
  flat_id UUID REFERENCES flats(id),
  full_name VARCHAR NOT NULL,
  phone VARCHAR,
  email VARCHAR,
  ownership_start_date DATE,
  is_primary BOOLEAN DEFAULT true
);

CREATE TABLE tenants (
  id UUID PRIMARY KEY,
  flat_id UUID REFERENCES flats(id),
  full_name VARCHAR NOT NULL,
  phone VARCHAR,
  email VARCHAR,
  lease_start_date DATE,
  lease_end_date DATE,
  is_active BOOLEAN DEFAULT true
);

CREATE TABLE payments (
  id UUID PRIMARY KEY,
  apartment_id UUID REFERENCES apartments(id),
  flat_id UUID REFERENCES flats(id),
  amount DECIMAL NOT NULL,
  status VARCHAR NOT NULL, -- paid, pending, overdue
  due_date DATE,
  paid_date DATE,
  period VARCHAR,
  receipt_number VARCHAR,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE notices (
  id UUID PRIMARY KEY,
  apartment_id UUID REFERENCES apartments(id),
  title VARCHAR NOT NULL,
  content TEXT,
  category VARCHAR,
  status VARCHAR DEFAULT 'draft',
  is_emergency BOOLEAN DEFAULT false,
  published_at TIMESTAMPTZ,
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE community_assets (
  id UUID PRIMARY KEY,
  apartment_id UUID REFERENCES apartments(id),
  block_id UUID REFERENCES blocks(id),
  name VARCHAR NOT NULL,
  asset_type VARCHAR NOT NULL,
  scope VARCHAR DEFAULT 'community',
  vendor_id UUID,
  status VARCHAR,
  amc_expiry_date DATE,
  next_service_date DATE
);

CREATE TABLE staff_members (
  id UUID PRIMARY KEY,
  apartment_id UUID REFERENCES apartments(id),
  full_name VARCHAR NOT NULL,
  role_id VARCHAR NOT NULL,
  phone VARCHAR,
  email VARCHAR,
  department VARCHAR,
  block_ids UUID[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT true
);

CREATE TABLE audit_logs (
  id UUID PRIMARY KEY,
  apartment_id UUID REFERENCES apartments(id),
  user_id UUID,
  action VARCHAR NOT NULL,
  entity_type VARCHAR,
  entity_id UUID,
  payload JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS example
ALTER TABLE flats ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON flats
  USING (apartment_id = current_setting('app.apartment_id')::uuid);
```

### Indexing Strategy
```sql
CREATE INDEX idx_flats_apartment ON flats(apartment_id);
CREATE INDEX idx_flats_block_floor ON flats(block_id, floor);
CREATE INDEX idx_payments_flat_status ON payments(flat_id, status);
CREATE INDEX idx_payments_apartment_due ON payments(apartment_id, due_date);
CREATE INDEX idx_notices_apartment_status ON notices(apartment_id, status);
CREATE INDEX idx_search_residents ON owners USING gin(to_tsvector('english', full_name || ' ' || phone));
```

---

## Appendix A: Route Count Summary

| Portal | Routes |
|--------|--------|
| Public | 6 |
| Resident | 8 |
| Inspector | ~65 (incl. 55 flat SSG) |
| Admin | ~100+ |
| Platform | 1 |
| **Total** | **187** |

## Appendix B: Frontend → Backend Migration Path

1. Replace `import json from '@/data/...'` in `data.ts` with `fetch('/api/v1/...')`
2. Keep `*-data.ts` function signatures unchanged
3. Add React Query / SWR for client-side caching where needed
4. Server Components continue calling data layer directly
5. Drawers POST to API instead of demo banners

## Appendix C: Approval Checklist

- [ ] Product owner reviews module completeness (Section 1)
- [ ] Engineering reviews API + schema (Sections 9, 15)
- [ ] Security reviews auth + multi-tenant (Sections 10, 11)
- [ ] DevOps reviews deployment (Section 12)
- [ ] **Explicit approval to begin backend development**

---

*Generated at frontend completion milestone. Backend work is blocked pending approval of this report.*
