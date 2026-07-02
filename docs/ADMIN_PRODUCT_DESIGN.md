# Apartment Admin Portal — Product Design Document

**Version:** 1.0  
**Phase:** 7 — Admin Product Design (Design Only — No Implementation)  
**Status:** Pending Approval  
**Authors:** Product + UX Architecture  
**Prerequisite:** Phase 6 Validation approved  

---

## Document purpose

This document defines the **Apartment Admin Portal** as an **Operations Dashboard** — the command center for running a housing society day-to-day. It is not a CRUD/back-office data entry system.

Implementation must not begin until this document is reviewed and explicitly approved.

**Design principles inherited from Phase 6:**

- Answer the most important questions in the **first 10 seconds**
- **3 clicks or fewer** for daily tasks
- **Mobile-aware** (admin staff often work from phone at gate/office)
- **Connected data** — flat → resident → bills → notices → timeline
- **Manual payment recording** in v1 (no payment gateway)
- Plain language navigation (no ERP jargon)

**Role boundary:**

| Role | Purpose |
|------|---------|
| **Apartment Admin** | Operate the society — record payments, publish notices, manage people, run collections |
| **Inspector** | Read-only field lookup (already built) |
| **Resident** | Self-service view (already built) |

Admin is the **only role that writes** society operational data in Phase 7.

---

## 1. Daily responsibilities of an Apartment Admin

An Apartment Admin (typically RWA Secretary, Treasurer, or office manager) is responsible for **keeping the society running smoothly** — not for configuring software.

### Core daily work

| Responsibility | What it means in practice |
|----------------|---------------------------|
| **Collect maintenance** | Record payments received (cash, UPI, bank transfer), issue receipts |
| **Follow up on dues** | Identify overdue flats, call/message owners, log follow-up |
| **Respond to residents** | Answer questions about bills, visits, notices |
| **Publish updates** | Post notices about outages, meetings, vendor visits |
| **Coordinate vendors** | Confirm today's lift/plumber/tank cleaning visits |
| **Update household records** | Register new tenants, family members, move-outs |
| **Monitor gate/security issues** | Escalate emergencies (future complaints module) |

### Secondary responsibilities (weekly/monthly)

- Generate collection reports for committee meetings  
- Schedule upcoming vendor maintenance  
- Upload documents (bylaws, AGM minutes, receipts)  
- Review occupancy changes (vacant flats, new owners)  
- Prepare AGM / monthly meeting summaries  

### What Admin is NOT doing daily

- Editing block/floor structure (rare)  
- Configuring software settings (rare)  
- Bulk data imports (occasional onboarding)  
- Platform/billing administration (Super Admin)  

**Product implication:** The dashboard optimizes for **money, people, and today's schedule** — not for database management.

---

## 2. First 10 seconds after login

When Admin opens the app, they should immediately know **"How is the society doing today?"**

### Primary answer strip (top of dashboard)

```
Good morning, [Name] · Sylvan Shelter · July 2025

[Collected today: ₹4,500]  [Outstanding: ₹32,500]  [Overdue flats: 8]  [Visits today: 2]
```

### Alert banner (if any)

Priority-ordered, max 3 visible:

- 🔴 **3 flats overdue > 30 days** — follow up required  
- 🟡 **Water tank cleaning today 9 AM** — vendor confirmed  
- 🟡 **Draft notice unpublished** — Power shutdown reminder  

### Today's operations panel (below fold, still visible on desktop)

| Section | Content |
|---------|---------|
| **Collections today** | List of payments recorded today + quick "Record payment" |
| **Follow-up needed** | Overdue flats sorted by amount/days, tap to call |
| **Today's visits** | Scheduled vendor work with flat/building scope |
| **Recent activity** | Timeline: payment recorded, notice published, tenant registered |

### Global affordances (always available)

- **⌘K Search** — flat, owner, tenant, phone (reuse Inspector pattern)  
- **+ Record payment** — primary action button in header  
- **+ Publish notice** — secondary action  

**10-second test:** Admin can state: how much collected, how many overdue, what's happening today, and whether anything needs urgent action — **without clicking**.

---

## 3. Task frequency matrix

### Every day

| Task | Typical user | Dashboard or module? |
|------|--------------|----------------------|
| Record maintenance payment | Treasurer / office staff | Dashboard quick action → Payment drawer |
| Check overdue flats | Treasurer / secretary | Dashboard alert + Follow-up list |
| Look up a resident | Office staff | Global search |
| Confirm vendor visit | Office staff | Dashboard "Today's visits" |
| Publish urgent notice | Secretary | Dashboard quick action or Notices |
| Answer resident phone query | Anyone | Search → Flat summary |

### Every week

| Task | Typical user | Dashboard or module? |
|------|--------------|----------------------|
| Review collection progress | Treasurer | Dashboard + Reports snapshot |
| Send payment reminders | Treasurer | Maintenance → Overdue → Bulk remind (future) |
| Schedule vendor visits | Secretary | Services module |
| Update tenant/family records | Office staff | Residents → Flat → Edit |
| Review draft notices | Secretary | Notices → Drafts |

### Every month

| Task | Typical user | Dashboard or module? |
|------|--------------|----------------------|
| Generate monthly collection report | Treasurer | Reports |
| Close billing cycle | Treasurer | Maintenance → Generate bills (future) |
| Committee meeting prep | Secretary | Reports export |
| Review vacant flats | Secretary | Dashboard KPI → Flats filter |
| Upload AGM minutes | Secretary | Documents |

### Occasionally

| Task | Frequency | Module |
|------|-----------|--------|
| Add new flat owner | Move-in / sale | Residents |
| Change maintenance rate | AGM decision | Settings |
| Add block/floor structure | New construction | Structure (Settings) |
| Bulk import residents | Onboarding | Settings → Import |
| Configure roles | New staff | Settings → Team |

---

## 4. Actions available directly from the dashboard

These actions must **not** require navigating to a module first.

| Action | Type | Why on dashboard |
|--------|------|------------------|
| **Record payment** | Primary CTA | Most frequent write action |
| **Search resident/flat** | Global search | Interrupt-driven lookups |
| **Call overdue flat** | Tap phone on follow-up row | Field workflow |
| **Publish notice** | Quick action | Time-sensitive |
| **Mark visit complete** | Inline on today's visits | End-of-day checklist |
| **Log follow-up** | On overdue row | "Called — will pay Friday" |
| **Open flat summary** | Tap any flat row | Connected context |
| **View today's collections** | Expand card | Treasurer verification |

### Actions that stay in modules (not dashboard)

- Edit flat structure (blocks/floors)  
- Bulk bill generation  
- Document upload/management  
- Team/role management  
- Detailed report configuration  
- Historical audit exports  

---

## 5. Dashboard vs separate pages

### On the dashboard (Operations Home)

| Element | Format |
|---------|--------|
| Collection KPIs (today / month / outstanding) | Stat cards |
| Overdue alert count | Alert banner |
| Today's collections | Compact table |
| Follow-up queue (overdue flats) | Priority list with actions |
| Today's vendor visits | Timeline/list |
| Recent society activity | Activity feed |
| Move-ins / move-outs (7 days) | Compact list |
| Quick actions bar | Buttons |

### Separate pages (deep work)

| Page | When Admin leaves dashboard |
|------|----------------------------|
| **Residents** | Edit household, view full history, register move-in |
| **Maintenance** | Full overdue list, bill history, generate charges |
| **Notices** | Draft, edit, schedule, archive |
| **Services** | Schedule/edit vendor visits |
| **Documents** | Upload, categorize, share |
| **Reports** | Monthly/annual analysis, exports |
| **Settings** | Rates, team, apartment profile, structure |

**Navigation rule:** Sidebar has **max 8 items**. Dashboard is always "Home". Everything else is reached because the dashboard **linked you there with context** (e.g., tap overdue flat → Flat ops page, not a generic table).

---

## 6. Information display patterns

| Information | Best format | Example |
|-------------|-------------|---------|
| Single KPI (collected today) | **Stat card** | ₹4,500 collected today |
| Comparison KPI (vs last month) | **Stat card + delta** | 90.6% collection ↑ 2% |
| Urgent item requiring action | **Alert banner** | 3 flats overdue > 30 days |
| Actionable queue | **Priority list** | Overdue flats with Call / Record payment |
| Today's schedule | **Timeline list** | 9 AM Water tank · 2 PM Lift service |
| Recent events | **Activity feed** | "₹1,300 recorded · Flat 110 · 10:32 AM" |
| Full searchable directory | **Filterable table** | All flats with dues filter |
| Trend over time | **Chart** (Reports only) | 6-month collection trend |
| Person/flat detail | **Summary page** | Owner + family + bills + timeline |
| Draft content | **Card with status badge** | Notice draft · Unpublished |
| Configuration | **Form sections** | Settings |

**Anti-patterns to avoid:**

- Landing on empty tables  
- Charts on the dashboard (move to Reports)  
- Nested tabs more than 2 levels deep  
- "Add" buttons as the primary screen content  

---

## 7. Workflows requiring the fewest clicks

Priority workflows — target **≤3 clicks** from login:

| Workflow | Steps | Clicks |
|----------|-------|--------|
| Record a payment | Home → Record payment drawer → Select flat (search pre-filled) → Save | **2** |
| Look up resident & call | ⌘K → type name → tap Call | **2** |
| Publish urgent notice | Home → Publish notice → Title + body → Post | **2** |
| Follow up on overdue flat | Home → tap overdue row → Call / Log follow-up | **2** |
| Mark today's visit done | Home → Today's visits → Mark complete | **2** |
| See flat full history | Search flat → Flat ops summary (all on one page) | **2** |
| Add family member | Search flat → Flat ops → Add member → Save | **3** |
| Upload receipt document | Flat ops → Documents → Upload | **3** |

**Design tactic:** Use **drawers/sheets** for create actions instead of navigating to empty forms.

---

## 8. Modules — now vs later phases

### Phase 7A — MVP Admin (implement first)

| Module | Scope |
|--------|-------|
| **Operations Dashboard** | Full design in this document |
| **Record payment** | Manual entry, receipt number, flat link |
| **Residents / Flat ops** | Summary page + edit family/tenant |
| **Notices** | Publish, list, priority/category |
| **Maintenance** | Overdue list, payment history (read + write payment) |
| **Global search** | Reuse inspector search pattern |

### Phase 7B — Operations maturity

| Module | Scope |
|--------|-------|
| **Services** | Schedule vendor visits, mark complete |
| **Documents** | Upload flat/society docs |
| **Reports** | Collection, occupancy exports |
| **Follow-up log** | Call notes on overdue flats |

### Phase 8+ — Defer

| Module | Why defer |
|--------|-----------|
| **Complaints / helpdesk** | Needs workflow engine, SLAs |
| **Visitor management** | Separate product surface |
| **Accounting / GL** | Complex; societies often use Tally |
| **Bulk SMS/WhatsApp** | Needs integrations |
| **Bill auto-generation** | Needs billing rules engine |
| **Structure editor** | Rare; onboarding tool is enough initially |
| **Payment gateway** | Explicitly out of scope per product policy |
| **Staff attendance** | Niche |

---

## Operations Dashboard — Wireframe structure

```
┌─────────────────────────────────────────────────────────────────┐
│  [Search ⌘K]     Sylvan Shelter · Admin    [+ Record payment]   │
├─────────────────────────────────────────────────────────────────┤
│  ⚠ 3 flats overdue · Water tank visit today · 1 draft notice  │
├──────────────┬──────────────┬──────────────┬──────────────────────┤
│ Collected    │ Outstanding  │ Overdue      │ Visits today         │
│ today ₹4,500 │ ₹32,500      │ 8 flats      │ 2 scheduled          │
├──────────────┴──────────────┴──────────────┴──────────────────────┤
│  FOLLOW-UP NEEDED                          │  TODAY'S VISITS       │
│  Flat 204 · ₹2,600 · 45 days    [Call]   │  9 AM Water tank      │
│  Flat 118 · ₹1,300 · 32 days    [Call]   │  2 PM Lift service    │
│  View all overdue →                       │  Mark complete        │
├───────────────────────────────────────────┴──────────────────────┤
│  COLLECTIONS TODAY                                                │
│  Flat 110 · Srinivas · ₹1,300 · UPI · 10:32 AM                 │
│  Flat 105 · Rajesh · ₹1,300 · Cash · 9:15 AM                   │
├──────────────────────────────────────────────────────────────────┤
│  RECENT ACTIVITY                                                  │
│  • Payment recorded · Flat 110 · 10:32 AM                        │
│  • Notice published · Power shutdown · Yesterday                 │
│  • Tenant registered · Flat 118 · 3 days ago                     │
├──────────────────────────────────────────────────────────────────┤
│  MOVE-INS (7 days)          │  MOVE-OUTS (7 days)                │
│  Flat 118 · Priya Sharma    │  — none                            │
└─────────────────────────────────────────────────────────────────┘
```

---

## Complete module structure

### Module 1 — Home (Operations Dashboard)

| Attribute | Detail |
|-----------|--------|
| **Purpose** | Single command center for daily society operations |
| **Business value** | Admin answers 90% of daily questions without menu navigation |
| **Primary users** | Secretary, Treasurer, office manager |
| **Main screens** | Operations Home (one screen, scrollable sections) |
| **Key actions** | Record payment, search, call overdue, publish notice, mark visit done |
| **Future expansion** | Customizable widgets, role-based dashboard (treasurer vs secretary view), complaint alerts |

---

### Module 2 — Residents

| Attribute | Detail |
|-----------|--------|
| **Purpose** | Manage people living in the society — owners, tenants, family |
| **Business value** | Accurate household records for billing, emergencies, and communication |
| **Primary users** | Office staff, secretary |
| **Main screens** | Search/browse directory · **Flat ops summary** (one page per flat) · Edit household |
| **Key actions** | Add/edit tenant, add/remove family member, link login user, view timeline |
| **Future expansion** | Move-in/move-out workflow, document verification, vehicle/parking assignment |

**Flat ops summary (hero screen — not a CRUD table):**

```
Flat 110 · Block A · Owner occupied
Owner · Tenant · Family (3) · Maintenance status · Last payment
Timeline · Documents · Quick: Record payment · Publish notice
```

---

### Module 3 — Flats & Structure

| Attribute | Detail |
|-----------|--------|
| **Purpose** | View society physical structure — blocks, floors, flat inventory |
| **Business value** | Orient staff; track vacant vs occupied; plan maintenance |
| **Primary users** | Secretary (read), Admin setup (write — rare) |
| **Main screens** | Block overview · Flat directory (filterable) · Flat detail (links to Residents) |
| **Key actions** | Filter vacant/occupied, view flat specs, navigate to resident record |
| **Future expansion** | Edit structure, parking slot mapping, amenity assignment |

**Note:** Merge with Residents where possible. Admin thinks "Flat 110", not "Unit entity #4521". **Flat ops summary is the hub** — structure browser is secondary.

---

### Module 4 — Maintenance & Payments

| Attribute | Detail |
|-----------|--------|
| **Purpose** | Manage society billing — charges, collections, overdue follow-up |
| **Business value** | Core revenue operation for RWAs; replaces Excel + receipt books |
| **Primary users** | Treasurer (primary), office staff |
| **Main screens** | Overdue queue · Payment history · Record payment (drawer) · Flat billing tab |
| **Key actions** | Record payment, view receipt, filter overdue, log follow-up, export collection report |
| **Future expansion** | Auto-generate monthly bills, penalties/interest, payment gateway, reminders |

**Not a "Payments table with Add button"** — default view is **Overdue flats needing action**, sorted by priority.

---

### Module 5 — Notices

| Attribute | Detail |
|-----------|--------|
| **Purpose** | Communicate with all residents — outages, meetings, events |
| **Business value** | Replaces WhatsApp groups and printed notices; audit trail |
| **Primary users** | Secretary |
| **Main screens** | Published list · Drafts · Compose (drawer or page) · Preview |
| **Key actions** | Publish, schedule, set priority/category, duplicate previous notice |
| **Future expansion** | Push notifications, read receipts, target by block |

---

### Module 6 — Services (Work visits)

| Attribute | Detail |
|-----------|--------|
| **Purpose** | Schedule and track vendor maintenance — lift, tank, pest control |
| **Business value** | Residents know what's happening; admin coordinates vendors |
| **Primary users** | Secretary, office staff |
| **Main screens** | Calendar/list view · Schedule visit · Today's visits (shared with dashboard) |
| **Key actions** | Schedule, assign flat/building scope, mark complete, notify residents |
| **Future expansion** | Vendor directory, AMC contracts, cost tracking |

---

### Module 7 — Documents

| Attribute | Detail |
|-----------|--------|
| **Purpose** | Store society and flat documents — bylaws, deeds, receipts, AGM minutes |
| **Business value** | Single source of truth; residents access via portal |
| **Primary users** | Secretary |
| **Main screens** | Society documents · Flat documents · Upload |
| **Key actions** | Upload, categorize, link to flat, resident-visible toggle |
| **Future expansion** | E-sign, version history, OCR |

---

### Module 8 — Reports

| Attribute | Detail |
|-----------|--------|
| **Purpose** | Monthly/annual analysis for committee meetings |
| **Business value** | Transparency; replaces manual Excel reports |
| **Primary users** | Treasurer, secretary |
| **Main screens** | Collection summary · Occupancy · Overdue aging · Export |
| **Key actions** | View trends (charts), export PDF/Excel, date range filter |
| **Future expansion** | Custom report builder, scheduled email to committee |

**Reports is where charts live** — not on the dashboard.

---

### Module 9 — Settings

| Attribute | Detail |
|-----------|--------|
| **Purpose** | Configure society profile, billing rules, team access |
| **Business value** | Keeps data accurate; controls who can do what |
| **Primary users** | President, primary admin |
| **Main screens** | Apartment profile · Maintenance rate · Team & roles · Structure (advanced) |
| **Key actions** | Edit contact info, set ₹/sq.ft rate, invite admin/inspector, view audit log |
| **Future expansion** | Billing rules, notification templates, integrations |

---

## Admin navigation (proposed)

Plain language, max 8 sidebar items:

```
Home
People & flats
Bills
Notices
Work visits
Documents
Reports
Settings
```

**"People & flats"** replaces separate Residents + Structure — one entry, flat-centric UX.

Global: **⌘K search** + **Record payment** in header (always visible).

---

## Admin vs Inspector — intentional overlap

| Capability | Inspector | Admin |
|------------|-----------|-------|
| Search residents | ✓ Read-only | ✓ Read + edit |
| View flat detail | ✓ | ✓ + actions |
| View overdue | ✓ | ✓ + record payment |
| Publish notice | ✗ | ✓ |
| Record payment | ✗ | ✓ |
| Edit family | ✗ | ✓ |

Admin dashboard **extends** the Inspector control center — same mental model, plus write actions.

---

## Mobile strategy for Admin

Admin staff often work from phone at society office or gate.

| Priority | Mobile treatment |
|----------|------------------|
| Record payment | Full-screen drawer, large inputs |
| Search & call | Primary mobile workflow |
| Overdue follow-up | Swipe to call / log note |
| Publish short notice | Mobile-friendly compose |
| Reports / structure | Desktop-preferred; simplified read-only on mobile |

Bottom nav (mobile only): **Home · Bills · People · Notices · More**

---

## Data relationships (Admin view)

```
Society (Apartment)
   ├── Flat
   │     ├── Owner / Tenant / Family
   │     ├── Maintenance (bills + payments)
   │     ├── Documents
   │     ├── Services (visits)
   │     └── Timeline (all events)
   ├── Notices (society-wide)
   ├── Services (building-wide)
   └── Reports (aggregated)
```

Every Admin screen links **flat-ward** — never orphan records.

---

## Success metrics (post-implementation)

| Metric | Target |
|--------|--------|
| Time to record payment | < 30 seconds |
| Overdue flats visible on login | 100% |
| Daily tasks from dashboard | ≥ 80% |
| Clicks to record payment | ≤ 2 |
| Admin training time | < 15 minutes |

---

## Implementation phasing (after design approval)

| Sub-phase | Deliverable |
|-----------|-------------|
| **7A** | Operations Dashboard + Record payment + Flat ops + Notices publish |
| **7B** | Services + Documents + Reports + Follow-up log |
| **7C** | Settings + team + billing rate + structure viewer |

Backend may proceed in parallel per `ARCHITECTURE.md` — frontend Phase 7A can continue on demo data until APIs are ready.

---

## Open questions for approval

1. **Single "People & flats" nav item** vs separate Residents and Structure?  
   *Recommendation: Single entry, flat-centric.*

2. **Treasurer vs Secretary dashboard variants** — same dashboard with role-weighted widgets, or one universal view?  
   *Recommendation: Universal view in v1; treasurer sees collection widgets first.*

3. **Complaints module** — stub alert on dashboard in 7A, or wait for Phase 8?  
   *Recommendation: Dashboard placeholder alert "Complaints — coming soon" for design continuity.*

4. **Record payment drawer** — always global, or also embedded on flat ops page?  
   *Recommendation: Both — same component.*

5. **Bill generation** — manual recording only in 7A, auto-generation in 8+?  
   *Recommendation: Yes, align with payment policy.*

---

## Approval gate

| Item | Status |
|------|--------|
| Phase 6 Validation | ✅ Approved |
| Admin Product Design (this document) | ⏳ **Pending approval** |
| Admin Portal implementation | ⛔ Blocked until this document is approved |

**Next step after approval:** Phase 7A implementation plan + UI wireframes for Operations Dashboard and Record payment flow.
