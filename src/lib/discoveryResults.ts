/* Shared by DiscoverChat and DiscoverVoice — turns whatever KOKO extracted
   from a conversation into the same Answers/CareerResult pipeline the static
   assessment already uses, so both discovery paths and the old wizard always
   agree on results. */
import { generateCareerResults, type Answers } from "@/lib/recommendationEngine";
import { sanitizeDiscoveryAnswers, type ExtractedDiscoveryAnswers } from "@/lib/discoveryVocab";
import { supabase } from "@/integrations/supabase/client";

type StoredProfile = {
  fullName?: string;
  firstName?: string;
  ageRange?: string;
  educationLevel?: "secondary" | "university" | "";
  classOrLevel?: string;
};

function loadStoredProfile(): StoredProfile {
  try {
    const raw = localStorage.getItem("worthscope_user_profile");
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export async function applyDiscoveryAnswers(raw: ExtractedDiscoveryAnswers, mode: "voice" | "chat") {
  const clean = sanitizeDiscoveryAnswers(raw);
  const profile = loadStoredProfile();

  const answers: Answers = {
    fullName: profile.fullName || "",
    firstName: profile.firstName || "",
    ageRange: profile.ageRange || null,
    educationLevel: profile.educationLevel || null,
    classOrLevel: profile.classOrLevel || null,

    strongSubjects: clean.strongSubjects,
    activities: clean.activities,
    workTypes: clean.workTypes,
    preferenceConflict: clean.workTypes[0] || null,
    taskInterests: clean.taskInterests,
    outputPreferences: clean.outputPreferences,
    outputPreference: clean.outputPreferences[0] || null,
    personalityTraits: clean.personalityTraits,
    personality: clean.personalityTraits[0] || null,
    differentiation: clean.differentiation,
    careerInclination: clean.statedCareer,
    statedCareer: clean.statedCareer,
    goalOrConcern: clean.goalOrConcern,
  };

  try {
    localStorage.setItem("worthscope_answers", JSON.stringify(answers));
  } catch {
    // Best-effort cache — generateCareerResults() below is the real persistence.
  }
  if (clean.emotionalNotes) {
    try {
      localStorage.setItem("worthscope_emotional_notes", clean.emotionalNotes);
    } catch {
      // Non-critical — just skips the "Koko noticed" line on CareerResults.
    }
  }

  generateCareerResults(answers);

  try {
    const { data: u } = await supabase.auth.getUser();
    if (u.user) {
      // discovery_sessions isn't in the generated Supabase types yet.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase as any).from("discovery_sessions").insert({
        user_id: u.user.id,
        mode,
        status: "completed",
        answers,
        emotional_notes: clean.emotionalNotes,
        completed_at: new Date().toISOString(),
      });
    }
  } catch {
    // Non-critical — results already persisted to localStorage either way.
  }
}
