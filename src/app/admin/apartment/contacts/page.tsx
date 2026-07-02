import { ContactsWorkspace } from "@/components/inspector/settings/committee-workspace";
import { getCommitteeContacts } from "@/lib/data";

export default function AdminApartmentContactsPage() {
  return <ContactsWorkspace contacts={getCommitteeContacts()} />;
}
