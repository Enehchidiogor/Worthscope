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
    cat === "tech"
      ? { "Problem Solving": 0, "Technical Tools": 0, "Communication": 0, "Research": 0 }
      : cat === "creative"
      ? { "UI Design": 0, "Problem Solving": 0, "Communication": 0, "Research": 0, "Technical Tools": 0 }
      : cat === "business"
      ? { "Communication": 0, "Problem Solving": 0, "Research": 0, "Technical Tools": 0 }
      : cat === "science"
      ? { "Research": 0, "Problem Solving": 0, "Communication": 0, "Technical Tools": 0 }
      : cat === "people"
      ? { "Communication": 0, "Problem Solving": 0, "Research": 0 }
      : cat === "communication"
      ? { "Communication": 0, "Research": 0, "Problem Solving": 0, "UI Design": 0 }
      : { "UI Design": 0, "Problem Solving": 0, "Communication": 0, "Research": 0, "Technical Tools": 0 };
  return {
    overallPct: 0,
    phase: 1,
    missionsCompleted: 0,
    totalMissions: 9,
    skills,
  };
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
