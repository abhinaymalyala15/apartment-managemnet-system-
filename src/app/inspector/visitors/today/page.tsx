import { redirect } from "next/navigation";
import { routes } from "@/config/routes";

export default function TodayVisitorsPage() {
  redirect(routes.dashboard.inspector.visitors.root);
}
