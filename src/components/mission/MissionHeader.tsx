type Props = {
  phase: string;
  time: string;
  title: string;
  subtitle: string;
  progress: number; // 0..100
};

export const MissionHeader = ({ phase, time, title, subtitle, progress }: Props) => (
  <header className="ws-fade-up" style={{ animationDelay: "0.1s" }}>
    <div className="flex flex-wrap items-center gap-3">
      <span className="rounded-full border border-accent/20 bg-accent/10 px-3.5 py-1 text-[11px] font-semibold uppercase tracking-[0.1em] text-accent">
        {phase}
      </span>
      <span className="h-1 w-1 rounded-full bg-text3" />
      <span className="text-[12px] text-text3">⏱ {time}</span>
    </div>

    <h1 className="mt-3 text-[28px] font-bold leading-tight tracking-[-0.02em] text-foreground md:text-[32px]">
      {title}
    </h1>
    <p className="mt-2 max-w-[580px] text-[15px] leading-[1.7] text-text2 md:text-[16px]">{subtitle}</p>

    <div className="mt-5">
      <div className="flex items-center justify-between">
        <span className="text-[13px] font-medium text-text2">Mission Progress</span>
        <span className="text-[13px] font-bold text-accent">{progress}%</span>
      </div>
      <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-bg-elevated">
        <div
          className="h-full rounded-full bg-gradient-progress transition-[width] duration-700 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>

    <div className="my-6 h-px w-full bg-border" />
  </header>
);
