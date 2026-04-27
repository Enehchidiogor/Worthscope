import { useEffect, useState } from "react";
import { weeklyData } from "./skillsData";

export const WeeklyChart = () => {
  const [mounted, setMounted] = useState(false);
  const [hover, setHover] = useState<number | null>(null);
  useEffect(() => {
    const t = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(t);
  }, []);

  const activeCount = weeklyData.filter(d => d.active).length;

  return (
    <div
      className="ws-fade-up rounded-[20px] border border-border bg-card p-7 md:p-8 shadow-card"
      style={{ animationDelay: "0.6s" }}
    >
      <h2 className="mb-6 text-[18px] font-bold text-foreground">Growth This Week</h2>

      <div className="flex h-[110px] items-end justify-between gap-2 md:gap-3">
        {weeklyData.map((d, i) => {
          const isHover = hover === i;
          const height = mounted ? d.height : 0;
          return (
            <div
              key={i}
              className="flex flex-1 flex-col items-center gap-2"
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(null)}
            >
              <div className="relative flex h-20 w-full items-end justify-center">
                {isHover && d.active && (
                  <div className="absolute -top-7 rounded-md bg-foreground px-2 py-0.5 text-[10px] font-semibold text-background">
                    {d.height}m
                  </div>
                )}
                <div
                  className="cursor-pointer rounded-t-md"
                  style={{
                    height: `${height}px`,
                    width: d.today ? "70%" : "55%",
                    maxWidth: 32,
                    background: d.active
                      ? "linear-gradient(to top, hsl(var(--accent)), hsl(204 90% 70%))"
                      : "hsl(var(--accent) / 0.12)",
                    boxShadow: d.today ? "0 0 12px hsl(var(--accent) / 0.4)" : "none",
                    transition: `height 0.6s ease ${i * 0.1}s, transform 0.18s ease`,
                    transform: isHover ? "scaleY(1.04)" : "scaleY(1)",
                    transformOrigin: "bottom",
                  }}
                />
              </div>
              <span
                className={`text-[11px] ${d.today ? "font-semibold text-accent" : "text-text3"}`}
              >
                {d.day}
              </span>
            </div>
          );
        })}
      </div>

      <div className="mt-5 flex items-center justify-between border-t border-border pt-4">
        <span className="text-[12px] text-text2">Most active: Thursday</span>
        <span className="text-[12px] font-semibold text-accent">{activeCount} active days this week</span>
      </div>
    </div>
  );
};
