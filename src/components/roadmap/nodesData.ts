import {
  IconCompass, IconBook, IconLayers, IconBranch, IconEye, IconPencil,
  IconBriefcase, IconChat, IconStar,
} from "@/components/dashboard/icons";
import type { ComponentType } from "react";
import {
  loadRoadmap, getMissionStatus, isPhaseLocked, missionId, type KokoRoadmap,
} from "@/lib/kokoRoadmap";

export type NodeStatus = "completed" | "current" | "locked";

export type RoadmapNode = {
  id: string;
  num: string;
  title: string;
  sub: string;
  Icon: ComponentType<{ className?: string }>;
  phase: number;
  status: NodeStatus;
};

const ICONS = [IconCompass, IconBook, IconLayers, IconBranch, IconEye, IconPencil, IconBriefcase, IconChat, IconStar];

export function buildRoadmapForUser(): {
  roadmap: KokoRoadmap | null;
  nodes: RoadmapNode[];
  phases: { num: number; title: string; locked: boolean }[];
} {
  const r = loadRoadmap();
  if (!r) return { roadmap: null, nodes: [], phases: [] };

  const nodes: RoadmapNode[] = [];
  let globalIdx = 0;
  for (const p of r.phases) {
    for (const m of p.missions) {
      const status = getMissionStatus(r, p.phase_number, m.mission_number) as NodeStatus;
      nodes.push({
        id: missionId(p.phase_number, m.mission_number),
        num: String(globalIdx + 1).padStart(2, "0"),
        title: m.mission_title,
        sub: m.mission_description,
        Icon: ICONS[globalIdx % ICONS.length],
        phase: p.phase_number,
        status,
      });
      globalIdx++;
    }
  }

  const phases = r.phases.map((p) => ({
    num: p.phase_number,
    title: `Phase ${p.phase_number}: ${p.phase_title}`,
    locked: isPhaseLocked(r, p.phase_number),
  }));

  return { roadmap: r, nodes, phases };
}
