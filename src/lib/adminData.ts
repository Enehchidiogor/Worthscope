/* WorthScope — Admin data fetchers.
   Every query here relies on the "admin read all X" RLS policies added by
   supabase/migrations/20260929120000_admin_and_live_classes.sql. Until that
   migration is applied and the signed-in user's profiles.role is 'admin',
   these will return empty results (or an error) rather than real data —
   RLS fails closed, which is the safe default. */

import { supabase } from "@/integrations/supabase/client";

// None of these tables/columns are in the generated Supabase types yet.
/* eslint-disable @typescript-eslint/no-explicit-any */
const db = supabase as any;

export type AdminProfile = {
  id: string;
  name: string | null;
  age: number | null;
  education_level: string | null;
  career_path: string | null;
  overall_progress: number;
  role: string;
  created_at: string;
};

export async function fetchUsers(): Promise<AdminProfile[]> {
  const { data, error } = await db.from("profiles").select("*").order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export type AdminStats = {
  totalUsers: number;
  completedCareerPredictions: number;
  feedbackCount: number;
  upcomingClasses: number;
  totalApplications: number;
};

export async function fetchStats(): Promise<AdminStats> {
  const [users, ci, feedback, classes, applications] = await Promise.all([
    db.from("profiles").select("id", { count: "exact", head: true }),
    db.from("career_intelligence_profiles").select("id", { count: "exact", head: true }).eq("assessment_status", "completed"),
    db.from("career_feedback").select("id", { count: "exact", head: true }),
    db.from("live_classes").select("id", { count: "exact", head: true }).gte("ends_at", new Date().toISOString()),
    db.from("live_class_applications").select("id", { count: "exact", head: true }),
  ]);
  return {
    totalUsers: users.count ?? 0,
    completedCareerPredictions: ci.count ?? 0,
    feedbackCount: feedback.count ?? 0,
    upcomingClasses: classes.count ?? 0,
    totalApplications: applications.count ?? 0,
  };
}

export type AdminFeedback = {
  id: string;
  verdict: string;
  top_pick: string | null;
  directions: string[] | null;
  expected_career: string | null;
  comment: string | null;
  confidence: string | null;
  created_at: string;
};

export async function fetchFeedback(): Promise<AdminFeedback[]> {
  const { data, error } = await db.from("career_feedback").select("*").order("created_at", { ascending: false }).limit(200);
  if (error) throw error;
  return data ?? [];
}

export type AdminLiveClass = {
  id: string;
  title: string;
  description: string;
  format: "online" | "physical";
  host: string;
  starts_at: string;
  ends_at: string;
  location: string | null;
  join_url: string | null;
  career_tags: string[];
  apply_url: string | null;
  apply_email: string | null;
  seats_note: string | null;
  created_at: string;
};

export async function fetchAllClasses(): Promise<AdminLiveClass[]> {
  const { data, error } = await db.from("live_classes").select("*").order("starts_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export type NewLiveClass = Omit<AdminLiveClass, "id" | "created_at">;

export async function createClass(c: NewLiveClass): Promise<void> {
  const { data: u } = await supabase.auth.getUser();
  const { error } = await db.from("live_classes").insert({ ...c, created_by: u.user?.id ?? null });
  if (error) throw error;
}

export async function updateClass(id: string, c: Partial<NewLiveClass>): Promise<void> {
  const { error } = await db.from("live_classes").update(c).eq("id", id);
  if (error) throw error;
}

export async function deleteClass(id: string): Promise<void> {
  const { error } = await db.from("live_classes").delete().eq("id", id);
  if (error) throw error;
}

export type AdminApplication = {
  id: string;
  class_id: string;
  applicant_name: string | null;
  applicant_email: string | null;
  created_at: string;
};

export async function fetchApplications(): Promise<AdminApplication[]> {
  const { data, error } = await db.from("live_class_applications").select("*").order("created_at", { ascending: false }).limit(300);
  if (error) throw error;
  return data ?? [];
}
