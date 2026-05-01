import { useState } from "react";
import { Skill, Level } from "./skillsData";
import { SkillIcon, IconArrowUp } from "./SkillIcon";
import { toast } from "sonner";

const levelStyles: Record<Level, string> = {
  Beginner: "bg-destructive/10 text-destructive border-destructive/20",
  Intermediate: "bg-[hsl(38_92%_50%/0.08)] text-[hsl(38_92%_50%)] border-[hsl(38_92%_50%/0.2)]",
  Advanced: "bg-success/10 text-success border-success/20",
};

export const SkillBreakdown = ({ skills }: { skills: Skill[] }) => {
  const [hovered, setHovered] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  // trigger fill on mount
  if (typeof window !== "undefined" && !mounted) {
    requestAnimationFrame(() => setMounted(true));
  }

  return (
    <div
      className="ws-fade-up rounded-[20px] border border-border bg-card p-7 md:p-8 shadow-card"
      style={{ animationDelay: "0.4s" }}
    >
      <div className="mb-2 flex items-end justify-between">
        <h2 className="text-[18px] font-bold text-foreground">Skill Breakdown</h2>
        <span className="text-[13px] text-text3">{skills.length} skills tracked</span>
      </div>

      <ul>
        {skills.map((s, i) => {
          const isHover = hovered === s.id;
          return (
            <li
              key={s.id}
              onMouseEnter={() => setHovered(s.id)}
              onMouseLeave={() => setHovered(null)}
              className={[
                "flex flex-col gap-3 border-b border-border py-5 transition-colors last:border-b-0 md:flex-row md:items-center",
                isHover ? "bg-accent/[0.03] -mx-3 px-3 rounded-lg border-transparent" : "",
              ].join(" ")}
              style={{ transition: "background 0.18s ease" }}
            >
              {/* LEFT */}
              <div className="flex items-center gap-3 md:w-[220px] md:flex-shrink-0">
                <div className="grid h-9 w-9 flex-shrink-0 place-items-center rounded-full bg-accent/10">
                  <SkillIcon name={s.icon} className="h-4 w-4 text-accent" />
                </div>
                <div className="min-w-0">
                  <div className="text-[15px] font-semibold text-foreground">{s.name}</div>
                  <span
                    className={`mt-1 inline-block rounded-full border px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wide ${levelStyles[s.level]}`}
                  >
                    {s.level}
                  </span>
                </div>
              </div>

              {/* CENTER */}
              <div className="flex-1 md:px-6">
                <div className="h-2 w-full overflow-hidden rounded-full bg-foreground/[0.06]">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: mounted ? `${s.percent}%` : "0%",
                      background: "linear-gradient(90deg, hsl(var(--accent)), hsl(204 90% 70%))",
                      transition: `width 1s ease ${i * 0.15}s, filter 0.2s ease`,
                      filter: isHover ? "brightness(1.15)" : "brightness(1)",
                    }}
                  />
                </div>
              </div>

              {/* RIGHT */}
              <div className="flex items-center justify-between md:w-[140px] md:flex-shrink-0 md:flex-col md:items-end md:gap-0.5">
                <div className="text-[18px] font-bold text-accent">{s.percent}%</div>
                {s.growth > 0 && (
                  <div className="flex items-center gap-1 text-[11px] text-success">
                    <IconArrowUp className="h-2.5 w-2.5" />
                    +{s.growth}% this week
                  </div>
                )}
                <button
                  onClick={() => toast.success(`Opening ${s.name} mission...`)}
                  className="mt-0.5 text-[12px] font-medium text-accent hover:underline"
                >
                  {s.link}
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};
