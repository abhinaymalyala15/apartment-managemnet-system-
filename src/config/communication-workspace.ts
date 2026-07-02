/**
 * Communication workspace registry — Phase 7F foundation.
 * Notice management is enabled; other channels plug in later.
 */

export type CommunicationChannelType =
  | "notice"
  | "circular"
  | "announcement"
  | "emergency_alert"
  | "meeting_invitation"
  | "poll"
  | "event"
  | "resident_broadcast"
  | "scheduled_announcement";

export interface CommunicationModuleDef {
  id: CommunicationChannelType;
  label: string;
  enabled: boolean;
  phase?: string;
  description: string;
}

export const COMMUNICATION_MODULES: CommunicationModuleDef[] = [
  {
    id: "notice",
    label: "Notices",
    enabled: true,
    description: "Society-wide notices — drafts, publish, archive",
  },
  {
    id: "circular",
    label: "Circulars",
    enabled: false,
    phase: "Future",
    description: "Formal circulars with acknowledgment",
  },
  {
    id: "announcement",
    label: "Announcements",
    enabled: false,
    phase: "Future",
    description: "Short announcements and updates",
  },
  {
    id: "emergency_alert",
    label: "Emergency alerts",
    enabled: false,
    phase: "Future",
    description: "Push/SMS emergency broadcasts",
  },
  {
    id: "meeting_invitation",
    label: "Meeting invitations",
    enabled: false,
    phase: "Future",
    description: "AGM, RWA meeting invites with RSVP",
  },
  {
    id: "poll",
    label: "Polls",
    enabled: false,
    phase: "Future",
    description: "Resident voting and surveys",
  },
  {
    id: "event",
    label: "Events",
    enabled: false,
    phase: "Future",
    description: "Community events calendar",
  },
  {
    id: "resident_broadcast",
    label: "Resident broadcasts",
    enabled: false,
    phase: "Future",
    description: "Targeted resident messaging",
  },
  {
    id: "scheduled_announcement",
    label: "Scheduled announcements",
    enabled: false,
    phase: "Future",
    description: "Auto-publish at scheduled time",
  },
];
