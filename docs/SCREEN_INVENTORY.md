# ApartmentERP — Complete Screen Inventory

**Generated:** July 2, 2026  
**Scope:** Every user-facing route in the application (123 unique `page.tsx` files; ~192 built URLs including SSG instances).  
**Demo tenant:** Sylvan Shelter Apartment — Block A (55 flats), Blocks B/C defined but empty.

**Legend**
- **Route** — URL pattern; `(×N)` = statically generated instances.
- Dynamic templates are one row; instance counts noted.
- Redirect-only routes are listed separately and excluded from screen counts.

---

## Summary counts

| Portal | Unique screen templates | Generated URL instances (approx.) |
|--------|-------------------------|-----------------------------------|
| Public website | 6 | 6 |
| Login | 1 | 1 |
| Resident | 8 | 8 |
| Inspector | 8 (+ 2 dynamic templates) | ~61 |
| Admin | 44 (+ 4 dynamic templates) | ~116 |
| Platform | 1 | 1 |
| **Total templates** | **~68** | **~192** |

---

## 1. Public website

| Screen Name | Route | Purpose | Primary User | Main Actions | Current Problems | Recommended Simplification |
|-------------|-------|---------|--------------|--------------|------------------|------------------------------|
| Home / Landing | `/` | Marketing entry; introduces the society demo and links to role portals | Visitor, prospect | Read society overview; jump to Resident, Inspector, Admin, or Login | Duplicates Login portal chooser; no real auth story | Single CTA to Login; demote inline portal cards to one “Enter demo” flow |
| About | `/about` | Society background, address, committee highlights | Visitor | Read static content | Marketing page with no connection to logged-in product | Merge into Home or a single “About society” section on Home |
| Features | `/features` | Product capability marketing | Visitor, buyer | Scan feature list | Generic SaaS marketing; disconnected from actual shipped modules | Replace with live screenshots from Resident/Admin or remove until GTM |
| Gallery | `/gallery` | Photo gallery of apartment | Visitor | Browse images | Static; low value for ERP buyers | Fold into About or remove |
| Contact | `/contact` | Contact form and office details | Visitor | View phone/email; submit form (UI only) | Form has no backend; fake submission | Wire to backend or show office hours + click-to-call only |
| Login / Portal chooser | `/login` | Pick demo role portal (Resident, Inspector, Admin, Platform) | All roles (demo) | Select portal; no credentials | Not real authentication; same links as Home | Real login screen with role-based redirect after auth |

---

## 2. Resident portal

| Screen Name | Route | Purpose | Primary User | Main Actions | Current Problems | Recommended Simplification |
|-------------|-------|---------|--------------|--------------|------------------|------------------------------|
| Home (Dashboard) | `/resident` | At-a-glance: bill status, notices, visits, timeline preview, contacts | Resident (demo: Srinivas Malyala, Flat 110) | View due amount; open notices/payments/services; call committee | Long scroll dashboard duplicates dedicated pages (notices, payments, timeline, family) | Task-first home: one bill card + 2 urgent notices + 1 upcoming visit; link out for depth |
| Flat details | `/resident/flat` | Flat identity, occupancy, parking, monthly charge, quick links | Resident | View flat metadata; navigate to bills/family | Overlaps Profile and Home | Merge with Profile into one “My household” screen |
| Family | `/resident/family` | Household members and emergency committee contacts | Resident | View family list; call committee | Committee contacts duplicate Home contact cards | Keep family only; move committee to a single “Help & contacts” drawer |
| Activity timeline | `/resident/timeline` | Chronological log for the flat | Resident | Filter/read events | Duplicates timeline snippet on Home | Home shows last 5 events; full timeline stays as drill-down |
| Notices | `/resident/notices` | Society notices inbox | Resident | Search/filter; read notice cards | Fine as standalone | Keep; ensure Home shows unread count only |
| Work visits | `/resident/services` | Scheduled vendor/building visits | Resident | Filter visits; see today/this week | Naming (“Work visits”) may confuse vs “Services” | Rename nav to match mental model; badge “Today” on Home only |
| My bills | `/resident/payments` | Payment history and year summary | Resident | Filter payments; view status banner; read help card | No pay-online action (demo); help card adds noise | One balance hero + list; move help to empty state |
| My details | `/resident/profile` | Resident summary (identity + flat context) | Resident | View consolidated profile via `ResidentSummary` | Overlaps Flat details and Home header | Single “Account” page with flat + person |

**Resident chrome (not routes):** Bottom nav (Home, Bills, Notices, Profile); sidebar on desktop.

---

## 3. Inspector portal

| Screen Name | Route | Purpose | Primary User | Main Actions | Current Problems | Recommended Simplification |
|-------------|-------|---------|--------------|--------------|------------------|------------------------------|
| Home (Dashboard) | `/inspector` | Read-only society overview: financial snapshot, KPIs, people search, recent notices | Inspector | Jump to unpaid bills, flats, reports; search residents inline | Duplicates Reports and Maintenance KPIs; embeds full resident search | Today view: outstanding total + overdue count + search bar only |
| All flats | `/inspector/flats` | Searchable table of all flats | Inspector | Sort/filter; open flat detail | Good primary navigation | Keep as main “browse” entry |
| Flat detail | `/inspector/flats/[flatId]` (×55) | Read-only flat record: resident, family, bills | Inspector | View details; no edit | Two URL paths existed historically (blocks path redirects here) | Keep; ensure one canonical URL (done) |
| Search people | `/inspector/residents` | Resident directory with search | Inspector | Search; open flat detail | Duplicates dashboard embedded search and All flats | One “Find person” entry — remove duplicate from Home |
| Unpaid bills | `/inspector/maintenance` | Outstanding/overdue maintenance list | Inspector | Search/filter unpaid; open flat | Name “maintenance” vs nav “Unpaid bills” | Align URL label with nav; merge with Reports collection KPI |
| Reports | `/inspector/reports` | KPI cards linking to flats/maintenance | Inspector | View occupancy, collection, collected, overdue stats | Report dashboard with no unique reports; duplicates Home | Remove as page; link Home KPIs directly to Maintenance or Flats |
| Blocks browse | `/inspector/blocks` | Card list of blocks | Inspector | Open block flat list | **Not in sidebar nav** — orphan route | Remove or add to nav; prefer All flats |
| Block flat list | `/inspector/blocks/[blockId]` (×3; only A has data) | Flats table for one block | Inspector | Open flat detail | Redundant with All flats + filter | Remove; use All flats with block filter |
| Legacy flat redirect | `/inspector/blocks/[blockId]/flats/[flatId]` | Redirect to `/inspector/flats/[flatId]` | — | — | Not a screen | Keep redirect only |

---

## 4. Admin portal — Core & structure

| Screen Name | Route | Purpose | Primary User | Main Actions | Current Problems | Recommended Simplification |
|-------------|-------|---------|--------------|--------------|------------------|------------------------------|
| Mission Control (Dashboard) | `/admin` | Apartment command center | Admin, secretary | Review health stars, follow-ups, today ops, action center, activity, block summary | **4 numbered sections**, 8+ widgets, duplicates Finance/Reports/Residents metrics; “Future modules” clutter | Replace with **Today**: follow-up queue + record payment + publish notice + search |
| Structure redirect | `/admin/structure` | Redirect to Settings → Structure | — | — | Legacy URL | Keep redirect |
| Residents | `/admin/residents` | Search-first household directory | Admin | KPI cards; search directory; open Flat Ops Hub | StatCards duplicate Mission Control and Reports | Directory + search only; drop KPI row |
| Block dashboard | `/admin/blocks/[blockId]` (×3) | Block-level occupancy and finance snapshot | Admin | View block KPIs; drill to floors | Blocks B/C empty in demo; metrics repeat Finance/Reports | Only show blocks with flats; link from Structure not sidebar |
| Floor view | `/admin/blocks/[blockId]/floors/[floor]` (×5, Block A) | Floor grid of flats with status dots | Admin | Click flat → Flat Ops Hub | Competes with Explorer tree + Residents search | Keep Explorer path; demote floor grid to optional view |
| Flat Operations Hub | `/admin/flats/[flatId]` (×55) | **Single scroll** workspace for one household | Admin | Record payment, log comms, notes, follow-up (drawers); view owner/tenant/family/maintenance/timeline/docs | **11 sections** on one page; third follow-up queue in app | Tabbed profile: **Summary \| People \| Money \| Comms \| Docs**; actions in sticky header |

**Admin chrome (not routes):** Left sidebar (9 items), Explorer panel (280px), global search overlay (⌘K).

---

## 5. Admin portal — Finance

| Screen Name | Route | Purpose | Primary User | Main Actions | Current Problems | Recommended Simplification |
|-------------|-------|---------|--------------|--------------|------------------|------------------------------|
| Finance dashboard | `/admin/finance` | Treasurer overview: collection, outstanding, health | Admin, treasurer | Open outstanding/payments; view charts | Duplicates Mission Control + Reports collection | Merge into **Collections** workspace; no separate dashboard |
| Outstanding queue | `/admin/finance/outstanding` | Prioritized dues list | Treasurer | Search; open flat; record payment (drawer) | Overlaps Maintenance report and Mission Control follow-ups | **The** collection queue app-wide |
| Payments | `/admin/finance/payments` | Recorded payments by period | Treasurer | Search/filter; open flat; record payment | Fine | Keep under Collections |
| Receipts | `/admin/finance/receipts` | Receipt history and generation | Treasurer | Search receipts; generate receipt (drawer) | Split from Payments mentally | Tab under Collections: Payments \| Receipts |
| Statements | `/admin/finance/statements` | Flat/block/community statements | Treasurer | Generate/view statements (drawer) | Low traffic vs daily ops | Move under Reports or flat profile |
| Finance → Reports link | `/admin/finance/reports` | Pointer to central Reports module | Treasurer | Click through to `/admin/reports` | Extra hop | Remove page; link Reports in Finance sub-nav directly |
| Block finance | `/admin/finance/blocks/[blockId]` (×3) | Block-scoped finance summary | Treasurer | View block collection/outstanding | Duplicates block dashboard + reports drill-down | Drill-down from Outstanding only |

**Finance overlays (drawers):** Record payment, generate receipt, statement builder — opened from Finance and Flat Ops contexts.

---

## 6. Admin portal — Communication

| Screen Name | Route | Purpose | Primary User | Main Actions | Current Problems | Recommended Simplification |
|-------------|-------|---------|--------------|--------------|------------------|------------------------------|
| Communication hub | `/admin/communication` | Module landing: stats + links to notice workspaces | Admin, secretary | View summary; navigate to drafts/scheduled/history | Hub + tab nav duplicate; future channel badges | Remove hub; land on **Published** or **Drafts** |
| Notice drafts | `/admin/communication/drafts` | Draft notices list | Secretary | Search; compose/edit/publish (drawer) | Fine | Keep |
| Scheduled notices | `/admin/communication/scheduled` | Queued future publishes | Secretary | Search; edit schedule | Fine | Merge with Drafts as status filter |
| Notice history | `/admin/communication/history` | Published notices log | Secretary | Search; view/archive | Overlaps Archived | **Published** list with archive action |
| Archived notices | `/admin/communication/archived` | Retired notices | Secretary | Search; restore/view | Separate route for one status | Status filter on single Notices screen |

**Disabled future channels (UI badges only):** Circulars, announcements, emergency alerts, meetings, polls, events — no routes yet.

---

## 7. Admin portal — Assets (Facilities)

| Screen Name | Route | Purpose | Primary User | Main Actions | Current Problems | Recommended Simplification |
|-------------|-------|---------|--------------|--------------|------------------|------------------------------|
| Assets hub | `/admin/assets` | Facility dashboard: health, AMC, upcoming services | Admin, facility mgr | Navigate to catalog/services/AMC/vendors | Hub duplicates tab nav + Reports assets | Remove hub; default to Catalog |
| Asset catalog | `/admin/assets/catalog` | List of community assets | Facility mgr | Search; open asset profile | Fine | Keep as module home |
| Services | `/admin/assets/services` | Service visit log | Facility mgr | Filter services; schedule (drawer) | Overlaps asset profile timeline | Global log + link to asset |
| AMC contracts | `/admin/assets/amc` | AMC registry and expiry | Facility mgr | Track contracts; renew (drawer) | Duplicates asset profile AMC section | Single AMC view with asset filter |
| Vendors | `/admin/assets/vendors` | Vendor directory | Facility mgr | Manage vendor contacts | Fine | Keep |
| Asset profile | `/admin/assets/[assetId]` (×8) | Lift A/B, water tank, generator, fire, CCTV, garden, solar | Facility mgr | View specs, AMC, services, documents | Documents also live under Documents module | One profile; link out to docs |

**Asset instances:** `asset-lift-a`, `asset-lift-b`, `asset-water-tank`, `asset-generator`, `asset-fire-safety`, `asset-cctv`, `asset-garden`, `asset-solar`.

---

## 8. Admin portal — Documents

| Screen Name | Route | Purpose | Primary User | Main Actions | Current Problems | Recommended Simplification |
|-------------|-------|---------|--------------|--------------|------------------|------------------------------|
| Documents hub | `/admin/documents` | Upload summary + module links | Admin | View stats; navigate tabs | Hub duplicates tab nav | Remove hub; open Society tab by default |
| Society documents | `/admin/documents/society` | Bylaws, AGM minutes, policies | Secretary | Search; upload (drawer) | Fine | Keep |
| Flat documents | `/admin/documents/flats` | Per-flat document index | Secretary | Search by flat; upload | Overlaps Flat Ops documents section | Flat docs only in Flat Ops; society-wide here |
| Asset documents | `/admin/documents/assets` | Manuals, certificates, AMC files | Facility mgr | Search; upload | Overlaps asset profile | Filter on one Documents page |

---

## 9. Admin portal — Reports & analytics

| Screen Name | Route | Purpose | Primary User | Main Actions | Current Problems | Recommended Simplification |
|-------------|-------|---------|--------------|--------------|------------------|------------------------------|
| Reports hub | `/admin/reports` | Report type picker + summary stats | Admin, treasurer | Choose report; view KPIs | Hub duplicates sidebar; KPIs repeat Finance dashboard | Sidebar goes straight to report types; no hub |
| Collection report | `/admin/reports/collection` | Collection rate trends; block/floor/flat drill-down | Treasurer | Change scope (`?block=`, `?floor=`, `?flatId=`) | Overlaps Finance dashboard | Monthly export view; not daily driver |
| Financial report | `/admin/reports/financial` | Collected vs outstanding summary | Treasurer | Drill-down by scope | Duplicates Finance + Collection | Consolidate with Collection |
| Occupancy report | `/admin/reports/occupancy` | Owner/tenant/vacant breakdown | Secretary | Drill-down | Also on Residents KPIs | Keep for board meetings only |
| Maintenance report | `/admin/reports/maintenance` | Outstanding/overdue analysis | Treasurer | Drill-down | **Same data as Finance Outstanding** | Remove; Outstanding queue is operational view |
| Communication report | `/admin/reports/communication` | Notice publish stats | Secretary | View metrics | Low value vs Communication history | Merge into Communication analytics tab |
| Assets report | `/admin/reports/assets` | AMC/service compliance | Facility mgr | View compliance | Duplicates Assets hub | Merge into Assets module |
| Movement report | `/admin/reports/movement` | Move-in/move-out log | Secretary | Drill-down by block | Niche | Keep as People sub-report |

---

## 10. Admin portal — Settings (Apartment configuration)

| Screen Name | Route | Purpose | Primary User | Main Actions | Current Problems | Recommended Simplification |
|-------------|-------|---------|--------------|--------------|------------------|------------------------------|
| Settings hub | `/admin/settings` | Links to all configuration areas | Admin | Navigate settings sections | Hub duplicates sidebar Structure + Settings | Remove hub; sidebar items are enough |
| Apartment profile | `/admin/settings/profile` | Name, address, registration, branding | Admin | Edit profile (drawer) | Fine | Keep |
| Structure | `/admin/settings/structure` | Blocks, floors, flats configuration | Admin | Browse structure; open floor/flat | **Fourth way to find flats** (Explorer, Residents, Reports) | Structure for **edit** only; browsing via search |
| Maintenance config | `/admin/settings/maintenance` | Billing cycle, rates, penalties | Treasurer | Edit billing rules | Fine | Keep under Settings |
| Committee | `/admin/settings/committee` | RWA/committee members | Secretary | Manage members | Overlaps Contacts | Merge Committee into Contacts |
| Contacts | `/admin/settings/contacts` | Office and emergency contacts | Secretary | Edit contacts | Overlaps Committee | Single **People & contacts** settings |
| Team & roles | `/admin/settings/team` | Staff accounts and roles | Admin | Manage team (demo) | No real auth | Keep for SaaS; hide until backend |
| Preferences | `/admin/settings/preferences` | Integrations, notifications, locale | Admin | Toggle preferences | Placeholder-heavy | Ship when backend exists |

---

## 11. Platform portal

| Screen Name | Route | Purpose | Primary User | Main Actions | Current Problems | Recommended Simplification |
|-------------|-------|---------|--------------|--------------|------------------|------------------------------|
| Platform dashboard | `/platform` | Super-admin placeholder | Platform operator | Read phase placeholder | No functionality | Build when multi-tenant backend ships |

**Nav-only placeholders (disabled, no routes):** Apartments, Users, Subscriptions, Reports under `/platform/*`.

---

## 12. Global overlays & workflows (not standalone routes)

| UI Surface | Where | Purpose | Primary User | Main Actions | Current Problems | Recommended Simplification |
|------------|-------|---------|--------------|--------------|------------------|------------------------------|
| Global search (⌘K) | Admin shell | Search flats, residents, actions | Admin | Jump to flat, module, action | Competes with Residents directory | One search everywhere; prioritize flat/household |
| Explorer tree | Admin shell | Block → floor → flat navigation | Admin | Expand tree; open flat | Redundant with search | Collapsible; default closed on small screens |
| Finance action drawers | Finance + Flat Ops | Record payment, receipt, statement | Treasurer | Complete money workflows | Good pattern | Standardize as primary CRUD pattern |
| Flat Ops drawers | Flat Ops Hub | Log call, note, follow-up, upload doc | Admin | Household workflows | Good pattern | Keep; reduce on-page sections |
| Notice compose drawer | Communication | Create/edit/publish notices | Secretary | Draft and publish | Good pattern | Keep |

---

## 13. Cross-cutting IA problems (by theme)

| Theme | Affected screens | Recommended direction |
|-------|------------------|---------------------|
| Duplicate KPIs | Mission Control, Finance, Reports hub, Residents, Inspector Home/Reports | One metric home: **Today** for ops, **Reports** for board |
| Hub + tab duplication | Finance, Communication, Assets, Documents, Reports, Settings | Delete hub pages; tabs or sidebar only |
| Multiple find-flat paths | Explorer, ⌘K, Residents, Structure, floor grid | Search-first + optional Explorer |
| Three follow-up queues | Mission Control, Finance Outstanding, Flat Ops | Single prioritized queue on Today |
| Scroll-wall flat profile | Flat Ops Hub (11 sections) | Tabbed flat profile |
| Orphan inspector routes | `/inspector/blocks/*` | Remove or link from nav |
| Demo auth | Login, Home portals | Real auth before production |

---

## 14. Suggested simplified top-level map (reference)

```
Today (admin home)
├── Collections (outstanding + payments + receipts)
├── People (residents directory → flat profile)
├── Notices (drafts + published)
├── Assets (catalog + services)
├── Documents (society + filters)
└── Settings (profile, structure, billing, team)

Reports → monthly/board exports (demoted)
Platform → multi-tenant (future)
```

---

*This document is analysis-only. No application code was changed.*
