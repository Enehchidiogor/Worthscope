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

export const PHASES = [
  { num: 1, title: "Phase 1 — Foundation", locked: false },
  { num: 2, title: "Phase 2 — Exploration 🔒", locked: true },
  { num: 3, title: "Phase 3 — Mastery 🔒", locked: true },
] as const;

export const ROADMAP_NODES: RoadmapNode[] = [
  { id: "n1", num: "01", title: "Explore Your Career Matches", sub: "Reviewed your top 4 career paths from the assessment", Icon: IconCompass, phase: 1, status: "completed" },
  { id: "n2", num: "02", title: "Understand the Field", sub: "Learn what Product Design actually involves day-to-day", Icon: IconBook, phase: 1, status: "completed" },
  { id: "n3", num: "03", title: "Learn the Basics of Figma", sub: "Complete your first design exercise using Figma", Icon: IconLayers, phase: 1, status: "current" },
  { id: "n4", num: "04", title: "Build Your First User Flow", sub: "Map a simple user journey for a real app idea", Icon: IconBranch, phase: 2, status: "locked" },
  { id: "n5", num: "05", title: "Study Real Design Case Studies", sub: "Analyze 3 products and note what works and why", Icon: IconEye, phase: 2, status: "locked" },
  { id: "n6", num: "06", title: "Complete a Mini Design Challenge", sub: "Redesign one screen from an existing app", Icon: IconPencil, phase: 2, status: "locked" },
  { id: "n7", num: "07", title: "Build a Portfolio Project", sub: "Design a product from scratch — brief provided", Icon: IconBriefcase, phase: 3, status: "locked" },
  { id: "n8", num: "08", title: "Get Feedback from the Community", sub: "Share your work and receive structured critique", Icon: IconChat, phase: 3, status: "locked" },
  { id: "n9", num: "09", title: "Career Blueprint Review", sub: "Koko reviews your progress and updates your roadmap", Icon: IconStar, phase: 3, status: "locked" },
];
