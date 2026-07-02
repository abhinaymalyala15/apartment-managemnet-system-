/**
 * Design system tokens — use Tailwind classes that map to CSS variables in globals.css.
 *
 * Colors:    bg-primary, bg-secondary, text-success, text-warning, text-destructive
 * Cards:     rounded-2xl border bg-card shadow-sm
 * Stats:     StatCard component
 * Typography: text-2xl font-semibold (heading), text-lg font-semibold (subheading),
 *             text-sm (body), text-xs text-muted-foreground (caption)
 * Spacing:   page px-4 py-6, sections space-y-6, cards p-4 sm:p-5
 */

export const designTokens = {
  radius: {
    card: "rounded-2xl",
    button: "rounded-xl",
    pill: "rounded-full",
  },
  shadow: {
    card: "shadow-sm",
    cardHover: "hover:shadow-md",
  },
  spacing: {
    page: "px-4 py-6 sm:px-6 sm:py-8",
    section: "space-y-6",
    card: "p-4 sm:p-5",
  },
  typography: {
    pageTitle: "text-2xl font-semibold tracking-tight sm:text-3xl",
    sectionTitle: "text-base font-semibold",
    body: "text-sm leading-relaxed",
    caption: "text-xs text-muted-foreground",
  },
} as const;
