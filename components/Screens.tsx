"use client";

import { useState } from "react";
import type { Lang, Match, Persona, Snapshot } from "@/lib/types";
import { track } from "@/lib/analytics";
import { Back, Cap, Chat, Check, Close, Info, Lock, Medal, Phone, Rupee, Share, Spinner } from "./Icons";

export type PlanId = "season" | "monthly";
export const PLANS: Record<PlanId, { name: string; sub: string; price: number; display: string; renew: string }> = {
  season: {
    name: "Application season · 3 months",
    sub: "₹150/month · covers your full application",
    price: 449,
    display: "₹449",
    renew: "Renews at ₹449 every 3 months via UPI Autopay.",
  },
  monthly: {
    name: "Monthly",
    sub: "₹99 first month, then ₹199/month",
    price: 99,
    display: "₹99",
    renew: "Then ₹199/month via UPI Autopay.",
  },
};

/* ---------------- Welcome ---------------- */
export function Welcome({
  lang,
  setLang,
  onStart,
}: {
  lang: Lang;
  setLang: (l: Lang) => void;
  onStart: (p: Persona) => void;
}) {
  return (
    <div className="screen welcome">
      <div className="blob" aria-hidden="true" />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", position: "relative" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div className="logo marigold" style={{ width: 36, height: 36, fontSize: 18 }}>
            L
          </div>
          <span style={{ fontSize: 20, fontWeight: 800 }}>Leap</span>
        </div>
        <div className="lang-toggle" role="group" aria-label="Language for answers">
          <button aria-pressed={lang === "en"} onClick={() => setLang("en")}>
            English
          </button>
          <button aria-pressed={lang === "hi"} onClick={() => setLang("hi")}>
            हिन्दी
          </button>
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 28, position: "relative" }}>
        <h1>Your study abroad plan, in 2 minutes.</h1>
        <p>Answer 5 quick questions. Get an honest answer, not a sales pitch.</p>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12, position: "relative" }}>
        <div className="value-row">
          <Cap />
          <div>
            <strong>Universities that fit you</strong>
            <span>With honest admit chances</span>
          </div>
        </div>
        <div className="value-row">
          <Rupee />
          <div>
            <strong>Real total cost in ₹</strong>
            <span>Fees, living, and loan options</span>
          </div>
        </div>
        <div className="value-row">
          <Medal />
          <div>
            <strong>Scholarships you qualify for</strong>
            <span>Matched to your marks</span>
          </div>
        </div>
      </div>
      <div style={{ flex: 1 }} />
      <div style={{ display: "flex", flexDirection: "column", gap: 12, position: "relative" }}>
        <button className="btn btn-marigold" onClick={() => onStart("student")}>
          Start: I&apos;m a student
        </button>
        <button className="btn btn-ghost-dark" onClick={() => onStart("parent")}>
          I&apos;m a parent
        </button>
        <div style={{ textAlign: "center", fontSize: 13, color: "var(--lavender)" }}>
          No sign-up needed. Free counselling stays free.
        </div>
      </div>
    </div>
  );
}

/* ---------------- University row ---------------- */
export function UniRow({ m }: { m: Match }) {
  const pill = m.chance === "Medium" ? "pill-amber" : "pill-green";
  return (
    <div className="uni">
      <span className={`tier tier-${m.tier}`}>{m.tier.toUpperCase()}</span>
      <div className="meta">
        <strong>{m.name}</strong>
        <span>
          {m.city} · ~₹{m.totalLakh}L total
        </span>
      </div>
      <span className={`pill ${pill}`}>{m.chance}</span>
    </div>
  );
}

/* ---------------- Snapshot ---------------- */
export function SnapshotScreen({
  snap,
  saved,
  reacted,
  onReact,
  onSeeAll,
  onAsk,
  onSave,
}: {
  snap: Snapshot;
  saved: boolean;
  reacted: string | null;
  onReact: (v: "yes" | "no") => void;
  onSeeAll: () => void;
  onAsk: () => void;
  onSave: () => void;
}) {
  const more = Math.max(0, snap.all.length - snap.featured.length);
  return (
    <div className="screen" style={{ background: "#fff" }}>
      <div className="scroll">
        <div className="snap-head">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span className="eyebrow">Your snapshot is ready</span>
            <button
              className="icon-btn"
              aria-label="Share snapshot"
              style={{ marginRight: -10 }}
              onClick={onSave}
            >
              <Share />
            </button>
          </div>
          <h1>{snap.title}</h1>
          <div className="sub">{snap.subtitle}</div>
        </div>
        <div className="snap-card">
          {snap.featured.map((m) => (
            <UniRow key={m.id} m={m} />
          ))}
          {more > 0 && (
            <button className="locked-more" onClick={onSeeAll} aria-label={`Unlock ${more} more matches`}>
              <div className="ghost" aria-hidden="true">
                <div />
                <div />
              </div>
              <span className="label">
                <Lock /> {more} more matches for you
              </span>
            </button>
          )}
          <div className="demo-tag">Demo data: fictional universities, illustrative costs.</div>
        </div>
        <div className="stats">
          <div className="stat">
            <span>Likely scholarship</span>
            <strong>{snap.scholarship}</strong>
          </div>
          <div className="stat">
            <span>Typical first salary</span>
            <strong>{snap.salary}</strong>
          </div>
        </div>
        <div className="insight-card">
          <b>The honest truth:</b> {snap.insight}
        </div>
        <div className="react">
          {reacted ? (
            <span>{reacted === "yes" ? "Thanks! Glad it helps." : "Thanks, tell me what's off in the chat."}</span>
          ) : (
            <>
              <span>Does this feel right for you?</span>
              <div>
                <button className="chip" onClick={() => onReact("yes")}>
                  Spot on
                </button>
                <button className="chip" onClick={() => onReact("no")}>
                  Not quite
                </button>
              </div>
            </>
          )}
        </div>
      </div>
      <div className="dock">
        <button className="btn btn-primary" onClick={onSeeAll}>
          See all {snap.all.length} matches <Lock color="#fff" />
        </button>
        <div className="row">
          <button className="btn btn-outline" onClick={onAsk}>
            Ask a question
          </button>
          <button className="btn btn-outline" onClick={onSave}>
            {saved ? "Saved ✓" : "Save to WhatsApp"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Save sheet ---------------- */
export function SaveSheet({ persona, onClose, onSaved }: { persona: Persona; onClose: () => void; onSaved: () => void }) {
  const [phone, setPhone] = useState("");
  const [stage, setStage] = useState<"phone" | "otp" | "done">("phone");
  const [otp, setOtp] = useState("");
  const [also, setAlso] = useState(true);
  const [err, setErr] = useState("");
  const valid = /^[6-9]\d{9}$/.test(phone.replace(/\s/g, ""));

  return (
    <div className="overlay" onClick={onClose}>
      <div className="sheet" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-label="Save to WhatsApp">
        <div className="grabber" />
        {stage === "phone" && (
          <>
            <h2>Keep your plan safe</h2>
            <p>We&apos;ll send your snapshot to WhatsApp so you can open it anytime, or show it to family.</p>
            <label htmlFor="wa" style={{ fontSize: 14, fontWeight: 700 }}>
              WhatsApp number
            </label>
            <div style={{ display: "flex", gap: 8 }}>
              <div className="field" style={{ width: "auto", background: "var(--mist-2)" }}>
                +91
              </div>
              <input
                id="wa"
                className="field"
                inputMode="numeric"
                placeholder="10-digit mobile number"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value.replace(/[^\d\s]/g, "").slice(0, 11));
                  setErr("");
                }}
              />
            </div>
            {err && <div className="err">{err}</div>}
            {persona === "student" && (
              <label className="check-row">
                <input type="checkbox" checked={also} onChange={(e) => setAlso(e.target.checked)} />
                <span style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <span style={{ fontSize: 14, fontWeight: 700 }}>Also send to a parent</span>
                  <span style={{ fontSize: 13, color: "var(--ink-2)" }}>Families usually decide together.</span>
                </span>
              </label>
            )}
            <button
              className="btn btn-primary"
              onClick={() => {
                if (!valid) {
                  setErr("Enter a valid 10-digit Indian mobile number.");
                  return;
                }
                setStage("otp");
              }}
            >
              Send OTP
            </button>
            <div className="small">No spam calls. Only your report and deadline reminders.</div>
          </>
        )}
        {stage === "otp" && (
          <>
            <h2>Enter the OTP</h2>
            <p>Sent to +91 {phone}. (Demo: any 4 digits work.)</p>
            <label htmlFor="otp" className="sr-only">
              OTP
            </label>
            <input
              id="otp"
              className="field"
              inputMode="numeric"
              placeholder="4-digit code"
              value={otp}
              onChange={(e) => {
                setOtp(e.target.value.replace(/\D/g, "").slice(0, 4));
                setErr("");
              }}
              style={{ letterSpacing: 8, textAlign: "center", fontSize: 22 }}
            />
            {err && <div className="err">{err}</div>}
            <button
              className="btn btn-primary"
              onClick={() => {
                if (otp.length !== 4) {
                  setErr("Enter the 4-digit code.");
                  return;
                }
                track("whatsapp_saved", { alsoParent: also });
                setStage("done");
                onSaved();
              }}
            >
              Verify and send
            </button>
          </>
        )}
        {stage === "done" && (
          <>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <Check size={26} />
              <h2>Sent to WhatsApp</h2>
            </div>
            <p>Your snapshot is on WhatsApp{also && persona === "student" ? ". We'll ask for your parent's number next time." : "."}</p>
            <button className="btn btn-primary" onClick={onClose}>
              Back to my plan
            </button>
          </>
        )}
        {stage !== "done" && (
          <button className="link-btn" onClick={onClose}>
            Maybe later
          </button>
        )}
      </div>
    </div>
  );
}

/* ---------------- Paywall ---------------- */
export function Paywall({
  snap,
  persona,
  name,
  plan,
  setPlan,
  onClose,
  onContinue,
  onAskParent,
}: {
  snap: Snapshot | null;
  persona: Persona;
  name?: string;
  plan: PlanId;
  setPlan: (p: PlanId) => void;
  onClose: () => void;
  onContinue: () => void;
  onAskParent: () => void;
}) {
  const first = snap?.featured.find((m) => m.tier === "Target") ?? snap?.featured[0];
  const more = snap ? snap.all.length - 1 : 15;
  const who = persona === "parent" ? (name ? `${name}'s` : "your child's") : "your";
  return (
    <div className="screen">
      <div className="scroll">
        <div className="pw-head">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span className="pro-badge">LEAP PRO</span>
            <button className="icon-btn" aria-label="Close" onClick={onClose} style={{ marginRight: -10 }}>
              <Close color="#fff" />
            </button>
          </div>
          <h1>
            Unlock {who} full plan{persona === "student" && name ? `, ${name}` : ""}
          </h1>
          {first && (
            <div className="pw-peek">
              <div className="first">
                <span>{first.name}</span>
                <span style={{ color: "#7fe0ae", fontSize: 12 }}>{first.chance}</span>
              </div>
              <div className="ghost" aria-hidden="true" />
              <div className="ghost" aria-hidden="true" />
              <div style={{ fontSize: 13, color: "var(--lavender)" }}>+ {more} more matches waiting</div>
            </div>
          )}
        </div>
        <ul className="benefits">
          <li>
            <Check /> All {snap?.all.length ?? 18} matches with admit chances
          </li>
          <li>
            <Check /> Month-by-month plan + WhatsApp deadline alerts
          </li>
          <li>
            <Check /> Unlimited AI counsellor, 24/7
          </li>
          <li>
            <Check /> SOP review by AI + one human expert
          </li>
          <li>
            <Check /> Priority counsellor call within 24 hours
          </li>
        </ul>
        <div className="plans" role="radiogroup" aria-label="Choose a plan">
          {(Object.keys(PLANS) as PlanId[]).map((id) => (
            <label key={id} className={`plan ${plan === id ? "on" : ""}`}>
              {id === "season" && <span className="flag">MOST POPULAR</span>}
              <input
                type="radio"
                name="plan"
                checked={plan === id}
                onChange={() => {
                  setPlan(id);
                  track("plan_selected", { plan: id });
                }}
              />
              <span className="txt">
                <strong>{PLANS[id].name}</strong>
                <span>{PLANS[id].sub}</span>
              </span>
              <span className="price">{PLANS[id].display}</span>
            </label>
          ))}
        </div>
      </div>
      <div className="dock" style={{ borderTop: 0 }}>
        <button className="btn btn-primary" onClick={onContinue}>
          Continue with UPI · {PLANS[plan].display}
        </button>
        <div className="small" style={{ fontSize: 12 }}>
          Cancel anytime · Free counselling always stays free
        </div>
        {persona === "student" && (
          <button className="link-btn" onClick={onAskParent}>
            Ask a parent to unlock it
          </button>
        )}
      </div>
    </div>
  );
}

/* ---------------- Ask parent ---------------- */
export function AskParent({
  snap,
  name,
  plan,
  onBack,
  onPaid,
  onSelfPay,
}: {
  snap: Snapshot | null;
  name?: string;
  plan: PlanId;
  onBack: () => void;
  onPaid: () => void;
  onSelfPay: () => void;
}) {
  const [rel, setRel] = useState<"Papa" | "Mummy" | "">("Papa");
  const [sent, setSent] = useState(false);
  const country = snap?.title.split(" ").slice(-2, -1)[0] ?? "abroad";
  const range = snap && snap.featured.length
    ? `~₹${Math.min(...snap.featured.map((m) => m.totalLakh))}–${Math.max(...snap.featured.map((m) => m.totalLakh))}L total`
    : "";
  const greeting = rel ? `${rel}, ` : "";
  const msg = `${greeting}I checked my study abroad options on Leap. I have ${snap?.all.length ?? "several"} good ${country} university matches, ${range}. Can you unlock my full plan? It's ${PLANS[plan].display} on UPI.`;

  return (
    <div className="screen">
      <div className="co-top">
        <button className="icon-btn" aria-label="Back" onClick={onBack} style={{ marginLeft: -10 }}>
          <Back />
        </button>
        Ask a parent to unlock
      </div>
      <div className="scroll">
        <p style={{ margin: "16px 20px 0", fontSize: 15, lineHeight: 1.5, color: "var(--ink-2)" }}>
          We&apos;ll send your snapshot and a secure UPI link. They see your results first, then decide.
        </p>
        <div className="chips" style={{ padding: "14px 20px 0" }}>
          {(["Papa", "Mummy"] as const).map((r) => (
            <button key={r} className={`chip ${rel === r ? "sel" : ""}`} onClick={() => setRel(r)}>
              {r}
            </button>
          ))}
          <button className={`chip ${rel === "" ? "sel" : ""}`} onClick={() => setRel("")}>
            Someone else
          </button>
        </div>
        <div className="section-label" style={{ margin: "16px 20px 0" }}>
          Message preview
        </div>
        <div className="wa-preview">
          <div className="wa-bubble">
            <div>{msg}</div>
            <div className="wa-card">
              <div className="top">
                <b>{(snap?.title ?? "MY PLAN").toUpperCase()}</b>
                <span style={{ fontSize: 13, fontWeight: 700 }}>
                  {snap?.featured.length ?? 3} strong matches · {range}
                </span>
              </div>
              <div className="bottom">
                <span>Likely scholarship {snap?.scholarship ?? ""} · Free counselling included</span>
                <span style={{ fontSize: 13, fontWeight: 800, color: "var(--indigo)" }}>
                  Unlock for {PLANS[plan].display} via UPI
                </span>
              </div>
            </div>
          </div>
        </div>
        <div style={{ margin: "14px 20px", display: "flex", gap: 10, fontSize: 13, lineHeight: 1.45, color: "var(--ink-2)" }}>
          <Info />
          <span>When they pay, Pro unlocks on your phone instantly. The link expires in 48 hours.</span>
        </div>
      </div>
      <div className="dock" style={{ borderTop: 0 }}>
        {!sent ? (
          <button
            className="btn btn-whatsapp"
            onClick={() => {
              track("ask_parent_sent", { relation: rel || "other" });
              setSent(true);
              const url = `https://wa.me/?text=${encodeURIComponent(msg + " [demo link]")}`;
              window.open(url, "_blank", "noopener,noreferrer");
            }}
          >
            <Chat /> Send on WhatsApp
          </button>
        ) : (
          <>
            <div className="bubble good" style={{ maxWidth: "none" }}>
              Sent! We&apos;ll notify you the moment {rel || "they"} {rel ? "pays" : "pay"}.
            </div>
            <button className="btn btn-primary" onClick={onPaid}>
              Simulate: {rel || "parent"} paid (demo)
            </button>
          </>
        )}
        <button className="link-btn" onClick={onSelfPay}>
          I&apos;ll pay myself
        </button>
      </div>
    </div>
  );
}

/* ---------------- Checkout ---------------- */
const UPI_APPS = [
  { id: "gpay", label: "Google Pay", badge: "G" },
  { id: "phonepe", label: "PhonePe", badge: "P" },
  { id: "paytm", label: "Paytm", badge: "P" },
  { id: "upi", label: "Enter UPI ID", badge: "@" },
];

export function Checkout({
  plan,
  name,
  onBack,
  onPaid,
}: {
  plan: PlanId;
  name?: string;
  onBack: () => void;
  onPaid: () => void;
}) {
  const [method, setMethod] = useState("gpay");
  const [paying, setPaying] = useState(false);
  const p = PLANS[plan];
  return (
    <div className="screen co">
      <div className="co-top">
        <button className="icon-btn" aria-label="Back" onClick={onBack} style={{ marginLeft: -10 }}>
          <Back />
        </button>
        Checkout
      </div>
      <div className="scroll">
        <div className="card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <strong style={{ fontSize: 15 }}>Leap Pro · {plan === "season" ? "Application season" : "Monthly"}</strong>
              <span style={{ fontSize: 13, color: "var(--ink-2)" }}>
                {plan === "season" ? "3 months" : "1 month"}
                {name ? ` · for ${name}` : ""}
              </span>
            </div>
            <button className="link-btn" style={{ padding: 0, minHeight: 0 }} onClick={onBack}>
              Change
            </button>
          </div>
          <div style={{ height: 1, background: "var(--line)" }} />
          <div className="line">
            <span>Plan price</span>
            <span>{p.display}</span>
          </div>
          <div className="line" style={{ color: "var(--ink-2)" }}>
            <span>GST</span>
            <span>Included</span>
          </div>
          <div className="line total">
            <span>Pay today</span>
            <span>{p.display}</span>
          </div>
          <div className="note">{p.renew} Cancel in one tap, any time.</div>
        </div>
        <div className="section-label">Pay with UPI</div>
        <div className="pay-list" role="radiogroup" aria-label="Payment method">
          {UPI_APPS.map((a) => (
            <label key={a.id} className="pay-opt">
              <span className="badge">{a.badge}</span>
              <span className="name">{a.label}</span>
              <input type="radio" name="pay" checked={method === a.id} onChange={() => setMethod(a.id)} />
            </label>
          ))}
        </div>
        <div className="card" style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <strong style={{ fontSize: 15 }}>Cards, net banking</strong>
          <span style={{ fontSize: 13, color: "var(--ink-3)" }}>More options</span>
        </div>
        <div style={{ height: 16 }} />
      </div>
      <div className="dock">
        <button
          className="btn btn-primary"
          onClick={() => {
            setPaying(true);
            setTimeout(onPaid, 2200);
          }}
        >
          <Lock color="#fff" /> Pay {p.display} securely
        </button>
        <div className="small" style={{ fontSize: 12 }}>
          Demo checkout: no real payment is taken · 7-day refund policy
        </div>
      </div>
      {paying && (
        <div className="paying" role="status">
          <Spinner size={40} color="#3730c8" />
          <strong style={{ fontSize: 18 }}>Approve {p.display} in your UPI app</strong>
          <span style={{ fontSize: 14, color: "var(--ink-2)" }}>
            We sent a request to {UPI_APPS.find((a) => a.id === method)?.label}. Keep this screen open.
          </span>
        </div>
      )}
    </div>
  );
}

/* ---------------- Success ---------------- */
export function Success({
  snap,
  name,
  plan,
  onStart,
}: {
  snap: Snapshot | null;
  name?: string;
  plan: PlanId;
  onStart: () => void;
}) {
  const [showAll, setShowAll] = useState(false);
  const ieltsLever = snap?.insight.includes("IELTS");
  return (
    <div className="screen">
      <div className="scroll">
        <div className="ok-head">
          <div className="ok-icon">
            <Check size={36} color="#0b4a2e" strokeWidth={2.8} />
          </div>
          <div style={{ fontSize: 26, fontWeight: 800, letterSpacing: -0.5 }}>You&apos;re in{name ? `, ${name}` : ""}!</div>
          <div style={{ fontSize: 15, color: "var(--lavender-2)", lineHeight: 1.45 }}>
            Leap Pro is active. Your full plan and all {snap?.all.length ?? 18} matches are unlocked.
          </div>
          <div style={{ fontSize: 12, color: "var(--lavender)" }}>{PLANS[plan].display} paid · Receipt sent to WhatsApp</div>
        </div>
        <div className="messages">
          <div className="bubble bot">
            {ieltsLever
              ? "Let's start with your biggest lever: IELTS. Getting to a 7 band opens more universities for you."
              : "Let's turn your snapshot into a plan. Here's what to do first."}
          </div>
        </div>
        <div className="steps">
          <div style={{ fontSize: 12, fontWeight: 800, color: "var(--indigo)", letterSpacing: 0.8 }}>YOUR NEXT 3 STEPS</div>
          <div className="step">
            <span className="n on">1</span>
            <span>
              <b>{ieltsLever ? "6-week IELTS plan" : "Shortlist your final 6"}</b> · start this week
            </span>
          </div>
          <div className="step">
            <span className="n">2</span>
            <span>
              <b>{ieltsLever ? "Pick your final 6" : "Scholarship applications"}</b> from {snap?.all.length ?? 18} matches
            </span>
          </div>
          <div className="step">
            <span className="n">3</span>
            <span>
              <b>SOP first draft</b> · expert review included
            </span>
          </div>
        </div>
        <div className="insight-card" style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <Phone />
          <span>Your counsellor will call within 24 hours. Pick a time that suits you.</span>
        </div>
        <div style={{ padding: "12px 16px 0" }}>
          <button className="link-btn" style={{ padding: 0 }} onClick={() => setShowAll((s) => !s)}>
            {showAll ? "Hide" : "See"} all {snap?.all.length ?? 18} matches
          </button>
        </div>
        {showAll && snap && (
          <div className="messages" style={{ paddingTop: 8 }}>
            {snap.all.map((m) => (
              <UniRow key={m.id} m={m} />
            ))}
          </div>
        )}
        <div style={{ height: 16 }} />
      </div>
      <div className="dock">
        <button className="btn btn-primary" onClick={onStart}>
          {ieltsLever ? "Start my IELTS plan" : "Continue in chat"}
        </button>
      </div>
    </div>
  );
}
