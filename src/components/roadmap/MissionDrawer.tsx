import { useEffect, useState } from "react";
import { IconClose, IconUpload, IconPlay, IconCheck } from "@/components/dashboard/icons";
import type { RoadmapNode } from "./nodesData";

type Props = {
  node: RoadmapNode | null;
  onClose: () => void;
  onComplete: (id: string) => void;
};

export const MissionDrawer = ({ node, onClose, onComplete }: Props) => {
  const [completing, setCompleting] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!node) {
      setCompleting(false);
      setDone(false);
    }
  }, [node]);

  if (!node) return null;

  const handleComplete = () => {
    if (node.status === "completed" || completing) return;
    setCompleting(true);
    setTimeout(() => {
      setDone(true);
      setTimeout(() => {
        onComplete(node.id);
      }, 1200);
    }, 500);
  };

  return (
    <>
      {/* overlay */}
      <button
        aria-label="Close mission"
        onClick={onClose}
        className="fixed inset-0 z-[190] bg-foreground/30 backdrop-blur-[2px]"
        style={{ animation: "ws-fade 0.2s ease-out both" }}
      />

      {/* panel */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="mission-title"
        className="fixed right-0 top-0 z-[200] flex h-screen w-full max-w-[420px] flex-col border-l border-accent/15 bg-card shadow-[-8px_0_48px_rgba(0,0,0,0.18)]"
        style={{ animation: "ws-slide-in-right 0.3s cubic-bezier(0.4,0,0.2,1) both" }}
      >
        {/* header */}
        <div className="flex items-start justify-between px-7 pt-8">
          <div className="min-w-0">
            <div className="text-[11px] font-semibold uppercase tracking-[1px] text-accent">
              Mission {node.num}
            </div>
            <h2 id="mission-title" className="mt-2 text-[22px] font-bold leading-tight text-foreground">
              {node.title}
            </h2>
            <div
              className={[
                "mt-3 inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold",
                node.status === "completed"
                  ? "bg-success/10 text-success"
                  : "bg-accent/10 text-accent",
              ].join(" ")}
            >
              {node.status === "completed" ? "✓ Completed" : "In Progress"}
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="text-text2 transition-colors hover:text-foreground"
          >
            <IconClose className="h-5 w-5" />
          </button>
        </div>

        {/* body */}
        <div className="flex-1 overflow-y-auto px-7 pt-6">
          <Section label="Description">
            <p className="text-[14px] leading-[1.7] text-text2">
              {node.sub}
            </p>
          </Section>

          {/* video placeholder */}
          <div className="mt-5 grid aspect-video w-full place-items-center rounded-xl border border-border bg-bg-elevated">
            <div className="flex flex-col items-center gap-2">
              <div className="grid h-12 w-12 place-items-center rounded-full bg-accent text-white shadow-accent">
                <IconPlay className="h-5 w-5" />
              </div>
              <span className="text-[13px] font-medium text-text2">Watch Lesson</span>
            </div>
          </div>

          <Section label="Your Task" className="mt-6">
            <p className="text-[14px] leading-[1.65] text-text2">
              Complete this mission's task, then submit your work below to mark it complete.
            </p>
          </Section>

          {/* upload */}
          <div className="mt-4 grid place-items-center gap-2 rounded-xl border-[1.5px] border-dashed border-accent/20 bg-bg-elevated px-6 py-6">
            <IconUpload className="h-6 w-6 text-accent" />
            <span className="text-[13px] font-medium text-text2">Upload your work</span>
          </div>

          <div className="h-8" />
        </div>

        {/* footer */}
        <div className="border-t border-border p-5">
          <button
            onClick={handleComplete}
            disabled={node.status === "completed" || completing}
            className={[
              "grid h-[52px] w-full place-items-center rounded-[14px] text-[16px] font-semibold transition-all",
              done
                ? "bg-success text-white"
                : node.status === "completed"
                ? "bg-success/20 text-success cursor-default"
                : "bg-accent text-accent-foreground hover:bg-accent-dark hover:shadow-[0_8px_24px_hsl(var(--accent)/0.4)]",
            ].join(" ")}
          >
            {done ? (
              <span className="inline-flex items-center gap-2">
                <IconCheck className="h-4 w-4" /> Mission Complete!
              </span>
            ) : completing ? (
              <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            ) : node.status === "completed" ? (
              "✓ Already Completed"
            ) : (
              "Mark as Complete"
            )}
          </button>
        </div>
      </aside>
    </>
  );
};

const Section = ({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) => (
  <div className={className}>
    <div className="mb-2 text-[12px] font-semibold uppercase tracking-[1px] text-accent">
      {label}
    </div>
    {children}
  </div>
);
