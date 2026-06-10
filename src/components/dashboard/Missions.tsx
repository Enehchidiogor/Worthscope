import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { IconCheck } from "./icons";
import { MissionLearnPanel } from "./MissionLearnPanel";
import {
  loadRoadmap, getCurrentPhase, getMissionStatus, missionId,
  type KokoRoadmap,
} from "@/lib/kokoRoadmap";

export const Missions = () => {
  const navigate = useNavigate();
  const [roadmap, setRoadmap] = useState<KokoRoadmap | null>(() => loadRoadmap());
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    const refresh = () => setRoadmap(loadRoadmap());
    refresh();
    window.addEventListener("worthscope:roadmap", refresh);
    window.addEventListener("worthscope:progress", refresh);
    return () => {
      window.removeEventListener("worthscope:roadmap", refresh);
      window.removeEventListener("worthscope:progress", refresh);
    };
  }, []);

  if (!roadmap) {
    return (
      <div className="rounded-[20px] border border-border bg-card p-6 shadow-card">
        <h3 className="text-[16px] font-bold text-foreground">🎯 Missions</h3>
        <p className="mt-2 text-[13px] text-text2">
          Your missions are part of your Koko-generated roadmap. Build it to unlock your first mission.
        </p>
        <button
          onClick={() => navigate("/roadmap-loading")}
          className="mt-4 rounded-lg bg-accent px-4 py-2 text-[13px] font-semibold text-accent-foreground hover:bg-accent-dark"
        >
          Build my roadmap →
        </button>
      </div>
    );
  }

  const phase = getCurrentPhase(roadmap);
  const visible = phase.missions.slice(0, 3);
  const completedInPhase = phase.missions.filter(
    (m) => getMissionStatus(roadmap, phase.phase_number, m.mission_number) === "completed"
  ).length;

  return (
    <div data-tour="missions" className="rounded-[20px] border border-border bg-card p-6 shadow-card">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-[16px] font-bold text-foreground">
          <span className="mr-1.5">🎯</span> Missions
        </h3>
        <span className="text-[12px] font-medium text-text2">
          Phase {phase.phase_number} · {completedInPhase}/{phase.missions.length} done
        </span>
      </div>

      <ul className="flex flex-col gap-2.5">
        {visible.map((m) => {
          const id = missionId(phase.phase_number, m.mission_number);
          const status = getMissionStatus(roadmap, phase.phase_number, m.mission_number);
          const isDone = status === "completed";
          const isLocked = status === "locked";
          const isOpen = expandedId === id;
          return (
            <li
              key={id}
              className={[
                "rounded-xl border transition-colors",
                isDone
                  ? "border-success/20 bg-success/5"
                  : isOpen
                  ? "border-border-bright/60 bg-bg-elevated"
                  : "border-transparent bg-bg-elevated hover:border-border-bright/40",
              ].join(" ")}
            >
              <button
                type="button"
                onClick={() => {
                  if (isLocked) return;
                  setExpandedId(isOpen ? null : id);
                }}
                aria-expanded={isOpen}
                disabled={isLocked}
                className="flex w-full items-start gap-3 p-4 text-left disabled:cursor-not-allowed disabled:opacity-60"
              >
                <span
                  aria-hidden
                  className={[
                    "mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full",
                    isDone ? "bg-success text-white" : "border-2 border-locked bg-transparent",
                  ].join(" ")}
                >
                  {isDone && <IconCheck className="h-3 w-3" />}
                </span>

                <div className="min-w-0 flex-1">
                  <div
                    className={[
                      "text-[14px] font-medium leading-tight",
                      isDone ? "text-text3 line-through" : "text-foreground",
                    ].join(" ")}
                  >
                    {m.mission_title}
                  </div>
                  <div className="mt-0.5 text-[12px] text-text2">{m.mission_description}</div>
                </div>

                {isLocked ? (
                  <span className="mt-1 text-[12px] text-text3">🔒</span>
                ) : (
                  <svg
                    aria-hidden width="16" height="16" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"
                    className={["mt-1 shrink-0 text-text2 transition-transform duration-200",
                      isOpen ? "rotate-180" : "rotate-0"].join(" ")}
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                )}
              </button>

              {isOpen && !isLocked && (
                <div className="px-4 pb-4">
                  <MissionLearnPanel
                    missionId={id}
                    missionTitle={m.mission_title}
                    missionDescription={m.mission_description}
                  />
                </div>
              )}
            </li>
          );
        })}
      </ul>

      <Link to="/missions" className="mt-4 inline-block text-[13px] font-medium text-accent hover:underline">
        Open Missions →
      </Link>
    </div>
  );
};
