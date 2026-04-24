export const CurrentPhase = () => (
  <section
    className="ws-fade-up mb-6 rounded-[20px] border border-accent/20 bg-gradient-current-phase px-7 py-6"
    style={{ animationDelay: "0.5s" }}
  >
    <span className="inline-block rounded-full bg-accent/10 px-2 py-[3px] text-[10px] font-semibold uppercase tracking-[1.2px] text-accent">
      Current Phase
    </span>
    <h3 className="mt-2.5 text-[20px] font-bold text-foreground">Phase 1: Foundation</h3>
    <p className="mt-2 max-w-[640px] text-[14px] leading-[1.7] text-text2">
      Build your understanding and explore your career direction. Complete all missions in this phase to unlock Phase 2.
    </p>

    <div className="mt-5 flex items-center justify-between text-[13px]">
      <span className="font-medium text-text2">Progress</span>
      <span className="font-bold text-accent">30%</span>
    </div>

    <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-foreground/5">
      <div
        className="h-full rounded-full bg-gradient-progress"
        style={{ width: "30%", animation: "ws-bar-fill 1.1s ease-out both" }}
      />
    </div>
  </section>
);
