const days = [
  { l: "M", active: true },
  { l: "T", active: true },
  { l: "W", active: true },
  { l: "T", active: true },
  { l: "F", active: true, today: true },
  { l: "S", active: false },
  { l: "S", active: false },
];

export const StreakCard = () => (
  <div className="rounded-[20px] border border-streak/15 bg-card p-6 shadow-card">
    <div className="flex items-center gap-2">
      <span className="inline-block animate-ws-flame text-[20px] leading-none">🔥</span>
      <span
        className="text-[18px] font-bold text-streak"
        style={{ textShadow: "0 0 16px hsl(var(--streak) / 0.4)" }}
      >
        5 Day Streak
      </span>
    </div>
    <p className="mt-2 text-[13px] text-text2">Keep going! You're building a great habit.</p>

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
          <span className="text-[10px] text-text3">{d.l}</span>
        </div>
      ))}
    </div>
  </div>
);
