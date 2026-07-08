# ApartmentERP

## Register

product

## Users & Purpose

ApartmentERP is a multi-tenant community management platform for Indian apartment societies. Demo tenant: Sylvan Shelter Apartment (Hyderabad).

Primary users:
- **Admin** — configures apartment profile, billing setup, residents, services, and publishes monthly financial statements
- **Inspector** — day-to-day operations: outstanding dues, payments, flat ops, viewing published statements
- **Resident** — views bills, notices, services, and published monthly financial statements

Primary job of this surface: let administrators draft Excel-like monthly expense statements, save drafts, preview, and publish them for read-only portal viewing.

## Brand personality

Professional · Trustworthy · Operationally clear

## Anti-references

- Flashy SaaS marketing dashboards with decorative charts in task screens
- Dense ERP greyboxes with zero visual hierarchy
- Consumer fintech neon / purple gradients in admin tools

## Accessibility

- Target WCAG AA contrast for body text and form labels
- Keyboard-reachable table row actions and primary buttons
- Readable currency and amounts with tabular figures
- Respect `prefers-reduced-motion`

## Strategic design principles

1. Task clarity over decoration — every admin screen should make the next action obvious
2. Familiar product UI vocabulary — cards, tables, sticky headers/footers, clear status badges
3. Excel-adjacent density where editing ledgers, without looking dated
4. Preserve the existing Apartment Admin design language (slate neutrals, primary accent, soft shadows, rounded-2xl)
5. Publish once → read-only everywhere — no portal editing of published statements
