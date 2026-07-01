import { InspectorShell } from "@/components/inspector/inspector-shell";

export default function InspectorFlatDetailLoading() {
  return (
    <InspectorShell narrow>
      <div className="animate-pulse space-y-6">
        <div className="h-4 w-28 rounded bg-muted" />
        <div className="h-8 w-40 rounded bg-muted" />
        <div className="h-24 rounded-xl bg-muted" />
        <div className="h-32 rounded-xl bg-muted" />
        <div className="h-32 rounded-xl bg-muted" />
      </div>
    </InspectorShell>
  );
}
