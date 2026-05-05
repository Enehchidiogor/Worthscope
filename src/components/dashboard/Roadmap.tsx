import { useEffect, useState } from "react";
import { IconCompass, IconLock, IconArrowRight } from "./icons";
import { getChosenCareer, getProgress } from "@/lib/userState";
import { getActiveModule, loadModuleForCareer } from "@/lib/careerModules";

export const Roadmap = () => {
  const [names, setNames] = useState<[string, string, string]>(["Foundation", "Exploration", "Mastery"]);
  const [pct, setPct] = useState(0);
  const [phase, setPhase] = useState<1 | 2 | 3>(1);

  useEffect(() => {
    const refresh = () => {
      const mod = getActiveModule() || loadModuleForCareer(getChosenCareer());
      const titles = mod.phases.map((p) => p.title.replace(/^Phase \d+:\s*/, "").replace(/ 🔒$/, "")) as string[];
      setNames([titles[0] || "Foundation", titles[1] || "Exploration", titles[2] || "Mastery"]);
      const pr = getProgress();
      setPct(pr.overallPct);
      setPhase(pr.phase);
    };
    refresh();
    window.addEventListener("worthscope:progress", refresh);
    return () => window.removeEventListener("worthscope:progress", refresh);
  }, []);

  const [n1, n2, n3] = names;
  // Per-phase pct (each phase covers ~33%)
  const phase1Pct = Math.min(100, Math.round((pct / 34) * 100));

  return (
    <section
      className="ws-fade-up mb-6 rounded-[20px] border border-border bg-card p-7 shadow-card"
      style={{ animationDelay: "0.35s" }}
    >
      <div className="mb-8 flex items-center justify-between">
        <h3 className="text-[17px] font-bold text-foreground">My Career Roadmap</h3>
        <a href="/roadmap" className="inline-flex items-center gap-1 text-[13px] font-medium text-accent hover:underline">
          View Full Map <IconArrowRight className="h-3.5 w-3.5" />
        </a>
      </div>

      {/* Desktop: horizontal */}
      <div className="hidden md:block">
        <div className="relative grid grid-cols-3">
          <div
            aria-hidden
            className="absolute left-[16.6%] right-[16.6%] top-[26px] h-[3px] -translate-y-1/2 rounded-full"
            style={{ background: "var(--gradient-journey)" }}
          />

          {phase === 1 ? (
            <>
              <PhaseActive title={n1} pct={phase1Pct} />
              <PhaseLocked num={2} title={n2} />
              <PhaseLocked num={3} title={n3} dim />
            </>
          ) : phase === 2 ? (
            <>
              <PhaseDone num={1} title={n1} />
              <PhaseActive title={n2} pct={Math.min(100, Math.round(((pct - 33) / 34) * 100))} num={2} />
              <PhaseLocked num={3} title={n3} dim />
            </>
          ) : (
            <>
              <PhaseDone num={1} title={n1} />
              <PhaseDone num={2} title={n2} />
              <PhaseActive title={n3} pct={Math.min(100, Math.round(((pct - 66) / 34) * 100))} num={3} />
            </>
          )}
        </div>
      </div>

      {/* Mobile: vertical */}
      <div className="flex flex-col gap-8 md:hidden">
        <div className="relative">
          <div
            aria-hidden
            className="absolute left-[26px] top-14 h-[calc(100%+1.5rem)] w-[3px] rounded-full"
            style={{ background: "var(--gradient-journey)" }}
          />
          {phase === 1 && <PhaseActive title={n1} pct={phase1Pct} align="left" />}
          {phase === 2 && <PhaseActive title={n2} pct={Math.min(100, Math.round(((pct - 33) / 34) * 100))} num={2} align="left" />}
          {phase === 3 && <PhaseActive title={n3} pct={Math.min(100, Math.round(((pct - 66) / 34) * 100))} num={3} align="left" />}
        </div>
        {phase < 2 && <PhaseLocked num={2} title={n2} align="left" />}
        {phase < 3 && <PhaseLocked num={3} title={n3} dim align="left" />}
      </div>
    </section>
  );
};

const PhaseActive = ({ title, pct, num = 1, align = "center" }: { title: string; pct: number; num?: number; align?: "center" | "left" }) => (
  <div className={["relative z-10 flex flex-col gap-2", align === "left" ? "items-start pl-16" : "items-center"].join(" ")}>
    <div className="relative">
      <div className="grid h-[52px] w-[52px] place-items-center rounded-full bg-gradient-accent text-white shadow-accent">
        <IconCompass className="h-[22px] w-[22px]" />
      </div>
      <span
        aria-hidden
        className="absolute inset-0 rounded-full border-2 border-accent"
        style={{ animation: "ws-pulse-ring 2s ease-out infinite" }}
      />
    </div>
    <div className={align === "left" ? "text-left" : "text-center"}>
      <div className="text-[14px] font-bold text-accent">Phase {num}</div>
      <div className="text-[12px] text-text2">{title}</div>
    </div>
    <div className="rounded-full bg-accent/10 px-2 py-[3px] text-[10px] font-semibold text-accent">IN PROGRESS</div>
    <div className="mt-1 flex items-center gap-2">
      <div className="h-1 w-[100px] overflow-hidden rounded-full bg-bg-elevated">
        <div
          className="h-full rounded-full bg-accent"
          style={{ width: `${pct}%`, animation: "ws-bar-fill 1.1s ease-out both" }}
        />
      </div>
      <span className="text-[11px] font-semibold text-accent">{pct}%</span>
    </div>
  </div>
);

const PhaseDone = ({ num, title, align = "center" }: { num: number; title: string; align?: "center" | "left" }) => (
  <div className={["relative z-10 flex flex-col gap-2", align === "left" ? "items-start pl-16" : "items-center"].join(" ")}>
    <div className="grid h-12 w-12 place-items-center rounded-full bg-success/15 text-success">
      <span className="text-lg">✓</span>
    </div>
    <div className={align === "left" ? "text-left" : "text-center"}>
      <div className="text-[13px] font-semibold text-success">Phase {num}</div>
      <div className="text-[12px] text-text2">{title}</div>
    </div>
    <div className="rounded-full bg-success/10 px-2 py-[3px] text-[10px] font-semibold text-success">COMPLETE</div>
  </div>
);

const PhaseLocked = ({ num, title, dim, align = "center" }: { num: number; title: string; dim?: boolean; align?: "center" | "left" }) => (
  <div
    className={[
      "relative z-10 flex flex-col gap-2",
      align === "left" ? "items-start pl-16" : "items-center",
      dim ? "opacity-60" : "",
    ].join(" ")}
  >
    <div className="grid h-12 w-12 place-items-center rounded-full border-2 border-locked bg-bg-elevated text-text3">
      <IconLock className="h-5 w-5" />
    </div>
    <div className={align === "left" ? "text-left" : "text-center"}>
      <div className="text-[13px] font-semibold text-text3">Phase {num}</div>
      <div className="text-[12px] text-text3">{title}</div>
    </div>
    <div className="rounded-full border border-locked bg-bg-elevated px-2 py-[3px] text-[10px] font-medium text-text3">
      LOCKED 🔒
    </div>
  </div>
);
