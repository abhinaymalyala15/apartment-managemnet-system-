import { redirect } from "next/navigation";
import { routes } from "@/config/routes";

export default function DocumentsAssetsRedirect() {
  redirect(routes.dashboard.inspector.settings.documents.assets);
}
