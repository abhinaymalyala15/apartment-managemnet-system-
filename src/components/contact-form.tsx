"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function ContactForm() {
  return (
    <form className="mt-8 space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Full name</label>
          <Input
            className="h-11 rounded-xl border-slate-200 bg-slate-50/50 focus-visible:bg-white"
            placeholder="Your name"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Flat number</label>
          <Input
            className="h-11 rounded-xl border-slate-200 bg-slate-50/50 focus-visible:bg-white"
            placeholder="e.g. 110"
          />
        </div>
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700">Email</label>
        <Input
          className="h-11 rounded-xl border-slate-200 bg-slate-50/50 focus-visible:bg-white"
          type="email"
          placeholder="you@email.com"
        />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700">Subject</label>
        <Input
          className="h-11 rounded-xl border-slate-200 bg-slate-50/50 focus-visible:bg-white"
          placeholder="How can we help?"
        />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700">Message</label>
        <textarea
          className="flex min-h-[140px] w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-3 text-sm shadow-xs outline-none transition-colors focus-visible:border-primary focus-visible:bg-white focus-visible:ring-[3px] focus-visible:ring-primary/15"
          placeholder="Your message…"
        />
      </div>
      <Button
        type="button"
        className="h-11 rounded-full px-6 font-semibold shadow-[0_8px_24px_rgba(37,99,235,0.18)]"
      >
        Send message
      </Button>
    </form>
  );
}
