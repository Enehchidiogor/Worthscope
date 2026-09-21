import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { IconLock } from "./icons";
import { JOBS } from "@/components/career/jobsData";
import { loadResults, type CareerResult } from "@/lib/recommendationEngine";

/* Career Opportunities — dashboard card.
   Shows BOTH locked + unlocked variants, switched
   by localStorage "worthscope_career_unlocked".
   When the user has completed the assessment, the unlocked
   variant surfaces their real top matches instead of mock jobs. */

export const CareerOpportunitiesCard = () => {
  const [unlocked, setUnlocked] = useState(false);
  const [fill, setFill] = useState(0);
  const [results, setResults] = useState<CareerResult[]>([]);
  const [hasAssessment, setHasAssessment] = useState(false);

  useEffect(() => {
    setUnlocked(localStorage.getItem("worthscope_career_unlocked") === "true");
    setHasAssessment(!!localStorage.getItem("worthscope_results"));
    setResults(loadResults());
    // Read real overall progress
    const pr = JSON.parse(localStorage.getItem("worthscope_progress") || "{}");
    const real = Math.max(1, Number(pr?.overallPct) || 1);
    const t = window.setTimeout(() => setFill(real), 200);
    return () => clearTimeout(t);
  }, []);


  // ===== UNLOCKED =====
  if (unlocked) {
    // If user took assessment, show top 2 career matches; else fall back to mock jobs.
    const preview = hasAssessment ? results.slice(0, 2) : null;

    return (
      <section
        className="ws-fade-up rounded-[20px] p-6 md:p-7"
        style={{
          background: "#FFFFFF",
          border: "1px solid #E5E7EB",
          boxShadow: "0 1px 2px rgba(0,0,0,0.04), 0 8px 24px rgba(59,130,246,0.06)",
          animationDelay: "0.75s",
        }}
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 style={{ fontWeight: 700, fontSize: 16, color: "#111111" }}>💼 Career Opportunities</h3>
          <Link
            to={hasAssessment ? "/career-results" : "/career"}
            style={{ fontWeight: 600, fontSize: 13, color: "#3B82F6" }}
          >
            {hasAssessment ? `${results.length} matches →` : `${JOBS.length} roles matched →`}
          </Link>
        </div>

        <div className="flex flex-col gap-2.5">
          {preview
            ? preview.map((r) => (
                <Link
                  key={r.title}
                  to="/career-results"
                  className="flex items-center justify-between"
                  style={{
                    background: "#F4F9FE",
                    border: "1px solid #E5E7EB",
                    borderRadius: 12,
                    padding: "12px 16px",
                    textDecoration: "none",
                    transition: "all 0.18s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "#EBF5FB";
                    e.currentTarget.style.borderColor = "rgba(59,130,246,0.3)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "#F4F9FE";
                    e.currentTarget.style.borderColor = "#E5E7EB";
                  }}
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className="grid place-items-center rounded-md"
                      style={{ width: 28, height: 28, background: "#EBF5FB", color: "#3B82F6", fontWeight: 700, fontSize: 13 }}
                    >
                      #{r.rank}
                    </div>
                    <div style={{ fontWeight: 600, fontSize: 13, color: "#111111" }}>{r.title}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span style={{ fontWeight: 700, fontSize: 12, color: "#3B82F6" }}>{r.percentage}%</span>
                    <span style={{ fontWeight: 600, fontSize: 12, color: "#3B82F6" }}>View →</span>
                  </div>
                </Link>
              ))
            : JOBS.slice(0, 2).map((j) => (
                <Link
                  key={j.id}
                  to="/career"
                  className="flex items-center justify-between"
                  style={{
                    background: "#F4F9FE", border: "1px solid #E5E7EB", borderRadius: 12,
                    padding: "12px 16px", textDecoration: "none", transition: "all 0.18s ease",
                  }}
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className="grid place-items-center rounded-md"
                      style={{ width: 28, height: 28, background: "#EBF5FB", color: "#3B82F6", fontWeight: 700, fontSize: 13 }}
                    >
                      {j.initial}
                    </div>
                    <div style={{ fontWeight: 600, fontSize: 13, color: "#111111" }}>{j.title}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span style={{ fontWeight: 700, fontSize: 12, color: "#3B82F6" }}>{j.match}%</span>
                    <span style={{ fontWeight: 600, fontSize: 12, color: "#3B82F6" }}>Apply →</span>
                  </div>
                </Link>
              ))}
        </div>

        <div className="mt-4 text-center">
          <Link
            to={hasAssessment ? "/career-results" : "/career"}
            style={{ fontWeight: 600, fontSize: 13, color: "#3B82F6" }}
            className="hover:underline"
          >
            {hasAssessment ? "View all career matches →" : "View all matched roles →"}
          </Link>
        </div>
      </section>
    );
  }

  // ===== LOCKED =====
  return (
    <section
      className="ws-fade-up rounded-[20px] p-6 md:p-7"
      style={{
        background: "#FFFFFF",
        border: "1px solid #E5E7EB",
        boxShadow: "0 1px 2px rgba(0,0,0,0.04), 0 8px 24px rgba(59,130,246,0.06)",
        animationDelay: "0.75s",
      }}
    >
      <div className="mb-4 flex items-center justify-between">
        <h3 style={{ fontWeight: 700, fontSize: 16, color: "#111111" }}>💼 Career Opportunities</h3>
        <span className="flex items-center gap-1.5" style={{ fontWeight: 500, fontSize: 12, color: "#9CA3AF" }}>
          <IconLock className="h-3.5 w-3.5" />
          Locked
        </span>
      </div>

      {/* Big lock with radial glow */}
      <div
        className="grid place-items-center"
        style={{
          background: "radial-gradient(circle, rgba(156,163,175,0.1), transparent 70%)",
          padding: "20px 0",
        }}
      >
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <rect x="4" y="11" width="16" height="10" rx="2" />
          <path d="M8 11V8a4 4 0 0 1 8 0v3" />
        </svg>
      </div>

      <p
        className="text-center"
        style={{ fontWeight: 400, fontSize: 14, color: "#6B7280", marginTop: 12 }}
      >
        Complete 70% of your roadmap to unlock job opportunities.
      </p>

      {/* Progress toward unlock */}
      <div className="mt-5">
        <div className="flex items-center justify-between" style={{ fontWeight: 500, fontSize: 12, color: "#6B7280" }}>
          <span>Roadmap Progress</span>
          <span>{fill}% / 70%</span>
        </div>
        <div className="mt-1.5" style={{ height: 6, background: "#E5E7EB", borderRadius: 100, overflow: "hidden" }}>
          <div
            style={{
              width: `${fill}%`,
              height: "100%",
              background: "#3B82F6",
              borderRadius: 100,
              transition: "width 1s ease-out",
            }}
          />
        </div>
      </div>

      {/* Blurred teaser chips */}
      <div className="mt-5 flex flex-wrap gap-2">
        {["Product Designer — 92%", "UI/UX Intern — 85%", "Junior PM — 78%"].map((t) => (
          <span
            key={t}
            style={{
              background: "#F3F4F6",
              color: "transparent",
              borderRadius: 100,
              padding: "5px 14px",
              fontSize: 12,
              filter: "blur(3px)",
              userSelect: "none",
            }}
          >
            {t}
          </span>
        ))}
      </div>
      <div className="mt-4 text-center">
        <Link
          to="/assessment"
          style={{
            display: "inline-block",
            background: "#3B82F6",
            color: "#FFFFFF",
            fontWeight: 600,
            fontSize: 13,
            padding: "10px 18px",
            borderRadius: 10,
            textDecoration: "none",
          }}
        >
          {hasAssessment ? "Retake Assessment →" : "Take Assessment →"}
        </Link>
        <div className="mt-2" style={{ fontWeight: 500, fontSize: 12, color: "#9CA3AF" }}>
          Unlock your real career matches in ~3 minutes
        </div>
      </div>

    </section>
  );
};
