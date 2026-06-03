type Props = { progress: number; careerTitle?: string | null };

export const RoadmapHeader = ({ progress, careerTitle }: Props) => {
  const title = careerTitle && careerTitle.trim() ? careerTitle : "Your Career";
  const radius = 26;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - progress / 100);

  return (
    <section
      className="ws-fade-up relative mb-8 overflow-hidden rounded-[20px] border border-accent/25 p-7 md:px-8"
      style={{
        animationDelay: "0.15s",
        background:
          "linear-gradient(135deg, hsl(var(--accent) / 0.15), hsl(var(--accent-dark) / 0.06))",
      }}
    >
      {/* decorative glow blob */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-10 -top-10 h-[200px] w-[200px] rounded-full"
        style={{
          background:
            "radial-gradient(circle, hsl(var(--accent) / 0.18), transparent 65%)",
        }}
      />

      <div className="relative flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0 flex-1">
          <div className="text-[10px] font-semibold uppercase tracking-[1.5px] text-accent">
            Your Career Goal
          </div>
          <h2 className="mt-2.5 text-[28px] font-bold tracking-[-0.5px] text-foreground">
            {title}
          </h2>
          <p className="mt-2 max-w-[420px] text-[14px] leading-[1.7] text-text2">
            This roadmap is designed to guide you step-by-step toward becoming a
            {" "}{title}.
          </p>

          <div className="mt-5">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-[13px] font-medium text-text2">Overall Progress</span>
              <span className="text-[13px] font-bold text-accent">{progress}%</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-foreground/[0.05]">
              <div
                className="h-full rounded-full bg-gradient-progress transition-[width] duration-[1200ms] ease-out"
                style={{ width: `${progress}%`, animation: "ws-bar-fill 1.2s ease-out both" }}
              />
            </div>
            <div className="mt-3 text-[12px] text-text3">⏱ Estimated time: 4–6 weeks</div>
          </div>
        </div>

        {/* Circular progress ring */}
        <div className="relative grid h-16 w-16 shrink-0 place-items-center">
          <svg className="-rotate-90" width="64" height="64" viewBox="0 0 64 64">
            <circle cx="32" cy="32" r={radius} fill="none" stroke="hsl(var(--foreground) / 0.06)" strokeWidth="5" />
            <circle
              cx="32"
              cy="32"
              r={radius}
              fill="none"
              stroke="hsl(var(--accent))"
              strokeWidth="5"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              style={{
                transition: "stroke-dashoffset 1.2s ease-out",
              }}
            />
          </svg>
          <span className="absolute text-[14px] font-bold text-accent">{progress}%</span>
        </div>
      </div>
    </section>
  );
};
