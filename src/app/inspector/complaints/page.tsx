import { redirect } from "next/navigation";
import { routes } from "@/config/routes";

export default function ComplaintsIndexPage() {
  redirect(routes.dashboard.inspector.complaints.open);
}
