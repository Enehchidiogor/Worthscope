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

export const levelFor = (pct: number): Level =>
  pct >= 70 ? "Advanced" : pct >= 25 ? "Intermediate" : "Beginner";

const ICON_FOR: Record<string, Skill["icon"]> = {
  "UI Design": "layers",
  "Design Thinking": "bulb",
  "Prototyping": "wrench",
  "User Research": "search",
  "Problem Solving": "bulb",
  "Technical Tools": "wrench",
  "Data Literacy": "search",
  "Systems Thinking": "bulb",
  "Strategic Thinking": "bulb",
  "Communication": "chat",
  "Leadership": "bulb",
  "Business Analysis": "search",
  "Research": "search",
  "Analytical Thinking": "bulb",
  "Scientific Writing": "chat",
  "Lab Skills": "wrench",
  "Empathy": "chat",
  "Active Listening": "chat",
  "Case Analysis": "search",
  "Writing": "chat",
  "Storytelling": "chat",
  "Media Strategy": "bulb",
  "Content Creation": "layers",
};

export const iconForSkill = (name: string): Skill["icon"] => ICON_FOR[name] || "bulb";

// Legacy export kept for type compatibility — pages now compute skills dynamically
export const skills: Skill[] = [];
