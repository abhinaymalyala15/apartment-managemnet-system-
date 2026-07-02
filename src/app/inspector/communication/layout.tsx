import { NoticesNav } from "@/components/inspector/communication/communication-nav";
import { CommunicationProvider } from "@/components/inspector/communication/communication-provider";
import { CommunicationDrawers } from "@/components/inspector/communication/communication-drawers";

export default function CommunicationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <CommunicationProvider>
      <div className="page-stack pb-8">
        <header>
          <h1 className="text-2xl font-semibold tracking-tight">Notices</h1>
        </header>
        <NoticesNav />
        <div className="mt-2">{children}</div>
      </div>
      <CommunicationDrawers />
    </CommunicationProvider>
  );
}
