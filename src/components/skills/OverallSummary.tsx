import { useEffect, useState } from "react";
import { IconArrowUp } from "./SkillIcon";

const useCountUp = (target: number, duration = 1200, start = true) => {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!start) return;
    const t0 = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const p = Math.min(1, (now - t0) / duration);
      setVal(Math.round(target * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration, start]);
  return val;
};

export const OverallSummary = ({ percent = 1 }: { percent?: number }) => {
  const count = useCountUp(percent);
  const size = 120;
  const stroke = 10;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (count / 100) * c;

  return (
    <div
      className="ws-fade-up relative overflow-hidden rounded-[20px] border border-border bg-card p-7 md:p-8 shadow-card"
      style={{ animationDelay: "0.1s" }}
    >
      <div
        className="pointer-events-none absolute -right-5 -top-5 h-[200px] w-[200px] rounded-full"
        style={{ background: "radial-gradient(circle, hsl(var(--accent) / 0.06), transparent 70%)" }}
      />

      <div className="relative grid gap-8 md:grid-cols-[1fr_auto] md:items-center">
        {/* LEFT */}
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-[0.15em] text-accent">
            Your Overall Skill Level
          </div>
          <div className="mt-2 text-[48px] font-extrabold leading-none tracking-[-0.02em] text-foreground">
            {count}%
          </div>
          <p className="mt-1.5 text-[15px] text-text2">
            You're building a strong foundation. Keep going.
          </p>

          <div className="mt-5">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-[13px] font-medium text-text2">Progress to Intermediate</span>
              <span className="text-[13px] font-semibold text-accent">{count} / 100</span>
            </div>
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-foreground/[0.06]">
              <div
                className="h-full rounded-full transition-[width] duration-[1200ms] ease-out"
                style={{
                  width: `${count}%`,
                  background: "linear-gradient(90deg, hsl(var(--accent)), hsl(204 90% 70%))",
                }}
              />
            </div>

            {count > 1 && (
              <div className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-success/20 bg-success/10 px-3 py-1">
                <IconArrowUp className="h-3.5 w-3.5 text-success" />
                <span className="text-[13px] font-semibold text-success">Growing</span>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT — ring */}
        <div className="relative" style={{ width: size, height: size }}>
          <svg width={size} height={size} className="-rotate-90">
            <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="hsl(var(--input))" strokeWidth={stroke} />
            <circle
              cx={size / 2}
              cy={size / 2}
              r={r}
              fill="none"
              stroke="hsl(var(--accent))"
              strokeWidth={stroke}
              strokeLinecap="round"
              strokeDasharray={c}
              strokeDashoffset={offset}
              style={{ transition: "stroke-dashoffset 0.05s linear" }}
            />
          </svg>
          <div className="absolute inset-0 grid place-items-center">
            <div className="text-center">
              <div className="text-[22px] font-bold text-foreground">{count}%</div>
              <div className="text-[12px] text-text2">Beginner</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
