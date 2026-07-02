# ApartmentERP Backend — Complete (B1–B11)

FastAPI + SQLAlchemy + Alembic. All master-data phases implemented.

## Setup

```powershell
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env   # optional — edit JWT_SECRET_KEY for production
alembic upgrade head
python scripts/seed_all.py
```

Or run individual seeds: `seed_structure.py` → `seed_people.py` → `seed_auth.py` → … → `seed_settings.py`.

## Run API

```powershell
uvicorn app.main:app --reload --port 8000
```

- Health: http://localhost:8000/health
- OpenAPI: http://localhost:8000/docs

## Demo login (after seed_auth.py)

| Role | Email | Password |
|------|-------|----------|
| Admin | abhinaymalyala15@gmail.com | Demo@1234 |
| Inspector | inspector@sylvanshelter.in | Demo@1234 |
| Resident | srinivas.malyala@gmail.com | Demo@1234 |
| Platform | admin@apartmenterp.in | Demo@1234 |

## B4 — Auth endpoints

| Method | Path |
|--------|------|
| POST | `/api/v1/auth/login` |
| POST | `/api/v1/auth/refresh` |
| POST | `/api/v1/auth/logout` |
| POST | `/api/v1/auth/change-password` (Bearer token) |
| GET | `/api/v1/auth/me` (Bearer token) |
| GET | `/api/v1/auth/permissions` (Bearer token) |
| GET | `/api/v1/apartments/{id}/roles` (admin/inspector) |

JWT access tokens expire in 30 minutes; refresh tokens in 7 days (server-stored, hashed).

Users link optionally to `persons` via `users.person_id`. Membership roles: `admin`, `inspector`, `resident`.

## B2 — Structure endpoints

| Method | Path |
|--------|------|
| GET/POST | `/api/v1/apartments` |
| GET/PATCH/DELETE | `/api/v1/apartments/{id}` |
| GET/POST | `/api/v1/apartments/{id}/blocks` |
| GET/PATCH/DELETE | `/api/v1/apartments/{id}/blocks/{block_id}` |
| GET/POST | `/api/v1/apartments/{id}/blocks/{block_id}/floors` |
| GET/PATCH/DELETE | `/api/v1/apartments/{id}/blocks/{block_id}/floors/{floor_id}` |
| GET/POST | `/api/v1/apartments/{id}/flats` |
| GET/PATCH/DELETE | `/api/v1/apartments/{id}/flats/{flat_id}` |

## B3 — People endpoints

| Method | Path |
|--------|------|
| GET/POST | `/api/v1/apartments/{id}/persons` |
| GET/PATCH/DELETE | `/api/v1/apartments/{id}/persons/{person_id}` |
| GET | `/api/v1/apartments/{id}/owners?flat_id=` |
| POST | `/api/v1/apartments/{id}/flats/{flat_id}/owners` |
| GET/PATCH/DELETE | `/api/v1/apartments/{id}/owners/{owner_id}` |
| GET | `/api/v1/apartments/{id}/tenants?flat_id=&active_only=` |
| POST | `/api/v1/apartments/{id}/flats/{flat_id}/tenants` |
| GET/PATCH/DELETE | `/api/v1/apartments/{id}/tenants/{tenant_id}` |
| GET/POST | `/api/v1/apartments/{id}/flats/{flat_id}/family-members` |
| GET/PATCH/DELETE | `/api/v1/apartments/{id}/family-members/{member_id}` |
| GET/POST | `/api/v1/apartments/{id}/staff` |
| GET/PATCH/DELETE | `/api/v1/apartments/{id}/staff/{staff_id}` |
| GET | `/api/v1/apartments/{id}/flats/{flat_id}/household` |
| GET | `/api/v1/apartments/{id}/flats/{flat_id}/occupancy-history` |

Profile create accepts **`person_id`** (existing person) or inline **`person`** object.

DELETE = soft delete. Owner/tenant changes recompute `flat.occupancy_status` and append `occupancy_history`.

## B5 — Finance endpoints

Normalized flow: **Bill → Payment → PaymentAllocation → Receipt**.

| Method | Path |
|--------|------|
| GET | `/api/v1/apartments/{id}/billing-config/current` |
| POST | `/api/v1/apartments/{id}/billing-config` |
| GET/POST | `/api/v1/apartments/{id}/billing-periods` |
| GET | `/api/v1/apartments/{id}/bills?flat_id=&period_id=&status=` |
| POST | `/api/v1/apartments/{id}/flats/{flat_id}/bills` |
| GET | `/api/v1/apartments/{id}/payments?flat_id=` |
| POST | `/api/v1/apartments/{id}/flats/{flat_id}/payments` |
| GET | `/api/v1/apartments/{id}/payments/{payment_id}` |
| POST | `/api/v1/apartments/{id}/payments/{payment_id}/void` |
| GET | `/api/v1/apartments/{id}/receipts?flat_id=` |
| GET | `/api/v1/apartments/{id}/receipts/{receipt_id}` |
| GET | `/api/v1/apartments/{id}/flats/{flat_id}/finance` |
| GET/POST | `/api/v1/apartments/{id}/follow-ups` |
| PATCH | `/api/v1/apartments/{id}/follow-ups/{follow_up_id}` |

`POST .../payments` body requires `allocations: [{ bill_id, amount }]`. A receipt is auto-generated unless `receipt_number` is supplied.

Seed (`seed_finance.py`) loads `maintenance-config.json`, `payments.json` (~265 bills, 240 paid with receipts), and `follow-ups.json`.

## B6 — Communication endpoints

Single `notices` table with lifecycle (`draft → scheduled → published → archived`). Publish dispatches in-app notifications and writes timeline events.

| Method | Path |
|--------|------|
| GET | `/api/v1/apartments/{id}/communication/summary` |
| GET/POST | `/api/v1/apartments/{id}/notices?lifecycle_status=&category=` |
| GET | `/api/v1/apartments/{id}/notices/history?notice_id=` |
| GET/PATCH | `/api/v1/apartments/{id}/notices/{notice_id}` |
| POST | `/api/v1/apartments/{id}/notices/{notice_id}/schedule` |
| POST | `/api/v1/apartments/{id}/notices/{notice_id}/publish` |
| POST | `/api/v1/apartments/{id}/notices/{notice_id}/archive` |
| POST | `/api/v1/apartments/{id}/notices/emergency` |
| GET | `/api/v1/apartments/{id}/notifications?user_id=&flat_id=&unread_only=` |
| POST | `/api/v1/apartments/{id}/notifications/{notification_id}/read` |
| GET | `/api/v1/apartments/{id}/timeline?flat_id=&entity_type=&limit=` |

Seed (`seed_communication.py`) merges `notices.json`, `notice-drafts.json`, `notice-scheduled.json`, `notice-archived.json`, and `notice-history.json` into unified tables.

## B7 — Assets & Services endpoints

| Method | Path |
|--------|------|
| GET | `/api/v1/apartments/{id}/assets/summary` |
| GET/POST | `/api/v1/apartments/{id}/vendors` |
| PATCH | `/api/v1/apartments/{id}/vendors/{vendor_id}` |
| GET/POST | `/api/v1/apartments/{id}/assets?asset_type=&status=&scope=` |
| GET | `/api/v1/apartments/{id}/assets/{asset_id}` |
| GET | `/api/v1/apartments/{id}/assets/{asset_id}/detail` |
| PATCH | `/api/v1/apartments/{id}/assets/{asset_id}` |
| GET/POST | `/api/v1/apartments/{id}/assets/{asset_id}/amc` |
| POST | `/api/v1/apartments/{id}/assets/{asset_id}/amc/renew` |
| GET | `/api/v1/apartments/{id}/asset-services?asset_id=&status=` |
| POST | `/api/v1/apartments/{id}/assets/{asset_id}/services` |
| PATCH | `/api/v1/apartments/{id}/asset-services/{service_id}` |
| GET/POST | `/api/v1/apartments/{id}/service-schedules?flat_id=&status=` |
| PATCH | `/api/v1/apartments/{id}/service-schedules/{schedule_id}` |
| GET/POST | `/api/v1/apartments/{id}/assets/{asset_id}/notes` |

Seed (`seed_assets.py`) loads `asset-vendors.json`, `community-assets.json`, `asset-amc.json`, `asset-services.json`, `services.json`, and `asset-internal-notes.json`.

## B8 — Visitors endpoints

Pre-approved guest entries scoped to a flat. Approve dispatches in-app notification + timeline event.

| Method | Path |
|--------|------|
| GET | `/api/v1/apartments/{id}/visitors/summary` |
| GET | `/api/v1/apartments/{id}/visitors/today?flat_id=` |
| GET | `/api/v1/apartments/{id}/visitors?flat_id=&status=&expected_date=` |
| POST | `/api/v1/apartments/{id}/flats/{flat_id}/visitors` |
| GET/PATCH | `/api/v1/apartments/{id}/visitors/{visitor_id}` |
| POST | `/api/v1/apartments/{id}/visitors/{visitor_id}/approve` |
| POST | `/api/v1/apartments/{id}/visitors/{visitor_id}/reject` |
| POST | `/api/v1/apartments/{id}/visitors/{visitor_id}/check-in` |
| POST | `/api/v1/apartments/{id}/visitors/{visitor_id}/check-out` |

Status flow: `pending → approved → checked_in → checked_out` (or `rejected` from pending/approved).

Seed (`seed_visitors.py`) loads `visitors.json`.

## B9 — Complaints endpoints

Flat-scoped resident requests (`resident_requests`). Resolve notifies resident + writes timeline.

| Method | Path |
|--------|------|
| GET | `/api/v1/apartments/{id}/complaints/summary` |
| GET | `/api/v1/apartments/{id}/complaints?flat_id=&status=&priority=` |
| POST | `/api/v1/apartments/{id}/flats/{flat_id}/complaints` |
| GET/PATCH | `/api/v1/apartments/{id}/complaints/{complaint_id}` |
| POST | `/api/v1/apartments/{id}/complaints/{complaint_id}/assign` |
| POST | `/api/v1/apartments/{id}/complaints/{complaint_id}/resolve` |

Status flow: `open → in_progress → resolved`.

Seed (`seed_complaints.py`) loads `resident-requests.json`.

## B10 — Reports & Settings endpoints

| Method | Path |
|--------|------|
| GET | `/api/v1/apartments/{id}/reports/overview` |
| GET | `/api/v1/apartments/{id}/reports/finance` |
| GET | `/api/v1/apartments/{id}/reports/occupancy` |
| GET | `/api/v1/apartments/{id}/reports/operations` |
| GET | `/api/v1/apartments/{id}/settings` |
| PATCH | `/api/v1/apartments/{id}/settings/preferences` |
| PATCH | `/api/v1/apartments/{id}/settings/integrations/{integration_id}` |
| GET | `/api/v1/apartments/{id}/contacts` |
| GET | `/api/v1/apartments/{id}/gallery` |
| GET/POST | `/api/v1/apartments/{id}/documents?entity_type=&entity_id=` |
| GET | `/api/v1/apartments/{id}/documents/{document_id}` |
| GET/POST | `/api/v1/apartments/{id}/flats/{flat_id}/internal-notes` |
| GET | `/api/v1/apartments/{id}/audit-logs?entity_type=&limit=` |

Seed (`seed_settings.py`) loads `apartment-settings.json`, `committee-contacts.json`, `documents.json`, `asset-documents.json`, `flat-internal-notes.json`, and `gallery.json`.

## B11 — Production

Copy `.env.example` → `.env` and set:

- `ENVIRONMENT=production`
- `DEBUG=false`
- `JWT_SECRET_KEY` — strong random secret
- `DATABASE_URL` — PostgreSQL recommended for production
- `CORS_ORIGINS` — your frontend URL(s)

**Development:**

```powershell
uvicorn app.main:app --reload --port 8000
```

**Production (Gunicorn + Uvicorn workers):**

```powershell
pip install gunicorn
gunicorn app.main:app -k uvicorn.workers.UvicornWorker -b 0.0.0.0:8000 -w 2
```

**Docker:**

```powershell
docker build -t apartmenterp-api .
docker run -p 8000:8000 -e JWT_SECRET_KEY=your-secret apartmenterp-api
```

Production mode disables `/docs` and `/redoc`. Request logging middleware is enabled. Health check returns `environment`.

See [`docs/MASTER_DATABASE_ARCHITECTURE.md`](../docs/MASTER_DATABASE_ARCHITECTURE.md).
