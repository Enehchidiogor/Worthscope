import { useEffect } from "react";
import { IconClose } from "@/components/dashboard/icons";
import { MissionLearnPanel } from "@/components/dashboard/MissionLearnPanel";
import type { RoadmapNode } from "./nodesData";

type Props = {
  node: RoadmapNode | null;
  onClose: () => void;
  /** Called after the learner passes the project review and the mission is completed. */
  onComplete: (id: string) => void;
};

/** Full training for one mission: lesson, video, assignment and reviewed submission.
    A mission can only be completed by passing the review inside MissionLearnPanel. */
export const MissionDrawer = ({ node, onClose, onComplete }: Props) => {
  useEffect(() => {
    if (!node) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [node, onClose]);

  if (!node) return null;
  const completed = node.status === "completed";

  return (
    <>
      <button
        aria-label="Close mission"
        onClick={onClose}
        className="fixed inset-0 z-[190] bg-black/60 backdrop-blur-[2px]"
        style={{ animation: "ws-fade 0.2s ease-out both" }}
      />

      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="mission-title"
        className="fixed right-0 top-0 z-[200] flex h-screen w-full max-w-[780px] flex-col border-l border-accent/20 bg-background shadow-[-8px_0_48px_rgba(0,0,0,0.5)]"
        style={{ animation: "ws-slide-in-right 0.3s cubic-bezier(0.4,0,0.2,1) both" }}
      >
        <div className="flex items-start justify-between gap-4 border-b border-border px-5 pb-4 pt-6 sm:px-7">
          <div className="min-w-0">
            <div className="text-[11px] font-semibold uppercase tracking-[1px] text-accent">Mission {node.num}</div>
            <h2 id="mission-title" className="mt-1.5 text-[21px] font-bold leading-tight text-foreground">
              {node.title}
            </h2>
            <p className="mt-1.5 text-[13px] leading-[1.6] text-text2">{node.sub}</p>
            <div
              className={[
                "mt-3 inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold",
                completed ? "bg-success/10 text-success" : "bg-accent/10 text-accent",
              ].join(" ")}
            >
              {completed ? "✓ Completed" : "In progress — finish all 4 steps to complete it"}
            </div>
          </div>
          <button onClick={onClose} aria-label="Close" className="mt-1 shrink-0 text-text2 transition-colors hover:text-foreground">
            <IconClose className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 pb-10 sm:px-7">
          <MissionLearnPanel
            missionId={node.id}
            missionTitle={node.title}
            missionDescription={node.sub}
            onMissionComplete={() => onComplete(node.id)}
          />
        </div>
      </aside>
    </>
  );
};
