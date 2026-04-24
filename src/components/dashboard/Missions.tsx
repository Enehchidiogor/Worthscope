import { useState } from "react";
import { IconCheck } from "./icons";

type Mission = { id: string; title: string; sub: string; done: boolean };

const initial: Mission[] = [
  { id: "m1", title: "Explore your career matches", sub: "Review your top 4 career paths", done: true },
  { id: "m2", title: "Learn basics of your field", sub: "Watch the intro lesson for Product Design", done: false },
  { id: "m3", title: "Complete a mini exercise", sub: "Answer 5 quick questions about your skills", done: false },
];

export const Missions = () => {
  const [missions, setMissions] = useState(initial);
  const doneCount = missions.filter((m) => m.done).length;

  const toggle = (id: string) =>
    setMissions((arr) => arr.map((m) => (m.id === id ? { ...m, done: !m.done } : m)));

  return (
    <div className="rounded-[20px] border border-border bg-card p-6 shadow-card">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-[16px] font-bold text-foreground">
          <span className="mr-1.5">🎯</span> Missions
        </h3>
        <span className="text-[12px] font-medium text-text2">Phase 1 · {doneCount}/{missions.length} done</span>
      </div>

      <ul className="flex flex-col gap-2.5">
        {missions.map((m) => (
          <li
            key={m.id}
            className={[
              "flex items-start gap-3 rounded-xl border p-4 transition-colors",
              m.done
                ? "border-success/20 bg-success/5"
                : "border-transparent bg-bg-elevated hover:border-border-bright/40",
            ].join(" ")}
          >
            <button
              onClick={() => toggle(m.id)}
              aria-label={m.done ? "Mark incomplete" : "Mark complete"}
              className={[
                "mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full transition-all duration-200",
                m.done
                  ? "border-0 bg-success text-white"
                  : "border-2 border-locked bg-transparent hover:border-accent",
              ].join(" ")}
              style={m.done ? { animation: "ws-check-pop 0.25s ease-out" } : undefined}
            >
              {m.done && <IconCheck className="h-3 w-3" />}
            </button>

            <div className="min-w-0">
              <div
                className={[
                  "text-[14px] font-medium leading-tight",
                  m.done ? "text-text3 line-through" : "text-foreground",
                ].join(" ")}
              >
                {m.title}
              </div>
              <div className="mt-0.5 text-[12px] text-text2">{m.sub}</div>
            </div>
          </li>
        ))}
      </ul>

      <a href="#" className="mt-4 inline-block text-[13px] font-medium text-accent hover:underline">
        Add Mission +
      </a>
    </div>
  );
};
