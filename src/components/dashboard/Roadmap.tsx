import { useEffect, useState } from "react";
import { IconCompass, IconLock, IconArrowRight } from "./icons";
import { getChosenCareer } from "@/lib/userState";
import {
  loadRoadmap, getCurrentPhase, getOverallProgress, getPhaseProgress, isPhaseLocked,
  type KokoRoadmap,
} from "@/lib/kokoRoadmap";

export const Roadmap = () => {
  const [roadmap, setRoadmap] = useState<KokoRoadmap | null>(() => loadRoadmap());

  useEffect(() => {
    const refresh = () => setRoadmap(loadRoadmap());
    window.addEventListener("worthscope:roadmap", refresh);
    window.addEventListener("worthscope:progress", refresh);
    return () => {
      window.removeEventListener("worthscope:roadmap", refresh);
      window.removeEventListener("worthscope:progress", refresh);
    };
  }, []);

  if (!roadmap) {
    return (
      <section
        className="ws-fade-up mb-6 rounded-[20px] border border-border bg-card p-7 shadow-card"
        style={{ animationDelay: "0.35s" }}
      >
        <h3 className="text-[17px] font-bold text-foreground">My Career Roadmap</h3>
        <p className="mt-2 text-[13px] text-text2">
          Build your roadmap with Koko to see your phases here. Tailored to{" "}
          {getChosenCareer()?.title || "your chosen career"}.
        </p>
        <a
          href="/roadmap-loading"
          className="mt-4 inline-block rounded-lg bg-accent px-4 py-2 text-[13px] font-semibold text-accent-foreground hover:bg-accent-dark"
        >
          Build my roadmap →
        </a>
      </section>
    );
  }

  const current = getCurrentPhase(roadmap);
  const overallPct = getOverallProgress(roadmap);

  // Pick 3 phases to display: current + neighbours.
  const all = roadmap.phases;
  const curIdx = all.findIndex((p) => p.phase_number === current.phase_number);
  let start = Math.max(0, curIdx - 1);
  let end = start + 3;
  if (end > all.length) {
    end = all.length;
    start = Math.max(0, end - 3);
  }
  const phaseWindow = all.slice(start, end);

  return (
    <section
      data-tour="roadmap"
      className="ws-fade-up mb-6 rounded-[20px] border border-border bg-card p-7 shadow-card"
      style={{ animationDelay: "0.35s" }}
    >
      <div className="mb-8 flex items-center justify-between">
        <h3 className="text-[17px] font-bold text-foreground">My Career Roadmap</h3>
        <a href="/roadmap" className="inline-flex items-center gap-1 text-[13px] font-medium text-accent hover:underline">
          View Full Map <IconArrowRight className="h-3.5 w-3.5" />
        </a>
      </div>

      <div className="mb-5 flex items-center justify-between text-[12px]">
        <span className="text-text2">Overall progress</span>
        <span className="font-semibold text-accent">{overallPct}%</span>
      </div>
      <div className="mb-6 h-1.5 w-full overflow-hidden rounded-full bg-bg-elevated">
        <div className="h-full rounded-full bg-accent" style={{ width: `${overallPct}%` }} />
      </div>

      {/* Desktop: horizontal */}
      <div className="hidden md:block">
        <div className="relative grid" style={{ gridTemplateColumns: `repeat(${phaseWindow.length}, 1fr)` }}>
          <div
            aria-hidden
            className="absolute left-[16.6%] right-[16.6%] top-[26px] h-[3px] -translate-y-1/2 rounded-full"
            style={{ background: "var(--gradient-journey)" }}
          />
          {phaseWindow.map((p) => {
            const pp = getPhaseProgress(roadmap, p.phase_number);
            const locked = isPhaseLocked(roadmap, p.phase_number);
            const isCurrent = p.phase_number === current.phase_number;
            const isDone = pp.pct === 100;
            const title = p.phase_title;
            if (isDone) return <PhaseDone key={p.phase_number} num={p.phase_number} title={title} />;
            if (isCurrent) return <PhaseActive key={p.phase_number} title={title} pct={pp.pct} num={p.phase_number} />;
            return <PhaseLocked key={p.phase_number} num={p.phase_number} title={title} dim={locked} />;
          })}
        </div>
      </div>

      {/* Mobile: just current */}
      <div className="flex flex-col gap-8 md:hidden">
        <PhaseActive title={current.phase_title} pct={getPhaseProgress(roadmap, current.phase_number).pct} num={current.phase_number} align="left" />
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
        <div className="h-full rounded-full bg-accent" style={{ width: `${pct}%` }} />
      </div>
      <span className="text-[11px] font-semibold text-accent">{pct}%</span>
    </div>
  </div>
);

const PhaseDone = ({ num, title }: { num: number; title: string }) => (
  <div className="relative z-10 flex flex-col items-center gap-2">
    <div className="grid h-12 w-12 place-items-center rounded-full bg-success/15 text-success">
      <span className="text-lg">✓</span>
    </div>
    <div className="text-center">
      <div className="text-[13px] font-semibold text-success">Phase {num}</div>
      <div className="text-[12px] text-text2">{title}</div>
    </div>
    <div className="rounded-full bg-success/10 px-2 py-[3px] text-[10px] font-semibold text-success">COMPLETE</div>
  </div>
);

const PhaseLocked = ({ num, title, dim }: { num: number; title: string; dim?: boolean }) => (
  <div className={["relative z-10 flex flex-col items-center gap-2", dim ? "opacity-60" : ""].join(" ")}>
    <div className="grid h-12 w-12 place-items-center rounded-full border-2 border-locked bg-bg-elevated text-text3">
      <IconLock className="h-5 w-5" />
    </div>
    <div className="text-center">
      <div className="text-[13px] font-semibold text-text3">Phase {num}</div>
      <div className="text-[12px] text-text3">{title}</div>
    </div>
    <div className="rounded-full border border-locked bg-bg-elevated px-2 py-[3px] text-[10px] font-medium text-text3">
      LOCKED 🔒
    </div>
  </div>
);
