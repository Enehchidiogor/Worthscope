/* WorthScope — Parent invite client.
   Backed by the public.parent_invites table; tokens are validated and
   dashboard data is fetched via the public `parent-dashboard` edge function. */

import { supabase } from "@/integrations/supabase/client";

export type ParentInviteRow = {
  id: string;
  token: string;
  parent_email: string | null;
  parent_label: string | null;
  created_at: string;
  expires_at: string;
  revoked_at: string | null;
  last_viewed_at: string | null;
};

const ACCESS_PREFIX = "worthscope_parent_access_"; // + token

function makeToken(): string {
  const arr = new Uint8Array(18);
  crypto.getRandomValues(arr);
  return Array.from(arr, (b) => b.toString(16).padStart(2, "0")).join("");
}

export async function createParentInviteRemote(opts: {
  email?: string;
  label?: string;
}): Promise<ParentInviteRow | null> {
  const { data: u } = await supabase.auth.getUser();
  if (!u.user) return null;
  const token = makeToken();
  const { data, error } = await supabase
    .from("parent_invites")
    .insert({
      student_user_id: u.user.id,
      token,
      parent_email: opts.email || null,
      parent_label: opts.label || null,
    })
    .select("*")
    .single();
  if (error) {
    console.warn("[parentInvite] create failed", error);
    return null;
  }
  return data as ParentInviteRow;
}

export async function listParentInvites(): Promise<ParentInviteRow[]> {
  const { data: u } = await supabase.auth.getUser();
  if (!u.user) return [];
  const { data, error } = await supabase
    .from("parent_invites")
    .select("*")
    .eq("student_user_id", u.user.id)
    .order("created_at", { ascending: false });
  if (error) return [];
  return (data || []) as ParentInviteRow[];
}

export async function revokeParentInvite(id: string): Promise<boolean> {
  const { error } = await supabase
    .from("parent_invites")
    .update({ revoked_at: new Date().toISOString() })
    .eq("id", id);
  return !error;
}

export function buildInviteUrl(token: string): string {
  return `${window.location.origin}/parent/${token}`;
}

/* ---------- Parent-side helpers (public, no auth) ---------- */

export type ParentDashboardPayload = {
  fullName: string;
  firstName: string;
  avatarUrl: string | null;
  careerTitle: string;
  careerDescription: string;
  careerReason: string;
  careerExamples: string[];
  lastActive: string;
  currentPhase: { number: number; total: number; title: string };
  roadmap: { missionsCompleted: number; totalMissions: number; pct: number; estMonthsLeft: number };
  streak: { count: number; weekActive: number; monthlyCompleted: number; weekDays: boolean[]; show: boolean };
  skills: { name: string; value: number; level: "Beginner" | "Intermediate" | "Advanced" }[];
  recentMissions: { title: string; phase: string; completedAt: string; quote: string }[];
  upcomingMissions: { title: string; phase: string; why: string }[];
};

export type ParentValidationResult =
  | { ok: true; firstName: string; fullName: string }
  | { ok: false; error: "invalid" | "revoked" | "expired" | "name_mismatch" };

export type ParentDashboardResult =
  | { ok: true; student: ParentDashboardPayload }
  | { ok: false; error: "invalid" | "revoked" | "expired" };

export async function validateParentToken(token: string, firstName?: string): Promise<ParentValidationResult> {
  try {
    const { data, error } = await supabase.functions.invoke("parent-dashboard", {
      body: { mode: "validate", token, firstName },
    });
    if (error) return { ok: false, error: "invalid" };
    return (data as ParentValidationResult);
  } catch {
    return { ok: false, error: "invalid" };
  }
}

export async function fetchParentDashboard(token: string): Promise<ParentDashboardResult> {
  try {
    const { data, error } = await supabase.functions.invoke("parent-dashboard", {
      body: { mode: "data", token },
    });
    if (error) return { ok: false, error: "invalid" };
    return (data as ParentDashboardResult);
  } catch {
    return { ok: false, error: "invalid" };
  }
}

export function markAccessGranted(token: string) {
  try { sessionStorage.setItem(ACCESS_PREFIX + token, "1"); } catch { /* noop */ }
}

export function hasAccessGranted(token: string): boolean {
  try { return sessionStorage.getItem(ACCESS_PREFIX + token) === "1"; } catch { return false; }
}
