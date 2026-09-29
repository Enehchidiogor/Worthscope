/* WorthScope — Live Classes (hosted by WorthScope, or with partner facilities).
   No backend exists for this yet (needs an admin dashboard + database — see
   the note in the roadmap). Until then, THIS FILE is the source of truth:
   add a class to the array below and it appears on the Live Classes page
   for every user immediately. Leave the array empty and the page correctly
   shows "No live classes available right now".

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

/** Live and upcoming classes, live-first then soonest-first. Ended ones are hidden. */
export function getVisibleClasses(): LiveClass[] {
  const now = new Date();
  return LIVE_CLASSES.filter((c) => classStatus(c, now) !== "ended").sort((a, b) => {
    const sa = classStatus(a, now);
    const sb = classStatus(b, now);
    if (sa !== sb) return sa === "live" ? -1 : sb === "live" ? 1 : 0;
    return new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime();
  });
}

export function applyMailto(c: LiveClass, applicantName: string): string {
  const subject = `WorthScope application — ${c.title}`;
  const body = `Hi,\n\nI'd like to apply for "${c.title}" (${new Date(c.startsAt).toLocaleString()}).\n\nThis application is coming from WorthScope on behalf of:\nName: ${applicantName}\n\nThanks!`;
  return `mailto:${c.applyEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
