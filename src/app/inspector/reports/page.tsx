import { redirect } from "next/navigation";
import { routes } from "@/config/routes";

export default function AdminReportsPage() {
  redirect(routes.dashboard.inspector.reports.collection);
}
