import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { IconCheck } from "./icons";
import { getProgress, getMissionsForCareer, type MissionItem } from "@/lib/userState";
import { MissionLearnPanel } from "./MissionLearnPanel";

export const Missions = () => {
  const [done, setDone] = useState(0);
  const [missions, setMissions] = useState<MissionItem[]>(() => getMissionsForCareer());
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    const refresh = () => {
      setDone(getProgress().missionsCompleted);
      setMissions(getMissionsForCareer());
    };
    refresh();
    window.addEventListener("worthscope:progress", refresh);
    return () => window.removeEventListener("worthscope:progress", refresh);
  }, []);

  // Show first 3 missions on dashboard
  const visible = missions.slice(0, 3);

  return (
    <div className="rounded-[20px] border border-border bg-card p-6 shadow-card">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-[16px] font-bold text-foreground">
          <span className="mr-1.5">🎯</span> Missions
        </h3>
        <span className="text-[12px] font-medium text-text2">Phase 1 · {Math.min(done, visible.length)}/{visible.length} done</span>
      </div>

      <ul className="flex flex-col gap-2.5">
        {visible.map((m, idx) => {
          const isDone = idx < done;
          const isOpen = expandedId === m.id;
          return (
            <li
              key={m.id}
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
                onClick={() => setExpandedId(isOpen ? null : m.id)}
                aria-expanded={isOpen}
                className="flex w-full items-start gap-3 p-4 text-left"
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
                    {m.title}
                  </div>
                  <div className="mt-0.5 text-[12px] text-text2">{m.sub}</div>
                </div>

                <svg
                  aria-hidden
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className={[
                    "mt-1 shrink-0 text-text2 transition-transform duration-200",
                    isOpen ? "rotate-180" : "rotate-0",
                  ].join(" ")}
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>

              {isOpen && (
                <div className="px-4 pb-4">
                  <MissionLearnPanel
                    missionId={m.id}
                    missionTitle={m.title}
                    missionDescription={m.sub}
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
