# Apartment ERP Platform — Backend Architecture Blueprint

**Version:** 1.0  
**Phase:** 1 — Backend Planning (Planning Only — No Implementation)  
**Status:** Pending Approval  
**Stack:** FastAPI · Python · SQLAlchemy 2.x · Pydantic · SQLite (dev) · PostgreSQL (prod) · Alembic · JWT · RBAC

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Architectural Decisions & Recommendations](#2-architectural-decisions--recommendations)
3. [Overall System Architecture](#3-overall-system-architecture)
4. [User Hierarchy & Role Model](#4-user-hierarchy--role-model)
5. [Multi-Tenancy Design](#5-multi-tenancy-design)
6. [Authentication Architecture](#6-authentication-architecture)
7. [Permission Strategy](#7-permission-strategy)
8. [Module Architecture](#8-module-architecture)
9. [Folder Structure](#9-folder-structure)
10. [Database Design](#10-database-design)
11. [Entity Relationships](#11-entity-relationships)
12. [Naming Conventions](#12-naming-conventions)
13. [API Standards](#13-api-standards)
14. [Error Handling Strategy](#14-error-handling-strategy)
15. [Logging Strategy](#15-logging-strategy)
16. [Validation Strategy](#16-validation-strategy)
17. [Configuration Management](#17-configuration-management)
18. [Dependency Management](#18-dependency-management)
19. [Security Considerations](#19-security-considerations)
20. [Scalability Considerations](#20-scalability-considerations)
21. [Future Module Integration Strategy](#21-future-module-integration-strategy)
22. [Phase 2 Implementation Roadmap](#22-phase-2-implementation-roadmap)
23. [Open Questions for Approval](#23-open-questions-for-approval)

---

## 1. Executive Summary

We are building a **commercial multi-tenant SaaS Apartment ERP Platform** — a single codebase serving unlimited independent apartment communities with strict data isolation.

This document is the authoritative backend blueprint. No implementation code, migrations, or API handlers should be written until this document is reviewed and approved.

### Key Recommendations

| Decision Area | Recommendation |
|---------------|----------------|
| Multi-tenancy | **Shared database + `apartment_id` row-level isolation** |
| Authentication | **JWT access token + rotating refresh token (server-stored)** |
| User identity | **Single `users` table + `apartment_memberships` for tenant roles** |
| Person vs User | **Separate domain entities (Owner, Tenant, Family) from login identity (`User`)** |
| API style | **REST, versioned (`/api/v1`), resource-oriented** |
| Tenant context | **Derived from JWT + membership — never trusted from request body alone** |

---

## 2. Architectural Decisions & Recommendations

### 2.1 Multi-Tenancy: Option Comparison

#### Option A — Shared Database + `apartment_id` (Row-Level Tenancy)

Every tenant-scoped table includes a non-nullable `apartment_id` foreign key. All queries are scoped to the authenticated user's apartment.

| Advantages | Disadvantages |
|------------|---------------|
| Single database — simple operations, backups, monitoring | Risk of cross-tenant leakage if a query omits the tenant filter |
| One migration path (Alembic) for all tenants | Requires strict engineering discipline across all layers |
| Works identically on SQLite (dev) and PostgreSQL (prod) | Noisy-neighbor risk at extreme scale (mitigated by indexing, connection pooling, read replicas) |
| Cost-effective at hundreds/thousands of tenants | Per-tenant backup/restore is row-filtered, not physical isolation |
| Platform Super Admin can run cross-tenant analytics with explicit, audited queries | |
| Industry-proven pattern (Basecamp, early Stripe, most B2B SaaS) | |
| Horizontal API scaling is straightforward (stateless) | |

#### Option B — Separate Database per Apartment

Each apartment gets its own physical database.

| Advantages | Disadvantages |
|------------|---------------|
| Strongest physical isolation | Operational complexity explodes at scale (1000 DBs = 1000 migration runs) |
| Per-tenant backup/restore is trivial | Connection pool exhaustion — each DB needs connections |
| No cross-tenant query accidents | Provisioning/deprovisioning automation required from day one |
| Regulatory "data residency per DB" possible | Cross-tenant platform analytics require federated queries |
| | Expensive infrastructure |
| | Poor fit for SQLite-as-dev (can't mirror prod topology locally) |
| | Overkill unless selling enterprise "dedicated instance" tiers |

#### Option C — Separate Schema per Apartment

Single database, one PostgreSQL schema per tenant (`apartment_123.flats`).

| Advantages | Disadvantages |
|------------|---------------|
| Better isolation than shared tables | **SQLite does not support schemas** — dev/prod parity breaks |
| Single connection pool to one DB | Dynamic schema switching (`search_path`) adds complexity |
| Per-tenant logical separation | Alembic must migrate N schemas — slow and fragile at scale |
| | ORM session management becomes error-prone |
| | Schema proliferation (thousands of schemas) degrades PostgreSQL catalog performance |
| | Middle ground that inherits disadvantages of both other approaches |

#### Recommendation: **Option A — Shared Database + `apartment_id`**

**Why this is the best choice for this product:**

1. **Scale target alignment** — Hundreds to thousands of small-to-medium apartments is exactly where row-level tenancy excels. Products like ApartmentADDA serve communities of varying sizes on shared infrastructure.

2. **Dev/prod parity** — SQLite and PostgreSQL both handle single-schema, FK-based row isolation identically. Schema-per-tenant fails this requirement.

3. **Operational simplicity** — One Alembic migration deploys to all tenants simultaneously. At 500 apartments, separate-DB means 500 migration executions per release.

4. **Super Admin needs** — Platform operators need to list apartments, onboard tenants, and eventually run billing/analytics. Shared DB makes this natural with audited bypass.

5. **Future premium tier** — If an enterprise customer later demands dedicated isolation, Option B can be offered as a **premium "dedicated database" tier** without changing the default architecture. Design the repository layer with a `TenantContext` abstraction so the data access interface doesn't leak the strategy.

**Defense-in-depth for Option A:**

```
Layer 1: JWT carries apartment_id (for tenant users) — set at login from membership
Layer 2: FastAPI dependency injects TenantContext into every tenant-scoped route
Layer 3: Repository base class enforces apartment_id filter on ALL queries
Layer 4: SQLAlchemy event listener (optional) auto-injects WHERE apartment_id = :ctx
Layer 5: PostgreSQL Row-Level Security (RLS) policies in production (Phase 2+ hardening)
Layer 6: Integration tests that assert cross-tenant access always returns 403/404
```

---

### 2.2 Authentication: Option Comparison

#### Option A — JWT Only

Single long-lived or short-lived JWT used for all requests.

| Advantages | Disadvantages |
|------------|---------------|
| Simple implementation | Cannot revoke without a blacklist (defeats stateless benefit) |
| Stateless — scales horizontally | Long-lived tokens = stolen token window is large |
| | Short-lived tokens = terrible UX (constant re-login) |
| | No secure logout (token valid until expiry) |

#### Option B — JWT Access Token + Refresh Token (Recommended)

Short-lived access JWT (5–15 min) + long-lived refresh token (7–30 days) stored server-side.

| Advantages | Disadvantages |
|------------|---------------|
| Access tokens are short-lived — limited blast radius | More moving parts than JWT-only |
| Refresh tokens can be revoked server-side (logout, compromise) | Requires `refresh_tokens` table |
| Refresh token rotation detects token theft | Must handle concurrent refresh carefully |
| Stateless API validation for 99% of requests (access JWT) | |
| Works for future mobile app (refresh in secure storage) | |
| Industry standard for commercial SaaS | |

#### Option C — Session-Based (Server-Side Sessions)

Session ID in httpOnly cookie, session data in Redis/DB.

| Advantages | Disadvantages |
|------------|---------------|
| Instant revocation | Stateful — every request hits session store (or Redis) |
| Simple mental model for web-only apps | Horizontal scaling requires shared session store |
| | Awkward for mobile apps and third-party API consumers |
| | CSRF protection required for cookie-based sessions |

#### Recommendation: **Option B — JWT Access + Rotating Refresh Token**

**Why:**

1. **Commercial SaaS standard** — This is what production SaaS products use (Slack, Notion, etc.). It balances security and UX.

2. **Future mobile app** — Access token in memory, refresh token in device secure storage. Session cookies don't translate cleanly.

3. **Logout actually works** — Revoke the refresh token record. Access token expires naturally within minutes.

4. **Token theft detection** — Refresh token rotation: if a used refresh token is presented again, revoke the entire token family (indicates theft).

5. **Role/tenant claims in access JWT** — API middleware validates JWT signature + expiry without DB hit. Only refresh and login hit the DB.

**Proposed token lifecycle:**

```
Login → Validate credentials → Issue access JWT (15 min) + refresh token (30 days, opaque, stored in DB)
API request → Authorization: Bearer <access_jwt> → Validate signature + expiry + claims
Access expired → POST /auth/refresh with refresh token → Rotate refresh → New access JWT
Logout → Revoke refresh token in DB → Client discards access JWT
Password change → Revoke ALL refresh tokens for user
```

**Access JWT claims (minimal — do not bloat):**

```json
{
  "sub": "user-uuid",
  "type": "access",
  "platform_role": null,
  "apartment_id": "apt-uuid",
  "membership_role": "admin",
  "iat": 1234567890,
  "exp": 1234568790
}
```

For Super Admin, `platform_role: "super_admin"` and `apartment_id: null`.

**Important design note:** A user may eventually belong to multiple apartments (e.g., committee member in two societies). The JWT should carry the **active apartment context**, not all memberships. Apartment switching = new token issuance after validating membership. Design for this now even if MVP assumes one membership per user.

---

### 2.3 Challenge to Consider: Separate Platform Users vs Unified Users Table

**Your hierarchy implies two distinct user populations:** Super Admin (platform) and apartment users (admin, inspector, resident).

**Option 1 — Two tables:** `platform_users` + `apartment_users`  
**Option 2 — One table:** `users` + `platform_roles` + `apartment_memberships`

**Recommendation: Option 2 (unified `users` + membership tables)**

| Reason | Explanation |
|--------|-------------|
| Future multi-apartment membership | Same person, one login, multiple apartments |
| Single auth flow | One login endpoint, one password reset flow |
| Self-service onboarding later | New apartment signup creates apartment + admin membership in one transaction |
| Security separation maintained | Super Admin checked via `platform_roles`, never mixed into apartment RBAC |

Super Admin accounts MUST be created only via seed script or existing Super Admin — never self-registration.

---

## 3. Overall System Architecture

### 3.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         CLIENTS (Future)                          │
│              Web App · Mobile App · Apartment Website               │
└──────────────────────────────┬──────────────────────────────────────┘
                               │ HTTPS
┌──────────────────────────────▼──────────────────────────────────────┐
│                      API GATEWAY LAYER (Future)                     │
│                   Rate Limiting · WAF · TLS Termination             │
└──────────────────────────────┬──────────────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────────────┐
│                     FastAPI Application (Monolith)                  │
│  ┌─────────────┐  ┌──────────────┐  ┌───────────────────────────┐   │
│  │ Middleware   │  │ Dependencies │  │ API Routers (v1)        │   │
│  │ - CORS       │  │ - Auth       │  │ - /platform/*           │   │
│  │ - Request ID │  │ - Tenant Ctx │  │ - /apartments/{id}/*    │   │
│  │ - Logging    │  │ - RBAC       │  │ - /auth/*               │   │
│  └─────────────┘  └──────────────┘  └───────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                      SERVICE LAYER                           │   │
│  │  Business logic · Orchestration · Validation rules           │   │
│  └──────────────────────────┬──────────────────────────────────┘   │
│  ┌──────────────────────────▼──────────────────────────────────┐   │
│  │                    REPOSITORY LAYER                          │   │
│  │  Data access · Tenant-scoped queries · Transactions          │   │
│  └──────────────────────────┬──────────────────────────────────┘   │
│  ┌──────────────────────────▼──────────────────────────────────┐   │
│  │              SQLAlchemy Models + Pydantic Schemas             │   │
│  └──────────────────────────┬──────────────────────────────────┘   │
└─────────────────────────────┼───────────────────────────────────────┘
                              │
┌─────────────────────────────▼───────────────────────────────────────┐
│                    SQLite (dev) / PostgreSQL (prod)                   │
└─────────────────────────────────────────────────────────────────────┘
```

### 3.2 Architectural Style

**Modular Monolith** — not microservices.

| Why monolith now | When to split |
|------------------|---------------|
| Single team, Phase 2 scope is manageable | Independent scaling needs per module (e.g., notification service) |
| Simpler deployment and debugging | Team grows beyond 8–10 engineers |
| Shared transactions across entities (onboarding creates apartment + admin + blocks) | Specific modules need different runtimes |
| Premature microservices add network complexity without benefit | |

The monolith is **internally modular** — each domain module (auth, apartments, residents, etc.) is a self-contained package with its own routes, services, repositories, models, and schemas. Extraction to a microservice later means moving a folder, not rewriting logic.

### 3.3 Request Flow (Tenant-Scoped Request)

```
1. Request arrives with Authorization: Bearer <access_jwt>
2. Auth middleware decodes JWT → extracts user_id, apartment_id, roles
3. TenantContext dependency created → apartment_id from JWT (NOT from URL/body)
4. RBAC dependency checks required permission for route
5. Route handler calls Service
6. Service calls Repository (passes TenantContext)
7. Repository adds WHERE apartment_id = :ctx.apartment_id to every query
8. Response serialized via Pydantic schema → returned
```

### 3.4 Request Flow (Super Admin Request)

```
1. JWT has platform_role = "super_admin", apartment_id = null
2. Platform routes (/api/v1/platform/*) do NOT require apartment_id
3. When Super Admin acts on a specific apartment, apartment_id comes from URL path
4. Explicit audit log entry for every cross-tenant operation
```

---

## 4. User Hierarchy & Role Model

### 4.1 Hierarchy

```
Platform
└── Super Admin                    [platform_role: super_admin]
    └── Apartment (Tenant)
        ├── Apartment Admin        [membership_role: admin]
        ├── Inspector              [membership_role: inspector]
        └── Resident               [membership_role: resident]
```

### 4.2 Role Definitions

| Role | Scope | Capabilities (Phase 2) |
|------|-------|------------------------|
| **Super Admin** | Platform | Create/manage apartments, assign first admin, platform config, view apartment list |
| **Apartment Admin** | Single apartment | Full CRUD on all apartment data: blocks, flats, users, owners, tenants, family |
| **Inspector** | Single apartment | Read-only access to all apartment data across all flats |
| **Resident** | Single apartment, own flat | Read-only access to own flat, family, dues (future), notices (future) |

### 4.3 Important Distinctions

| Concept | Description |
|---------|-------------|
| **User** | Authentication identity — email, password, login capability |
| **Apartment Membership** | Links a User to an Apartment with a role |
| **Owner** | Domain entity — legal owner of a flat. May or may not have a User account |
| **Tenant** | Domain entity — person renting a flat. May or may not have a User account |
| **Resident (role)** | A User with `membership_role = resident`, linked to a specific flat |
| **Family Member** | Domain entity — person associated with a flat. Typically no login |

**Design principle:** Not every Owner/Tenant/Family Member is a User. Only people who need to log in get a User record. Admin creates User + Membership + links to domain entity when login is needed.

---

## 5. Multi-Tenancy Design

### 5.1 Tenant Entity: `apartments`

The apartment is the tenant root. Everything tenant-scoped hangs off `apartments.id`.

### 5.2 Tenant Context Object

```python
# Conceptual — not implementation
@dataclass
class TenantContext:
    apartment_id: UUID
    user_id: UUID
    role: MembershipRole  # admin | inspector | resident

@dataclass
class PlatformContext:
    user_id: UUID
    platform_role: PlatformRole  # super_admin
```

### 5.3 Tenant Scoping Rules

| Rule | Detail |
|------|--------|
| All tenant tables have `apartment_id` | NOT NULL, indexed, FK to `apartments.id` |
| `apartment_id` never from client body | Always from JWT TenantContext or URL path (validated against JWT) |
| Super Admin bypass | Explicit — uses platform routes, not tenant middleware |
| Soft delete | Apartments soft-deleted (`deleted_at`), data retained for compliance |
| Slug/subdomain (future) | `apartments.slug` for website URLs — unique across platform |

### 5.4 Future Self-Service Onboarding

Architecture supports this without changes:

```
POST /api/v1/platform/apartments (Super Admin today)
POST /api/v1/onboarding/register (future — creates apartment + admin user + membership in one transaction)
```

The onboarding service orchestrates the same entities Super Admin creates manually.

---

## 6. Authentication Architecture

### 6.1 Endpoints (Phase 2)

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| POST | `/api/v1/auth/login` | Email + password → tokens | Public |
| POST | `/api/v1/auth/refresh` | Refresh token → new token pair | Public (token itself) |
| POST | `/api/v1/auth/logout` | Revoke refresh token | Authenticated |
| POST | `/api/v1/auth/change-password` | Change password, revoke all sessions | Authenticated |
| GET | `/api/v1/auth/me` | Current user profile + memberships | Authenticated |

### 6.2 Password Security

| Setting | Value |
|---------|-------|
| Hashing algorithm | **bcrypt** (via `passlib`) — argon2 optional upgrade later |
| Minimum password length | 8 characters (recommend 12 for admin accounts) |
| Password reset | Phase 2+: email-based token flow |

### 6.3 Token Storage

| Token | Client Storage | Server Storage |
|-------|---------------|----------------|
| Access JWT | Memory (JS variable) / Authorization header | Not stored (stateless) |
| Refresh token | httpOnly Secure SameSite cookie (web) / secure storage (mobile) | `refresh_tokens` table — hashed token value |

**Never store refresh tokens in localStorage** — XSS vulnerability.

### 6.4 Account Security

- Account lockout after N failed login attempts (e.g., 5 in 15 minutes)
- `is_active` flag on users — deactivated users cannot authenticate
- `is_active` flag on memberships — deactivated membership blocks apartment access
- All auth events logged (login success/failure, refresh, logout, password change)

---

## 7. Permission Strategy

### 7.1 RBAC Model

**Two-layer role system:**

```
Platform Layer:  platform_roles (super_admin)
Tenant Layer:    apartment_memberships.role (admin | inspector | resident)
```

### 7.2 Permission Matrix (Phase 2)

| Resource | Super Admin | Admin | Inspector | Resident |
|----------|:-----------:|:-----:|:---------:|:--------:|
| Apartments (CRUD) | ✅ | ❌ | ❌ | ❌ |
| Blocks | ✅ (via platform) | ✅ | Read | ❌ |
| Flats | ✅ | ✅ | Read | Own flat only |
| Users/Memberships | ✅ | ✅ | ❌ | Own profile |
| Owners | ✅ | ✅ | Read | Own flat |
| Tenants | ✅ | ✅ | Read | Own flat |
| Family Members | ✅ | ✅ | Read | Own flat |
| Platform settings | ✅ | ❌ | ❌ | ❌ |

### 7.3 Implementation Pattern

```python
# Conceptual permission check via FastAPI dependencies
@router.get("/flats/{flat_id}")
async def get_flat(
    flat_id: UUID,
    ctx: TenantContext = Depends(require_role(ADMIN, INSPECTOR, RESIDENT)),
    ...
):
    # Service layer enforces resident can only see own flat
```

**Three enforcement levels:**

1. **Route level** — `require_role()` dependency blocks unauthorized roles (403)
2. **Service level** — Business rules (e.g., resident can only access own flat_id)
3. **Repository level** — `apartment_id` filter on every query (prevents data leakage)

### 7.4 Future: Fine-Grained Permissions

When modules grow, introduce a `permissions` table and `role_permissions` mapping without changing the membership model. Inspector might later get selective write access to specific modules. Design the `require_role` dependency to evolve into `require_permission("maintenance:read")` without breaking existing routes.

---

## 8. Module Architecture

### 8.1 Module List (Phase 2)

| Module | Responsibility |
|--------|---------------|
| `core` | Config, security, exceptions, logging, base classes |
| `db` | Session management, base model, tenant scoping utilities |
| `auth` | Login, refresh, logout, token management |
| `platform` | Super Admin operations — apartment CRUD, onboarding |
| `apartments` | Apartment settings, configuration |
| `structure` | Blocks and Flats |
| `users` | User accounts, memberships |
| `residents` | Resident profiles linked to flats |
| `owners` | Owner records linked to flats |
| `tenants` | Tenant records linked to flats |
| `family` | Family member records linked to flats |

### 8.2 Module Internal Structure

Each module follows the same internal layout:

```
module_name/
├── __init__.py
├── router.py        # FastAPI route definitions (thin)
├── service.py       # Business logic
├── repository.py    # Data access (tenant-scoped)
├── models.py        # SQLAlchemy models (or import from models/)
├── schemas.py       # Pydantic request/response schemas
├── dependencies.py  # Module-specific FastAPI dependencies
├── exceptions.py    # Module-specific exceptions (optional)
└── constants.py     # Module enums and constants (optional)
```

### 8.3 Module Communication Rules

| Rule | Detail |
|------|--------|
| Routes → Service only | Routes never call repositories directly |
| Service → Repository only | Services never construct raw SQL |
| Cross-module calls | Service-to-Service only, never Repository-to-Repository across modules |
| Shared utilities | Live in `core/` or `utils/`, not duplicated |
| No circular imports | If Module A needs Module B, B's service is imported — not B's repository |

---

## 9. Folder Structure

```
apartment-erp/
├── alembic/                          # Database migrations
│   ├── versions/
│   ├── env.py
│   └── alembic.ini
├── app/
│   ├── __init__.py
│   ├── main.py                       # FastAPI app factory, lifespan, router mounting
│   │
│   ├── core/                         # Cross-cutting concerns
│   │   ├── __init__.py
│   │   ├── config.py                 # Settings via pydantic-settings
│   │   ├── security.py               # Password hashing, JWT encode/decode
│   │   ├── exceptions.py             # Base exceptions + handlers
│   │   ├── logging.py                # Structured logging setup
│   │   ├── dependencies.py           # Shared FastAPI dependencies
│   │   └── constants.py              # Global enums (roles, statuses)
│   │
│   ├── db/                           # Database layer
│   │   ├── __init__.py
│   │   ├── base.py                   # DeclarativeBase, mixins (Timestamp, SoftDelete)
│   │   ├── session.py                # Engine, session factory, get_db dependency
│   │   └── tenant.py                 # TenantContext, tenant-scoped query helpers
│   │
│   ├── models/                       # SQLAlchemy models (all modules)
│   │   ├── __init__.py
│   │   ├── user.py
│   │   ├── apartment.py
│   │   ├── structure.py              # Block, Flat
│   │   ├── membership.py
│   │   ├── owner.py
│   │   ├── tenant.py
│   │   ├── family.py
│   │   └── auth.py                   # RefreshToken
│   │
│   ├── schemas/                      # Pydantic schemas (all modules)
│   │   ├── __init__.py
│   │   ├── common.py                 # Pagination, error response, base schemas
│   │   ├── auth.py
│   │   ├── apartment.py
│   │   ├── structure.py
│   │   ├── user.py
│   │   ├── owner.py
│   │   ├── tenant.py
│   │   └── family.py
│   │
│   ├── api/                          # API route aggregation
│   │   ├── __init__.py
│   │   └── v1/
│   │       ├── __init__.py
│   │       ├── router.py             # Mounts all v1 routers
│   │       ├── auth.py
│   │       ├── platform.py           # Super Admin routes
│   │       └── apartment/            # Tenant-scoped routes
│   │           ├── __init__.py
│   │           ├── blocks.py
│   │           ├── flats.py
│   │           ├── users.py
│   │           ├── owners.py
│   │           ├── tenants.py
│   │           └── family.py
│   │
│   ├── services/                     # Business logic (all modules)
│   │   ├── __init__.py
│   │   ├── auth_service.py
│   │   ├── platform_service.py
│   │   ├── apartment_service.py
│   │   ├── structure_service.py
│   │   ├── user_service.py
│   │   ├── owner_service.py
│   │   ├── tenant_service.py
│   │   └── family_service.py
│   │
│   ├── repositories/                 # Data access (all modules)
│   │   ├── __init__.py
│   │   ├── base.py                   # TenantScopedRepository base class
│   │   ├── auth_repository.py
│   │   ├── apartment_repository.py
│   │   ├── structure_repository.py
│   │   ├── user_repository.py
│   │   ├── owner_repository.py
│   │   ├── tenant_repository.py
│   │   └── family_repository.py
│   │
│   ├── middleware/                    # HTTP middleware
│   │   ├── __init__.py
│   │   ├── request_id.py
│   │   └── logging.py
│   │
│   └── utils/                        # Pure utility functions
│       ├── __init__.py
│       └── pagination.py
│
├── tests/
│   ├── conftest.py                   # Fixtures: test DB, test client, auth helpers
│   ├── unit/
│   │   ├── test_services/
│   │   └── test_repositories/
│   ├── integration/
│   │   ├── test_auth/
│   │   ├── test_platform/
│   │   ├── test_structure/
│   │   └── test_tenant_isolation.py  # CRITICAL: cross-tenant access tests
│   └── factories/                    # Test data factories
│       └── ...
│
├── scripts/
│   └── seed_super_admin.py           # Initial Super Admin creation
│
├── docs/
│   └── ARCHITECTURE.md               # This document
│
├── .env.example
├── .gitignore
├── pyproject.toml                    # Dependencies + tool config
├── README.md
└── Makefile                          # Common commands (run, test, migrate)
```

**Note on models/schemas location:** For Phase 2, centralized `models/` and `schemas/` directories keep imports simple. When modules grow beyond ~15, split into per-module packages (`app/modules/auth/models.py`). The repository and service layers are already per-module.

---

## 10. Database Design

### 10.1 Design Principles

| Principle | Implementation |
|-----------|---------------|
| UUID primary keys | `UUID` type — no sequential ID leakage across tenants |
| Timestamps on every table | `created_at`, `updated_at` (UTC) |
| Soft delete where appropriate | `deleted_at` nullable timestamp |
| Foreign keys with constraints | ON DELETE RESTRICT for core entities, CASCADE for children |
| Indexes on FK columns | Every `apartment_id`, `flat_id`, etc. |
| Composite unique constraints | `UNIQUE(apartment_id, block_code)`, `UNIQUE(apartment_id, email)` for memberships |
| No SQLite-specific features | No AUTOINCREMENT reliance, use UUIDs |
| Normalized to 3NF | No redundant data; use joins |
| PostgreSQL-ready types | Use `UUID`, `DateTime(timezone=True)`, `String`, `Boolean`, `Numeric` |

### 10.2 Base Mixins

```
TimestampMixin:  created_at, updated_at
SoftDeleteMixin: deleted_at (nullable)
TenantMixin:     apartment_id (FK, NOT NULL, indexed)
```

### 10.3 Table Definitions

#### `users` (Platform-wide identity)

| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| email | VARCHAR(255) | UNIQUE, NOT NULL |
| password_hash | VARCHAR(255) | NOT NULL |
| full_name | VARCHAR(255) | NOT NULL |
| phone | VARCHAR(20) | NULLABLE |
| is_active | BOOLEAN | DEFAULT true |
| created_at | TIMESTAMPTZ | NOT NULL |
| updated_at | TIMESTAMPTZ | NOT NULL |

#### `platform_roles`

| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| user_id | UUID | FK → users.id, UNIQUE |
| role | VARCHAR(50) | NOT NULL, CHECK (role IN ('super_admin')) |
| created_at | TIMESTAMPTZ | NOT NULL |

#### `apartments` (Tenant root)

| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| name | VARCHAR(255) | NOT NULL |
| slug | VARCHAR(100) | UNIQUE, NOT NULL |
| address | TEXT | NULLABLE |
| city | VARCHAR(100) | NULLABLE |
| state | VARCHAR(100) | NULLABLE |
| pincode | VARCHAR(10) | NULLABLE |
| phone | VARCHAR(20) | NULLABLE |
| email | VARCHAR(255) | NULLABLE |
| registration_number | VARCHAR(100) | NULLABLE |
| is_active | BOOLEAN | DEFAULT true |
| created_at | TIMESTAMPTZ | NOT NULL |
| updated_at | TIMESTAMPTZ | NOT NULL |
| deleted_at | TIMESTAMPTZ | NULLABLE |

#### `apartment_memberships`

| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| user_id | UUID | FK → users.id |
| apartment_id | UUID | FK → apartments.id |
| role | VARCHAR(50) | NOT NULL, CHECK (role IN ('admin','inspector','resident')) |
| flat_id | UUID | FK → flats.id, NULLABLE (required when role=resident) |
| is_active | BOOLEAN | DEFAULT true |
| created_at | TIMESTAMPTZ | NOT NULL |
| updated_at | TIMESTAMPTZ | NOT NULL |

**Constraints:**
- `UNIQUE(user_id, apartment_id)` — one membership per apartment per user
- `UNIQUE(apartment_id, user_id, role)` — optional, depends on whether multi-role is needed (recommend NO — one role per membership, create separate membership if needed)

#### `blocks`

| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| apartment_id | UUID | FK → apartments.id, NOT NULL |
| name | VARCHAR(100) | NOT NULL |
| code | VARCHAR(20) | NOT NULL |
| floor_count | INTEGER | NULLABLE |
| description | TEXT | NULLABLE |
| is_active | BOOLEAN | DEFAULT true |
| created_at | TIMESTAMPTZ | NOT NULL |
| updated_at | TIMESTAMPTZ | NOT NULL |
| deleted_at | TIMESTAMPTZ | NULLABLE |

**Constraints:** `UNIQUE(apartment_id, code)`

#### `flats`

| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| apartment_id | UUID | FK → apartments.id, NOT NULL |
| block_id | UUID | FK → blocks.id, NOT NULL |
| flat_number | VARCHAR(20) | NOT NULL |
| floor | INTEGER | NULLABLE |
| area_sqft | NUMERIC(10,2) | NULLABLE |
| bedrooms | INTEGER | NULLABLE |
| flat_type | VARCHAR(50) | NULLABLE (e.g., '2BHK', '3BHK') |
| occupancy_status | VARCHAR(20) | NOT NULL, DEFAULT 'vacant' |
| is_active | BOOLEAN | DEFAULT true |
| created_at | TIMESTAMPTZ | NOT NULL |
| updated_at | TIMESTAMPTZ | NOT NULL |
| deleted_at | TIMESTAMPTZ | NULLABLE |

**Constraints:**
- `UNIQUE(apartment_id, block_id, flat_number)`
- `CHECK (occupancy_status IN ('vacant','owner_occupied','tenant_occupied'))`

#### `owners`

| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| apartment_id | UUID | FK → apartments.id, NOT NULL |
| flat_id | UUID | FK → flats.id, NOT NULL |
| user_id | UUID | FK → users.id, NULLABLE |
| full_name | VARCHAR(255) | NOT NULL |
| email | VARCHAR(255) | NULLABLE |
| phone | VARCHAR(20) | NULLABLE |
| alternate_phone | VARCHAR(20) | NULLABLE |
| address | TEXT | NULLABLE |
| is_primary | BOOLEAN | DEFAULT true |
| ownership_start_date | DATE | NULLABLE |
| is_active | BOOLEAN | DEFAULT true |
| created_at | TIMESTAMPTZ | NOT NULL |
| updated_at | TIMESTAMPTZ | NOT NULL |
| deleted_at | TIMESTAMPTZ | NULLABLE |

**Note:** `user_id` is optional — links to a login account if the owner needs app access.

#### `tenants`

| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| apartment_id | UUID | FK → apartments.id, NOT NULL |
| flat_id | UUID | FK → flats.id, NOT NULL |
| user_id | UUID | FK → users.id, NULLABLE |
| full_name | VARCHAR(255) | NOT NULL |
| email | VARCHAR(255) | NULLABLE |
| phone | VARCHAR(20) | NULLABLE |
| lease_start_date | DATE | NULLABLE |
| lease_end_date | DATE | NULLABLE |
| is_active | BOOLEAN | DEFAULT true |
| created_at | TIMESTAMPTZ | NOT NULL |
| updated_at | TIMESTAMPTZ | NOT NULL |
| deleted_at | TIMESTAMPTZ | NULLABLE |

#### `family_members`

| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| apartment_id | UUID | FK → apartments.id, NOT NULL |
| flat_id | UUID | FK → flats.id, NOT NULL |
| full_name | VARCHAR(255) | NOT NULL |
| relationship | VARCHAR(50) | NOT NULL (e.g., 'spouse','child','parent') |
| phone | VARCHAR(20) | NULLABLE |
| email | VARCHAR(255) | NULLABLE |
| date_of_birth | DATE | NULLABLE |
| is_active | BOOLEAN | DEFAULT true |
| created_at | TIMESTAMPTZ | NOT NULL |
| updated_at | TIMESTAMPTZ | NOT NULL |
| deleted_at | TIMESTAMPTZ | NULLABLE |

#### `refresh_tokens`

| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| user_id | UUID | FK → users.id, NOT NULL |
| token_hash | VARCHAR(255) | NOT NULL |
| family_id | UUID | NOT NULL (groups rotation chain) |
| apartment_id | UUID | FK → apartments.id, NULLABLE |
| device_info | VARCHAR(255) | NULLABLE |
| ip_address | VARCHAR(45) | NULLABLE |
| expires_at | TIMESTAMPTZ | NOT NULL |
| revoked_at | TIMESTAMPTZ | NULLABLE |
| created_at | TIMESTAMPTZ | NOT NULL |

**Index:** `(user_id, revoked_at)`, `(token_hash)`

#### `audit_logs` (Recommended for Phase 2)

| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| user_id | UUID | FK → users.id, NULLABLE |
| apartment_id | UUID | NULLABLE |
| action | VARCHAR(100) | NOT NULL |
| entity_type | VARCHAR(50) | NOT NULL |
| entity_id | UUID | NULLABLE |
| details | JSON | NULLABLE |
| ip_address | VARCHAR(45) | NULLABLE |
| created_at | TIMESTAMPTZ | NOT NULL |

---

## 11. Entity Relationships

### 11.1 ER Diagram

```
┌──────────────┐       ┌──────────────────┐       ┌──────────────┐
│    users     │──────<│ platform_roles   │       │  apartments  │
│              │       │ (super_admin)    │       │  (tenant)    │
│ id           │       └──────────────────┘       │ id           │
│ email        │                                   │ name, slug   │
│ password_hash│       ┌──────────────────┐       └──────┬───────┘
│ full_name    │──────<│ apartment_      │>─────────────┘
│              │       │ memberships      │
└──────┬───────┘       │ role             │
       │               │ flat_id (FK)     │
       │               └──────────────────┘
       │                        │
       │               ┌────────▼───────┐
       │               │     flats      │
       │               │ id             │
       │               │ flat_number    │
       │               │ block_id (FK)  │──────┐
       │               │ apartment_id   │      │
       │               └───────┬────────┘      │
       │           ┌───────────┼───────────┐  │
       │           │           │           │  │
       │     ┌─────▼────┐ ┌───▼─────┐ ┌───▼────────┐
       │     │  owners  │ │ tenants │ │family_members│
       │     │ flat_id  │ │ flat_id │ │ flat_id     │
       │     │ user_id? │ │ user_id?│ └─────────────┘
       │     └──────────┘ └─────────┘
       │
       │     ┌──────────────┐
       └────>│refresh_tokens│
             │ user_id      │
             └──────────────┘

┌──────────────┐
│    blocks    │
│ apartment_id │>──── apartments
│ code         │
└──────┬───────┘
       │
       ▼
    flats (block_id → blocks)
```

### 11.2 Relationship Rules

| Relationship | Cardinality | Notes |
|-------------|-------------|-------|
| Apartment → Blocks | 1:N | Apartment must have ≥1 block |
| Block → Flats | 1:N | Flat belongs to exactly one block |
| Flat → Owners | 1:N | Multiple owners possible (joint ownership); one `is_primary` |
| Flat → Tenants | 1:N | Historically multiple over time; one active at a time (enforced in service layer) |
| Flat → Family Members | 1:N | Linked to flat, not to a specific owner/tenant |
| User → Memberships | 1:N | One per apartment |
| User → Owner/Tenant | 1:0..1 | Optional link when domain entity needs login |
| Membership → Flat | N:1 | Required when role=resident; null for admin/inspector |

### 11.3 Occupancy Status Logic (Service Layer)

```
flat.occupancy_status is DERIVED, not manually set:
  - No active owner and no active tenant → 'vacant'
  - Active owner, no active tenant → 'owner_occupied'
  - Active tenant (regardless of owner) → 'tenant_occupied'
```

Updated automatically when owner/tenant records are created, deactivated, or deleted.

---

## 12. Naming Conventions

### 12.1 Database

| Element | Convention | Example |
|---------|-----------|---------|
| Tables | snake_case, plural | `apartment_memberships`, `family_members` |
| Columns | snake_case | `created_at`, `flat_number` |
| Primary keys | `id` (UUID) | `id` |
| Foreign keys | `{entity}_id` | `apartment_id`, `block_id` |
| Indexes | `ix_{table}_{column}` | `ix_flats_apartment_id` |
| Unique constraints | `uq_{table}_{columns}` | `uq_blocks_apartment_id_code` |

### 12.2 Python Code

| Element | Convention | Example |
|---------|-----------|---------|
| Files | snake_case | `auth_service.py` |
| Classes | PascalCase | `ApartmentService`, `FlatCreate` |
| Functions/methods | snake_case | `get_flat_by_id`, `create_apartment` |
| Constants/enums | UPPER_SNAKE_CASE | `MEMBERSHIP_ROLE_ADMIN` |
| Variables | snake_case | `apartment_id`, `current_user` |
| Private | leading underscore | `_hash_token` |

### 12.3 API

| Element | Convention | Example |
|---------|-----------|---------|
| URL paths | kebab-case, plural nouns | `/api/v1/apartments/{id}/blocks` |
| Path parameters | snake_case in code, kebab in URL | `{apartment_id}` |
| Query parameters | snake_case | `?page=1&page_size=20` |
| JSON fields | snake_case | `{ "flat_number": "A-101" }` |
| Version prefix | `/api/v1` | All routes versioned |

### 12.4 Enum Values

| Context | Convention | Example |
|---------|-----------|---------|
| Database/API | snake_case | `owner_occupied`, `super_admin` |
| Python enums | PascalCase class, snake_case values | `MembershipRole.ADMIN = "admin"` |

---

## 13. API Standards

### 13.1 URL Structure

```
/api/v1/auth/*                                    # Authentication (public + authenticated)
/api/v1/platform/*                                # Super Admin operations
/api/v1/apartments/{apartment_id}/*               # Tenant-scoped operations
```

**Alternative considered:** `/api/v1/blocks` with apartment_id from JWT (no URL segment). 

**Recommendation:** Use apartment_id in URL for tenant routes because:
- Explicit and auditable
- Supports future multi-apartment users (validates JWT apartment matches URL)
- Clearer API documentation
- Matches RESTful resource nesting

### 13.2 Standard Response Envelope

**Success (single resource):**
```json
{
  "data": { ... },
  "meta": null
}
```

**Success (list):**
```json
{
  "data": [ ... ],
  "meta": {
    "page": 1,
    "page_size": 20,
    "total_items": 150,
    "total_pages": 8
  }
}
```

**Error:**
```json
{
  "error": {
    "code": "FLAT_NOT_FOUND",
    "message": "Flat with ID '...' not found in this apartment.",
    "details": []
  }
}
```

### 13.3 HTTP Status Codes

| Code | Usage |
|------|-------|
| 200 | Successful GET, PUT, PATCH |
| 201 | Successful POST (resource created) |
| 204 | Successful DELETE |
| 400 | Validation error, malformed request |
| 401 | Missing or invalid authentication |
| 403 | Authenticated but insufficient permissions |
| 404 | Resource not found (or not in tenant scope — same response to prevent enumeration) |
| 409 | Conflict (duplicate block code, etc.) |
| 422 | Unprocessable entity (Pydantic validation) |
| 429 | Rate limited |
| 500 | Internal server error (never expose details) |

### 13.4 Pagination

```
GET /api/v1/apartments/{id}/flats?page=1&page_size=20&sort_by=flat_number&sort_order=asc
```

| Parameter | Default | Max |
|-----------|---------|-----|
| page | 1 | — |
| page_size | 20 | 100 |
| sort_by | created_at | — |
| sort_order | asc | — |

### 13.5 Filtering (Phase 2 basic)

```
GET /api/v1/apartments/{id}/flats?block_id=...&occupancy_status=tenant_occupied
```

### 13.6 API Endpoint Inventory (Phase 2)

#### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/auth/login` | Login |
| POST | `/api/v1/auth/refresh` | Refresh tokens |
| POST | `/api/v1/auth/logout` | Logout |
| POST | `/api/v1/auth/change-password` | Change password |
| GET | `/api/v1/auth/me` | Current user + memberships |

#### Platform (Super Admin)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/platform/apartments` | Create apartment |
| GET | `/api/v1/platform/apartments` | List all apartments |
| GET | `/api/v1/platform/apartments/{id}` | Get apartment details |
| PUT | `/api/v1/platform/apartments/{id}` | Update apartment |
| PATCH | `/api/v1/platform/apartments/{id}/status` | Activate/deactivate |
| POST | `/api/v1/platform/apartments/{id}/admin` | Assign admin user to apartment |

#### Apartment Structure
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/apartments/{id}/blocks` | Create block |
| GET | `/api/v1/apartments/{id}/blocks` | List blocks |
| GET | `/api/v1/apartments/{id}/blocks/{block_id}` | Get block |
| PUT | `/api/v1/apartments/{id}/blocks/{block_id}` | Update block |
| DELETE | `/api/v1/apartments/{id}/blocks/{block_id}` | Soft delete block |
| POST | `/api/v1/apartments/{id}/flats` | Create flat |
| GET | `/api/v1/apartments/{id}/flats` | List flats |
| GET | `/api/v1/apartments/{id}/flats/{flat_id}` | Get flat |
| PUT | `/api/v1/apartments/{id}/flats/{flat_id}` | Update flat |
| DELETE | `/api/v1/apartments/{id}/flats/{flat_id}` | Soft delete flat |

#### Users & Memberships
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/apartments/{id}/users` | Create user + membership |
| GET | `/api/v1/apartments/{id}/users` | List apartment users |
| GET | `/api/v1/apartments/{id}/users/{user_id}` | Get user |
| PUT | `/api/v1/apartments/{id}/users/{user_id}` | Update user |
| PATCH | `/api/v1/apartments/{id}/users/{user_id}/status` | Activate/deactivate |

#### Owners, Tenants, Family
| Method | Endpoint | Description |
|--------|----------|-------------|
| CRUD | `/api/v1/apartments/{id}/flats/{flat_id}/owners` | Owner management |
| CRUD | `/api/v1/apartments/{id}/flats/{flat_id}/tenants` | Tenant management |
| CRUD | `/api/v1/apartments/{id}/flats/{flat_id}/family-members` | Family management |

#### Resident Self-Service (Read-Only)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/apartments/{id}/my/flat` | Resident's own flat |
| GET | `/api/v1/apartments/{id}/my/owners` | Owners of resident's flat |
| GET | `/api/v1/apartments/{id}/my/tenants` | Tenants of resident's flat |
| GET | `/api/v1/apartments/{id}/my/family` | Family members of resident's flat |

---

## 14. Error Handling Strategy

### 14.1 Exception Hierarchy

```
AppException (base)
├── AuthenticationError (401)
│   ├── InvalidCredentialsError
│   ├── TokenExpiredError
│   └── TokenRevokedError
├── AuthorizationError (403)
│   ├── InsufficientPermissionsError
│   └── TenantAccessDeniedError
├── NotFoundError (404)
├── ConflictError (409)
│   └── DuplicateEntityError
├── ValidationError (422)
└── InternalError (500)
```

### 14.2 Global Exception Handler

Single FastAPI exception handler maps `AppException` → JSON error response with correct HTTP status. Unhandled exceptions → 500 with generic message, full traceback logged server-side.

### 14.3 Rules

| Rule | Detail |
|------|--------|
| Never expose stack traces | Log server-side, return generic 500 message |
| 404 vs 403 for tenant isolation | Return **404** when resource exists in another tenant (prevents enumeration attacks) |
| Validation errors include field paths | Pydantic errors mapped to `details: [{field, message}]` |
| Business rule violations use specific codes | `DUPLICATE_BLOCK_CODE`, `FLAT_HAS_ACTIVE_TENANT` |
| Consistent error shape | Always `{ "error": { "code", "message", "details" } }` |

---

## 15. Logging Strategy

### 15.1 Approach

**Structured JSON logging** via `structlog` or `python-json-logger`.

### 15.2 Log Levels

| Level | Usage |
|-------|-------|
| DEBUG | Query details, development only |
| INFO | Request/response summary, business events (apartment created, user login) |
| WARNING | Failed login attempts, deprecated API usage |
| ERROR | Unhandled exceptions, external service failures |
| CRITICAL | Database connection failure, startup errors |

### 15.3 Request Logging

Every request logs:
```json
{
  "event": "request_completed",
  "request_id": "uuid",
  "method": "GET",
  "path": "/api/v1/apartments/.../flats",
  "status_code": 200,
  "duration_ms": 45,
  "user_id": "uuid",
  "apartment_id": "uuid"
}
```

### 15.4 Request ID

- Generated per request (UUID)
- Returned in `X-Request-ID` response header
- Propagated through all log entries for correlation

### 15.5 Sensitive Data

**Never log:** passwords, tokens, password hashes, full request bodies on auth endpoints.

---

## 16. Validation Strategy

### 16.1 Layers

| Layer | Tool | Responsibility |
|-------|------|---------------|
| API input | Pydantic v2 schemas | Type coercion, format validation, required fields |
| Business rules | Service layer | Cross-entity validation (e.g., flat belongs to block in same apartment) |
| Database | SQLAlchemy constraints + CHECK | Last line of defense (uniqueness, FK integrity) |

### 16.2 Pydantic Schema Types

```
{Entity}Create    — POST request body
{Entity}Update    — PUT/PATCH request body (all fields optional for PATCH)
{Entity}Response  — API response (excludes sensitive fields)
{Entity}InDB      — Internal representation (includes DB fields)
```

### 16.3 Validation Examples

| Field | Validation |
|-------|-----------|
| email | EmailStr, normalized to lowercase |
| phone | Regex pattern, 10-15 digits |
| slug | Regex `^[a-z0-9-]+$`, min 3 chars |
| password | MinLength(8), custom validator for complexity |
| flat_number | Not empty, max 20 chars |
| UUID path params | Pydantic UUID validation |

---

## 17. Configuration Management

### 17.1 Approach

`pydantic-settings` with environment variables and `.env` file.

### 17.2 Configuration Categories

```python
# Conceptual
class Settings(BaseSettings):
    # App
    APP_NAME: str = "Apartment ERP"
    APP_ENV: str = "development"  # development | staging | production
    DEBUG: bool = False

    # Database
    DATABASE_URL: str = "sqlite:///./apartment_erp.db"

    # Auth
    JWT_SECRET_KEY: str          # REQUIRED — no default in production
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 15
    REFRESH_TOKEN_EXPIRE_DAYS: int = 30

    # Security
    CORS_ORIGINS: list[str] = []
    LOGIN_MAX_ATTEMPTS: int = 5
    LOGIN_LOCKOUT_MINUTES: int = 15

    # Logging
    LOG_LEVEL: str = "INFO"
```

### 17.3 Rules

| Rule | Detail |
|------|--------|
| Secrets never in code | JWT secret, DB password via env vars only |
| `.env.example` committed | Documents all required variables with placeholder values |
| `.env` in `.gitignore` | Never committed |
| Fail fast on missing required config | App refuses to start without `JWT_SECRET_KEY` in production |
| Environment-specific overrides | `APP_ENV=production` disables DEBUG, sets stricter CORS |

---

## 18. Dependency Management

### 18.1 Tooling

**`pyproject.toml`** with `uv` or `pip` for dependency management.

### 18.2 Core Dependencies (Phase 2)

| Package | Purpose |
|---------|---------|
| fastapi | Web framework |
| uvicorn[standard] | ASGI server |
| sqlalchemy[asyncio] | ORM (2.x style) |
| alembic | Migrations |
| pydantic[email] | Validation |
| pydantic-settings | Configuration |
| python-jose[cryptography] | JWT |
| passlib[bcrypt] | Password hashing |
| python-multipart | Form data |
| aiosqlite | Async SQLite driver (dev) |
| asyncpg | Async PostgreSQL driver (prod) |
| structlog | Structured logging |
| httpx | Test client |

### 18.3 Dev Dependencies

| Package | Purpose |
|---------|---------|
| pytest | Testing |
| pytest-asyncio | Async test support |
| pytest-cov | Coverage |
| factory-boy | Test factories |
| ruff | Linting + formatting |
| mypy | Type checking |

### 18.4 Version Pinning

- Pin major versions in `pyproject.toml`
- Use lock file for reproducible builds
- Dependabot/Renovate for automated updates (future)

---

## 19. Security Considerations

### 19.1 Authentication & Authorization

| Concern | Mitigation |
|---------|-----------|
| Brute force login | Rate limiting + account lockout after N failures |
| Token theft | Short-lived access tokens, refresh rotation, httpOnly cookies |
| Privilege escalation | RBAC checked at route + service level, never trust client role claims alone |
| Cross-tenant access | TenantContext enforced at repository level, integration tests |
| JWT secret compromise | Rotate secret, invalidate all refresh tokens |

### 19.2 Input Security

| Concern | Mitigation |
|---------|-----------|
| SQL injection | SQLAlchemy parameterized queries only — no raw SQL |
| Mass assignment | Pydantic schemas whitelist allowed fields per endpoint |
| UUID enumeration | 404 for cross-tenant resources (not 403) |

### 19.3 Transport & Headers

| Concern | Mitigation |
|---------|-----------|
| HTTPS | Enforced in production (TLS termination at reverse proxy) |
| CORS | Whitelist specific origins per environment |
| Security headers | `X-Content-Type-Options`, `X-Frame-Options`, `Strict-Transport-Security` |

### 19.4 Data Protection

| Concern | Mitigation |
|---------|-----------|
| Password storage | bcrypt with appropriate work factor |
| Refresh token storage | Hashed in DB (store hash, not raw token) |
| PII in logs | Never log passwords, tokens, or sensitive personal data |
| Soft delete | Data retained but excluded from queries — hard delete only on GDPR request (future) |

### 19.5 Audit Trail

All sensitive operations logged to `audit_logs`:
- Super Admin creating/deactivating apartments
- Admin creating/deleting users
- Login failures
- Password changes
- Role changes

---

## 20. Scalability Considerations

### 20.1 Current Architecture Scaling Path

| Stage | Apartments | Strategy |
|-------|-----------|----------|
| MVP | 1–50 | Single server, SQLite → PostgreSQL |
| Growth | 50–500 | PostgreSQL, connection pooling (PgBouncer), read replicas |
| Scale | 500–5000 | Redis caching, background job queue (Celery/ARQ), CDN for static assets |
| Enterprise | 5000+ | Consider dedicated DB tier for large tenants, horizontal API scaling behind load balancer |

### 20.2 Database Scaling

| Technique | When |
|-----------|------|
| Indexes on `apartment_id` + common filters | Day one |
| Connection pooling | PostgreSQL production |
| Read replicas | When read load exceeds single instance |
| Table partitioning by `apartment_id` | 10K+ tenants (PostgreSQL declarative partitioning) |
| PostgreSQL RLS | Production hardening for tenant isolation |

### 20.3 Application Scaling

| Technique | When |
|-----------|------|
| Stateless API (JWT access tokens) | Day one — enables horizontal scaling |
| Background jobs for heavy operations | Bulk imports, report generation (future) |
| Caching (Redis) | Frequently accessed apartment config, block/flat lists |
| Async SQLAlchemy | Non-blocking DB I/O under concurrent load |

### 20.4 SQLite → PostgreSQL Migration

| Area | Strategy |
|------|----------|
| Types | Use SQLAlchemy abstract types (UUID, DateTime(timezone=True)) |
| Queries | No SQLite-specific SQL |
| Drivers | `aiosqlite` (dev), `asyncpg` (prod) — switch via `DATABASE_URL` |
| Migrations | Same Alembic migrations work on both |
| Testing | CI runs tests against both SQLite and PostgreSQL |

---

## 21. Future Module Integration Strategy

### 21.1 How New Modules Plug In

Every future module (maintenance, accounting, notices, gallery, visitors, etc.) follows the same pattern:

```
1. Create models with apartment_id (TenantMixin)
2. Create schemas, repository, service
3. Create router under /api/v1/apartments/{id}/{module}/
4. Register router in api/v1/router.py
5. Add Alembic migration
6. Add permissions to RBAC matrix
7. Add integration tests including tenant isolation tests
```

### 21.2 Module Independence Principles

| Principle | Detail |
|-----------|------|
| Loose coupling | Modules communicate via service interfaces, not direct DB joins across modules |
| Shared kernel | `core/`, `db/`, `auth/` are shared — modules depend on them, not on each other |
| Flat → Module anchor | Most modules anchor to `flat_id` (maintenance dues, complaints, visitors) |
| Apartment → Module anchor | Some modules anchor to `apartment_id` only (notices, gallery, accounting) |
| Feature flags (future) | `apartment_features` table to enable/disable modules per apartment |

### 21.3 Planned Future Modules

| Module | Anchors To | Depends On (Phase 2) |
|--------|-----------|---------------------|
| Maintenance Billing | flat_id | flats, owners, tenants |
| Accounting | apartment_id | apartments |
| Notices | apartment_id | apartments |
| Gallery | apartment_id | apartments |
| Service Tracking | flat_id / apartment_id | flats |
| Documents | flat_id / apartment_id | flats, apartments |
| Payments | flat_id | flats, maintenance |
| Reports | apartment_id | all modules |
| Visitor Management | flat_id | flats, residents |
| Complaints | flat_id | flats, residents |
| Facility Booking | apartment_id | apartments |
| Parking | flat_id | flats |
| Staff Management | apartment_id | apartments |
| Notifications | user_id | users, memberships |

### 21.4 Apartment Website (Future)

Each apartment gets a public website (e.g., `{slug}.apartmenterp.com`):
- Public routes: `/api/v1/public/{slug}/notices`, `/gallery`, etc.
- No authentication required
- Read-only, scoped by slug → apartment_id lookup
- Separate router prefix, no tenant JWT needed

---

## 22. Phase 2 Implementation Roadmap

Implementation begins only after this document is approved.

| Step | Module | Deliverables |
|------|--------|-------------|
| 1 | Project scaffolding | pyproject.toml, folder structure, config, logging, DB session |
| 2 | Database base | Base models, mixins, Alembic setup, initial migration |
| 3 | Auth | User model, JWT, refresh tokens, login/logout/refresh/me |
| 4 | Platform | Super Admin seed, apartment CRUD, assign admin |
| 5 | Structure | Block CRUD, Flat CRUD, occupancy status logic |
| 6 | Users | User creation, membership management |
| 7 | Owners | Owner CRUD linked to flats |
| 8 | Tenants | Tenant CRUD linked to flats |
| 9 | Family | Family member CRUD linked to flats |
| 10 | Resident routes | Self-service read-only endpoints |
| 11 | Testing | Unit + integration tests, tenant isolation test suite |
| 12 | Documentation | API docs (auto-generated via FastAPI OpenAPI) |

---

## 23. Open Questions for Approval

Please review and confirm or adjust the following decisions:

### Q1: User Identity Model
**Proposal:** Single `users` table + `apartment_memberships` for roles. One email = one login across the platform.  
**Alternative:** Separate `platform_users` and `apartment_users` tables.  
**Do you approve the unified model?**

### Q2: Apartment ID in URL
**Proposal:** Tenant routes include `/apartments/{apartment_id}/` in the URL, validated against JWT.  
**Alternative:** Apartment ID only from JWT, cleaner URLs but harder multi-apartment support.  
**Do you approve URL-based apartment scoping?**

### Q3: Multiple Owners per Flat
**Proposal:** Allow multiple owners per flat (joint ownership) with `is_primary` flag.  
**Alternative:** Strictly one owner per flat.  
**Which model matches Indian apartment management reality for your target market?**

### Q4: Multiple Active Tenants per Flat
**Proposal:** One active tenant per flat at a time (enforced in service layer). Historical tenants retained.  
**Do you approve?**

### Q5: Audit Logs in Phase 2
**Proposal:** Include `audit_logs` table and basic logging from Phase 2 (not deferred).  
**Alternative:** Defer to a later phase.  
**Your preference?**

### Q6: Async vs Sync SQLAlchemy
**Proposal:** Async SQLAlchemy (`asyncpg` / `aiosqlite`) with async FastAPI routes.  
**Alternative:** Sync SQLAlchemy (simpler, well-understood, sufficient for MVP scale).  
**Recommendation:** Async — FastAPI is async-native, and this avoids a migration later. But sync is simpler if you prefer faster initial development.  
**Your preference?**

### Q7: Flat Number Format
**Proposal:** `flat_number` is a free-form string (e.g., "A-101", "G-02", "101"). Block provides the grouping.  
**Alternative:** Numeric only with block code prefix generated by system.  
**Your preference?**

---

## Document Approval

| Reviewer | Status | Date | Notes |
|----------|--------|------|-------|
| Project Owner | Pending | — | — |

---

*This document will be updated as decisions are confirmed. All changes require explicit approval before implementation.*
