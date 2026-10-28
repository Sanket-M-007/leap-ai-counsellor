"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import type { Budget, ChatMsg, Country, Course, Ielts, Lang, Persona, Profile, Snapshot } from "@/lib/types";
import { BUDGET_LABEL, BUDGET_MAX, COUNTRIES, buildSnapshot, normaliseScore } from "@/lib/engine";
import { track } from "@/lib/analytics";
import { Back, Check, Lock, Send, Spinner } from "./Icons";
import { AskParent, Checkout, Paywall, PLANS, SaveSheet, SnapshotScreen, Success, Welcome, type PlanId } from "./Screens";
import { Notes } from "./Notes";

type Screen = "welcome" | "chat" | "snapshot" | "paywall" | "askParent" | "checkout" | "success";
type Step = "stage" | "course" | "country" | "score" | "ielts" | "budget" | "name" | "building" | "free";

const STEP_INFO: Record<Step, { pct: number; label: string }> = {
  stage: { pct: 10, label: "Step 1 of 4" },
  course: { pct: 25, label: "Step 1 of 4" },
  country: { pct: 40, label: "Step 2 of 4" },
  score: { pct: 55, label: "Step 3 of 4" },
  ielts: { pct: 70, label: "Step 3 of 4" },
  budget: { pct: 85, label: "Step 4 of 4" },
  name: { pct: 95, label: "Almost done" },
  building: { pct: 100, label: "Building" },
  free: { pct: 100, label: "" },
};

const COURSES: Course[] = ["Data Science / AI", "Computer Science", "MBA / Business", "Engineering", "Other"];
const COUNTRY_LIST: Country[] = ["UK", "USA", "Canada", "Germany", "Ireland", "Australia"];
const BUDGETS: Budget[] = ["u20", "20_30", "30_45", "45p", "loan"];
const FREE_QUESTIONS = 5;
const SUGGESTIONS = ["Can I work part time there?", "What are my exact chances?", "Is it safe for Indian students?", "How do education loans work?", "When should I take IELTS?"];

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
let idSeq = 0;
const nid = () => `m${++idSeq}`;

export default function App() {
  const params = useSearchParams();
  const ad = params.get("ad");

  const [screen, setScreen] = useState<Screen>("welcome");
  const [lang, setLang] = useState<Lang>("en");
  const [profile, setProfile] = useState<Profile>({ persona: "student", lang: "en" });
  const profileRef = useRef(profile);
  const [msgs, setMsgs] = useState<ChatMsg[]>([]);
  const [typing, setTyping] = useState(false);
  const [step, setStep] = useState<Step | null>(null);
  const [progressStep, setProgressStep] = useState<Step>("stage");
  const [snap, setSnap] = useState<Snapshot | null>(null);
  const [freeLeft, setFreeLeft] = useState(FREE_QUESTIONS);
  const [paid, setPaid] = useState(false);
  const [plan, setPlan] = useState<PlanId>("season");
  const [showSave, setShowSave] = useState(false);
  const [saved, setSaved] = useState(false);
  const [reacted, setReacted] = useState<string | null>(null);
  const [returnTo, setReturnTo] = useState<Screen>("snapshot");
  const [aiMode, setAiMode] = useState<"ai" | "demo" | "unknown">("unknown");
  const [buildStage, setBuildStage] = useState(0);
  const [handoffBooked, setHandoffBooked] = useState(false);

  // Inline form state
  const [scoreInput, setScoreInput] = useState("");
  const [year, setYear] = useState("");
  const [formErr, setFormErr] = useState("");
  const [nameInput, setNameInput] = useState("");
  const [question, setQuestion] = useState("");

  const scrollRef = useRef<HTMLDivElement>(null);
  const opened = useRef(false);

  useEffect(() => {
    if (opened.current) return;
    opened.current = true;
    track("app_open", { source: ad ?? "organic" });
  }, [ad]);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [msgs, typing, step, buildStage]);

  const updateProfile = (patch: Partial<Profile>) => {
    profileRef.current = { ...profileRef.current, ...patch };
    setProfile(profileRef.current);
  };

  const push = (m: Omit<ChatMsg, "id">) => setMsgs((prev) => [...prev, { id: nid(), ...m }]);
  const me = (text: string) => push({ from: "me", text });

  // Bot speaks a sequence of messages with a typing indicator, then shows the next input.
  const bot = useCallback(async (lines: Omit<ChatMsg, "id" | "from">[], next: Step | null) => {
    setStep(null);
    for (const l of lines) {
      setTyping(true);
      await sleep(Math.min(1100, 450 + (l.text?.length ?? 40) * 7));
      setTyping(false);
      setMsgs((prev) => [...prev, { id: nid(), from: "bot", ...l }]);
      await sleep(120);
    }
    if (next) {
      setStep(next);
      if (next !== "free") setProgressStep(next);
    }
  }, []);

  const isParent = profile.persona === "parent";
  const child = (s: string, p: string) => (isParent ? p : s);

  /* ---------------- Scripted conversation ---------------- */
  const start = (persona: Persona) => {
    updateProfile({ persona, lang });
    track("persona_selected", { persona, lang });
    setScreen("chat");
    setMsgs([]);
    const greet: Omit<ChatMsg, "id" | "from">[] = [];
    if (persona === "parent") {
      greet.push({
        text:
          ad === "parent_cost"
            ? "Namaste! You wanted to know the real cost of studying abroad. I'll show you exact numbers for your child, plus safety and job outcomes."
            : "Namaste! Planning your child's studies abroad is a big decision. I'll help you with cost, safety and jobs, step by step.",
      });
      if (lang === "hi") greet.push({ text: "आप अपने सवाल हिन्दी में भी पूछ सकते हैं।" });
      greet.push({ text: "Where is your child right now?" });
    } else {
      if (ad === "cgpa_uk") {
        greet.push({ text: "Hi! You asked if a 7.4 CGPA can get you into a good UK university." });
        greet.push({ text: "Short answer: very likely. Let's find out exactly where, in about 2 minutes." });
      } else {
        greet.push({
          text: "Hi! I'm Leap Guide. In about 2 minutes I'll build your personal plan: universities that fit you, real costs in ₹ and scholarships.",
        });
      }
      if (lang === "hi") greet.push({ text: "आप अपने सवाल हिन्दी में भी पूछ सकते हैं।" });
      greet.push({ text: "First, where are you right now?" });
    }
    void bot(greet, "stage");
  };

  const answerStage = (label: string) => {
    me(label);
    updateProfile({ stage: label });
    track("step_answered", { step: "stage", value: label });
    const ack =
      label.includes("exploring") || label.includes("Still")
        ? "Perfect, no pressure. I'll keep it simple."
        : label.includes("Ready")
          ? "Great, let's move fast then."
          : "Got it. I'll compare your options honestly.";
    void bot([{ text: ack }, { text: child("What do you want to study?", "What does your child want to study?") }], "course");
  };

  const answerCourse = (c: Course) => {
    me(c);
    updateProfile({ course: c });
    track("step_answered", { step: "course", value: c });
    const line =
      c === "Other"
        ? "No problem, I'll keep the plan general for now."
        : `Great choice. ${c} is one of the most popular Masters for Indian students.`;
    void bot([{ text: line }, { text: child("Which country are you leaning towards?", "Which country are you considering?") }], "country");
  };

  const answerCountry = (c: Country | "Not sure") => {
    me(c);
    const country: Country = c === "Not sure" ? "UK" : c;
    updateProfile({ country });
    track("step_answered", { step: "country", value: c });
    const lines: Omit<ChatMsg, "id" | "from">[] = [];
    if (c === "Not sure")
      lines.push({ text: "Let's start with the UK, the most popular choice for a 1-year Masters. You can compare countries later." });
    lines.push({ kind: "insight", text: `Good to know: ${COUNTRIES[country].durationNote}` });
    lines.push({
      text: child("What's your CGPA (or %), and when do you graduate?", "What are your child's marks (CGPA or %), and when do they graduate?"),
    });
    void bot(lines, "score");
  };

  const submitScore = () => {
    const s = normaliseScore(scoreInput);
    if (!s) {
      setFormErr("Enter a CGPA like 7.4 or a percentage like 72%.");
      return;
    }
    if (!year) {
      setFormErr("Pick a graduation year.");
      return;
    }
    setFormErr("");
    me(`${s.label}${s.label.includes("%") ? "" : " CGPA"} · ${year}`);
    updateProfile({ score: s.score, scoreLabel: s.label, gradYear: year });
    track("step_answered", { step: "score", value: s.label });
    const p = profileRef.current;
    const preview = buildSnapshot({ ...p, budget: "45p" });
    const n = preview.all.length;
    const country = p.country ?? "UK";
    const lines: Omit<ChatMsg, "id" | "from">[] =
      n >= 6
        ? [
            {
              kind: "good",
              text: `Good news: ${s.label} meets the entry bar for ${n} of the 18 ${country} programmes we track${p.course && p.course !== "Other" ? ` in ${p.course}` : ""}.`,
            },
          ]
        : [
            {
              kind: "insight",
              text: `Honestly, ${s.label} rules out the most selective programmes, but ${n} are still a fit, and a strong SOP and IELTS score can add more.`,
            },
          ];
    lines.push({ text: child("Have you taken IELTS (or another English test)?", "Has your child taken IELTS (or another English test)?") });
    void bot(lines, "ielts");
  };

  const answerIelts = (v: Ielts, label: string) => {
    me(label);
    updateProfile({ ielts: v });
    track("step_answered", { step: "ielts", value: v });
    const line = v === "done" ? "Great, that's one big step done." : "No problem. Most programmes ask for 6.5, and most students get there in 4–8 weeks of prep.";
    void bot(
      [
        { text: line },
        {
          text: child(
            "Last one: your total budget for fees + living, roughly?",
            "What total amount can the family manage for the whole degree? A loan can cover the rest.",
          ),
        },
      ],
      "budget",
    );
  };

  const answerBudget = (b: Budget) => {
    me(BUDGET_LABEL[b]);
    updateProfile({ budget: b });
    track("step_answered", { step: "budget", value: b });
    const country = profileRef.current.country ?? "UK";
    const tight = BUDGET_MAX[b] < COUNTRIES[country].minTotal + 4;
    const line: Omit<ChatMsg, "id" | "from"> = tight
      ? { kind: "insight", text: `Heads up: most ${country} options cost more than this. I'll show what fits, and how a loan or another country could close the gap.` }
      : { kind: "good", text: b === "loan" ? "Good to know. Leap can check loan eligibility for you later, for free." : `That works for ${country}.` };
    void bot([line, { text: child("And your first name? I'll put it on your plan.", "And your child's first name? I'll put it on the plan.") }], "name");
  };

  const submitName = async (skip = false) => {
    const name = skip ? "" : nameInput.trim().replace(/[^\p{L}\s'-]/gu, "").slice(0, 20);
    if (!skip && !name) {
      setFormErr("Type a first name, or skip.");
      return;
    }
    setFormErr("");
    if (name) {
      me(name);
      updateProfile({ name: name.charAt(0).toUpperCase() + name.slice(1) });
    } else me("Skip");
    track("step_answered", { step: "name", value: name ? "given" : "skipped" });
    await bot([{ text: name ? `Thanks, ${profileRef.current.name}! Building your snapshot now…` : "Building your snapshot now…" }], null);
    setStep("building");
    setProgressStep("building");
    for (let i = 1; i <= 3; i++) {
      await sleep(850);
      setBuildStage(i);
    }
    await sleep(500);
    const s = buildSnapshot(profileRef.current);
    setSnap(s);
    setScreen("snapshot");
    track("snapshot_viewed", { country: profileRef.current.country, matches: s.all.length });
  };

  /* ---------------- Free chat ---------------- */
  const enterFree = (intro?: string) => {
    setScreen("chat");
    if (step === "free" && !intro) return;
    const lines: Omit<ChatMsg, "id" | "from">[] = [];
    if (intro) lines.push({ text: intro });
    else if (paid) lines.push({ text: "Leap Pro is active: ask me anything, as much as you like. Your counsellor also has your full profile." });
    else
      lines.push({
        text: `Ask me anything: costs, visas, jobs, safety, loans. You have ${freeLeft} free questions, and talking to a human counsellor is always free.`,
      });
    void bot(lines, "free");
  };

  const openPaywall = (source: string) => {
    setReturnTo(screen === "paywall" ? returnTo : screen);
    setScreen("paywall");
    track("paywall_viewed", { source });
  };

  const ask = async (q: string) => {
    const text = q.trim();
    if (!text || step !== "free") return;
    if (!paid && freeLeft <= 0) {
      openPaywall("free_limit");
      return;
    }
    setQuestion("");
    me(text);
    track("free_question_asked", { n: FREE_QUESTIONS - freeLeft + 1 });
    setStep(null);
    setTyping(true);
    let data: { text?: string; source?: string; gate?: boolean; handoff?: boolean; mode?: "ai" | "demo" | "rules" } = {};
    try {
      const history = msgs
        .filter((m) => m.text && (m.from === "me" || !m.kind || m.kind === "text"))
        .slice(-8)
        .map((m) => ({ from: m.from, text: m.text! }));
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: text, profile: profileRef.current, snapshot: snap, history }),
      });
      data = await res.json();
    } catch {
      data = { text: "I couldn't reach the server just now. Please try again in a moment." };
    }
    setTyping(false);
    if (data.mode === "ai" || data.mode === "demo") setAiMode(data.mode);
    push({ from: "bot", text: data.text ?? "Sorry, something went wrong.", source: data.source, kind: "text" });

    let left = freeLeft;
    if (!paid && !data.gate) {
      left = freeLeft - 1;
      setFreeLeft(left);
    }
    if (data.gate && !paid) {
      push({ from: "bot", kind: "lock", lockLabel: "Unlock my full breakdown" });
    }
    if (data.handoff) {
      push({ from: "bot", kind: "source", text: "handoff" });
    }
    if (!paid && left === 0 && !data.gate) {
      await sleep(500);
      push({
        from: "bot",
        text: "That was your last free question. Leap Pro gives you unlimited answers and your full plan. Or book a free counsellor call any time.",
      });
      push({ from: "bot", kind: "lock", lockLabel: "Unlock Leap Pro" });
    }
    setStep("free");
  };

  /* ---------------- Rendering helpers ---------------- */
  const noteKey =
    screen === "chat" ? (step === "building" ? "building" : snap ? "free" : "chat") : screen === "welcome" ? "welcome" : screen;

  const renderMsg = (m: ChatMsg) => {
    if (m.kind === "lock") {
      return (
        <div key={m.id} className="lock-card">
          <strong style={{ fontSize: 14 }}>{snap?.featured[0]?.name ?? "Your top university"} · your chance breakdown</strong>
          <div className="blur" aria-hidden="true">
            <div className="bar-row">
              <span style={{ width: 80 }}>Academics</span>
              <span className="bar">
                <b style={{ width: "70%" }} />
              </span>
            </div>
            <div className="bar-row">
              <span style={{ width: 80 }}>IELTS</span>
              <span className="bar">
                <b style={{ width: "40%", background: "var(--marigold)" }} />
              </span>
            </div>
            <div className="bar-row">
              <span style={{ width: 80 }}>Projects</span>
              <span className="bar">
                <b style={{ width: "55%" }} />
              </span>
            </div>
          </div>
          <button className="btn btn-primary" style={{ fontSize: 15, padding: 12 }} onClick={() => openPaywall("chat_gate")}>
            <Lock color="#fff" /> {m.lockLabel ?? "Unlock"}
          </button>
          <div className="small" style={{ fontSize: 12 }}>
            Shows exactly what would raise your chances
          </div>
        </div>
      );
    }
    if (m.kind === "source" && m.text === "handoff") {
      return (
        <div key={m.id} className="lock-card">
          <strong style={{ fontSize: 14 }}>Free call with a Leap counsellor</strong>
          <span style={{ fontSize: 13, color: "var(--ink-2)" }}>
            They&apos;ll get your profile and snapshot, so you won&apos;t repeat anything.
          </span>
          {handoffBooked ? (
            <div className="bubble good" style={{ maxWidth: "none" }}>
              Booked. A counsellor will call within 24 hours{paid ? " (priority for Pro)" : ""}.
            </div>
          ) : (
            <button
              className="btn btn-primary"
              style={{ fontSize: 15, padding: 12 }}
              onClick={() => {
                setHandoffBooked(true);
                track("human_handoff", { paid });
              }}
            >
              Book my free call
            </button>
          )}
        </div>
      );
    }
    const cls = m.from === "me" ? "me" : m.kind === "insight" ? "bot insight" : m.kind === "good" ? "bot good" : "bot";
    return (
      <div key={m.id} className={`bubble ${cls}`}>
        {m.kind === "good" && (
          <span style={{ display: "inline-flex", verticalAlign: "-3px", marginRight: 6 }}>
            <Check size={16} />
          </span>
        )}
        {m.text}
        {m.source && <span className="src">Source: {m.source} · demo knowledge base</span>}
      </div>
    );
  };

  const renderInput = () => {
    switch (step) {
      case "stage": {
        const opts = isParent ? ["In final year of college", "Already graduated", "Still exploring"] : ["Just exploring", "Picking a country", "Ready to apply"];
        return (
          <div className="chips">
            {opts.map((o) => (
              <button key={o} className="chip" onClick={() => answerStage(o)}>
                {o}
              </button>
            ))}
          </div>
        );
      }
      case "course":
        return (
          <div className="chips">
            {COURSES.map((c) => (
              <button key={c} className="chip" onClick={() => answerCourse(c)}>
                {c}
              </button>
            ))}
          </div>
        );
      case "country": {
        const order = ad === "cgpa_uk" ? COUNTRY_LIST : COUNTRY_LIST;
        return (
          <div className="chips">
            {order.map((c) => (
              <button key={c} className="chip" onClick={() => answerCountry(c)}>
                {c}
              </button>
            ))}
            <button className="chip" onClick={() => answerCountry("Not sure")}>
              Not sure
            </button>
          </div>
        );
      }
      case "score": {
        const y = new Date().getFullYear();
        return (
          <form
            className="inline-form"
            onSubmit={(e) => {
              e.preventDefault();
              submitScore();
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <label htmlFor="score" style={{ fontSize: 14, fontWeight: 600, width: 70 }}>
                Marks
              </label>
              <input
                id="score"
                className="field"
                inputMode="decimal"
                placeholder="e.g. 7.4 or 72%"
                value={scoreInput}
                autoFocus
                onChange={(e) => {
                  setScoreInput(e.target.value);
                  setFormErr("");
                }}
              />
            </div>
            <div className="chips" role="group" aria-label="Graduation year">
              {[String(y), String(y + 1), "Graduated"].map((v) => (
                <button
                  type="button"
                  key={v}
                  className={`chip ${year === v ? "sel" : ""}`}
                  onClick={() => {
                    setYear(v);
                    setFormErr("");
                  }}
                >
                  {v}
                </button>
              ))}
            </div>
            {formErr && <div className="err">{formErr}</div>}
            <button type="submit" className="btn btn-primary" style={{ padding: 12, fontSize: 15 }}>
              Continue
            </button>
          </form>
        );
      }
      case "ielts":
        return (
          <div className="chips">
            <button className="chip" onClick={() => answerIelts("done", "Yes, done")}>
              Yes, done
            </button>
            <button className="chip" onClick={() => answerIelts("not_yet", "Not yet")}>
              Not yet
            </button>
            <button className="chip" onClick={() => answerIelts("planning", "Planning to")}>
              Planning to
            </button>
          </div>
        );
      case "budget":
        return (
          <div className="chips">
            {BUDGETS.map((b) => (
              <button key={b} className="chip" onClick={() => answerBudget(b)}>
                {BUDGET_LABEL[b]}
              </button>
            ))}
          </div>
        );
      case "name":
        return (
          <form
            className="inline-form"
            onSubmit={(e) => {
              e.preventDefault();
              void submitName();
            }}
          >
            <label htmlFor="name" className="sr-only">
              First name
            </label>
            <input
              id="name"
              className="field"
              placeholder="First name"
              autoComplete="given-name"
              value={nameInput}
              autoFocus
              onChange={(e) => {
                setNameInput(e.target.value);
                setFormErr("");
              }}
            />
            {formErr && <div className="err">{formErr}</div>}
            <div style={{ display: "flex", gap: 8 }}>
              <button type="button" className="btn btn-outline" onClick={() => void submitName(true)}>
                Skip
              </button>
              <button type="submit" className="btn btn-primary" style={{ padding: 12, fontSize: 15 }}>
                Build my plan
              </button>
            </div>
          </form>
        );
      case "building":
        return (
          <div className="building" role="status">
            <strong>Building your snapshot…</strong>
            {[
              `Matching ${profile.country ?? ""} ${profile.course && profile.course !== "Other" ? profile.course : ""} programmes`,
              "Estimating your total cost in ₹",
              "Checking scholarships for you",
            ].map((label, i) => (
              <div className="row" key={label} style={{ opacity: buildStage >= i ? 1 : 0.45 }}>
                {buildStage > i ? <Check color="#7fe0ae" /> : <Spinner />}
                {label}
              </div>
            ))}
          </div>
        );
      default:
        return null;
    }
  };

  const info = STEP_INFO[progressStep];
  const inFree = screen === "chat" && (step === "free" || (snap && step === null));

  return (
    <div className="stage">
      <main className="phone" aria-label="Leap app prototype">
        {screen === "welcome" && <Welcome lang={lang} setLang={setLang} onStart={start} />}

        {screen === "chat" && (
          <div className="screen">
            <div className="chat-header">
              <button
                className="icon-btn"
                aria-label={snap ? "Back to my plan" : "Back"}
                style={{ marginLeft: -10 }}
                onClick={() => (snap ? setScreen("snapshot") : setScreen("welcome"))}
              >
                <Back />
              </button>
              <div className="logo">L</div>
              <div className="who">
                <strong>Leap Guide</strong>
                <span>AI counsellor · experts on call</span>
              </div>
              {snap &&
                (paid ? (
                  <span className="pill pill-amber">PRO</span>
                ) : (
                  <span className="pill pill-lilac">{freeLeft} free left</span>
                ))}
            </div>
            {!snap && (
              <div className="progress" aria-label={`Progress: ${info.label}`}>
                <div className="labels">
                  <span>{child("Your snapshot", "Your child's snapshot")}</span>
                  <span>{info.label}</span>
                </div>
                <div className="track">
                  <div className="fill" style={{ width: `${info.pct}%` }} />
                </div>
              </div>
            )}
            <div className="scroll" ref={scrollRef}>
              <div className="messages" aria-live="polite">
                {msgs.map(renderMsg)}
                {typing && (
                  <div className="typing" aria-label="Leap Guide is typing">
                    <i />
                    <i />
                    <i />
                  </div>
                )}
                {renderInput()}
              </div>
            </div>
            {inFree && (
              <>
                {msgs.filter((m) => m.from === "me").length < 9 && (
                  <div className="suggest">
                    {SUGGESTIONS.map((s) => (
                      <button key={s} className="chip" onClick={() => void ask(s)} disabled={step !== "free"}>
                        {s}
                      </button>
                    ))}
                  </div>
                )}
                <form
                  className="composer"
                  onSubmit={(e) => {
                    e.preventDefault();
                    void ask(question);
                  }}
                >
                  <label htmlFor="q" className="sr-only">
                    Ask a question
                  </label>
                  <input
                    id="q"
                    placeholder={lang === "hi" ? "कुछ भी पूछें…" : "Ask anything about studying abroad…"}
                    value={question}
                    maxLength={500}
                    onChange={(e) => setQuestion(e.target.value)}
                  />
                  <button className="send" aria-label="Send" disabled={!question.trim() || step !== "free"}>
                    <Send />
                  </button>
                </form>
              </>
            )}
          </div>
        )}

        {screen === "snapshot" && snap && (
          <SnapshotScreen
            snap={snap}
            saved={saved}
            reacted={reacted}
            onReact={(v) => {
              setReacted(v);
              track("magic_reaction", { value: v });
              if (v === "no") enterFree("Thanks for telling me. What feels off? Your budget, the country, or the universities? I'll adjust.");
            }}
            onSeeAll={() => openPaywall("see_all_matches")}
            onAsk={() => enterFree()}
            onSave={() => setShowSave(true)}
          />
        )}

        {screen === "paywall" && (
          <Paywall
            snap={snap}
            persona={profile.persona}
            name={profile.name}
            plan={plan}
            setPlan={setPlan}
            onClose={() => setScreen(returnTo === "paywall" ? "snapshot" : returnTo)}
            onContinue={() => {
              track("checkout_started", { plan, amount: PLANS[plan].price });
              setScreen("checkout");
            }}
            onAskParent={() => {
              track("ask_parent_opened");
              setScreen("askParent");
            }}
          />
        )}

        {screen === "askParent" && (
          <AskParent
            snap={snap}
            name={profile.name}
            plan={plan}
            onBack={() => setScreen("paywall")}
            onSelfPay={() => {
              track("checkout_started", { plan, amount: PLANS[plan].price, via: "self" });
              setScreen("checkout");
            }}
            onPaid={() => {
              setPaid(true);
              track("payment_success", { plan, amount: PLANS[plan].price, payer: "parent" });
              setScreen("success");
            }}
          />
        )}

        {screen === "checkout" && (
          <Checkout
            plan={plan}
            name={profile.name}
            onBack={() => setScreen("paywall")}
            onPaid={() => {
              setPaid(true);
              track("payment_success", { plan, amount: PLANS[plan].price, payer: "self" });
              setScreen("success");
            }}
          />
        )}

        {screen === "success" && (
          <Success
            snap={snap}
            name={profile.name}
            plan={plan}
            onStart={() =>
              enterFree(
                snap?.insight.includes("IELTS")
                  ? "Pro is active. Let's plan your IELTS: ask me anything about prep, timing or test dates, as much as you like."
                  : "Pro is active. Ask me anything, as much as you like. Your counsellor also has your full profile.",
              )
            }
          />
        )}

        {showSave && (
          <SaveSheet
            persona={profile.persona}
            onClose={() => setShowSave(false)}
            onSaved={() => setSaved(true)}
          />
        )}
      </main>
      <Notes noteKey={noteKey} mode={aiMode} adParam={ad} />
    </div>
  );
}
