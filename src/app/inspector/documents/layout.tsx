import { redirect } from "next/navigation";
import { routes } from "@/config/routes";

export default function DocumentsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  redirect(routes.dashboard.inspector.settings.documents.society);
  return children;
}
