import { CommitteeWorkspace } from "@/components/inspector/settings/committee-workspace";
import { getCommitteeMembers } from "@/lib/settings-data";

export default function AdminApartmentCommitteePage() {
  return <CommitteeWorkspace members={getCommitteeMembers()} />;
}
