# Facility & Asset Operations Architecture

Phase 7G — `/admin/assets/*`

## Hierarchy

```
Community
  ↓
Block
  ↓
Assets
  ↓
Asset Profile
  ↓
AMC → Vendor → Service History → Documents → Timeline
```

## Scope Model

| Scope | Example |
|-------|---------|
| `community` | Water tank cleaning, DG set, fire safety |
| `block` | Lift service — Block A |
| `flat` | Leak repair coordination — Flat 110 |

## Asset Categories

Configured in `src/config/facility-workspace.ts` — enable new types without new UI components.

## Data Layer

`src/lib/asset-data.ts` aggregates:

- `community-assets.json` — asset registry
- `asset-vendors.json` — vendor profiles
- `asset-amc.json` — AMC contracts
- `asset-services.json` — service records with checklist, technician, remarks
- `asset-documents.json` — manuals, certificates, reports
- `asset-internal-notes.json` — admin-only notes

## Mission Control Integration

`buildCriticalAlerts()` in `admin-data.ts` surfaces asset alerts with links to `/admin/assets/*` — no duplicate facility UI on the dashboard.

## Future Modules

Inventory, work orders, vendor bills, preventive maintenance schedules, facility booking, inspection checklists — registered in `FACILITY_NAV_MODULES` and `FUTURE_FACILITY_MODULES`.
