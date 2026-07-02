import { SettingsNav } from "@/components/inspector/settings/settings-nav";
import { SettingsProvider } from "@/components/inspector/settings/settings-provider";
import { SettingsDrawers } from "@/components/inspector/settings/settings-drawers";

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SettingsProvider>
      <div className="page-stack pb-8">
        <header>
          <h1 className="page-title">Settings</h1>
        </header>
        <SettingsNav />
        <div className="mt-2">{children}</div>
      </div>
      <SettingsDrawers />
    </SettingsProvider>
  );
}
