# Leap Guide: chat-first study-abroad counsellor (prototype)

Prototype for the Leap Product Manager assignment: a freemium, chat-first counselling experience that takes a study-abroad aspirant from an ad click to a paid Leap Pro subscription.

## What's in it

- **Welcome**: no sign-up, student or parent path, English/Hindi answers
- **Scripted profiling** (4 steps, chips): instant, free, error-proof, with a data-backed micro-insight after every answer
- **Snapshot (the magic moment)**: ambitious / target / safe universities with admit chances, total cost in ₹, likely scholarship, salary, and one honest insight. Remaining matches are visible but locked
- **Save to WhatsApp** (phone number asked only after value)
- **Free AI questions** (5): retrieval over a verified knowledge base, source line on answers, partial answer + lock for deep personal requests, human counsellor handoff
- **Paywall**: 3-month "application season" plan (₹449, default) or ₹99 first month, then ₹199
- **Ask a parent to pay**: WhatsApp message with the student's own results and a UPI link
- **UPI checkout** (simulated) and **success** screen with next steps
Ad entry links: `/?ad=cgpa_uk` (student ad) and `/?ad=parent_cost` (parent ad). Add `&debug=1` (or `/?debug=1`) to see the funnel events the app tracks.

## Architecture

| Layer | In this prototype | In production |
|---|---|---|
| Orchestrator | React state machine (`components/App.tsx`) | Same idea, server-side session state |
| Profiling | Scripted chips, no LLM | Same |
| Matching engine | Rules over a fictional demo dataset (`lib/engine.ts`) | Leap's university DB + historical admit outcomes |
| Router | Regex intent rules (`lib/kb.ts`) | Small fast model (intent, language, risk) |
| Answers | Claude Haiku via `/api/chat` with keyword retrieval | Same, with a vector index over counsellor-verified articles |
| Human handoff | "Book free call" card | CRM ticket with profile + snapshot summary |
| Analytics | In-memory events, visible with `?debug=1` | Mixpanel / Amplitude / PostHog |

**Demo data:** all universities are fictional and costs are illustrative. The knowledge base must be re-verified before any real use. No real payment is taken.

## Run locally

```bash
npm install
cp .env.example .env.local   # optional: add ANTHROPIC_API_KEY for live AI answers
npm run dev
```

Without `ANTHROPIC_API_KEY` the app runs in demo mode with scripted answers from the knowledge base.

## Deploy on Vercel

1. vercel.com → **Add New → Project** → import this GitHub repo (framework: Next.js, defaults are fine)
2. Optional: **Settings → Environment Variables** → add `ANTHROPIC_API_KEY`, then redeploy
3. Done: every push to `main` redeploys automatically

## Tools used

Built with Claude (Anthropic) for research, screen design, and code generation; reviewed and directed by the candidate.
