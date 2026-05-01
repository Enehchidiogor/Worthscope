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
import { getMissionsForCareer, getProgress, getChosenCareer } from "@/lib/userState";

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

export const phaseTitlesFor = (category?: string): [string, string, string] => {
  if (category === "creative") return ["Phase 1 — Basics", "Phase 2 — Portfolio Building 🔒", "Phase 3 — Professional 🔒"];
  if (category === "business") return ["Phase 1 — Foundation", "Phase 2 — Strategy 🔒", "Phase 3 — Leadership 🔒"];
  if (category === "science") return ["Phase 1 — Foundation", "Phase 2 — Research 🔒", "Phase 3 — Specialisation 🔒"];
  if (category === "people") return ["Phase 1 — Foundation", "Phase 2 — Practice 🔒", "Phase 3 — Impact 🔒"];
  if (category === "communication") return ["Phase 1 — Foundation", "Phase 2 — Content Building 🔒", "Phase 3 — Professional 🔒"];
  return ["Phase 1 — Foundation", "Phase 2 — Exploration 🔒", "Phase 3 — Mastery 🔒"];
};

export function buildRoadmapForUser(): { nodes: RoadmapNode[]; phases: { num: 1 | 2 | 3; title: string; locked: boolean }[] } {
  const career = getChosenCareer();
  const missions = getMissionsForCareer(career);
  const progress = getProgress();
  const done = progress.missionsCompleted;

  const nodes: RoadmapNode[] = missions.map((m, i) => {
    const phase = (i < 3 ? 1 : i < 6 ? 2 : 3) as 1 | 2 | 3;
    const status: NodeStatus = i < done ? "completed" : i === done ? "current" : "locked";
    return {
      id: `n${i + 1}`,
      num: String(i + 1).padStart(2, "0"),
      title: m.title,
      sub: m.sub,
      Icon: ICONS[i % ICONS.length],
      phase,
      status,
    };
  });

  const titles = phaseTitlesFor(career?.category);
  const phases: { num: 1 | 2 | 3; title: string; locked: boolean }[] = [
    { num: 1, title: titles[0], locked: false },
    { num: 2, title: titles[1], locked: progress.phase < 2 },
    { num: 3, title: titles[2], locked: progress.phase < 3 },
  ];
  return { nodes, phases };
}

// Back-compat exports — used as initial values; prefer buildRoadmapForUser()
export const PHASES = [
  { num: 1, title: "Phase 1 — Foundation", locked: false },
  { num: 2, title: "Phase 2 — Exploration 🔒", locked: true },
  { num: 3, title: "Phase 3 — Mastery 🔒", locked: true },
] as const;

export const ROADMAP_NODES: RoadmapNode[] = [];
