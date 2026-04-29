/* WorthScope — Advanced Career Recommendation System (CRS)
 * 7-stage weighted scoring against career profiles.
 * Deterministic, side-effect free except for localStorage persistence.
 */

export type Answers = {
  // Profile (sourced from worthscope_user_profile, merged in by Assessment)
  fullName?: string;
  firstName?: string;
  age?: number | null;
  ageRange?: string | null;
  educationLevel: "secondary" | "university" | null;
  classOrLevel?: string | null;

  // Core traits
  strongSubjects: string[];
  interests: string[];
  activities: string[];
  personality: string | null;
  careerClarity?: string | null;

  // Career direction refinement
  careerInclination: string | null;
  statedCareer: string | null;
  preferenceConflict: string | null;
  taskInterests: string[];
  outputPreference: string | null;
  careerConfidence: string | null;

  // Course alignment (now derived from Q7 wording adapted by stage)
  courseAlignment?: string | null;

  // Legacy (unused by new flow but kept optional for back-compat)
  schoolClass?: string | null;
  skillsStarted?: string | null;
  uniLevel?: string | null;

  // Final
  goalOrConcern: string;
};

export type CategoryKey =
  | "tech"
  | "creative"
  | "business"
  | "science"
  | "people"
  | "communication";

export type CareerResult = {
  rank: number;
  title: string;
  percentage: number;
  description: string;
  matchReason: string;
  icon: string;
  category: CategoryKey;
};

type CareerProfile = {
  id: string;
  title: string;
  category: CategoryKey;
  icon: string;
  description: string;
  signals: {
    preferenceConflict: string[];
    taskInterests: string[];
    outputPreference: string[];
    interests: string[];
    personality: string[];
    subjects: string[];
    activities: string[];
  };
};

const WEIGHTS = {
  preferenceConflict: 25,
  taskInterests: 25,
  outputPreference: 15,
  careerInclination: 15,
  interests: 20,
  personality: 15,
  subjects: 10,
  activities: 8,
};

/* ===================== CAREER PROFILES ===================== */
const careerProfiles: CareerProfile[] = [
  // TECH
  {
    id: "software_developer",
    title: "Software Developer",
    category: "tech",
    icon: "code",
    description: "Build applications and systems that power the digital world.",
    signals: {
      preferenceConflict: ["Build systems and solve technical problems"],
      taskInterests: ["Writing code or building software", "Solving logical or technical problems"],
      outputPreference: ["A finished app or software people use"],
      interests: ["Technology"],
      personality: ["Logical and analytical", "Curious and exploratory"],
      subjects: ["Mathematics", "Technology / ICT"],
      activities: ["Solving problems", "Working independently"],
    },
  },
  {
    id: "ux_designer",
    title: "UI/UX Designer",
    category: "creative",
    icon: "design",
    description: "Design intuitive digital experiences that people genuinely love using.",
    signals: {
      preferenceConflict: ["Design and create visual experiences"],
      taskInterests: ["Designing apps or interfaces", "Creating content or visuals"],
      outputPreference: ["A beautiful design or visual experience"],
      interests: ["Creative Arts / Design", "Technology"],
      personality: ["Creative and expressive", "Curious and exploratory"],
      subjects: ["Arts / Literature", "Technology / ICT"],
      activities: ["Creating or designing things", "Solving problems"],
    },
  },
  {
    id: "product_designer",
    title: "Product Designer",
    category: "creative",
    icon: "layers",
    description: "Create digital products and experiences that solve real problems for people.",
    signals: {
      preferenceConflict: ["Design and create visual experiences", "Build systems and solve technical problems"],
      taskInterests: ["Designing apps or interfaces", "Managing or organising projects"],
      outputPreference: ["A beautiful design or visual experience", "A finished app or software people use"],
      interests: ["Creative Arts / Design", "Technology"],
      personality: ["Creative and expressive", "Logical and analytical"],
      subjects: ["Arts / Literature", "Technology / ICT"],
      activities: ["Creating or designing things", "Solving problems"],
    },
  },
  {
    id: "data_analyst",
    title: "Data Analyst",
    category: "tech",
    icon: "chart",
    description: "Turn raw data into clear insights that drive smarter decisions.",
    signals: {
      preferenceConflict: ["Analyse data and turn it into decisions"],
      taskInterests: ["Solving logical or technical problems", "Researching and analysing ideas"],
      outputPreference: ["A report or insight that drove a real decision"],
      interests: ["Technology", "Science / Research"],
      personality: ["Logical and analytical", "Quiet and observant"],
      subjects: ["Mathematics", "Technology / ICT"],
      activities: ["Solving problems", "Learning new concepts"],
    },
  },
  {
    id: "data_scientist",
    title: "Data Scientist",
    category: "tech",
    icon: "brain",
    description: "Apply statistics and machine learning to extract meaning from complex data.",
    signals: {
      preferenceConflict: ["Analyse data and turn it into decisions", "Research, discover, and understand how things work"],
      taskInterests: ["Solving logical or technical problems", "Researching and analysing ideas"],
      outputPreference: ["A report or insight that drove a real decision"],
      interests: ["Technology", "Science / Research"],
      personality: ["Logical and analytical", "Curious and exploratory"],
      subjects: ["Mathematics", "Sciences"],
      activities: ["Solving problems", "Learning new concepts", "Working independently"],
    },
  },
  {
    id: "cybersecurity_analyst",
    title: "Cybersecurity Analyst",
    category: "tech",
    icon: "shield",
    description: "Protect digital systems and data from threats and attacks.",
    signals: {
      preferenceConflict: ["Build systems and solve technical problems"],
      taskInterests: ["Solving logical or technical problems", "Writing code or building software"],
      outputPreference: ["A finished app or software people use"],
      interests: ["Technology"],
      personality: ["Logical and analytical", "Quiet and observant"],
      subjects: ["Mathematics", "Technology / ICT"],
      activities: ["Solving problems", "Working independently"],
    },
  },
  {
    id: "mobile_developer",
    title: "Mobile App Developer",
    category: "tech",
    icon: "mobile",
    description: "Create apps that live in people's pockets and solve real problems.",
    signals: {
      preferenceConflict: ["Build systems and solve technical problems", "Design and create visual experiences"],
      taskInterests: ["Writing code or building software", "Designing apps or interfaces"],
      outputPreference: ["A finished app or software people use"],
      interests: ["Technology", "Creative Arts / Design"],
      personality: ["Practical and hands-on", "Logical and analytical"],
      subjects: ["Technology / ICT", "Mathematics"],
      activities: ["Creating or designing things", "Solving problems"],
    },
  },

  // CREATIVE
  {
    id: "graphic_designer",
    title: "Graphic Designer",
    category: "creative",
    icon: "palette",
    description: "Communicate ideas visually through compelling, purposeful design.",
    signals: {
      preferenceConflict: ["Design and create visual experiences"],
      taskInterests: ["Creating content or visuals", "Designing apps or interfaces"],
      outputPreference: ["A beautiful design or visual experience"],
      interests: ["Creative Arts / Design"],
      personality: ["Creative and expressive"],
      subjects: ["Arts / Literature"],
      activities: ["Creating or designing things"],
    },
  },
  {
    id: "content_creator",
    title: "Content Creator",
    category: "communication",
    icon: "video",
    description: "Build audiences and brands through engaging, original digital content.",
    signals: {
      preferenceConflict: ["Design and create visual experiences", "Work with people and communicate ideas"],
      taskInterests: ["Creating content or visuals"],
      outputPreference: ["Content or ideas I put out into the world"],
      interests: ["Communication / Media", "Creative Arts / Design"],
      personality: ["Creative and expressive", "Social and outgoing"],
      subjects: ["Arts / Literature"],
      activities: ["Creating or designing things", "Working with others"],
    },
  },
  {
    id: "motion_designer",
    title: "Motion Designer",
    category: "creative",
    icon: "play",
    description: "Bring ideas to life through animation and visual storytelling.",
    signals: {
      preferenceConflict: ["Design and create visual experiences"],
      taskInterests: ["Creating content or visuals", "Designing apps or interfaces"],
      outputPreference: ["A beautiful design or visual experience"],
      interests: ["Creative Arts / Design"],
      personality: ["Creative and expressive", "Curious and exploratory"],
      subjects: ["Arts / Literature", "Technology / ICT"],
      activities: ["Creating or designing things"],
    },
  },

  // BUSINESS
  {
    id: "product_manager",
    title: "Product Manager",
    category: "business",
    icon: "briefcase",
    description: "Lead the strategy and vision behind products that millions of people use.",
    signals: {
      preferenceConflict: ["Start, lead, and grow business ideas", "Build systems and solve technical problems"],
      taskInterests: ["Managing or organising projects", "Solving logical or technical problems"],
      outputPreference: ["A business or product I built from scratch", "A finished app or software people use"],
      interests: ["Business / Entrepreneurship", "Technology"],
      personality: ["Logical and analytical", "Social and outgoing"],
      subjects: ["Business / Economics", "Technology / ICT"],
      activities: ["Leading or organizing people", "Solving problems"],
    },
  },
  {
    id: "entrepreneur",
    title: "Entrepreneur",
    category: "business",
    icon: "rocket",
    description: "Build your own business and create real value from the ground up.",
    signals: {
      preferenceConflict: ["Start, lead, and grow business ideas"],
      taskInterests: ["Managing or organising projects"],
      outputPreference: ["A business or product I built from scratch"],
      interests: ["Business / Entrepreneurship"],
      personality: ["Practical and hands-on", "Social and outgoing"],
      subjects: ["Business / Economics"],
      activities: ["Leading or organizing people", "Working independently"],
    },
  },
  {
    id: "marketing_strategist",
    title: "Marketing Strategist",
    category: "business",
    icon: "target",
    description: "Plan and execute campaigns that grow brands and drive real results.",
    signals: {
      preferenceConflict: ["Work with people and communicate ideas", "Start, lead, and grow business ideas"],
      taskInterests: ["Creating content or visuals", "Managing or organising projects"],
      outputPreference: ["A business or product I built from scratch", "Content or ideas I put out into the world"],
      interests: ["Business / Entrepreneurship", "Communication / Media"],
      personality: ["Social and outgoing", "Creative and expressive"],
      subjects: ["Business / Economics", "Arts / Literature"],
      activities: ["Leading or organizing people", "Working with others"],
    },
  },
  {
    id: "business_analyst",
    title: "Business Analyst",
    category: "business",
    icon: "chart",
    description: "Analyse business problems and translate them into clear, actionable solutions.",
    signals: {
      preferenceConflict: ["Analyse data and turn it into decisions"],
      taskInterests: ["Researching and analysing ideas", "Solving logical or technical problems"],
      outputPreference: ["A report or insight that drove a real decision"],
      interests: ["Business / Entrepreneurship", "Technology"],
      personality: ["Logical and analytical"],
      subjects: ["Business / Economics", "Mathematics"],
      activities: ["Solving problems", "Learning new concepts"],
    },
  },
  {
    id: "financial_analyst",
    title: "Financial Analyst",
    category: "business",
    icon: "money",
    description: "Guide financial decisions with data-driven insight and clear analysis.",
    signals: {
      preferenceConflict: ["Analyse data and turn it into decisions"],
      taskInterests: ["Researching and analysing ideas", "Solving logical or technical problems"],
      outputPreference: ["A report or insight that drove a real decision"],
      interests: ["Business / Entrepreneurship"],
      personality: ["Logical and analytical", "Quiet and observant"],
      subjects: ["Mathematics", "Business / Economics"],
      activities: ["Solving problems", "Working independently"],
    },
  },

  // SCIENCE
  {
    id: "medical_doctor",
    title: "Medical Doctor",
    category: "science",
    icon: "health",
    description: "Diagnose, treat, and genuinely improve the lives of patients every day.",
    signals: {
      preferenceConflict: ["Research, discover, and understand how things work", "Work with people and communicate ideas"],
      taskInterests: ["Researching and analysing ideas", "Solving logical or technical problems"],
      outputPreference: ["A person or community I genuinely helped"],
      interests: ["Science / Research", "Helping People"],
      personality: ["Logical and analytical", "Practical and hands-on"],
      subjects: ["Sciences"],
      activities: ["Learning new concepts", "Working with others"],
    },
  },
  {
    id: "biotechnologist",
    title: "Biotechnologist",
    category: "science",
    icon: "lab",
    description: "Use biology and technology to develop life-changing innovations.",
    signals: {
      preferenceConflict: ["Research, discover, and understand how things work"],
      taskInterests: ["Researching and analysing ideas", "Solving logical or technical problems"],
      outputPreference: ["A report or insight that drove a real decision"],
      interests: ["Science / Research"],
      personality: ["Curious and exploratory", "Logical and analytical"],
      subjects: ["Sciences", "Mathematics"],
      activities: ["Learning new concepts", "Working independently"],
    },
  },
  {
    id: "environmental_scientist",
    title: "Environmental Scientist",
    category: "science",
    icon: "leaf",
    description: "Study and protect the natural world for future generations.",
    signals: {
      preferenceConflict: ["Research, discover, and understand how things work"],
      taskInterests: ["Researching and analysing ideas"],
      outputPreference: ["A person or community I genuinely helped"],
      interests: ["Science / Research"],
      personality: ["Curious and exploratory"],
      subjects: ["Sciences", "Social Sciences"],
      activities: ["Learning new concepts", "Working independently"],
    },
  },

  // PEOPLE
  {
    id: "psychologist",
    title: "Psychologist",
    category: "people",
    icon: "heart",
    description: "Help people understand their minds and overcome life's challenges.",
    signals: {
      preferenceConflict: ["Work with people and communicate ideas"],
      taskInterests: ["Researching and analysing ideas"],
      outputPreference: ["A person or community I genuinely helped"],
      interests: ["Helping People", "Science / Research"],
      personality: ["Social and outgoing", "Quiet and observant"],
      subjects: ["Social Sciences"],
      activities: ["Working with others", "Learning new concepts"],
    },
  },
  {
    id: "hr_manager",
    title: "Human Resource Manager",
    category: "people",
    icon: "people",
    description: "Build and support the teams that make organisations thrive.",
    signals: {
      preferenceConflict: ["Work with people and communicate ideas"],
      taskInterests: ["Managing or organising projects"],
      outputPreference: ["A person or community I genuinely helped"],
      interests: ["Helping People", "Business / Entrepreneurship"],
      personality: ["Social and outgoing"],
      subjects: ["Social Sciences", "Business / Economics"],
      activities: ["Leading or organizing people", "Working with others"],
    },
  },
  {
    id: "teacher",
    title: "Teacher / Educator",
    category: "people",
    icon: "book",
    description: "Shape the next generation through knowledge, mentorship, and care.",
    signals: {
      preferenceConflict: ["Work with people and communicate ideas"],
      taskInterests: ["Managing or organising projects", "Creating content or visuals"],
      outputPreference: ["A person or community I genuinely helped"],
      interests: ["Helping People", "Communication / Media"],
      personality: ["Social and outgoing"],
      subjects: ["Social Sciences", "Arts / Literature"],
      activities: ["Working with others", "Leading or organizing people"],
    },
  },

  // COMMUNICATION
  {
    id: "digital_marketer",
    title: "Digital Marketer",
    category: "communication",
    icon: "megaphone",
    description: "Grow brands and audiences through creative, data-driven online strategies.",
    signals: {
      preferenceConflict: ["Work with people and communicate ideas"],
      taskInterests: ["Creating content or visuals", "Researching and analysing ideas"],
      outputPreference: ["Content or ideas I put out into the world"],
      interests: ["Communication / Media", "Business / Entrepreneurship"],
      personality: ["Social and outgoing", "Creative and expressive"],
      subjects: ["Business / Economics", "Arts / Literature"],
      activities: ["Working with others", "Creating or designing things"],
    },
  },
  {
    id: "copywriter",
    title: "Copywriter",
    category: "communication",
    icon: "pen",
    description: "Craft words that persuade, inform, and inspire people to act.",
    signals: {
      preferenceConflict: ["Work with people and communicate ideas"],
      taskInterests: ["Creating content or visuals"],
      outputPreference: ["Content or ideas I put out into the world"],
      interests: ["Communication / Media", "Creative Arts / Design"],
      personality: ["Creative and expressive", "Quiet and observant"],
      subjects: ["Arts / Literature"],
      activities: ["Creating or designing things", "Working independently"],
    },
  },
  {
    id: "journalist",
    title: "Journalist",
    category: "communication",
    icon: "news",
    description: "Uncover stories and inform the public through compelling, honest reporting.",
    signals: {
      preferenceConflict: ["Work with people and communicate ideas", "Research, discover, and understand how things work"],
      taskInterests: ["Researching and analysing ideas", "Creating content or visuals"],
      outputPreference: ["Content or ideas I put out into the world"],
      interests: ["Communication / Media"],
      personality: ["Social and outgoing", "Curious and exploratory"],
      subjects: ["Arts / Literature", "Social Sciences"],
      activities: ["Working with others", "Learning new concepts"],
    },
  },
  {
    id: "pr_specialist",
    title: "PR Specialist",
    category: "communication",
    icon: "chat",
    description: "Shape how the world sees brands and organisations through strategic storytelling.",
    signals: {
      preferenceConflict: ["Work with people and communicate ideas"],
      taskInterests: ["Creating content or visuals", "Managing or organising projects"],
      outputPreference: ["Content or ideas I put out into the world"],
      interests: ["Communication / Media", "Business / Entrepreneurship"],
      personality: ["Social and outgoing"],
      subjects: ["Arts / Literature", "Business / Economics"],
      activities: ["Working with others", "Leading or organizing people"],
    },
  },
  {
    id: "tech_content_creator",
    title: "Tech Content Creator",
    category: "communication",
    icon: "video",
    description: "Explain complex tech topics to audiences who need to understand them.",
    signals: {
      preferenceConflict: ["Work with people and communicate ideas", "Design and create visual experiences"],
      taskInterests: ["Creating content or visuals", "Solving logical or technical problems"],
      outputPreference: ["Content or ideas I put out into the world"],
      interests: ["Communication / Media", "Technology"],
      personality: ["Creative and expressive", "Social and outgoing"],
      subjects: ["Technology / ICT", "Arts / Literature"],
      activities: ["Creating or designing things", "Working with others"],
    },
  },
];

/* ===================== HELPERS ===================== */
// Strip leading subject parenthetical, e.g. "Sciences (Physics, ...)" -> "Sciences"
function normSubject(s: string): string {
  return s.replace(/\s*\(.*\)\s*/, "").trim();
}

type ScoreEntry = { career: CareerProfile; score: number };

/* ===================== STAGE 2 — SCORING ===================== */
function scoreCareer(career: CareerProfile, a: Answers): number {
  let score = 0;

  if (a.preferenceConflict && career.signals.preferenceConflict.includes(a.preferenceConflict)) {
    score += WEIGHTS.preferenceConflict;
  }

  const taskMatches = (a.taskInterests || []).filter((t) =>
    career.signals.taskInterests.includes(t)
  ).length;
  score += (taskMatches / Math.max(career.signals.taskInterests.length, 1)) * WEIGHTS.taskInterests;

  if (a.outputPreference && career.signals.outputPreference.includes(a.outputPreference)) {
    score += WEIGHTS.outputPreference;
  }

  const interestMatches = (a.interests || []).filter((i) =>
    career.signals.interests.includes(i)
  ).length;
  score += (interestMatches / Math.max(career.signals.interests.length, 1)) * WEIGHTS.interests;

  if (a.personality && career.signals.personality.includes(a.personality)) {
    score += WEIGHTS.personality;
  }

  const subjectMatches = (a.strongSubjects || [])
    .map(normSubject)
    .filter((s) => career.signals.subjects.includes(s)).length;
  score += (subjectMatches / Math.max(career.signals.subjects.length, 1)) * WEIGHTS.subjects;

  const activityMatches = (a.activities || []).filter((act) =>
    career.signals.activities.includes(act)
  ).length;
  score += (activityMatches / Math.max(career.signals.activities.length, 1)) * WEIGHTS.activities;

  return score;
}

/* ===================== STAGE 3 — INCLINATION OVERRIDE ===================== */
function applyInclinationBoost(scores: ScoreEntry[], a: Answers): ScoreEntry[] {
  if (!a.statedCareer || a.statedCareer.trim().length < 2) return scores;
  const stated = a.statedCareer.toLowerCase().trim();

  let boost = 0;
  switch (a.careerConfidence) {
    case "Very confident — I know what I want": boost = 30; break;
    case "Somewhat confident — fairly sure": boost = 18; break;
    case "Not very confident — still figuring it out": boost = 8; break;
    default: boost = 0;
  }
  if (boost === 0) return scores;

  const statedFirst = stated.split(/\s+/)[0];

  return scores.map(({ career, score }) => {
    const titleWords = career.title.toLowerCase().split(/[\s/]+/).filter(Boolean);
    const isMatch = titleWords.some(
      (w) => w.length > 2 && (stated.includes(w) || w.includes(statedFirst))
    );
    return { career, score: isMatch ? score + boost : score };
  });
}

/* ===================== STAGE 4 — PERSONALIZATION ===================== */
function applyPersonalization(scores: ScoreEntry[], a: Answers): ScoreEntry[] {
  let next = scores;

  if (a.educationLevel === "university") {
    const map: Record<string, number> = {
      "Yes, completely": 3,
      "Somewhat": 1,
      "Not really": -1,
      "Not at all": -2,
    };
    const boost = (a.courseAlignment && map[a.courseAlignment]) || 0;
    if (boost !== 0) {
      const topScore = Math.max(...next.map((s) => s.score));
      next = next.map(({ career, score }) => ({
        career,
        score: score === topScore ? score + boost : score,
      }));
    }
  }

  if (a.goalOrConcern) {
    const text = a.goalOrConcern.toLowerCase();
    const groups: { words: string[]; categories: CategoryKey[]; boost: number }[] = [
      { words: ["money", "pay", "salary", "earn", "income", "rich", "wealth"], categories: ["business", "tech"], boost: 4 },
      { words: ["help", "people", "care", "support", "community", "impact"], categories: ["people", "communication"], boost: 4 },
      { words: ["design", "create", "art", "beautiful", "visual", "creative"], categories: ["creative"], boost: 4 },
      { words: ["code", "software", "tech", "developer", "data", "app", "program", "build"], categories: ["tech"], boost: 4 },
      { words: ["research", "discover", "study", "lab", "medicine", "doctor", "science"], categories: ["science"], boost: 4 },
      { words: ["write", "speak", "media", "journal", "market", "brand", "communicate"], categories: ["communication"], boost: 4 },
    ];
    for (const g of groups) {
      if (g.words.some((w) => text.includes(w))) {
        next = next.map(({ career, score }) => ({
          career,
          score: g.categories.includes(career.category) ? score + g.boost : score,
        }));
      }
    }
  }

  return next;
}

/* ===================== STAGE 5 — DIVERSITY ===================== */
function enforceDiversity(sorted: ScoreEntry[]): ScoreEntry[] {
  const top: ScoreEntry[] = [];
  const counts: Partial<Record<CategoryKey, number>> = {};
  // First pass: take entries respecting max 2 per category
  for (const entry of sorted) {
    if (top.length >= 4) break;
    const c = entry.career.category;
    if ((counts[c] || 0) >= 2) continue;
    top.push(entry);
    counts[c] = (counts[c] || 0) + 1;
  }
  // Backfill if not enough (shouldn't happen, but safe)
  if (top.length < 4) {
    for (const entry of sorted) {
      if (top.length >= 4) break;
      if (!top.find((t) => t.career.id === entry.career.id)) top.push(entry);
    }
  }
  return top;
}

/* ===================== STAGE 6 — NORMALIZATION ===================== */
function hashAnswers(a: Answers): number {
  const str = JSON.stringify(a);
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) | 0;
  return Math.abs(h) || 1;
}
function seededRand(seed: number) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function normalizeToPercentages(top4: ScoreEntry[], a: Answers): { career: CareerProfile; percentage: number }[] {
  const rand = seededRand(hashAnswers(a));
  const targetTop = 90 + Math.floor(rand() * 8); // 90..97
  const topScore = top4[0]?.score || 1;
  const gaps = [0, 7, 6, 6];

  return top4.map(({ career, score }, i) => {
    let pct: number;
    if (i === 0) {
      pct = targetTop;
    } else {
      const ratio = score / Math.max(topScore, 1);
      const proportional = Math.round(targetTop * ratio);
      const cumulativeGap = gaps.slice(0, i + 1).reduce((x, y) => x + y, 0);
      const ceiling = targetTop - cumulativeGap;
      pct = Math.min(proportional, ceiling);
    }
    pct = Math.max(58, Math.min(97, pct));
    return { career, percentage: pct };
  });
}

/* ===================== STAGE 7 — MATCH REASON ===================== */
function generateMatchReason(career: CareerProfile, a: Answers): string {
  const reasons: string[] = [];

  if (a.preferenceConflict && career.signals.preferenceConflict.includes(a.preferenceConflict)) {
    reasons.push(`you prefer to ${a.preferenceConflict.toLowerCase()}`);
  }
  const matchedTasks = (a.taskInterests || []).filter((t) =>
    career.signals.taskInterests.includes(t)
  );
  if (matchedTasks.length > 0) {
    reasons.push(`your interest in ${matchedTasks[0].toLowerCase()}`);
  }
  if (a.personality && career.signals.personality.includes(a.personality)) {
    reasons.push(`your ${a.personality.split(" ")[0].toLowerCase()} personality`);
  }
  const matchedInterests = (a.interests || []).filter((i) =>
    career.signals.interests.includes(i)
  );
  if (matchedInterests.length > 0 && reasons.length < 3) {
    reasons.push(`your interest in ${matchedInterests[0].toLowerCase()}`);
  }

  const top2 = reasons.slice(0, 2);
  let s: string;
  if (top2.length === 0) s = "Aligns with your overall profile and goals.";
  else if (top2.length === 1) s = `Matches ${top2[0]}.`;
  else s = `Matches ${top2[0]} and ${top2[1]}.`;

  // Truncate to ~15 words max
  const words = s.split(/\s+/);
  if (words.length > 18) s = words.slice(0, 18).join(" ") + "…";
  return s;
}

/* ===================== MASTER ===================== */
export function generateCareerResults(answers: Answers): CareerResult[] {
  let scores: ScoreEntry[] = careerProfiles.map((career) => ({
    career,
    score: scoreCareer(career, answers),
  }));

  scores = applyInclinationBoost(scores, answers);
  scores = applyPersonalization(scores, answers);
  scores.sort((a, b) => b.score - a.score);

  const top4 = enforceDiversity(scores);
  const withPct = normalizeToPercentages(top4, answers);

  const results: CareerResult[] = withPct.map(({ career, percentage }, i) => ({
    rank: i + 1,
    title: career.title,
    percentage,
    description: career.description,
    matchReason: generateMatchReason(career, answers),
    icon: career.icon,
    category: career.category,
  }));

  // eslint-disable-next-line no-console
  console.log("=== WorthScope CRS Debug ===");
  // eslint-disable-next-line no-console
  console.log("Answers:", answers);
  // eslint-disable-next-line no-console
  console.log(
    "All scores (top 8):",
    scores.slice(0, 8).map((s) => `${s.career.title}: ${s.score.toFixed(2)}`)
  );
  // eslint-disable-next-line no-console
  console.log("Final top 4:", results);

  if (typeof window !== "undefined") {
    localStorage.setItem("worthscope_results", JSON.stringify(results));
  }

  return results;
}

export const FALLBACK_RESULTS: CareerResult[] = [
  { rank: 1, title: "Product Designer", percentage: 94, description: "Create digital products and experiences that solve real problems for people.", matchReason: "Matches your design interest and creative personality.", icon: "layers", category: "creative" },
  { rank: 2, title: "Software Developer", percentage: 81, description: "Build applications and systems that power the digital world.", matchReason: "Matches your Technology interest and logical personality.", icon: "code", category: "tech" },
  { rank: 3, title: "Digital Marketer", percentage: 74, description: "Grow brands and audiences through creative, data-driven online strategies.", matchReason: "Matches your communication interest.", icon: "megaphone", category: "communication" },
  { rank: 4, title: "Data Analyst", percentage: 68, description: "Turn raw data into clear insights that drive smarter decisions.", matchReason: "Matches your analytical strengths.", icon: "chart", category: "tech" },
];

export function loadResults(): CareerResult[] {
  if (typeof window === "undefined") return FALLBACK_RESULTS;
  try {
    const raw = localStorage.getItem("worthscope_results");
    if (!raw) return FALLBACK_RESULTS;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length === 4) return parsed;
  } catch {
    // ignore
  }
  return FALLBACK_RESULTS;
}
