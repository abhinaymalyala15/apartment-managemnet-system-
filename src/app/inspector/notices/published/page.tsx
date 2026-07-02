import { redirect } from "next/navigation";
import { routes } from "@/config/routes";

export default function PublishedNoticesPage() {
  redirect(routes.dashboard.inspector.notices.root);
}
