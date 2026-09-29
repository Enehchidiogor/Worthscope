/* WorthScope — Admin check.
   Reads profiles.role (added by the admin_and_live_classes migration).
   Server-side RLS is the real gate — this is only for showing/hiding the
   admin UI, never trust it for anything security-sensitive on its own. */

import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export async function checkIsAdmin(): Promise<boolean> {
  try {
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) return false;
    // `role` isn't in the generated types yet (added by a migration this repo
    // can't run itself — see supabase/migrations/20260929120000_admin_and_live_classes.sql).
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any).from("profiles").select("role").eq("id", u.user.id).maybeSingle();
    if (error) return false;
    return data?.role === "admin";
  } catch {
    return false;
  }
}

export function useIsAdmin(): { isAdmin: boolean; loading: boolean } {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    checkIsAdmin().then((ok) => {
      if (!cancelled) {
        setIsAdmin(ok);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return { isAdmin, loading };
}
