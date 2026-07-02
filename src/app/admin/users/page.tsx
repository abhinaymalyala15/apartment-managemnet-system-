import { redirect } from "next/navigation";
import { routes } from "@/config/routes";

export default function AdminUsersIndexPage() {
  redirect(routes.dashboard.admin.users.inspectors);
}
