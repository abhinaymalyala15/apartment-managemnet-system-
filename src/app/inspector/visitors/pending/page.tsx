import { redirect } from "next/navigation";
import { routes } from "@/config/routes";

export default function PendingVisitorsPage() {
  redirect(routes.dashboard.inspector.visitors.root);
}
