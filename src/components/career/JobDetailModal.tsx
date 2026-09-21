import { useEffect } from "react";
import type { UnifiedJob } from "@/lib/jobsClient";

type Props = {
  job: UnifiedJob | null;
  userSkills: string[];
  onClose: () => void;
};

const ACCENT = "#3498DB";

export const JobDetailModal = ({ job, userSkills, onClose }: Props) => {
  useEffect(() => {
    if (!job) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [job, onClose]);

  if (!job) return null;

  const matchedSkills = userSkills.filter((s) =>
    job.requirements.some(
      (r) =>
        r.toLowerCase().includes(s.toLowerCase()) ||
        s.toLowerCase().includes(r.toLowerCase()),
    ),
  );

  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(17, 17, 17, 0.55)",
        zIndex: 80,
        display: "grid",
        placeItems: "center",
        padding: "20px",
        fontFamily: "'Poppins', sans-serif",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#FFFFFF",
          borderRadius: 20,
          maxWidth: 640,
          width: "100%",
          maxHeight: "90vh",
          overflowY: "auto",
          padding: "28px",
          boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
          position: "relative",
        }}
      >
        <button
          aria-label="Close"
          onClick={onClose}
          style={{
            position: "absolute",
            top: 16,
            right: 16,
            background: "transparent",
            border: "none",
            cursor: "pointer",
            fontSize: 22,
            color: "#9CA3AF",
            lineHeight: 1,
          }}
        >
          ×
        </button>

        <div style={{ fontWeight: 700, fontSize: 22, color: "#111111", letterSpacing: -0.3, paddingRight: 28 }}>
          {job.title}
        </div>
        <div style={{ fontWeight: 500, fontSize: 14, color: "#6B7280", marginTop: 4 }}>
          {job.company}
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          <Tag>📍 {job.location}</Tag>
          <Tag>💼 {job.job_type}</Tag>
          {job.salary_range && <Tag>💰 {job.salary_range}</Tag>}
          <Tag>
            <span style={{ color: ACCENT, fontWeight: 700 }}>{job.match_percentage}% match</span>
          </Tag>
        </div>

        <Section title="About the role">
          <p style={{ fontWeight: 400, fontSize: 14, color: "#374151", lineHeight: 1.65, margin: 0, whiteSpace: "pre-wrap" }}>
            {job.description || "No description provided."}
          </p>
        </Section>

        {job.requirements.length > 0 && (
          <Section title="Requirements">
            <ul style={{ margin: 0, paddingLeft: 18, color: "#374151", fontSize: 14, lineHeight: 1.65 }}>
              {job.requirements.map((r, i) => (
                <li key={i} style={{ marginBottom: 4 }}>{r}</li>
              ))}
            </ul>
          </Section>
        )}

        <Section title="Why this matches you">
          <div
            className="flex items-start gap-3 rounded-[12px] p-3"
            style={{ background: "#F3EEFF", borderLeft: `3px solid ${ACCENT}` }}
          >
            <div
              className="grid place-items-center rounded-full shrink-0"
              style={{ width: 28, height: 28, background: ACCENT, color: "white", fontWeight: 700, fontSize: 12 }}
            >
              K
            </div>
            <p style={{ margin: 0, fontSize: 13, color: "#111111", lineHeight: 1.6 }}>
              {matchedSkills.length > 0
                ? `This role lines up with your ${matchedSkills.slice(0, 3).join(", ")} ${matchedSkills.length === 1 ? "strength" : "strengths"}. Strong fit based on what you've been building.`
                : "Based on your career path and progress, this role is a solid early-stage opportunity to apply what you're learning."}
            </p>
          </div>
        </Section>

        {matchedSkills.length > 0 && (
          <Section title="Skills you'll use">
            <div className="flex flex-wrap gap-2">
              {matchedSkills.map((s) => (
                <span
                  key={s}
                  style={{
                    background: "#F3EEFF",
                    border: `1px solid ${ACCENT}40`,
                    borderRadius: 100,
                    padding: "4px 12px",
                    fontWeight: 500,
                    fontSize: 12,
                    color: ACCENT,
                  }}
                >
                  {s}
                </span>
              ))}
            </div>
          </Section>
        )}

        <a
          href={job.apply_url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-7 block text-center"
          style={{
            background: ACCENT,
            color: "white",
            borderRadius: 12,
            padding: "13px 18px",
            fontWeight: 600,
            fontSize: 14,
            textDecoration: "none",
            boxShadow: `0 6px 20px ${ACCENT}55`,
          }}
        >
          Apply on {job.company} →
        </a>
      </div>
    </div>
  );
};

const Tag = ({ children }: { children: React.ReactNode }) => (
  <span
    style={{
      background: "#F4F9FE",
      border: "1px solid #E5E7EB",
      borderRadius: 100,
      padding: "4px 12px",
      fontWeight: 500,
      fontSize: 12,
      color: "#6B7280",
    }}
  >
    {children}
  </span>
);

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="mt-5">
    <div
      style={{
        fontWeight: 600,
        fontSize: 11,
        color: ACCENT,
        textTransform: "uppercase",
        letterSpacing: 1.5,
        marginBottom: 8,
      }}
    >
      {title}
    </div>
    {children}
  </div>
);
