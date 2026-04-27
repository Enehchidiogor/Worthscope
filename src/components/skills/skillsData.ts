export type Level = "Beginner" | "Intermediate" | "Advanced";

export type Skill = {
  id: string;
  name: string;
  percent: number;
  level: Level;
  growth: number; // weekly delta
  icon: "layers" | "bulb" | "chat" | "search" | "wrench";
  link: string;
};

export const skills: Skill[] = [
  { id: "ui", name: "UI Design", percent: 40, level: "Intermediate", growth: 8, icon: "layers", link: "Continue learning →" },
  { id: "ps", name: "Problem Solving", percent: 65, level: "Intermediate", growth: 5, icon: "bulb", link: "Keep going →" },
  { id: "comm", name: "Communication", percent: 30, level: "Beginner", growth: 3, icon: "chat", link: "Start here →" },
  { id: "research", name: "Research", percent: 20, level: "Beginner", growth: 2, icon: "search", link: "Start here →" },
  { id: "tech", name: "Technical Tools", percent: 55, level: "Intermediate", growth: 10, icon: "wrench", link: "Continue →" },
];

export const weeklyData = [
  { day: "M", height: 45, active: true },
  { day: "T", height: 60, active: true },
  { day: "W", height: 35, active: true },
  { day: "T", height: 70, active: true, today: true },
  { day: "F", height: 0, active: false },
  { day: "S", height: 0, active: false },
  { day: "S", height: 0, active: false },
];

export const relatedMissions = [
  { id: "m1", tag: "UI Design", title: "Learn the Basics of Design Thinking", sub: "Phase 1 · Mission 3", locked: false },
  { id: "m2", tag: "Research", title: "Explore Tools of the Trade", sub: "Phase 2 · Mission 6 · Locked", locked: true },
  { id: "m3", tag: "Technical Tools", title: "Build Your First Project Brief", sub: "Phase 2 · Mission 4 · Locked", locked: true },
];
