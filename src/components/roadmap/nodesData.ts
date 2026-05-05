import {
  IconCompass,
  IconBook,
  IconLayers,
  IconBranch,
  IconEye,
  IconPencil,
  IconBriefcase,
  IconChat,
  IconStar,
} from "@/components/dashboard/icons";
import type { ComponentType } from "react";
import { getProgress } from "@/lib/userState";
import { getActiveModule, loadModuleForCareer } from "@/lib/careerModules";

export type NodeStatus = "completed" | "current" | "locked";

export type RoadmapNode = {
  id: string;
  num: string;
  title: string;
  sub: string;
  Icon: ComponentType<{ className?: string }>;
  phase: 1 | 2 | 3;
  status: NodeStatus;
};

const ICONS = [IconCompass, IconBook, IconLayers, IconBranch, IconEye, IconPencil, IconBriefcase, IconChat, IconStar];

export function buildRoadmapForUser(): { nodes: RoadmapNode[]; phases: { num: 1 | 2 | 3; title: string; locked: boolean }[] } {
  const mod = getActiveModule() || loadModuleForCareer(null);
  const progress = getProgress();
  const done = progress.missionsCompleted;

  const nodes: RoadmapNode[] = [];
  let globalIdx = 0;
  mod.phases.forEach((p, pIdx) => {
    p.missions.forEach((mission) => {
      const phase = (pIdx + 1) as 1 | 2 | 3;
      const status: NodeStatus =
        globalIdx < done ? "completed" : globalIdx === done ? "current" : "locked";
      nodes.push({
        id: mission.id,
        num: String(globalIdx + 1).padStart(2, "0"),
        title: mission.title,
        sub: mission.description,
        Icon: ICONS[globalIdx % ICONS.length],
        phase,
        status,
      });
      globalIdx++;
    });
  });

  const phases = mod.phases.map((p, i) => ({
    num: (i + 1) as 1 | 2 | 3,
    title: p.title + (i > 0 && progress.phase < (i + 1) ? " 🔒" : ""),
    locked: i > 0 && progress.phase < (i + 1),
  }));

  return { nodes, phases };
}

// Back-compat exports
export const PHASES = [] as const;
export const ROADMAP_NODES: RoadmapNode[] = [];
