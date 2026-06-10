/* WorthScope — current user profile store
   Single source of truth for `avatar_url` and `koko_avatar` fields that
   need to update everywhere in the UI without a page refresh. */

import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type KokoAvatarKey = "robot" | "owl" | "fox" | "cat" | "spark";

export type UserProfileRecord = {
  id: string;
  name: string | null;
  avatar_url: string | null;
  koko_avatar: KokoAvatarKey;
};

const EVT = "worthscope:profile";
let cached: UserProfileRecord | null = null;
let loading: Promise<UserProfileRecord | null> | null = null;

export function getCachedProfile(): UserProfileRecord | null {
  return cached;
}

function broadcast() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(EVT));
  }
}

export async function loadUserProfile(force = false): Promise<UserProfileRecord | null> {
  if (!force && cached) return cached;
  if (loading) return loading;
  loading = (async () => {
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) {
      cached = null;
      return null;
    }
    const { data } = await supabase
      .from("profiles")
      .select("id, name, avatar_url, koko_avatar")
      .eq("id", u.user.id)
      .maybeSingle();
    if (data) {
      cached = {
        id: data.id,
        name: (data as any).name ?? null,
        avatar_url: (data as any).avatar_url ?? null,
        koko_avatar: ((data as any).koko_avatar as KokoAvatarKey) || "robot",
      };
    } else {
      cached = { id: u.user.id, name: null, avatar_url: null, koko_avatar: "robot" };
    }
    broadcast();
    return cached;
  })().finally(() => { loading = null; });
  return loading;
}

export async function updateKokoAvatar(key: KokoAvatarKey): Promise<boolean> {
  const prev = cached?.koko_avatar || "robot";
  // Optimistic update
  if (cached) {
    cached = { ...cached, koko_avatar: key };
    broadcast();
  }
  const { data: u } = await supabase.auth.getUser();
  if (!u.user) return false;
  const { error } = await supabase
    .from("profiles")
    .update({ koko_avatar: key })
    .eq("id", u.user.id);
  if (error) {
    if (cached) {
      cached = { ...cached, koko_avatar: prev };
      broadcast();
    }
    return false;
  }
  return true;
}

export async function setAvatarUrl(url: string | null): Promise<boolean> {
  const { data: u } = await supabase.auth.getUser();
  if (!u.user) return false;
  const { error } = await supabase.from("profiles").update({ avatar_url: url }).eq("id", u.user.id);
  if (error) return false;
  if (cached) {
    cached = { ...cached, avatar_url: url };
    broadcast();
  }
  return true;
}

export function useUserProfile() {
  const [p, setP] = useState<UserProfileRecord | null>(cached);
  useEffect(() => {
    let alive = true;
    if (!cached) {
      loadUserProfile().then((r) => { if (alive) setP(r); });
    }
    const refresh = () => setP(cached ? { ...cached } : null);
    window.addEventListener(EVT, refresh);
    return () => {
      alive = false;
      window.removeEventListener(EVT, refresh);
    };
  }, []);
  return p;
}
