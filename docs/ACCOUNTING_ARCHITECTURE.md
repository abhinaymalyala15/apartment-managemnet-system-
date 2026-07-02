# Accounting Workspace Architecture

The Finance module (`/admin/finance`) is the foundation for a full **Accounting Workspace**. Routes remain `/admin/finance/*` for stability; the product concept evolves from “billing” to “community accounting.”

## Hierarchy

```
Community
  ↓
Block
  ↓
Flat
  ↓
Accounting (Finance module today)
  ↓
Bill
  ↓
Payment
  ↓
Receipt
  ↓
Statement
  ↓
Future: Ledger
  ↓
Future: Expenses
```

Flat-level finance detail lives in the **Flat Operations Hub** (`/admin/flats/[flatId]`). The accounting workspace summarizes and routes; it never duplicates flat maintenance tabs.

## Future Module Tree (documentation only)

```
Accounting
├── Dashboard          ← /admin/finance (Treasurer's command center)
├── Collections        ← maintenance, parking, facility, penalties (future)
├── Outstanding        ← /admin/finance/outstanding
├── Payments           ← /admin/finance/payments
├── Receipts           ← /admin/finance/receipts
├── Statements         ← /admin/finance/statements
├── Funds              ← corpus, sinking, special assessments (future)
├── Expenses           ← vendor payments, cash book (future)
└── Reports            ← integrates with Admin Reports module
```

## Collection Types (future plug-in)

Defined in `src/config/accounting-workspace.ts`:

| Type | Phase | Description |
|------|-------|-------------|
| `maintenance` | 7E ✅ | Monthly maintenance collection |
| `corpus_fund` | Future | Corpus fund contributions |
| `sinking_fund` | Future | Sinking fund |
| `special_assessment` | Future | One-off levies |
| `parking` | Future | Parking charges |
| `clubhouse` | Future | Clubhouse fees |
| `facility_booking` | Future | Amenity booking charges |
| `penalty` | Partial | Penalty bills (payment type exists) |
| `interest` | Future | Late payment interest |
| `refund` | Future | Refunds to residents |

## Expense Types (future plug-in)

| Type | Phase |
|------|-------|
| `vendor_payment` | Future |
| `bank_deposit` | Future |
| `cash_book` | Future |
| `income_expense` | Future |
| `annual_summary` | Future |

## Extension Points

1. **`src/config/accounting-workspace.ts`** — module registry, collection/expense type enums, nav items with `enabled` flag.
2. **`src/lib/finance-data.ts`** — aggregation layer; future collection types add filters, not new pages.
3. **`Payment.type`** — extend union as new bill types ship.
4. **Outstanding queue** — collection-type filter per row when multiple charge types exist.
5. **Statements / Reports** — scope by fund or collection type.

## Dashboard (Treasurer's Homepage)

The finance dashboard answers:

- Today's collection
- Monthly collection
- Outstanding amount
- Collection rate
- Highest defaulters (outstanding queue preview)
- Recent payments
- Payment trend
- Financial health (derived score)

## Outstanding Queue Priority

Operational sort order (highest contact urgency first):

1. **Escalated** follow-ups
2. **Broken promise** (promised date passed)
3. **High amount** outstanding
4. **Long overdue** (days)
5. **Recent due** (newly overdue / due soon)

Implemented in `computePriorityScore()` in `src/lib/finance-data.ts`.

## Implementation Rules

- Reuse drawers, `ListToolbar`, `StatCard`, `FinancialSnapshot`.
- Link to Flat Operations Hub for household detail.
- Timeline events for payments/receipts remain flat-scoped.
- Do not duplicate flat maintenance UI in finance routes.
