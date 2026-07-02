import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { routes } from "@/config/routes";
import { formatDateTime, getComplaintRecords } from "@/lib/admin-data";

interface ComplaintDetailPageProps {
  params: Promise<{ id: string }>;
}

export function generateStaticParams() {
  return getComplaintRecords().map((item) => ({ id: item.id }));
}

export default async function ComplaintDetailPage({
  params,
}: ComplaintDetailPageProps) {
  const { id } = await params;
  const complaint = getComplaintRecords().find((item) => item.id === id);

  if (!complaint) notFound();

  return (
    <div className="page-stack max-w-2xl">
      <Link
        href={routes.dashboard.inspector.complaints.open}
        className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="h-4 w-4" />
        Open complaints
      </Link>
      <header className="space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-2xl font-semibold tracking-tight">
            {complaint.title}
          </h1>
          <Badge variant={complaint.priority === "high" ? "destructive" : "secondary"}>
            {complaint.priority}
          </Badge>
          <Badge variant="outline">{complaint.status.replace("_", " ")}</Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          Flat {complaint.flatNumber} · {complaint.residentName} ·{" "}
          {formatDateTime(complaint.createdAt)}
        </p>
      </header>
      <div className="surface-card p-4 text-sm leading-relaxed">
        {complaint.description}
      </div>
      <Link
        href={routes.dashboard.inspector.flats.detail(complaint.flatId)}
        className="text-sm font-medium text-primary hover:underline"
      >
        Open flat record
      </Link>
    </div>
  );
}
