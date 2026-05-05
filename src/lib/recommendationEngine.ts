/* WorthScope — Career Recommendation Engine v2 (CRS Master Spec)
 * 11 careers, weighted MCDM, keyword + NLP boosting, anti-tie logic,
 * confidence-adjusted normalization. Side-effect free except localStorage.
 */

export type Answers = {
  // Identity / context (Q1, Q2)
  fullName?: string;
  firstName?: string;
  age?: number | null;
  ageRange?: string | null;
  educationLevel: "secondary" | "university" | null;
  classOrLevel?: string | null;

  // Q3 strongSubjects (multi, up to 3) — 15%
  strongSubjects: string[];
  // Q4 activities (multi, up to 2) — 20%
  activities: string[];
  // Q5 preferenceConflict (single) — 25% PRIMARY DIFFERENTIATOR
  preferenceConflict: string | null;
  // Q6 taskInterests (multi, up to 2) — 15%
  taskInterests: string[];
  // Q7 outputPreference (multi up to 2 per spec; we accept array OR legacy single) — 15%
  outputPreference: string | null;
  outputPreferences?: string[];
  // Q8 careerInclination + statedCareer — 5%
  careerInclination: string | null;
  statedCareer: string | null;
  // Q9 branch experience — 5%
  experienceItems?: string[];
  courseAlignment?: string | null;
  // Q10 free text NLP — flat boost
  goalOrConcern: string;

  // Legacy compat (unused by new model but kept for type stability)
  interests?: string[];
  personality?: string | null;
  careerConfidence?: string | null;
  careerInclinationLegacy?: string | null;
  preferenceConflictLegacy?: string | null;
  schoolClass?: string | null;
  skillsStarted?: string | null;
  uniLevel?: string | null;
};

export type CategoryKey =
  | "tech" | "creative" | "business" | "science" | "people" | "communication";

export type CareerResult = {
  rank: number;
  title: string;
  percentage: number;
  description: string;
  matchReason: string;
  icon: string;
  category: CategoryKey;
};

/* ============ CAREER PROFILES (11) ============ */

type CareerProfile = {
  id: string;
  title: string;
  category: CategoryKey;
  icon: string;
  description: string;
};

const CAREERS: CareerProfile[] = [
  { id: "UIUX", title: "UI/UX Designer", category: "creative", icon: "design",
    description: "Design intuitive digital experiences that people genuinely love using." },
  { id: "SOFTDEV", title: "Software Developer", category: "tech", icon: "code",
    description: "Build applications and systems that power the digital world." },
  { id: "DATA", title: "Data Analyst", category: "tech", icon: "chart",
    description: "Turn raw data into clear insights that drive smarter decisions." },
  { id: "GRAPHD", title: "Graphic Designer", category: "creative", icon: "palette",
    description: "Communicate ideas visually through compelling, purposeful design." },
  { id: "PM", title: "Product Manager", category: "business", icon: "briefcase",
    description: "Lead the strategy and vision behind products that millions of people use." },
  { id: "ENTREP", title: "Entrepreneur", category: "business", icon: "rocket",
    description: "Build your own business and create real value from the ground up." },
  { id: "CYBER", title: "Cybersecurity Analyst", category: "tech", icon: "shield",
    description: "Protect digital systems and data from threats and attacks." },
  { id: "DIGIMKT", title: "Digital Marketer", category: "communication", icon: "megaphone",
    description: "Grow brands and audiences through creative, data-driven online strategies." },
  { id: "FINTECH", title: "Financial Analyst", category: "business", icon: "money",
    description: "Guide financial decisions with data-driven insight and clear analysis." },
  { id: "CONTENT", title: "Content Creator", category: "communication", icon: "video",
    description: "Build audiences and brands through engaging, original digital content." },
  { id: "MECHENG", title: "Mechanical Engineer", category: "science", icon: "wrench",
    description: "Design, analyse, and build the physical systems that move the world." },
];

const byId = (id: string) => id;

/* ============ SIGNAL TABLES ============
 * Map an answer label substring to {careerId: points}.
 * The substring matcher tolerates emoji prefixes from the Assessment options.
 */
type SigMap = Record<string, Partial<Record<string, number>>>;

// Q3 — strong subjects (15%)
const Q3_SIGNALS: SigMap = {
  "Mathematics":           { SOFTDEV: 2, DATA: 2, MECHENG: 2, FINTECH: 2, CYBER: 1 },
  "Sciences":              { MECHENG: 3, CYBER: 1, DATA: 1 },
  "Arts":                  { CONTENT: 3, GRAPHD: 2, DIGIMKT: 2, UIUX: 1 },
  "Business":              { ENTREP: 3, FINTECH: 3, PM: 2, DIGIMKT: 1 },
  "Technology":            { SOFTDEV: 3, CYBER: 3, DATA: 2, UIUX: 1 },
  "Social Sciences":       { PM: 2, CONTENT: 2, DIGIMKT: 1, UIUX: 2 },
  "Design":                { UIUX: 3, GRAPHD: 3, CONTENT: 1 },
};

// Q4 — activities you genuinely enjoy (20%)
const Q4_SIGNALS: SigMap = {
  "Solving":               { SOFTDEV: 3, DATA: 3, CYBER: 3, MECHENG: 2 }, // "Solving problems / puzzles"
  "Creating or designing": { UIUX: 3, GRAPHD: 3, CONTENT: 2 },
  "designing visuals":     { UIUX: 3, GRAPHD: 3, CONTENT: 2 },
  "Building":              { MECHENG: 3, SOFTDEV: 2, CYBER: 2 },
  "Leading":               { PM: 3, ENTREP: 3, DIGIMKT: 1 },
  "organizing":            { PM: 3, ENTREP: 3, DIGIMKT: 1 },
  "Talking":               { CONTENT: 2, PM: 2, ENTREP: 2, DIGIMKT: 1 },
  "Working with others":   { CONTENT: 2, PM: 2, ENTREP: 2, DIGIMKT: 1 },
  "Researching":           { DATA: 3, FINTECH: 3, CYBER: 2, CONTENT: 1 },
  "Learning":              { DATA: 1, SOFTDEV: 1, MECHENG: 1, CYBER: 1 },
  "Working independently": { SOFTDEV: 1, CYBER: 1, DATA: 1, MECHENG: 1 },
};

// Q5 — single primary differentiator (25%)
const Q5_SIGNALS: SigMap = {
  "Build systems":          { SOFTDEV: 5, CYBER: 2 },
  "Build apps":             { SOFTDEV: 5, CYBER: 2 },
  "Design and create":      { UIUX: 5, GRAPHD: 2 },
  "Designing experiences":  { UIUX: 5, GRAPHD: 2 },
  "Start, lead":            { ENTREP: 5, PM: 3 },
  "Starting, growing":      { ENTREP: 5, PM: 3 },
  "Solving physical":       { MECHENG: 5 },
  "mechanical":             { MECHENG: 5 },
  "Analyse data":           { DATA: 4, FINTECH: 4 },
  "Analyzing data":         { DATA: 4, FINTECH: 4 },
  "Growing brands":         { DIGIMKT: 4, CONTENT: 4, ENTREP: 1 },
  "Work with people":       { PM: 3, CONTENT: 3, ENTREP: 2 },
  "Working with people":    { PM: 3, CONTENT: 3, ENTREP: 2 },
  "Research, discover":     { DATA: 3, MECHENG: 2, CYBER: 1 },
};

// Q6 — daily tasks (15%)
const Q6_SIGNALS: SigMap = {
  "Designing apps":          { UIUX: 4 },
  "interfaces":              { UIUX: 4 },
  "Writing code":            { SOFTDEV: 4, CYBER: 2 },
  "Writing and debugging":   { SOFTDEV: 4, CYBER: 2 },
  "Creating content":        { CONTENT: 4, DIGIMKT: 3 },
  "Creating logos":          { GRAPHD: 4, DIGIMKT: 1 },
  "logos, posters":          { GRAPHD: 4, DIGIMKT: 1 },
  "Solving logical":         { SOFTDEV: 2, CYBER: 4, MECHENG: 3, DATA: 1 },
  "technical / logic":       { SOFTDEV: 2, CYBER: 4, MECHENG: 3, DATA: 1 },
  "Managing":                { PM: 4, ENTREP: 2 },
  "organising projects":     { PM: 4, ENTREP: 2 },
  "Researching":             { DATA: 4, FINTECH: 4, CONTENT: 1 },
  "analysing data":          { DATA: 4, FINTECH: 4 },
  "Writing, filming":        { CONTENT: 4, DIGIMKT: 3 },
  "Planning marketing":      { DIGIMKT: 4, ENTREP: 2 },
  "campaigns":               { DIGIMKT: 4, ENTREP: 2 },
};

// Q7 — desired output (15%)
const Q7_SIGNALS: SigMap = {
  "app or software":         { SOFTDEV: 4, UIUX: 2 },
  "finished app":            { SOFTDEV: 4, UIUX: 2 },
  "beautiful":               { GRAPHD: 4, UIUX: 2 },
  "visual design":           { GRAPHD: 4, UIUX: 2 },
  "brand identity":          { GRAPHD: 4, UIUX: 2 },
  "growing business":        { ENTREP: 4, PM: 3, DIGIMKT: 1 },
  "business or product":     { ENTREP: 4, PM: 3, DIGIMKT: 1 },
  "physical machine":        { MECHENG: 5 },
  "structure, or system":    { MECHENG: 5 },
  "data report":             { DATA: 4, FINTECH: 4 },
  "report, dashboard":       { DATA: 4, FINTECH: 4 },
  "report or insight":       { DATA: 4, FINTECH: 4 },
  "secured system":          { CYBER: 5 },
  "stops attacks":           { CYBER: 5 },
  "viral post":              { CONTENT: 4, DIGIMKT: 3 },
  "audience":                { CONTENT: 4, DIGIMKT: 3 },
  "Content or ideas":        { CONTENT: 4, DIGIMKT: 3 },
  "Satisfied users":         { PM: 3, UIUX: 2, CONTENT: 1 },
  "person or community":     { PM: 3, CONTENT: 1 },
};

// Q8 — keyword mapping for stated career
const KW_MAP: { kws: string[]; id: string }[] = [
  { kws: ["design","figma","ux","ui","interface","interaction"], id: "UIUX" },
  { kws: ["code","developer","programming","python","javascript","web","engineer software","frontend","backend","fullstack"], id: "SOFTDEV" },
  { kws: ["data","excel","sql","analysis","analytics","analyst data"], id: "DATA" },
  { kws: ["graphic","brand","logo","illustrator","photoshop"], id: "GRAPHD" },
  { kws: ["product manager","pm","product","agile","roadmap"], id: "PM" },
  { kws: ["business","startup","entrepreneur","ceo","hustle","founder"], id: "ENTREP" },
  { kws: ["security","hacking","cyber","network","ethical","pentest"], id: "CYBER" },
  { kws: ["marketing","seo","ads","social media","campaign"], id: "DIGIMKT" },
  { kws: ["finance","stocks","investment","accounting","fintech","banking"], id: "FINTECH" },
  { kws: ["content","creator","youtube","tiktok","write","video","blogger","influencer"], id: "CONTENT" },
  { kws: ["engineering","mechanical","hardware","physics","cad","robot"], id: "MECHENG" },
];

// Q10 — NLP themes
const NLP_THEMES: { kws: string[]; boost: Partial<Record<string, number>> }[] = [
  { kws: ["design","beautiful","visual","aesthetic","creative"], boost: { UIUX: 3, GRAPHD: 3 } },
  { kws: ["build","code","app","software","systems","engineer"],  boost: { SOFTDEV: 3, MECHENG: 2 } },
  { kws: ["data","numbers","analyze","analyse","pattern","insight","report"], boost: { DATA: 3, FINTECH: 2 } },
  { kws: ["people","help","impact","community","teach"],          boost: { CONTENT: 2, PM: 2 } },
  { kws: ["money","business","rich","startup","income","grow"],   boost: { ENTREP: 3, FINTECH: 2 } },
  { kws: ["brand","audience","social media","market","influence"],boost: { DIGIMKT: 3, CONTENT: 3 } },
  { kws: ["security","protect","hack","network","safe"],          boost: { CYBER: 3 } },
  { kws: ["express","story","video","write","voice"],             boost: { CONTENT: 3, DIGIMKT: 1 } },
];

/* ============ HELPERS ============ */

const stripEmoji = (s: string) =>
  s.replace(/^(\p{Emoji_Presentation}|\p{Extended_Pictographic})\s*/u, "").trim();

function norm(s: string): string { return stripEmoji(s).toLowerCase(); }

function applySignals(scores: Record<string, number>, label: string, table: SigMap, weight = 1) {
  const t = norm(label);
  for (const [key, mp] of Object.entries(table)) {
    if (t.includes(key.toLowerCase())) {
      for (const [cid, pts] of Object.entries(mp)) {
        scores[cid] = (scores[cid] || 0) + (pts as number) * weight;
      }
    }
  }
}

function applyMulti(scores: Record<string, number>, items: string[] | undefined, table: SigMap, weight = 1) {
  for (const it of items || []) applySignals(scores, it, table, weight);
}

function applyKeyword(scores: Record<string, number>, text: string) {
  const t = text.toLowerCase();
  let matched = false;
  for (const m of KW_MAP) {
    if (m.kws.some((k) => t.includes(k))) {
      scores[m.id] = (scores[m.id] || 0) + 5;
      // adjacent +2: same category
      const target = CAREERS.find((c) => c.id === m.id)!;
      for (const c of CAREERS) {
        if (c.id !== m.id && c.category === target.category) {
          scores[c.id] = (scores[c.id] || 0) + 2;
        }
      }
      matched = true;
    }
  }
  return matched;
}

function applyNLP(scores: Record<string, number>, text: string): boolean {
  if (!text || text.trim().length < 3) return false;
  const t = text.toLowerCase();
  let matched = false;
  for (const theme of NLP_THEMES) {
    if (theme.kws.some((k) => t.includes(k))) {
      for (const [cid, pts] of Object.entries(theme.boost)) {
        scores[cid] = (scores[cid] || 0) + (pts as number);
      }
      matched = true;
    }
  }
  return matched;
}

/* ============ MAIN SCORER ============ */

const W = { q3: 0.15, q4: 0.20, q5: 0.25, q6: 0.15, q7: 0.15, q8: 0.05, q9: 0.05 };

export function generateCareerResults(a: Answers): CareerResult[] {
  // Per-question score buckets (so we can apply individual weights)
  const q3: Record<string, number> = {};
  const q4: Record<string, number> = {};
  const q5: Record<string, number> = {};
  const q6: Record<string, number> = {};
  const q7: Record<string, number> = {};
  const q8: Record<string, number> = {};
  const q9: Record<string, number> = {};
  const flat: Record<string, number> = {};

  applyMulti(q3, a.strongSubjects, Q3_SIGNALS);
  applyMulti(q4, a.activities, Q4_SIGNALS);
  if (a.preferenceConflict) applySignals(q5, a.preferenceConflict, Q5_SIGNALS);
  applyMulti(q6, a.taskInterests, Q6_SIGNALS);
  // Q7 outputs: prefer array, fall back to single
  const q7List = (a.outputPreferences && a.outputPreferences.length)
    ? a.outputPreferences
    : (a.outputPreference ? [a.outputPreference] : []);
  applyMulti(q7, q7List, Q7_SIGNALS);

  // Q8 keyword
  if (a.statedCareer && a.statedCareer.trim().length >= 2) {
    applyKeyword(q8, a.statedCareer);
  }

  // Q9 experience items: small ±2 nudges via simple theme matching
  for (const it of a.experienceItems || []) {
    const t = it.toLowerCase();
    if (/(design|poster|logo|app screen)/.test(t)) { q9.UIUX = (q9.UIUX || 0) + 2; q9.GRAPHD = (q9.GRAPHD || 0) + 1; }
    if (/(code|script|program)/.test(t))            { q9.SOFTDEV = (q9.SOFTDEV || 0) + 2; q9.CYBER = (q9.CYBER || 0) + 1; }
    if (/(business|hustle|sold|sell)/.test(t))      { q9.ENTREP = (q9.ENTREP || 0) + 2; q9.DIGIMKT = (q9.DIGIMKT || 0) + 1; }
    if (/(built|fix|physical|hardware)/.test(t))    { q9.MECHENG = (q9.MECHENG || 0) + 2; q9.SOFTDEV = (q9.SOFTDEV || 0) + 1; }
    if (/(research|analyz|data)/.test(t))           { q9.DATA = (q9.DATA || 0) + 2; q9.FINTECH = (q9.FINTECH || 0) + 1; }
    if (/(content|video|online|post)/.test(t))      { q9.CONTENT = (q9.CONTENT || 0) + 2; q9.DIGIMKT = (q9.DIGIMKT || 0) + 1; }
  }
  // Course alignment for university users
  if (a.educationLevel === "university" && a.courseAlignment) {
    const al = a.courseAlignment.toLowerCase();
    const nudge = al.includes("yes") ? 2 : al.includes("somewhat") ? 1 : 0;
    if (nudge && a.statedCareer) {
      // Apply the nudge to whichever career Q8 keyword matched (top of q8)
      const top = Object.entries(q8).sort((x, y) => y[1] - x[1])[0];
      if (top) q9[top[0]] = (q9[top[0]] || 0) + nudge;
    }
  }

  // Q10 NLP — flat boost (not weighted), or neutral +1 if no signals
  const nlpHit = applyNLP(flat, a.goalOrConcern || "");
  if (!nlpHit) for (const c of CAREERS) flat[c.id] = (flat[c.id] || 0) + 1;

  // Combine with weights
  const total: Record<string, number> = {};
  for (const c of CAREERS) {
    const id = c.id;
    total[id] =
      (q3[id] || 0) * W.q3 +
      (q4[id] || 0) * W.q4 +
      (q5[id] || 0) * W.q5 +
      (q6[id] || 0) * W.q6 +
      (q7[id] || 0) * W.q7 +
      (q8[id] || 0) * W.q8 +
      (q9[id] || 0) * W.q9 +
      (flat[id] || 0);
  }

  // Tiebreakers: Q5 > Q4 > Q7
  const tiebreak = (a: string, b: string) =>
    (q5[b] || 0) - (q5[a] || 0) ||
    (q4[b] || 0) - (q4[a] || 0) ||
    (q7[b] || 0) - (q7[a] || 0);

  let ranked = CAREERS.slice().sort((ca, cb) => {
    const diff = (total[cb.id] || 0) - (total[ca.id] || 0);
    if (Math.abs(diff) <= 3) return tiebreak(ca.id, cb.id);
    return diff;
  });

  const top4 = ranked.slice(0, 4);

  // Confidence detection — focused vs spread
  const sortedScores = ranked.map((c) => total[c.id] || 0);
  const top = sortedScores[0] || 1;
  const second = sortedScores[1] || 0;
  const focused = top > 0 && (top - second) / top > 0.18;

  // Map raw scores to displayed percentages per spec
  const bands = focused
    ? [[72, 88], [45, 65], [25, 40], [10, 25]]
    : [[55, 68], [48, 60], [35, 50], [20, 35]];

  const seed = Math.abs(hashStr(JSON.stringify(a))) || 1;
  const rand = seededRand(seed);

  const percents: number[] = [];
  let prev = 100;
  top4.forEach((c, i) => {
    const [lo, hi] = bands[i];
    let pct = Math.round(lo + rand() * (hi - lo));
    // Ensure strictly descending
    if (pct >= prev) pct = prev - 2;
    percents.push(pct);
    prev = pct;
  });

  const results: CareerResult[] = top4.map((c, i) => ({
    rank: i + 1,
    title: c.title,
    percentage: percents[i],
    description: c.description,
    matchReason: buildReason(c, a, { q5, q4, q7, q6, q3 }),
    icon: c.icon,
    category: c.category,
  }));

  // eslint-disable-next-line no-console
  console.log("=== WorthScope CRS v2 ===");
  // eslint-disable-next-line no-console
  console.log("Totals:", Object.fromEntries(Object.entries(total).map(([k, v]) => [k, +v.toFixed(2)])));
  // eslint-disable-next-line no-console
  console.log("Final top 4:", results);

  if (typeof window !== "undefined") {
    localStorage.setItem("worthscope_results", JSON.stringify(results));
  }

  return results;
}

function buildReason(
  c: CareerProfile,
  a: Answers,
  parts: { q5: Record<string, number>; q4: Record<string, number>; q7: Record<string, number>; q6: Record<string, number>; q3: Record<string, number> }
): string {
  const reasons: string[] = [];
  if (a.preferenceConflict && (parts.q5[c.id] || 0) > 0) {
    reasons.push(`you'd rather ${stripEmoji(a.preferenceConflict).toLowerCase()}`);
  }
  if ((a.activities || []).length && (parts.q4[c.id] || 0) > 0) {
    const hit = (a.activities || []).map(stripEmoji).find((act) =>
      Object.keys(Q4_SIGNALS).some((k) => act.toLowerCase().includes(k.toLowerCase()) && (Q4_SIGNALS[k][c.id] || 0) > 0)
    );
    if (hit) reasons.push(`your interest in ${hit.toLowerCase()}`);
  }
  if ((parts.q7[c.id] || 0) > 0) {
    const out = a.outputPreferences?.[0] || a.outputPreference;
    if (out) reasons.push(`wanting to produce ${stripEmoji(out).toLowerCase()}`);
  }
  if (reasons.length === 0 && (a.strongSubjects || []).length) {
    reasons.push(`your strength in ${stripEmoji(a.strongSubjects[0]).toLowerCase()}`);
  }
  const top2 = reasons.slice(0, 2);
  if (top2.length === 0) return "Aligns with your overall profile.";
  if (top2.length === 1) return `Matches ${top2[0]}.`;
  return `Matches ${top2[0]} and ${top2[1]}.`;
}

/* ============ utils ============ */
function hashStr(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) | 0;
  return h;
}
function seededRand(seed: number) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

/* ============ persistence ============ */
export const FALLBACK_RESULTS: CareerResult[] = [
  { rank: 1, title: "UI/UX Designer", percentage: 82, description: "Design intuitive digital experiences that people genuinely love using.", matchReason: "Matches your design interest.", icon: "design", category: "creative" },
  { rank: 2, title: "Software Developer", percentage: 60, description: "Build applications and systems that power the digital world.", matchReason: "Matches your problem-solving strength.", icon: "code", category: "tech" },
  { rank: 3, title: "Digital Marketer", percentage: 38, description: "Grow brands and audiences through creative, data-driven online strategies.", matchReason: "Matches your communication interest.", icon: "megaphone", category: "communication" },
  { rank: 4, title: "Data Analyst", percentage: 22, description: "Turn raw data into clear insights that drive smarter decisions.", matchReason: "Matches your analytical strengths.", icon: "chart", category: "tech" },
];

export function loadResults(): CareerResult[] {
  if (typeof window === "undefined") return FALLBACK_RESULTS;
  try {
    const raw = localStorage.getItem("worthscope_results");
    if (!raw) return FALLBACK_RESULTS;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length === 4) return parsed;
  } catch { /* ignore */ }
  return FALLBACK_RESULTS;
}
