"use client";

import { useEffect, useState } from "react";

export function LiveClock() {
  const [time, setTime] = useState<string | null>(null);

  useEffect(() => {
    function tick() {
      setTime(
        new Intl.DateTimeFormat("en-IN", {
          hour: "numeric",
          minute: "2-digit",
          second: "2-digit",
          hour12: true,
        }).format(new Date())
      );
    }
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <time className="tabular-nums" suppressHydrationWarning>
      {time ?? "—:—"}
    </time>
  );
}
