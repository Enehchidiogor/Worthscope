// Parent dashboard edge function — public, no auth.
// Verifies an invite token (and optionally a soft name check) then returns
// a sanitized read-only snapshot of the student's journey.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function relTime(iso: string | null | undefined): string {
  if (!iso) return "—";
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return "—";
  const diff = Date.now() - t;
  const m = Math.floor(diff / 60000);
  if (m < 1) return "Just now";
  if (m < 60) return `${m} minute${m === 1 ? "" : "s"} ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} hour${h === 1 ? "" : "s"} ago`;
  const d = Math.floor(h / 24);
  if (d === 1) return "Yesterday";
  if (d < 7) return `${d} days ago`;
  const w = Math.floor(d / 7);
  if (w < 5) return `${w} week${w === 1 ? "" : "s"} ago`;
  const mo = Math.floor(d / 30);
  return `${mo} month${mo === 1 ? "" : "s"} ago`;
}

function levelFor(value: number): "Beginner" | "Intermediate" | "Advanced" {
  if (value >= 70) return "Advanced";
  if (value >= 35) return "Intermediate";
  return "Beginner";
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ ok: false, error: "method" }, 405);

  let body: any;
  try { body = await req.json(); } catch { return json({ ok: false, error: "bad_json" }, 400); }

  const mode: "validate" | "data" = body?.mode === "data" ? "data" : "validate";
  const token: string = String(body?.token || "").trim();
  if (!token) return json({ ok: false, error: "missing_token" }, 400);

  const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

  const { data: invite, error: invErr } = await supabase
    .from("parent_invites")
    .select("id, student_user_id, parent_email, parent_label, expires_at, revoked_at, last_viewed_at")
    .eq("token", token)
    .maybeSingle();

  if (invErr || !invite) return json({ ok: false, error: "invalid" });
  if (invite.revoked_at) return json({ ok: false, error: "revoked" });
  if (invite.expires_at && new Date(invite.expires_at).getTime() < Date.now()) {
    return json({ ok: false, error: "expired" });
  }

  const studentId: string = invite.student_user_id;

  // Profile (name + avatar)
  const { data: profile } = await supabase
    .from("profiles")
    .select("id, name, avatar_url")
    .eq("id", studentId)
    .maybeSingle();

  if (mode === "validate") {
    const fullName: string = profile?.name || "your child";
    const firstName = String(fullName).trim().split(/\s+/)[0] || "your child";

    const guess = String(body?.firstName || "").trim().toLowerCase();
    if (guess && guess !== firstName.toLowerCase()) {
      return json({ ok: false, error: "name_mismatch" });
    }
    return json({ ok: true, firstName, fullName });
  }

  // ---- DATA MODE ----
  // Update last_viewed_at (best-effort)
  supabase.from("parent_invites")
    .update({ last_viewed_at: new Date().toISOString() })
    .eq("id", invite.id)
    .then(() => {}, () => {});

  // Student state
  const { data: state } = await supabase
    .from("student_state")
    .select("*")
    .eq("user_id", studentId)
    .maybeSingle();

  // Roadmap (titles, phases)
  const { data: roadmapRow } = await supabase
    .from("koko_roadmaps")
    .select("roadmap_json, updated_at")
    .eq("user_id", studentId)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const roadmap: any = roadmapRow?.roadmap_json || null;

  const fullName: string = profile?.name || "Your child";
  const firstName = String(fullName).trim().split(/\s+/)[0] || "Your child";

  // Compute roadmap stats
  let totalMissions = 0;
  let missionsCompleted = 0;
  const doneMap: Record<string, true> = (state?.roadmap_done as any) || {};
  const allMissions: { id: string; phaseNumber: number; phaseTitle: string; missionTitle: string; description: string; milestone: string }[] = [];
  if (roadmap?.phases?.length) {
    for (const p of roadmap.phases) {
      for (const m of p.missions || []) {
        const id = `p${p.phase_number}_m${m.mission_number}`;
        allMissions.push({
          id,
          phaseNumber: p.phase_number,
          phaseTitle: p.phase_title,
          missionTitle: m.mission_title,
          description: m.mission_description || "",
          milestone: m.real_world_milestone || "",
        });
        totalMissions++;
        if (doneMap[id]) missionsCompleted++;
      }
    }
  }
  const pct = totalMissions ? Math.round((missionsCompleted / totalMissions) * 100) : 0;

  // Current phase
  let currentPhaseNumber = 1;
  let currentPhaseTitle = roadmap?.phases?.[0]?.phase_title || "Getting started";
  if (roadmap?.phases?.length) {
    for (const p of roadmap.phases) {
      const phaseDone = (p.missions || []).every((m: any) => doneMap[`p${p.phase_number}_m${m.mission_number}`]);
      if (!phaseDone) { currentPhaseNumber = p.phase_number; currentPhaseTitle = p.phase_title; break; }
      currentPhaseNumber = p.phase_number; currentPhaseTitle = p.phase_title;
    }
  }
  const totalPhases = roadmap?.phases?.length || 0;

  // Recent missions (5)
  const completionList = Array.isArray(state?.completed_missions) ? (state!.completed_missions as any[]) : [];
  const completionMap = new Map<string, string>();
  for (const c of completionList) if (c?.id) completionMap.set(c.id, c.completedAt || "");
  const recent = allMissions
    .filter((m) => doneMap[m.id])
    .map((m) => ({ ...m, completedAt: completionMap.get(m.id) || "" }))
    .sort((a, b) => (b.completedAt || "").localeCompare(a.completedAt || ""))
    .slice(0, 5)
    .map((m) => ({
      title: m.missionTitle,
      phase: `Phase ${m.phaseNumber} — ${m.phaseTitle}`,
      completedAt: m.completedAt,
      quote: m.milestone || `Built foundational understanding of ${m.missionTitle.toLowerCase()}.`,
    }));

  // Upcoming missions (3)
  const upcoming = allMissions
    .filter((m) => !doneMap[m.id])
    .slice(0, 3)
    .map((m) => ({
      title: m.missionTitle,
      phase: `Phase ${m.phaseNumber} — ${m.phaseTitle}`,
      why: m.description || "Builds another step toward your career goal.",
    }));

  // Skills
  const skillsObj: Record<string, number> = (state?.skills as any) || {};
  const skills = Object.entries(skillsObj)
    .map(([name, value]) => ({ name, value: Number(value) || 0, level: levelFor(Number(value) || 0) }))
    .sort((a, b) => b.value - a.value);

  // Streak — 7-day week active flags from last_visit_date + count
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const last = state?.last_visit_date ? new Date(state.last_visit_date + "T00:00:00") : null;
  const count = state?.current_streak || 0;
  const week: boolean[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today); d.setDate(today.getDate() - i);
    let active = false;
    if (last && count > 0) {
      const streakStart = new Date(last); streakStart.setDate(last.getDate() - (count - 1));
      active = d.getTime() >= streakStart.getTime() && d.getTime() <= last.getTime();
    }
    week.push(active);
  }
  const weekActive = week.filter(Boolean).length;

  // Monthly completed missions
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1).toISOString();
  const monthlyCompleted = completionList.filter((c) => c?.completedAt && c.completedAt >= monthStart).length;

  // Estimated months remaining
  const durationMonths = Number(roadmap?.estimated_duration_months || 6);
  const remaining = Math.max(0, totalMissions - missionsCompleted);
  const estMonthsLeft = totalMissions > 0
    ? Math.max(1, Math.round((remaining / totalMissions) * durationMonths))
    : durationMonths;

  // Career info
  const chosen = (state?.chosen_career as any) || null;
  const careerTitle = chosen?.title || roadmap?.career_path || "their chosen path";
  const careerDescription = chosen?.description || "";
  const careerCategory: string = chosen?.category || "";

  const examplesByCat: Record<string, string[]> = {
    creative: ["Designs products people love to use", "Crafts user experiences for apps and websites", "Builds visual identities for brands"],
    tech: ["Writes code that powers apps and services", "Builds systems that scale to millions of users", "Solves complex problems with software"],
    business: ["Leads teams to achieve strategic goals", "Analyses markets and makes data-driven decisions", "Drives growth for organisations"],
    science: ["Conducts research that advances human knowledge", "Solves real-world problems through experimentation", "Develops new theories and applications"],
    people: ["Helps people grow and overcome challenges", "Builds communities and supports wellbeing", "Mediates and resolves complex situations"],
    communication: ["Tells stories that move audiences", "Shapes how brands and ideas reach people", "Creates content that informs and inspires"],
  };
  const careerExamples = examplesByCat[careerCategory] || [
    "Builds real-world skills aligned to a meaningful career",
    "Works on projects with measurable impact",
    "Grows through structured learning and practice",
  ];

  // CRS reason (from top result, if any)
  let careerReason = "";
  if (Array.isArray(state?.assessment_results)) {
    const top = (state!.assessment_results as any[])[0];
    careerReason = top?.reason || top?.description || "";
  } else if (state?.assessment_results && typeof state.assessment_results === "object") {
    const r: any = state.assessment_results;
    careerReason = r?.reason || r?.description || (Array.isArray(r?.careers) ? r.careers[0]?.reason : "") || "";
  }

  const lastActive = relTime(state?.last_visit_date ? state.last_visit_date + "T00:00:00Z" : null);

  return json({
    ok: true,
    student: {
      fullName,
      firstName,
      avatarUrl: profile?.avatar_url || null,
      careerTitle,
      careerDescription,
      careerReason,
      careerExamples,
      lastActive,
      currentPhase: { number: currentPhaseNumber, total: totalPhases, title: currentPhaseTitle },
      roadmap: {
        missionsCompleted,
        totalMissions,
        pct,
        estMonthsLeft,
      },
      streak: {
        count,
        weekActive,
        monthlyCompleted,
        weekDays: week,
        show: count > 0,
      },
      skills,
      recentMissions: recent,
      upcomingMissions: upcoming,
    },
  });
});
