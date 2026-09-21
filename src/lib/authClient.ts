/* WorthScope — auth + profile sync layer.
   Wraps Supabase Auth so the rest of the app can ask: "who's signed in
   right now?" without juggling getSession + onAuthStateChange in every
   component. Also mirrors the DB profile into localStorage so the
   existing userState helpers (which read from localStorage) keep
   working unchanged for signed-in users. */

import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Session, User } from "@supabase/supabase-js";

export type DbProfile = {
  id: string;
  name: string | null;
  age: number | null;
  education_level: string | null;
  career_path: string | null;
  overall_progress: number;
};

export function useAuthSession() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Register listener FIRST so we don't miss the initial event.
    const { data: sub } = supabase.auth.onAuthStateChange((_evt, s) => {
      setSession(s);
      setLoading(false);
    });
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  return { session, user: session?.user ?? null, loading };
}

export async function signUpWithEmail(args: {
  email: string;
  password: string;
  name: string;
  age?: number;
  educationLevel?: string;
}) {
  return supabase.auth.signUp({
    email: args.email,
    password: args.password,
    options: {
      emailRedirectTo: `${window.location.origin}/onboarding`,
      data: {
        name: args.name,
        age: args.age != null ? String(args.age) : "",
        education_level: args.educationLevel || "",
      },
    },
  });
}

export async function signInWithEmail(email: string, password: string) {
  return supabase.auth.signInWithPassword({ email, password });
}

export async function signOut() {
  return supabase.auth.signOut();
}

/* Hydrate DB profile -> localStorage so all the existing helpers
   (getProfile, getFirstName, getChosenCareer, etc.) keep working. */
export async function hydrateProfile(user: User): Promise<DbProfile | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();
  if (error || !data) return null;

  const firstName = (data.name || user.email?.split("@")[0] || "").trim().split(/\s+/)[0] || "";
  const localProfile = {
    fullName: data.name || "",
    firstName,
    email: user.email || "",
    age: typeof data.age === "number" ? data.age : "",
    educationLevel: educationToLegacy(data.education_level),
    classOrLevel: data.education_level || "",
  };
  try {
    localStorage.setItem("worthscope_user_profile", JSON.stringify(localProfile));
  } catch {}
  return data as DbProfile;
}

function educationToLegacy(level: string | null): "secondary" | "university" | "" {
  if (!level) return "";
  if (/^SS\d/i.test(level) || /JSS/i.test(level) || /secondary/i.test(level)) return "secondary";
  if (/level/i.test(level) || /graduate/i.test(level) || /working/i.test(level)) return "university";
  return "";
}

export async function persistProfile(patch: Partial<Omit<DbProfile, "id">>) {
  const { data: u } = await supabase.auth.getUser();
  if (!u.user) return { error: new Error("not signed in") };
  return supabase.from("profiles").update(patch).eq("id", u.user.id);
}

export async function persistCareerPath(career: string) {
  return persistProfile({ career_path: career });
}

/* Once-per-day welcome gate. Returns true at most once per calendar day per
   user, and stamps profiles.last_welcomed_at — so dashboard greetings don't
   fire on every visit/refresh. NOTE: last_welcomed_at is added by the
   koko_quality_persistence migration; the generated Supabase types don't know
   it yet (Lovable regenerates them on migration), so this uses an untyped query. */
export async function claimDailyWelcome(): Promise<boolean> {
  const { data: u } = await supabase.auth.getUser();
  if (!u.user) return false;
  const db = supabase as unknown as {
    from: (t: string) => {
      select: (c: string) => { eq: (k: string, v: string) => { maybeSingle: () => Promise<{ data: { last_welcomed_at: string | null } | null }> } };
      update: (v: Record<string, unknown>) => { eq: (k: string, v: string) => Promise<unknown> };
    };
  };
  const { data: row } = await db.from("profiles").select("last_welcomed_at").eq("id", u.user.id).maybeSingle();
  const today = new Date().toISOString().slice(0, 10);
  const last = row?.last_welcomed_at ? new Date(row.last_welcomed_at).toISOString().slice(0, 10) : null;
  if (last === today) return false;
  await db.from("profiles").update({ last_welcomed_at: new Date().toISOString() }).eq("id", u.user.id);
  return true;
}
