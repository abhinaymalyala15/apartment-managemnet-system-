"use client";

import { Megaphone, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { useAdminActions } from "@/components/inspector/admin-action-provider";
import { formatCurrency } from "@/lib/data";
import type { OutstandingQueueItem } from "@/types";
import { cn } from "@/lib/utils";

interface OutstandingQueueProps {
  items: OutstandingQueueItem[];
}

export function OutstandingQueue({ items }: OutstandingQueueProps) {
  const { openAction } = useAdminActions();

  if (items.length === 0) {
    return (
      <EmptyState
        icon={Phone}
        title="No flats found"
        description="Try a different search or block filter."
      />
    );
  }

  return (
    <div className="space-y-3">
      <div className="hidden overflow-x-auto rounded-xl border bg-card lg:block">
        <table className="w-full min-w-[800px] text-sm">
          <thead>
            <tr className="border-b bg-muted/40 text-left text-xs text-muted-foreground">
              <th className="px-4 py-3 font-medium">Flat & resident</th>
              <th className="px-4 py-3 font-medium">Due amount</th>
              <th className="px-4 py-3 font-medium">Days overdue</th>
              <th className="px-4 py-3 font-medium">Quick actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {items.map((item) => (
              <OutstandingRow
                key={item.id}
                item={item}
                onSendNotice={() => openAction("publish-notice")}
              />
            ))}
          </tbody>
        </table>
      </div>

      <div className="space-y-3 lg:hidden">
        {items.map((item) => (
          <OutstandingCard
            key={item.id}
            item={item}
            onSendNotice={() => openAction("publish-notice")}
          />
        ))}
      </div>
    </div>
  );
}

function isFlatPaid(item: OutstandingQueueItem) {
  return item.outstanding <= 0;
}

function OutstandingRow({
  item,
  onSendNotice,
}: {
  item: OutstandingQueueItem;
  onSendNotice: () => void;
}) {
  const paid = isFlatPaid(item);

  return (
    <tr className="hover:bg-muted/30">
      <td className="px-4 py-4">
        <div className="space-y-1">
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
            <p className="font-semibold">Flat {item.flatNumber}</p>
            <p className="text-xs text-muted-foreground">
              {item.blockName} · Floor {item.floor}
            </p>
          </div>
          <p className="font-medium">{item.residentName}</p>
          {item.residentPhone && (
            <a
              href={`tel:${item.residentPhone.replace(/\s/g, "")}`}
              className="text-xs text-primary hover:underline"
            >
              {item.residentPhone}
            </a>
          )}
        </div>
      </td>
      <td className="px-4 py-4 align-top">
        <p
          className={cn(
            "font-semibold tabular-nums",
            paid ? "text-success" : "text-destructive"
          )}
        >
          {paid ? "Paid" : formatCurrency(item.outstanding)}
        </p>
      </td>
      <td className="px-4 py-4 align-top">
        <p
          className={cn(
            "font-medium",
            paid
              ? "text-success"
              : item.daysOverdue > 30
                ? "font-semibold text-destructive"
                : "text-foreground"
          )}
        >
          {paid ? "Up to date" : `${item.daysOverdue}d`}
        </p>
      </td>
      <td className="px-4 py-4 align-top">
        <QueueActions
          phone={item.residentPhone}
          onSendNotice={onSendNotice}
        />
      </td>
    </tr>
  );
}

function OutstandingCard({
  item,
  onSendNotice,
}: {
  item: OutstandingQueueItem;
  onSendNotice: () => void;
}) {
  const paid = isFlatPaid(item);

  return (
    <article className="rounded-xl border bg-card p-4 shadow-sm">
      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
        <p className="text-lg font-semibold">Flat {item.flatNumber}</p>
        <p className="text-sm text-muted-foreground">
          {item.blockName} · Floor {item.floor}
        </p>
      </div>
      <p className="mt-1 font-medium">{item.residentName}</p>
      {item.residentPhone && (
        <a
          href={`tel:${item.residentPhone.replace(/\s/g, "")}`}
          className="text-sm text-primary hover:underline"
        >
          {item.residentPhone}
        </a>
      )}

      <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <div>
          <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Due amount
          </dt>
          <dd
            className={cn(
              "mt-0.5 font-semibold tabular-nums",
              paid ? "text-success" : "text-destructive"
            )}
          >
            {paid ? "Paid" : formatCurrency(item.outstanding)}
          </dd>
        </div>
        <div>
          <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Days overdue
          </dt>
          <dd
            className={cn(
              "mt-0.5 font-medium",
              paid ? "text-success" : item.daysOverdue > 30 && "text-destructive"
            )}
          >
            {paid ? "Up to date" : `${item.daysOverdue}d`}
          </dd>
        </div>
      </dl>

      <div className="mt-4">
        <QueueActions phone={item.residentPhone} onSendNotice={onSendNotice} />
      </div>
    </article>
  );
}

function QueueActions({
  phone,
  onSendNotice,
}: {
  phone: string;
  onSendNotice: () => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {phone ? (
        <a
          href={`tel:${phone.replace(/\s/g, "")}`}
          className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-border bg-background px-3 text-xs font-medium hover:bg-muted"
        >
          <Phone className="h-3.5 w-3.5" />
          Call
        </a>
      ) : (
        <Button variant="outline" size="sm" className="h-8 text-xs" disabled>
          <Phone className="h-3.5 w-3.5" />
          Call
        </Button>
      )}
      <Button
        variant="outline"
        size="sm"
        className="h-8 gap-1.5 text-xs"
        onClick={onSendNotice}
      >
        <Megaphone className="h-3.5 w-3.5" />
        Send notice
      </Button>
    </div>
  );
}
