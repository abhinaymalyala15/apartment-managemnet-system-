import { cn } from "@/lib/utils";

interface InfoItem {
  label: string;
  value: React.ReactNode;
}

interface ResidentInfoListProps {
  items: InfoItem[];
  className?: string;
}

export function ResidentInfoList({ items, className }: ResidentInfoListProps) {
  return (
    <dl className={cn("divide-y rounded-2xl border bg-card", className)}>
      {items.map((item) => (
        <div
          key={item.label}
          className="flex flex-col gap-0.5 px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:px-5"
        >
          <dt className="text-sm text-muted-foreground">{item.label}</dt>
          <dd className="text-sm font-medium sm:text-right">{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}
