/* WorthScope — Career Intelligence data model.
   The structured profile collected by the new post-sign-in onboarding flow
   (src/pages/Discover.tsx + src/components/discover/*). Kept fully separate
   from the older Answers/CareerResult pipeline (recommendationEngine.ts)
   that the static assessment and voice conversation still use. */

import { supabase } from "@/integrations/supabase/client";
import { streamKokoChat } from "@/lib/kokoClient";
import { scoreAllCareers, type Answers } from "@/lib/recommendationEngine";

export type CareerIntent =
  | "choosing"
  | "exploring"
  | "career-change"
  | "grow-current"
  | "earning-potential"
  | "opportunities";

export type ThinkingStyleTrait = { trait: string; selectionOrder: number };
export type CareerValue = { value: string; rank: number };

export type WorkStyle = {
  structure: "structured" | "flexible" | "";
  collaboration: "collaborative" | "independent" | "";
  execution: "accuracy" | "speed" | "";
  variety: "stability" | "variety" | "";
  ideasVsExecution: "ideas" | "execution" | "";
};

export type Commitment = {
  furtherEducation: boolean;
  certifications: boolean;
  practicalLearning: boolean;
  entryLevel: boolean;
  speedToIncome: boolean;
  careerChange: boolean;
  relocation: boolean;
  hasConstraints: boolean;
};

export type CareerIntelligenceProfile = {
  careerIntent: CareerIntent | "";
  personalContext: string; // free text, Koko extracts structure server-side at prediction time
  thinkingStyle: ThinkingStyleTrait[];
  preferredActivities: string[];
  workStyle: WorkStyle;
  careerValues: CareerValue[];
  commitment: Commitment;
  additionalContext: string;
  assessmentStatus: "in_progress" | "completed";
};

export function emptyProfile(): CareerIntelligenceProfile {
  return {
    careerIntent: "",
    personalContext: "",
    thinkingStyle: [],
    preferredActivities: [],
    workStyle: { structure: "", collaboration: "", execution: "", variety: "", ideasVsExecution: "" },
    careerValues: [],
    commitment: {
      furtherEducation: false,
      certifications: false,
      practicalLearning: false,
      entryLevel: false,
      speedToIncome: false,
      careerChange: false,
      relocation: false,
      hasConstraints: false,
    },
    additionalContext: "",
    assessmentStatus: "in_progress",
  };
}

const WIP_KEY = "worthscope_ci_wip";
const WIP_STEP_KEY = "worthscope_ci_wip_step";

export function saveWIP(profile: CareerIntelligenceProfile, step: string) {
  try {
    localStorage.setItem(WIP_KEY, JSON.stringify(profile));
    localStorage.setItem(WIP_STEP_KEY, step);
  } catch {
    // Best-effort — worst case the user just restarts the flow.
  }
}

export function loadWIP(): { profile: CareerIntelligenceProfile; step: string } | null {
  try {
    const raw = localStorage.getItem(WIP_KEY);
    const step = localStorage.getItem(WIP_STEP_KEY);
    if (!raw || !step) return null;
    return { profile: JSON.parse(raw), step };
  } catch {
    return null;
  }
}

export function clearWIP() {
  try {
    localStorage.removeItem(WIP_KEY);
    localStorage.removeItem(WIP_STEP_KEY);
  } catch {
    // Non-critical.
  }
}

export type CareerDirection = {
  title: string;
  whyItFits: string;
  whatYoullNeed: string;
  potentialChallenge: string;
};

export type CareerPrediction = {
  profileSummary: string;
  strongestSignals: { title: string; explanation: string }[];
  careerDirections: CareerDirection[];
  readiness: { category: "Exploring" | "Building" | "Developing" | "Job-Ready"; reasoning: string };
  nextStep: { label: string; cta: string };
  confidence?: { level: "strong" | "moderate" | "exploratory"; note: string };
};

function extractJson(raw: string): Record<string, unknown> | null {
  const cleaned = raw.replace(/^```(?:json)?/i, "").replace(/```$/i, "").trim();
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start < 0 || end <= start) return null;
  try {
    return JSON.parse(cleaned.slice(start, end + 1));
  } catch {
    return null;
  }
}

function describeProfile(p: CareerIntelligenceProfile): string {
  const lines: string[] = [];
  lines.push(`Career intent: ${p.careerIntent || "unspecified"}`);
  lines.push(`In their own words: ${p.personalContext || "(nothing provided)"}`);
  lines.push(`How they think (selected in order of how strongly it fits): ${p.thinkingStyle.map((t) => t.trait).join(", ") || "none selected"}`);
  lines.push(`Activities that keep them engaged: ${p.preferredActivities.join(", ") || "none selected"}`);
  lines.push(
    `Work style — structure: ${p.workStyle.structure || "unspecified"}, collaboration: ${p.workStyle.collaboration || "unspecified"}, execution: ${p.workStyle.execution || "unspecified"}, variety: ${p.workStyle.variety || "unspecified"}, ideas vs execution: ${p.workStyle.ideasVsExecution || "unspecified"}`,
  );
  lines.push(`Career values, ranked most to least important: ${p.careerValues.sort((a, b) => a.rank - b.rank).map((v) => v.value).join(", ") || "none ranked"}`);
  const commitmentLabels: Record<keyof Commitment, string> = {
    furtherEducation: "willing to pursue another degree",
    certifications: "prefers professional courses/certifications",
    practicalLearning: "prefers learning through projects and practice",
    entryLevel: "willing to start at entry level",
    speedToIncome: "needs to start earning relatively quickly",
    careerChange: "open to changing their current field",
    relocation: "open to relocating",
    hasConstraints: "has financial/educational/family/location/lifestyle/time constraints to consider",
  };
  const commitments = (Object.keys(p.commitment) as (keyof Commitment)[]).filter((k) => p.commitment[k]).map((k) => commitmentLabels[k]);
  lines.push(`Commitment/reality: ${commitments.join("; ") || "none specified"}`);
  if (p.additionalContext) lines.push(`Anything else they want considered: ${p.additionalContext}`);
  return lines.join("\n");
}

function isValidPrediction(p: unknown): p is CareerPrediction {
  const x = p as Partial<CareerPrediction> | null;
  return !!x && typeof x.profileSummary === "string" && Array.isArray(x.strongestSignals) &&
    Array.isArray(x.careerDirections) && x.careerDirections.length > 0 && !!x.readiness && !!x.nextStep;
}

// Offline fallback built on the rule-based engine, used when the AI prediction
// is unavailable (function not deployed, network/model failure). Engine keys
// are matched by substring, so the option labels and free text feed it directly.
export function fallbackPrediction(p: CareerIntelligenceProfile): CareerPrediction {
  let educationLevel: "secondary" | "university" | null = null;
  try {
    const stored = JSON.parse(localStorage.getItem("worthscope_user_profile") || "{}");
    if (stored.educationLevel === "secondary" || stored.educationLevel === "university") educationLevel = stored.educationLevel;
  } catch {
    // Education level just stays unknown.
  }
  const freeText = [p.personalContext, p.additionalContext].filter(Boolean).join(" ");
  const traits = p.thinkingStyle.map((t) => t.trait);
  const answers = {
    educationLevel,
    strongSubjects: [freeText],
    activities: p.preferredActivities,
    personalityTraits: traits,
    careerInclination: null,
    statedCareer: null,
    preferenceConflict: null,
    workTypes: [freeText],
    taskInterests: [...p.preferredActivities, freeText],
    outputPreference: null,
    goalOrConcern: freeText,
  } as unknown as Answers;
  const { scores, lowConfidence } = scoreAllCareers(answers);
  const maxScore = Math.max(1, ...scores.map((s) => s.score));
  const adj: Record<string, { pts: number; why: string[] }> = {};
  const bump = (titles: string, pts: number, why: string) => {
    for (const title of titles.split("|")) {
      const e = (adj[title] ||= { pts: 0, why: [] });
      e.pts += pts;
      if (!e.why.includes(why)) e.why.push(why);
    }
  };
  // 1) What the person actually wrote is the strongest signal — an explicit
  //    statement ("I want to make videos") must outweigh generic traits.
  const lexicon: Record<string, string[]> = {
    "Content Creator": ["content", "creator", "video", "youtube", "tiktok", "instagram", "influenc", "podcast", "vlog", "film", "editing", "stream", "blog", "music", "beat", "storytell", "social media", "camera", "photograph", "entertain", "comedy", "gaming"],
    "Digital Marketer": ["marketing", "brand", "advert", "seo", "campaign", "audience", "copywrit", "promot", "social media"],
    "UI/UX Designer": ["ui", "ux", "user experience", "interface", "figma", "wireframe", "app design", "product design"],
    "Graphic Designer": ["graphic", "logo", "illustrat", "poster", "branding", "photoshop", "canva", "typograph", "design", "draw", "art"],
    "Software Developer": ["code", "coding", "program", "software", "developer", "website", "web dev", "javascript", "python", "build apps", "app"],
    "Data Analyst": ["data", "analytic", "excel", "statistic", "dashboard", "sql", "insight", "research"],
    "Cybersecurity Analyst": ["security", "hack", "cyber", "privacy", "network", "protect"],
    "Product Manager": ["product manager", "roadmap", "coordinate", "team lead", "manage project", "strategy"],
    Entrepreneur: ["business", "startup", "own boss", "entrepreneur", "own company", "found", "my own"],
    "Financial Analyst": ["financ", "money", "accounting", "invest", "bank", "stock", "budget", "econom"],
    "Mechanical Engineer": ["mechanic", "engine", "machine", "robot", "hardware", "car", "engineering"],
  };
  const lower = freeText.toLowerCase();
  for (const [title, words] of Object.entries(lexicon)) {
    const hits = words.filter((k) => new RegExp(`\\b${k.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`).test(lower));
    if (hits.length) bump(title, Math.min(hits.length, 3) * 14, `you mentioned ${hits.slice(0, 2).join(" and ")}`);
  }

  // 2) What they said keeps them engaged (max 2 picks now, so each counts).
  const activityMap: Record<string, string> = {
    "Building or fixing things": "Mechanical Engineer:12|Software Developer:9|Cybersecurity Analyst:4",
    "Designing visuals or experiences": "UI/UX Designer:11|Graphic Designer:11|Content Creator:9",
    "Solving logical or technical problems": "Software Developer:10|Data Analyst:8|Cybersecurity Analyst:8|Mechanical Engineer:5",
    "Writing or storytelling": "Content Creator:12|Digital Marketer:8",
    "Analyzing data or patterns": "Data Analyst:12|Financial Analyst:10|Cybersecurity Analyst:4",
    "Leading or organizing people": "Product Manager:10|Entrepreneur:7",
    "Persuading or selling ideas": "Digital Marketer:10|Entrepreneur:7|Content Creator:5|Product Manager:4",
    "Helping or teaching others": "Content Creator:5|Product Manager:4|UI/UX Designer:3",
    "Researching and learning": "Data Analyst:6|Cybersecurity Analyst:5|Software Developer:4",
    "Planning and strategizing": "Product Manager:10|Financial Analyst:6|Entrepreneur:5|Digital Marketer:4",
  };
  for (const act of p.preferredActivities) {
    for (const part of (activityMap[act] ?? "").split("|").filter(Boolean)) {
      const [title, pts] = part.split(":");
      bump(title, Number(pts), `you enjoy ${act.toLowerCase()}`);
    }
  }

  // 3) How they think, weighted by the order they picked it.
  const traitMap: Record<string, string> = {
    "Logical & analytical": "Software Developer:6|Data Analyst:6|Cybersecurity Analyst:5|Financial Analyst:4",
    "Creative & expressive": "Content Creator:7|Graphic Designer:6|UI/UX Designer:6",
    "Big-picture thinker": "Product Manager:5|Entrepreneur:4",
    "Detail-oriented": "Data Analyst:4|Financial Analyst:4|Cybersecurity Analyst:4|Mechanical Engineer:4",
    "People-focused": "Product Manager:4|Digital Marketer:4|Content Creator:3",
    "Hands-on & practical": "Mechanical Engineer:6|Software Developer:3",
    "Strategic planner": "Product Manager:5|Financial Analyst:4|Entrepreneur:3",
    "Fast decision-maker": "Entrepreneur:3|Digital Marketer:3",
    "Curious & exploratory": "Data Analyst:3|Cybersecurity Analyst:3|Software Developer:3|Content Creator:2",
    "Calm under pressure": "Cybersecurity Analyst:3|Financial Analyst:3",
  };
  for (const tr of p.thinkingStyle) {
    const wt = tr.selectionOrder <= 1 ? 1 : tr.selectionOrder === 2 ? 0.8 : 0.6;
    for (const part of (traitMap[tr.trait] ?? "").split("|").filter(Boolean)) {
      const [title, pts] = part.split(":");
      bump(title, Math.round(Number(pts) * wt), `you think in a ${tr.trait.toLowerCase()} way`);
    }
  }

  // 4) Work style — small nudges only, and no single career is boosted by most of them.
  const w = p.workStyle;
  if (w.collaboration === "collaborative") bump("Product Manager|Digital Marketer", 4, "you do your best work with other people");
  if (w.collaboration === "independent") bump("Software Developer|Data Analyst|Graphic Designer|Content Creator|Cybersecurity Analyst", 4, "you do your best work on your own");
  if (w.execution === "accuracy") bump("Data Analyst|Financial Analyst|Cybersecurity Analyst|Mechanical Engineer", 4, "you value being careful and precise");
  if (w.execution === "speed") bump("Digital Marketer|Content Creator|Entrepreneur", 3, "you prefer moving fast and adapting");
  if (w.variety === "variety") bump("Digital Marketer|Content Creator|Product Manager", 3, "you like variety and change");
  if (w.variety === "stability") bump("Financial Analyst|Data Analyst|Mechanical Engineer|Cybersecurity Analyst", 4, "you prefer a stable, predictable routine");
  if (w.structure === "structured") bump("Financial Analyst|Data Analyst|Mechanical Engineer|Cybersecurity Analyst", 3, "you like a clear structure and plan");
  if (w.structure === "flexible") bump("Content Creator|Graphic Designer|UI/UX Designer", 3, "you like room to figure things out");
  if (w.ideasVsExecution === "ideas") bump("Product Manager|UI/UX Designer|Graphic Designer|Content Creator", 3, "you get energy from coming up with ideas");
  if (w.ideasVsExecution === "execution") bump("Software Developer|Mechanical Engineer|Cybersecurity Analyst|Data Analyst", 4, "you get energy from making things happen");

  // 5) Values, weighted by rank.
  const valueMap: Record<string, [string, string]> = {
    "High earning potential": ["Software Developer|Financial Analyst|Cybersecurity Analyst|Data Analyst|Product Manager", "earning potential matters to you"],
    "Job security": ["Financial Analyst|Cybersecurity Analyst|Mechanical Engineer|Data Analyst|Software Developer", "job security matters to you"],
    "Creative freedom": ["UI/UX Designer|Graphic Designer|Content Creator", "creative freedom matters to you"],
    "Work-life balance": ["Financial Analyst|Data Analyst|Mechanical Engineer|Graphic Designer", "work-life balance matters to you"],
    "Making a real impact": ["Product Manager|Mechanical Engineer|Cybersecurity Analyst", "making a real impact matters to you"],
    "Continuous learning": ["Software Developer|Data Analyst|Cybersecurity Analyst", "continuous learning matters to you"],
    "Leadership opportunities": ["Product Manager|Entrepreneur|Digital Marketer", "leadership matters to you"],
    "Flexibility & remote work": ["Software Developer|UI/UX Designer|Graphic Designer|Content Creator|Digital Marketer|Data Analyst", "flexibility and remote work matter to you"],
    "Recognition & status": ["Content Creator|Entrepreneur|Product Manager", "recognition matters to you"],
    "Innovation & cutting-edge work": ["Software Developer|Data Analyst|Cybersecurity Analyst|UI/UX Designer", "cutting-edge work matters to you"],
    "Helping others directly": ["Product Manager|UI/UX Designer", "helping others matters to you"],
  };
  for (const v of p.careerValues) {
    const m = valueMap[v.value];
    if (m) bump(m[0], v.rank === 1 ? 5 : v.rank === 2 ? 4 : v.rank === 3 ? 3 : 2, m[1]);
  }
  const ranked = scores
    .map((s) => {
      const e = adj[s.title];
      return { ...s, total: (s.score / maxScore) * 40 + (e?.pts ?? 0), why: e?.why.slice(0, 2) ?? [] };
    })
    .sort((a, b) => b.total - a.total);
  const results = ranked.slice(0, 3);
  const gap = results[0].total - (ranked[3]?.total ?? 0);
  const rich = p.preferredActivities.length + p.thinkingStyle.length + p.careerValues.length + (freeText.length > 40 ? 2 : 0);
  const confidence: CareerPrediction["confidence"] =
    lowConfidence || rich < 5 || gap < 8
      ? { level: "exploratory", note: "Your answers point in a few directions at once, so treat these as ideas to test, not conclusions." }
      : gap > 22
        ? { level: "strong", note: "Several of your answers pointed the same way." }
        : { level: "moderate", note: "There's a clear lean, but a couple of these are close — try a small project in each." };
  const c = p.commitment;
  const flexible = [c.furtherEducation, c.certifications, c.practicalLearning, c.entryLevel, c.careerChange].filter(Boolean).length;
  const category: CareerPrediction["readiness"]["category"] = flexible >= 4 ? "Developing" : flexible >= 2 ? "Building" : "Exploring";
  const need = c.practicalLearning
    ? "Hands-on projects and practice, starting with the fundamentals."
    : c.certifications
      ? "A focused course or certification to build the core skills."
      : "Core fundamentals first, then real projects to prove them.";
  const constraint = c.hasConstraints || c.speedToIncome
    ? "You mentioned time or money constraints, so a lower-cost, faster route matters here."
    : "Building a portfolio of real work takes steady effort over time.";
  const valueOrder = [...p.careerValues].sort((a, b) => a.rank - b.rank).map((v) => v.value.toLowerCase());

  return {
    profileSummary: `Your responses suggest you're drawn to ${p.preferredActivities.slice(0, 2).join(" and ").toLowerCase() || "a mix of activities"}, and you describe your thinking as ${traits.slice(0, 2).join(" and ").toLowerCase() || "flexible"}${valueOrder[0] ? `, with ${valueOrder[0]} ranking highest for you` : ""}.`,
    strongestSignals: [
      ...p.thinkingStyle.slice(0, 2).map((t) => ({ title: t.trait, explanation: "One of the ways you said you think best." })),
      ...p.preferredActivities.slice(0, 2).map((a) => ({ title: a, explanation: "An activity you said keeps you engaged." })),
    ].slice(0, 4),
    confidence,
    careerDirections: results.map((r) => ({
      title: r.title,
      whyItFits: `${r.description}${r.why.length ? ` Your answers suggest this could suit you because ${r.why.join(" and ")}.` : ""}`,
      whatYoullNeed: need,
      potentialChallenge: constraint,
    })),
    readiness: {
      category,
      reasoning: "Based on how open you are to learning, starting small and changing direction — this could shift as you build skills.",
    },
    nextStep: { label: "Start with the strongest direction", cta: "Pick the first direction below and let Koko build your step-by-step roadmap." },
  };
}

export async function submitForPrediction(profile: CareerIntelligenceProfile): Promise<CareerPrediction> {
  const transcript = describeProfile(profile);
  let acc = "";
  let prediction: CareerPrediction;
  try {
    await new Promise<void>((resolve, reject) => {
      streamKokoChat({
        messages: [{ role: "user", content: transcript }],
        intent: "career-predict",
        onDelta: (chunk) => {
          acc += chunk;
        },
        onDone: () => resolve(),
        onError: (err) => reject(err),
      });
    });
    const parsed = extractJson(acc);
    if (!isValidPrediction(parsed)) throw new Error("invalid prediction");
    prediction = parsed;
  } catch {
    prediction = fallbackPrediction(profile);
  }

  try {
    localStorage.setItem("worthscope_ci_prediction", JSON.stringify(prediction));
  } catch {
    // Best-effort cache only — Supabase write below is the real persistence.
  }

  try {
    const { data: u } = await supabase.auth.getUser();
    if (u.user) {
      // career_intelligence_profiles isn't in the generated Supabase types yet.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase as any).from("career_intelligence_profiles").upsert(
        {
          user_id: u.user.id,
          career_intent: profile.careerIntent || null,
          profile,
          prediction,
          assessment_status: "completed",
          completed_at: new Date().toISOString(),
        },
        { onConflict: "user_id" },
      );
    }
  } catch {
    // Non-critical — the prediction is already cached to localStorage above.
  }

  clearWIP();
  return prediction;
}

export function loadCachedPrediction(): CareerPrediction | null {
  try {
    const raw = localStorage.getItem("worthscope_ci_prediction");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}
