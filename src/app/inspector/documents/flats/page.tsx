import { redirect } from "next/navigation";
import { routes } from "@/config/routes";

export default function DocumentsFlatsRedirect() {
  redirect(routes.dashboard.inspector.settings.documents.flats);
}
