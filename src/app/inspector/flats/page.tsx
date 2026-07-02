import { redirect } from "next/navigation";
import { routes } from "@/config/routes";

export default function AdminFlatsPage() {
  redirect(routes.dashboard.inspector.residents);
}
