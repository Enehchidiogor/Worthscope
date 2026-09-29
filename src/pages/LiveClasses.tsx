import { useState } from "react";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { TopBar } from "@/components/dashboard/TopBar";
import { MobileTabBar } from "@/components/dashboard/MobileTabBar";
import { IconCalendar } from "@/components/dashboard/icons";
import { getVisibleClasses, classStatus, applyMailto, type LiveClass } from "@/lib/liveClasses";
import { getProfile } from "@/lib/userState";
import { SEO } from "@/components/SEO";

function fmtRange(startsAt: string, endsAt: string): string {
  const s = new Date(startsAt);
  const e = new Date(endsAt);
  const day = s.toLocaleDateString(undefined, { weekday: "short", day: "numeric", month: "short" });
  const t1 = s.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
  const t2 = e.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
  return `${day} · ${t1} – ${t2}`;
}

const LiveClasses = () => {
  const classes = getVisibleClasses();
  const profile = getProfile();
  const [applying, setApplying] = useState<LiveClass | null>(null);

  return (
    <div className="min-h-screen bg-background font-poppins text-foreground">
      <SEO
        title="Live Classes — WorthScope"
        description="Live and upcoming classes hosted by WorthScope and partner training facilities."
        path="/classes"
      />
      <Sidebar activePath="/classes" />

      <div className="md:ml-[220px]">
        <TopBar title="Live Classes" />

        <main className="mx-auto w-full max-w-[860px] px-4 pb-24 pt-10 md:px-8">
          <div className="mb-2 text-[13px] font-semibold uppercase tracking-[1px] text-accent">Hosted by WorthScope &amp; partner facilities</div>
          <h1 className="text-[24px] font-bold text-foreground">Live &amp; upcoming classes</h1>
          <p className="mt-2 max-w-[560px] text-[14px] leading-relaxed text-text2">
            Real-time sessions — online and in person — run by WorthScope or a partner training facility. Every application goes out clearly as coming from WorthScope.
          </p>

          {classes.length === 0 ? (
            <div className="mt-8 rounded-[18px] border border-dashed border-border bg-card p-10 text-center">
              <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-accent/10">
                <IconCalendar className="h-6 w-6 text-accent" />
              </div>
              <div className="mt-4 text-[16px] font-bold text-foreground">No live classes available right now</div>
              <p className="mx-auto mt-2 max-w-[380px] text-[13px] leading-relaxed text-text2">
                We're setting up sessions with WorthScope and partner facilities. Check back soon, or keep working through your roadmap in the meantime.
              </p>
            </div>
          ) : (
            <div className="mt-8 flex flex-col gap-4">
              {classes.map((c) => {
                const status = classStatus(c);
                return (
                  <div key={c.id} className="rounded-[18px] border border-border bg-card p-5">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          {status === "live" && (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-red-500/15 px-2.5 py-0.5 text-[11px] font-bold text-red-400">
                              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-red-500" /> LIVE NOW
                            </span>
                          )}
                          <span className="rounded-full bg-accent/10 px-2.5 py-0.5 text-[11px] font-semibold text-accent">
                            {c.format === "online" ? "🌐 Online" : "📍 In person"}
                          </span>
                          {(c.careerTags ?? []).map((t) => (
                            <span key={t} className="rounded-full bg-bg-elevated px-2.5 py-0.5 text-[11px] font-medium text-text2">
                              {t}
                            </span>
                          ))}
                        </div>
                        <div className="mt-2 text-[16px] font-bold text-foreground">{c.title}</div>
                        <div className="mt-0.5 text-[12.5px] text-text2">
                          Hosted by <span className="font-semibold text-foreground">{c.host}</span>
                        </div>
                      </div>
                      <div className="shrink-0 text-right text-[12.5px] font-medium text-text2">{fmtRange(c.startsAt, c.endsAt)}</div>
                    </div>

                    <p className="mt-3 text-[13.5px] leading-relaxed text-text2">{c.description}</p>

                    {c.location && <div className="mt-2 text-[12.5px] text-text3">📍 {c.location}</div>}
                    {c.seatsNote && <div className="mt-1 text-[12.5px] text-text3">{c.seatsNote}</div>}

                    <div className="mt-4 flex flex-wrap gap-2">
                      {status === "live" && c.joinUrl && (
                        <a
                          href={c.joinUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="rounded-lg bg-accent px-4 py-2 text-[13px] font-semibold text-white transition-colors hover:bg-accent-dark"
                        >
                          Join now →
                        </a>
                      )}
                      {(c.applyUrl || c.applyEmail) && (
                        <button
                          onClick={() => setApplying(c)}
                          className="rounded-lg border border-border px-4 py-2 text-[13px] font-semibold text-foreground transition-colors hover:border-accent/40"
                        >
                          Apply →
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>

      <MobileTabBar />

      {applying && (
        <div className="fixed inset-0 z-[700] grid place-items-center bg-black/60 p-4" onClick={() => setApplying(null)}>
          <div className="w-full max-w-[440px] rounded-2xl bg-card p-6" onClick={(e) => e.stopPropagation()}>
            <div className="text-[11px] font-bold uppercase tracking-wide text-accent">Applying via WorthScope</div>
            <h3 className="mt-1.5 text-[17px] font-bold text-foreground">{applying.title}</h3>
            <p className="mt-2 text-[13px] leading-relaxed text-text2">
              This application is sent to <strong className="text-foreground">{applying.host}</strong>, clearly marked as coming from your WorthScope profile
              {profile?.firstName ? ` (${profile.firstName})` : ""}.
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setApplying(null)}
                className="rounded-lg border border-border px-4 py-2 text-[13px] font-semibold text-foreground"
              >
                Cancel
              </button>
              <a
                href={applying.applyUrl || applyMailto(applying, profile?.fullName || profile?.firstName || "A WorthScope learner")}
                target={applying.applyUrl ? "_blank" : undefined}
                rel="noopener noreferrer"
                onClick={() => setApplying(null)}
                className="rounded-lg bg-accent px-4 py-2 text-[13px] font-semibold text-white hover:bg-accent-dark"
              >
                Continue →
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LiveClasses;
