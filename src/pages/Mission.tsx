import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { MobileTabBar } from "@/components/dashboard/MobileTabBar";
import { MissionLearnPanel } from "@/components/dashboard/MissionLearnPanel";
import { IconArrowRight, IconCheck } from "@/components/dashboard/icons";
import { getProgress, getChosenCareer } from "@/lib/userState";
import { getActiveModule, loadModuleForCareer } from "@/lib/careerModules";
import { SEO } from "@/components/SEO";

const Mission = () => {
  const navigate = useNavigate();

  const mod = useMemo(() => getActiveModule() || loadModuleForCareer(null), []);
  const [progress, setProgress] = useState(() => getProgress());

  useEffect(() => {
    const refresh = () => setProgress(getProgress());
    window.addEventListener("worthscope:progress", refresh);
    return () => window.removeEventListener("worthscope:progress", refresh);
  }, []);

  // Find current phase based on completed missions
  let phaseIdx = 0;
  let cursor = 0;
  for (let i = 0; i < mod.phases.length; i++) {
    const len = mod.phases[i].missions.length;
    if (progress.missionsCompleted < cursor + len) {
      phaseIdx = i;
      break;
    }
    cursor += len;
    phaseIdx = i;
  }
  const phase = mod.phases[phaseIdx];
  const phaseStartIdx = mod.phases.slice(0, phaseIdx).reduce((n, p) => n + p.missions.length, 0);
  const completedInPhase = Math.max(0, progress.missionsCompleted - phaseStartIdx);

  const careerTitle = getChosenCareer()?.title || mod.title;

  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-background font-poppins text-foreground">
      <SEO
        title="Missions — WorthScope"
        description="Guided learning missions: learn with Koko, watch & apply, complete the assignment, then submit."
        path="/missions"
      />
      <Sidebar activePath="/missions" />

      <div className="md:ml-[220px]">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background/85 px-4 backdrop-blur-xl md:px-8">
          <button
            type="button"
            onClick={() => navigate("/roadmap")}
            className="flex items-center gap-2 text-[14px] font-medium text-text2 transition-colors hover:text-accent"
          >
            <IconArrowRight className="h-[18px] w-[18px] rotate-180" />
            Back to Roadmap
          </button>
          <div className="rounded-full border border-accent/20 bg-accent/10 px-3.5 py-1.5 text-[12px] font-semibold text-accent">
            Phase {phaseIdx + 1} · {Math.min(completedInPhase, phase.missions.length)}/{phase.missions.length} done
          </div>
        </header>

        <main className="mx-auto w-full max-w-[860px] px-4 pb-32 pt-8 md:px-8 md:pt-10">
          <h1 className="text-[24px] font-bold text-foreground">{phase.title}</h1>
          <p className="mt-2 text-[14px] text-text2">
            {careerTitle} · Click any mission to start learning. Each mission unlocks step-by-step:
            Learn with Koko → Watch & Apply → Assignment → Submission.
          </p>

          <ul className="mt-6 flex flex-col gap-3">
            {phase.missions.map((m, idx) => {
              const isDone = idx < completedInPhase;
              const isOpen = expandedId === m.id;
              return (
                <li
                  key={m.id}
                  className={[
                    "rounded-[16px] border bg-card transition-colors shadow-card",
                    isDone
                      ? "border-success/30"
                      : isOpen
                      ? "border-accent/40"
                      : "border-border hover:border-accent/30",
                  ].join(" ")}
                >
                  <button
                    type="button"
                    onClick={() => setExpandedId(isOpen ? null : m.id)}
                    aria-expanded={isOpen}
                    className="flex w-full items-start gap-3 p-5 text-left"
                  >
                    <span
                      aria-hidden
                      className={[
                        "mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full",
                        isDone ? "bg-success text-white" : "border-2 border-border bg-transparent",
                      ].join(" ")}
                    >
                      {isDone && <IconCheck className="h-3.5 w-3.5" />}
                    </span>

                    <div className="min-w-0 flex-1">
                      <div className={[
                        "text-[15px] font-semibold leading-tight",
                        isDone ? "text-text3 line-through" : "text-foreground",
                      ].join(" ")}>
                        {m.title}
                      </div>
                      <div className="mt-1 text-[13px] text-text2">{m.description}</div>
                    </div>

                    <svg
                      aria-hidden width="18" height="18" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"
                      className={["mt-1 shrink-0 text-text2 transition-transform duration-200",
                        isOpen ? "rotate-180" : "rotate-0"].join(" ")}
                    >
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-5">
                      <MissionLearnPanel
                        missionId={m.id}
                        missionTitle={m.title}
                        missionDescription={m.description}
                        onMissionComplete={() => setExpandedId(null)}
                      />
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </main>
      </div>

      <MobileTabBar />
    </div>
  );
};

export default Mission;
