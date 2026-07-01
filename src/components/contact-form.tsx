"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function ContactForm() {
  return (
    <form className="mt-6 space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="text-sm font-medium">Full Name</label>
          <Input className="mt-1.5" placeholder="Your name" />
        </div>
        <div>
          <label className="text-sm font-medium">Flat Number</label>
          <Input className="mt-1.5" placeholder="e.g. 110" />
        </div>
      </div>
      <div>
        <label className="text-sm font-medium">Email</label>
        <Input className="mt-1.5" type="email" placeholder="you@email.com" />
      </div>
      <div>
        <label className="text-sm font-medium">Subject</label>
        <Input className="mt-1.5" placeholder="How can we help?" />
      </div>
      <div>
        <label className="text-sm font-medium">Message</label>
        <textarea
          className="mt-1.5 flex min-h-[120px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
          placeholder="Your message..."
        />
      </div>
      <Button type="button">Send Message</Button>
    </form>
  );
}
