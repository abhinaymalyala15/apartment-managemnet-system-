import { redirect } from "next/navigation";
import { routes } from "@/config/routes";

export default function CommunicationDraftsRedirect() {
  redirect(routes.dashboard.inspector.notices.drafts);
}
