import { InspectorShell } from "@/components/inspector/inspector-shell";

export default function InspectorFlatsLoading() {
  return (
    <InspectorShell>
      <div className="animate-pulse space-y-6">
        <div className="h-4 w-32 rounded bg-muted" />
        <div className="h-8 w-48 rounded bg-muted" />
        <div className="h-10 rounded-lg bg-muted" />
        <div className="h-64 rounded-xl bg-muted" />
      </div>
    </InspectorShell>
  );
}
