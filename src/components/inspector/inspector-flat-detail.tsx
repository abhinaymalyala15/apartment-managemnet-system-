import { Badge } from "@/components/ui/badge";
import {
  getFlatDetail,
  getPendingPaymentsByFlat,
  formatCurrency,
  formatDate,
  getOccupancyVariant,
  getResidentTypeLabel,
  getPaymentStatusVariant,
  getPaymentStatusLabel,
} from "@/lib/data";
import {
  Users,
  Wallet,
  UserCircle,
  AlertCircle,
  CheckCircle2,
  Phone,
  Mail,
} from "lucide-react";

interface InspectorFlatDetailProps {
  flatId: string;
}

export function InspectorFlatDetail({ flatId }: InspectorFlatDetailProps) {
  const detail = getFlatDetail(flatId);
  if (!detail) return null;

  const { flat, block, owners, tenants, family } = detail;
  const pendingBills = getPendingPaymentsByFlat(flatId);
  const primaryOwner = owners.find((o) => o.isPrimary) ?? owners[0];
  const activeTenant = tenants[0];
  const residentType = getResidentTypeLabel(flat.occupancyStatus);
  const pendingTotal = pendingBills.reduce((sum, b) => sum + b.amount, 0);

  return (
    <div className="space-y-6">
      <div className="rounded-xl border bg-card p-4 shadow-sm">
        <p className="text-sm text-muted-foreground">{block.name}</p>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <Badge variant={getOccupancyVariant(flat.occupancyStatus)}>
            {residentType === "Vacant"
              ? "Vacant — no resident"
              : `${residentType} occupied`}
          </Badge>
          <span className="text-sm text-muted-foreground">
            {flat.flatType} · {flat.areaSqft} sq.ft
          </span>
        </div>
      </div>

      {flat.occupancyStatus !== "vacant" && (
        <section className="space-y-3">
          <h2 className="flex items-center gap-2 text-sm font-semibold">
            <UserCircle className="h-4 w-4 text-primary" />
            Who lives here
          </h2>
          <div className="space-y-3">
            {primaryOwner && (
              <div className="rounded-xl border bg-card p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <p className="font-medium">{primaryOwner.fullName}</p>
                  <Badge variant="outline">Owner</Badge>
                </div>
                <div className="mt-3 space-y-1.5 text-sm text-muted-foreground">
                  <p className="flex items-center gap-2">
                    <Phone className="h-3.5 w-3.5" />
                    {primaryOwner.phone}
                  </p>
                  <p className="flex items-center gap-2">
                    <Mail className="h-3.5 w-3.5" />
                    {primaryOwner.email}
                  </p>
                </div>
              </div>
            )}
            {activeTenant && (
              <div className="rounded-xl border bg-card p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <p className="font-medium">{activeTenant.fullName}</p>
                  <Badge variant="secondary">Tenant</Badge>
                </div>
                <div className="mt-3 space-y-1.5 text-sm text-muted-foreground">
                  <p className="flex items-center gap-2">
                    <Phone className="h-3.5 w-3.5" />
                    {activeTenant.phone}
                  </p>
                  <p className="flex items-center gap-2">
                    <Mail className="h-3.5 w-3.5" />
                    {activeTenant.email}
                  </p>
                  <p className="text-xs">
                    Lease until {formatDate(activeTenant.leaseEndDate)}
                  </p>
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      <section className="space-y-3">
        <h2 className="flex items-center gap-2 text-sm font-semibold">
          <Users className="h-4 w-4 text-primary" />
          Family members
          {family.length > 0 && (
            <span className="font-normal text-muted-foreground">
              ({family.length})
            </span>
          )}
        </h2>
        {family.length === 0 ? (
          <div className="rounded-xl border border-dashed bg-muted/30 px-4 py-8 text-center text-sm text-muted-foreground">
            {flat.occupancyStatus === "vacant"
              ? "Vacant flat — no family registered"
              : "No family members on record"}
          </div>
        ) : (
          <div className="space-y-3">
            {family.map((member) => (
              <div
                key={member.id}
                className="rounded-xl border bg-card p-4 shadow-sm"
              >
                <p className="font-medium">{member.fullName}</p>
                <p className="text-sm text-muted-foreground">
                  {member.relationship}
                </p>
                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                  {member.phone && <span>{member.phone}</span>}
                  {member.email && <span>{member.email}</span>}
                  {member.dateOfBirth && (
                    <span>DOB: {formatDate(member.dateOfBirth)}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="flex items-center gap-2 text-sm font-semibold">
          <Wallet className="h-4 w-4 text-primary" />
          Pending bills
          {pendingBills.length > 0 && (
            <span className="font-normal text-destructive">
              ({formatCurrency(pendingTotal)} total)
            </span>
          )}
        </h2>
        {pendingBills.length === 0 ? (
          <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
            <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
            <p className="text-sm font-medium text-emerald-800">
              No pending or overdue bills
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {pendingBills.map((bill) => (
              <div
                key={bill.id}
                className="overflow-hidden rounded-xl border bg-card shadow-sm"
              >
                <div className="flex">
                  <div
                    className={`w-1 shrink-0 ${
                      bill.status === "overdue" ? "bg-red-500" : "bg-amber-500"
                    }`}
                  />
                  <div className="flex flex-1 items-center justify-between gap-4 p-4">
                    <div className="flex items-start gap-3">
                      <div
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                          bill.status === "overdue"
                            ? "bg-red-100 text-red-600"
                            : "bg-amber-100 text-amber-600"
                        }`}
                      >
                        <AlertCircle className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="font-medium">{bill.period}</p>
                        <p className="text-sm text-muted-foreground">
                          Due {formatDate(bill.dueDate)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold">
                        {formatCurrency(bill.amount)}
                      </p>
                      <Badge
                        variant={getPaymentStatusVariant(bill.status)}
                        className="mt-1 text-xs"
                      >
                        {getPaymentStatusLabel(bill.status)}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
