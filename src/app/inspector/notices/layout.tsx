export default function NoticesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="page-stack pb-8">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Notices</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Notices sent to residents
        </p>
      </header>
      <div className="mt-2">{children}</div>
    </div>
  );
}
