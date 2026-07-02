import { redirect } from "next/navigation";
import { routes } from "@/config/routes";

export default function DocumentsSocietyRedirect() {
  redirect(routes.dashboard.inspector.settings.documents.society);
}
