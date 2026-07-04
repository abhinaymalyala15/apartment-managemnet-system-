export type OccupancyStatus = "vacant" | "owner_occupied" | "tenant_occupied";

export interface Apartment {
  id: string;
  name: string;
  slug: string;
  tagline: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  phone: string;
  email: string;
  registrationNumber: string;
  totalBlocks: number;
  totalFlats: number;
  totalFloors?: number;
  yearEstablished: number;
  description: string;
}

export interface Block {
  id: string;
  apartmentId: string;
  name: string;
  code: string;
  floorCount: number;
  totalFlats: number;
  description: string;
}

export interface Flat {
  id: string;
  apartmentId: string;
  blockId: string;
  flatNumber: string;
  floor: number;
  areaSqft: number;
  bedrooms: number;
  flatType: string;
  parkingSlots?: number;
  occupancyStatus: OccupancyStatus;
}

export interface Resident {
  id: string;
  apartmentId: string;
  flatId: string;
  fullName: string;
  email: string;
  phone: string;
  role: "resident";
}

export interface Owner {
  id: string;
  apartmentId: string;
  flatId: string;
  fullName: string;
  email: string;
  phone: string;
  alternatePhone?: string;
  isPrimary: boolean;
  ownershipStartDate: string;
}

export interface Tenant {
  id: string;
  apartmentId: string;
  flatId: string;
  fullName: string;
  email: string;
  phone: string;
  leaseStartDate: string;
  leaseEndDate: string;
  isActive: boolean;
}

export interface FamilyMember {
  id: string;
  apartmentId: string;
  flatId: string;
  fullName: string;
  relationship: string;
  phone?: string;
  email?: string;
  dateOfBirth?: string;
  marriageAnniversary?: string;
}

export interface Payment {
  id: string;
  apartmentId: string;
  flatId: string;
  amount: number;
  type: "maintenance" | "penalty" | "special_levy";
  status: "paid" | "pending" | "overdue";
  dueDate: string;
  paidDate?: string;
  receiptNumber?: string;
  period: string;
}

/** Admin billing setup — per-flat maintenance and optional other charges */
export type FlatBillingStatus = "pending" | "paid" | "overdue";

export interface FlatBillingAssignment {
  flatId: string;
  maintenanceAmount: number;
  otherAmount: number;
  maintenanceStatus: FlatBillingStatus;
  /** Set when admin manually clears pending after offline payment */
  manuallyClearedAt?: string;
}

export interface BillingSetupConfig {
  otherColumnLabel: string;
  billingPeriod: string;
  ratePerSqft: number;
  assignments: FlatBillingAssignment[];
}

export interface FlatBillingRow extends FlatBillingAssignment {
  flatNumber: string;
  blockName: string;
  residentName: string | null;
  areaSqft: number;
  totalDue: number;
}

export interface Notice {
  id: string;
  apartmentId: string;
  title: string;
  content: string;
  category: "general" | "maintenance" | "event" | "emergency";
  publishedAt: string;
  priority: "low" | "medium" | "high";
  /** Admin fields (Phase 7F) */
  author?: string;
  audience?: NoticeAudience;
  blockIds?: string[];
  isEmergency?: boolean;
  scheduledAt?: string;
}

export type NoticeAudience = "all" | "owners" | "tenants" | "block";

export type NoticeLifecycleStatus = "draft" | "scheduled" | "published" | "archived";

export interface NoticeDraft {
  id: string;
  apartmentId: string;
  title: string;
  content?: string;
  category: Notice["category"];
  priority: Notice["priority"];
  lastEditedAt: string;
  author: string;
  audience?: NoticeAudience;
  blockIds?: string[];
  isEmergency?: boolean;
  scheduledAt?: string;
}

export interface ArchivedNotice extends Notice {
  archivedAt: string;
  archivedBy: string;
}

export interface ScheduledNotice extends NoticeDraft {
  scheduledAt: string;
  status: "scheduled";
}

export interface NoticeHistoryEvent {
  id: string;
  noticeId: string;
  noticeTitle: string;
  action: "created" | "edited" | "published" | "scheduled" | "archived" | "emergency_sent";
  actor: string;
  occurredAt: string;
  detail?: string;
}

export interface CommunicationSummary {
  publishedCount: number;
  draftCount: number;
  scheduledCount: number;
  archivedCount: number;
  emergencyCount: number;
  recentPublished: Notice[];
  upcomingScheduled: ScheduledNotice[];
}

export interface Service {
  id: string;
  apartmentId: string;
  flatId?: string;
  title: string;
  description: string;
  serviceType: string;
  scheduledDate: string;
  scheduledTime: string;
  vendor: string;
  status: "scheduled" | "completed" | "cancelled";
  lastServiceDate?: string;
  nextDueDate?: string;
  frequency?: string;
}

export interface DemoUser {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  role: "resident" | "inspector" | "admin" | "super_admin";
  flatId?: string;
  flatNumber?: string;
}

export interface GalleryImage {
  id: string;
  apartmentId: string;
  title: string;
  category: string;
  imageUrl: string;
  caption: string;
}

export interface MaintenanceSummary {
  totalCollected: number;
  totalOutstanding: number;
  collectionRate: number;
  month: string;
  maintenanceRatePerSqft?: number;
  flatAreaSqft?: number;
  monthlyMaintenancePerFlat?: number;
}

export interface EmergencyContact {
  id: string;
  label: string;
  phone: string;
  hours: string;
  role: string;
}

export interface CommitteeMember {
  id: string;
  name: string;
  role: string;
  phone: string;
  email: string;
}

export interface CommitteeContacts {
  emergency: EmergencyContact[];
  committee: CommitteeMember[];
  office: {
    label: string;
    phone: string;
    email: string;
    hours: string;
  };
}

export interface FlatTimelineEvent {
  id: string;
  date: string;
  title: string;
  description: string;
  type:
    | "occupancy"
    | "payment"
    | "service"
    | "notice"
    | "family"
    | "document"
    | "follow_up"
    | "communication"
    | "note";
  href?: string;
}

export interface ResidentDocument {
  id: string;
  apartmentId: string;
  flatId?: string;
  title: string;
  category: "ownership" | "receipt" | "society" | "other";
  uploadedAt: string;
  fileLabel: string;
}

export type FollowUpStatus = "open" | "promised" | "escalated" | "resolved";

export interface FollowUpRecord {
  id: string;
  apartmentId: string;
  flatId: string;
  amountPending: number;
  daysOverdue: number;
  lastContactAt: string;
  lastContactMethod: "phone" | "whatsapp" | "email" | "in_person";
  lastOutcome: string;
  nextFollowUpDate: string;
  assignedTo: string;
  status: FollowUpStatus;
}

export type AssetCategory =
  | "lift"
  | "water_tank"
  | "generator"
  | "fire_safety"
  | "cctv"
  | "garden"
  | "solar"
  | "stp"
  | "wtp"
  | "swimming_pool"
  | "club_house"
  | "gym"
  | "play_area"
  | "ev_charging"
  | "dg_backup"
  | "street_lighting"
  | "other";

export type FacilityScope = "community" | "block" | "flat";

export type CommunityAssetStatus =
  | "active"
  | "amc_overdue"
  | "service_due_soon"
  | "under_maintenance"
  | "inactive";

export interface CommunityAsset {
  id: string;
  apartmentId: string;
  blockId?: string;
  flatId?: string;
  name: string;
  assetType: AssetCategory;
  scope: FacilityScope;
  location?: string;
  vendor: string;
  vendorId?: string;
  amcExpiryDate: string;
  amcId?: string;
  nextServiceDate?: string;
  lastServiceDate?: string;
  installationDate?: string;
  warrantyExpiry?: string;
  status: CommunityAssetStatus;
}

export interface AssetAmcRecord {
  id: string;
  assetId: string;
  vendorId: string;
  vendorName: string;
  startDate: string;
  endDate: string;
  renewalReminderDays: number;
  contactPerson: string;
  phone: string;
  email: string;
}

export interface FacilityVendor {
  id: string;
  apartmentId: string;
  name: string;
  category: string;
  phone: string;
  email: string;
  contactPerson?: string;
  assetIds: string[];
}

/** Admin services setup — publish, edit, remove registry entries */
export type ServicePublishStatus = "draft" | "published";

export interface AdminServiceAsset extends CommunityAsset {
  publishStatus: ServicePublishStatus;
  serviceIntervalDays: number;
}

export interface AdminServiceVendor extends FacilityVendor {
  publishStatus: ServicePublishStatus;
}

export interface AdminServiceAmc extends AssetAmcRecord {
  publishStatus: ServicePublishStatus;
}

export interface AdminServiceFrequency {
  assetId: string;
  assetName: string;
  assetType: AssetCategory;
  serviceIntervalDays: number;
  nextServiceDate?: string;
  publishStatus: ServicePublishStatus;
}

export interface AssetServiceRecord {
  id: string;
  assetId?: string;
  apartmentId: string;
  flatId?: string;
  scope: FacilityScope;
  title: string;
  description: string;
  serviceType: string;
  scheduledDate: string;
  scheduledTime: string;
  completedDate?: string;
  vendor: string;
  vendorId?: string;
  technician?: string;
  status: "scheduled" | "completed" | "cancelled" | "in_progress";
  checklist?: string[];
  remarks?: string;
  attachmentLabels?: string[];
  lastServiceDate?: string;
  nextDueDate?: string;
  frequency?: string;
}

export interface AssetDocument {
  id: string;
  assetId: string;
  title: string;
  category: "manual" | "warranty" | "amc_agreement" | "certificate" | "service_report";
  uploadedAt: string;
  fileLabel: string;
}

export interface AssetInternalNote {
  id: string;
  assetId: string;
  author: string;
  createdAt: string;
  content: string;
}

export type AssetTimelineEventType =
  | "installed"
  | "amc_renewed"
  | "service_completed"
  | "breakdown"
  | "inspection"
  | "document"
  | "vendor_changed"
  | "service_scheduled";

export interface AssetTimelineEvent {
  id: string;
  assetId: string;
  date: string;
  title: string;
  description: string;
  type: AssetTimelineEventType;
}

export interface FacilityAssetProfile extends CommunityAsset {
  blockName?: string;
  flatNumber?: string;
  amc: AssetAmcRecord | null;
  documents: AssetDocument[];
  internalNotes: AssetInternalNote[];
  timeline: AssetTimelineEvent[];
  services: AssetServiceRecord[];
}

export interface FacilityDashboardSummary {
  totalAssets: number;
  needsServicing: number;
  amcExpiringSoon: number;
  amcOverdue: number;
  scheduledToday: number;
  overdueServices: number;
  underMaintenance: number;
  recentlyCompleted: AssetServiceRecord[];
  todayServices: AssetServiceRecord[];
  upcomingServices: AssetServiceRecord[];
  criticalAssets: CommunityAsset[];
}

export type AdminAlertPriority = "critical" | "warning" | "info";

export interface AdminCriticalAlert {
  id: string;
  title: string;
  description: string;
  priority: AdminAlertPriority;
  href?: string;
  actionLabel?: string;
}

export type AdminSearchResultKind = "block" | "floor" | "flat" | "person";

export interface AdminSearchResult {
  id: string;
  kind: AdminSearchResultKind;
  title: string;
  subtitle: string;
  flatId?: string;
  blockId?: string;
  floor?: number;
  maintenanceStatus?: "paid" | "pending" | "overdue" | "vacant";
}

export interface AdminOperationalTask {
  id: string;
  title: string;
  description: string;
  dueLabel: string;
  priority: AdminAlertPriority;
  category: "service" | "billing" | "notice" | "follow_up" | "asset";
}

export interface CommunityHealthScore {
  stars: number;
  label: "Critical" | "Needs attention" | "Fair" | "Good" | "Excellent";
  collectionRate: number;
  occupancyRate: number;
  servicesOnSchedule: number;
  criticalAlertCount: number;
  pendingFollowUpCount: number;
  overdueFlatCount: number;
  upcomingServiceCount: number;
  activeNoticeCount: number;
}

export interface ResidentRequest {
  id: string;
  apartmentId: string;
  flatId: string;
  title: string;
  description: string;
  status: "open" | "in_progress" | "resolved";
  priority: "low" | "medium" | "high";
  createdAt: string;
}

export interface AdminMoveEvent {
  id: string;
  flatId: string;
  flatNumber: string;
  residentName: string;
  date: string;
  type: "move_in" | "move_out";
}

export interface AdminTodayOperations {
  vendorVisits: Service[];
  residentRequests: Array<
    ResidentRequest & { flatNumber: string; residentName: string }
  >;
  payments: Array<{
    id: string;
    flatNumber: string;
    amount: number;
    period: string;
    flatId: string;
  }>;
  paymentsSummary: { amountCollected: number; paymentCount: number };
  pendingTasks: AdminOperationalTask[];
  moveIns: AdminMoveEvent[];
  moveOuts: AdminMoveEvent[];
  draftNotices: NoticeDraft[];
}

export interface FlatInternalNote {
  id: string;
  flatId: string;
  author: string;
  createdAt: string;
  content: string;
}

export type CommunicationChannel = "phone" | "sms" | "email" | "whatsapp";

export interface FlatCommunication {
  id: string;
  flatId: string;
  channel: CommunicationChannel;
  direction: "inbound" | "outbound";
  contactName: string;
  summary: string;
  occurredAt: string;
  staffName: string;
}

export interface FlatOwnerProfile {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  alternatePhone?: string;
  ownershipStartDate: string;
  aadhaarMasked: string;
}

export interface FlatTenantProfile {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  leaseStartDate: string;
  leaseEndDate: string;
  isActive: boolean;
}

export interface FlatFamilyProfile {
  id: string;
  fullName: string;
  relationship: string;
  phone?: string;
  email?: string;
  age?: number;
  isEmergencyContact: boolean;
}

export interface FlatMaintenanceSnapshot {
  currentBill: {
    period: string;
    amount: number;
    dueDate: string;
    status: Payment["status"];
  } | null;
  outstanding: number;
  lastPayment: {
    period: string;
    amount: number;
    paidDate: string;
    receiptNumber?: string;
  } | null;
  paymentStatus: "paid" | "pending" | "overdue" | "vacant";
  bills: Payment[];
  payments: Payment[];
  receipts: Payment[];
}

export interface FlatOperationsData {
  flatId: string;
  apartmentName: string;
  blockId: string;
  blockName: string;
  floor: number;
  flatNumber: string;
  flatType: string;
  areaSqft: number;
  bedrooms: number;
  parkingSlots?: number;
  occupancyStatus: OccupancyStatus;
  occupancyLabel: string;
  billStatus: "paid" | "pending" | "overdue" | "vacant";
  residentPhone: string;
  owner: FlatOwnerProfile | null;
  tenant: FlatTenantProfile | null;
  family: FlatFamilyProfile[];
  maintenance: FlatMaintenanceSnapshot;
  documents: ResidentDocument[];
  timeline: FlatTimelineEvent[];
  internalNotes: FlatInternalNote[];
  communications: FlatCommunication[];
  followUp: {
    id: string;
    amountPending: number;
    daysOverdue: number;
    lastContactAt: string;
    lastContactMethod: FollowUpRecord["lastContactMethod"];
    lastOutcome: string;
    nextFollowUpDate: string;
    status: FollowUpRecord["status"];
    residentName: string;
    residentPhone: string;
  } | null;
}

/** Finance module (Phase 7E) */
export interface FinancePaymentTrendPoint {
  month: string;
  monthKey: string;
  collected: number;
  outstanding: number;
  collectionRate: number;
}

export interface EnrichedFinancePayment extends Payment {
  flatNumber: string;
  blockId: string;
  blockName: string;
  floor: number;
  residentName: string;
}

export interface OutstandingQueueItem {
  id: string;
  flatId: string;
  flatNumber: string;
  blockId: string;
  blockName: string;
  floor: number;
  residentName: string;
  residentPhone: string;
  outstanding: number;
  daysOverdue: number;
  lastPayment: {
    period: string;
    amount: number;
    paidDate: string;
  } | null;
  lastContactAt: string | null;
  lastContactMethod: FollowUpRecord["lastContactMethod"] | null;
  lastOutcome: string | null;
  promiseDate: string | null;
  followUpStatus: FollowUpRecord["status"] | null;
  followUpId: string | null;
  priorityScore: number;
  priorityTier: "escalated" | "broken_promise" | "high_amount" | "long_overdue" | "recent_due";
}

export interface CommunityFinanceSummary {
  apartmentName: string;
  billingMonth: string;
  totalCollected: number;
  totalOutstanding: number;
  collectionRate: number;
  monthlyCollection: number;
  pendingAmount: number;
  overdueAmount: number;
  todayCollection: number;
  todayPaymentCount: number;
  recentPayments: EnrichedFinancePayment[];
  paymentTrend: FinancePaymentTrendPoint[];
  bestMonth: FinancePaymentTrendPoint | null;
  highestOutstandingBlock: {
    blockId: string;
    blockName: string;
    outstanding: number;
  } | null;
  openFollowUpCount: number;
  overdueFlatCount: number;
  financialHealth: "excellent" | "good" | "fair" | "needs_attention";
  blockSummaries: Array<{
    blockId: string;
    blockName: string;
    totalFlats: number;
    collectionRate: number;
    outstanding: number;
    pendingAmount: number;
    overdueAmount: number;
    overdueCount: number;
  }>;
}

export interface BlockFinanceSummary {
  blockId: string;
  blockName: string;
  billingMonth: string;
  totalFlats: number;
  billableFlats: number;
  collectionRate: number;
  totalCollected: number;
  outstanding: number;
  pendingAmount: number;
  overdueAmount: number;
  overdueCount: number;
  paymentTrend: FinancePaymentTrendPoint[];
  topDefaulters: OutstandingQueueItem[];
  recentPayments: EnrichedFinancePayment[];
}

/** Reports module (Phase 7H) */
export interface ReportScope {
  blockId?: string;
  floor?: number;
  flatId?: string;
}

export interface ReportScopeContext {
  scope: ReportScope;
  label: string;
  breadcrumbs: Array<{ label: string; href: string }>;
}

export interface ReportDrillRow {
  id: string;
  label: string;
  sublabel?: string;
  value: string | number;
  secondary?: string;
  href?: string;
  highlight?: boolean;
}

export interface CollectionReportData {
  context: ReportScopeContext;
  collectionRate: number;
  totalCollected: number;
  totalOutstanding: number;
  billingMonth: string;
  paymentTrend: FinancePaymentTrendPoint[];
  blockRows: ReportDrillRow[];
}

export interface OccupancyReportData {
  context: ReportScopeContext;
  totalFlats: number;
  occupiedFlats: number;
  vacantFlats: number;
  ownerOccupied: number;
  tenantOccupied: number;
  occupancyRate: number;
  floorRows: ReportDrillRow[];
  flatRows: ReportDrillRow[];
}

export interface MaintenanceReportData {
  context: ReportScopeContext;
  outstanding: number;
  overdueCount: number;
  pendingCount: number;
  paidCount: number;
  flatRows: ReportDrillRow[];
}

export interface CommunicationReportData {
  context: ReportScopeContext;
  publishedCount: number;
  draftCount: number;
  emergencyCount: number;
  byCategory: ReportDrillRow[];
}

export interface AssetReportData {
  context: ReportScopeContext;
  totalAssets: number;
  amcOverdue: number;
  serviceDueSoon: number;
  assetRows: ReportDrillRow[];
}

export interface MovementReportData {
  context: ReportScopeContext;
  moveIns: ReportDrillRow[];
  moveOuts: ReportDrillRow[];
}

/** Settings module (Phase 7I) */
export interface MaintenanceBillingConfig {
  maintenanceRatePerSqft: number;
  defaultFlatAreaSqft: number;
  billingCycleDay: number;
  lateFeePercent: number;
  lateFeeGraceDays: number;
  gstApplicable: boolean;
  gstPercent: number;
  effectiveFrom: string;
  approvedBy: string;
  notes: string;
}

export interface StaffMember {
  id: string;
  fullName: string;
  roleId: string;
  phone: string;
  email: string;
  department: string;
  blockIds: string[];
  isActive: boolean;
  joinedAt: string;
}

export interface AdminRoleDefinition {
  id: string;
  label: string;
  description: string;
  scope: "apartment" | "block" | "flat";
  permissions: string[];
}

export interface SystemPreferences {
  timezone: string;
  dateFormat: string;
  currency: string;
  locale: string;
  fiscalYearStartMonth: number;
  defaultNoticeChannel: string;
  autoArchiveNoticesDays: number;
}

export interface IntegrationDef {
  id: string;
  label: string;
  description: string;
  enabled: boolean;
  phase?: string;
}

export interface StructureBlockSummary {
  id: string;
  name: string;
  code: string;
  floorCount: number;
  flatCount: number;
  occupiedCount: number;
  vacantCount: number;
  description: string;
  href: string;
}

export interface SettingsSummary {
  apartmentName: string;
  totalBlocks: number;
  totalFlats: number;
  committeeCount: number;
  staffCount: number;
  maintenanceRate: number;
  billingCycleDay: number;
}

/** Documents module */
export type DocumentScope = "society" | "flat" | "asset";

export interface EnrichedDocument {
  id: string;
  title: string;
  category: string;
  categoryLabel: string;
  uploadedAt: string;
  fileLabel: string;
  scope: DocumentScope;
  flatId?: string;
  flatNumber?: string;
  assetId?: string;
  assetName?: string;
  href?: string;
}

export interface DocumentsSummary {
  total: number;
  societyCount: number;
  flatCount: number;
  assetCount: number;
  recent: EnrichedDocument[];
}
