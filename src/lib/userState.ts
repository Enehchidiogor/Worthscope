/* WorthScope — central user state.
   Single source of truth for profile, chosen career, progress, and the
   first-login flag. Every screen should read/write through these helpers
   instead of poking localStorage directly with strings. */

export type UserProfile = {
  fullName: string;
  firstName: string;
  lastName?: string;
  email?: string;
  age: number | "";
  educationLevel: "secondary" | "university" | "";
  classOrLevel: string;
};

export type ChosenCareer = {
  title: string;
  description?: string;
  icon?: string;
  category?: string;
  percentage?: number;
};

export type Progress = {
  overallPct: number;
  phase: 1 | 2 | 3;
  missionsCompleted: number;
  totalMissions: number;
  skills: Record<string, number>;
};

const K = {
  profile: "worthscope_user_profile",
  results: "worthscope_results",
  chosen: "worthscope_chosen_career",
  progress: "worthscope_progress",
  firstLogin: "worthscope_first_login",
} as const;

const safeParse = <T,>(raw: string | null): T | null => {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
};

/* ---------- Profile ---------- */
export function getProfile(): UserProfile | null {
  if (typeof window === "undefined") return null;
  const p = safeParse<UserProfile>(localStorage.getItem(K.profile));
  if (!p || !p.firstName) return null;
  return p;
}

export function getFirstName(fallback = "there"): string {
  return getProfile()?.firstName || fallback;
}

export function saveProfile(p: UserProfile) {
  localStorage.setItem(K.profile, JSON.stringify(p));
}

/* ---------- Results / chosen career ---------- */
export function hasResults(): boolean {
  return typeof window !== "undefined" && !!localStorage.getItem(K.results);
}

export function getChosenCareer(): ChosenCareer | null {
  if (typeof window === "undefined") return null;
  return safeParse<ChosenCareer>(localStorage.getItem(K.chosen));
}

export function setChosenCareer(c: ChosenCareer) {
  localStorage.setItem(K.chosen, JSON.stringify(c));
  // Initialise progress on first choice
  if (!localStorage.getItem(K.progress)) {
    saveProgress(defaultProgressForCareer(c));
  }
}

/* ---------- Progress ---------- */
export function defaultProgressForCareer(c?: ChosenCareer | null): Progress {
  const cat = c?.category;
  const skills =
    cat === "creative"
      ? { "UI Design": 0, "Design Thinking": 0, "Prototyping": 0, "User Research": 0 }
      : cat === "tech"
      ? { "Problem Solving": 0, "Technical Tools": 0, "Data Literacy": 0, "Systems Thinking": 0 }
      : cat === "business"
      ? { "Strategic Thinking": 0, "Communication": 0, "Leadership": 0, "Business Analysis": 0 }
      : cat === "science"
      ? { "Research": 0, "Analytical Thinking": 0, "Scientific Writing": 0, "Lab Skills": 0 }
      : cat === "people"
      ? { "Communication": 0, "Empathy": 0, "Active Listening": 0, "Case Analysis": 0 }
      : cat === "communication"
      ? { "Writing": 0, "Storytelling": 0, "Media Strategy": 0, "Content Creation": 0 }
      : { "UI Design": 0, "Problem Solving": 0, "Communication": 0, "Research": 0 };
  return {
    overallPct: 0,
    phase: 1,
    missionsCompleted: 0,
    totalMissions: 9,
    skills,
  };
}

/* ---------- Mission sets per career category ---------- */
export type MissionItem = { id: string; title: string; sub: string };

const MISSION_SETS: Record<string, (title: string) => MissionItem[]> = {
  creative: (title) => [
    { id: "m1", title: "Explore Your Career Matches", sub: "Review your top 4 paths" },
    { id: "m2", title: `Understand What a ${title} Does Daily`, sub: "Day-in-the-life overview" },
    { id: "m3", title: "Learn the Basics of Design Thinking", sub: "Foundational mindset" },
    { id: "m4", title: "Build Your First Project Brief", sub: "Define a real problem" },
    { id: "m5", title: "Explore Your Core Tool: Figma", sub: "Hands-on intro" },
    { id: "m6", title: "Complete a Design Challenge", sub: "Apply what you learned" },
    { id: "m7", title: "Build a Real Project", sub: "Portfolio piece" },
    { id: "m8", title: "Get Feedback and Iterate", sub: "Refine your work" },
    { id: "m9", title: "Career Blueprint Complete", sub: "You're ready" },
  ],
  tech: (title) => [
    { id: "m1", title: "Explore Your Career Matches", sub: "Review your top 4 paths" },
    { id: "m2", title: `Understand What a ${title} Does Daily`, sub: "Day-in-the-life overview" },
    { id: "m3", title: "Learn the Fundamentals of Your Field", sub: "Core concepts" },
    { id: "m4", title: "Write Your First Code / Query", sub: "Hands-on start" },
    { id: "m5", title: "Build a Simple Working Project", sub: "From idea to running" },
    { id: "m6", title: "Complete a Technical Challenge", sub: "Apply what you learned" },
    { id: "m7", title: "Build a Portfolio Project", sub: "Showcase your skills" },
    { id: "m8", title: "Review and Refine Your Work", sub: "Iterate on feedback" },
    { id: "m9", title: "Career Blueprint Complete", sub: "You're ready" },
  ],
  business: (title) => [
    { id: "m1", title: "Explore Your Career Matches", sub: "Review your top 4 paths" },
    { id: "m2", title: `Understand What a ${title} Does Daily`, sub: "Day-in-the-life overview" },
    { id: "m3", title: "Learn Business Fundamentals", sub: "Core concepts" },
    { id: "m4", title: "Map a Simple Business Problem", sub: "Frame it clearly" },
    { id: "m5", title: "Build a Strategy Framework", sub: "Structured thinking" },
    { id: "m6", title: "Present Your Ideas Clearly", sub: "Communicate value" },
    { id: "m7", title: "Complete a Business Challenge", sub: "Apply what you learned" },
    { id: "m8", title: "Refine and Improve", sub: "Iterate on feedback" },
    { id: "m9", title: "Career Blueprint Complete", sub: "You're ready" },
  ],
  science: (title) => [
    { id: "m1", title: "Explore Your Career Matches", sub: "Review your top 4 paths" },
    { id: "m2", title: `Understand What a ${title} Does Daily`, sub: "Day-in-the-life overview" },
    { id: "m3", title: "Learn Core Scientific Principles", sub: "Foundations" },
    { id: "m4", title: "Research Your Specialisation", sub: "Pick a focus" },
    { id: "m5", title: "Explore Career Pathways in Your Field", sub: "Map your options" },
    { id: "m6", title: "Complete a Research Summary", sub: "Apply what you learned" },
    { id: "m7", title: "Build Your Academic Foundation Plan", sub: "Roadmap of study" },
    { id: "m8", title: "Connect Skills to Career", sub: "Bridge the gap" },
    { id: "m9", title: "Career Blueprint Complete", sub: "You're ready" },
  ],
  people: (title) => [
    { id: "m1", title: "Explore Your Career Matches", sub: "Review your top 4 paths" },
    { id: "m2", title: `Understand What a ${title} Does Daily`, sub: "Day-in-the-life overview" },
    { id: "m3", title: "Learn Human Behaviour Fundamentals", sub: "Core concepts" },
    { id: "m4", title: "Practice Active Listening", sub: "Real exercises" },
    { id: "m5", title: "Study a Real-World Case", sub: "Learn from practice" },
    { id: "m6", title: "Build Your Communication Skills", sub: "Hands-on" },
    { id: "m7", title: "Complete a People Challenge", sub: "Apply what you learned" },
    { id: "m8", title: "Reflect and Improve", sub: "Iterate on feedback" },
    { id: "m9", title: "Career Blueprint Complete", sub: "You're ready" },
  ],
  communication: (title) => [
    { id: "m1", title: "Explore Your Career Matches", sub: "Review your top 4 paths" },
    { id: "m2", title: `Understand What a ${title} Does Daily`, sub: "Day-in-the-life overview" },
    { id: "m3", title: "Learn Storytelling Fundamentals", sub: "The craft" },
    { id: "m4", title: "Write Your First Piece", sub: "Hands-on start" },
    { id: "m5", title: "Build Your Content Strategy", sub: "Plan your voice" },
    { id: "m6", title: "Publish Something Real", sub: "Ship it" },
    { id: "m7", title: "Build a Portfolio of Work", sub: "Showcase your skills" },
    { id: "m8", title: "Get Feedback and Improve", sub: "Iterate" },
    { id: "m9", title: "Career Blueprint Complete", sub: "You're ready" },
  ],
};

export function getMissionsForCareer(c?: ChosenCareer | null): MissionItem[] {
  const career = c ?? getChosenCareer();
  const cat = career?.category || "creative";
  const builder = MISSION_SETS[cat] || MISSION_SETS.creative;
  return builder(career?.title || "Professional");
}


export function getProgress(): Progress {
  if (typeof window === "undefined") return defaultProgressForCareer();
  const p = safeParse<Progress>(localStorage.getItem(K.progress));
  if (!p) return defaultProgressForCareer(getChosenCareer());
  return {
    overallPct: typeof p.overallPct === "number" ? p.overallPct : 0,
    phase: (p.phase as 1 | 2 | 3) || 1,
    missionsCompleted: p.missionsCompleted || 0,
    totalMissions: p.totalMissions || 9,
    skills: p.skills || {},
  };
}

export function saveProgress(p: Progress) {
  localStorage.setItem(K.progress, JSON.stringify(p));
  window.dispatchEvent(new CustomEvent("worthscope:progress"));
}

export function completeMission(skillBoosts: Record<string, number> = {}): Progress {
  const cur = getProgress();
  const completed = Math.min(cur.totalMissions, cur.missionsCompleted + 1);
  const overallPct = Math.round((completed / cur.totalMissions) * 100);
  const phase: 1 | 2 | 3 = overallPct >= 67 ? 3 : overallPct >= 34 ? 2 : 1;
  const skills = { ...cur.skills };
  for (const [k, v] of Object.entries(skillBoosts)) {
    skills[k] = Math.min(100, (skills[k] || 0) + v);
  }
  const next: Progress = { ...cur, missionsCompleted: completed, overallPct, phase, skills };
  saveProgress(next);
  if (overallPct >= 70) {
    localStorage.setItem("worthscope_career_unlocked", "true");
  }
  return next;
}

/* ---------- Streak engine ---------- */
const K_STREAK = "worthscope_streak";
const K_SIGNUP = "worthscope_signup_date";
const K_ACTIVITY = "worthscope_activity_log";

const isoDate = (d = new Date()) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

const dayDiff = (a: string, b: string) => {
  const da = new Date(a + "T00:00:00").getTime();
  const db = new Date(b + "T00:00:00").getTime();
  return Math.round((db - da) / 86400000);
};

export type Streak = { count: number; lastVisitDate: string };

export function getSignupDate(): string {
  if (typeof window === "undefined") return isoDate();
  let d = localStorage.getItem(K_SIGNUP);
  if (!d) {
    d = isoDate();
    localStorage.setItem(K_SIGNUP, d);
  }
  return d;
}

export function getStreak(): Streak {
  if (typeof window === "undefined") return { count: 1, lastVisitDate: isoDate() };
  const raw = safeParse<Streak>(localStorage.getItem(K_STREAK));
  return raw || { count: 0, lastVisitDate: "" };
}

/** Call on every dashboard load — updates streak per spec. */
export function tickStreak(): Streak {
  if (typeof window === "undefined") return { count: 1, lastVisitDate: isoDate() };
  getSignupDate(); // ensure signup is recorded
  const today = isoDate();
  const cur = getStreak();
  let next: Streak;
  if (!cur.lastVisitDate) {
    next = { count: 1, lastVisitDate: today };
  } else if (cur.lastVisitDate === today) {
    next = cur;
  } else {
    const diff = dayDiff(cur.lastVisitDate, today);
    if (diff === 1) next = { count: cur.count + 1, lastVisitDate: today };
    else next = { count: 1, lastVisitDate: today };
  }
  localStorage.setItem(K_STREAK, JSON.stringify(next));
  recordActivity();
  window.dispatchEvent(new CustomEvent("worthscope:streak"));
  return next;
}

export function getActivityLog(): Record<string, number> {
  if (typeof window === "undefined") return {};
  return safeParse<Record<string, number>>(localStorage.getItem(K_ACTIVITY)) || {};
}

export function recordActivity(amount = 1) {
  if (typeof window === "undefined") return;
  const log = getActivityLog();
  const k = isoDate();
  log[k] = (log[k] || 0) + amount;
  localStorage.setItem(K_ACTIVITY, JSON.stringify(log));
  window.dispatchEvent(new CustomEvent("worthscope:activity"));
}

/* ---------- First-login flag (controls Welcome vs Welcome back) ---------- */
export function isFirstLogin(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(K.firstLogin) !== "true";
}

export function markLoggedIn() {
  localStorage.setItem(K.firstLogin, "true");
}

/* ---------- Routing helper ---------- */
export function nextRouteFromState(): string {
  if (!getProfile()) return "/onboarding";
  if (!hasResults()) return "/assessment";
  if (!getChosenCareer()) return "/career-results";
  return "/dashboard";
}
