export default function VisitorsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="page-stack pb-8">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Visitors</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Guest passes and visit requests
        </p>
      </header>
      <div className="mt-2">{children}</div>
    </div>
  );
}
