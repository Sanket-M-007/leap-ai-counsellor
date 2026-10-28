import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";
import { needsPro, retrieve, wantsHuman } from "@/lib/kb";

export const runtime = "nodejs";

interface Body {
  question: string;
  profile?: Record<string, unknown>;
  snapshot?: { title?: string; insight?: string; featured?: { name: string; chance: string; totalLakh: number }[] };
  history?: { from: "me" | "bot"; text: string }[];
}

const SYSTEM = `You are Leap Guide, a warm, honest study-abroad counsellor for Indian students and parents, inside the Leap app.

Rules:
- Answer in at most 70 words, in plain friendly language. No markdown headings or lists of more than 3 items.
- Use ONLY facts from CONTEXT and the user's PROFILE/SNAPSHOT. If they don't cover the question, give general guidance without numbers and say a Leap counsellor can confirm the details.
- Never invent numbers, fees, deadlines, admit chances, rankings or visa rules. Never promise admission or a visa.
- If the user asks for something personalised and deep (their exact admit chances at a named university, an SOP review, their full university list, or a month-by-month plan for them), start your reply with the token [[PRO]] and then give a short, genuinely useful partial answer, and say the full version is in Leap Pro.
- If the user is distressed, mentions a visa refusal, or asks for a person, start your reply with [[HUMAN]] and offer a free call with a Leap counsellor.
- Reply in the user's language: Hindi (Devanagari) if they write in Hindi or the profile language is "hi", Hinglish if they write in Hinglish, else English.`;

function demoAnswer(question: string, profile?: Record<string, unknown>) {
  const docs = retrieve(`${question} ${typeof profile?.country === "string" ? profile.country : ""}`, 1);
  if (docs.length) {
    return { text: docs[0].text, source: docs[0].source };
  }
  const country = (profile?.country as string) ?? "your chosen country";
  return {
    text: `Good question. I don't have verified data on that yet, so I don't want to guess. A Leap counsellor can answer it properly for ${country}, and that call is always free.`,
    source: undefined,
  };
}

export async function POST(req: Request) {
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  const question = (body.question ?? "").toString().slice(0, 600).trim();
  if (!question) return NextResponse.json({ error: "Empty question" }, { status: 400 });

  // Cheap deterministic routing first (the "router" layer). In production a
  // small model classifies intent, language and risk; regex keeps the demo free.
  if (wantsHuman(question)) {
    return NextResponse.json({
      text: "Of course. A Leap counsellor can call you, free of charge. I'll share your profile and snapshot with them so you don't have to repeat anything.",
      handoff: true,
      mode: "rules",
    });
  }

  const gate = needsPro(question);
  // Add the user's country so "there" / "this country" questions retrieve the right article.
  const country = typeof body.profile?.country === "string" ? body.profile.country : "";
  const docs = retrieve(`${question} ${country}`, 3);
  const key = process.env.ANTHROPIC_API_KEY;

  if (!key) {
    if (gate) {
      return NextResponse.json({
        text: "That depends on details like your IELTS score, projects and SOP. I can give you a full, university-by-university breakdown with what would raise your chances.",
        gate: true,
        mode: "demo",
      });
    }
    const a = demoAnswer(question, body.profile);
    return NextResponse.json({ ...a, mode: "demo" });
  }

  const client = new Anthropic({ apiKey: key });
  const context = docs.length
    ? docs.map((d) => `[${d.title}] ${d.text} (Source: ${d.source})`).join("\n")
    : "No verified article matched this question.";
  const snap = body.snapshot
    ? `${body.snapshot.title}. Featured: ${(body.snapshot.featured ?? [])
        .map((m) => `${m.name} (${m.chance} chance, ~₹${m.totalLakh}L total)`)
        .join("; ")}. Insight: ${body.snapshot.insight}`
    : "Not built yet.";

  const history = (body.history ?? []).slice(-6).map((m) => ({
    role: m.from === "me" ? ("user" as const) : ("assistant" as const),
    content: m.text || "…",
  }));
  // The API needs the first message to come from the user.
  while (history.length && history[0].role !== "user") history.shift();

  try {
    const msg = await client.messages.create({
      model: process.env.ANSWER_MODEL || "claude-haiku-5-5",
      max_tokens: 400,
      system: SYSTEM,
      messages: [
        ...history,
        {
          role: "user",
          content: `PROFILE: ${JSON.stringify(body.profile ?? {})}\nSNAPSHOT: ${snap}\nCONTEXT:\n${context}\n\nQUESTION: ${question}`,
        },
      ],
    });
    let text = msg.content
      .map((b) => (b.type === "text" ? b.text : ""))
      .join("")
      .trim();
    let isGate = gate;
    let handoff = false;
    if (text.includes("[[PRO]]")) {
      isGate = true;
      text = text.replace("[[PRO]]", "").trim();
    }
    if (text.includes("[[HUMAN]]")) {
      handoff = true;
      text = text.replace("[[HUMAN]]", "").trim();
    }
    return NextResponse.json({
      text,
      source: docs[0]?.source,
      gate: isGate,
      handoff,
      mode: "ai",
    });
  } catch (err) {
    console.error("AI call failed, falling back to demo answer", err);
    const a = demoAnswer(question, body.profile);
    return NextResponse.json({ ...a, gate, mode: "demo" });
  }
}
