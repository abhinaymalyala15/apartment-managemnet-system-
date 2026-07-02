import { ProfileWorkspace } from "@/components/inspector/settings/profile-workspace";
import { getApartmentProfile } from "@/lib/settings-data";

export default function SettingsProfilePage() {
  return <ProfileWorkspace profile={getApartmentProfile()} />;
}
