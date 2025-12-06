"use client";

import { useEffect, useState } from "react";
import { Sun, Snowflake } from "lucide-react";
import Snowfall from "./Snowfall";

export default function SnowfallToggle() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem("snowfall-enabled");
    if (stored !== null) setEnabled(stored === "true");
  }, []);

  useEffect(() => {
    window.localStorage.setItem("snowfall-enabled", String(enabled));
  }, [enabled]);

  return (
    <>
      {enabled && <Snowfall />}
      <button
        type="button"
        onClick={() => setEnabled((prev) => !prev)}
        className="fixed bottom-4 right-4 z-40 inline-flex items-center gap-2 rounded-full bg-card/90 px-4 py-2 text-sm font-medium text-foreground shadow-lg border border-border backdrop-blur transition hover:shadow-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        aria-pressed={enabled}
        aria-label={enabled ? "Turn off snowfall" : "Turn on snowfall"}
      >
        {enabled ? <Snowflake className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
      </button>
    </>
  );
}
