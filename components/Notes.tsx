"use client";

import { useEffect, useState } from "react";
import { subscribe, type TrackedEvent } from "@/lib/analytics";

export interface NoteContent {
  stage: string;
  title: string;
  why: string;
  metric: string;
}

export const NOTES: Record<string, NoteContent> = {
  welcome: {
    stage: "Top of funnel",
    title: "First open: zero friction",
    why: "No sign-up and no form. Two clear doors (student / parent) because parents often pay and need a different conversation. Language choice up front signals 'this is for you'.",
    metric: "Install → chat start rate. Target: 85%+ of opens start the chat.",
  },
  chat: {
    stage: "Reaching the paywall",
    title: "Scripted profiling: give to get",
    why: "Profile questions are chips, not AI, so they are instant, free and error-proof. Every answer gets an instant micro-insight computed from data, so it never feels like a form. The progress bar promises an end.",
    metric: "Step-by-step drop-off. Target: 70%+ of chat starts reach the snapshot.",
  },
  building: {
    stage: "Magic moment",
    title: "Anticipation, not a spinner",
    why: "The few seconds needed to build the snapshot become a visible checklist of work being done for the user.",
    metric: "Time from first message to snapshot. Target: under 2 minutes.",
  },
  snapshot: {
    stage: "Magic Quotient",
    title: "The \"this gets me\" moment",
    why: "3 universities across ambitious / target / safe, real total cost in ₹, likely scholarship, salary, and one honest, specific insight. The remaining matches are visible but locked: the user's own results, not a generic feature list.",
    metric: "Magic Quotient: % who tap \"Spot on\", save to WhatsApp, or ask a follow-up. Target: 40%+.",
  },
  free: {
    stage: "Free value",
    title: "Free questions, grounded answers",
    why: "Free-form questions go to the AI with retrieval over a verified knowledge base, with a source line. Personal, deep requests (exact chances, SOP review, full list) are answered partially, then gated. Counter shows what's left.",
    metric: "Questions per user, % reaching the paywall from chat, % of answers with a source.",
  },
  paywall: {
    stage: "Completing payment",
    title: "Paywall at peak intent",
    why: "Appears only when the user reaches for depth. Shows their own blurred matches. 3-month plan defaulted (fits the application window); ₹99 entry as the low-risk option. Free counselling is explicitly kept free, so it never feels like a trap.",
    metric: "Paywall view → checkout start. Target: 15–25%.",
  },
  askParent: {
    stage: "Completing payment",
    title: "Ask a parent to pay",
    why: "Many students can't pay themselves. A WhatsApp message with the child's own results and a UPI link turns a lost conversion into a likely one.",
    metric: "% of paywall views using parent-pay, and its payment rate.",
  },
  checkout: {
    stage: "Completing payment",
    title: "UPI-first checkout",
    why: "One screen, UPI apps first, Autopay explained in plain words, price and renewal stated clearly, refund policy visible.",
    metric: "Checkout start → payment success. Target: 70%+.",
  },
  success: {
    stage: "After payment",
    title: "Value in the first minute",
    why: "Immediately unlocks the full list and starts on the user's biggest lever, which reduces regret and refunds, and drives month-2 retention.",
    metric: "Refund rate, day-7 activity, renewal rate.",
  },
};

export function Notes({ noteKey, mode, adParam }: { noteKey: string; mode: "ai" | "demo" | "unknown"; adParam: string | null }) {
  const [events, setEvents] = useState<TrackedEvent[]>([]);
  useEffect(() => subscribe(setEvents), []);
  const n = NOTES[noteKey] ?? NOTES.welcome;
  const hot = new Set(["snapshot_viewed", "paywall_viewed", "checkout_started", "payment_success"]);
  return (
    <aside className="notes" aria-label="Product notes for reviewers">
      <div className="notes-card">
        <h2>PM notes · {n.stage}</h2>
        <h3>{n.title}</h3>
        <p>{n.why}</p>
        <div className="metric">
          <b>How we measure it:</b> {n.metric}
        </div>
      </div>
      <div className="notes-card">
        <h2>Funnel events (live)</h2>
        <p style={{ fontSize: 13 }}>Each event below would be sent to analytics in production.</p>
        <div className="events">
          {events.length === 0 && <div>Waiting for first event…</div>}
          {[...events].reverse().map((e, i) => (
            <div key={events.length - i} className={hot.has(e.name) ? "hot" : ""}>
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
      <div className="notes-card">
        <h2>Prototype info</h2>
        <p style={{ fontSize: 13 }}>
          AI answers: <b>{mode === "ai" ? "live model" : mode === "demo" ? "demo mode (scripted, no API key)" : "not used yet"}</b>
          <br />
          Ad entry: <b>{adParam ?? "none"}</b> · try <a href="?ad=cgpa_uk">?ad=cgpa_uk</a> or{" "}
          <a href="?ad=parent_cost">?ad=parent_cost</a>
          <br />
          Universities are fictional and costs illustrative. No real payment is taken.
        </p>
      </div>
    </aside>
  );
}
