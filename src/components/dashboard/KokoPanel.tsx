const chips = ["Continue roadmap", "View my skills", "Update my goals"];

export const KokoPanel = () => (
  <section
    className="ws-fade-up relative mb-6 overflow-hidden rounded-[20px] border border-border-bright bg-card px-7 py-6 shadow-glow"
    style={{ animationDelay: "0.2s" }}
  >
    {/* Decorative glow blob */}
    <div
      aria-hidden
      className="pointer-events-none absolute -right-8 -top-8 h-40 w-40 rounded-full"
      style={{ background: "radial-gradient(circle, hsl(var(--accent) / 0.18), transparent 70%)" }}
    />

    <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex items-start gap-4">
        {/* Avatar with pulse glow */}
        <div className="grid h-12 w-12 shrink-0 animate-ws-pulse-glow place-items-center rounded-full bg-gradient-accent text-[20px] font-bold text-white shadow-accent">
          K
        </div>

        <div>
          <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-[1.5px] text-accent">
            Koko Assistant
          </div>
          <p className="max-w-[520px] text-[15px] leading-[1.65] text-foreground">
            You're currently in Phase 1. Complete your first mission to unlock the next stage.
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {chips.map((c) => (
          <button
            key={c}
            className="rounded-full border border-accent/20 bg-accent/10 px-4 py-[7px] text-[13px] font-medium text-accent transition-all duration-200 hover:border-border-bright hover:bg-accent/20"
          >
            {c}
          </button>
        ))}
      </div>
    </div>
  </section>
);
