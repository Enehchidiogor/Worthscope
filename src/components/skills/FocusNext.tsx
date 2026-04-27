import { toast } from "sonner";

export const FocusNext = () => (
  <div
    className="ws-fade-up grid gap-5 md:grid-cols-2"
    style={{ animationDelay: "0.75s" }}
  >
    {/* LEFT — focus area */}
    <div className="rounded-[20px] border border-border border-l-[4px] border-l-accent bg-card p-6 shadow-card">
      <div className="text-[11px] font-semibold uppercase tracking-[0.15em] text-accent">
        Focus Next
      </div>
      <h3 className="mt-2.5 text-[22px] font-bold text-foreground">Research</h3>
      <p className="mt-2 text-[14px] leading-[1.7] text-text2">
        Improving your Research skill will unlock better opportunities and strengthen your Phase 2 missions.
      </p>

      <div className="mt-4">
        <div className="mb-1.5 flex items-center justify-between">
          <span className="text-[12px] font-medium text-text2">Current: 20%</span>
          <span className="text-[12px] font-medium text-text3">Target: 50%</span>
        </div>
        <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-foreground/[0.06]">
          <div className="absolute left-0 top-0 h-full w-[50%] rounded-full bg-accent/20" />
          <div className="relative h-full w-[20%] rounded-full bg-accent transition-all" />
        </div>
      </div>

      <button
        onClick={() => toast.success("Starting Research mission...")}
        className="mt-5 h-11 w-full rounded-[10px] bg-accent text-[14px] font-semibold text-white transition-all hover:bg-accent-dark hover:shadow-[0_4px_14px_hsl(var(--accent)/0.35)]"
      >
        Start Improving →
      </button>
    </div>

    {/* RIGHT — strongest skill */}
    <div
      className="rounded-[20px] border p-6 shadow-card"
      style={{
        background: "linear-gradient(135deg, hsl(var(--accent) / 0.10), hsl(220 25% 98%))",
        borderColor: "hsl(var(--accent) / 0.2)",
      }}
    >
      <div className="text-[11px] font-semibold uppercase tracking-[0.15em] text-accent">
        Your Strongest Skill
      </div>
      <h3 className="mt-2.5 text-[22px] font-bold text-foreground">Problem Solving</h3>
      <span className="mt-2 inline-block rounded-full border border-[hsl(38_92%_50%/0.2)] bg-[hsl(38_92%_50%/0.1)] px-3.5 py-1 text-[12px] font-semibold text-[hsl(38_92%_50%)]">
        Intermediate
      </span>

      <div className="mt-4 text-center">
        <div className="text-[48px] font-extrabold leading-none tracking-[-0.02em] text-accent">65%</div>
        <p className="mt-1.5 text-[13px] text-text2">You're excelling here. Keep building on this strength.</p>
      </div>
    </div>
  </div>
);
