import { redirect } from "next/navigation";
import { routes } from "@/config/routes";

export default function ServicesVendorsPage() {
  redirect(routes.dashboard.inspector.services.root);
}
