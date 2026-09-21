/* Flattened keyword vocabularies from recommendationEngine.ts's signal tables.
   Both discovery paths (chat extraction + voice tool-call) must constrain
   their scored answers to these exact strings — free-text paraphrasing
   scores zero against generateCareerResults()'s substring matching. */
import { Q1_SIGNALS, Q3_SIGNALS, Q4_SIGNALS, Q5_SIGNALS, Q6_SIGNALS, Q7_SIGNALS, Q8_SIGNALS } from "./recommendationEngine";

export const SUBJECT_KEYWORDS = Object.keys(Q1_SIGNALS);
export const ACTIVITY_KEYWORDS = Object.keys(Q3_SIGNALS);
export const WORK_TYPE_KEYWORDS = Object.keys(Q4_SIGNALS);
export const TASK_KEYWORDS = Object.keys(Q5_SIGNALS);
export const OUTPUT_KEYWORDS = Object.keys(Q6_SIGNALS);
export const PERSONALITY_KEYWORDS = Object.keys(Q7_SIGNALS);
export const DIFFERENTIATOR_KEYWORDS = Object.keys(Q8_SIGNALS);

function keep(values: unknown, allowed: string[]): string[] {
  if (!Array.isArray(values)) return [];
  const allowedSet = new Set(allowed);
  return values.filter((v): v is string => typeof v === "string" && allowedSet.has(v));
}

/* Extracted answers arrive as loosely-typed JSON from an LLM — this strips
   anything outside the known vocabulary rather than trusting it outright. */
export type ExtractedDiscoveryAnswers = {
  strongSubjects?: unknown;
  activities?: unknown;
  workTypes?: unknown;
  taskInterests?: unknown;
  outputPreferences?: unknown;
  personalityTraits?: unknown;
  differentiation?: unknown;
  goalOrConcern?: unknown;
  statedCareer?: unknown;
  emotionalNotes?: unknown;
};

/* Tolerant JSON parse for a model response that should be pure JSON but may
   arrive wrapped in code fences or with stray text — same technique already
   used by kokoRoadmap.ts's extractJson(). */
export function extractJsonObject(raw: string): Record<string, unknown> | null {
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

export function sanitizeDiscoveryAnswers(raw: ExtractedDiscoveryAnswers) {
  const differentiation =
    typeof raw.differentiation === "string" && DIFFERENTIATOR_KEYWORDS.includes(raw.differentiation) ? raw.differentiation : null;
  return {
    strongSubjects: keep(raw.strongSubjects, SUBJECT_KEYWORDS),
    activities: keep(raw.activities, ACTIVITY_KEYWORDS),
    workTypes: keep(raw.workTypes, WORK_TYPE_KEYWORDS),
    taskInterests: keep(raw.taskInterests, TASK_KEYWORDS),
    outputPreferences: keep(raw.outputPreferences, OUTPUT_KEYWORDS),
    personalityTraits: keep(raw.personalityTraits, PERSONALITY_KEYWORDS),
    differentiation,
    goalOrConcern: typeof raw.goalOrConcern === "string" ? raw.goalOrConcern : "",
    statedCareer: typeof raw.statedCareer === "string" ? raw.statedCareer : null,
    emotionalNotes: typeof raw.emotionalNotes === "string" ? raw.emotionalNotes : null,
  };
}
