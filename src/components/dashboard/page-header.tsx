import { getApartment } from "@/lib/data";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
}

export function PageHeader({ title, subtitle }: PageHeaderProps) {
  const apartment = getApartment();

  return (
    <div className="border-b bg-background px-4 py-6 sm:px-6 lg:px-8">
      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
        {apartment.name}
      </p>
      <h1 className="mt-1 text-xl font-semibold tracking-tight sm:text-2xl">
        {title}
      </h1>
      {subtitle && (
        <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
      )}
    </div>
  );
}
