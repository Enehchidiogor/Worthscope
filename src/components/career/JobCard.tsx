import { useEffect, useState } from "react";
import type { Job } from "./jobsData";

/* Single job card — used on the unlocked Career Opportunities page. */
export const JobCard = ({ job, index }: { job: Job; index: number }) => {
  const [barFill, setBarFill] = useState(0);

  // Animate the readiness bar from 0% on mount, staggered per card
  useEffect(() => {
    const t = window.setTimeout(() => setBarFill(job.readiness), 300 + index * 150);
    return () => clearTimeout(t);
  }, [job.readiness, index]);

  return (
    <article
      className="group cursor-pointer rounded-[18px] border bg-white p-6 md:p-7"
      style={{
        borderColor: "#E5E7EB",
        boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
        transition: "all 0.2s ease",
        opacity: 0,
        animation: `ws-fade-up 0.45s ease-out ${index * 0.12}s forwards`,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-2px)";
        e.currentTarget.style.boxShadow = "0 8px 32px rgba(52,152,219,0.12)";
        e.currentTarget.style.borderColor = "rgba(52,152,219,0.3)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "0 2px 12px rgba(0,0,0,0.05)";
        e.currentTarget.style.borderColor = "#E5E7EB";
      }}
    >
      {/* Top row */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3.5">
          <div
            className="grid h-10 w-10 shrink-0 place-items-center rounded-[10px]"
            style={{ background: "#EBF5FB", color: "#3498DB", fontWeight: 700, fontSize: 18 }}
          >
            {job.initial}
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 17, color: "#111111", lineHeight: 1.3 }}>
              {job.title}
            </div>
            <div style={{ fontWeight: 400, fontSize: 13, color: "#6B7280", marginTop: 2 }}>
              {job.company}
            </div>
          </div>
        </div>

        <div
          className="self-start"
          style={{
            background: "#EBF5FB",
            border: "1px solid rgba(52,152,219,0.2)",
            borderRadius: 100,
            padding: "5px 14px",
            fontWeight: 700,
            fontSize: 14,
            color: "#3498DB",
          }}
        >
          {job.match}% match
        </div>
      </div>

      {/* Meta tags */}
      <div className="mt-4 flex flex-wrap gap-2">
        {job.tags.map((t) => (
          <span
            key={t}
            style={{
              background: "#F4F9FE",
              border: "1px solid #E5E7EB",
              borderRadius: 100,
              padding: "4px 12px",
              fontWeight: 400,
              fontSize: 12,
              color: "#6B7280",
            }}
          >
            {t}
          </span>
        ))}
      </div>

      {/* Why it matches */}
      <div className="mt-3.5">
        <div
          style={{
            fontWeight: 600,
            fontSize: 10,
            color: "#3498DB",
            textTransform: "uppercase",
            letterSpacing: 1.5,
          }}
        >
          Why it matches
        </div>
        <div style={{ fontWeight: 400, fontSize: 13, color: "#6B7280", marginTop: 4, lineHeight: 1.55 }}>
          {job.why}
        </div>
      </div>

      {/* Readiness */}
      <div className="mt-3.5 flex items-center gap-2.5">
        <div style={{ width: 160, height: 5, background: "#E5E7EB", borderRadius: 100, overflow: "hidden" }}>
          <div
            style={{
              width: `${barFill}%`,
              height: "100%",
              background: "#3498DB",
              borderRadius: 100,
              transition: "width 0.9s ease-out",
            }}
          />
        </div>
        <span style={{ fontWeight: 500, fontSize: 12, color: "#3498DB" }}>
          You're {job.readiness}% ready for this role
        </span>
      </div>

      {/* Improvement suggestion (only if readiness < 90) */}
      {job.readiness < 90 && job.suggestion && (
        <div className="mt-2 flex items-center gap-1.5" style={{ color: "#F59E0B" }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" />
            <path d="M12 9v4M12 17h.01" />
          </svg>
          <span style={{ fontWeight: 400, fontSize: 12, color: "#F59E0B" }}>{job.suggestion}</span>
        </div>
      )}

      {/* Bottom row */}
      <div
        className="mt-4 flex flex-col gap-3 pt-4 sm:flex-row sm:items-center sm:justify-between"
        style={{ borderTop: "1px solid #E5E7EB" }}
      >
        <span style={{ fontWeight: 400, fontSize: 12, color: "#9CA3AF" }}>Posted {job.posted}</span>
        <div className="flex flex-col gap-2.5 sm:flex-row">
          <button
            className="career-btn-secondary"
            style={{
              background: "transparent",
              border: "1.5px solid #E5E7EB",
              borderRadius: 10,
              padding: "9px 18px",
              fontWeight: 600,
              fontSize: 13,
              color: "#6B7280",
              cursor: "pointer",
              transition: "all 0.18s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "#3498DB";
              e.currentTarget.style.color = "#3498DB";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "#E5E7EB";
              e.currentTarget.style.color = "#6B7280";
            }}
          >
            View Job
          </button>
          <button
            style={{
              background: "#3498DB",
              color: "#FFFFFF",
              border: "none",
              borderRadius: 10,
              padding: "9px 18px",
              fontWeight: 600,
              fontSize: 13,
              cursor: "pointer",
              transition: "all 0.18s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#217DBB";
              e.currentTarget.style.boxShadow = "0 4px 14px rgba(52,152,219,0.3)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "#3498DB";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            Apply Now
          </button>
        </div>
      </div>
    </article>
  );
};
