# Phase 7A — Apartment Admin Portal: Product Architecture

**Version:** 2.0 (Revised)  
**Status:** Pending Final Approval  
**Prerequisite:** Phase 6 UX Validation approved · Phase 7A v1 reviewed  
**Next step:** Final review → approval → Phase 7B (Dashboard implementation)

---

## Executive summary

The **Apartment Admin Portal** is the commercial operational heart of ApartmentERP — a platform that must serve **small apartments (20–100 flats)**, **medium communities (100–500 flats)**, and **large gated communities (500–5,000+ flats)** using **one architecture**, without redesign.

It is not a database editor. It is a **professional Apartment Operations Platform**.

**Revised core product laws:**

0. **Community Explorer is the signature feature** — a permanent Windows Explorer–style tree; the product differentiator for commercial Apartment ERP  
1. **Search AND browse** — global search for speed; Community Explorer for intuitive hierarchy navigation  
2. **Flat is the source of truth** — Flat Operations Hub answers all household questions  
3. **Block is a first-class entity** — Block Dashboards for staff assigned by tower/wing  
4. **Workflow beats CRUD** — drawers, queues, and wizards — not empty tables with Add buttons  
5. **Hierarchy is immutable** — Community → Block → Floor → Flat → everything else  
6. **Assets belong to the community** — services attach to assets, not floating schedules  
7. **Every screen answers one class of question** — operational · household · management · configuration  

**Payment policy (unchanged):** No payment gateway. Admin manually records payments. Residents view only.

---

## Admin philosophy (design north star)

The Admin Portal is organized around **four question types**. Every screen must map to exactly one:

| Question type | Answered by | Examples |
|---------------|-------------|----------|
| **Operational** | Operations Dashboard | How much collected today? Who needs follow-up? What's happening today? |
| **Household** | Flat Operations Hub | Who lives in Flat 110? What's their bill status? What happened here? |
| **Management** | Reports (+ drill-down) | How is Block C performing? Monthly collection trend? |
| **Configuration** | Settings | What's our maintenance rate? Who is on the committee? |

**Never:** A generic "list all records" screen as a landing page.  
**Always:** Workflow entry points — queues, alerts, explorer nodes, search results.

---

## Canonical data relationships (backend foundation)

This hierarchy is the **immutable foundation** for frontend, API, and database design. Nothing exists outside it.

```
Community (Apartment)
│
├── Block (Tower / Wing)                    ← first-class entity
│   ├── Floor (logical grouping)            ← derived from flats, navigable view
│   │   └── Flat (Unit)                     ← operational center
│   │       ├── Owner(s)
│   │       ├── Tenant(s) [optional]
│   │       ├── Family member(s)
│   │       ├── Emergency contact(s)
│   │       ├── Vehicle(s) [future]
│   │       ├── Bill(s)
│   │       ├── Payment(s)
│   │       ├── Receipt(s)
│   │       ├── Document(s)
│   │       ├── Internal note(s)
│   │       ├── Communication log [future]
│   │       ├── Follow-up record(s)
│   │       ├── Flat-scoped service visit(s)
│   │       └── Timeline event(s)           ← aggregated audit trail
│   │
│   └── Asset(s)                            ← community infrastructure
│       ├── Lift · Generator · Water tank · Fire safety · Garden · Solar · CCTV · EV chargers [future]
│       └── Each asset: vendor, AMC, service history, next due, status
│
├── Notice(s)                               ← society-wide communication
├── Document(s)                             ← society-wide files
├── Report snapshot(s)                      ← aggregated analytics
├── Staff / role assignment(s)              ← block-scoped optional
└── Settings                                ← rates, committee, integrations

Future modules (same hierarchy — no redesign):
├── Visitor [Community / Block / Flat]
├── Complaint [Flat → Block escalation]
├── Parking [Flat → Vehicle → Slot]
├── Facility booking [Community asset]
├── Inventory [Community / Block store]
├── Staff [Community / Block assignment]
├── Vendor [Community → Asset AMC]
└── Accounting [Community → Block → Flat ledger]
```

**Backend rule:** Every tenant-scoped table carries `apartment_id`. Block-scoped entities carry `block_id`. Flat-scoped entities carry `flat_id`. Timeline events reference the narrowest applicable scope.

---

## Scale matrix (one architecture, three experiences)

| Dimension | Small (20–100) | Medium (100–500) | Large (500–5,000+) |
|-----------|----------------|--------------------|--------------------|
| **Primary navigation** | Search + Explorer (1 block) | Search + Explorer | Search + Explorer (required) |
| **Block dashboard** | Optional collapse | Visible per block | Essential — staff by block |
| **Floor view** | Simple list | Floor tabs within block | Floor grid with status colors |
| **Explorer default** | Expanded single block | Block list collapsed | Block search + lazy expand |
| **Dashboard overdue list** | Show all (≤20) | Top 8 + "View all" | Top 8 + block breakdown |
| **Flat list pagination** | Optional | 25/page | 25/page, never load all |
| **Asset registry** | Society-level only | Block + society | Per-block asset trees |

**Design rule:** Components built for 5,000 flats must not feel empty at 20 flats. Components built for 20 flats must not break at 5,000.

---

## Application shell layout

The Admin shell has **three persistent navigation systems** working together:

```
┌─────────────────────────────────────────────────────────────────────────┐
│ HEADER: Community Explorer toggle │ ⌘K Search │ [+ Record payment]    │
├──────────────┬──────────────────────────────────────────────────────────┤
│              │                                                          │
│  COMMUNITY   │  MAIN CONTENT AREA                                       │
│  EXPLORER    │  (Dashboard · Block Dashboard · Floor View ·             │
│  (tree)      │   Flat Ops · Modules)                                    │
│              │                                                          │
│  ─────────   │                                                          │
│  SIDEBAR     │                                                          │
│  (modules)   │                                                          │
│              │                                                          │
└──────────────┴──────────────────────────────────────────────────────────┘
```

| System | Role |
|--------|------|
| **Community Explorer** | Visual hierarchy — browse like a building map |
| **Global search (⌘K)** | Fastest path when Admin knows flat/name/phone |
| **Module sidebar** | Deep work — Bills, Notices, Reports, Settings |

Search does not replace Explorer. **Both are permanent.**

---

## Signature feature: Community Explorer

**Why this makes ApartmentERP stand out**

Most apartment software is either **search-only** (fails when staff don't know names) or **table-only** (fails at 500+ flats). Community Explorer gives office staff a **physical map of the community** — like Windows Explorer for buildings — always visible, always one click from any flat.

This is not a secondary feature. It is **the primary spatial navigation system** for the Admin Portal.

### Reference tree (exact interaction model)

```
🏢 Sylvan Shelter Apartment
▼ Block A
   ▼ Floor 1
      🏠 101   🟢 Paid
      🏠 102   🟢 Paid
      🏠 103   🟡 Due soon
      🏠 104   🟢 Paid
   ▼ Floor 2
      🏠 201   🟢 Paid
      🏠 202   🔴 Overdue
      🏠 203   ⚪ Vacant
▼ Block B
▼ Block C
```

**Production UI note:** Use Lucide icons + semantic color dots (not emoji). The tree above is the **interaction spec**; implementation uses design tokens:

| Indicator | Meaning | Token |
|-----------|---------|-------|
| Green dot | Paid — maintenance up to date | `success` |
| Amber dot | Due soon — pending bill | `warning` |
| Red dot | Overdue — follow-up required | `destructive` |
| Gray dot | Vacant — no resident | `muted` |

### Windows Explorer behaviour

| Explorer pattern | ApartmentERP equivalent |
|------------------|-------------------------|
| Folder tree always visible | Community Explorer permanent left panel |
| Expand / collapse nodes | Block ▼ Floor ▼ Flat |
| Single-click file opens | Single-click flat → **Flat Operations Hub** |
| Remember expanded folders | Remember expanded blocks/floors (localStorage) |
| Search box filters tree | Filter-within-tree highlights matches |
| Status overlay on files | Colored dot on each flat node |

### Non-negotiable rules

1. **Permanent** — visible on every Admin route (desktop); drawer on mobile  
2. **One click to Flat Ops** — clicking any flat never opens an intermediate list  
3. **Status at a glance** — every flat node shows bill status dot without opening it  
4. **Scales lazily** — full tree for ≤100 flats; lazy-load floors/blocks at 500+  
5. **Syncs with route** — opening Flat 202 from search or dashboard highlights `Block A → Floor 2 → 202` in tree  

### What Explorer replaces

Explorer **does not replace** Dashboard, Bills, or Notices modules. It replaces the need to **browse flats through tables and menus**. The Flats module becomes a secondary list view; Explorer is how staff **navigate the building**.

---

## 1. Community Explorer (permanent — full specification)

### Purpose

Large communities cannot rely on search alone. Office staff — especially those assigned to a block — think spatially: *"Block A, Floor 2, flat 204."*

The Community Explorer is a **persistent, collapsible tree** that mirrors the physical community.

### Tree structure

```
Sylvan Shelter Apartment
├── Block A                          [● 8 overdue · 2 vacant]
│   ├── Floor 1                      [6 flats]
│   │   ├── 101  Owner    Paid
│   │   ├── 102  Tenant   Pending
│   │   └── ...
│   ├── Floor 2
│   │   ├── 201  Owner    Paid
│   │   ├── 204  Tenant   Overdue  ← status dot
│   │   └── ...
│   └── Floor 3 …
├── Block B                          [● 3 overdue]
└── Block C
```

### Interactions

| Action | Result |
|--------|--------|
| Click **Block** | Opens **Block Dashboard** |
| Click **Floor** | Opens **Floor View** |
| Click **Flat** | Opens **Flat Operations Hub** |
| Expand / Collapse | Remember state per admin (localStorage) |
| Search within tree | Filter nodes; highlight matches; auto-expand path |
| Status indicators | Paid (green) · Pending (amber) · Overdue (red) · Vacant (gray) |
| Occupancy indicators | Owner · Tenant · Vacant icon on flat node |

### Explorer behavior at scale

| Flats | Behavior |
|-------|----------|
| ≤ 100 | Load full tree; all blocks expanded by default |
| 100–500 | Lazy-load floors on block expand |
| 500+ | Block list only until expand; floor flats paginated inside node OR open Floor View |

### Placement (Windows Explorer model)

```
┌──────────────────┬────────────────────────────────────────────┐
│ COMMUNITY        │  MAIN CONTENT                              │
│ EXPLORER         │  Dashboard · Block · Floor · Flat Ops ·    │
│ (permanent)      │  Bills · Notices · Reports · …             │
│                  │                                            │
│ 🏢 Sylvan Shelter│                                            │
│ ▼ Block A        │                                            │
│   ▼ Floor 1      │                                            │
│     🏠 101 🟢    │                                            │
│     🏠 102 🟢    │                                            │
│   ▼ Floor 2      │                                            │
│     🏠 201 🟢    │                                            │
│                  │                                            │
│ ─────────────    │                                            │
│ Module links     │  (Dashboard · Bills · Notices · …)         │
│ (compact)        │                                            │
└──────────────────┴────────────────────────────────────────────┘
```

- **Desktop:** Explorer panel **280px**, always visible; collapsible to 48px icon rail showing block badges only  
- **Mobile:** Explorer opens as full-height drawer; breadcrumb shows current path when closed  
- **Keyboard:** `⌘B` focus explorer · `↑↓` navigate tree · `Enter` open flat  
- **Module nav:** Compact links at bottom of Explorer panel (or thin secondary sidebar) — Dashboard, Bills, Notices, etc.  

Explorer is the **left panel**. Modules are **secondary**. Spatial navigation is primary.

### Route sync

Explorer selection highlights current route:

- `/admin/blocks/[blockId]` → Block node active  
- `/admin/blocks/[blockId]/floors/[floor]` → Floor node active  
- `/admin/flats/[flatId]` → Flat node active; auto-expand ancestors  

---

## 2. Block Dashboard (first-class entity)

### Purpose

Large communities assign staff by block. The Block Dashboard is a **mini operations center** for one tower/wing.

**Route:** `/admin/blocks/[blockId]`

### Entry points

- Community Explorer → click Block  
- Reports drill-down → click Block row  
- Dashboard widget → "Block A: 8 overdue" link  

### Block Dashboard widgets (each answers one question)

| Widget | Question answered |
|--------|-------------------|
| **Total flats** | How big is this block? |
| **Occupied / Vacant** | Occupancy health? |
| **Collected this month** | Block collection performance? |
| **Outstanding** | How much is this block owed? |
| **Overdue count** | Which block needs attention? |
| **Upcoming services** | What's scheduled for this block? |
| **Recent move-ins (7d)** | New residents in this block? |
| **Recent notices** | Block-relevant announcements? |
| **Follow-up queue (block-scoped)** | Who in this block needs a call? |
| **Floor summary grid** | Quick jump to any floor |

### Block Dashboard layout

```
Block A · Tower A · 120 flats
┌──────────┬──────────┬──────────┬──────────┐
│ Occupied │ Vacant   │ Collected│ Outstanding│
│ 112      │ 8        │ ₹1.4L    │ ₹18,200   │
├──────────┴──────────┴──────────┴──────────┤
│ FLOOR GRID (click → Floor View)            │
│ F1 [6] · F2 [6] · F3 [6] · … F20 [6]      │
├────────────────────────────────────────────┤
│ BLOCK FOLLOW-UP QUEUE │ UPCOMING SERVICES  │
├────────────────────────────────────────────┤
│ RECENT MOVE-INS       │ RECENT ACTIVITY    │
└────────────────────────────────────────────┘
```

### Block staff assignment (future-ready)

Settings allows assigning Admin/Staff users to blocks. When assigned, dashboard and explorer default to **their block(s)**. Architecture supports this in v1 via `block_id` filter preference — full RBAC in backend phase.

---

## 3. Floor View (building navigation)

### Purpose

Make Admin feel like they are **walking through a building**, not scrolling a spreadsheet.

**Route:** `/admin/blocks/[blockId]/floors/[floorNumber]`

### Entry points

- Community Explorer → click Floor  
- Block Dashboard → floor grid tile  
- Floor breadcrumb from Flat Ops  

### Floor View layout

```
Block A · Floor 2 · 6 flats

┌──────┬──────┬──────┬──────┬──────┬──────┐
│ 201  │ 202  │ 203  │ 204  │ 205  │ 206  │
│ Paid │ Paid │ Vac  │ Over │ Pend │ Paid │
│ Owner│ Ten  │  —   │ Ten  │ Owner│ Owner│
└──────┴──────┴──────┴──────┴──────┴──────┘

Legend: Paid · Pending · Overdue · Vacant
        Owner occupied · Tenant occupied
```

### Flat tile content (each cell)

- Flat number (large)  
- Status badge: Paid / Pending / Overdue / Vacant  
- Occupancy: Owner / Tenant / —  
- Resident surname (truncated)  
- Tap → Flat Operations Hub  

### Floor View at scale

- Max ~20 flats per floor typical; grid wraps on mobile (2 columns)  
- For atypical floors (40+ commercial units): switch to **list view** with same filters  

### Smart filters (on Floor View — never leave page)

Block and floor pre-selected. Additional filters: Status · Occupancy · Overdue only · Search flat number.

---

## 4. Flat Operations Hub (single source of truth)

The heart of the entire ERP. **Route:** `/admin/flats/[flatId]`

When Admin opens a flat, **every household question** is answered on one scrollable page.

### Section architecture

| # | Section | Content | Actions |
|---|---------|---------|---------|
| 1 | **Summary header** (sticky) | Block, floor, flat, area, type, occupancy, status badges | Breadcrumb via Explorer |
| 2 | **Owner** | Name, phone, email, since | Edit drawer · Call · Email |
| 3 | **Tenant** | If applicable — lease dates | Edit · End lease |
| 4 | **Family** | All members + relationships | Add · Edit · Remove |
| 5 | **Emergency contacts** | Primary + alternate | Edit · Call |
| 6 | **Vehicles** | Future-ready placeholder | Add (Phase 8+) |
| 7 | **Maintenance (current)** | This month status, outstanding, last payment | Record payment drawer |
| 8 | **Maintenance history** | All bills + payments + receipts (paginated) | Print statement · Export |
| 9 | **Service history** | Flat-scoped + building visits affecting flat | Schedule · Mark complete |
| 10 | **Occupancy history** | Owner/tenant changes over time | Add move-in/out record |
| 11 | **Documents** | Flat uploads + linked receipts | Upload · Download |
| 12 | **Internal notes** | Staff-only notes (not visible to residents) | Add note · Pin |
| 13 | **Communication history** | Calls, SMS, WhatsApp log (future) | Log call · Log message |
| 14 | **Follow-up** | Active follow-up record if overdue | Update · Resolve |
| 15 | **Timeline** | Unified chronological audit | Filter by type · Load more |
| 16 | **Quick actions bar** (sticky mobile) | See below | Always visible |

### Quick actions (sticky)

```
Record payment · Edit owner · Edit tenant · Add family · Add note · Log call ·
Create notice · Schedule visit · Print statement · Download history
```

### Timeline event types (complete list)

Every event appears in chronological order on Flat Ops and in aggregated feeds:

| Event type | Example |
|------------|---------|
| Owner changed | "Owner registered — Srinivas Malyala" |
| Tenant changed | "Tenant move-in — Priya Sharma" |
| Tenant vacated | "Tenant lease ended" |
| Family updated | "Family member added — Karthik" |
| Payment recorded | "June 2025 paid — ₹1,300 — Receipt #R-042" |
| Bill generated | "July 2025 bill issued — ₹1,300" |
| Notice sent | "Notice: Power shutdown (society-wide)" |
| Document uploaded | "Sale deed uploaded" |
| Service completed | "Pest control completed — Hyderabad Pest Care" |
| Service scheduled | "Lift maintenance scheduled — Jul 15" |
| Internal note added | "Staff note: Owner promised payment Friday" |
| Follow-up logged | "Called — resident promised payment Jul 5" |
| Communication logged | "SMS reminder sent" [future] |

**Timeline rule:** Write operations auto-append timeline events. Admin never manually creates timeline entries.

### Flat Ops — lazy loading

For performance at scale, sections 8–14 load on expand or tab select. Summary + maintenance current + timeline (last 10) load immediately.

---

## 5. Community Assets (infrastructure registry)

### Problem with "Services module only"

Floating service schedules without asset context do not scale. A lift in Block A and a lift in Block C are different assets with different vendors and AMC contracts.

### Asset hierarchy

```
Community (Apartment)
└── Block [optional — asset may be society-wide]
    └── Asset
        ├── Lift (Block A — Lift 1)
        ├── Generator (Basement)
        ├── Water tank (Rooftop)
        ├── Fire safety system
        ├── Garden / Landscaping
        ├── Solar
        ├── CCTV
        └── EV chargers [future]
```

Society-wide assets (no block): main gate CCTV, community hall AC.

### Asset record fields

| Field | Purpose |
|-------|---------|
| Name | "Block A — Lift 1" |
| Type | Lift · Generator · Water tank · … |
| Block | Optional scope |
| Vendor | Current service provider |
| AMC contract | Start, end, annual cost |
| Frequency | Monthly · Quarterly · Annual |
| Last service date | |
| Next due date | Drives alerts |
| Status | Active · Due soon · Overdue · Inactive |
| Service history | Linked visits |
| Documents | AMC PDF, inspection certificates |

### Asset → Service → Resident connection

```
Asset (Lift Block A)
  └── Service visit scheduled (Jul 15)
        └── Notice auto-suggested to Block A residents
              └── Timeline event on each affected flat [optional]
```

**Module nav:** Assets live under **Services** as primary view, or separate **Assets** sub-nav within Services — not a disconnected schedule list.

### Asset dashboard widgets (on Block Dashboard + Operations Dashboard)

- Assets due this week  
- Overdue AMC services  
- Vendor visit today  

---

## 6. Operations Dashboard — widget specification (Phase 7B)

The dashboard has **no empty space**. Every widget answers an operational question. Dense but scannable — cards and lists, not tables.

### Required widgets (all Phase 7B)

| Widget | Question | Format | Max items | Drill-down |
|--------|----------|--------|-----------|------------|
| **Today's collections** | How much money came in today? | Stat card + list | 5 payments | Bills · Flat Ops |
| **Outstanding** | Total society dues? | Stat card | — | Bills (overdue filter) |
| **Critical alerts** | What needs urgent attention? | Alert banner | 3 | Context link |
| **Today's tasks** | What must I complete today? | Checklist queue | 8 | Task target |
| **Upcoming services** | What vendor work is scheduled? | Timeline list | 5 | Asset / Services |
| **Recent payments** | What was recorded recently? | Activity list | 5 | Flat Ops |
| **Recent activity** | What happened in the society? | Feed | 8 | Flat Ops / module |
| **Move-ins (7d)** | Who joined recently? | List | 5 | Flat Ops |
| **Move-outs (7d)** | Who left recently? | List | 5 | Flat Ops |
| **Pending follow-ups** | Who am I chasing for payment? | Follow-up queue | 5 | Flat Ops |
| **Draft notices** | Unpublished announcements? | List | 3 | Notices |
| **Quick actions** | What can I do right now? | Button bar | — | Drawers |
| **Collection rate (month)** | Are we on track? | Stat card + sparkline | — | Reports |
| **Block summary** | Which block needs attention? | Mini cards | 4 blocks | Block Dashboard |

### Dashboard layout (revised — no dead space)

```
┌─ HEADER: Explorer │ ⌘K Search │ Sylvan Shelter │ [+ Record payment] ─────────┐
├─ CRITICAL ALERTS (conditional, full width) ────────────────────────────────────┤
├─ KPI STRIP: Today │ Outstanding │ Overdue │ Visits │ Collection % ─────────────┤
├─ QUICK ACTIONS (full width bar) ───────────────────────────────────────────────┤
├─ TODAY'S TASKS ────────────────┬─ UPCOMING SERVICES ──────────────────────────┤
├─ FOLLOW-UP QUEUE ──────────────┼─ TODAY'S COLLECTIONS ────────────────────────┤
├─ RECENT ACTIVITY ──────────────┼─ MOVE-INS │ MOVE-OUTS ───────────────────────┤
├─ BLOCK SUMMARY (medium/large communities only) ────────────────────────────────┤
├─ DRAFT NOTICES (conditional) ──────────────────────────────────────────────────┤
└─ COMPLAINTS STUB (future: "3 open complaints →") ─────────────────────────────┘
```

**Small community (1 block):** Block summary widget merges into KPI strip.  
**Large community:** Block summary shows top 4 blocks by overdue count.

---

## 7. Follow-up Queue (operational CRM)

Showing "Pending ₹2,600" is not enough. Staff need **context and next action**.

### Follow-up record schema

| Field | Example |
|-------|---------|
| Flat | 204 |
| Block / Floor | Block A · Floor 2 |
| Resident | Rajesh Kumar (tenant) |
| Amount pending | ₹2,600 |
| Days overdue | 45 |
| Last contact | Called yesterday · 4:30 PM |
| Last outcome | "Resident promised payment Friday" |
| Next follow-up | Monday, Jul 7 |
| Assigned to | Office staff / Treasurer |
| Status | Open · Promised · Escalated · Resolved |

### Queue views

| View | Where shown |
|------|-------------|
| Society-wide queue | Operations Dashboard |
| Block-scoped queue | Block Dashboard |
| Flat-scoped record | Flat Ops → Follow-up section |
| Full queue module | Bills → Follow-ups tab |

### Queue actions (each row)

```
[Call] [Log follow-up] [Record payment] [Open flat]
```

**Log follow-up drawer:** Date · Channel (call/SMS/in-person) · Outcome text · Next follow-up date · Promised payment date.

### Priority sorting

1. Promised date passed (broken promise)  
2. Longest overdue  
3. Highest amount  
4. Next follow-up date due today  

---

## 8. Smart Filters (universal pattern)

Every list module uses the same **Smart Filter Bar** — filters apply inline without leaving the page.

### Standard filter dimensions

| Filter | Applies to |
|--------|------------|
| **Search** | All modules — text |
| **Block** | Flats, Bills, Reports, Follow-ups, Floor View |
| **Floor** | Flats, Bills, Floor View (requires block) |
| **Month** | Bills, Reports, Collections |
| **Status** | Bills (paid/pending/overdue), Notices (draft/published), Services (scheduled/completed) |
| **Occupancy** | Flats, Floor View (owner/tenant/vacant) |
| **Overdue only** | Bills, Follow-ups, Flats |
| **Owner / Tenant** | Flats, Bills |

### Smart Filter Bar component (shared)

```
[🔍 Search...] [Block ▼] [Floor ▼] [Month ▼] [Status ▼] [More ▼]  ·  Showing 24 of 142
```

- Filters persist in URL query params (shareable links)  
- Explorer selection pre-fills Block/Floor filters  
- "Clear all" restores module default view  
- Mobile: filters collapse into sheet  

---

## 9. Reports (interactive drill-down)

Reports answer **management questions**. They are not static PDFs.

### Drill-down hierarchy (every report)

```
Community total
  └── click Block row
        └── Block report
              └── click Floor row
                    └── Floor report
                          └── click Flat row
                                └── Flat Operations Hub
```

### Report types

| Report | Community view | Drill-down |
|--------|----------------|------------|
| Collection | Total collected vs target | Block → Floor → Flat payment |
| Pending dues | Total outstanding | Block → Floor → Flat overdue |
| Occupancy | Owner/tenant/vacant % | Block → Floor → Flat list |
| Move-ins | Count + list | Flat Ops |
| Move-outs | Count + list | Flat Ops |
| Maintenance status | Paid/pending/overdue counts | Flat Ops |
| Asset compliance | AMC overdue assets | Asset detail |
| Follow-up effectiveness | Resolved vs open | Follow-up record |

### Report UX rules

- Every number is **clickable** — navigates to scoped view  
- Export (PDF/Excel) is secondary action — not the primary interface  
- Charts appear here (not on Operations Dashboard)  
- Date range picker: month · quarter · custom  
- Compare: vs previous period (future)  

---

## 10. Future-proof module map

Future modules plug into the hierarchy without redesign:

| Future module | Primary attachment | Dashboard widget |
|---------------|-------------------|------------------|
| **Visitor management** | Flat (guest) + Block (gate) | Expected visitors today |
| **Complaints** | Flat → escalate to Block | Open complaints count |
| **Parking** | Flat → Vehicle → Slot | — |
| **Facility booking** | Community asset | Bookings today |
| **Inventory** | Block store / society store | Low stock alerts |
| **Staff management** | Community + block assignment | Staff on duty |
| **Vendor management** | Community → Asset AMC | Vendor visit today |
| **Accounting / GL** | Community ledger | Monthly P&L link |

**Architecture pattern for every future module:**

1. Scoped entity (`apartment_id` minimum)  
2. Optional `block_id` / `flat_id`  
3. Timeline event on write  
4. Dashboard widget when operational relevance exists  
5. Explorer node badge when block/flat scoped  

---

## Global search (unchanged priority — complements Explorer)

Search remains **fastest path** for staff who know what they want.

| Field | Opens |
|-------|-------|
| Block, floor, flat, owner, tenant, family, mobile | **Flat Operations Hub** |
| Asset name | **Asset detail** |
| Notice title | **Notices module** |

⌘K everywhere. Explorer always visible for browse preference.

---

## Module navigation (revised)

```
🏠 Dashboard          Operations Home
🗺 Community          Explorer-focused browse (Blocks · Floats · Assets)
💰 Bills              Collections · Follow-ups · Receipts
📢 Notices            Publish · Drafts · Archive
🛠 Services           Assets · Visits · AMC · Vendors
📁 Documents          Society + flat files
📊 Reports            Interactive drill-down
⚙ Settings            Profile · Rates · Committee · Staff
```

**"Community"** module opens Explorer + Block browser when Explorer panel is collapsed on mobile.

### Route map (revised — not implemented)

| Route | Purpose |
|-------|---------|
| `/admin` | Operations Dashboard |
| `/admin/blocks/[blockId]` | Block Dashboard |
| `/admin/blocks/[blockId]/floors/[floor]` | Floor View |
| `/admin/flats/[flatId]` | Flat Operations Hub |
| `/admin/assets` | Asset registry |
| `/admin/assets/[assetId]` | Asset detail + service history |
| `/admin/bills` | Bills + Follow-up queue |
| `/admin/notices` | Notices |
| `/admin/services` | Service calendar (asset-linked) |
| `/admin/documents` | Documents |
| `/admin/reports` | Reports hub |
| `/admin/reports/[reportType]` | Scoped report |
| `/admin/settings` | Settings |

---

## Phased implementation plan (revised approval gates)

| Phase | Deliverable | Key additions in v2 |
|-------|-------------|---------------------|
| **7A** | Product architecture (this document) | Explorer, Block Dashboard, Floor View, Assets, Follow-up CRM |
| **7B** | Operations Dashboard | All widgets · Quick actions · Follow-up queue preview |
| **7C** | **Community Explorer** + Block Dashboard + Floor View | **Signature feature** — permanent tree, status dots, lazy scale |
| **7D** | Flat Operations Hub | Full sections · Timeline · Internal notes · Histories |
| **7E** | Bills + Follow-up Queue | Record payment · Follow-up CRM · Smart filters |
| **7F** | Assets + Services | Asset registry · AMC · Linked visits |
| **7G** | Notices + Documents | Publish workflow · Upload |
| **7H** | Reports + Settings | Drill-down reports · Configuration |

**Note:** 7B and 7C order may merge partially — Explorer shell can appear in 7B as collapsed stub. Full tree in 7C.

After each phase: explain built · how it works · why — **wait for approval**.

---

## UI guidelines (unchanged + additions)

| Principle | Application |
|-----------|-------------|
| Explorer tree | Indent 16px per level; status dot on flat nodes |
| Floor grid | Color-coded tiles; min 80px tap target |
| Block dashboard | Same widget language as Operations Dashboard |
| Follow-up queue | Outcome text truncated; expand on tap |
| Internal notes | Yellow-tinted staff-only badge |
| No emoji in production UI | Lucide icons only |
| Reuse Phase 6 tokens | `surface-card`, `ListToolbar`, `ActivityTimeline`, `EmptyState` |

---

## Admin vs Inspector vs Resident (unchanged boundaries)

Admin is the **only write role** for society operations. Inspector remains read-only field lookup. Resident remains self-service view.

Admin extends Inspector patterns — does not copy Inspector pages with edit buttons.

---

## Open questions for final approval

1. **Explorer panel width** — 260px fixed or resizable? *(Recommend: 260px fixed, collapsible.)*  
2. **"Community" nav item** — separate from Explorer panel or Explorer replaces it on desktop? *(Recommend: Explorer is panel; "Community" nav on mobile opens Explorer drawer + Block list.)*  
3. **Internal notes visibility** — Admin-only or Admin + assigned Inspector? *(Recommend: Admin-only v1.)*  
4. **Asset module in 7F** — separate nav item or sub-section of Services? *(Recommend: sub-section of Services until >20 assets.)*  
5. **Follow-up auto-create** — auto-open follow-up when bill overdue > 7 days? *(Recommend: yes, with manual resolve.)*  

---

## Success criteria

| Metric | Target |
|--------|--------|
| Flat reachable via search | ≤ 2 clicks |
| Flat reachable via Explorer | ≤ 3 clicks (block → floor → flat) |
| Record payment | < 30 seconds |
| Follow-up context visible | 100% of overdue flats in queue |
| Block staff can work block-only | Yes (block filter everywhere) |
| Scale 20 flats | No empty UI |
| Scale 5,000 flats | No full-tree load; lazy expand |
| Admin training | < 15 minutes |

---

## Approval gate

| Item | Status |
|------|--------|
| Phase 6 UX Validation | ✅ Approved |
| Phase 7A v1 Architecture | ✅ Reviewed |
| **Phase 7A v2 Architecture (this document)** | ⏳ **Pending final approval** |
| Phase 7B+ implementation | ⛔ Blocked |

**To proceed:** Reply **"Phase 7A v2 approved — begin 7B Dashboard"** or provide final feedback.

---

## Related documents

- [`ADMIN_PRODUCT_DESIGN.md`](./ADMIN_PRODUCT_DESIGN.md) — Phase 7 initial design (superseded by v2)  
- [`PHASE_6_VALIDATION_REPORT.md`](./PHASE_6_VALIDATION_REPORT.md)  
- [`ARCHITECTURE.md`](./ARCHITECTURE.md) — Backend blueprint  
- [`DEVELOPMENT_PLAN.md`](./DEVELOPMENT_PLAN.md) — Master phase tracker  
