import { redirect } from "next/navigation";
import { routes } from "@/config/routes";

export default function AssetsVendorsRedirect() {
  redirect(routes.dashboard.inspector.services.vendors);
}
