import { useEffect, useState } from "react";
import type { UnifiedJob } from "@/lib/jobsClient";

type Props = {
  job: UnifiedJob;
  index: number;
  onView: (job: UnifiedJob) => void;
};

const ACCENT = "#895AF6";

function timeAgo(iso: string): string {
  const d = new Date(iso).getTime();
  if (!d) return "recently";
  const diff = Date.now() - d;
  const day = 24 * 60 * 60 * 1000;
  if (diff < day) return "today";
  const days = Math.floor(diff / day);
  if (days < 7) return `${days} day${days === 1 ? "" : "s"} ago`;
  const wks = Math.floor(days / 7);
  if (wks < 5) return `${wks} week${wks === 1 ? "" : "s"} ago`;
  const mo = Math.floor(days / 30);
  return `${mo} month${mo === 1 ? "" : "s"} ago`;
}

export const UnifiedJobCard = ({ job, index, onView }: Props) => {
  const [barFill, setBarFill] = useState(0);
  useEffect(() => {
    const t = window.setTimeout(() => setBarFill(job.match_percentage), 300 + index * 120);
    return () => clearTimeout(t);
  }, [job.match_percentage, index]);

  const initial = job.company?.[0]?.toUpperCase() || "?";

  return (
    <article
      className="rounded-[18px] border bg-white p-6 md:p-7"
      style={{
        borderColor: "#E5E7EB",
        boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
        transition: "all 0.2s ease",
        opacity: 0,
        animation: `ws-fade-up 0.45s ease-out ${index * 0.1}s forwards`,
      }}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3.5">
          {job.company_logo_url ? (
            <img
              src={job.company_logo_url}
              alt={job.company}
              style={{ width: 40, height: 40, borderRadius: 10, objectFit: "cover", background: "#F3EEFF" }}
            />
          ) : (
            <div
              className="grid h-10 w-10 shrink-0 place-items-center rounded-[10px]"
              style={{ background: "#F3EEFF", color: ACCENT, fontWeight: 700, fontSize: 18 }}
            >
              {initial}
            </div>
          )}
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
            background: "#F3EEFF",
            border: `1px solid ${ACCENT}33`,
            borderRadius: 100,
            padding: "5px 14px",
            fontWeight: 700,
            fontSize: 14,
            color: ACCENT,
          }}
        >
          {job.match_percentage}% match
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <Tag>📍 {job.location}</Tag>
        <Tag>💼 {job.job_type}</Tag>
        {job.salary_range && <Tag>💰 {job.salary_range}</Tag>}
      </div>

      <div className="mt-3.5 flex items-center gap-2.5">
        <div style={{ width: 160, height: 5, background: "#E5E7EB", borderRadius: 100, overflow: "hidden" }}>
          <div
            style={{
              width: `${barFill}%`,
              height: "100%",
              background: ACCENT,
              borderRadius: 100,
              transition: "width 0.9s ease-out",
            }}
          />
        </div>
        <span style={{ fontWeight: 500, fontSize: 12, color: ACCENT }}>
          You're {job.match_percentage}% ready for this role
        </span>
      </div>

      <div
        className="mt-4 flex flex-col gap-3 pt-4 sm:flex-row sm:items-center sm:justify-between"
        style={{ borderTop: "1px solid #E5E7EB" }}
      >
        <span style={{ fontWeight: 400, fontSize: 12, color: "#9CA3AF" }}>
          Posted {timeAgo(job.posted_at)}{job.source === "jsearch" ? " · via JSearch" : ""}
        </span>
        <div className="flex flex-col gap-2.5 sm:flex-row">
          <button
            onClick={() => onView(job)}
            style={{
              background: "transparent",
              border: "1.5px solid #E5E7EB",
              borderRadius: 10,
              padding: "9px 18px",
              fontWeight: 600,
              fontSize: 13,
              color: "#6B7280",
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            View Job
          </button>
          <a
            href={job.apply_url}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              background: ACCENT,
              color: "#FFFFFF",
              border: "none",
              borderRadius: 10,
              padding: "9px 18px",
              fontWeight: 600,
              fontSize: 13,
              cursor: "pointer",
              textDecoration: "none",
              textAlign: "center",
            }}
          >
            Apply Now
          </a>
        </div>
      </div>
    </article>
  );
};

const Tag = ({ children }: { children: React.ReactNode }) => (
  <span
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
    {children}
  </span>
);
