/* WorthScope — Live Classes (hosted by WorthScope, or with partner facilities).
   Real classes now live in Supabase (public.live_classes — see
   supabase/migrations/20260929120000_admin_and_live_classes.sql) and are
   managed from /admin/classes. That migration needs to be applied before any
   of this works — until then (or if the fetch fails for any reason), this
   falls back to the LIVE_CLASSES array below, which you can still hand-edit
   as a zero-backend fallback. Leave both empty and the page correctly shows
   "No live classes available right now".

   Example entry:
   {
     id: "cc-editing-workshop-2026-10",
     title: "Video Editing Workshop",
     description: "A hands-on session on cutting, pacing and sound for short-form video.",
     format: "online",
     host: "WorthScope",
     startsAt: "2026-10-05T15:00:00Z",
     endsAt: "2026-10-05T17:00:00Z",
     careerTags: ["Content Creator"],
     joinUrl: "https://meet.google.com/xxx-yyyy-zzz",
     applyUrl: "https://forms.gle/xxxxxxxx",
   }
*/

export type ClassFormat = "online" | "physical";

export type LiveClass = {
  id: string;
  title: string;
  description: string;
  format: ClassFormat;
  /** Who's running it — "WorthScope" for our own sessions, or a partner facility's name. */
  host: string;
  /** ISO datetime strings. */
  startsAt: string;
  endsAt: string;
  /** Physical classes: the venue address/description. Online: shown as a location hint (e.g. "Online — Zoom"). */
  location?: string;
  /** Online classes: the join link, shown once the class is live or about to start. */
  joinUrl?: string;
  /** Which career paths this is most relevant to (shown as tags; empty = open to everyone). */
  careerTags?: string[];
  /** Where "Apply" sends people — a registration form/link (preferred). */
  applyUrl?: string;
  /** Fallback if there's no applyUrl: opens a WorthScope-branded pre-filled email to this address. */
  applyEmail?: string;
  seatsNote?: string;
};

// ===== ADD REAL CLASSES HERE =====
export const LIVE_CLASSES: LiveClass[] = [];
// ==================================

export type ClassStatus = "live" | "upcoming" | "ended";

export function classStatus(c: LiveClass, now = new Date()): ClassStatus {
  const start = new Date(c.startsAt).getTime();
  const end = new Date(c.endsAt).getTime();
  const t = now.getTime();
  if (t >= start && t <= end) return "live";
  if (t < start) return "upcoming";
  return "ended";
}

function sortVisible(list: LiveClass[]): LiveClass[] {
  const now = new Date();
  return list.filter((c) => classStatus(c, now) !== "ended").sort((a, b) => {
    const sa = classStatus(a, now);
    const sb = classStatus(b, now);
    if (sa !== sb) return sa === "live" ? -1 : sb === "live" ? 1 : 0;
    return new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime();
  });
}

/** Synchronous fallback (the hand-edited array only). */
export function getVisibleClasses(): LiveClass[] {
  return sortVisible(LIVE_CLASSES);
}

/** Real classes from Supabase, merged with the fallback array, live-first
    then soonest-first. Never throws — falls back to LIVE_CLASSES on any error
    (table/migration not applied yet, network issue, etc). */
export async function fetchVisibleClasses(): Promise<LiveClass[]> {
  try {
    const { supabase } = await import("@/integrations/supabase/client");
    // live_classes isn't in the generated Supabase types yet.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from("live_classes")
      .select("*")
      .gte("ends_at", new Date(Date.now() - 24 * 3600 * 1000).toISOString())
      .order("starts_at", { ascending: true });
    if (error || !data) return sortVisible(LIVE_CLASSES);
    const fromDb: LiveClass[] = data.map((row: Record<string, unknown>) => ({
      id: String(row.id),
      title: String(row.title),
      description: String(row.description ?? ""),
      format: row.format as ClassFormat,
      host: String(row.host ?? "WorthScope"),
      startsAt: String(row.starts_at),
      endsAt: String(row.ends_at),
      location: (row.location as string) || undefined,
      joinUrl: (row.join_url as string) || undefined,
      careerTags: (row.career_tags as string[]) || [],
      applyUrl: (row.apply_url as string) || undefined,
      applyEmail: (row.apply_email as string) || undefined,
      seatsNote: (row.seats_note as string) || undefined,
    }));
    return sortVisible([...fromDb, ...LIVE_CLASSES]);
  } catch {
    return sortVisible(LIVE_CLASSES);
  }
}

/** Best-effort: records that someone applied, for the admin Applications page.
    Silently no-ops if the table/migration doesn't exist yet — the external
    apply link/email still opens regardless of whether this succeeds. */
export async function recordApplication(classId: string, applicantName: string, applicantEmail?: string): Promise<void> {
  // A hand-edited fallback class (not a real uuid from Supabase) has nowhere to record to.
  if (!/^[0-9a-f-]{36}$/i.test(classId)) return;
  try {
    const { supabase } = await import("@/integrations/supabase/client");
    const { data: u } = await supabase.auth.getUser();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any).from("live_class_applications").insert({
      class_id: classId,
      user_id: u.user?.id ?? null,
      applicant_name: applicantName,
      applicant_email: applicantEmail ?? null,
    });
  } catch {
    // Non-critical — the applicant still gets sent to the real apply link/email.
  }
}

export function applyMailto(c: LiveClass, applicantName: string): string {
  const subject = `WorthScope application — ${c.title}`;
  const body = `Hi,\n\nI'd like to apply for "${c.title}" (${new Date(c.startsAt).toLocaleString()}).\n\nThis application is coming from WorthScope on behalf of:\nName: ${applicantName}\n\nThanks!`;
  return `mailto:${c.applyEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
