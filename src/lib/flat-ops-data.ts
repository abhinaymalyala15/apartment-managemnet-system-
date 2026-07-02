/**
 * Flat Operations Hub — aggregated household data (Phase 7D).
 */
import flatNotesData from "@/data/flat-internal-notes.json";
import flatCommunicationsData from "@/data/flat-communications.json";

import type {
  FlatCommunication,
  FlatFamilyProfile,
  FlatInternalNote,
  FlatOperationsData,
  FlatOwnerProfile,
  FlatTenantProfile,
  FlatTimelineEvent,
  FollowUpRecord,
  Payment,
} from "@/types";

import { enrichFollowUpFromRecord, getFollowUpRecords } from "@/lib/admin-data";
import { flatToExplorerNode } from "@/lib/explorer-data";
import {
  formatCurrency,
  getApartment,
  getBlockById,
  getDocuments,
  getFamilyByFlat,
  getFlatById,
  getFlatDetail,
  getFlatTimeline,
  getLastPaidPayment,
  getNextPaymentDueDate,
  getPaymentsByFlat,
  getPendingPaymentsByFlat,
  getResidentTypeLabel,
  getServices,
} from "@/lib/data";

const internalNotes = flatNotesData as FlatInternalNote[];
const communications = flatCommunicationsData as FlatCommunication[];

function maskAadhaar(ownerId: string): string {
  const tail = ownerId.replace(/\D/g, "").slice(-4).padStart(4, "0");
  return `XXXX-XXXX-${tail}`;
}

function computeAge(dateOfBirth?: string): number | undefined {
  if (!dateOfBirth) return undefined;
  const dob = new Date(dateOfBirth);
  const today = new Date("2025-07-02");
  let age = today.getFullYear() - dob.getFullYear();
  const m = today.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--;
  return age;
}

function buildOwnerProfile(
  owner: NonNullable<ReturnType<typeof getFlatDetail>>["owners"][number]
): FlatOwnerProfile {
  return {
    id: owner.id,
    fullName: owner.fullName,
    phone: owner.phone,
    email: owner.email,
    alternatePhone: owner.alternatePhone,
    ownershipStartDate: owner.ownershipStartDate,
    aadhaarMasked: maskAadhaar(owner.id),
  };
}

function buildTenantProfile(
  tenant: NonNullable<ReturnType<typeof getFlatDetail>>["tenants"][number]
): FlatTenantProfile {
  return {
    id: tenant.id,
    fullName: tenant.fullName,
    phone: tenant.phone,
    email: tenant.email,
    leaseStartDate: tenant.leaseStartDate,
    leaseEndDate: tenant.leaseEndDate,
    isActive: tenant.isActive,
  };
}

function buildFamilyProfiles(flatId: string): FlatFamilyProfile[] {
  const members = getFamilyByFlat(flatId);
  return members.map((member, index) => ({
    id: member.id,
    fullName: member.fullName,
    relationship: member.relationship,
    phone: member.phone,
    email: member.email,
    age: computeAge(member.dateOfBirth),
    isEmergencyContact: index === 0 && !!member.phone,
  }));
}

function buildMaintenanceSnapshot(flatId: string, vacant: boolean) {
  const allPayments = getPaymentsByFlat(flatId);
  const pending = getPendingPaymentsByFlat(flatId);
  const outstanding = pending.reduce((s, p) => s + p.amount, 0);
  const lastPaid = getLastPaidPayment(allPayments);
  const openBills = pending.sort(
    (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
  );
  const currentBill = openBills[0] ?? null;

  let paymentStatus: FlatOperationsData["billStatus"] = "paid";
  if (vacant) paymentStatus = "vacant";
  else if (openBills.some((p) => p.status === "overdue")) paymentStatus = "overdue";
  else if (openBills.some((p) => p.status === "pending")) paymentStatus = "pending";

  return {
    currentBill: currentBill
      ? {
          period: currentBill.period,
          amount: currentBill.amount,
          dueDate: currentBill.dueDate,
          status: currentBill.status,
        }
      : null,
    outstanding,
    lastPayment: lastPaid?.paidDate
      ? {
          period: lastPaid.period,
          amount: lastPaid.amount,
          paidDate: lastPaid.paidDate,
          receiptNumber: lastPaid.receiptNumber,
        }
      : null,
    paymentStatus,
    bills: allPayments.filter((p) => p.status !== "paid"),
    payments: allPayments.filter((p) => p.status === "paid"),
    receipts: allPayments.filter((p) => p.status === "paid" && p.receiptNumber),
  };
}

export function getAdminFlatTimeline(flatId: string): FlatTimelineEvent[] {
  const events = [...getFlatTimeline(flatId)];

  for (const doc of getDocuments(flatId)) {
    events.push({
      id: `doc-${doc.id}`,
      date: doc.uploadedAt,
      title: "Document uploaded",
      description: doc.title,
      type: "document",
    });
  }

  const followUp = getFollowUpRecords().find((f) => f.flatId === flatId);
  if (followUp) {
    events.push({
      id: `fu-timeline-${followUp.id}`,
      date: followUp.lastContactAt.slice(0, 10),
      title: "Follow-up logged",
      description: followUp.lastOutcome,
      type: "follow_up",
    });
  }

  for (const comm of communications.filter((c) => c.flatId === flatId)) {
    events.push({
      id: `comm-tl-${comm.id}`,
      date: comm.occurredAt.slice(0, 10),
      title: "Communication logged",
      description: `${comm.channel} · ${comm.summary}`,
      type: "communication",
    });
  }

  for (const note of internalNotes.filter((n) => n.flatId === flatId)) {
    events.push({
      id: `note-tl-${note.id}`,
      date: note.createdAt.slice(0, 10),
      title: "Internal note added",
      description: note.content.slice(0, 80),
      type: "note",
    });
  }

  for (const service of getServices(flatId)) {
    if (service.status === "completed" && service.lastServiceDate) {
      events.push({
        id: `svc-done-${service.id}`,
        date: service.lastServiceDate,
        title: "Service completed",
        description: `${service.title} · ${service.vendor}`,
        type: "service",
      });
    }
  }

  return events.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

export function getFlatOperationsData(flatId: string): FlatOperationsData | null {
  const detail = getFlatDetail(flatId);
  if (!detail) return null;

  const { flat, block, owners, tenants } = detail;
  const apartment = getApartment();
  const explorerNode = flatToExplorerNode(flat);
  const primaryOwner = owners.find((o) => o.isPrimary) ?? owners[0];
  const activeTenant = tenants.find((t) => t.isActive) ?? tenants[0];
  const vacant = flat.occupancyStatus === "vacant";
  const residentPhone =
    activeTenant?.phone ?? primaryOwner?.phone ?? "";

  const followUpRecord = getFollowUpRecords().find((f) => f.flatId === flatId);
  const followUp = followUpRecord
    ? (() => {
        const enriched = enrichFollowUpFromRecord(followUpRecord);
        return {
          id: enriched.id,
          amountPending: enriched.amountPending,
          daysOverdue: enriched.daysOverdue,
          lastContactAt: enriched.lastContactAt,
          lastContactMethod: enriched.lastContactMethod,
          lastOutcome: enriched.lastOutcome,
          nextFollowUpDate: enriched.nextFollowUpDate,
          status: enriched.status,
          residentName: enriched.residentName,
          residentPhone: enriched.residentPhone,
        };
      })()
    : null;

  const flatDocs = getDocuments(flatId);
  const societyDocs = getDocuments().filter((d) => !d.flatId && d.category === "society");

  return {
    flatId,
    apartmentName: apartment.name,
    blockId: block.id,
    blockName: block.name,
    floor: flat.floor,
    flatNumber: flat.flatNumber,
    flatType: flat.flatType,
    areaSqft: flat.areaSqft,
    bedrooms: flat.bedrooms,
    parkingSlots: flat.parkingSlots,
    occupancyStatus: flat.occupancyStatus,
    occupancyLabel: getResidentTypeLabel(flat.occupancyStatus),
    billStatus: explorerNode.billStatus,
    residentPhone,
    owner: primaryOwner ? buildOwnerProfile(primaryOwner) : null,
    tenant: activeTenant ? buildTenantProfile(activeTenant) : null,
    family: buildFamilyProfiles(flatId),
    maintenance: buildMaintenanceSnapshot(flatId, vacant),
    documents: [...flatDocs, ...societyDocs.slice(0, 1)],
    timeline: getAdminFlatTimeline(flatId),
    internalNotes: internalNotes.filter((n) => n.flatId === flatId),
    communications: communications.filter((c) => c.flatId === flatId),
    followUp,
  };
}

export function getFlatStatementText(data: FlatOperationsData): string {
  const lines = [
    `${data.apartmentName} — Flat ${data.flatNumber} Statement`,
    `${data.blockName} · Floor ${data.floor}`,
    "",
    `Outstanding: ${formatCurrency(data.maintenance.outstanding)}`,
    `Status: ${data.maintenance.paymentStatus}`,
  ];
  if (data.maintenance.lastPayment) {
    lines.push(
      `Last payment: ${data.maintenance.lastPayment.period} — ${formatCurrency(data.maintenance.lastPayment.amount)}`
    );
  }
  return lines.join("\n");
}

export { getNextPaymentDueDate };
