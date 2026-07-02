import { ComplaintsNav } from "@/components/inspector/complaints/complaints-nav";

export default function ComplaintsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="page-stack pb-8">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Complaints</h1>
      </header>
      <ComplaintsNav />
      <div className="mt-2">{children}</div>
    </div>
  );
}
