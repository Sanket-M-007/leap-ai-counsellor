// A small curated knowledge base. In production this is a vector index over
// counsellor-verified articles, refreshed on a schedule. Here retrieval is
// simple keyword scoring so the prototype runs anywhere with no extra services.
// Demo content: rules change, so every entry must be re-verified before launch.

export interface KbEntry {
  id: string;
  title: string;
  keywords: string[];
  text: string;
  source: string;
}

export const KB: KbEntry[] = [
  {
    id: "work-uk",
    title: "Part-time work in the UK",
    keywords: ["work", "part time", "part-time", "job", "earn", "uk", "britain", "england"],
    text: "Students on a UK student visa studying at degree level can usually work up to 20 hours a week during term time and full time during official vacations. Earnings can cover a good share of living costs, but should not be counted on to pay tuition.",
    source: "UK student visa work conditions",
  },
  {
    id: "work-canada",
    title: "Part-time work in Canada",
    keywords: ["work", "part time", "part-time", "job", "earn", "canada"],
    text: "International students in Canada can work off campus for a limited number of hours per week during academic sessions and full time during scheduled breaks. The weekly cap has changed in recent years, so students should check the current IRCC rule.",
    source: "IRCC study permit work conditions",
  },
  {
    id: "work-usa",
    title: "Working while studying in the USA",
    keywords: ["work", "part time", "part-time", "job", "earn", "usa", "us", "america", "opt", "cpt"],
    text: "F-1 students in the USA can generally work on campus up to 20 hours a week during term. Off-campus work is limited to authorised programmes such as CPT during studies and OPT after graduation. STEM graduates can extend OPT, allowing up to 3 years of work in total.",
    source: "US F-1 visa employment rules",
  },
  {
    id: "work-germany",
    title: "Working while studying in Germany",
    keywords: ["work", "part time", "part-time", "job", "earn", "germany", "german"],
    text: "International students in Germany can work a limited number of full or half days per year, plus student assistant jobs at the university. Many students cover a large part of living costs this way. After graduating, students can stay to look for work for up to 18 months.",
    source: "German residence permit for study",
  },
  {
    id: "post-study",
    title: "Post-study work options",
    keywords: ["after", "post study", "post-study", "stay back", "stay", "pr", "settle", "graduate route", "psw", "work permit", "visa after"],
    text: "Most popular countries offer a post-study work period: the UK Graduate Route, Canada's Post-Graduation Work Permit, OPT in the USA, Stamp 1G in Ireland, the 18-month job-seeker permit in Germany and the Temporary Graduate visa in Australia. Durations and rules change often, so a counsellor should confirm the current rule for the student's intake year.",
    source: "Government immigration sites, summarised by Leap counsellors",
  },
  {
    id: "safety",
    title: "Student safety abroad",
    keywords: ["safe", "safety", "security", "crime", "racism", "danger", "secure"],
    text: "Universities in the UK, Ireland, Canada, Germany and Australia provide campus security, 24/7 student helplines and international student offices. Most cities have large Indian student communities. Choosing university-managed or verified accommodation in the first year is the single best safety step.",
    source: "University international student services",
  },
  {
    id: "loan",
    title: "Education loans",
    keywords: ["loan", "finance", "fund", "funding", "bank", "collateral", "emi", "afford", "money", "pay"],
    text: "Education loans for study abroad are offered by banks, NBFCs and specialised lenders. Smaller amounts are often available without collateral based on the university and course, while larger amounts may need collateral. Typical documents: admission letter, academic records, co-applicant income proof and KYC. Repayment usually starts after the course plus a grace period.",
    source: "Leap Finance and partner lender guidelines",
  },
  {
    id: "ielts",
    title: "IELTS requirements",
    keywords: ["ielts", "english", "toefl", "pte", "duolingo", "det", "band", "language test"],
    text: "Most Masters programmes ask for IELTS 6.5 overall with no band below 6.0; more selective ones ask for 7.0. Many universities also accept TOEFL, PTE and some accept Duolingo. Most students reach their target in 4–8 weeks of focused preparation.",
    source: "University admission requirements",
  },
  {
    id: "sop",
    title: "Statement of Purpose (SOP)",
    keywords: ["sop", "statement", "purpose", "essay", "lor", "recommendation", "personal statement"],
    text: "A strong SOP explains why this course, why this university, why now, and what the student will do after. Specific projects, internships and outcomes matter more than general passion. Most universities also ask for 2 letters of recommendation.",
    source: "Leap counsellor guidance",
  },
  {
    id: "timeline",
    title: "Application timeline",
    keywords: ["when", "deadline", "timeline", "intake", "apply", "start", "september", "january", "fall", "spring"],
    text: "For a September intake, students usually shortlist 10–12 months ahead, take IELTS 8–10 months ahead, apply 6–9 months ahead, and handle loans and visas 2–4 months ahead. Scholarship deadlines are often earlier than application deadlines.",
    source: "Leap counsellor guidance",
  },
  {
    id: "scholarship",
    title: "Scholarships",
    keywords: ["scholarship", "scholarships", "grant", "waiver", "discount", "fee reduction", "funding"],
    text: "Most scholarships for Indian students are partial tuition waivers from universities, awarded on academic merit and applying early. Government scholarships such as Chevening, DAAD and Fulbright are more competitive. Applying early is the biggest controllable factor.",
    source: "University and government scholarship pages",
  },
  {
    id: "gap",
    title: "Gap years and backlogs",
    keywords: ["gap", "backlog", "backlogs", "arrear", "low marks", "low cgpa", "rejected", "refusal"],
    text: "Gap years are generally fine if explained with work, courses or projects. Backlogs are accepted by many universities if cleared, but limits vary by university. Visa refusals should always be reviewed by a human counsellor before re-applying.",
    source: "Leap counsellor guidance",
  },
];

export function retrieve(query: string, k = 3): KbEntry[] {
  const q = query.toLowerCase();
  return KB.map((e) => ({
    e,
    score: e.keywords.reduce((s, kw) => (q.includes(kw) ? s + (kw.length > 4 ? 2 : 1) : s), 0),
  }))
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, k)
    .map((r) => r.e);
}

// Questions that need the personalised, paid depth.
const PAID_PATTERNS = [
  /exact (chance|odds)/,
  /my (chance|odds)/,
  /(chance|odds) (at|for|of getting)/,
  /(review|check|write|improve).*(sop|statement)/,
  /(sop|statement).*(review|check|write|improve)/,
  /(all|full|complete) (list|matches|shortlist)/,
  /(month|week).*(plan|timeline) for me/,
  /deadline plan/,
  /which.*(should i|to) (apply|choose|pick)/,
];

export function needsPro(query: string) {
  const q = query.toLowerCase();
  return PAID_PATTERNS.some((r) => r.test(q));
}

const HUMAN_PATTERNS = [/human/, /counsel?lor/, /talk to (someone|a person)/, /call me/, /visa (refus|reject)/, /real person/];
export function wantsHuman(query: string) {
  const q = query.toLowerCase();
  return HUMAN_PATTERNS.some((r) => r.test(q));
}
