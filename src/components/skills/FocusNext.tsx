import { toast } from "sonner";
import { levelFor, type Skill } from "./skillsData";

type Props = { weakest?: Skill; strongest?: Skill };

export const FocusNext = ({ weakest, strongest }: Props) => {
  const focus = weakest || { name: "Your first skill", percent: 1, level: "Beginner" as const };
  const top = strongest || { name: "Coming soon", percent: 1, level: "Beginner" as const };
  const target = Math.min(100, Math.max(25, Math.ceil(focus.percent / 25) * 25 + 25));

  return (
    <div
      className="ws-fade-up grid gap-5 md:grid-cols-2"
      style={{ animationDelay: "0.75s" }}
    >
      <div className="rounded-[20px] border border-border border-l-[4px] border-l-accent bg-card p-6 shadow-card">
        <div className="text-[11px] font-semibold uppercase tracking-[0.15em] text-accent">
          Focus Next
        </div>
        <h3 className="mt-2.5 text-[22px] font-bold text-foreground">{focus.name}</h3>
        <p className="mt-2 text-[14px] leading-[1.7] text-text2">
          Improving your {focus.name} skill will unlock better opportunities in Phase 2.
        </p>

        <div className="mt-4">
          <div className="mb-1.5 flex items-center justify-between">
            <span className="text-[12px] font-medium text-text2">Current: {focus.percent}%</span>
            <span className="text-[12px] font-medium text-text3">Target: {target}%</span>
          </div>
          <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-foreground/[0.06]">
            <div className="absolute left-0 top-0 h-full rounded-full bg-accent/20" style={{ width: `${target}%` }} />
            <div className="relative h-full rounded-full bg-accent transition-all" style={{ width: `${focus.percent}%` }} />
          </div>
        </div>

        <button
          onClick={() => toast.success(`Starting ${focus.name} mission...`)}
          className="mt-5 h-11 w-full rounded-[10px] bg-accent text-[14px] font-semibold text-white transition-all hover:bg-accent-dark hover:shadow-[0_4px_14px_hsl(var(--accent)/0.35)]"
        >
          Start Improving →
        </button>
      </div>

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
        <h3 className="mt-2.5 text-[22px] font-bold text-foreground">{top.name}</h3>
        <span className="mt-2 inline-block rounded-full border border-[hsl(38_92%_50%/0.2)] bg-[hsl(38_92%_50%/0.1)] px-3.5 py-1 text-[12px] font-semibold text-[hsl(38_92%_50%)]">
          {levelFor(top.percent)}
        </span>

        <div className="mt-4 text-center">
          <div className="text-[48px] font-extrabold leading-none tracking-[-0.02em] text-accent">{top.percent}%</div>
          <p className="mt-1.5 text-[13px] text-text2">
            {top.percent > 1 ? "You're building this strength. Keep going." : "Complete missions to grow this skill."}
          </p>
        </div>
      </div>
    </div>
  );
};
