"use client";

import { Bell, MessageSquarePlus, Search, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAdminActions } from "@/components/inspector/admin-action-provider";

export function AdminTodayQuickActions() {
  const { openAction, openSearch } = useAdminActions();

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
      <Button
        type="button"
        variant="outline"
        className="h-10 justify-center gap-1.5"
        onClick={() => openAction("record-payment")}
      >
        <Wallet className="h-4 w-4" />
        Record payment
      </Button>
      <Button
        type="button"
        variant="outline"
        className="h-10 justify-center gap-1.5"
        onClick={() => openSearch()}
      >
        <Search className="h-4 w-4" />
        Search
      </Button>
      <Button
        type="button"
        variant="outline"
        className="h-10 justify-center gap-1.5"
        onClick={() => openAction("publish-notice")}
      >
        <Bell className="h-4 w-4" />
        New notice
      </Button>
      <Button
        type="button"
        variant="outline"
        className="h-10 justify-center gap-1.5"
        onClick={() => openAction("log-complaint")}
      >
        <MessageSquarePlus className="h-4 w-4" />
        Log complaint
      </Button>
    </div>
  );
}
