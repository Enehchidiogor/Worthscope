import { useEffect, useMemo, useState } from "react";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { MobileTabBar } from "@/components/dashboard/MobileTabBar";
import { IconBell, IconLock } from "@/components/dashboard/icons";
import { JobCard } from "@/components/career/JobCard";
import { JOBS } from "@/components/career/jobsData";
import { getChosenCareer } from "@/lib/userState";
import { SEO } from "@/components/SEO";

/* WorthScope — Career Opportunities Page
   Two complete states (locked / unlocked) toggleable via
   localStorage key "worthscope_career_unlocked". */

const FILTERS = [
  { key: "all", label: "All Roles" },
  { key: "remote", label: "Remote" },
  { key: "intern", label: "Intern" },
  { key: "entry", label: "Entry Level" },
  { key: "nigeria", label: "Nigeria" },
];

const Career = () => {
  // ---------- unlock state ----------
  const [unlocked, setUnlocked] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("worthscope_career_unlocked") === "true";
  });

  // ---------- celebration banner (one-time) ----------
  const [showBanner, setShowBanner] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("worthscope_career_seen") !== "true";
  });

  // ---------- filter chips ----------
  const [activeFilter, setActiveFilter] = useState<string>("all");

  // ---------- live progress numbers ----------
  const [overallPct, setOverallPct] = useState(1);
  const [missionsDone, setMissionsDone] = useState(0);
  const [overallFill, setOverallFill] = useState(0);
  useEffect(() => {
    const pr = JSON.parse(localStorage.getItem("worthscope_progress") || "{}");
    const pct = Math.max(1, Number(pr?.overallPct) || 1);
    const md = Number(pr?.missionsCompleted) || 0;
    setOverallPct(pct);
    setMissionsDone(md);
    const t = window.setTimeout(() => setOverallFill(pct), 200);
    return () => clearTimeout(t);
  }, []);

  // ---------- readiness ring stroke ----------
  const [ringFill, setRingFill] = useState(0);
  useEffect(() => {
    if (!unlocked) return;
    const t = window.setTimeout(() => setRingFill(85), 250);
    return () => clearTimeout(t);
  }, [unlocked]);

  const chosenCategory = getChosenCareer()?.category;
  const careerScopedJobs = useMemo(
    () => (chosenCategory ? JOBS.filter((j) => j.category === chosenCategory) : JOBS),
    [chosenCategory]
  );

  const filteredJobs = useMemo(
    () => careerScopedJobs.filter((j) => j.filters.includes(activeFilter)),
    [activeFilter, careerScopedJobs]
  );

  const toggleUnlock = () => {
    const next = !unlocked;
    setUnlocked(next);
    localStorage.setItem("worthscope_career_unlocked", String(next));
    if (!next) {
      // re-show banner next time it unlocks
      localStorage.removeItem("worthscope_career_seen");
      setShowBanner(true);
    }
  };

  const dismissBanner = () => {
    setShowBanner(false);
    localStorage.setItem("worthscope_career_seen", "true");
  };

  // ===================================================
  return (
    <div className="min-h-screen" style={{ background: "#F4F9FE", fontFamily: "'Poppins', sans-serif" }}>
      <SEO
        title="Career Opportunities — WorthScope"
        description="Browse curated job and opportunity listings aligned with your chosen career path."
        path="/career"
      />
      <Sidebar activePath="/career" />

      {/* Top bar */}
      <header
        className="sticky top-0 z-30 flex h-16 items-center justify-between border-b px-4 backdrop-blur-xl md:ml-[220px] md:px-8"
        style={{ background: "rgba(255,255,255,0.88)", borderColor: "#E5E7EB" }}
      >
        <h1 style={{ fontWeight: 600, fontSize: 18, color: "#111111" }}>Career Opportunities</h1>

        <div className="flex items-center gap-3">
          {unlocked ? (
            <span
              style={{
                background: "#EBF5FB",
                border: "1px solid rgba(52,152,219,0.2)",
                borderRadius: 100,
                padding: "6px 14px",
                fontWeight: 600,
                fontSize: 12,
                color: "#3498DB",
              }}
            >
              {filteredJobs.length} roles matched
            </span>
          ) : (
            <span className="flex items-center gap-1.5" style={{ fontWeight: 500, fontSize: 13, color: "#9CA3AF" }}>
              <IconLock className="h-4 w-4" />
              Locked
            </span>
          )}

          {/* Demo toggle — easy state switching */}
          <button
            onClick={toggleUnlock}
            title="Toggle locked / unlocked (demo)"
            style={{
              background: "transparent",
              border: "1px dashed #9CA3AF",
              borderRadius: 8,
              padding: "5px 10px",
              fontSize: 11,
              color: "#6B7280",
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            {unlocked ? "Demo: Lock" : "Demo: Unlock"}
          </button>

          <button className="relative" aria-label="Notifications" style={{ color: "#6B7280" }}>
            <IconBell className="h-5 w-5" />
            <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full" style={{ background: "#EF4444" }} />
          </button>
        </div>
      </header>

      <main className="px-4 pb-24 pt-8 md:ml-[220px] md:px-12 md:pt-10">
        <div className="mx-auto w-full max-w-[860px]">
          {unlocked ? (
            // ============================================
            // STATE B — UNLOCKED
            // ============================================
            <>
              {/* Celebration banner (one-time) */}
              {showBanner && (
                <div
                  className="ws-fade-up mb-7 flex items-start justify-between gap-4 rounded-[20px] p-6 md:p-7"
                  style={{
                    background: "linear-gradient(135deg, #EBF5FB, #F0FFF4)",
                    border: "1px solid rgba(52,152,219,0.2)",
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 18, color: "#111111" }}>
                      🎉 Career Opportunities Unlocked!
                    </div>
                    <div style={{ fontWeight: 400, fontSize: 14, color: "#6B7280", lineHeight: 1.65, marginTop: 6 }}>
                      You've completed enough of your journey to access matched job opportunities.
                      These roles are aligned with your skills and goals.
                    </div>
                  </div>
                  <button
                    onClick={dismissBanner}
                    style={{
                      background: "transparent",
                      border: "none",
                      color: "#9CA3AF",
                      fontWeight: 500,
                      fontSize: 13,
                      cursor: "pointer",
                      whiteSpace: "nowrap",
                      fontFamily: "inherit",
                    }}
                  >
                    ✕ Got it
                  </button>
                </div>
              )}

              {/* Readiness score card */}
              <div
                className="ws-fade-up mb-6 flex flex-col items-center gap-7 rounded-[20px] p-6 md:flex-row md:p-7"
                style={{
                  background: "#FFFFFF",
                  border: "1px solid #E5E7EB",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
                  animationDelay: "0.1s",
                }}
              >
                {/* Ring */}
                <div className="relative shrink-0" style={{ width: 90, height: 90 }}>
                  <svg width="90" height="90" viewBox="0 0 90 90">
                    <circle cx="45" cy="45" r="38" stroke="#E5E7EB" strokeWidth="8" fill="none" />
                    <circle
                      cx="45" cy="45" r="38"
                      stroke="#3498DB" strokeWidth="8" fill="none" strokeLinecap="round"
                      strokeDasharray={2 * Math.PI * 38}
                      strokeDashoffset={2 * Math.PI * 38 * (1 - ringFill / 100)}
                      transform="rotate(-90 45 45)"
                      style={{ transition: "stroke-dashoffset 1.2s ease" }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span style={{ fontWeight: 700, fontSize: 20, color: "#111111", lineHeight: 1 }}>85%</span>
                    <span style={{ fontWeight: 400, fontSize: 11, color: "#22C55E", marginTop: 2 }}>Ready</span>
                  </div>
                </div>

                <div>
                  <div
                    style={{
                      fontWeight: 600, fontSize: 11, color: "#3498DB",
                      textTransform: "uppercase", letterSpacing: 1.5,
                    }}
                  >
                    Your Career Readiness
                  </div>
                  <div style={{ fontWeight: 700, fontSize: 18, color: "#111111", letterSpacing: -0.3, marginTop: 8 }}>
                    You're 85% ready for your top matched role
                  </div>
                  <div style={{ fontWeight: 400, fontSize: 14, color: "#6B7280", lineHeight: 1.65, marginTop: 6 }}>
                    Based on your skills, missions, and submitted projects, here are the roles
                    that match your current profile.
                  </div>
                  <div className="mt-3.5 flex flex-wrap gap-2">
                    {["UI Design", "Problem Solving", "Technical Tools"].map((t) => (
                      <span
                        key={t}
                        style={{
                          background: "#EBF5FB",
                          border: "1px solid rgba(52,152,219,0.2)",
                          borderRadius: 100,
                          padding: "4px 12px",
                          fontWeight: 500,
                          fontSize: 12,
                          color: "#3498DB",
                        }}
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Koko insight */}
              <div
                className="ws-fade-up mb-6 flex items-start gap-3 rounded-[14px] p-4 md:p-5"
                style={{
                  background: "#EBF5FB",
                  borderLeft: "4px solid #3498DB",
                  animationDelay: "0.25s",
                }}
              >
                <div
                  className="grid shrink-0 place-items-center rounded-full"
                  style={{ width: 36, height: 36, background: "#3498DB", color: "white", fontWeight: 700 }}
                >
                  K
                </div>
                <p style={{ fontWeight: 400, fontSize: 14, color: "#111111", lineHeight: 1.65, margin: 0 }}>
                  You're ready. These roles align with your UI Design and Problem Solving strengths.
                  Start with the top match — you're well positioned for it.
                </p>
              </div>

              {/* Filter row */}
              <div
                className="ws-fade-up mb-5 flex items-center gap-2.5 overflow-x-auto md:flex-wrap"
                style={{ animationDelay: "0.4s" }}
              >
                <span style={{ fontWeight: 500, fontSize: 13, color: "#6B7280", whiteSpace: "nowrap" }}>
                  Filter by:
                </span>
                {FILTERS.map((f) => {
                  const active = activeFilter === f.key;
                  return (
                    <button
                      key={f.key}
                      onClick={() => setActiveFilter(f.key)}
                      style={{
                        background: active ? "#EBF5FB" : "#F4F9FE",
                        border: `1px solid ${active ? "#3498DB" : "#E5E7EB"}`,
                        color: active ? "#3498DB" : "#6B7280",
                        borderRadius: 100,
                        padding: "7px 16px",
                        fontWeight: 500,
                        fontSize: 13,
                        cursor: "pointer",
                        transition: "all 0.18s ease",
                        transform: active ? "scale(1.02)" : "scale(1)",
                        whiteSpace: "nowrap",
                        fontFamily: "inherit",
                      }}
                    >
                      {f.label}
                    </button>
                  );
                })}
              </div>

              {/* Job cards */}
              <div className="flex flex-col gap-4">
                {filteredJobs.length === 0 ? (
                  <div
                    className="rounded-[16px] p-8 text-center"
                    style={{ background: "#FFFFFF", border: "1px solid #E5E7EB", color: "#6B7280" }}
                  >
                    No roles match this filter yet.
                  </div>
                ) : (
                  filteredJobs.map((job, i) => <JobCard key={job.id} job={job} index={i} />)
                )}
              </div>
            </>
          ) : (
            // ============================================
            // STATE A — LOCKED
            // ============================================
            <>
              {/* Locked header */}
              <div className="ws-fade-up mb-8 text-center" style={{ padding: "40px 0" }}>
                <div style={{ display: "inline-block", animation: "ws-float 3s ease-in-out infinite" }}>
                  <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="4" y="11" width="16" height="10" rx="2" />
                    <path d="M8 11V8a4 4 0 0 1 8 0v3" />
                  </svg>
                </div>
                <h2
                  style={{
                    fontWeight: 700, fontSize: 28, color: "#111111",
                    letterSpacing: -0.5, marginTop: 16,
                  }}
                >
                  Career Opportunities
                </h2>
                <p
                  style={{
                    fontWeight: 400, fontSize: 15, color: "#6B7280",
                    maxWidth: 440, margin: "10px auto 0", lineHeight: 1.7,
                  }}
                >
                  Complete your roadmap to unlock matched job opportunities.
                  The more you learn, the better the roles you'll see.
                </p>
              </div>

              {/* Progress to unlock card */}
              <div
                className="ws-fade-up mx-auto mb-8 rounded-[20px] p-7 md:p-8"
                style={{
                  maxWidth: 560,
                  background: "#FFFFFF",
                  border: "1px solid #E5E7EB",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
                  animationDelay: "0.15s",
                }}
              >
                <h3 style={{ fontWeight: 700, fontSize: 16, color: "#111111" }}>Your Progress to Unlock</h3>

                <div className="mt-5 flex flex-col gap-4">
                  <RequirementRow met={overallPct >= 70} label="Roadmap Progress" sub={`${overallPct}% / 70% required`} />
                  <RequirementRow met={missionsDone >= 6} label="Missions Completed" sub={`${missionsDone} / 6 required`} />
                  <RequirementRow met={false} label="Project Submitted" sub="0 / 1 required" />
                </div>

                {/* Overall bar */}
                <div className="mt-6">
                  <div className="flex items-center justify-between" style={{ fontWeight: 500, fontSize: 13, color: "#111111" }}>
                    <span>Overall Readiness</span>
                    <span>{overallPct}%</span>
                  </div>
                  <div className="mt-2" style={{ height: 8, background: "#E5E7EB", borderRadius: 100, overflow: "hidden" }}>
                    <div
                      style={{
                        width: `${overallFill}%`,
                        height: "100%",
                        background: "#3498DB",
                        borderRadius: 100,
                        transition: "width 1s ease-out",
                      }}
                    />
                  </div>
                </div>

                {/* Koko message */}
                <div
                  className="mt-4 flex items-start gap-3 rounded-[10px] p-3 md:p-4"
                  style={{ background: "#EBF5FB" }}
                >
                  <div
                    className="grid shrink-0 place-items-center rounded-full"
                    style={{ width: 28, height: 28, background: "#3498DB", color: "white", fontWeight: 700, fontSize: 12 }}
                  >
                    K
                  </div>
                  <p style={{ fontWeight: 400, fontSize: 13, color: "#111111", margin: 0, lineHeight: 1.55 }}>
                    Complete your next phase to unlock job opportunities. You're closer than you think.
                  </p>
                </div>
              </div>

              {/* Blurred teasers */}
              <div className="mb-3" style={{ fontWeight: 600, fontSize: 13, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: 1.5 }}>
                What's waiting for you 👀
              </div>
              <div className="flex flex-col gap-3">
                {JOBS.slice(0, 3).map((j) => (
                  <div
                    key={j.id}
                    className="relative overflow-hidden rounded-[16px] p-5 md:p-6"
                    style={{ background: "#FFFFFF", border: "1px solid #E5E7EB" }}
                  >
                    {/* Blurred content */}
                    <div
                      style={{
                        filter: "blur(5px)",
                        userSelect: "none",
                        pointerEvents: "none",
                      }}
                      className="flex items-start justify-between"
                    >
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 17, color: "#111111" }}>{j.title}</div>
                        <div style={{ fontWeight: 400, fontSize: 13, color: "#6B7280", marginTop: 2 }}>
                          {j.company} · {j.tags[0]}
                        </div>
                      </div>
                      <div
                        style={{
                          background: "#EBF5FB",
                          border: "1px solid rgba(52,152,219,0.2)",
                          borderRadius: 100,
                          padding: "5px 14px",
                          fontWeight: 700, fontSize: 14, color: "#3498DB",
                        }}
                      >
                        {j.match}% match
                      </div>
                    </div>

                    {/* Lock overlay */}
                    <div
                      className="absolute inset-0 flex flex-col items-center justify-center"
                      style={{ background: "rgba(255,255,255,0.6)", backdropFilter: "blur(4px)" }}
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="4" y="11" width="16" height="10" rx="2" />
                        <path d="M8 11V8a4 4 0 0 1 8 0v3" />
                      </svg>
                      <span style={{ fontWeight: 500, fontSize: 13, color: "#9CA3AF", marginTop: 6 }}>
                        Unlock to view
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </main>

      <MobileTabBar />
    </div>
  );
};

/* Requirement row — used in the locked progress card */
const RequirementRow = ({ met, label, sub }: { met: boolean; label: string; sub: string }) => (
  <div className="flex items-center gap-3">
    <div
      className="grid shrink-0 place-items-center rounded-full"
      style={{
        width: 28, height: 28,
        background: met ? "#22C55E" : "#F3F4F6",
        border: met ? "none" : "1.5px solid #E5E7EB",
      }}
    >
      {met ? (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <path d="m5 12 5 5L20 7" />
        </svg>
      ) : (
        <span style={{ width: 10, height: 1.5, background: "#9CA3AF", display: "block" }} />
      )}
    </div>
    <span className="flex-1" style={{ fontWeight: 500, fontSize: 14, color: met ? "#111111" : "#6B7280" }}>
      {label}
    </span>
    <span style={{ fontWeight: 400, fontSize: 12, color: met ? "#3498DB" : "#9CA3AF" }}>{sub}</span>
  </div>
);

export default Career;
