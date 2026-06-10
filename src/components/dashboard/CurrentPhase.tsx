import { useEffect, useState } from "react";
import { getChosenCareer } from "@/lib/userState";
import { loadRoadmap, getCurrentPhase, getOverallProgress, type KokoRoadmap } from "@/lib/kokoRoadmap";

export const CurrentPhase = () => {
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

  const career = getChosenCareer();
  const phase = roadmap ? getCurrentPhase(roadmap) : null;
  const pct = roadmap ? getOverallProgress(roadmap) : 0;

  return (
    <section
      className="ws-fade-up mb-6 rounded-[20px] border border-accent/20 bg-gradient-current-phase px-7 py-6"
      style={{ animationDelay: "0.5s" }}
    >
      <span className="inline-block rounded-full bg-accent/10 px-2 py-[3px] text-[10px] font-semibold uppercase tracking-[1.2px] text-accent">
        Current Phase
      </span>
      <h3 className="mt-2.5 text-[20px] font-bold text-foreground">
        {phase ? `Phase ${phase.phase_number}: ${phase.phase_title}` : "Roadmap not yet built"}
        {career?.title && <span className="ml-2 text-[14px] font-medium text-text2">· {career.title}</span>}
      </h3>
      <p className="mt-2 max-w-[640px] text-[14px] leading-[1.7] text-text2">
        {!roadmap
          ? "Build your roadmap with Koko to see your current phase, goal, and missions here."
          : phase?.phase_goal
          ? phase.phase_goal
          : pct === 0
          ? "Your journey starts here. Complete your first mission to begin building real momentum."
          : "Complete all missions in this phase to unlock the next."}
      </p>

      <div className="mt-5 flex items-center justify-between text-[13px]">
        <span className="font-medium text-text2">Progress</span>
        <span className="font-bold text-accent">{pct}%</span>
      </div>

      <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-foreground/5">
        <div
          className="h-full rounded-full bg-gradient-progress"
          style={{ width: `${pct}%`, transition: "width 1.1s ease-out" }}
        />
      </div>
    </section>
  );
};
