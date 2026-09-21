/* Tester feedback on career predictions ("Was Koko's read right?").
   Sends to two optional places; each is best-effort and never blocks the UI:
   1. Supabase table `career_feedback` (see supabase/migrations/…career_feedback.sql)
   2. A Google Form, if FEEDBACK_FORM below is filled in (works with no backend access):
      - Create a Google Form with short-answer questions for: verdict, top pick,
        expected career, comment, confidence, and a long-answer for details.
      - Open "Get pre-filled link", fill dummy answers, copy the link, and copy the
        form ID and each entry.NNNN number into FEEDBACK_FORM. */

import { supabase } from "@/integrations/supabase/client";
import type { CareerPrediction } from "@/lib/careerIntelligence";

export type Verdict = "spot-on" | "partly" | "not-really";

export const FEEDBACK_FORM: {
  formId: string;
  fields: { verdict: string; topPick: string; expected: string; comment: string; confidence: string; details: string };
} = {
  formId: "", // e.g. "1FAIpQLSc…"
  fields: { verdict: "", topPick: "", expected: "", comment: "", confidence: "", details: "" }, // e.g. "entry.1234567890"
};

const SENT_KEY = "worthscope_ci_feedback_sent";

function predictionKey(p: CareerPrediction): string {
  return p.profileSummary.slice(0, 60);
}

export function feedbackAlreadySent(p: CareerPrediction): boolean {
  try {
    return localStorage.getItem(SENT_KEY) === predictionKey(p);
  } catch {
    return false;
  }
}

export type FeedbackInput = {
  verdict: Verdict;
  expectedCareer: string;
  comment: string;
  prediction: CareerPrediction;
  profile: unknown;
};

export async function submitFeedback(f: FeedbackInput): Promise<void> {
  const topPick = f.prediction.careerDirections[0]?.title ?? "";
  const directions = f.prediction.careerDirections.map((d) => d.title);
  const confidence = f.prediction.confidence?.level ?? "";

  // 1) Supabase (table may not exist yet — ignore failures).
  try {
    const { data: u } = await supabase.auth.getUser();
    // career_feedback isn't in the generated Supabase types.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any).from("career_feedback").insert({
      user_id: u.user?.id ?? null,
      verdict: f.verdict,
      top_pick: topPick,
      directions,
      expected_career: f.expectedCareer || null,
      comment: f.comment || null,
      confidence,
      profile: f.profile ?? null,
    });
  } catch {
    // Non-critical.
  }

  // 2) Google Form (optional).
  const { formId, fields } = FEEDBACK_FORM;
  if (formId && fields.verdict) {
    try {
      const body = new URLSearchParams();
      body.set(fields.verdict, f.verdict);
      body.set(fields.topPick, topPick);
      body.set(fields.expected, f.expectedCareer);
      body.set(fields.comment, f.comment);
      body.set(fields.confidence, confidence);
      body.set(fields.details, JSON.stringify({ directions, profile: f.profile }));
      await fetch(`https://docs.google.com/forms/d/e/${formId}/formResponse`, { method: "POST", mode: "no-cors", body });
    } catch {
      // Non-critical.
    }
  }

  try {
    localStorage.setItem(SENT_KEY, predictionKey(f.prediction));
  } catch {
    // Non-critical.
  }
}

export function loadCachedProfile(): unknown {
  try {
    const raw = localStorage.getItem("worthscope_ci_profile");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}
