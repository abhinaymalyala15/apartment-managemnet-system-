import { redirect } from "next/navigation";
import { routes } from "@/config/routes";

export default function CommunicationHistoryRedirect() {
  redirect(routes.dashboard.inspector.notices.published);
}
