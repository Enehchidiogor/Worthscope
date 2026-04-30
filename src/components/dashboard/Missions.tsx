import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { IconCheck } from "./icons";
import { getProgress } from "@/lib/userState";

type Mission = { id: string; title: string; sub: string };

const ALL: Mission[] = [
  { id: "m1", title: "Explore your career matches", sub: "Review your top 4 career paths" },
  { id: "m2", title: "Learn the basics of your field", sub: "Watch the intro lesson" },
  { id: "m3", title: "Complete your first mission", sub: "Open Mission 3 from the roadmap" },
];

export const Missions = () => {
  const [done, setDone] = useState(0);
  useEffect(() => {
    const refresh = () => setDone(getProgress().missionsCompleted);
    refresh();
    window.addEventListener("worthscope:progress", refresh);
    return () => window.removeEventListener("worthscope:progress", refresh);
  }, []);

  return (
    <div className="rounded-[20px] border border-border bg-card p-6 shadow-card">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-[16px] font-bold text-foreground">
          <span className="mr-1.5">🎯</span> Missions
        </h3>
        <span className="text-[12px] font-medium text-text2">Phase 1 · {done}/{ALL.length} done</span>
      </div>

      <ul className="flex flex-col gap-2.5">
        {ALL.map((m, idx) => {
          const isDone = idx < done;
          return (
            <li
              key={m.id}
              className={[
                "flex items-start gap-3 rounded-xl border p-4 transition-colors",
                isDone
                  ? "border-success/20 bg-success/5"
                  : "border-transparent bg-bg-elevated hover:border-border-bright/40",
              ].join(" ")}
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

              <div className="min-w-0">
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
