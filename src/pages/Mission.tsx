import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { MobileTabBar } from "@/components/dashboard/MobileTabBar";
import { MissionLearnPanel } from "@/components/dashboard/MissionLearnPanel";
import { IconArrowRight, IconCheck } from "@/components/dashboard/icons";
import { getChosenCareer } from "@/lib/userState";
import {
  loadRoadmap, getCurrentPhase, getMissionStatus, missionId, type KokoRoadmap,
} from "@/lib/kokoRoadmap";
import { SEO } from "@/components/SEO";

const Mission = () => {
  const navigate = useNavigate();
  const [roadmap, setRoadmap] = useState<KokoRoadmap | null>(() => loadRoadmap());
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    const refresh = () => setRoadmap(loadRoadmap());
    window.addEventListener("worthscope:roadmap", refresh);
    window.addEventListener("worthscope:progress", refresh);
    return () => {
      window.removeEventListener("worthscope:roadmap", refresh);
      window.removeEventListener("worthscope:progress", refresh);
    };
  }, []);

  const careerTitle = roadmap?.career_path || getChosenCareer()?.title || "Your Career";

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
          {roadmap && (
            <div className="rounded-full border border-accent/20 bg-accent/10 px-3.5 py-1.5 text-[12px] font-semibold text-accent">
              Phase {getCurrentPhase(roadmap).phase_number}
            </div>
          )}
        </header>

        <main className="mx-auto w-full max-w-[860px] px-4 pb-32 pt-8 md:px-8 md:pt-10">
          {!roadmap ? (
            <div className="mx-auto mt-12 max-w-[480px] rounded-2xl border border-border bg-card p-8 text-center shadow-card">
              <div className="text-4xl">🗺️</div>
              <h1 className="mt-4 text-[20px] font-bold text-foreground">No missions yet</h1>
              <p className="mt-2 text-[14px] text-text2">
                Your missions are part of your Koko-generated roadmap. Build it to unlock your first mission.
              </p>
              <button
                onClick={() => navigate("/roadmap-loading")}
                className="mt-6 rounded-xl bg-accent px-5 py-3 text-[14px] font-semibold text-accent-foreground hover:bg-accent-dark"
              >
                Build my roadmap with Koko →
              </button>
            </div>
          ) : (
            <>
              {(() => {
                const phase = getCurrentPhase(roadmap);
                const completedInPhase = phase.missions.filter(
                  (m) => getMissionStatus(roadmap, phase.phase_number, m.mission_number) === "completed"
                ).length;
                return (
                  <>
                    <h1 className="text-[24px] font-bold text-foreground">
                      Phase {phase.phase_number}: {phase.phase_title}
                    </h1>
                    <p className="mt-2 text-[14px] text-text2">
                      {careerTitle} · {completedInPhase}/{phase.missions.length} missions complete.
                      Click any mission to start learning: Learn with Koko → Watch & Apply → Assignment → Submission.
                    </p>

                    <ul className="mt-6 flex flex-col gap-3">
                      {phase.missions.map((m) => {
                        const id = missionId(phase.phase_number, m.mission_number);
                        const status = getMissionStatus(roadmap, phase.phase_number, m.mission_number);
                        const isDone = status === "completed";
                        const isLocked = status === "locked";
                        const isOpen = expandedId === id;
                        return (
                          <li
                            key={id}
                            className={[
                              "rounded-[16px] border bg-card transition-colors shadow-card",
                              isDone
                                ? "border-success/30"
                                : isOpen
                                ? "border-accent/40"
                                : isLocked
                                ? "border-border opacity-60"
                                : "border-border hover:border-accent/30",
                            ].join(" ")}
                          >
                            <button
                              type="button"
                              onClick={() => {
                                if (isLocked) return;
                                setExpandedId(isOpen ? null : id);
                              }}
                              aria-expanded={isOpen}
                              disabled={isLocked}
                              className="flex w-full items-start gap-3 p-5 text-left disabled:cursor-not-allowed"
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
                                  {m.mission_title}
                                </div>
                                <div className="mt-1 text-[13px] text-text2">{m.mission_description}</div>
                                {m.topics?.length ? (
                                  <div className="mt-2 flex flex-wrap gap-1.5">
                                    {m.topics.slice(0, 4).map((t, i) => (
                                      <span key={i} className="rounded-full bg-bg-elevated px-2 py-0.5 text-[11px] text-text2">
                                        {t}
                                      </span>
                                    ))}
                                  </div>
                                ) : null}
                              </div>

                              {isLocked ? (
                                <span className="mt-1 text-[14px] text-text3">🔒</span>
                              ) : (
                                <svg
                                  aria-hidden width="18" height="18" viewBox="0 0 24 24" fill="none"
                                  stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"
                                  className={["mt-1 shrink-0 text-text2 transition-transform duration-200",
                                    isOpen ? "rotate-180" : "rotate-0"].join(" ")}
                                >
                                  <polyline points="6 9 12 15 18 9" />
                                </svg>
                              )}
                            </button>

                            {isOpen && !isLocked && (
                              <div className="px-5 pb-5">
                                <MissionLearnPanel
                                  missionId={id}
                                  missionTitle={m.mission_title}
                                  missionDescription={m.mission_description}
                                  onMissionComplete={() => setExpandedId(null)}
                                />
                              </div>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  </>
                );
              })()}
            </>
          )}
        </main>
      </div>

      <MobileTabBar />
    </div>
  );
};

export default Mission;
