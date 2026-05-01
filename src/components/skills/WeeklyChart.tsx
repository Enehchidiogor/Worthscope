import { useEffect, useState } from "react";
import { getActivityLog, getSignupDate } from "@/lib/userState";

const labels = ["M", "T", "W", "T", "F", "S", "S"];
const fullLabels = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const startOfWeek = (d = new Date()) => {
  const day = d.getDay();
  const diff = (day === 0 ? -6 : 1) - day;
  const m = new Date(d);
  m.setDate(d.getDate() + diff);
  m.setHours(0, 0, 0, 0);
  return m;
};

const isoDate = (d: Date) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

export const WeeklyChart = () => {
  const [mounted, setMounted] = useState(false);
  const [hover, setHover] = useState<number | null>(null);
  const [log, setLog] = useState<Record<string, number>>({});

  useEffect(() => {
    const t = requestAnimationFrame(() => setMounted(true));
    const refresh = () => setLog(getActivityLog());
    refresh();
    window.addEventListener("worthscope:activity", refresh);
    return () => {
      cancelAnimationFrame(t);
      window.removeEventListener("worthscope:activity", refresh);
    };
  }, []);

  const today = new Date();
  const todayKey = isoDate(today);
  const monday = startOfWeek(today);
  const signup = getSignupDate();
  const PX_PER_UNIT = 18;
  const MAX_PX = 80;

  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const key = isoDate(d);
    const beforeSignup = key < signup;
    const count = log[key] || 0;
    const height = beforeSignup ? 0 : Math.min(MAX_PX, count * PX_PER_UNIT);
    const active = !beforeSignup && count > 0;
    return { day: labels[i], full: fullLabels[i], key, height, active, today: key === todayKey, count };
  });

  const activeCount = days.filter((d) => d.active).length;
  const mostActive = [...days].sort((a, b) => b.count - a.count)[0];

  return (
    <div
      className="ws-fade-up rounded-[20px] border border-border bg-card p-7 md:p-8 shadow-card"
      style={{ animationDelay: "0.6s" }}
    >
      <h2 className="mb-6 text-[18px] font-bold text-foreground">Growth This Week</h2>

      <div className="flex h-[110px] items-end justify-between gap-2 md:gap-3">
        {days.map((d, i) => {
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
                    {d.count} action{d.count === 1 ? "" : "s"}
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
                      : "#E5E7EB",
                    boxShadow: d.today && d.active ? "0 0 12px hsl(var(--accent) / 0.4)" : "none",
                    transition: `height 0.6s ease ${i * 0.1}s, transform 0.18s ease`,
                    transform: isHover ? "scaleY(1.04)" : "scaleY(1)",
                    transformOrigin: "bottom",
                  }}
                />
              </div>
              <span
                className={`text-[11px] ${d.today ? "font-semibold text-accent" : "text-text3"}`}
                style={!d.today ? { color: "#9CA3AF" } : undefined}
              >
                {d.day}
              </span>
            </div>
          );
        })}
      </div>

      <div className="mt-5 flex items-center justify-between border-t border-border pt-4">
        <span className="text-[12px] text-text2">
          {mostActive && mostActive.count > 0 ? `Most active: ${mostActive.full}` : "No activity yet — start a mission"}
        </span>
        <span className="text-[12px] font-semibold text-accent">{activeCount} active day{activeCount === 1 ? "" : "s"} this week</span>
      </div>
    </div>
  );
};
