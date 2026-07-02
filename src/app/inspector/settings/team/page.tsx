import { TeamWorkspace } from "@/components/inspector/settings/team-workspace";
import { getRoleDefinitions, getStaffRoster } from "@/lib/settings-data";

export default function SettingsTeamPage() {
  return (
    <TeamWorkspace staff={getStaffRoster()} roles={getRoleDefinitions()} />
  );
}
