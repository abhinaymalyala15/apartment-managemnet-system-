import { InspectorShell } from "@/components/inspector/inspector-shell";

export default function InspectorLoading() {
  return (
    <InspectorShell>
      <div className="animate-pulse space-y-8">
        <div className="space-y-3 border-b pb-6">
          <div className="h-5 w-24 rounded bg-muted" />
          <div className="h-8 w-64 max-w-full rounded bg-muted" />
          <div className="h-4 w-96 max-w-full rounded bg-muted" />
        </div>
        <div className="h-32 rounded-xl bg-muted" />
        <div className="grid gap-8 md:grid-cols-2">
          <div className="h-48 rounded-xl bg-muted" />
          <div className="h-48 rounded-xl bg-muted" />
        </div>
      </div>
    </InspectorShell>
  );
}
