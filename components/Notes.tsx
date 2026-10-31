"use client";

import { useEffect, useState } from "react";
import { subscribe, type TrackedEvent } from "@/lib/analytics";

// Developer-only funnel event log, shown with ?debug=1. In production these
// events go to an analytics tool instead.
export function DebugEvents({ mode }: { mode: "ai" | "demo" | "unknown" }) {
  const [events, setEvents] = useState<TrackedEvent[]>([]);
  useEffect(() => subscribe(setEvents), []);
  return (
    <aside className="notes" aria-label="Debug: funnel events">
      <div className="notes-card">
        <h2>Funnel events (debug)</h2>
        <p style={{ fontSize: 13 }}>AI answers: {mode === "ai" ? "live model" : mode === "demo" ? "scripted (no API key)" : "not used yet"}</p>
        <div className="events">
          {events.length === 0 && <div>Waiting for first event…</div>}
          {[...events].reverse().map((e, i) => (
            <div key={events.length - i}>
              <span>{e.name}</span>
              <span style={{ color: "var(--ink-3)" }}>
                {e.props
                  ? Object.values(e.props)
                      .filter((v) => v !== undefined)
                      .join(" · ")
                      .slice(0, 28)
                  : ""}
              </span>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
