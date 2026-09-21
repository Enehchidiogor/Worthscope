import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { loadResults, type CareerResult } from "@/lib/recommendationEngine";

export const CareerSummary = () => {
  const [top, setTop] = useState<CareerResult | null>(null);
  const [hasAssessment, setHasAssessment] = useState(false);
  const [fill, setFill] = useState(0);

  useEffect(() => {
    const has = !!localStorage.getItem("worthscope_results");
    setHasAssessment(has);
    const r = loadResults();
    setTop(r[0]);
    const t = window.setTimeout(() => setFill(r[0].percentage), 250);
    return () => clearTimeout(t);
  }, []);

  if (!top) return null;

  return (
    <div className="rounded-[20px] border border-border bg-card p-6 shadow-card">
      <div>
        <div className="text-[10px] font-semibold uppercase tracking-[1.5px] text-accent">
          {hasAssessment ? "Your Top Match" : "Sample Match — Take the Assessment"}
        </div>
        <h4 className="mt-2 text-[18px] font-bold text-foreground">{top.title}</h4>

        <div className="mt-3 flex items-center gap-3">
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-foreground/5">
            <div
              className="h-full rounded-full bg-accent"
              style={{ width: `${fill}%`, transition: "width 1.2s ease-out" }}
            />
          </div>
          <span className="shrink-0 text-[13px] font-semibold text-accent">{top.percentage}% Match</span>
        </div>

        <p className="mt-3 text-[12px] italic text-text2">{top.matchReason}</p>
      </div>

      <div className="my-4 h-px bg-foreground/5" />

      <div className="flex items-center justify-between gap-3">
        <p className="text-[13px] leading-[1.55] text-text2">
          {hasAssessment
            ? "View all 4 of your matched career paths."
            : "Answer 10 quick questions to unlock your real matches."}
        </p>
        <Link
          to={hasAssessment ? "/career-results" : "/assessment"}
          className="shrink-0 rounded-[10px] bg-accent px-3.5 py-2 text-[12px] font-semibold text-white hover:bg-accent-dark"
          style={{ background: "#3B82F6" }}
        >
          {hasAssessment ? "View Results" : "Take Assessment"}
        </Link>
      </div>
    </div>
  );
};
