"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AssetCard, AssetStatusBadge } from "@/components/inspector/facility/asset-card";
import { AssetTimeline } from "@/components/inspector/facility/asset-timeline";
import { useFacilityActions } from "@/components/inspector/facility/facility-provider";
import {
  formatDate,
  getAssetCategoryLabel,
  getFacilityScopeLabel,
} from "@/lib/asset-data";
import { routes } from "@/config/routes";
import type { FacilityAssetProfile } from "@/types";
import { ServiceList } from "@/components/inspector/facility/service-list";

interface AssetProfileViewProps {
  profile: FacilityAssetProfile;
}

export function AssetProfileView({ profile }: AssetProfileViewProps) {
  const { openAction } = useFacilityActions();

  return (
    <div className="space-y-6">
      <AssetCard asset={profile} blockName={profile.blockName} />

      <div className="flex flex-wrap gap-2">
        <Button
          size="sm"
          onClick={() =>
            openAction("schedule-service", {
              assetId: profile.id,
              assetName: profile.name,
            })
          }
        >
          Schedule service
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() =>
            openAction("renew-amc", {
              assetId: profile.id,
              assetName: profile.name,
            })
          }
        >
          Renew AMC
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => openAction("upload-document", { assetId: profile.id })}
        >
          Upload document
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => openAction("add-note", { assetId: profile.id })}
        >
          Add note
        </Button>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="space-y-3">
          <h2 className="text-sm font-semibold">Asset details</h2>
          <dl className="surface-card grid gap-4 p-4 sm:grid-cols-2 sm:p-5">
            <Field label="Category" value={getAssetCategoryLabel(profile.assetType)} />
            <Field label="Location" value={profile.location ?? "—"} />
            <Field
              label="Scope"
              value={`${getFacilityScopeLabel(profile.scope)}${profile.blockName ? ` · ${profile.blockName}` : ""}${profile.flatNumber ? ` · Flat ${profile.flatNumber}` : ""}`}
            />
            <Field
              label="Installation"
              value={
                profile.installationDate
                  ? formatDate(profile.installationDate)
                  : "—"
              }
            />
            <Field label="Vendor" value={profile.vendor} />
            <Field label="Status" value={<AssetStatusBadge status={profile.status} />} />
            <Field
              label="Last service"
              value={
                profile.lastServiceDate
                  ? formatDate(profile.lastServiceDate)
                  : "—"
              }
            />
            <Field
              label="Next service"
              value={
                profile.nextServiceDate
                  ? formatDate(profile.nextServiceDate)
                  : "—"
              }
            />
            <Field
              label="Warranty"
              value={
                profile.warrantyExpiry
                  ? formatDate(profile.warrantyExpiry)
                  : "—"
              }
            />
          </dl>
        </section>

        <section className="space-y-3">
          <h2 className="text-sm font-semibold">AMC</h2>
          {profile.amc ? (
            <dl className="surface-card grid gap-4 p-4 sm:grid-cols-2 sm:p-5">
              <Field label="Vendor" value={profile.amc.vendorName} />
              <Field label="Valid until" value={formatDate(profile.amc.endDate)} />
              <Field label="Contact" value={profile.amc.contactPerson} />
              <Field label="Phone" value={profile.amc.phone} />
              <Field label="Email" value={profile.amc.email} />
              <Field
                label="Renewal reminder"
                value={`${profile.amc.renewalReminderDays} days before`}
              />
            </dl>
          ) : (
            <p className="text-sm text-muted-foreground">No AMC on record.</p>
          )}
        </section>
      </div>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold">Service history</h2>
        <ServiceList services={profile.services} />
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold">Documents</h2>
        {profile.documents.length === 0 ? (
          <p className="text-sm text-muted-foreground">No documents uploaded.</p>
        ) : (
          <ul className="surface-card divide-y">
            {profile.documents.map((doc) => (
              <li
                key={doc.id}
                className="flex items-center justify-between px-4 py-3"
              >
                <div>
                  <p className="font-medium">{doc.title}</p>
                  <p className="text-xs capitalize text-muted-foreground">
                    {doc.category.replace("_", " ")} · {formatDate(doc.uploadedAt)}
                  </p>
                </div>
                <Button size="sm" variant="outline" className="h-8 text-xs">
                  Download
                </Button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold">Timeline</h2>
        <div className="surface-card p-4 sm:p-5">
          <AssetTimeline events={profile.timeline} />
        </div>
      </section>

      {profile.internalNotes.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold">Internal notes</h2>
          <ul className="space-y-2">
            {profile.internalNotes.map((note) => (
              <li
                key={note.id}
                className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-3 text-sm"
              >
                {note.content}
                <p className="mt-2 text-xs text-muted-foreground">
                  {note.author} · {formatDate(note.createdAt.slice(0, 10))}
                </p>
              </li>
            ))}
          </ul>
        </section>
      )}

      {profile.vendorId && (
        <p className="text-sm text-muted-foreground">
          Vendor profile:{" "}
          <Link
            href={routes.dashboard.inspector.assets.vendors}
            className="font-medium text-primary hover:underline"
          >
            {profile.vendor}
          </Link>
        </p>
      )}
    </div>
  );
}

function Field({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 text-sm font-medium">{value}</dd>
    </div>
  );
}
