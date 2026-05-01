import { useEffect, useState } from "react";
import { getStreak, type Streak } from "@/lib/userState";

const labels = ["M", "T", "W", "T", "F", "S", "S"];

// Get Monday of current week
const startOfWeek = (d = new Date()) => {
  const day = d.getDay(); // 0=Sun
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

export const StreakCard = () => {
  const [streak, setStreak] = useState<Streak>({ count: 1, lastVisitDate: "" });

  useEffect(() => {
    const refresh = () => setStreak(getStreak());
    refresh();
    window.addEventListener("worthscope:streak", refresh);
    return () => window.removeEventListener("worthscope:streak", refresh);
  }, []);

  const today = new Date();
  const todayKey = isoDate(today);
  const todayIdx = (today.getDay() + 6) % 7; // Mon=0..Sun=6
  const monday = startOfWeek(today);
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const key = isoDate(d);
    const isToday = key === todayKey;
    const active = !!streak.lastVisitDate && key === streak.lastVisitDate && streak.count > 0;
    // Heuristic: highlight all days within current streak window that fall in this week
    const withinStreak =
      !!streak.lastVisitDate &&
      key <= streak.lastVisitDate &&
      // count back streak.count days
      key >= isoDate(new Date(new Date(streak.lastVisitDate + "T00:00:00").getTime() - (streak.count - 1) * 86400000));
    return { l: labels[i], active: withinStreak || active, today: isToday };
  });

  const count = streak.count || 1;
  return (
    <div className="rounded-[20px] border border-streak/15 bg-card p-6 shadow-card">
      <div className="flex items-center gap-2">
        <span className="inline-block animate-ws-flame text-[20px] leading-none">🔥</span>
        <span
          className="text-[18px] font-bold text-streak"
          style={{ textShadow: "0 0 16px hsl(var(--streak) / 0.4)" }}
        >
          {count} Day Streak
        </span>
      </div>
      <p className="mt-2 text-[13px] text-text2">
        {count === 1 ? "You started today — keep it going!" : "Keep going! You're building a great habit."}
      </p>

      <div className="mt-4 flex items-center justify-between gap-2">
        {days.map((d, i) => (
          <div key={i} className="flex flex-col items-center gap-1.5">
            <div className="relative">
              <div
                className={[
                  "grid h-7 w-7 place-items-center rounded-full text-[10px] font-semibold",
                  d.active
                    ? "bg-streak text-white shadow-[0_0_8px_hsl(var(--streak)/0.4)]"
                    : "border border-locked bg-bg-elevated text-text3",
                ].join(" ")}
              />
              {d.today && (
                <span
                  aria-hidden
                  className="absolute inset-0 rounded-full border-2 border-streak"
                  style={{ animation: "ws-pulse-orange 1.5s ease-out infinite" }}
                />
              )}
            </div>
            <span className={`text-[10px] ${d.today ? "font-semibold text-streak" : "text-text3"}`}>{d.l}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
