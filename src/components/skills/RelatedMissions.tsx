import { useEffect, useState } from "react";
import { IconArrowRight, IconLock } from "../dashboard/icons";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { getMissionsForCareer, getProgress, type MissionItem } from "@/lib/userState";

export const RelatedMissions = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState<{ m: MissionItem; locked: boolean; sub: string }[]>([]);

  useEffect(() => {
    const refresh = () => {
      const all = getMissionsForCareer();
      const done = getProgress().missionsCompleted;
      // Show up to 3 upcoming/current missions
      const start = Math.max(0, done);
      const slice = all.slice(start, start + 3).map((m, i) => ({
        m,
        locked: i > 0,
        sub: i === 0 ? "Current mission" : `Up next · Locked`,
      }));
      setItems(slice);
    };
    refresh();
    window.addEventListener("worthscope:progress", refresh);
    return () => window.removeEventListener("worthscope:progress", refresh);
  }, []);

  if (items.length === 0) return null;

  return (
    <div
      className="ws-fade-up rounded-[20px] border border-border bg-card p-7 md:p-8 shadow-card"
      style={{ animationDelay: "0.9s" }}
    >
      <h2 className="text-[18px] font-bold text-foreground">Related Missions</h2>
      <p className="text-[13px] text-text3">Complete these to level up your skills</p>

      <div className="mt-5 grid gap-3.5 md:grid-cols-3">
        {items.map(({ m, locked, sub }) => (
          <button
            key={m.id}
            onClick={() => {
              if (locked) toast.error("This mission is locked. Complete earlier missions first.");
              else navigate("/mission");
            }}
            className={[
              "group flex items-center justify-between gap-3 rounded-[14px] border border-border bg-[hsl(var(--background))] p-4 text-left transition-all",
              locked
                ? "opacity-60"
                : "hover:-translate-y-0.5 hover:border-accent/30 hover:bg-accent/5 hover:shadow-[0_4px_16px_hsl(var(--accent)/0.10)]",
            ].join(" ")}
          >
            <div className="min-w-0 flex-1">
              <div className="text-[14px] font-semibold text-foreground">{m.title}</div>
              <div className="text-[12px] text-text2">{sub}</div>
            </div>
            {locked ? (
              <IconLock className="h-4 w-4 flex-shrink-0 text-text3" />
            ) : (
              <IconArrowRight className="h-4 w-4 flex-shrink-0 text-accent transition-transform group-hover:translate-x-0.5" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
};
