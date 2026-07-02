import { redirect } from "next/navigation";
import { routes } from "@/config/routes";

export default function CommunicationArchivedRedirect() {
  redirect(routes.dashboard.inspector.notices.archived);
}
