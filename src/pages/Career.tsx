import { useEffect, useMemo, useState, useCallback } from "react";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { MobileTabBar } from "@/components/dashboard/MobileTabBar";
import { IconBell, IconLock } from "@/components/dashboard/icons";
import { UnifiedJobCard } from "@/components/career/UnifiedJobCard";
import { JobDetailModal } from "@/components/career/JobDetailModal";
import { getChosenCareer, getProgress } from "@/lib/userState";
import { loadRoadmap, getOverallProgress } from "@/lib/kokoRoadmap";
import { fetchJobs, type UnifiedJob } from "@/lib/jobsClient";
import { getActiveModule, loadModuleForCareer } from "@/lib/careerModules";
import { SEO } from "@/components/SEO";

const UNLOCK_THRESHOLD = 70;
const ACCENT = "#895AF6";

const FILTERS = [
  { key: "all", label: "All Roles" },
  { key: "remote", label: "Remote" },
  { key: "intern", label: "Intern" },
  { key: "entry", label: "Entry Level" },
  { key: "nigeria", label: "Nigeria" },
];

const NIGERIAN_CITIES = ["nigeria", "lagos", "abuja", "ibadan", "port harcourt", "kano", "benin"];

function matchesFilter(job: UnifiedJob, filter: string): boolean {
  const loc = job.location.toLowerCase();
  const type = job.job_type.toLowerCase();
  switch (filter) {
    case "all":
      return true;
    case "remote":
      return type.includes("remote") || loc.includes("remote");
    case "intern":
      return type.includes("intern");
    case "entry":
      return (
        type.includes("entry") ||
        type === "full-time" ||
        type === "fulltime" ||
        type === "remote"
      ) && !type.includes("intern");
    case "nigeria":
      return NIGERIAN_CITIES.some((c) => loc.includes(c));
    default:
      return true;
  }
}

const Career = () => {
  // ---------- progress + unlock ----------
  const [overallPct, setOverallPct] = useState(0);
  const [overallFill, setOverallFill] = useState(0);
  const unlocked = overallPct >= UNLOCK_THRESHOLD;

  useEffect(() => {
    const compute = () => {
      const rm = loadRoadmap();
      const pct = rm ? getOverallProgress(rm) : Number(getProgress().overallPct) || 0;
      setOverallPct(pct);
      window.setTimeout(() => setOverallFill(pct), 200);
    };
    compute();
    window.addEventListener("worthscope:roadmap", compute);
    window.addEventListener("worthscope:progress", compute);
    return () => {
      window.removeEventListener("worthscope:roadmap", compute);
      window.removeEventListener("worthscope:progress", compute);
    };
  }, []);

  // ---------- filters ----------
  const [activeFilter, setActiveFilter] = useState<string>("all");

  // ---------- top skills (for Koko message + match calc) ----------
  const topSkills = useMemo(() => {
    const mod = getActiveModule() || loadModuleForCareer(getChosenCareer());
    const pr = getProgress();
    const list = mod.skills
      .map((s) => ({ name: s.name, pct: pr.skills[s.name] || 0 }))
      .sort((a, b) => b.pct - a.pct);
    return list;
  }, [overallPct]);

  const topTwoSkillNames = topSkills.slice(0, 2).filter((s) => s.pct > 0).map((s) => s.name);
  const userSkillList = topSkills.map((s) => s.name);

  // ---------- jobs ----------
  const [jobs, setJobs] = useState<UnifiedJob[]>([]);
  const [loadingJobs, setLoadingJobs] = useState(false);
  const [jobsPartial, setJobsPartial] = useState(false);
  const [jobsErrored, setJobsErrored] = useState(false);
  const [showFullError, setShowFullError] = useState(false);

  const career = getChosenCareer();

  const loadJobs = useCallback(async () => {
    if (!unlocked) return;
    setLoadingJobs(true);
    setShowFullError(false);
    const careerKey = (career?.category || career?.title || "").toLowerCase();
    const res = await fetchJobs({
      careerPath: careerKey,
      location: "Nigeria",
      userSkills: userSkillList,
    });
    setJobs(res.jobs);
    setJobsPartial(res.partial);
    setJobsErrored(res.errored);
    if (res.jobs.length === 0) setShowFullError(true);
    setLoadingJobs(false);
  }, [unlocked, career?.category, career?.title, userSkillList.join(",")]);

  useEffect(() => {
    loadJobs();
  }, [loadJobs]);

  // ---------- view modal ----------
  const [modalJob, setModalJob] = useState<UnifiedJob | null>(null);

  const filteredJobs = useMemo(
    () => jobs.filter((j) => matchesFilter(j, activeFilter)),
    [jobs, activeFilter],
  );

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
                background: "#F3EEFF",
                border: `1px solid ${ACCENT}33`,
                borderRadius: 100,
                padding: "6px 14px",
                fontWeight: 600,
                fontSize: 12,
                color: ACCENT,
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
              {/* Koko message */}
              <div
                className="ws-fade-up mb-6 flex items-start gap-3 rounded-[14px] p-4 md:p-5"
                style={{
                  background: "#F3EEFF",
                  borderLeft: `4px solid ${ACCENT}`,
                }}
              >
                <div
                  className="grid shrink-0 place-items-center rounded-full"
                  style={{ width: 36, height: 36, background: ACCENT, color: "white", fontWeight: 700 }}
                >
                  K
                </div>
                <p style={{ fontWeight: 400, fontSize: 14, color: "#111111", lineHeight: 1.65, margin: 0 }}>
                  You're ready. These roles align with your{" "}
                  <strong>
                    {topTwoSkillNames.length >= 2
                      ? `${topTwoSkillNames[0]} and ${topTwoSkillNames[1]}`
                      : topTwoSkillNames[0] || "current"}{" "}
                  </strong>
                  strengths. Start with the top match — you're well positioned for it.
                </p>
              </div>

              {/* Filter row */}
              <div
                className="ws-fade-up mb-5 flex items-center gap-2.5 overflow-x-auto md:flex-wrap"
                style={{ animationDelay: "0.1s" }}
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
                        background: active ? "#F3EEFF" : "#F4F9FE",
                        border: `1px solid ${active ? ACCENT : "#E5E7EB"}`,
                        color: active ? ACCENT : "#6B7280",
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

              {jobsPartial && (
                <div
                  className="mb-3 rounded-[12px] p-3 text-center"
                  style={{ background: "#FFF8E1", border: "1px solid #FCD34D44", color: "#92400E", fontSize: 12 }}
                >
                  Some additional listings couldn't be loaded right now.
                </div>
              )}

              {/* Job cards */}
              <div className="flex flex-col gap-4">
                {loadingJobs ? (
                  <div
                    className="rounded-[16px] p-8 text-center"
                    style={{ background: "#FFFFFF", border: "1px solid #E5E7EB", color: "#6B7280" }}
                  >
                    Loading roles tailored to you…
                  </div>
                ) : showFullError ? (
                  <div
                    className="rounded-[16px] p-8 text-center"
                    style={{ background: "#FFFFFF", border: "1px solid #E5E7EB", color: "#6B7280" }}
                  >
                    <p style={{ marginBottom: 12 }}>
                      We're having trouble loading jobs right now. Please try again in a moment.
                    </p>
                    <button
                      onClick={loadJobs}
                      style={{
                        background: ACCENT,
                        color: "white",
                        border: "none",
                        borderRadius: 10,
                        padding: "10px 18px",
                        fontWeight: 600,
                        fontSize: 13,
                        cursor: "pointer",
                        fontFamily: "inherit",
                      }}
                    >
                      Retry
                    </button>
                  </div>
                ) : filteredJobs.length === 0 ? (
                  <div
                    className="rounded-[16px] p-8 text-center"
                    style={{ background: "#FFFFFF", border: "1px solid #E5E7EB", color: "#6B7280" }}
                  >
                    No roles match this filter yet.
                  </div>
                ) : (
                  filteredJobs.map((job, i) => (
                    <UnifiedJobCard key={job.id} job={job} index={i} onView={setModalJob} />
                  ))
                )}
              </div>
            </>
          ) : (
            // ============================================
            // STATE A — LOCKED
            // ============================================
            <>
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
                  Complete {UNLOCK_THRESHOLD}% of your roadmap to unlock job opportunities.
                  The more you learn, the better the roles you'll see.
                </p>
              </div>

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

                <div className="mt-5">
                  <div className="flex items-center justify-between" style={{ fontWeight: 500, fontSize: 13, color: "#111111" }}>
                    <span>Roadmap Progress</span>
                    <span>{overallPct}% / {UNLOCK_THRESHOLD}%</span>
                  </div>
                  <div className="mt-2" style={{ height: 8, background: "#E5E7EB", borderRadius: 100, overflow: "hidden" }}>
                    <div
                      style={{
                        width: `${Math.min(100, overallFill)}%`,
                        height: "100%",
                        background: ACCENT,
                        borderRadius: 100,
                        transition: "width 1s ease-out",
                      }}
                    />
                  </div>
                </div>

                <div
                  className="mt-4 flex items-start gap-3 rounded-[10px] p-3 md:p-4"
                  style={{ background: "#F3EEFF" }}
                >
                  <div
                    className="grid shrink-0 place-items-center rounded-full"
                    style={{ width: 28, height: 28, background: ACCENT, color: "white", fontWeight: 700, fontSize: 12 }}
                  >
                    K
                  </div>
                  <p style={{ fontWeight: 400, fontSize: 13, color: "#111111", margin: 0, lineHeight: 1.55 }}>
                    Complete your next phase to unlock job opportunities. You're closer than you think.
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
      </main>

      <JobDetailModal job={modalJob} userSkills={userSkillList} onClose={() => setModalJob(null)} />

      <MobileTabBar />
    </div>
  );
};

export default Career;
