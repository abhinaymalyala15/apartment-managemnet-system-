import { ContactsWorkspace } from "@/components/inspector/settings/committee-workspace";
import { getCommitteeContacts } from "@/lib/data";

export default function SettingsContactsPage() {
  return <ContactsWorkspace contacts={getCommitteeContacts()} />;
}
