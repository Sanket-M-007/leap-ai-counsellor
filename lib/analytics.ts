// Funnel event tracking. In production these go to an analytics tool
// (Mixpanel, Amplitude, PostHog). Here they are kept in memory and shown in the
// "Funnel events" panel so reviewers can see exactly what would be measured.

export type FunnelEvent =
  | "app_open"
  | "persona_selected"
  | "step_answered"
  | "snapshot_viewed"
  | "magic_reaction"
  | "whatsapp_saved"
  | "free_question_asked"
  | "paywall_viewed"
  | "plan_selected"
  | "ask_parent_opened"
  | "ask_parent_sent"
  | "checkout_started"
  | "payment_success"
  | "human_handoff";

export interface TrackedEvent {
  name: FunnelEvent;
  props?: Record<string, string | number | boolean | undefined>;
  t: number;
}

type Listener = (events: TrackedEvent[]) => void;
const events: TrackedEvent[] = [];
const listeners = new Set<Listener>();

export function track(name: FunnelEvent, props?: TrackedEvent["props"]) {
  const e = { name, props, t: Date.now() };
  events.push(e);
  if (typeof console !== "undefined") console.info("[funnel]", name, props ?? "");
  listeners.forEach((l) => l([...events]));
}

export function subscribe(l: Listener) {
  listeners.add(l);
  l([...events]);
  return () => {
    listeners.delete(l);
  };
}
