/* WorthScope — Career Recommendation Engine
 * Pure, deterministic scoring of the 10-question assessment.
 * Output: top 4 careers with match %, description, reason, icon.
 */

export type Answers = {
  ageRange: string | null;
  educationLevel: "secondary" | "university" | null;
  strongSubjects: string[];
  interests: string[];
  activities: string[];
  personality: string | null;
  careerClarity: string | null;
  schoolClass: string | null;
  skillsStarted: string | null;
  uniLevel: string | null;
  courseAlignment: string | null;
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

type CareerDef = { title: string; icon: string; description: string };

const careerMap: Record<CategoryKey, CareerDef[]> = {
  tech: [
    { title: "Software Developer", icon: "code", description: "Build applications and systems that power the digital world." },
    { title: "UI/UX Designer", icon: "design", description: "Design intuitive digital experiences that people love using." },
    { title: "Data Analyst", icon: "chart", description: "Turn raw data into clear insights that drive smart decisions." },
    { title: "Cybersecurity Analyst", icon: "shield", description: "Protect systems and data from digital threats and attacks." },
    { title: "Mobile App Developer", icon: "mobile", description: "Create apps that live in people's pockets and solve real problems." },
    { title: "Cloud Engineer", icon: "cloud", description: "Build and manage the infrastructure that powers modern software." },
  ],
  creative: [
    { title: "Product Designer", icon: "design", description: "Create digital products and experiences that solve real problems." },
    { title: "Graphic Designer", icon: "palette", description: "Communicate ideas visually through compelling design." },
    { title: "Content Creator", icon: "video", description: "Build audiences and brands through engaging digital content." },
    { title: "Motion Designer", icon: "play", description: "Bring ideas to life through animation and visual storytelling." },
    { title: "Brand Designer", icon: "star", description: "Shape how companies look, feel, and connect with the world." },
    { title: "Video Editor", icon: "film", description: "Tell powerful stories through the art of visual editing." },
  ],
  business: [
    { title: "Product Manager", icon: "briefcase", description: "Lead the strategy and vision behind successful digital products." },
    { title: "Entrepreneur", icon: "rocket", description: "Build your own business and create value from the ground up." },
    { title: "Marketing Strategist", icon: "target", description: "Plan and execute campaigns that grow brands and drive results." },
    { title: "Business Analyst", icon: "chart", description: "Analyse business problems and translate them into clear solutions." },
    { title: "Financial Analyst", icon: "money", description: "Guide financial decisions with data-driven insight and analysis." },
    { title: "Growth Marketer", icon: "trend", description: "Drive rapid, sustainable growth through creative experimentation." },
  ],
  science: [
    { title: "Medical Doctor", icon: "health", description: "Diagnose, treat, and improve the lives of patients every day." },
    { title: "Biotechnologist", icon: "lab", description: "Use biology and technology to develop life-changing innovations." },
    { title: "Environmental Scientist", icon: "leaf", description: "Study and protect the natural world for future generations." },
    { title: "Laboratory Scientist", icon: "flask", description: "Conduct experiments that push the boundaries of human knowledge." },
    { title: "Data Scientist", icon: "chart", description: "Apply statistics and ML to extract meaning from complex data." },
  ],
  people: [
    { title: "Psychologist", icon: "brain", description: "Help people understand their minds and overcome challenges." },
    { title: "Human Resource Manager", icon: "people", description: "Build and support the teams that make organisations thrive." },
    { title: "Teacher / Educator", icon: "book", description: "Shape the next generation through knowledge and mentorship." },
    { title: "Counselor", icon: "heart", description: "Provide guidance and support to people navigating life's challenges." },
    { title: "Social Worker", icon: "hands", description: "Advocate for and support vulnerable individuals and communities." },
  ],
  communication: [
    { title: "Digital Marketer", icon: "megaphone", description: "Grow brands and audiences through creative online strategies." },
    { title: "Copywriter", icon: "pen", description: "Craft words that persuade, inform, and inspire action." },
    { title: "Public Relations Specialist", icon: "chat", description: "Shape public perception and manage brand reputation." },
    { title: "Journalist", icon: "news", description: "Uncover stories and inform the public through compelling reporting." },
    { title: "Tech Content Creator", icon: "video", description: "Explain complex tech topics to audiences who need to understand them." },
  ],
};

// Deterministic pseudo-random based on a seeded hash of answers.
function seededRand(seed: number) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function hashAnswers(a: Answers): number {
  const str = JSON.stringify(a);
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) | 0;
  return Math.abs(h) || 1;
}

export function generateCareerResults(answers: Answers): CareerResult[] {
  const categories: Record<CategoryKey, number> = {
    tech: 0, creative: 0, business: 0, science: 0, people: 0, communication: 0,
  };
  const add = (k: CategoryKey, n: number) => { categories[k] += n; };

  // Q3 — strong subjects
  for (const s of answers.strongSubjects) {
    if (s.startsWith("Mathematics")) { add("tech", 3); add("business", 2); add("science", 1); }
    else if (s.startsWith("Sciences")) { add("science", 3); add("tech", 2); }
    else if (s.startsWith("Business")) { add("business", 3); add("communication", 1); }
    else if (s.startsWith("Arts")) { add("creative", 3); add("communication", 2); }
    else if (s.startsWith("Technology")) { add("tech", 3); add("creative", 1); }
    else if (s.startsWith("Social")) { add("people", 3); add("communication", 2); }
  }

  // Q4 — interests
  for (const i of answers.interests) {
    if (i.startsWith("Technology")) add("tech", 3);
    else if (i.startsWith("Business")) add("business", 3);
    else if (i.startsWith("Creative")) add("creative", 3);
    else if (i.startsWith("Science")) add("science", 3);
    else if (i.startsWith("Helping")) add("people", 3);
    else if (i.startsWith("Communication")) add("communication", 3);
  }

  // Q5 — activities
  for (const a of answers.activities) {
    if (a.startsWith("Solving")) { add("tech", 2); add("science", 2); add("business", 1); }
    else if (a.startsWith("Creating")) { add("creative", 3); }
    else if (a.startsWith("Leading")) { add("business", 3); add("people", 1); }
    else if (a.startsWith("Learning")) { add("science", 2); add("tech", 1); }
    else if (a.startsWith("Working with")) { add("people", 3); add("communication", 2); }
    else if (a.startsWith("Working independently")) { add("tech", 1); add("creative", 1); add("science", 1); }
  }

  // Q6 — personality
  switch (answers.personality) {
    case "Logical and analytical": add("tech", 3); add("science", 3); add("business", 1); break;
    case "Creative and expressive": add("creative", 4); add("communication", 2); break;
    case "Social and outgoing": add("people", 3); add("communication", 3); add("business", 1); break;
    case "Quiet and observant": add("science", 2); add("tech", 2); add("creative", 1); break;
    case "Practical and hands-on": add("tech", 2); add("science", 2); break;
    case "Curious and exploratory": add("science", 3); add("tech", 2); add("creative", 1); break;
  }

  // Q7 — career clarity
  const sortedNow = (Object.keys(categories) as CategoryKey[]).sort((a, b) => categories[b] - categories[a]);
  if (answers.careerClarity === "Very clear") {
    categories[sortedNow[0]] += 2;
  } else if (answers.careerClarity === "Not sure" || answers.careerClarity === "Completely confused") {
    (Object.keys(categories) as CategoryKey[]).forEach((k) => (categories[k] += 1));
  }

  // Education level
  const edu = answers.educationLevel ?? "secondary";
  if (edu === "university") {
    const top2 = (Object.keys(categories) as CategoryKey[])
      .sort((a, b) => categories[b] - categories[a])
      .slice(0, 2);
    top2.forEach((k) => (categories[k] += 2));

    // Course alignment
    const top1 = top2[0];
    const top2k = top2[1];
    switch (answers.courseAlignment) {
      case "Yes, completely": categories[top1] += 3; break;
      case "Somewhat": categories[top1] += 1; break;
      case "Not really": categories[top1] -= 1; break;
      case "Not at all": categories[top1] -= 2; categories[top2k] += 2; break;
    }
  }

  // Q10 keyword detection
  const text = (answers.goalOrConcern || "").toLowerCase();
  if (text) {
    const groups: Array<{ words: string[]; boosts: Array<[CategoryKey, number]> }> = [
      { words: ["money", "pay", "salary", "earn", "income", "rich", "wealth"], boosts: [["business", 3], ["tech", 2]] },
      { words: ["help", "people", "care", "support", "community", "impact"], boosts: [["people", 3], ["communication", 1]] },
      { words: ["design", "create", "art", "build", "make", "creative"], boosts: [["creative", 3]] },
      { words: ["code", "software", "tech", "developer", "data", "app", "program"], boosts: [["tech", 3]] },
      { words: ["research", "discover", "study", "lab", "medicine", "doctor"], boosts: [["science", 3]] },
      { words: ["write", "speak", "media", "journal", "market", "brand"], boosts: [["communication", 3]] },
    ];
    for (const g of groups) {
      if (g.words.some((w) => text.includes(w))) {
        g.boosts.forEach(([k, n]) => (categories[k] += n));
      }
    }
  }

  // Sort categories
  const sorted = (Object.keys(categories) as CategoryKey[]).sort((a, b) => categories[b] - categories[a]);
  const topCat = sorted[0];
  const secondCat = sorted[1];

  // Pick 2 careers from each top category (no duplicates)
  const picks: { def: CareerDef; category: CategoryKey }[] = [];
  for (const def of careerMap[topCat].slice(0, 2)) picks.push({ def, category: topCat });
  for (const def of careerMap[secondCat]) {
    if (picks.length >= 4) break;
    if (!picks.some((p) => p.def.title === def.title)) picks.push({ def, category: secondCat });
  }
  // Backfill if needed
  for (const cat of sorted.slice(2)) {
    if (picks.length >= 4) break;
    for (const def of careerMap[cat]) {
      if (picks.length >= 4) break;
      if (!picks.some((p) => p.def.title === def.title)) picks.push({ def, category: cat });
    }
  }

  // Percentages with deterministic gaps
  const rand = seededRand(hashAnswers(answers));
  const top = 88 + Math.floor(rand() * 10); // 88..97
  const gap1 = 7 + Math.floor(rand() * 6);  // 7..12
  const gap2 = 6 + Math.floor(rand() * 5);  // 6..10
  const gap3 = 6 + Math.floor(rand() * 4);  // 6..9
  const pcts = [top, top - gap1, top - gap1 - gap2, top - gap1 - gap2 - gap3].map((p) => Math.max(55, p));

  // Match reason builder
  const topInterest = answers.interests[0] || "";
  const topSubject = answers.strongSubjects[0] || "";
  const personality = answers.personality || "";
  const personalityShort = personality.toLowerCase().replace(" and ", ", ");

  function reasonFor(category: CategoryKey): string {
    const parts: string[] = [];
    if (topInterest) parts.push(`your ${topInterest.replace(/^\S+\s/, "")} interest`);
    else if (topSubject) parts.push(`your strength in ${topSubject.replace(/^\S+\s/, "")}`);
    if (personality) parts.push(`${personalityShort} personality`);
    if (parts.length === 0) parts.push(`your ${category} strengths`);
    let s = `Matches ${parts.join(" and ")}.`;
    if (s.length > 110) s = s.slice(0, 107) + "...";
    return s;
  }

  const results: CareerResult[] = picks.slice(0, 4).map((p, i) => ({
    rank: i + 1,
    title: p.def.title,
    percentage: pcts[i],
    description: p.def.description,
    matchReason: reasonFor(p.category),
    icon: p.def.icon,
    category: p.category,
  }));

  // eslint-disable-next-line no-console
  console.log("[WorthScope] Category scores:", categories);
  // eslint-disable-next-line no-console
  console.log("[WorthScope] Top careers:", results);

  if (typeof window !== "undefined") {
    localStorage.setItem("worthscope_results", JSON.stringify(results));
  }

  return results;
}

export const FALLBACK_RESULTS: CareerResult[] = [
  { rank: 1, title: "Product Designer", percentage: 94, description: "Create digital products and experiences that solve real problems.", matchReason: "Matches your UI Design, Problem Solving, and Creative interests.", icon: "design", category: "creative" },
  { rank: 2, title: "Software Developer", percentage: 81, description: "Build applications and systems that power the digital world.", matchReason: "Matches your Technology interest and logical personality.", icon: "code", category: "tech" },
  { rank: 3, title: "Digital Marketer", percentage: 74, description: "Grow brands and audiences through creative online strategies.", matchReason: "Matches your Communication and Business interests.", icon: "megaphone", category: "communication" },
  { rank: 4, title: "Data Analyst", percentage: 68, description: "Turn raw data into clear insights that drive smart decisions.", matchReason: "Matches your Mathematics strength and analytical personality.", icon: "chart", category: "tech" },
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
