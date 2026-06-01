/* WorthScope — Career Recommendation Engine v5
 * Aligned to Master Prompt v3.0 (11-career CRS, weighted MCDM + Q8 override + NLP).
 *
 * Mapping from current Assessment.tsx fields to spec questions:
 *   Spec Q1 subjects     → a.strongSubjects        (signal weight 15%)
 *   Spec Q2 experience   → (used elsewhere, not for ranking)
 *   Spec Q3 enjoyment    → a.activities            (15%)
 *   Spec Q4 work type    → a.preferenceConflict    (20%)
 *   Spec Q5 daily tasks  → a.taskInterests         (15%)
 *   Spec Q6 output       → a.outputPreference      (15%)
 *   Spec Q7 personality  → a.personality           (10%)
 *   Spec Q8 differentiator (override) → a.differentiation (15% + override)
 *   Spec Q9 open NLP     → a.goalOrConcern + a.statedCareer (additive boost)
 */

export type Answers = {
  fullName?: string;
  firstName?: string;
  age?: number | null;
  ageRange?: string | null;
  educationLevel: "secondary" | "university" | null;
  classOrLevel?: string | null;

  strongSubjects: string[];
  experienceLevel?: string | null;
  interests?: string[];
  activities: string[];
  personality?: string | null;
  personalityTraits?: string[];
  careerInclination: string | null;
  statedCareer: string | null;
  preferenceConflict: string | null;
  workTypes?: string[];
  taskInterests: string[];
  outputPreference: string | null;
  outputPreferences?: string[];
  careerConfidence?: string | null;
  goalOrConcern: string;
  differentiation?: string | null;

  // Legacy
  experienceItems?: string[];
  courseAlignment?: string | null;
  careerInclinationLegacy?: string | null;
  preferenceConflictLegacy?: string | null;
  schoolClass?: string | null;
  skillsStarted?: string | null;
  uniLevel?: string | null;
};

export type CategoryKey =
  | "tech" | "creative" | "business" | "science" | "people" | "communication";

export type MarketData = {
  salaryEntryNGN: string;
  salarySeniorNGN: string;
  growthPct: number;
  heatLabel: "🔥 Very High" | "🔥 High" | "📈 Growing" | "🟢 Stable";
};

export type CareerResult = {
  rank: number;
  title: string;
  percentage: number;
  description: string;
  matchReason: string;
  icon: string;
  category: CategoryKey;
  market: MarketData;
  lowConfidence?: boolean;
};

/* ============ THE 11 CAREERS (spec-locked) ============ */
type CareerProfile = {
  id: string;
  title: string;
  category: CategoryKey;
  icon: string;
  description: string;
  market: MarketData;
};

const CAREERS: CareerProfile[] = [
  { id: "UIUX",    title: "UI/UX Designer",       category: "creative",      icon: "design",
    description: "Design intuitive digital experiences that people genuinely love using.",
    market: { salaryEntryNGN: "₦150k–400k/mo", salarySeniorNGN: "₦1.4M–2.2M/mo", growthPct: 18, heatLabel: "🔥 High" } },
  { id: "SOFTDEV", title: "Software Developer",   category: "tech",          icon: "code",
    description: "Build the systems and logic behind digital products.",
    market: { salaryEntryNGN: "₦150k–400k/mo", salarySeniorNGN: "₦1.5M–2.8M/mo", growthPct: 22, heatLabel: "🔥 High" } },
  { id: "DATA",    title: "Data Analyst",         category: "tech",          icon: "chart",
    description: "Turn raw numbers into insight that drives smarter decisions.",
    market: { salaryEntryNGN: "₦120k–250k/mo", salarySeniorNGN: "₦1.2M–2M/mo", growthPct: 22, heatLabel: "🔥 High" } },
  { id: "GRAPHD",  title: "Graphic Designer",     category: "creative",      icon: "palette",
    description: "Communicate ideas visually through compelling, purposeful design.",
    market: { salaryEntryNGN: "₦80k–250k/mo", salarySeniorNGN: "₦800k–1.5M/mo", growthPct: 10, heatLabel: "🟢 Stable" } },
  { id: "PM",      title: "Product Manager",      category: "business",      icon: "briefcase",
    description: "Connect business goals to user needs and engineering execution.",
    market: { salaryEntryNGN: "₦200k–500k/mo", salarySeniorNGN: "₦2M–3.5M/mo", growthPct: 18, heatLabel: "🔥 High" } },
  { id: "ENTREP",  title: "Entrepreneur",         category: "business",      icon: "rocket",
    description: "Build and grow businesses from ideas — own your value creation.",
    market: { salaryEntryNGN: "Varies", salarySeniorNGN: "Uncapped", growthPct: 25, heatLabel: "🔥 High" } },
  { id: "CYBER",   title: "Cybersecurity Analyst", category: "tech",         icon: "shield",
    description: "Protect systems, networks, and data from threats and attacks.",
    market: { salaryEntryNGN: "₦250k–450k/mo", salarySeniorNGN: "₦1.8M–2.5M/mo", growthPct: 30, heatLabel: "🔥 Very High" } },
  { id: "DIGIMKT", title: "Digital Marketer",     category: "communication", icon: "megaphone",
    description: "Grow brands and audiences through data-driven strategy and content.",
    market: { salaryEntryNGN: "₦100k–300k/mo", salarySeniorNGN: "₦1M–2M/mo", growthPct: 18, heatLabel: "📈 Growing" } },
  { id: "FINTECH", title: "Financial Analyst",    category: "business",      icon: "money",
    description: "Model and interpret financial data to guide major decisions.",
    market: { salaryEntryNGN: "₦150k–350k/mo", salarySeniorNGN: "₦1.6M–2.8M/mo", growthPct: 18, heatLabel: "📈 Growing" } },
  { id: "CONTENT", title: "Content Creator",      category: "communication", icon: "video",
    description: "Build audiences and tell stories across digital platforms.",
    market: { salaryEntryNGN: "₦80k–500k+/mo", salarySeniorNGN: "₦1M–5M+/mo", growthPct: 25, heatLabel: "🔥 High" } },
  { id: "MECHENG", title: "Mechanical Engineer",  category: "science",       icon: "wrench",
    description: "Design and build the physical systems and machines that move the world.",
    market: { salaryEntryNGN: "₦125k–250k/mo", salarySeniorNGN: "₦1.2M–2M/mo", growthPct: 12, heatLabel: "🟢 Stable" } },
];

/* ============ SIGNAL TABLES (raw points; spec-aligned) ============ */
type SigMap = Record<string, Partial<Record<string, number>>>;

// Q1 — subjects / academic areas (signals)
const Q1_SIGNALS: SigMap = {
  "mathematics":          { SOFTDEV: 2, DATA: 2, MECHENG: 2, FINTECH: 2, CYBER: 1 },
  "further":              { SOFTDEV: 2, DATA: 3, FINTECH: 2, MECHENG: 1 },
  "physics":              { MECHENG: 3, CYBER: 1 },
  "chemistry":            { MECHENG: 1 },
  "biology":              { DATA: 1 },
  "sciences":             { MECHENG: 2, DATA: 2, SOFTDEV: 1, CYBER: 1 },
  "computer":             { SOFTDEV: 3, CYBER: 3, DATA: 2, UIUX: 2 },
  "ict":                  { SOFTDEV: 3, CYBER: 3, DATA: 2, UIUX: 1 },
  "technology":           { SOFTDEV: 2, CYBER: 2, DATA: 1 },
  "data processing":      { DATA: 3, FINTECH: 2 },
  "data / analytics":     { DATA: 4, FINTECH: 2 },
  "analytics":            { DATA: 3, FINTECH: 2 },
  "engineering":          { MECHENG: 4, SOFTDEV: 1 },
  "technical drawing":    { MECHENG: 3, UIUX: 2, GRAPHD: 1 },
  "design":               { UIUX: 3, GRAPHD: 3 },
  "creative":             { GRAPHD: 3, UIUX: 2, CONTENT: 2 },
  "arts":                 { GRAPHD: 3, CONTENT: 2, UIUX: 2, DIGIMKT: 1 },
  "literature":           { CONTENT: 3, DIGIMKT: 1 },
  "economics":            { ENTREP: 2, FINTECH: 3, PM: 2, DIGIMKT: 1 },
  "business":             { ENTREP: 3, FINTECH: 2, PM: 2, DIGIMKT: 1 },
  "management":           { PM: 3, ENTREP: 2 },
  "social science":       { PM: 2, CONTENT: 2, DIGIMKT: 1, ENTREP: 1 },
  "health":               { DATA: 1, CONTENT: 1 },
  "biological":           { DATA: 1 },
  "statistics":           { DATA: 3, FINTECH: 2, SOFTDEV: 1 },
  "data science":         { DATA: 4, FINTECH: 2, SOFTDEV: 1 },
  "psychology":           { CONTENT: 2, DIGIMKT: 2, PM: 1 },
  "mass communication":   { CONTENT: 3, DIGIMKT: 3 },
  "fine arts":            { GRAPHD: 3, UIUX: 2, CONTENT: 2 },
  "architecture":         { GRAPHD: 2, UIUX: 2, MECHENG: 1 },
  "accounting":           { FINTECH: 3, ENTREP: 1 },
  "government":           { PM: 2, CONTENT: 1, DIGIMKT: 1 },
  "journalism":           { CONTENT: 4, DIGIMKT: 2 },
  "communication":        { CONTENT: 3, DIGIMKT: 3, PM: 1 },
  "media":                { CONTENT: 3, DIGIMKT: 2 },

  /* ===== v4.0 Q1 INTEREST BUCKETS ===== */
  "technology & software":      { SOFTDEV: 4, UIUX: 2, CYBER: 2, DATA: 1 },
  "design & creativity":        { UIUX: 4, GRAPHD: 4, CONTENT: 2 },
  "data & ai":                  { DATA: 5, FINTECH: 2, SOFTDEV: 1 },
  "business & entrepreneurship":{ ENTREP: 4, PM: 3, DIGIMKT: 2, FINTECH: 2 },
  "communication & media":      { CONTENT: 4, DIGIMKT: 4, PM: 1 },

  /* ===== v4.0 Q1 SUB-OPTIONS (Interest sub-tags) ===== */
  "creating apps":              { SOFTDEV: 4, UIUX: 3 },
  "coding":                     { SOFTDEV: 4, CYBER: 2 },
  "building systems":           { SOFTDEV: 3, MECHENG: 2, CYBER: 2 },
  "cloud technology":           { SOFTDEV: 3, CYBER: 3 },
  "cybersecurity":              { CYBER: 5 },
  "ui/ux design":               { UIUX: 5, GRAPHD: 2 },
  "graphic design":             { GRAPHD: 5, UIUX: 2 },
  "product design":             { UIUX: 4, PM: 2, GRAPHD: 2 },
  "branding":                   { GRAPHD: 4, DIGIMKT: 2, CONTENT: 1 },
  "motion design":              { GRAPHD: 3, CONTENT: 3, UIUX: 1 },
  "data analysis":              { DATA: 5, FINTECH: 2 },
  "artificial intelligence":    { DATA: 4, SOFTDEV: 2 },
  "machine learning":           { DATA: 4, SOFTDEV: 3 },
  "research":                   { DATA: 3, FINTECH: 2 },
  "entrepreneurship":           { ENTREP: 5, PM: 1, DIGIMKT: 1 },
  "marketing":                  { DIGIMKT: 5, CONTENT: 2, ENTREP: 1 },
  "product management":         { PM: 5, ENTREP: 2 },
  "project management":         { PM: 5 },
  "business analysis":          { FINTECH: 3, PM: 3, DATA: 2 },
  "mechanical engineering":     { MECHENG: 5 },
  "electrical engineering":     { MECHENG: 4 },
  "civil engineering":          { MECHENG: 4 },
  "robotics":                   { MECHENG: 4, SOFTDEV: 2 },
  "content creation":           { CONTENT: 5, DIGIMKT: 2 },
  "social media":               { DIGIMKT: 5, CONTENT: 3 },
  "brand strategy":             { DIGIMKT: 4, GRAPHD: 2, PM: 1 },
  "communications":             { CONTENT: 3, DIGIMKT: 3, PM: 1 },
};

// Q3 — natural enjoyment (15%)
const Q3_SIGNALS: SigMap = {
  "creating or designing":  { UIUX: 3, GRAPHD: 3, CONTENT: 2 },
  "designing or creating":  { UIUX: 3, GRAPHD: 3, CONTENT: 2 },
  "visuals":                { GRAPHD: 3, UIUX: 2, CONTENT: 2 },
  "solving":                { SOFTDEV: 3, CYBER: 3, DATA: 2, MECHENG: 2 },
  "logical problems":       { SOFTDEV: 3, CYBER: 2, MECHENG: 2 },
  "building or fixing":     { SOFTDEV: 3, MECHENG: 3, CYBER: 2 },
  "fixing systems":         { SOFTDEV: 2, MECHENG: 3, CYBER: 2 },
  "analyzing information":  { DATA: 4, FINTECH: 3, CYBER: 1 },
  "analyzing":              { DATA: 3, FINTECH: 2 },
  "leading":                { PM: 3, ENTREP: 3, DIGIMKT: 1 },
  "organizing":             { PM: 3, ENTREP: 3 },
  "communicating":          { CONTENT: 3, DIGIMKT: 3, PM: 2 },
  "persuading":             { DIGIMKT: 3, ENTREP: 2, CONTENT: 2 },
  "learning":               { DATA: 1, SOFTDEV: 1, MECHENG: 1, CYBER: 1 },
  "working with others":    { PM: 2, CONTENT: 2, DIGIMKT: 2, ENTREP: 1 },
  "working independently":  { SOFTDEV: 1, CYBER: 1, DATA: 1, MECHENG: 1, GRAPHD: 1 },
};

// Q4 — work type (20%) — most powerful behavioural signal
const Q4_SIGNALS: SigMap = {
  "create digital products":   { SOFTDEV: 4, UIUX: 3 },
  "creating digital products": { SOFTDEV: 4, UIUX: 3, PM: 1 },
  "apps, websites":            { SOFTDEV: 4, UIUX: 3 },
  "apps or websites":          { SOFTDEV: 4, UIUX: 3 },
  "design experiences":        { UIUX: 4, GRAPHD: 3 },
  "designing user experiences":{ UIUX: 5, GRAPHD: 2 },
  "user experiences":          { UIUX: 5, GRAPHD: 2 },
  "visuals that people interact": { UIUX: 4, GRAPHD: 3 },
  "work with data":            { DATA: 4, FINTECH: 3 },
  "working with data":         { DATA: 5, FINTECH: 3 },
  "data, patterns":            { DATA: 4, FINTECH: 3 },
  "data and insights":         { DATA: 5, FINTECH: 3 },
  "build or maintain technical": { SOFTDEV: 3, CYBER: 4, MECHENG: 3 },
  "technical systems":         { SOFTDEV: 3, CYBER: 4, MECHENG: 3 },
  "building systems":          { SOFTDEV: 4, CYBER: 3, MECHENG: 2 },
  "infrastructure":            { SOFTDEV: 3, CYBER: 3 },
  "protect systems":           { CYBER: 5 },
  "protecting systems":        { CYBER: 6 },
  "networks, and user data":   { CYBER: 5 },
  "run, grow, or launch":      { ENTREP: 5, PM: 2 },
  "running or growing":        { ENTREP: 5, PM: 2, DIGIMKT: 2 },
  "launch a business":         { ENTREP: 5, PM: 2 },
  "growing a business":        { ENTREP: 5, PM: 2, DIGIMKT: 2 },
  "work with people through":  { CONTENT: 4, DIGIMKT: 4 },
  "content, media, or marketing": { CONTENT: 4, DIGIMKT: 4 },
  "working with people":       { PM: 3, CONTENT: 3, DIGIMKT: 3, ENTREP: 2 },
  "people and communication":  { PM: 3, CONTENT: 3, DIGIMKT: 3 },
  "not sure yet":              {},
  "i'm not sure":              {},
  // legacy keys
  "build systems":             { SOFTDEV: 4, CYBER: 3, MECHENG: 2 },
  "technical problems":        { SOFTDEV: 4, CYBER: 3, MECHENG: 3, DATA: 2 },
  "design and create":         { UIUX: 4, GRAPHD: 3, CONTENT: 1 },
  "visual experiences":        { UIUX: 4, GRAPHD: 3 },
  "analyse data":              { DATA: 4, FINTECH: 3 },
  "analyze data":              { DATA: 4, FINTECH: 3 },
  "communicate":               { CONTENT: 3, DIGIMKT: 3, PM: 2 },

  /* ===== v4.0 Q4 PROBLEM TYPES ===== */
  "digital problems":          { SOFTDEV: 4, UIUX: 3 },
  "human problems":            { UIUX: 4, CONTENT: 2, PM: 2 },
  "business problems":         { ENTREP: 4, PM: 3, DIGIMKT: 2, FINTECH: 2 },
  "security problems":         { CYBER: 6 },
  "physical problems":         { MECHENG: 5 },
  "scientific problems":       { DATA: 4, MECHENG: 2 },
};

// Q5 — daily tasks (15%)
const Q5_SIGNALS: SigMap = {
  "designing interfaces":      { UIUX: 5, GRAPHD: 2 },
  "interfaces, screens":       { UIUX: 4, GRAPHD: 3 },
  "interfaces or visuals":     { UIUX: 4, GRAPHD: 3 },
  "screens, or visuals":       { UIUX: 4, GRAPHD: 3 },
  "writing code":              { SOFTDEV: 5, CYBER: 2 },
  "code or scripts":           { SOFTDEV: 5, CYBER: 2 },
  "setting up and managing systems": { CYBER: 4, SOFTDEV: 2, MECHENG: 2 },
  "systems or servers":        { CYBER: 4, SOFTDEV: 2, MECHENG: 2 },
  "setting up systems":        { CYBER: 4, SOFTDEV: 3 },
  "cloud tools":               { CYBER: 3, SOFTDEV: 3 },
  "finding patterns":          { DATA: 5, FINTECH: 3 },
  "patterns or insights":      { DATA: 4, FINTECH: 3 },
  "patterns in data":          { DATA: 5, FINTECH: 3 },
  "managing projects":         { PM: 5, ENTREP: 2 },
  "roadmaps, or products":     { PM: 4, ENTREP: 2 },
  "managing":                  { PM: 3, ENTREP: 2 },
  "selling, pitching":         { DIGIMKT: 4, CONTENT: 3, ENTREP: 3 },
  "selling":                   { ENTREP: 3, DIGIMKT: 4 },
  "marketing ideas":           { DIGIMKT: 5, CONTENT: 2, ENTREP: 1 },
  "not sure yet":              {},
  "i'm not sure":              {},
  // legacy
  "designing apps":            { UIUX: 4, GRAPHD: 1 },
  "interfaces":                { UIUX: 4 },
  "creating content":          { CONTENT: 4, DIGIMKT: 3 },
  "visuals":                   { GRAPHD: 3, UIUX: 2, CONTENT: 2 },
  "logical":                   { SOFTDEV: 2, CYBER: 4, MECHENG: 2 },
  "researching":               { DATA: 4, FINTECH: 3, CYBER: 1 },
  "analysing":                 { DATA: 4, FINTECH: 3 },
};

// Q6 — desired output (15%)
const Q6_SIGNALS: SigMap = {
  "beautiful":                 { GRAPHD: 5, UIUX: 2 },
  "beautiful, polished":       { GRAPHD: 5, UIUX: 2 },
  "visual design or brand":    { GRAPHD: 5, UIUX: 2 },
  "working app":               { SOFTDEV: 5, UIUX: 2 },
  "working application":       { SOFTDEV: 5, UIUX: 2 },
  "software product":          { SOFTDEV: 5, UIUX: 2 },
  "secure, protected":         { CYBER: 5 },
  "secure system":             { CYBER: 5 },
  "protected system":          { CYBER: 5 },
  "system or network":         { CYBER: 4 },
  "data insight":              { DATA: 5, FINTECH: 3 },
  "dashboard":                 { DATA: 4, FINTECH: 3 },
  "financial model":           { FINTECH: 5, DATA: 2 },
  "report":                    { DATA: 3, FINTECH: 3 },
  "successful business":       { ENTREP: 5, PM: 2, DIGIMKT: 1 },
  "business, product, or brand": { ENTREP: 4, PM: 3, DIGIMKT: 2 },
  "business or product":       { ENTREP: 4, PM: 3, DIGIMKT: 2 },
  "physical machine":          { MECHENG: 5 },
  "structure, or engineered":  { MECHENG: 5 },
  "engineered system":         { MECHENG: 5 },
  "audience, community":       { CONTENT: 5, DIGIMKT: 3 },
  "media presence":            { CONTENT: 5, DIGIMKT: 3 },
  "scalable":                  { SOFTDEV: 3, CYBER: 3 },
  "cloud/infrastructure":      { SOFTDEV: 3, CYBER: 3 },
  // legacy
  "finished app":              { SOFTDEV: 5, UIUX: 2 },
  "software people use":       { SOFTDEV: 5, UIUX: 2 },
  "visual experience":         { GRAPHD: 4, UIUX: 3 },
  "built from scratch":        { ENTREP: 4, PM: 1 },
  "report or insight":         { DATA: 4, FINTECH: 4 },
  "drove a real decision":     { DATA: 3, FINTECH: 3, PM: 1 },
  "person or community":       { PM: 2, CONTENT: 2, DIGIMKT: 1 },
  "helped":                    { PM: 2, CONTENT: 1 },
  "content or ideas":          { CONTENT: 5, DIGIMKT: 3 },
  "secure":                    { CYBER: 4 },
  "structure":                 { MECHENG: 3 },

  /* ===== v4.0 Q5 PRIDE/MOTIVATION ===== */
  "creating something people love using": { UIUX: 5, GRAPHD: 3 },
  "building a powerful solution":         { SOFTDEV: 5, CYBER: 1 },
  "keeping people safe":                  { CYBER: 6 },
  "discovering valuable insights":        { DATA: 5, FINTECH: 2 },
  "growing a successful business":        { ENTREP: 5, DIGIMKT: 2, PM: 1 },
  "leading a team to achieve a goal":     { PM: 5, ENTREP: 2 },
};

// Q7 — personality (10%) — soft signals, tiebreakers only
const Q7_SIGNALS: SigMap = {
  "creative":               { UIUX: 2, GRAPHD: 2, CONTENT: 2, DIGIMKT: 1 },
  "expressive":             { CONTENT: 2, GRAPHD: 1, DIGIMKT: 1 },
  "logical":                { SOFTDEV: 2, DATA: 2, CYBER: 2, MECHENG: 2 },
  "analytical":             { DATA: 2, FINTECH: 2, CYBER: 1, PM: 1, SOFTDEV: 1 },
  "social":                 { CONTENT: 2, DIGIMKT: 2, PM: 2, ENTREP: 1 },
  "strategic":              { PM: 2, ENTREP: 2, FINTECH: 1, DIGIMKT: 1 },
  "detail":                 { GRAPHD: 2, UIUX: 1, DATA: 2, CYBER: 2 },
  "outgoing":               { CONTENT: 2, DIGIMKT: 2, PM: 1, ENTREP: 1 },
  "quiet":                  { SOFTDEV: 1, GRAPHD: 1, DATA: 1 },
  "observant":              { UIUX: 1, DATA: 1, GRAPHD: 1 },
  "practical":              { MECHENG: 2, SOFTDEV: 1, CYBER: 1 },
  "hands-on":               { MECHENG: 2, SOFTDEV: 1 },
  "curious":                { DATA: 1, SOFTDEV: 1, MECHENG: 1, CYBER: 1 },
  "exploratory":            { DATA: 1, ENTREP: 1, CONTENT: 1 },
};

// Q8 — DIFFERENTIATOR (15% + override) — explicit conscious intent
const Q8_SIGNALS: SigMap = {
  "looks":                  { GRAPHD: 6, UIUX: 2 },
  "design how something looks": { GRAPHD: 6, UIUX: 2 },
  "works":                  { UIUX: 6, GRAPHD: 2, SOFTDEV: 1 },
  "design how something works": { UIUX: 6, GRAPHD: 2, SOFTDEV: 1 },
  "build the system":       { SOFTDEV: 6, CYBER: 2, MECHENG: 1 },
  "code, infrastructure":   { SOFTDEV: 6, CYBER: 2 },
  "analyze and improve":    { DATA: 6, FINTECH: 4, PM: 2 },
  "performance":            { DATA: 4, FINTECH: 3 },
  "manage and organize":    { PM: 6, ENTREP: 3 },
  "grow and reach":         { DIGIMKT: 6, CONTENT: 4, ENTREP: 2 },
  "audience":               { DIGIMKT: 5, CONTENT: 5 },
  "protect":                { CYBER: 6, SOFTDEV: 1 },
  "secure systems":         { CYBER: 6 },
  "design and build physical": { MECHENG: 6 },
  "hardware":               { MECHENG: 6 },
};

// Map each Q8 option (canonical) → its dominant career (used by override rule).
const Q8_OVERRIDE_WINNER: Array<{ kw: string; winner: string }> = [
  { kw: "looks", winner: "GRAPHD" },
  { kw: "works", winner: "UIUX" },
  { kw: "build the system", winner: "SOFTDEV" },
  { kw: "analyze and improve", winner: "DATA" },
  { kw: "manage and organize", winner: "PM" },
  { kw: "grow and reach", winner: "DIGIMKT" },
  { kw: "audience", winner: "DIGIMKT" },
  { kw: "protect", winner: "CYBER" },
  { kw: "secure", winner: "CYBER" },
  { kw: "physical", winner: "MECHENG" },
  { kw: "hardware", winner: "MECHENG" },
];

/* ============ Q9 OPEN-ENDED (NLP) BOOSTS ============ */
type IntentRule = { keywords: string[]; boosts: Partial<Record<string, number>> };
const Q9_RULES: IntentRule[] = [
  { keywords: ["design", "beautiful", "aesthetic", "color", "logo", "brand", "figma", "draw", "visual"],
    boosts: { GRAPHD: 4, UIUX: 3 } },
  { keywords: ["user experience", "how things work", "intuitive", "app flow", "wireframe", "product design", "interface", "ux"],
    boosts: { UIUX: 5, PM: 2 } },
  { keywords: ["code", "coding", "programming", "build app", "developer", "software", "python", "javascript", "engineer", "system"],
    boosts: { SOFTDEV: 5 } },
  { keywords: ["data", "numbers", "analy", "research", "excel", "statistics", "insight", "patterns", "report", "dashboard"],
    boosts: { DATA: 4, FINTECH: 3 } },
  { keywords: ["security", "hacking", "protect", "cyber", "network", "ethical hack", "bug bounty"],
    boosts: { CYBER: 5 } },
  { keywords: ["business", "startup", "entrepreneur", "money", "income", "rich", "invest", "my own company", "founder", "ceo", "hustle"],
    boosts: { ENTREP: 4, FINTECH: 2 } },
  { keywords: ["marketing", "audience", "brand", "social media", "ads", "campaign", "influence", "growth"],
    boosts: { DIGIMKT: 4, CONTENT: 3 } },
  { keywords: ["content", "creator", "youtube", "tiktok", "video", "podcast", "storytelling", "followers", "write"],
    boosts: { CONTENT: 5, DIGIMKT: 2 } },
  { keywords: ["stocks", "investment", "finance", "financial model", "bank", "accounting", "valuation"],
    boosts: { FINTECH: 5 } },
  { keywords: ["mechanical", "hardware", "machine", "cad", "build things", "physics", "manufacture"],
    boosts: { MECHENG: 5 } },
  { keywords: ["help people", "community", "impact", "teach", "mentor", "social good", "nonprofit"],
    boosts: { CONTENT: 2, PM: 2, DIGIMKT: 1 } },
  { keywords: ["remote", "freelance", "work from anywhere", "freedom"],
    boosts: { DIGIMKT: 2, CONTENT: 2, SOFTDEV: 1 } },
];
const CONFUSION_MARKERS = ["i don't know", "idk", "not sure", "anything", "something in tech", "no idea"];

function applyQ9NLP(scores: Record<string, number>, text: string): { triggered: string[]; confused: boolean } {
  const t = (text || "").toLowerCase().trim();
  if (!t) return { triggered: [], confused: false };
  const confused = CONFUSION_MARKERS.some((c) => t.includes(c)) && t.length < 60;
  if (confused) {
    for (const c of CAREERS) scores[c.id] = (scores[c.id] || 0) + 1;
    return { triggered: [], confused: true };
  }
  const triggered: string[] = [];
  // Emotional intensity boost (+3 to top matched group)
  const emotional = /\b(love|always|passion|alive|dream|truly|excit)/i.test(text);
  for (const rule of Q9_RULES) {
    if (rule.keywords.some((kw) => t.includes(kw))) {
      triggered.push(rule.keywords[0]);
      for (const [cid, pts] of Object.entries(rule.boosts)) {
        scores[cid] = (scores[cid] || 0) + (pts as number) + (emotional ? 3 : 0);
      }
    }
  }
  return { triggered, confused: false };
}

/* ============ HELPERS ============ */
const stripEmoji = (s: string) =>
  s.replace(/^(\p{Emoji_Presentation}|\p{Extended_Pictographic})\s*/u, "").trim();

function norm(s: string): string { return stripEmoji(s).toLowerCase(); }

function applySignals(scores: Record<string, number>, label: string, table: SigMap, weight = 1) {
  const t = norm(label);
  for (const [key, mp] of Object.entries(table)) {
    if (t.includes(key.toLowerCase())) {
      for (const [cid, pts] of Object.entries(mp)) {
        scores[cid] = (scores[cid] || 0) + (pts as number) * weight;
      }
    }
  }
}
function applyMulti(scores: Record<string, number>, items: string[] | undefined, table: SigMap, weight = 1) {
  for (const it of items || []) applySignals(scores, it, table, weight);
}

/* ============ CONFLICT RESOLVERS ============ */
function resolveConflicts(
  scores: Record<string, number>,
  a: Answers,
  q9Text: string
) {
  const out = (a.outputPreference || "").toLowerCase();
  const q8 = (a.differentiation || "").toLowerCase();
  const q4 = (a.preferenceConflict || "").toLowerCase();
  const q9 = (q9Text || "").toLowerCase();

  // UIUX vs GRAPHD
  if (out.includes("beautiful")) scores.GRAPHD = (scores.GRAPHD || 0) + 3;
  if (out.includes("finished app") || out.includes("software")) scores.UIUX = (scores.UIUX || 0) + 2;
  if (q8.includes("looks")) scores.GRAPHD = (scores.GRAPHD || 0) + 3;
  if (q8.includes("works")) scores.UIUX = (scores.UIUX || 0) + 3;
  if (/(user experience|flow|how it works)/.test(q9)) scores.UIUX = (scores.UIUX || 0) + 3;
  if (/(logo|poster|brand|print)/.test(q9)) scores.GRAPHD = (scores.GRAPHD || 0) + 3;

  // SOFTDEV vs CYBER
  if (q4.includes("build systems")) scores.SOFTDEV = (scores.SOFTDEV || 0) + 1;
  if (out.includes("secure") || out.includes("secured system")) scores.CYBER = (scores.CYBER || 0) + 3;
  if (q8.includes("protect") || q8.includes("secure")) scores.CYBER = (scores.CYBER || 0) + 3;

  // DATA vs FINTECH
  const hasBusinessSubj = (a.strongSubjects || []).some((s) =>
    /business|economics/i.test(s)
  );
  if (a.activities?.some((x) => /research|analy/i.test(x)) && hasBusinessSubj) {
    scores.FINTECH = (scores.FINTECH || 0) + 2;
  }
  if (/(stock|investment|finance|bank)/.test(q9)) scores.FINTECH = (scores.FINTECH || 0) + 3;
  if (/(data|dashboard|analytics)/.test(q9) && !/(finance|bank|stock)/.test(q9))
    scores.DATA = (scores.DATA || 0) + 2;

  // PM vs ENTREP
  if (q4.includes("start") || /(my own company|startup|founder|hustle)/.test(q9))
    scores.ENTREP = (scores.ENTREP || 0) + 3;
  if (a.taskInterests?.some((x) => /managing|organising/i.test(x)))
    scores.PM = (scores.PM || 0) + 2;
  if (q8.includes("manage and organize")) scores.PM = (scores.PM || 0) + 2;
}

/* ============ Q8 OVERRIDE ============ */
function applyQ8Override(
  scores: Record<string, number>,
  a: Answers
): { swapped: boolean; winner?: string } {
  const q8 = (a.differentiation || "").toLowerCase();
  if (!q8) return { swapped: false };
  const match = Q8_OVERRIDE_WINNER.find((m) => q8.includes(m.kw));
  if (!match) return { swapped: false };

  const ranked = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  const top = ranked[0];
  if (!top) return { swapped: false };
  const winner = match.winner;
  if (top[0] === winner) return { swapped: false };
  const winnerScore = scores[winner] || 0;
  const gap = top[1] - winnerScore;
  if (gap <= 8) {
    // Move winner to #1 by giving a small lift
    scores[winner] = top[1] + 1;
    return { swapped: true, winner };
  }
  return { swapped: false, winner };
}

/* ============ MAIN ============ */
const W = { q1: 0.15, q3: 0.15, q4: 0.20, q5: 0.15, q6: 0.15, q7: 0.10, q8: 0.15 };

export function generateCareerResults(a: Answers): CareerResult[] {
  const total: Record<string, number> = {};
  for (const c of CAREERS) total[c.id] = 0;

  const q1: Record<string, number> = {};
  const q3: Record<string, number> = {};
  const q4b: Record<string, number> = {};
  const q5: Record<string, number> = {};
  const q6: Record<string, number> = {};
  const q7: Record<string, number> = {};
  const q8: Record<string, number> = {};

  applyMulti(q1, a.strongSubjects, Q1_SIGNALS);
  applyMulti(q3, a.activities, Q3_SIGNALS);
  // Q4 — multi-select (workTypes); fall back to legacy single preferenceConflict
  if (a.workTypes && a.workTypes.length) {
    applyMulti(q4b, a.workTypes, Q4_SIGNALS);
  } else if (a.preferenceConflict) {
    applySignals(q4b, a.preferenceConflict, Q4_SIGNALS);
  }
  applyMulti(q5, a.taskInterests, Q5_SIGNALS);
  // Q6 — multi-select (outputPreferences); fall back to single outputPreference
  if (a.outputPreferences && a.outputPreferences.length) {
    applyMulti(q6, a.outputPreferences, Q6_SIGNALS);
  } else if (a.outputPreference) {
    applySignals(q6, a.outputPreference, Q6_SIGNALS);
  }
  // Q7 — multi-select traits; fall back to single personality
  if (a.personalityTraits && a.personalityTraits.length) {
    applyMulti(q7, a.personalityTraits, Q7_SIGNALS);
  } else if (a.personality) {
    applySignals(q7, a.personality, Q7_SIGNALS);
  }
  if (a.differentiation) applySignals(q8, a.differentiation, Q8_SIGNALS);

  for (const c of CAREERS) {
    total[c.id] +=
      (q1[c.id] || 0) * W.q1 +
      (q3[c.id] || 0) * W.q3 +
      (q4b[c.id] || 0) * W.q4 +
      (q5[c.id] || 0) * W.q5 +
      (q6[c.id] || 0) * W.q6 +
      (q7[c.id] || 0) * W.q7 +
      (q8[c.id] || 0) * W.q8;
  }

  // Q9 NLP additive boost (free text + stated career)
  const nlpText = `${a.goalOrConcern || ""} ${a.statedCareer || ""}`;
  const nlp = applyQ9NLP(total, nlpText);

  // Conflict resolution
  resolveConflicts(total, a, nlpText);

  // Q8 override (≤8 pt gap → swap)
  const overrideRes = applyQ8Override(total, a);

  // Sort
  const ranked = CAREERS.slice().sort((ca, cb) => (total[cb.id] || 0) - (total[ca.id] || 0));
  const top4 = ranked.slice(0, 4);

  // Confidence: HIGH FOCUS vs MIXED
  const sortedScores = ranked.map((c) => total[c.id] || 0);
  const top = sortedScores[0] || 1;
  const second = sortedScores[1] || 0;
  const focused = top > 0 && (top - second) / top > 0.2;
  const lowConfidence = nlp.confused || top < 6;

  // Spec confidence bands
  const bands: number[][] = focused
    ? [[78, 89], [52, 68], [30, 48], [15, 30]]
    : [[60, 72], [52, 65], [40, 55], [28, 42]];

  const seed = Math.abs(hashStr(JSON.stringify(a))) || 1;
  const rand = seededRand(seed);
  const percents: number[] = [];
  let prev = 100;
  top4.forEach((_, i) => {
    const [lo, hi] = bands[i];
    let pct = Math.round(lo + rand() * (hi - lo));
    if (pct >= prev) pct = prev - 2;
    percents.push(pct);
    prev = pct;
  });

  const results: CareerResult[] = top4.map((c, i) => ({
    rank: i + 1,
    title: c.title,
    percentage: percents[i],
    description: c.description,
    matchReason: buildReason(c, a, { q4b, q6, q8, q1 }, nlp.triggered, overrideRes),
    icon: c.icon,
    category: c.category,
    market: c.market,
    lowConfidence,
  }));

  // eslint-disable-next-line no-console
  console.log("=== WorthScope CRS v5 (spec-aligned) ===", {
    totals: Object.fromEntries(Object.entries(total).map(([k, v]) => [k, +v.toFixed(2)])),
    nlp: nlp.triggered, confused: nlp.confused, override: overrideRes,
    top4: results.map((r) => `${r.title} ${r.percentage}%`),
  });

  if (typeof window !== "undefined") {
    localStorage.setItem("worthscope_results", JSON.stringify(results));
  }
  return results;
}

function buildReason(
  c: CareerProfile,
  a: Answers,
  parts: { q4b: Record<string, number>; q6: Record<string, number>; q8: Record<string, number>; q1: Record<string, number> },
  nlpTriggered: string[],
  override: { swapped: boolean; winner?: string }
): string {
  const reasons: string[] = [];

  if (override.swapped && override.winner === c.id && a.differentiation) {
    reasons.push(`you said you'd rather ${stripEmoji(a.differentiation).toLowerCase()}`);
  }
  if (a.differentiation && (parts.q8[c.id] || 0) > 0 && !reasons.length) {
    reasons.push(`your choice to ${stripEmoji(a.differentiation).toLowerCase()}`);
  }
  if (a.preferenceConflict && (parts.q4b[c.id] || 0) > 0) {
    reasons.push(`wanting to ${stripEmoji(a.preferenceConflict).toLowerCase()}`);
  }
  if (a.outputPreference && (parts.q6[c.id] || 0) > 0) {
    reasons.push(`producing ${stripEmoji(a.outputPreference).toLowerCase()}`);
  }
  if ((parts.q1[c.id] || 0) > 0 && (a.strongSubjects || []).length) {
    reasons.push(`your strength in ${stripEmoji(a.strongSubjects[0]).toLowerCase()}`);
  }
  if (nlpTriggered.length && reasons.length < 2) {
    reasons.push(`your stated interest in ${nlpTriggered[0]}`);
  }

  const top2 = reasons.slice(0, 2);
  if (top2.length === 0) return "Aligns with your overall profile.";
  if (top2.length === 1) return `Matches ${top2[0]}.`;
  return `Matches ${top2[0]} and ${top2[1]}.`;
}

/* ============ utils ============ */
function hashStr(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) | 0;
  return h;
}
function seededRand(seed: number) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

/* ============ persistence ============ */
const FALLBACK_MARKET: MarketData = {
  salaryEntryNGN: "₦150k–400k/mo",
  salarySeniorNGN: "₦1.4M–2.2M/mo",
  growthPct: 18,
  heatLabel: "📈 Growing",
};

export const FALLBACK_RESULTS: CareerResult[] = [
  { rank: 1, title: "UI/UX Designer", percentage: 82, description: "Design intuitive digital experiences that people genuinely love using.", matchReason: "Matches your design interest.", icon: "design", category: "creative", market: FALLBACK_MARKET },
  { rank: 2, title: "Software Developer", percentage: 60, description: "Build the systems and logic behind digital products.", matchReason: "Matches your problem-solving strength.", icon: "code", category: "tech", market: FALLBACK_MARKET },
  { rank: 3, title: "Digital Marketer", percentage: 38, description: "Grow brands and audiences through data-driven strategy and content.", matchReason: "Matches your communication interest.", icon: "megaphone", category: "communication", market: FALLBACK_MARKET },
  { rank: 4, title: "Data Analyst", percentage: 22, description: "Turn raw numbers into insight that drives smarter decisions.", matchReason: "Matches your analytical strengths.", icon: "chart", category: "tech", market: FALLBACK_MARKET },
];

export function loadResults(): CareerResult[] {
  if (typeof window === "undefined") return FALLBACK_RESULTS;
  try {
    const raw = localStorage.getItem("worthscope_results");
    if (!raw) return FALLBACK_RESULTS;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length === 4) {
      return parsed.map((p: CareerResult) => ({
        ...p,
        market: p.market || FALLBACK_MARKET,
      }));
    }
  } catch { /* ignore */ }
  return FALLBACK_RESULTS;
}
