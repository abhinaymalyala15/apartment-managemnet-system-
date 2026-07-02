/**
 * Admin portal data access — Operations Dashboard (Phase 7B).
 * Extends the demo data layer with admin-specific aggregations.
 */
import followUpsData from "@/data/follow-ups.json";
import communityAssetsData from "@/data/community-assets.json";
import noticeDraftsData from "@/data/notice-drafts.json";
import residentRequestsData from "@/data/resident-requests.json";
import visitorsData from "@/data/visitors.json";

import { routes } from "@/config/routes";

import type {
  AdminCriticalAlert,
  AdminMoveEvent,
  AdminOperationalTask,
  AdminSearchResult,
  AdminTodayOperations,
  CommunityAsset,
  CommunityHealthScore,
  FlatTimelineEvent,
  FollowUpRecord,
  NoticeDraft,
  ResidentRequest,
  Service,
} from "@/types";

import {
  getAdminScaleTier,
  getScaleLimits,
} from "@/lib/admin-scale";

import {
  DEMO_REFERENCE_DATE,
  formatCurrency,
  formatDate,
  getAllTenants,
  getApartment,
  getApartmentStats,
  getBlockById,
  getBlocks,
  getDemoToday,
  getDemoTodayIso,
  getFlatById,
  getFlats,
  getFlatsByBlock,
  getMaintenanceSummary,
  getNotices,
  getOverduePayments,
  getPrimaryOwner,
  getResidentTableRows,
  getServices,
  getTenantsByFlat,
  isServiceToday,
  getPayments,
  getPaymentsRecordedOn,
} from "@/lib/data";

const followUps = followUpsData as FollowUpRecord[];
const communityAssets = communityAssetsData as CommunityAsset[];
const noticeDrafts = noticeDraftsData as NoticeDraft[];
const residentRequests = residentRequestsData as ResidentRequest[];

export interface VisitorRecord {
  id: string;
  apartmentId: string;
  flatId: string;
  guestName: string;
  purpose: string;
  expectedDate: string;
  expectedTime: string;
  status: "pending" | "approved" | "rejected";
}

const visitors = visitorsData as VisitorRecord[];

export function getVisitorRecords(): VisitorRecord[] {
  return visitors;
}

export type EnrichedComplaint = ResidentRequest & {
  flatNumber: string;
  residentName: string;
};

export function getComplaintRecords(
  status?: ResidentRequest["status"]
): EnrichedComplaint[] {
  let list = residentRequests;
  if (status) {
    list = list.filter((r) => r.status === status);
  }
  return list.map((req) => {
    const flat = getFlatById(req.flatId);
    const owner = getPrimaryOwner(req.flatId);
    const tenant = getTenantsByFlat(req.flatId)[0];
    return {
      ...req,
      flatNumber: flat?.flatNumber ?? "—",
      residentName: tenant?.fullName ?? owner?.fullName ?? "—",
    };
  });
}

export type EnrichedVisitor = VisitorRecord & {
  flatNumber: string;
  residentName: string;
};

export function getEnrichedVisitors(
  filter?: "pending" | "today" | "all"
): EnrichedVisitor[] {
  const todayIso = getDemoTodayIso();
  return visitors
    .filter((v) => {
      if (filter === "pending") return v.status === "pending";
      if (filter === "today") return v.expectedDate === todayIso;
      return true;
    })
    .map((v) => {
      const flat = getFlatById(v.flatId);
      const owner = getPrimaryOwner(v.flatId);
      const tenant = getTenantsByFlat(v.flatId)[0];
      return {
        ...v,
        flatNumber: flat?.flatNumber ?? "—",
        residentName: tenant?.fullName ?? owner?.fullName ?? "—",
      };
    });
}

export type VisitorPeriodFilter = "all" | "week" | "month";

export function getEnrichedVisitorsForPeriod(
  period: VisitorPeriodFilter = "all"
): EnrichedVisitor[] {
  const all = getEnrichedVisitors("all");
  if (period === "all") return all;

  const today = getDemoToday();
  const todayIso = getDemoTodayIso();
  const monthPrefix = todayIso.slice(0, 7);

  if (period === "month") {
    return all.filter((v) => v.expectedDate.startsWith(monthPrefix));
  }

  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - weekStart.getDay());
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  const weekStartIso = weekStart.toISOString().slice(0, 10);
  const weekEndIso = weekEnd.toISOString().slice(0, 10);

  return all.filter(
    (v) => v.expectedDate >= weekStartIso && v.expectedDate <= weekEndIso
  );
}

export interface AdminTodayAttentionItem {
  id: string;
  message: string;
  href: string;
  actionLabel: string;
  urgent?: boolean;
}

export interface AdminTodayActivityItem {
  id: string;
  label: string;
  href?: string;
  meta?: string;
}

export interface AdminTodayDashboard {
  apartmentName: string;
  todayLabel: string;
  attention: AdminTodayAttentionItem[];
  announcements: Array<{ id: string; label: string; href: string; meta?: string }>;
  collectionsActivity: AdminTodayActivityItem[];
  complaintsActivity: AdminTodayActivityItem[];
}

export function getAdminTodayDashboard(): AdminTodayDashboard {
  const apartment = getApartment();
  const todayIso = getDemoTodayIso();
  const overdueFlatCount = getOverdueFlatCount();
  const followUpDueToday = getFollowUpRecords().filter(
    (f) => f.nextFollowUpDate <= todayIso
  ).length;
  const openComplaints = residentRequests.filter((r) => r.status === "open");
  const pendingVisitors = visitors.filter((v) => v.status === "pending");
  const urgentDraft = noticeDrafts.find((d) => d.priority === "high");
  const todayServices = getServices().filter(
    (s) => s.status === "scheduled" && isServiceToday(s)
  );

  const attention: AdminTodayAttentionItem[] = [];

  if (followUpDueToday > 0 || overdueFlatCount > 0) {
    attention.push({
      id: "maintenance-follow-up",
      message: `${Math.max(followUpDueToday, overdueFlatCount)} flats need follow-up call`,
      href: routes.dashboard.inspector.maintenance.outstanding,
      actionLabel: "Outstanding",
      urgent: true,
    });
  }

  const staleComplaint = openComplaints.find((c) => c.priority === "high");
  if (staleComplaint) {
    const flat = getFlatById(staleComplaint.flatId);
    attention.push({
      id: `complaint-${staleComplaint.id}`,
      message: `Complaint open · Flat ${flat?.flatNumber ?? "—"} · ${staleComplaint.title}`,
      href: routes.dashboard.inspector.complaints.open,
      actionLabel: "Complaints",
      urgent: true,
    });
  }

  if (pendingVisitors.length > 0) {
    attention.push({
      id: "visitors-pending",
      message: `${pendingVisitors.length} visitor passes pending approval`,
      href: routes.dashboard.inspector.visitors.root,
      actionLabel: "Visitors",
      urgent: pendingVisitors.length > 1,
    });
  }

  if (urgentDraft) {
    attention.push({
      id: `draft-${urgentDraft.id}`,
      message: `Draft notice · ${urgentDraft.title}`,
      href: routes.dashboard.inspector.notices.root,
      actionLabel: "Notices",
    });
  }

  if (todayServices.length > 0) {
    attention.push({
      id: `service-${todayServices[0]!.id}`,
      message: `${todayServices[0]!.title} today · ${todayServices[0]!.scheduledTime}`,
      href: routes.dashboard.inspector.services.root,
      actionLabel: "Services",
    });
  }

  const announcements = getNotices()
    .filter(
      (n) =>
        n.priority === "high" ||
        n.category === "emergency" ||
        n.isEmergency === true
    )
    .sort((a, b) => {
      if (a.isEmergency && !b.isEmergency) return -1;
      if (!a.isEmergency && b.isEmergency) return 1;
      return b.publishedAt.localeCompare(a.publishedAt);
    })
    .slice(0, 5)
    .map((n) => ({
      id: n.id,
      label: n.title,
      href: routes.dashboard.inspector.notices.root,
      meta: formatDate(n.publishedAt),
    }));

  const collectionsActivity: AdminTodayActivityItem[] = [];

  for (const payment of getPayments()
    .filter((p) => p.status === "paid" && p.paidDate)
    .sort((a, b) => b.paidDate!.localeCompare(a.paidDate!))
    .slice(0, 5)) {
    const flat = getFlatById(payment.flatId);
    collectionsActivity.push({
      id: `pay-${payment.id}`,
      label: `Payment · Flat ${flat?.flatNumber ?? "—"}`,
      meta: `${formatCurrency(payment.amount)} · ${formatDate(payment.paidDate!)}`,
      href: routes.dashboard.inspector.maintenance.payments,
    });
  }

  const complaintsActivity: AdminTodayActivityItem[] = [];

  for (const req of [...openComplaints]
    .sort((a, b) => {
      const priority = { high: 0, medium: 1, low: 2 };
      return priority[a.priority] - priority[b.priority];
    })
    .slice(0, 5)) {
    const flat = getFlatById(req.flatId);
    complaintsActivity.push({
      id: `req-${req.id}`,
      label: `Flat ${flat?.flatNumber ?? "—"} · ${req.title}`,
      meta:
        req.priority === "high"
          ? "High priority"
          : req.priority === "medium"
            ? "Medium priority"
            : undefined,
      href: routes.dashboard.inspector.complaints.detail(req.id),
    });
  }

  const todayDate = new Date(DEMO_REFERENCE_DATE);
  const todayLabel = new Intl.DateTimeFormat("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(todayDate);

  return {
    apartmentName: apartment.name,
    todayLabel,
    attention: attention.slice(0, 6),
    announcements,
    collectionsActivity: collectionsActivity.slice(0, 5),
    complaintsActivity,
  };
}

export interface AdminTopbarQuickLink {
  id: string;
  label: string;
  href: string;
  count: number;
  urgent?: boolean;
}

export interface AdminTopbarSummary {
  quickLinks: AdminTopbarQuickLink[];
}

export function getAdminTopbarSummary(): AdminTopbarSummary {
  const openComplaints = residentRequests.filter((r) => r.status === "open");
  const pendingVisitors = visitors.filter((v) => v.status === "pending");
  const todayServices = getServices().filter(
    (s) => s.status === "scheduled" && isServiceToday(s)
  );

  const hasUrgentComplaint = openComplaints.some((c) => c.priority === "high");

  const quickLinks: AdminTopbarQuickLink[] = [
    {
      id: "visitors",
      label: "Visitors",
      href: routes.dashboard.inspector.visitors.root,
      count: pendingVisitors.length,
      urgent: pendingVisitors.length > 0,
    },
    {
      id: "complaints",
      label: "Complaints",
      href: routes.dashboard.inspector.complaints.open,
      count: openComplaints.length,
      urgent: hasUrgentComplaint,
    },
    {
      id: "services",
      label: "Services today",
      href: routes.dashboard.inspector.services.root,
      count: todayServices.length,
    },
  ];

  return { quickLinks };
}

export type EnrichedFollowUp = FollowUpRecord & {
  flatNumber: string;
  blockName: string;
  floor: number;
  residentName: string;
  residentPhone: string;
};

export interface AdminDashboardSummary {
  apartmentName: string;
  todayLabel: string;
  scaleTier: ReturnType<typeof getAdminScaleTier>;
  stats: ReturnType<typeof getApartmentStats>;
  maintenance: ReturnType<typeof getMaintenanceSummary>;
  communityHealth: CommunityHealthScore;
  criticalAlerts: AdminCriticalAlert[];
  followUps: EnrichedFollowUp[];
  todayOperations: AdminTodayOperations;
  recentActivity: FlatTimelineEvent[];
  blockSummaries: Array<{
    blockId: string;
    blockName: string;
    totalFlats: number;
    overdueCount: number;
    vacantCount: number;
    collectionRate: number;
  }>;
  /** @deprecated use todayOperations — kept for widget compatibility during refactor */
  collectionRate: number;
  overdueFlatCount: number;
  pendingFollowUpCount: number;
  activeNoticeCount: number;
  upcomingServiceCount: number;
  occupancyRate: number;
  todayTasks: AdminOperationalTask[];
  todayCollections: AdminTodayOperations["paymentsSummary"] & {
    recentPayments: AdminTodayOperations["payments"];
  };
  upcomingServices: Service[];
  todayServices: Service[];
  draftNotices: NoticeDraft[];
}

export function getFollowUpRecords(): FollowUpRecord[] {
  return followUps.filter((f) => f.status !== "resolved");
}

export function getCommunityAssets(): CommunityAsset[] {
  return communityAssets;
}

export function getNoticeDrafts(): NoticeDraft[] {
  return noticeDrafts;
}

function getOverdueFlatCount(): number {
  const ids = new Set(getOverduePayments().map((p) => p.flatId));
  return ids.size;
}

export function enrichFollowUpFromRecord(record: FollowUpRecord): EnrichedFollowUp {
  const flat = getFlatById(record.flatId);
  const block = flat ? getBlockById(flat.blockId) : undefined;
  const owner = getPrimaryOwner(record.flatId);
  const tenant = getTenantsByFlat(record.flatId)[0];
  const resident = tenant ?? owner;

  return {
    ...record,
    flatNumber: flat?.flatNumber ?? "—",
    blockName: block?.name ?? "—",
    floor: flat?.floor ?? 0,
    residentName: resident?.fullName ?? "Vacant",
    residentPhone: resident?.phone ?? owner?.phone ?? "",
  };
}

function buildCriticalAlerts(
  overdueFlatCount: number,
  draftCount: number
): AdminCriticalAlert[] {
  const alerts: AdminCriticalAlert[] = [];

  for (const asset of communityAssets) {
    if (asset.status === "amc_overdue") {
      alerts.push({
        id: `alert-${asset.id}`,
        title: `${asset.name} — AMC overdue`,
        description: `AMC with ${asset.vendor} expired ${formatDate(asset.amcExpiryDate)}. Renew before next service.`,
        priority: "critical",
        actionLabel: "View asset",
        href: routes.dashboard.inspector.services.asset(asset.id),
      });
    } else if (asset.status === "service_due_soon" && asset.nextServiceDate) {
      alerts.push({
        id: `alert-svc-soon-${asset.id}`,
        title: `${asset.name} — service due soon`,
        description: `Next service ${formatDate(asset.nextServiceDate)} with ${asset.vendor}.`,
        priority: "warning",
        actionLabel: "View asset",
        href: routes.dashboard.inspector.services.asset(asset.id),
      });
    }
  }

  const todayIso = getDemoTodayIso();
  const completedRecently = getServices().filter(
    (s) => s.status === "completed" && s.lastServiceDate === todayIso
  );
  for (const service of completedRecently.slice(0, 1)) {
    alerts.push({
      id: `alert-svc-done-${service.id}`,
      title: `${service.title} — completed`,
      description: `${service.vendor} finished scheduled work.`,
      priority: "info",
      actionLabel: "View services",
      href: routes.dashboard.inspector.services.root,
    });
  }

  const todayServices = getServices().filter(
    (s) => s.status === "scheduled" && isServiceToday(s)
  );
  for (const service of todayServices.slice(0, 2)) {
    alerts.push({
      id: `alert-svc-${service.id}`,
      title: `${service.title} — today`,
      description: `${service.vendor} · ${service.scheduledTime}`,
      priority: "warning",
      actionLabel: "View schedule",
      href: routes.dashboard.inspector.services.root,
    });
  }

  if (overdueFlatCount > 0) {
    alerts.push({
      id: "alert-overdue-flats",
      title: `${overdueFlatCount} flats overdue`,
      description: "Maintenance bills past due date — follow-up required.",
      priority: overdueFlatCount >= 5 ? "critical" : "warning",
      actionLabel: "View follow-ups",
    });
  }

  if (draftCount > 0) {
    alerts.push({
      id: "alert-draft-notices",
      title: `${draftCount} draft notice${draftCount > 1 ? "s" : ""} pending`,
      description: "Unpublished announcements waiting for review.",
      priority: "info",
      actionLabel: "Review drafts",
      href: routes.dashboard.inspector.notices.drafts,
    });
  }

  return alerts;
}

function computeServicesOnSchedule(): number {
  if (communityAssets.length === 0) return 100;
  const healthy = communityAssets.filter(
    (a) => a.status === "active" || a.status === "service_due_soon"
  ).length;
  return Math.round((healthy / communityAssets.length) * 1000) / 10;
}

export function computeCommunityHealthScore(
  collectionRate: number,
  occupancyRate: number,
  overdueFlatCount: number,
  criticalAlerts: AdminCriticalAlert[],
  pendingFollowUpCount: number,
  upcomingServiceCount: number,
  activeNoticeCount: number
): CommunityHealthScore {
  const criticalCount = criticalAlerts.filter(
    (a) => a.priority === "critical"
  ).length;
  const servicesOnSchedule = computeServicesOnSchedule();

  let score = 0;
  if (collectionRate >= 95) score += 25;
  else if (collectionRate >= 90) score += 18;
  else if (collectionRate >= 80) score += 10;
  else score += 4;

  if (occupancyRate >= 95) score += 20;
  else if (occupancyRate >= 85) score += 14;
  else score += 6;

  if (servicesOnSchedule >= 90) score += 20;
  else if (servicesOnSchedule >= 75) score += 12;
  else score += 5;

  if (overdueFlatCount === 0) score += 20;
  else if (overdueFlatCount <= 3) score += 12;
  else if (overdueFlatCount <= 8) score += 6;

  if (criticalCount === 0) score += 15;
  else if (criticalCount <= 2) score += 8;

  const stars =
    score >= 85 ? 5 : score >= 70 ? 4 : score >= 55 ? 3 : score >= 40 ? 2 : 1;

  const labelMap: Record<number, CommunityHealthScore["label"]> = {
    5: "Excellent",
    4: "Good",
    3: "Fair",
    2: "Needs attention",
    1: "Critical",
  };

  return {
    stars,
    label: labelMap[stars],
    collectionRate,
    occupancyRate,
    servicesOnSchedule,
    criticalAlertCount: criticalAlerts.length,
    pendingFollowUpCount,
    overdueFlatCount,
    upcomingServiceCount,
    activeNoticeCount,
  };
}

function getRecentMoveEvents(): { moveIns: AdminMoveEvent[]; moveOuts: AdminMoveEvent[] } {
  const today = getDemoToday();
  const weekAgo = new Date(today);
  weekAgo.setDate(today.getDate() - 7);
  const weekAgoIso = weekAgo.toISOString().slice(0, 10);

  const moveIns: AdminMoveEvent[] = [];
  const moveOuts: AdminMoveEvent[] = [];

  for (const tenant of getAllTenants()) {
    const flat = getFlatById(tenant.flatId);
    if (!flat) continue;

    if (tenant.leaseStartDate >= weekAgoIso && tenant.isActive) {
      moveIns.push({
        id: `move-in-${tenant.id}`,
        flatId: tenant.flatId,
        flatNumber: flat.flatNumber,
        residentName: tenant.fullName,
        date: tenant.leaseStartDate,
        type: "move_in",
      });
    }

    if (!tenant.isActive || tenant.leaseEndDate >= weekAgoIso) {
      const end = tenant.leaseEndDate;
      if (end >= weekAgoIso && end <= getDemoTodayIso()) {
        moveOuts.push({
          id: `move-out-${tenant.id}`,
          flatId: tenant.flatId,
          flatNumber: flat.flatNumber,
          residentName: tenant.fullName,
          date: end,
          type: "move_out",
        });
      }
    }
  }

  return {
    moveIns: moveIns.length
      ? moveIns.sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5)
      : [
          {
            id: "demo-move-in-503",
            flatId: "flat-503",
            flatNumber: "503",
            residentName: "Vikram Reddy",
            date: "2025-06-28",
            type: "move_in" as const,
          },
        ],
    moveOuts: moveOuts.sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5),
  };
}

function buildResidentRequests() {
  return residentRequests
    .filter((r) => r.status === "open")
    .map((req) => {
      const flat = getFlatById(req.flatId);
      const owner = getPrimaryOwner(req.flatId);
      const tenant = getTenantsByFlat(req.flatId)[0];
      return {
        ...req,
        flatNumber: flat?.flatNumber ?? "—",
        residentName: tenant?.fullName ?? owner?.fullName ?? "—",
      };
    });
}

function buildTodayOperations(
  todayServices: Service[],
  followUpList: EnrichedFollowUp[],
  todayPaid: ReturnType<typeof getPaymentsRecordedOn>,
  paymentLimit: number
): AdminTodayOperations {
  const { moveIns, moveOuts } = getRecentMoveEvents();
  const payments = todayPaid.slice(0, paymentLimit).map((p) => {
    const flat = getFlatById(p.flatId);
    return {
      id: p.id,
      flatNumber: flat?.flatNumber ?? "—",
      amount: p.amount,
      period: p.period,
      flatId: p.flatId,
    };
  });

  return {
    vendorVisits: todayServices,
    residentRequests: buildResidentRequests(),
    payments,
    paymentsSummary: {
      amountCollected: todayPaid.reduce((s, p) => s + p.amount, 0),
      paymentCount: todayPaid.length,
    },
    pendingTasks: buildTodayTasks(todayServices, followUpList),
    moveIns,
    moveOuts,
    draftNotices: noticeDrafts,
  };
}

function buildTodayTasks(
  todayServices: Service[],
  followUpList: EnrichedFollowUp[]
): AdminOperationalTask[] {
  const tasks: AdminOperationalTask[] = [];

  for (const service of todayServices) {
    tasks.push({
      id: `task-${service.id}`,
      title: service.title,
      description: `${service.vendor} · ${service.scheduledTime}`,
      dueLabel: "Today",
      priority: "warning",
      category: "service",
    });
  }

  const dueTodayFollowUps = followUpList.filter(
    (f) => f.nextFollowUpDate === getDemoTodayIso()
  );
  for (const fu of dueTodayFollowUps) {
    tasks.push({
      id: `task-fu-${fu.id}`,
      title: `Follow up — Flat ${fu.flatNumber}`,
      description: fu.lastOutcome,
      dueLabel: "Today",
      priority: fu.status === "escalated" ? "critical" : "warning",
      category: "follow_up",
    });
  }

  for (const draft of noticeDrafts.slice(0, 1)) {
    tasks.push({
      id: `task-draft-${draft.id}`,
      title: "Review notice draft",
      description: draft.title,
      dueLabel: "Pending",
      priority: draft.priority === "high" ? "warning" : "info",
      category: "notice",
    });
  }

  return tasks.slice(0, 8);
}

export function getAdminRecentActivity(limit = 8): FlatTimelineEvent[] {
  const events: FlatTimelineEvent[] = [];
  const todayIso = getDemoTodayIso();

  const recentPaid = getPayments()
    .filter((p) => p.status === "paid" && p.paidDate)
    .sort(
      (a, b) =>
        new Date(b.paidDate!).getTime() - new Date(a.paidDate!).getTime()
    )
    .slice(0, 5);

  for (const payment of recentPaid) {
    const flat = getFlatById(payment.flatId);
    events.push({
      id: `act-pay-${payment.id}`,
      date: payment.paidDate!,
      title: "Payment recorded",
      description: `Flat ${flat?.flatNumber ?? "—"} · ${formatCurrency(payment.amount)} · ${payment.period}`,
      type: "payment",
    });
  }

  for (const notice of getNotices().slice(0, 3)) {
    events.push({
      id: `act-notice-${notice.id}`,
      date: notice.publishedAt,
      title: "Notice published",
      description: notice.title,
      type: "notice",
    });
  }

  const completedServices = getServices().filter((s) => s.status === "completed");
  for (const service of completedServices.slice(0, 2)) {
    events.push({
      id: `act-svc-${service.id}`,
      date: service.lastServiceDate ?? service.scheduledDate,
      title: "Service completed",
      description: `${service.title} · ${service.vendor}`,
      type: "service",
    });
  }

  events.push({
    id: "act-resident-update",
    date: todayIso,
    title: "Resident details updated",
    description: "Flat 110 — emergency contact number revised",
    type: "family",
  });

  for (const fu of followUps.slice(0, 2)) {
    const flat = getFlatById(fu.flatId);
    events.push({
      id: `act-fu-${fu.id}`,
      date: fu.lastContactAt.slice(0, 10),
      title: "Follow-up logged",
      description: `Flat ${flat?.flatNumber ?? "—"} · ${fu.lastOutcome}`,
      type: "occupancy",
    });
  }

  return events
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, limit);
}

function getBlockSummaries() {
  return getBlocks().map((block) => {
    const blockFlats = getFlatsByBlock(block.id);
    const overdueIds = new Set(
      getOverduePayments()
        .filter((p) => blockFlats.some((f) => f.id === p.flatId))
        .map((p) => p.flatId)
    );
    const vacantCount = blockFlats.filter(
      (f) => f.occupancyStatus === "vacant"
    ).length;
    const paidCount = blockFlats.filter((flat) => {
      const row = getResidentTableRows().find((r) => r.id === flat.id);
      return row?.maintenanceStatus === "paid";
    }).length;
    const billable = blockFlats.length - vacantCount;

    return {
      blockId: block.id,
      blockName: block.name,
      totalFlats: blockFlats.length,
      overdueCount: overdueIds.size,
      vacantCount,
      collectionRate:
        billable > 0 ? Math.round((paidCount / billable) * 1000) / 10 : 100,
    };
  });
}

export function getAdminDashboardSummary(): AdminDashboardSummary {
  const apartment = getApartment();
  const stats = getApartmentStats();
  const maintenance = getMaintenanceSummary();
  const todayIso = getDemoTodayIso();
  const scaleTier = getAdminScaleTier(stats.totalFlats);
  const limits = getScaleLimits(scaleTier);
  const overdueFlatCount = getOverdueFlatCount();
  const activeFollowUps = getFollowUpRecords();
  const drafts = getNoticeDrafts();

  const todayPaid = getPaymentsRecordedOn(todayIso);
  const recentPayments = todayPaid.slice(0, limits.todayPayments).map((p) => {
    const flat = getFlatById(p.flatId);
    return {
      id: p.id,
      flatNumber: flat?.flatNumber ?? "—",
      amount: p.amount,
      paidDate: p.paidDate!,
      period: p.period,
      flatId: p.flatId,
    };
  });

  const scheduledServices = getServices().filter((s) => s.status === "scheduled");
  const todayServices = scheduledServices.filter(isServiceToday);
  const upcomingServices = scheduledServices
    .filter((s) => s.scheduledDate >= todayIso)
    .slice(0, 5);

  const enrichedFollowUps = activeFollowUps
    .map(enrichFollowUpFromRecord)
    .sort((a, b) => a.nextFollowUpDate.localeCompare(b.nextFollowUpDate))
    .slice(0, limits.followUps);

  const occupancyRate =
    stats.totalFlats > 0
      ? Math.round((stats.occupiedFlats / stats.totalFlats) * 1000) / 10
      : 0;

  const criticalAlerts = buildCriticalAlerts(
    overdueFlatCount,
    drafts.length
  ).slice(0, limits.criticalAlerts);

  const todayDate = new Date(DEMO_REFERENCE_DATE);
  const todayLabel = new Intl.DateTimeFormat("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(todayDate);

  const todayOperations = buildTodayOperations(
    todayServices,
    enrichedFollowUps,
    todayPaid,
    limits.todayPayments
  );

  const communityHealth = computeCommunityHealthScore(
    maintenance.collectionRate,
    occupancyRate,
    overdueFlatCount,
    criticalAlerts,
    activeFollowUps.length,
    upcomingServices.length,
    getNotices().length
  );

  return {
    apartmentName: apartment.name,
    todayLabel,
    scaleTier,
    stats,
    maintenance,
    communityHealth,
    criticalAlerts,
    followUps: enrichedFollowUps,
    todayOperations,
    recentActivity: getAdminRecentActivity(limits.activityEvents),
    blockSummaries: getBlockSummaries(),
    collectionRate: maintenance.collectionRate,
    overdueFlatCount,
    pendingFollowUpCount: activeFollowUps.length,
    activeNoticeCount: getNotices().length,
    upcomingServiceCount: upcomingServices.length,
    occupancyRate,
    todayTasks: todayOperations.pendingTasks,
    todayCollections: {
      amountCollected: todayOperations.paymentsSummary.amountCollected,
      paymentCount: todayOperations.paymentsSummary.paymentCount,
      recentPayments,
    },
    upcomingServices,
    todayServices,
    draftNotices: drafts,
  };
}

export function groupSearchResults(results: AdminSearchResult[]) {
  const order: AdminSearchResult["kind"][] = [
    "flat",
    "person",
    "block",
    "floor",
  ];
  const groups = order.map((kind) => ({
    kind,
    results: results.filter((r) => r.kind === kind),
  }));
  return groups.filter((g) => g.results.length > 0);
}

export function searchAdminDirectory(query: string): AdminSearchResult[] {
  const q = query.trim().toLowerCase().replace(/\s/g, "");
  if (!q) return [];

  const results: AdminSearchResult[] = [];
  const seen = new Set<string>();

  function add(result: AdminSearchResult) {
    if (seen.has(result.id)) return;
    seen.add(result.id);
    results.push(result);
  }

  for (const block of getBlocks()) {
    const blockKey = block.name.toLowerCase().replace(/\s/g, "");
    const codeKey = block.code.toLowerCase();
    if (blockKey.includes(q) || codeKey.includes(q) || `block${codeKey}`.includes(q)) {
      add({
        id: `block-${block.id}`,
        kind: "block",
        title: block.name,
        subtitle: `${block.totalFlats} flats · ${block.floorCount} floors`,
        blockId: block.id,
      });
    }
  }

  for (const flat of getFlats()) {
    const block = getBlockById(flat.blockId);
    const floorKey = `floor${flat.floor}`;
    const flatKey = flat.flatNumber.toLowerCase();

    if (floorKey.includes(q) || q === `f${flat.floor}`) {
      add({
        id: `floor-${flat.blockId}-${flat.floor}`,
        kind: "floor",
        title: `${block?.name ?? "Block"} · Floor ${flat.floor}`,
        subtitle: `${getFlatsByBlock(flat.blockId).filter((f) => f.floor === flat.floor).length} flats`,
        blockId: flat.blockId,
        floor: flat.floor,
      });
    }

    if (flatKey.includes(q)) {
      const row = getResidentTableRows().find((r) => r.id === flat.id);
      add({
        id: `flat-${flat.id}`,
        kind: "flat",
        title: `Flat ${flat.flatNumber}`,
        subtitle: `${block?.name ?? ""} · Floor ${flat.floor} · ${row?.residentName ?? "Vacant"}`,
        flatId: flat.id,
        blockId: flat.blockId,
        floor: flat.floor,
        maintenanceStatus: row?.maintenanceStatus,
      });
    }
  }

  for (const row of getResidentTableRows()) {
    const flat = getFlatById(row.id);
    const blockEntity = flat ? getBlockById(flat.blockId) : undefined;
    const matchesPerson =
      row.residentName.toLowerCase().replace(/\s/g, "").includes(q) ||
      row.ownerName.toLowerCase().replace(/\s/g, "").includes(q) ||
      row.tenantName.toLowerCase().replace(/\s/g, "").includes(q) ||
      row.phone.replace(/\s/g, "").includes(q) ||
      row.familyNames.some((name) =>
        name.toLowerCase().replace(/\s/g, "").includes(q)
      );

    if (matchesPerson) {
      add({
        id: `person-${row.id}`,
        kind: "person",
        title: row.residentName,
        subtitle: `Flat ${row.flatNumber} · ${blockEntity?.name ?? ""} · ${row.phone || "No phone"}`,
        flatId: row.id,
        blockId: flat?.blockId,
        floor: row.floor,
        maintenanceStatus: row.maintenanceStatus,
      });
    }
  }

  return results.slice(0, 12);
}

export function formatDateTime(iso: string): string {
  const date = new Date(iso);
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(date);
}

export function getFollowUpStatusLabel(status: FollowUpRecord["status"]): string {
  const labels: Record<FollowUpRecord["status"], string> = {
    open: "Open",
    promised: "Promised",
    escalated: "Escalated",
    resolved: "Resolved",
  };
  return labels[status];
}

export function getContactMethodLabel(
  method: FollowUpRecord["lastContactMethod"]
): string {
  const labels: Record<FollowUpRecord["lastContactMethod"], string> = {
    phone: "Called",
    whatsapp: "WhatsApp",
    email: "Emailed",
    in_person: "In person",
  };
  return labels[method];
}
