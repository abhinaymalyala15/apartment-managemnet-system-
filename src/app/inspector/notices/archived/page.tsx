import { redirect } from "next/navigation";
import { routes } from "@/config/routes";

export default function ArchivedNoticesPage() {
  redirect(routes.dashboard.inspector.notices.root);
}
