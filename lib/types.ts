export type Persona = "student" | "parent";
export type Lang = "en" | "hi";
export type Country = "UK" | "USA" | "Canada" | "Germany" | "Ireland" | "Australia";
export type Course = "Data Science / AI" | "Computer Science" | "MBA / Business" | "Engineering" | "Other";
export type Budget = "u20" | "20_30" | "30_45" | "45p" | "loan";
export type Ielts = "done" | "not_yet" | "planning";
export type Chance = "Very high" | "High" | "Medium" | "Low";

export interface Profile {
  persona: Persona;
  lang: Lang;
  stage?: string;
  course?: Course;
  country?: Country;
  score?: number; // CGPA on a 10-point scale
  scoreLabel?: string; // what the user typed, e.g. "7.4" or "82%"
  gradYear?: string;
  ielts?: Ielts;
  budget?: Budget;
  name?: string;
}

export interface Match {
  id: string;
  name: string;
  city: string;
  tier: "Ambitious" | "Target" | "Safe";
  chance: Chance;
  totalLakh: number;
  ieltsMin: number;
  scholarship: boolean;
}

export interface Snapshot {
  title: string;
  subtitle: string;
  featured: Match[];
  all: Match[];
  scholarship: string;
  salary: string;
  insight: string;
  budgetNote?: string;
  durationNote: string;
}

export interface ChatMsg {
  id: string;
  from: "bot" | "me";
  text?: string;
  kind?: "text" | "insight" | "good" | "lock" | "source";
  source?: string;
  lockLabel?: string;
}
