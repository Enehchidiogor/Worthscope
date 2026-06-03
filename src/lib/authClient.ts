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
