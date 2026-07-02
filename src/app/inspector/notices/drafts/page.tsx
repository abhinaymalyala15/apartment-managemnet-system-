import { redirect } from "next/navigation";
import { routes } from "@/config/routes";

export default function NoticeDraftsPage() {
  redirect(routes.dashboard.inspector.notices.root);
}
