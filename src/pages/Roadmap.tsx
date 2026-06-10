import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { TopBar } from "@/components/dashboard/TopBar";
import { MobileTabBar } from "@/components/dashboard/MobileTabBar";
import { RoadmapHeader } from "@/components/roadmap/RoadmapHeader";
import { PhaseLabel } from "@/components/roadmap/PhaseLabel";
import { RoadmapNodeRow } from "@/components/roadmap/RoadmapNodeRow";
import { MissionDrawer } from "@/components/roadmap/MissionDrawer";
import { KokoSidePanel } from "@/components/roadmap/KokoSidePanel";
import { buildRoadmapForUser, type RoadmapNode } from "@/components/roadmap/nodesData";
import { getChosenCareer } from "@/lib/userState";
import { markRoadmapMissionComplete } from "@/lib/kokoRoadmap";
import { toast } from "@/hooks/use-toast";
import { SEO } from "@/components/SEO";

const Roadmap = () => {
  const navigate = useNavigate();
  const initial = buildRoadmapForUser();
  const [nodes, setNodes] = useState<RoadmapNode[]>(initial.nodes);
  const [phasesMeta, setPhasesMeta] = useState(initial.phases);
  const [hasRoadmap, setHasRoadmap] = useState(!!initial.roadmap);
  const [openNode, setOpenNode] = useState<RoadmapNode | null>(null);
  const careerTitle = initial.roadmap?.career_path || getChosenCareer()?.title || null;

  useEffect(() => {
    const refresh = () => {
      const r = buildRoadmapForUser();
      setNodes(r.nodes);
      setPhasesMeta(r.phases);
      setHasRoadmap(!!r.roadmap);
    };
    refresh();
    window.addEventListener("worthscope:roadmap", refresh);
    window.addEventListener("worthscope:progress", refresh);
    return () => {
      window.removeEventListener("worthscope:roadmap", refresh);
      window.removeEventListener("worthscope:progress", refresh);
    };
  }, []);

  const progress = useMemo(() => {
    if (!nodes.length) return 0;
    const completed = nodes.filter((n) => n.status === "completed").length;
    return Math.round((completed / nodes.length) * 100);
  }, [nodes]);

  const visitedFraction = useMemo(() => {
    if (!nodes.length) return 0;
    const completed = nodes.filter((n) => n.status === "completed").length;
    const hasCurrent = nodes.some((n) => n.status === "current");
    const visited = completed + (hasCurrent ? 0.5 : 0);
    return Math.min(1, visited / nodes.length);
  }, [nodes]);

  const handleNodeClick = (node: RoadmapNode) => {
    if (node.status === "locked") {
      toast({ description: "🔒 Complete previous missions to unlock this one" });
      return;
    }
    setOpenNode(node);
  };

  const handleComplete = (id: string) => {
    const target = nodes.find((n) => n.id === id);
    if (!target || target.status !== "current") {
      setOpenNode(null);
      return;
    }
    markRoadmapMissionComplete(id);
    setOpenNode(null);
  };

  const grouped = useMemo(() => {
    return phasesMeta.map((p) => ({
      ...p,
      items: nodes.filter((n) => n.phase === p.num),
    }));
  }, [nodes, phasesMeta]);

  return (
    <div className="min-h-screen bg-background font-poppins text-foreground">
      <SEO
        title="Your Career Roadmap — WorthScope"
        description="Your personalised career roadmap — phases, missions, and milestones tailored to your chosen path."
        path="/roadmap"
      />
      <Sidebar activePath="/roadmap" />

      <div className="md:ml-[220px]">
        <TopBar title={careerTitle ? `My Roadmap — ${careerTitle}` : "My Roadmap"} progress={progress} />

        <main className="mx-auto w-full max-w-[1180px] px-4 pb-24 pt-8 md:px-8 md:pb-12">
          {!hasRoadmap ? (
            <section className="mx-auto mt-12 max-w-[520px] rounded-2xl border border-border bg-card p-8 text-center shadow-card">
              <div className="text-4xl">🗺️</div>
              <h2 className="mt-4 text-[20px] font-bold text-foreground">
                You don't have a roadmap yet
              </h2>
              <p className="mt-2 text-[14px] leading-relaxed text-text2">
                Your roadmap is built by Koko based on your chosen career path. Start the
                generator and Koko will design every phase and mission for you.
              </p>
              <button
                onClick={() => navigate("/roadmap-loading")}
                className="mt-6 rounded-xl bg-accent px-5 py-3 text-[14px] font-semibold text-accent-foreground hover:bg-accent-dark"
              >
                Build my roadmap with Koko →
              </button>
            </section>
          ) : (
            <div className="grid grid-cols-1 gap-7 lg:grid-cols-[1fr_300px]">
              {/* LEFT: roadmap */}
              <section>
                <RoadmapHeader progress={progress} careerTitle={careerTitle} />

                <div className="relative">
                  <div
                    aria-hidden
                    className="absolute top-0 h-full w-[3px] -translate-x-1/2 rounded-full bg-locked left-[32px] md:left-1/2"
                  />
                  <div
                    aria-hidden
                    className="absolute top-0 w-[3px] origin-top -translate-x-1/2 rounded-full bg-accent left-[32px] md:left-1/2"
                    style={{
                      height: `${visitedFraction * 100}%`,
                      transition: "height 0.8s ease-out",
                    }}
                  />

                  <div className="relative">
                    {grouped.map((phase, pIdx) => (
                      <div key={phase.num}>
                        <PhaseLabel
                          title={phase.title}
                          locked={phase.locked}
                          delay={`${0.15 + pIdx * 0.25}s`}
                        />
                        <div className="flex flex-col gap-10">
                          {phase.items.map((node) => {
                            const globalIndex = nodes.findIndex((n) => n.id === node.id);
                            return (
                              <RoadmapNodeRow
                                key={node.id}
                                node={node}
                                zigIndex={globalIndex}
                                onClick={handleNodeClick}
                                delay={`${0.25 + globalIndex * 0.08}s`}
                              />
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {nodes.length > 0 && nodes.every((n) => n.status === "completed") && (
                  <div
                    className="ws-fade-up mx-auto mt-10 max-w-md rounded-[16px] p-6 text-center"
                    style={{
                      background: "linear-gradient(135deg, #EBF5FB, #F0FFF4)",
                      border: "1px solid rgba(52,152,219,0.2)",
                    }}
                  >
                    <div className="text-3xl">🎉</div>
                    <div style={{ fontWeight: 700, fontSize: 16, color: "#111111", marginTop: 10 }}>
                      You've completed your roadmap!
                    </div>
                    <div style={{ fontWeight: 400, fontSize: 13, color: "#6B7280", marginTop: 6 }}>
                      Your matched job opportunities are now available.
                    </div>
                    <Link
                      to="/career"
                      className="inline-block"
                      style={{
                        background: "#3498DB",
                        color: "#FFFFFF",
                        fontWeight: 600,
                        fontSize: 14,
                        borderRadius: 10,
                        padding: "11px 22px",
                        marginTop: 16,
                        textDecoration: "none",
                      }}
                    >
                      View My Matched Jobs →
                    </Link>
                  </div>
                )}
              </section>

              {/* RIGHT: Koko */}
              <KokoSidePanel />
            </div>
          )}
        </main>
      </div>

      <MobileTabBar />

      {openNode && (
        <MissionDrawer
          node={openNode}
          onClose={() => setOpenNode(null)}
          onComplete={handleComplete}
        />
      )}
    </div>
  );
};

export default Roadmap;
