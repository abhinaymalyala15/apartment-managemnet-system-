import { redirect } from "next/navigation";
import { routes } from "@/config/routes";

export default function CommunicationRedirectPage() {
  redirect(routes.dashboard.inspector.notices.published);
}
