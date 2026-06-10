/* WorthScope — Notifications client
   Persists notifications in the `notifications` Supabase table. Provides:
   - createNotification(): create a notification, guarded by dedupeKey to avoid duplicates
   - listNotifications(): fetch with filter (all/unread/read) + pagination
   - markRead(), markAllRead(), deleteNotification(), clearAll()
   - useNotifications(): React hook with realtime subscription + unread count

   Dedupe strategy: callers pass a stable `dedupeKey`. We track delivered keys
   in localStorage so we never repeat a one-time notification (e.g. "welcome",
   "roadmap_ready") across refreshes — without polluting the DB. The DB itself
   is the source of truth for read/unread state and the list.
*/

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export type NotificationType =
  | "koko"
  | "milestone"
  | "reminder"
  | "system"
  | "mission"
  | "streak"
  | "progress";

export type AppNotification = {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: NotificationType;
  icon: string | null;
  action_url: string | null;
  read_at: string | null;
  created_at: string;
};

const DEDUPE_KEY = "ws.notif.dedupe.v1";
const EVT = "worthscope:notifications";

function loadDedupe(): Record<string, string> {
  try {
    return JSON.parse(localStorage.getItem(DEDUPE_KEY) || "{}");
  } catch {
    return {};
  }
}
function saveDedupe(d: Record<string, string>) {
  localStorage.setItem(DEDUPE_KEY, JSON.stringify(d));
}

function broadcast() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(EVT));
  }
}

export type CreateNotificationInput = {
  title: string;
  message: string;
  type: NotificationType;
  icon?: string;
  actionUrl?: string;
  /** If provided, the notification is only created once per user per key. */
  dedupeKey?: string;
};

export async function createNotification(
  input: CreateNotificationInput,
): Promise<AppNotification | null> {
  const { data: u } = await supabase.auth.getUser();
  if (!u.user) return null;

  const userId = u.user.id;

  if (input.dedupeKey) {
    const map = loadDedupe();
    const composite = `${userId}::${input.dedupeKey}`;
    if (map[composite]) return null;
    map[composite] = new Date().toISOString();
    saveDedupe(map);
  }

  const { data, error } = await supabase
    .from("notifications")
    .insert({
      user_id: userId,
      title: input.title,
      message: input.message,
      type: input.type,
      icon: input.icon ?? null,
      action_url: input.actionUrl ?? null,
    })
    .select()
    .single();

  if (error) {
    console.warn("[notifications] insert failed", error.message);
    return null;
  }
  broadcast();
  return data as AppNotification;
}

export type ListFilter = "all" | "unread" | "read";

export async function listNotifications(opts: {
  filter?: ListFilter;
  limit?: number;
  offset?: number;
} = {}): Promise<{ items: AppNotification[]; total: number }> {
  const { filter = "all", limit = 20, offset = 0 } = opts;
  const { data: u } = await supabase.auth.getUser();
  if (!u.user) return { items: [], total: 0 };

  let q = supabase
    .from("notifications")
    .select("*", { count: "exact" })
    .eq("user_id", u.user.id)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (filter === "unread") q = q.is("read_at", null);
  if (filter === "read") q = q.not("read_at", "is", null);

  const { data, error, count } = await q;
  if (error) {
    console.warn("[notifications] list failed", error.message);
    return { items: [], total: 0 };
  }
  return { items: (data || []) as AppNotification[], total: count ?? 0 };
}

export async function getUnreadCount(): Promise<number> {
  const { data: u } = await supabase.auth.getUser();
  if (!u.user) return 0;
  const { count } = await supabase
    .from("notifications")
    .select("id", { head: true, count: "exact" })
    .eq("user_id", u.user.id)
    .is("read_at", null);
  return count ?? 0;
}

export async function markRead(id: string): Promise<boolean> {
  const { error } = await supabase
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("id", id)
    .is("read_at", null);
  if (error) return false;
  broadcast();
  return true;
}

export async function markAllRead(): Promise<boolean> {
  const { data: u } = await supabase.auth.getUser();
  if (!u.user) return false;
  const { error } = await supabase
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("user_id", u.user.id)
    .is("read_at", null);
  if (error) return false;
  broadcast();
  return true;
}

export async function deleteNotification(id: string): Promise<boolean> {
  const { error } = await supabase.from("notifications").delete().eq("id", id);
  if (error) return false;
  broadcast();
  return true;
}

export async function clearAll(): Promise<boolean> {
  const { data: u } = await supabase.auth.getUser();
  if (!u.user) return false;
  const { error } = await supabase
    .from("notifications")
    .delete()
    .eq("user_id", u.user.id);
  if (error) return false;
  broadcast();
  return true;
}

/** Format "x time ago" for display. */
export function timeAgo(iso: string): string {
  const then = new Date(iso).getTime();
  const now = Date.now();
  const sec = Math.max(1, Math.floor((now - then) / 1000));
  if (sec < 60) return "Just now";
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.floor(hr / 24);
  if (day === 1) return "Yesterday";
  if (day < 7) return `${day} days ago`;
  const wk = Math.floor(day / 7);
  if (wk < 5) return `${wk}w ago`;
  const mo = Math.floor(day / 30);
  if (mo < 12) return `${mo}mo ago`;
  return `${Math.floor(day / 365)}y ago`;
}

/* ------------------ React hooks ------------------ */

export function useNotifications(opts: { limit?: number; filter?: ListFilter } = {}) {
  const { limit = 5, filter = "all" } = opts;
  const [items, setItems] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const [list, unread] = await Promise.all([
      listNotifications({ filter, limit }),
      getUnreadCount(),
    ]);
    setItems(list.items);
    setUnreadCount(unread);
    setLoading(false);
  }, [filter, limit]);

  useEffect(() => {
    refresh();
    const onEvt = () => refresh();
    window.addEventListener(EVT, onEvt);

    let channel: ReturnType<typeof supabase.channel> | null = null;
    let cancelled = false;
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user || cancelled) return;
      channel = supabase
        .channel(`notifications:${u.user.id}`)
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "notifications", filter: `user_id=eq.${u.user.id}` },
          () => refresh(),
        )
        .subscribe();
    })();

    return () => {
      cancelled = true;
      window.removeEventListener(EVT, onEvt);
      if (channel) supabase.removeChannel(channel);
    };
  }, [refresh]);

  return { items, unreadCount, loading, refresh };
}

/* ------------------ High-level event helpers ------------------ */
/* Use these from feature code so we keep wording + dedupe consistent. */

export async function notifyWelcome(name?: string) {
  await createNotification({
    type: "koko",
    icon: "🎉",
    title: "Welcome to WorthScope!",
    message: `Hi${name ? ` ${name}` : ""}! I'm Koko, your career guide. Let's start by figuring out the right path for you.`,
    actionUrl: "/assessment",
    dedupeKey: "welcome",
  });
}

export async function notifyAssessmentComplete(careerTitle: string) {
  await createNotification({
    type: "milestone",
    icon: "🎯",
    title: "Your career path is locked in",
    message: `You're aiming for ${careerTitle}. Next up — I'll build your personalised roadmap.`,
    actionUrl: "/career-results",
    dedupeKey: `assessment_complete:${careerTitle}`,
  });
}

export async function notifyRoadmapReady(careerTitle: string) {
  await createNotification({
    type: "milestone",
    icon: "🗺️",
    title: "Your roadmap is ready",
    message: `Your ${careerTitle} roadmap is live. Start with Mission 1 whenever you're ready.`,
    actionUrl: "/roadmap",
    dedupeKey: `roadmap_ready:${careerTitle}`,
  });
}

export async function notifyMissionComplete(missionTitle: string, nextMissionTitle?: string) {
  await createNotification({
    type: "mission",
    icon: "✅",
    title: `Mission complete — ${missionTitle}`,
    message: nextMissionTitle
      ? `Nice work! Up next: ${nextMissionTitle}. Keep the momentum going.`
      : "Nice work! Check your roadmap for what's next.",
    actionUrl: "/roadmap",
  });
}

export async function notifyPhaseUnlocked(phaseTitle: string, phaseNumber: number) {
  await createNotification({
    type: "milestone",
    icon: "🚀",
    title: `Phase ${phaseNumber} unlocked — ${phaseTitle}`,
    message: "You've levelled up! A new phase of missions is now open.",
    actionUrl: "/roadmap",
    dedupeKey: `phase_unlocked:${phaseNumber}`,
  });
}

export async function notifyCareerOpportunitiesUnlocked() {
  await createNotification({
    type: "milestone",
    icon: "💼",
    title: "Career Opportunities unlocked",
    message: "You've hit 70% of your roadmap. Real jobs matched to your skills are now available.",
    actionUrl: "/career",
    dedupeKey: "career_opps_unlocked",
  });
}

export async function notifyProjectAssessed(missionTitle: string) {
  await createNotification({
    type: "koko",
    icon: "📝",
    title: "Koko's feedback is ready",
    message: `Your project for ${missionTitle} has been reviewed. Open it to see what Koko said.`,
    actionUrl: "/mission",
  });
}

export async function notifyInactivityCheckIn() {
  await createNotification({
    type: "reminder",
    icon: "👋",
    title: "Missed you yesterday",
    message: "It's been a day. A small mission today keeps your streak — and your progress — alive.",
    actionUrl: "/dashboard",
    // Re-eligible every calendar day:
    dedupeKey: `inactivity:${new Date().toISOString().slice(0, 10)}`,
  });
}
