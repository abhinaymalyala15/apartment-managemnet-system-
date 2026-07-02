# Communication Workspace Architecture

Phase 7F establishes `/admin/communication` as the **communication center** for the apartment. Notice management is the first enabled channel; others plug in via `src/config/communication-workspace.ts`.

## Separation from Flat CRM

| Layer | Route / data | Purpose |
|-------|----------------|---------|
| **Society communication** | `/admin/communication`, `notices.json` | Announcements to residents |
| **Flat CRM comms** | Flat Operations Hub, `flat-communications.json` | Per-household call/SMS logs |

Do not merge these — different audiences and workflows.

## Future Module Tree

```
Communication
├── Dashboard           ← /admin/communication
├── Notices             ← Phase 7F ✅
│   ├── Published
│   ├── Drafts
│   ├── Scheduled
│   ├── Archived
│   └── History
├── Circulars           ← Future
├── Announcements       ← Future
├── Emergency alerts    ← Future (push/SMS)
├── Meeting invitations ← Future
├── Polls               ← Future
├── Events              ← Future
├── Resident broadcasts ← Future
└── Scheduled announcements ← Future (auto-publish engine)
```

## Notice Lifecycle

```
Draft → (optional) Scheduled → Published → Archived
                ↘ Emergency publish (immediate, all residents)
```

## Data Layer

- `src/lib/communication-data.ts` — aggregations and labels
- `src/data/notices.json` — published
- `src/data/notice-drafts.json` — drafts
- `src/data/notice-scheduled.json` — scheduled
- `src/data/notice-archived.json` — archived
- `src/data/notice-history.json` — audit trail

Resident app continues to use `getNotices()` from `src/lib/data.ts` for published content.

## Extension Points

1. Add channel to `COMMUNICATION_MODULES` with `enabled: true`
2. Add route under `/admin/communication/*`
3. Add tab in `CommunicationNav`
4. Timeline events use `FlatTimelineEvent.type: "notice"` for society-wide items

## UI Patterns

- `CommunicationProvider` + drawers (compose, schedule, emergency, archive)
- `NoticeWorkspace` + `ListToolbar` for filtered lists
- `NoticeAdminList` — shared card with audience, priority, actions
- Reuses resident `NoticeCardList` patterns for visual consistency
