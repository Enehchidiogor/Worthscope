/* WorthScope — Cross-device student state sync.
   Mirrors the journey state (chosen career, assessment results, streak,
   roadmap completions, skill progress, etc.) to public.student_state so
   the user sees the same data on any device, and so the parent dashboard
   can read it server-side. */

import { supabase } from "@/integrations/supabase/client";

const K = {
  chosen: "worthscope_chosen_career",
  results: "worthscope_results",
  progress: "worthscope_progress",
  signup: "worthscope_signup_date",
  streak: "worthscope_streak",
  roadmapDone: "worthscope_koko_mission_done",
  activeModule: "worthscope_active_module",
  completionTs: "worthscope_mission_completion_ts", // local mirror for parent timestamps
} as const;

const safeParse = <T,>(raw: string | null): T | null => {
  if (!raw) return null;
  try { return JSON.parse(raw) as T; } catch { return null; }
};

/** Build the snapshot we'll write to the server. */
function snapshot() {
  if (typeof window === "undefined") return null;
  const chosen = safeParse<any>(localStorage.getItem(K.chosen));
  const results = safeParse<any>(localStorage.getItem(K.results));
  const progress = safeParse<any>(localStorage.getItem(K.progress));
  const signupDate = localStorage.getItem(K.signup) || null;
  const streak = safeParse<any>(localStorage.getItem(K.streak));
  const roadmapDoneMap = safeParse<Record<string, true>>(localStorage.getItem(K.roadmapDone)) || {};
  const activeModule = localStorage.getItem(K.activeModule);

  // Mission completion timestamps (preserved client-side).
  const tsMap = safeParse<Record<string, string>>(localStorage.getItem(K.completionTs)) || {};
  const nowIso = new Date().toISOString();
  for (const id of Object.keys(roadmapDoneMap)) {
    if (!tsMap[id]) tsMap[id] = nowIso;
  }
  localStorage.setItem(K.completionTs, JSON.stringify(tsMap));

  const completedMissions = Object.keys(roadmapDoneMap).map((id) => ({
    id,
    completedAt: tsMap[id] || nowIso,
  }));

  return {
    chosen_career: chosen,
    assessment_results: results,
    signup_date: signupDate,
    current_streak: typeof streak?.count === "number" ? streak.count : 0,
    last_visit_date: streak?.lastVisitDate || null,
    skills: progress?.skills || {},
    roadmap_done: roadmapDoneMap,
    completed_missions: completedMissions,
    active_career_module: activeModule,
  };
}

let debounceT: number | null = null;
let inflight: Promise<void> | null = null;

export async function syncStudentStateNow(): Promise<void> {
  if (typeof window === "undefined") return;
  if (inflight) return inflight;
  inflight = (async () => {
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) return;
    const snap = snapshot();
    if (!snap) return;
    await supabase
      .from("student_state")
      .upsert({ user_id: u.user.id, ...snap } as any, { onConflict: "user_id" });
  })().catch((e) => { console.warn("[studentState] sync failed", e); })
    .finally(() => { inflight = null; });
  return inflight;
}

export function scheduleSync(delay = 900) {
  if (typeof window === "undefined") return;
  if (debounceT) window.clearTimeout(debounceT);
  debounceT = window.setTimeout(() => { syncStudentStateNow(); }, delay);
}

/** Pulls the server state into localStorage so the rest of the app
 *  (which reads from localStorage) sees the right data on a new device.
 *  Returns true if a server state existed. */
export async function hydrateStudentStateFromServer(): Promise<boolean> {
  if (typeof window === "undefined") return false;
  const { data: u } = await supabase.auth.getUser();
  if (!u.user) return false;
  const { data, error } = await supabase
    .from("student_state")
    .select("*")
    .eq("user_id", u.user.id)
    .maybeSingle();
  if (error || !data) return false;

  const s: any = data;
  if (s.chosen_career) localStorage.setItem(K.chosen, JSON.stringify(s.chosen_career));
  if (s.assessment_results) localStorage.setItem(K.results, JSON.stringify(s.assessment_results));
  if (s.signup_date) localStorage.setItem(K.signup, s.signup_date);
  if (s.last_visit_date) {
    localStorage.setItem(K.streak, JSON.stringify({
      count: s.current_streak || 0,
      lastVisitDate: s.last_visit_date,
    }));
  }
  if (s.roadmap_done && typeof s.roadmap_done === "object") {
    localStorage.setItem(K.roadmapDone, JSON.stringify(s.roadmap_done));
  }
  if (s.active_career_module) localStorage.setItem(K.activeModule, s.active_career_module);

  // Rebuild a progress object so the dashboard renders right away.
  if (s.skills && typeof s.skills === "object") {
    const existing = safeParse<any>(localStorage.getItem(K.progress)) || {};
    const totalDone = Array.isArray(s.completed_missions) ? s.completed_missions.length : 0;
    localStorage.setItem(K.progress, JSON.stringify({
      ...existing,
      skills: s.skills,
      missionsCompleted: totalDone,
      totalMissions: existing.totalMissions || 9,
      overallPct: existing.overallPct || 0,
      phase: existing.phase || 1,
    }));
  }
  // Restore completion timestamps locally.
  if (Array.isArray(s.completed_missions)) {
    const tsMap: Record<string, string> = {};
    for (const m of s.completed_missions) {
      if (m?.id) tsMap[m.id] = m.completedAt || new Date().toISOString();
    }
    localStorage.setItem(K.completionTs, JSON.stringify(tsMap));
  }

  // Fire refresh events so live components reload.
  window.dispatchEvent(new CustomEvent("worthscope:progress"));
  window.dispatchEvent(new CustomEvent("worthscope:streak"));
  window.dispatchEvent(new CustomEvent("worthscope:roadmap"));
  return true;
}

/** Wire up global event listeners that auto-sync on any state change.
 *  Call once at app start. */
let installed = false;
export function installStudentStateAutoSync() {
  if (installed || typeof window === "undefined") return;
  installed = true;
  const handler = () => scheduleSync();
  window.addEventListener("worthscope:progress", handler);
  window.addEventListener("worthscope:streak", handler);
  window.addEventListener("worthscope:roadmap", handler);
  window.addEventListener("worthscope:profile", handler);
}
