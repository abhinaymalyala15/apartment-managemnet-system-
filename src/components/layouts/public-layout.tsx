import { PublicLayoutShell } from "@/components/layouts/public-layout-shell";

export function PublicLayout({ children }: { children: React.ReactNode }) {
  return <PublicLayoutShell>{children}</PublicLayoutShell>;
}
