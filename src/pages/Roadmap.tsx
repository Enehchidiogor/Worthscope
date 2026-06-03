import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { TopBar } from "@/components/dashboard/TopBar";
import { MobileTabBar } from "@/components/dashboard/MobileTabBar";
import { RoadmapHeader } from "@/components/roadmap/RoadmapHeader";
import { PhaseLabel } from "@/components/roadmap/PhaseLabel";
import { RoadmapNodeRow } from "@/components/roadmap/RoadmapNodeRow";
import { MissionDrawer } from "@/components/roadmap/MissionDrawer";
import { KokoSidePanel } from "@/components/roadmap/KokoSidePanel";
import { buildRoadmapForUser, type RoadmapNode } from "@/components/roadmap/nodesData";
import { getChosenCareer, completeMission } from "@/lib/userState";
import { toast } from "@/hooks/use-toast";
import { SEO } from "@/components/SEO";

const Roadmap = () => {
  const initial = buildRoadmapForUser();
  const [nodes, setNodes] = useState<RoadmapNode[]>(initial.nodes);
  const [phasesMeta, setPhasesMeta] = useState(initial.phases);
  const [openNode, setOpenNode] = useState<RoadmapNode | null>(null);
  const careerTitle = getChosenCareer()?.title ?? null;

  useEffect(() => {
    const refresh = () => {
      const r = buildRoadmapForUser();
      setNodes(r.nodes);
      setPhasesMeta(r.phases);
    };
    window.addEventListener("worthscope:progress", refresh);
    return () => window.removeEventListener("worthscope:progress", refresh);
  }, []);

  const progress = useMemo(() => {
    if (!nodes.length) return 1;
    const completed = nodes.filter((n) => n.status === "completed").length;
    return Math.max(1, Math.round((completed / nodes.length) * 100));
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
      toast({ description: "🔒 Complete previous steps to unlock this mission" });
      return;
    }
    setOpenNode(node);
  };

  const handleComplete = (id: string) => {
    // Only the current node can be completed via the drawer.
    const target = nodes.find((n) => n.id === id);
    if (!target || target.status !== "current") {
      setOpenNode(null);
      return;
    }
    completeMission(); // pulls skillsGained from active module
    const r = buildRoadmapForUser();
    setNodes(r.nodes);
    setPhasesMeta(r.phases);
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
        description="Your personalized career roadmap — phases, missions, and milestones tailored to your chosen path."
        path="/roadmap"
      />
      <Sidebar activePath="/roadmap" />

      <div className="md:ml-[220px]">
        <TopBar title={careerTitle ? `My Roadmap — ${careerTitle}` : "My Roadmap"} progress={progress} />

        <main className="mx-auto w-full max-w-[1180px] px-4 pb-24 pt-8 md:px-8 md:pb-12">
          <div className="grid grid-cols-1 gap-7 lg:grid-cols-[1fr_300px]">
            {/* LEFT: roadmap */}
            <section>
              <RoadmapHeader progress={progress} careerTitle={careerTitle} />

              {/* Vertical path container */}
              <div className="relative">
                {/* Background (upcoming) line — sits on the center column on
                    desktop, on the left edge on mobile. */}
                <div
                  aria-hidden
                  className="absolute top-0 h-full w-[3px] -translate-x-1/2 rounded-full bg-locked left-[32px] md:left-1/2"
                />
                {/* Completed (accent) line, animates height on load */}
                <div
                  aria-hidden
                  className="absolute top-0 w-[3px] origin-top -translate-x-1/2 rounded-full bg-accent left-[32px] md:left-1/2"
                  style={{
                    height: `${visitedFraction * 100}%`,
                    transition: "height 0.8s ease-out",
                    animation: "ws-line-grow 1.5s ease-out both",
                    ["--line-progress" as string]: String(visitedFraction),
                  }}
                />

                {/* Phases + nodes */}
                <div className="relative">
                  {grouped.map((phase, pIdx) => (
                    <div key={phase.num}>
                      <PhaseLabel
                        title={phase.title}
                        locked={phase.locked}
                        delay={`${0.3 + pIdx * 0.35}s`}
                      />
                      <div className="flex flex-col gap-10">
                        {phase.items.map((node, i) => {
                          // global zigzag index across all nodes
                          const globalIndex = nodes.findIndex((n) => n.id === node.id);
                          return (
                            <RoadmapNodeRow
                              key={node.id}
                              node={node}
                              zigIndex={globalIndex}
                              onClick={handleNodeClick}
                              delay={`${0.4 + globalIndex * 0.1}s`}
                            />
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* "Career Ready" end-of-roadmap banner — shows when all nodes done */}
              {nodes.every((n) => n.status === "completed") && (
                <div
                  className="ws-fade-up mx-auto mt-10 max-w-md rounded-[16px] p-6 text-center"
                  style={{
                    background: "linear-gradient(135deg, #EBF5FB, #F0FFF4)",
                    border: "1px solid rgba(52,152,219,0.2)",
                  }}
                >
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#3498DB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mx-auto">
                    <path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0z" />
                    <path d="M17 4h3v3a3 3 0 0 1-3 3M7 4H4v3a3 3 0 0 0 3 3" />
                  </svg>
                  <div style={{ fontWeight: 700, fontSize: 16, color: "#111111", marginTop: 10 }}>
                    Career Opportunities Unlocked! 🎉
                  </div>
                  <div style={{ fontWeight: 400, fontSize: 13, color: "#6B7280", marginTop: 6 }}>
                    You've completed your roadmap. Your matched job opportunities are now available.
                  </div>
                  <Link
                    to="/career"
                    className="inline-block"
                    style={{
                      background: "#3498DB", color: "#FFFFFF",
                      fontWeight: 600, fontSize: 14, borderRadius: 10,
                      padding: "11px 22px", marginTop: 16, textDecoration: "none",
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
