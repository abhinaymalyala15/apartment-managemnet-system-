# User Journeys — Phase 6 Product Enhancement

## Resident journey

```
Resident opens app
        ↓
   Home dashboard (10-second answers)
   • Pending dues? → at-a-glance card + action list
   • Important notices? → inline preview
   • Visits this week? → week section
   • Next payment date? → next due card
   • What to do today? → action list
   • Emergency/committee? → contacts on dashboard
        ↓
   Only when needed:
   • Maintenance bills → filter, print, download receipt
   • Announcements → search, filter, read more
   • Scheduled visits → filter by scope/status
   • My flat / Family / Account
```

**Information architecture**

| Section | Pages |
|---------|--------|
| Dashboard | Home |
| My home | My flat, Family |
| Community | Announcements, Scheduled visits |
| Bills | Maintenance bills |
| Account | My account |

**Dashboard answers (first 10 seconds)**

1. Do I have pending dues?
2. Are there important notices?
3. What maintenance work is happening this week?
4. What is my next payment date?
5. What should I do today?

---

## Inspector journey

```
Inspector opens app
        ↓
   Overview control center
   • Total outstanding + collection rate
   • Overdue bills, vacant flats, today's/week visits
   • Recent notices + move-ins
        ↓
   ⌘K global search (header) OR Find residents
        ↓
   Open flat → profile, family, pending bills, timeline, history
        ↓
   Unpaid bills → search, filter, sort
        ↓
   Reports → tap KPI to drill down
```

**Global search (header)**

- Flat number
- Owner name
- Tenant name
- Family member
- Mobile number
- Shortcut: ⌘K / Ctrl+K

---

## Design system

See `src/config/theme.ts`, `src/app/globals.css`, and utility classes:

- **Surfaces:** `.surface-card`, `.surface-card-muted`
- **Layout:** `.page-stack`, `.section-title`
- **Semantic colors:** success (paid), warning (pending), destructive (overdue)
- **Lists:** `ListToolbar` + `EmptyState` on every filterable screen

---

## Demo date

Static demo content uses reference date **2025-07-02** (`DEMO_REFERENCE_DATE` in `src/lib/data.ts`) so “today” and “this week” stay accurate during demos.
