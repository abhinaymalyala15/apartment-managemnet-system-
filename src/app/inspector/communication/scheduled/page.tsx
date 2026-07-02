import { redirect } from "next/navigation";
import { routes } from "@/config/routes";

export default function CommunicationScheduledRedirect() {
  redirect(routes.dashboard.inspector.notices.scheduled);
}
