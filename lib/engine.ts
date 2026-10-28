// Deterministic matching engine. In production this runs on Leap's university
// database and historical admit outcomes. Here it uses an illustrative demo
// dataset of fictional universities so no real institution is misrepresented.
import type { Budget, Chance, Country, Course, Match, Profile, Snapshot } from "./types";

interface CountryInfo {
  duration: string;
  durationNote: string;
  minTotal: number; // lakh INR, full programme incl. living
  maxTotal: number;
  salary: Record<string, string>;
  cities: string[];
  prefixes: string[];
}

export const COUNTRIES: Record<Country, CountryInfo> = {
  UK: {
    duration: "1 year",
    durationNote: "Most UK Masters are 1 year, so you save a full year of fees and living costs vs the USA.",
    minTotal: 20,
    maxTotal: 42,
    salary: { tech: "£30–38K", business: "£32–45K", default: "£28–35K" },
    cities: ["Leeds", "Glasgow", "Manchester", "Birmingham", "Bristol", "Nottingham", "Sheffield", "Coventry", "Edinburgh"],
    prefixes: ["Northbridge", "Kingsmere", "Ashford", "Halden", "Westvale", "Redmoor", "Elmstead", "Carrow", "Thornfield", "Bexley", "Greywater", "Linhurst", "Marlow Park", "Oakhaven", "Stanmore", "Wexford Hall", "Brackley", "Ravensworth"],
  },
  USA: {
    duration: "2 years",
    durationNote: "US Masters are usually 2 years, with STEM courses eligible for up to 3 years of work after study (OPT).",
    minTotal: 40,
    maxTotal: 85,
    salary: { tech: "$85–110K", business: "$80–120K", default: "$65–85K" },
    cities: ["Boston", "Dallas", "Chicago", "Phoenix", "Atlanta", "Seattle", "Denver", "Pittsburgh"],
    prefixes: ["Lakeview", "Summit State", "Riverside Tech", "Crestwood", "Pinehurst", "Bayfield", "Northgate", "Clearwater", "Harlan", "Westbrook", "Fairmont", "Stonebridge", "Maple Ridge", "Eastfield", "Granite State", "Ashby", "Sutton", "Briarcliff"],
  },
  Canada: {
    duration: "1–2 years",
    durationNote: "Canada offers a post-graduation work permit, and many students later apply for PR.",
    minTotal: 28,
    maxTotal: 52,
    salary: { tech: "C$65–85K", business: "C$60–80K", default: "C$50–65K" },
    cities: ["Toronto", "Vancouver", "Waterloo", "Ottawa", "Halifax", "Calgary", "Montreal"],
    prefixes: ["Lakehead Bay", "Northern Pines", "Maplewood", "St. Laurent", "Coastal Ridge", "Prairie", "Algoma Heights", "Fraser Valley", "Huronview", "Cedar Point", "Kingsway", "Bluewater", "Rideau", "Laurentian Park", "Pacific Rim", "Glenmore", "Westshore", "Thunder Lake"],
  },
  Germany: {
    duration: "2 years",
    durationNote: "Public universities in Germany charge little or no tuition, so most of your cost is living expenses.",
    minTotal: 12,
    maxTotal: 28,
    salary: { tech: "€50–60K", business: "€48–58K", default: "€42–50K" },
    cities: ["Munich", "Berlin", "Aachen", "Stuttgart", "Hamburg", "Dresden", "Bonn"],
    prefixes: ["Rheinfeld", "Hochwald", "Neumark", "Isartal", "Lindenberg", "Elbtal", "Schönau", "Altstadt", "Waldheim", "Rosenthal", "Bergstadt", "Mittelland", "Donauhof", "Sonnfeld", "Kirchberg", "Nordhafen", "Grünwald", "Seeburg"],
  },
  Ireland: {
    duration: "1 year",
    durationNote: "Irish Masters are mostly 1 year, followed by up to 2 years of post-study work rights.",
    minTotal: 22,
    maxTotal: 36,
    salary: { tech: "€42–55K", business: "€40–52K", default: "€35–45K" },
    cities: ["Dublin", "Cork", "Galway", "Limerick", "Maynooth"],
    prefixes: ["Liffey", "Shannon Vale", "Atlantic", "Glendale", "Kilmore", "Wicklow Hills", "Barrow", "Clonmel", "Corrib", "Ardmore", "Inishfree", "Boyne", "Tara", "Lough Erne", "Kilkenny Park", "Slievemore", "Avonmore", "Dunmore"],
  },
  Australia: {
    duration: "1.5–2 years",
    durationNote: "Australian Masters are 1.5–2 years, with 2–4 years of post-study work rights depending on the city.",
    minTotal: 38,
    maxTotal: 62,
    salary: { tech: "A$80–100K", business: "A$75–95K", default: "A$65–80K" },
    cities: ["Melbourne", "Sydney", "Brisbane", "Adelaide", "Perth", "Canberra"],
    prefixes: ["Southern Cross", "Coral Coast", "Yarra", "Banksia", "Darling Range", "Wattle", "Harbourside", "Murray Valley", "Blue Gum", "Sunshine", "Eastern Bay", "Ironbark", "Goldfields", "Kingsford", "Tasman", "Swan River", "Hunter", "Redgum"],
  },
};

export const BUDGET_MAX: Record<Budget, number> = {
  u20: 20,
  "20_30": 30,
  "30_45": 45,
  "45p": 999,
  loan: 999,
};

export const BUDGET_LABEL: Record<Budget, string> = {
  u20: "Under ₹20L",
  "20_30": "₹20–30L",
  "30_45": "₹30–45L",
  "45p": "₹45L+",
  loan: "Need a loan",
};

// Simple seeded pseudo-random so every user sees stable results.
function seeded(n: number) {
  const x = Math.sin(n * 9301 + 49297) * 233280;
  return x - Math.floor(x);
}

function universities(country: Country) {
  const info = COUNTRIES[country];
  return info.prefixes.map((p, i) => {
    // Typical admitted CGPA spread from 6.0 to 9.0 (selective first)
    const typical = 9.0 - (i / (info.prefixes.length - 1)) * 3.0 + (seeded(i + country.length) - 0.5) * 0.3;
    const prestige = 1 - i / info.prefixes.length;
    const total = Math.round(info.minTotal + (info.maxTotal - info.minTotal) * (0.35 + 0.65 * prestige) * (0.85 + seeded(i * 7) * 0.3));
    return {
      id: `${country}-${i}`,
      name: `${p} University`,
      city: info.cities[i % info.cities.length],
      typical: Math.round(typical * 10) / 10,
      totalLakh: Math.min(info.maxTotal, Math.max(info.minTotal, total)),
      ieltsMin: typical >= 7.6 ? 7.0 : 6.5,
      scholarship: seeded(i * 3 + 1) > 0.45,
    };
  });
}

function chanceFor(score: number, typical: number): Chance {
  const d = score - typical;
  if (d >= 0.6) return "Very high";
  if (d >= 0.15) return "High";
  if (d >= -0.4) return "Medium";
  return "Low";
}

export function normaliseScore(raw: string): { score: number; label: string } | null {
  const t = raw.trim().replace(/[^0-9.%]/g, "");
  const n = parseFloat(t);
  if (Number.isNaN(n)) return null;
  if (t.includes("%") || n > 10) {
    if (n < 30 || n > 100) return null;
    return { score: Math.min(10, Math.round((n / 9.5) * 10) / 10), label: `${n}%` };
  }
  if (n < 4) return null;
  return { score: n, label: `${n}` };
}

function courseKey(course?: Course) {
  if (course === "Data Science / AI" || course === "Computer Science" || course === "Engineering") return "tech";
  if (course === "MBA / Business") return "business";
  return "default";
}

function degreeLabel(course?: Course) {
  switch (course) {
    case "Data Science / AI":
      return "MSc Data Science";
    case "Computer Science":
      return "MS Computer Science";
    case "MBA / Business":
      return "MBA / Business Masters";
    case "Engineering":
      return "MS Engineering";
    default:
      return "Masters";
  }
}

export function cheaperAlternative(country: Country, budgetMax: number): Country | null {
  const options: Country[] = ["Germany", "Ireland", "UK", "Canada"];
  for (const c of options) {
    if (c !== country && COUNTRIES[c].minTotal + 4 <= budgetMax) return c;
  }
  return null;
}

export function buildSnapshot(p: Profile): Snapshot {
  const country = p.country ?? "UK";
  const info = COUNTRIES[country];
  const score = p.score ?? 7;
  const budgetMax = BUDGET_MAX[p.budget ?? "45p"];
  const unis = universities(country);

  const scored = unis
    .map((u) => ({ ...u, chance: chanceFor(score, u.typical) }))
    .filter((u) => u.chance !== "Low");

  const affordable = scored.filter((u) => u.totalLakh <= budgetMax * 1.1);
  const pool = affordable.length >= 3 ? affordable : scored;

  const toMatch = (u: (typeof scored)[number], tier: Match["tier"]): Match => ({
    id: u.id,
    name: u.name,
    city: u.city,
    tier,
    chance: u.chance,
    totalLakh: u.totalLakh,
    ieltsMin: u.ieltsMin,
    scholarship: u.scholarship,
  });

  const tierOf = (c: Chance): Match["tier"] => (c === "Medium" ? "Ambitious" : c === "High" ? "Target" : "Safe");

  // One of each tier where possible: the most selective "Medium" (a stretch,
  // even slightly over budget), the first "High" and the most affordable
  // "Very high". Then fill up to 3 from the rest of the pool.
  const picks: (typeof scored)[number][] = [];
  const ambitious = pool.find((u) => u.chance === "Medium") ?? scored.find((u) => u.chance === "Medium" && u.totalLakh <= budgetMax * 1.35);
  if (ambitious) picks.push(ambitious);
  const target = pool.find((u) => u.chance === "High" && !picks.includes(u));
  if (target) picks.push(target);
  const safe = [...pool].reverse().find((u) => u.chance === "Very high" && !picks.includes(u));
  if (safe) picks.push(safe);
  for (const u of pool) {
    if (picks.length >= 3) break;
    if (!picks.includes(u)) picks.push(u);
  }
  const order: Record<Chance, number> = { Medium: 0, High: 1, "Very high": 2, Low: 3 };
  picks.sort((a, b) => order[a.chance] - order[b.chance]);
  const featured: Match[] = picks.map((u) => toMatch(u, tierOf(u.chance)));

  const allUnis = ambitious && !pool.includes(ambitious) ? [ambitious, ...pool] : pool;
  const all: Match[] = allUnis.map((u) => toMatch(u, tierOf(u.chance)));

  const scholarship = score >= 8.5 ? "₹4–8L" : score >= 7.5 ? "₹2–5L" : score >= 6.5 ? "₹1–3L" : "₹0.5–1.5L";
  const salary = info.salary[courseKey(p.course)];

  // Insight: the single most useful honest observation, in priority order.
  let insight: string;
  let budgetNote: string | undefined;
  const yours = p.persona === "parent" ? (p.name ? `${p.name}'s` : "Your child's") : "Your";
  const cheapest = Math.min(...unis.map((u) => u.totalLakh));
  const alt = cheaperAlternative(country, budgetMax);
  const ieltsGated = scored.filter((u) => u.ieltsMin >= 7).length;

  if (p.budget !== "loan" && budgetMax < 999 && cheapest > budgetMax) {
    budgetNote = `Most ${country} options cost more than ${BUDGET_LABEL[p.budget!]}.`;
    insight = alt
      ? `${country} is a stretch on this budget. ${alt} fits it much better for the same degree, and an education loan can cover the gap if you want ${country}.`
      : `${country} is a stretch on this budget, but an education loan can usually cover the gap. Leap can check your loan eligibility.`;
  } else if (score < 6.5) {
    insight = `${yours} marks are below most cut-offs, but a strong SOP, relevant projects and a good IELTS score can move ${p.persona === "parent" ? "them" : "you"} into the "Target" band at several universities.`;
  } else if (p.ielts !== "done" && ieltsGated > 0) {
    insight = `${yours} ${p.scoreLabel ?? "score"} isn't the problem. IELTS is the biggest lever: a 7 band (vs 6.5) opens ${ieltsGated} more universities and better scholarship odds.`;
  } else {
    insight = `${p.persona === "parent" ? "This is a strong profile." : "You're a strong fit."} The edge now is a sharp SOP and applying early: scholarships at many universities close well before the final deadline.`;
  }

  const who = p.name ? `${p.name}'s` : p.persona === "parent" ? "Your child's" : "Your";
  return {
    title: `${who} ${country} Plan`,
    subtitle: `${degreeLabel(p.course)} · ${p.scoreLabel ?? ""}${p.scoreLabel ? " · " : ""}${info.duration}`,
    featured,
    all,
    scholarship,
    salary,
    insight,
    budgetNote,
    durationNote: info.durationNote,
  };
}
