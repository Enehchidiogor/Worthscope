import { useMemo, useState } from "react";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { TopBar } from "@/components/dashboard/TopBar";
import { MobileTabBar } from "@/components/dashboard/MobileTabBar";
import { RoadmapHeader } from "@/components/roadmap/RoadmapHeader";
import { PhaseLabel } from "@/components/roadmap/PhaseLabel";
import { RoadmapNodeRow } from "@/components/roadmap/RoadmapNodeRow";
import { MissionDrawer } from "@/components/roadmap/MissionDrawer";
import { KokoSidePanel } from "@/components/roadmap/KokoSidePanel";
import { ROADMAP_NODES, PHASES, type RoadmapNode } from "@/components/roadmap/nodesData";
import { toast } from "@/hooks/use-toast";

const Roadmap = () => {
  const [nodes, setNodes] = useState<RoadmapNode[]>(ROADMAP_NODES);
  const [openNode, setOpenNode] = useState<RoadmapNode | null>(null);

  const progress = useMemo(() => {
    const completed = nodes.filter((n) => n.status === "completed").length;
    return Math.round((completed / nodes.length) * 100);
  }, [nodes]);

  // For the vertical path: completed-line height as a fraction of the path.
  // We treat completed + half of "current" as the visited portion.
  const visitedFraction = useMemo(() => {
    const completed = nodes.filter((n) => n.status === "completed").length;
    const hasCurrent = nodes.some((n) => n.status === "current");
    const visited = completed + (hasCurrent ? 0.5 : 0);
    return Math.min(1, visited / nodes.length);
  }, [nodes]);

  const handleNodeClick = (node: RoadmapNode) => {
    if (node.status === "locked") {
      toast({
        description: "🔒 Complete previous steps to unlock this mission",
      });
      return;
    }
    setOpenNode(node);
  };

  const handleComplete = (id: string) => {
    setNodes((prev) => {
      const idx = prev.findIndex((n) => n.id === id);
      if (idx < 0) return prev;
      const next = [...prev];
      next[idx] = { ...next[idx], status: "completed" };
      // promote the next locked node to current
      const nextLocked = next.findIndex((n, i) => i > idx && n.status === "locked");
      if (nextLocked > -1) {
        next[nextLocked] = { ...next[nextLocked], status: "current" };
      }
      return next;
    });
    setOpenNode(null);
  };

  // Group nodes by phase so we can interleave phase labels.
  const grouped = useMemo(() => {
    return PHASES.map((p) => ({
      ...p,
      items: nodes.filter((n) => n.phase === p.num),
    }));
  }, [nodes]);

  return (
    <div className="min-h-screen bg-background font-poppins text-foreground">
      <Sidebar activePath="/roadmap" />

      <div className="md:ml-[220px]">
        <TopBar title="My Roadmap" progress={progress} />

        <main className="mx-auto w-full max-w-[1180px] px-4 pb-24 pt-8 md:px-8 md:pb-12">
          <div className="grid grid-cols-1 gap-7 lg:grid-cols-[1fr_300px]">
            {/* LEFT: roadmap */}
            <section>
              <RoadmapHeader progress={progress} />

              {/* Vertical path container */}
              <div className="relative">
                {/* Background (upcoming) line — sits on the center column on
                    desktop, on the left edge on mobile. */}
                <div
                  aria-hidden
                  className="absolute top-0 h-full w-[3px] -translate-x-1/2 rounded-full bg-locked left-[24px] md:left-1/2"
                />
                {/* Completed (accent) line, animates height on load */}
                <div
                  aria-hidden
                  className="absolute top-0 w-[3px] origin-top -translate-x-1/2 rounded-full bg-accent left-[24px] md:left-1/2"
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
