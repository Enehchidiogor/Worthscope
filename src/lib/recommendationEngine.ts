/* WorthScope — Career Recommendation Engine v3 (Nigerian-context CRS)
 *
 * Upgrades over v2:
 *  - 16 careers including AI/ML, Cloud, Data Engineer, FinTech Security,
 *    Health Data Analyst (per Nigerian market expansion)
 *  - WAEC stream baseline (Science / Arts / Commercial) derived from Q1 subjects
 *  - Hierarchical Intent Model: High-Intent keywords trigger a 1.5x category
 *    multiplier and a 0.8x dampener on unrelated categories
 *  - Exclusive Logic: e.g. "designing secure systems" routes to Cybersecurity,
 *    not UI/UX. Negative suppressors for semantic collisions.
 *  - Refinement Loop guard: if no career meets a prerequisite minimum, the top
 *    results still surface but flagged with low confidence.
 *  - Market Heat Index attached to every CareerResult (NGN salary, growth %)
 */

export type Answers = {
  fullName?: string;
  firstName?: string;
  age?: number | null;
  ageRange?: string | null;
  educationLevel: "secondary" | "university" | null;
  classOrLevel?: string | null;

  strongSubjects: string[];          // Q1
  interests?: string[];              // Q2 (sector / domain)
  activities: string[];              // Q3
  personality?: string | null;       // Q4
  careerInclination: string | null;  // Q5
  statedCareer: string | null;       // Q5b
  preferenceConflict: string | null; // Q6 (primary differentiator, weight 25%)
  taskInterests: string[];           // Q7
  outputPreference: string | null;   // Q8
  outputPreferences?: string[];
  careerConfidence?: string | null;  // Q9
  goalOrConcern: string;             // Q10 NLP
  differentiation?: string | null;   // Q9 differentiation (UI/UX vs Graphic vs Build vs Analyse vs Manage)

  // Legacy fields for back-compat
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
  salaryEntryNGN: string;   // e.g. "₦450k–600k/mo"
  salarySeniorNGN: string;  // e.g. "₦1.8M–2.5M/mo"
  growthPct: number;        // 30 -> 30%
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
  lowConfidence?: boolean; // refinement-loop flag (no strong pattern)
};

/* ============ CAREER PROFILES (16) ============ */

type CareerProfile = {
  id: string;
  title: string;
  category: CategoryKey;
  icon: string;
  description: string;
  market: MarketData;
};

const CAREERS: CareerProfile[] = [
  { id: "UIUX", title: "UI/UX Designer", category: "creative", icon: "design",
    description: "Design intuitive digital experiences that people genuinely love using.",
    market: { salaryEntryNGN: "₦250k–450k/mo", salarySeniorNGN: "₦1.4M–2.2M/mo", growthPct: 15, heatLabel: "📈 Growing" } },
  { id: "SOFTDEV", title: "Software Developer", category: "tech", icon: "code",
    description: "Build applications and systems that power the digital world.",
    market: { salaryEntryNGN: "₦300k–550k/mo", salarySeniorNGN: "₦1.5M–2.8M/mo", growthPct: 20, heatLabel: "🔥 High" } },
  { id: "DATA", title: "Data Analyst", category: "tech", icon: "chart",
    description: "Turn raw data into clear insights that drive smarter decisions.",
    market: { salaryEntryNGN: "₦300k–500k/mo", salarySeniorNGN: "₦1.5M–2.5M/mo", growthPct: 22, heatLabel: "🔥 High" } },
  { id: "GRAPHD", title: "Graphic Designer", category: "creative", icon: "palette",
    description: "Communicate ideas visually through compelling, purposeful design.",
    market: { salaryEntryNGN: "₦150k–300k/mo", salarySeniorNGN: "₦800k–1.5M/mo", growthPct: 10, heatLabel: "🟢 Stable" } },
  { id: "PM", title: "Product Manager", category: "business", icon: "briefcase",
    description: "Lead the strategy and vision behind products millions of people use.",
    market: { salaryEntryNGN: "₦400k–700k/mo", salarySeniorNGN: "₦2M–3.5M/mo", growthPct: 18, heatLabel: "🔥 High" } },
  { id: "ENTREP", title: "Entrepreneur", category: "business", icon: "rocket",
    description: "Build your own business and create real value from the ground up.",
    market: { salaryEntryNGN: "Varies", salarySeniorNGN: "Uncapped", growthPct: 25, heatLabel: "🔥 High" } },
  { id: "CYBER", title: "Cybersecurity Analyst", category: "tech", icon: "shield",
    description: "Protect digital systems and data from threats and attacks.",
    market: { salaryEntryNGN: "₦450k–600k/mo", salarySeniorNGN: "₦1.8M–2.5M/mo", growthPct: 30, heatLabel: "🔥 Very High" } },
  { id: "DIGIMKT", title: "Digital Marketer", category: "communication", icon: "megaphone",
    description: "Grow brands and audiences through creative, data-driven online strategies.",
    market: { salaryEntryNGN: "₦200k–400k/mo", salarySeniorNGN: "₦1M–2M/mo", growthPct: 18, heatLabel: "📈 Growing" } },
  { id: "FINTECH", title: "Financial Analyst", category: "business", icon: "money",
    description: "Guide financial decisions with data-driven insight and clear analysis.",
    market: { salaryEntryNGN: "₦350k–600k/mo", salarySeniorNGN: "₦1.6M–2.8M/mo", growthPct: 18, heatLabel: "📈 Growing" } },
  { id: "CONTENT", title: "Content Creator", category: "communication", icon: "video",
    description: "Build audiences and brands through engaging, original digital content.",
    market: { salaryEntryNGN: "Varies", salarySeniorNGN: "₦1M–5M+/mo", growthPct: 25, heatLabel: "🔥 High" } },
  { id: "MECHENG", title: "Mechanical Engineer", category: "science", icon: "wrench",
    description: "Design, analyse, and build the physical systems that move the world.",
    market: { salaryEntryNGN: "₦250k–500k/mo", salarySeniorNGN: "₦1.2M–2M/mo", growthPct: 12, heatLabel: "🟢 Stable" } },

  // ===== NEW (per Nigerian market expansion) =====
  { id: "AIML", title: "AI / ML Engineer", category: "tech", icon: "brain",
    description: "Build intelligent systems that learn from data and make predictions.",
    market: { salaryEntryNGN: "₦500k–800k/mo", salarySeniorNGN: "₦2.5M–4M/mo", growthPct: 35, heatLabel: "🔥 Very High" } },
  { id: "CLOUD", title: "Cloud / DevOps Engineer", category: "tech", icon: "cloud",
    description: "Architect and operate the scalable infrastructure that runs modern software.",
    market: { salaryEntryNGN: "₦400k–700k/mo", salarySeniorNGN: "₦2.2M–3.5M/mo", growthPct: 28, heatLabel: "🔥 Very High" } },
  { id: "DATAENG", title: "Data Engineer", category: "tech", icon: "chart",
    description: "Build the pipelines that move and prepare data for analytics and AI.",
    market: { salaryEntryNGN: "₦450k–750k/mo", salarySeniorNGN: "₦2M–3.2M/mo", growthPct: 25, heatLabel: "🔥 Very High" } },
  { id: "FINSEC", title: "FinTech Security Specialist", category: "tech", icon: "shield",
    description: "Secure payment platforms and financial systems against modern threats.",
    market: { salaryEntryNGN: "₦500k–800k/mo", salarySeniorNGN: "₦2.2M–3.5M/mo", growthPct: 32, heatLabel: "🔥 Very High" } },
  { id: "HEALTHDATA", title: "Health Data Analyst", category: "tech", icon: "health",
    description: "Use data to improve diagnostics, healthcare delivery, and patient outcomes.",
    market: { salaryEntryNGN: "₦350k–550k/mo", salarySeniorNGN: "₦1.5M–2.5M/mo", growthPct: 25, heatLabel: "🔥 High" } },

  // ===== Expansion v4 (broader coverage) =====
  { id: "FRONTEND", title: "Frontend Developer", category: "tech", icon: "code",
    description: "Build the interfaces users actually see, click, and love.",
    market: { salaryEntryNGN: "₦400k–700k/mo", salarySeniorNGN: "₦1.5M–2.5M/mo", growthPct: 22, heatLabel: "🔥 High" } },
  { id: "BACKEND", title: "Backend Developer", category: "tech", icon: "code",
    description: "Engineer the servers, APIs, and databases that power applications.",
    market: { salaryEntryNGN: "₦400k–750k/mo", salarySeniorNGN: "₦1.6M–2.8M/mo", growthPct: 22, heatLabel: "🔥 High" } },
  { id: "FULLSTACK", title: "Full Stack Developer", category: "tech", icon: "code",
    description: "Build complete products from interface to infrastructure.",
    market: { salaryEntryNGN: "₦500k–900k/mo", salarySeniorNGN: "₦1.8M–3M/mo", growthPct: 24, heatLabel: "🔥 Very High" } },
  { id: "DATASCI", title: "Data Scientist", category: "tech", icon: "chart",
    description: "Use statistics and machine learning to extract insight from complex data.",
    market: { salaryEntryNGN: "₦500k–800k/mo", salarySeniorNGN: "₦2M–3M/mo", growthPct: 28, heatLabel: "🔥 Very High" } },
  { id: "PRODDES", title: "Product Designer", category: "creative", icon: "design",
    description: "Shape end-to-end product experiences blending UX, UI, and strategy.",
    market: { salaryEntryNGN: "₦400k–700k/mo", salarySeniorNGN: "₦1.6M–2.5M/mo", growthPct: 20, heatLabel: "🔥 High" } },
  { id: "SALES", title: "Sales / Growth Specialist", category: "business", icon: "rocket",
    description: "Drive revenue and customer growth through strategy and direct outreach.",
    market: { salaryEntryNGN: "₦250k–500k/mo", salarySeniorNGN: "₦1.2M–2.5M/mo", growthPct: 18, heatLabel: "📈 Growing" } },
  { id: "OPS", title: "Operations Manager", category: "business", icon: "briefcase",
    description: "Run the systems and processes that make organisations function smoothly.",
    market: { salaryEntryNGN: "₦300k–600k/mo", salarySeniorNGN: "₦1.5M–2.5M/mo", growthPct: 12, heatLabel: "🟢 Stable" } },
  { id: "ELECENG", title: "Electrical Engineer", category: "science", icon: "wrench",
    description: "Design and maintain the electrical systems that power modern life.",
    market: { salaryEntryNGN: "₦250k–500k/mo", salarySeniorNGN: "₦1.2M–2M/mo", growthPct: 12, heatLabel: "🟢 Stable" } },
  { id: "CIVILENG", title: "Civil Engineer", category: "science", icon: "wrench",
    description: "Design and build the infrastructure that shapes cities and communities.",
    market: { salaryEntryNGN: "₦250k–500k/mo", salarySeniorNGN: "₦1.2M–2M/mo", growthPct: 10, heatLabel: "🟢 Stable" } },
];

/* ============ SIGNAL TABLES ============ */
type SigMap = Record<string, Partial<Record<string, number>>>;

// Q1 — strong subjects (15%) — Nigerian WAEC vocabulary
const Q1_SIGNALS: SigMap = {
  "Mathematics":           { SOFTDEV: 2, DATA: 2, MECHENG: 2, FINTECH: 2, CYBER: 1, AIML: 2, CLOUD: 1, DATAENG: 2, FINSEC: 1 },
  "Further Mathematics":   { AIML: 4, DATA: 3, DATAENG: 3, FINTECH: 2, MECHENG: 2, SOFTDEV: 1 },
  "Further Math":          { AIML: 4, DATA: 3, DATAENG: 3, FINTECH: 2, MECHENG: 2, SOFTDEV: 1 },
  "Sciences":              { MECHENG: 3, CYBER: 1, DATA: 1, AIML: 1, HEALTHDATA: 2 },
  "Physics":               { MECHENG: 3, CLOUD: 2, AIML: 1, CYBER: 1 },
  "Chemistry":             { MECHENG: 1, HEALTHDATA: 2 },
  "Biology":               { HEALTHDATA: 3 },
  "Computer Studies":      { SOFTDEV: 3, CYBER: 3, CLOUD: 3, DATA: 2, AIML: 2, DATAENG: 2 },
  "ICT":                   { SOFTDEV: 3, CYBER: 3, CLOUD: 2, DATA: 2 },
  "Technology":            { SOFTDEV: 3, CYBER: 3, DATA: 2, UIUX: 1, CLOUD: 2, AIML: 2 },
  "Data Processing":       { DATA: 4, DATAENG: 3, AIML: 2, FINTECH: 2 },
  "Technical Drawing":     { MECHENG: 3, UIUX: 2, GRAPHD: 1 },
  "Arts":                  { CONTENT: 3, GRAPHD: 2, DIGIMKT: 2, UIUX: 1 },
  "Literature":            { CONTENT: 3, GRAPHD: 1 },
  "Business":              { ENTREP: 3, FINTECH: 3, PM: 2, DIGIMKT: 1, FINSEC: 1 },
  "Economics":             { FINTECH: 3, ENTREP: 2, PM: 2 },
  "Social Sciences":       { PM: 2, CONTENT: 2, DIGIMKT: 1, UIUX: 2 },
  "Design":                { UIUX: 3, GRAPHD: 3, CONTENT: 1 },
};

// Q3 — activities (20%)
const Q3_SIGNALS: SigMap = {
  "Solving":               { SOFTDEV: 3, DATA: 3, CYBER: 3, MECHENG: 2, AIML: 2, CLOUD: 2, FINSEC: 2 },
  "Creating or designing": { UIUX: 3, GRAPHD: 3, CONTENT: 2 },
  "designing visuals":     { UIUX: 3, GRAPHD: 3, CONTENT: 2 },
  "Building":              { MECHENG: 3, SOFTDEV: 2, CYBER: 2, CLOUD: 2 },
  "Leading":               { PM: 3, ENTREP: 3, DIGIMKT: 1 },
  "organizing":            { PM: 3, ENTREP: 3, DIGIMKT: 1 },
  "Talking":               { CONTENT: 2, PM: 2, ENTREP: 2, DIGIMKT: 1 },
  "Working with others":   { CONTENT: 2, PM: 2, ENTREP: 2, DIGIMKT: 1 },
  "Researching":           { DATA: 3, FINTECH: 3, CYBER: 2, CONTENT: 1, AIML: 2, HEALTHDATA: 2 },
  "Learning":              { DATA: 1, SOFTDEV: 1, MECHENG: 1, CYBER: 1, AIML: 1 },
  "Working independently": { SOFTDEV: 1, CYBER: 1, DATA: 1, MECHENG: 1, AIML: 1 },
};

// Q6 — single primary differentiator (25%)
const Q6_SIGNALS: SigMap = {
  "Build systems":          { SOFTDEV: 5, CYBER: 2, CLOUD: 4, DATAENG: 3 },
  "Build apps":             { SOFTDEV: 5, CYBER: 1 },
  "Design and create":      { UIUX: 5, GRAPHD: 2 },
  "Designing experiences":  { UIUX: 5, GRAPHD: 2 },
  "Design and create visual": { UIUX: 5, GRAPHD: 4 },
  "Start, lead":            { ENTREP: 5, PM: 3 },
  "Starting, growing":      { ENTREP: 5, PM: 3 },
  "Solving physical":       { MECHENG: 5 },
  "mechanical":             { MECHENG: 5 },
  "Analyse data":           { DATA: 4, FINTECH: 4, AIML: 3, DATAENG: 3, HEALTHDATA: 3 },
  "Analyzing data":         { DATA: 4, FINTECH: 4, AIML: 3, DATAENG: 3, HEALTHDATA: 3 },
  "Growing brands":         { DIGIMKT: 4, CONTENT: 4, ENTREP: 1 },
  "Work with people":       { PM: 3, CONTENT: 3, ENTREP: 2 },
  "Working with people":    { PM: 3, CONTENT: 3, ENTREP: 2, SALES: 3, OPS: 2 },
  "Research, discover":     { DATA: 3, MECHENG: 2, CYBER: 1, AIML: 2, HEALTHDATA: 2, DATASCI: 3 },
};

// Q9 — DIFFERENTIATION (single-select, decisive)
const Q9_SIGNALS: SigMap = {
  "looks":                  { GRAPHD: 5, UIUX: 2, PRODDES: 2 },
  "Design how something looks": { GRAPHD: 5, UIUX: 2, PRODDES: 2 },
  "works":                  { UIUX: 5, PRODDES: 4 },
  "Design how something works": { UIUX: 5, PRODDES: 4 },
  "Build the system":       { SOFTDEV: 5, BACKEND: 4, FULLSTACK: 4, CLOUD: 3, DATAENG: 2, CYBER: 2, MECHENG: 2, ELECENG: 2, CIVILENG: 2 },
  "Analyze and improve":    { DATA: 5, DATASCI: 4, AIML: 3, FINTECH: 3, HEALTHDATA: 3, BACKEND: 1 },
  "Manage and organize":    { PM: 5, OPS: 4, ENTREP: 3, SALES: 2 },
};

// Q7 — daily tasks (15%)
const Q7_SIGNALS: SigMap = {
  "Designing apps":          { UIUX: 4 },
  "interfaces":              { UIUX: 4 },
  "Writing code":            { SOFTDEV: 4, CYBER: 2, AIML: 2, CLOUD: 2 },
  "Writing and debugging":   { SOFTDEV: 4, CYBER: 2, AIML: 2 },
  "Creating content":        { CONTENT: 4, DIGIMKT: 3 },
  "Creating logos":          { GRAPHD: 4, DIGIMKT: 1 },
  "logos, posters":          { GRAPHD: 4, DIGIMKT: 1 },
  "Solving logical":         { SOFTDEV: 2, CYBER: 4, MECHENG: 3, DATA: 1, AIML: 2, FINSEC: 2 },
  "technical / logic":       { SOFTDEV: 2, CYBER: 4, MECHENG: 3, DATA: 1 },
  "Managing":                { PM: 4, ENTREP: 2 },
  "organising projects":     { PM: 4, ENTREP: 2 },
  "Researching":             { DATA: 4, FINTECH: 4, CONTENT: 1, AIML: 2, HEALTHDATA: 3 },
  "analysing data":          { DATA: 4, FINTECH: 4, AIML: 2, DATAENG: 2, HEALTHDATA: 3 },
  "Writing, filming":        { CONTENT: 4, DIGIMKT: 3 },
  "Planning marketing":      { DIGIMKT: 4, ENTREP: 2 },
  "campaigns":               { DIGIMKT: 4, ENTREP: 2 },
};

// Q8 — desired output (15%)
const Q8_SIGNALS: SigMap = {
  "app or software":         { SOFTDEV: 4, UIUX: 2, CLOUD: 1 },
  "finished app":            { SOFTDEV: 4, UIUX: 2 },
  "beautiful":               { GRAPHD: 4, UIUX: 2 },
  "visual design":           { GRAPHD: 4, UIUX: 2 },
  "brand identity":          { GRAPHD: 4, UIUX: 2 },
  "growing business":        { ENTREP: 4, PM: 3, DIGIMKT: 1 },
  "business or product":     { ENTREP: 4, PM: 3, DIGIMKT: 1 },
  "physical machine":        { MECHENG: 5 },
  "structure, or system":    { MECHENG: 5 },
  "data report":             { DATA: 4, FINTECH: 4, HEALTHDATA: 3 },
  "report, dashboard":       { DATA: 4, FINTECH: 4, HEALTHDATA: 3 },
  "report or insight":       { DATA: 4, FINTECH: 4, AIML: 2, HEALTHDATA: 3 },
  "secured system":          { CYBER: 5, FINSEC: 4 },
  "stops attacks":           { CYBER: 5, FINSEC: 4 },
  "viral post":              { CONTENT: 4, DIGIMKT: 3 },
  "audience":                { CONTENT: 4, DIGIMKT: 3 },
  "Content or ideas":        { CONTENT: 4, DIGIMKT: 3 },
  "Satisfied users":         { PM: 3, UIUX: 2, CONTENT: 1 },
  "person or community":     { PM: 3, CONTENT: 1, HEALTHDATA: 2 },
};

/* ============ HIERARCHICAL INTENT MODEL ============
 * Each entry defines:
 *   - primary: high-intent keywords (require >=2 to trigger multiplier)
 *   - careers: which career IDs are boosted
 *   - dampens: which OTHER careers should be suppressed (×0.8) when triggered
 *   - suppressors: career IDs to specifically zero-out (semantic collisions)
 */
type IntentRule = {
  name: string;
  primary: string[];
  secondary?: string[];
  careers: string[];
  dampens?: string[];        // categories or career IDs to dampen
  suppressors?: string[];    // hard suppress when this intent dominates
  requireSubject?: string[]; // optional: stronger if these subjects present
};

const INTENT_RULES: IntentRule[] = [
  {
    name: "Cybersecurity",
    primary: ["cyber", "cybersecurity", "security", "secure", "hack", "hacking", "ethical hack", "pentest", "penetration", "encryption", "network security", "protect"],
    secondary: ["firewall", "vulnerability", "threat", "malware", "phish"],
    careers: ["CYBER", "FINSEC"],
    dampens: ["UIUX", "GRAPHD", "CONTENT", "DIGIMKT"],
    suppressors: [], // UIUX is dampened heavily but not zeroed
    requireSubject: ["Computer Studies", "ICT", "Mathematics", "Sciences"],
  },
  {
    name: "AI / Machine Learning",
    primary: ["ai", "artificial intelligence", "machine learning", "ml", "model", "algorithm", "predictive", "neural", "deep learning"],
    secondary: ["statistics", "clean data", "training data", "tensorflow", "pytorch", "llm"],
    careers: ["AIML", "DATAENG", "DATA"],
    dampens: ["DIGIMKT", "GRAPHD", "CONTENT"],
    requireSubject: ["Mathematics", "Further Mathematics", "Further Math"],
  },
  {
    name: "Cloud / DevOps",
    primary: ["cloud", "aws", "azure", "gcp", "devops", "kubernetes", "docker", "infrastructure", "scalability", "server"],
    secondary: ["ci/cd", "pipeline", "terraform", "deployment"],
    careers: ["CLOUD", "SOFTDEV"],
    dampens: ["UIUX", "GRAPHD", "CONTENT"],
    requireSubject: ["Physics", "Computer Studies", "ICT"],
  },
  {
    name: "Data Engineering",
    primary: ["data engineer", "etl", "pipeline", "warehouse", "spark", "snowflake", "big data"],
    careers: ["DATAENG", "DATA", "AIML"],
    dampens: ["UIUX", "GRAPHD"],
  },
  {
    name: "FinTech Security",
    primary: ["fintech", "payments", "fraud", "compliance", "kyc", "aml", "transaction security"],
    careers: ["FINSEC", "CYBER", "FINTECH"],
    dampens: ["UIUX", "GRAPHD", "CONTENT"],
  },
  {
    name: "Health / Medical Data",
    primary: ["health", "medical", "patient", "clinical", "diagnosis", "diagnostics", "hospital", "healthcare"],
    careers: ["HEALTHDATA"],
    dampens: ["GRAPHD", "DIGIMKT"],
    requireSubject: ["Biology", "Sciences", "Chemistry"],
  },
  {
    name: "Software Development",
    primary: ["code", "coding", "developer", "programming", "software engineer", "frontend", "backend", "fullstack", "build app", "build apps"],
    careers: ["SOFTDEV", "CLOUD"],
    dampens: ["GRAPHD", "CONTENT"],
  },
  {
    name: "UI/UX Design",
    primary: ["ux", "ui", "user experience", "user interface", "wireframe", "prototyping", "figma", "interaction design"],
    careers: ["UIUX"],
    dampens: ["SOFTDEV", "CYBER"],
  },
  {
    name: "Graphic Design",
    primary: ["graphic", "logo", "branding", "illustration", "photoshop", "illustrator", "poster"],
    careers: ["GRAPHD", "UIUX"],
    dampens: ["SOFTDEV", "CYBER", "DATA"],
  },
  {
    name: "Marketing",
    primary: ["marketing", "seo", "ads", "social media", "campaign", "growth", "brand"],
    careers: ["DIGIMKT", "CONTENT"],
    dampens: ["MECHENG", "CYBER"],
  },
  {
    name: "Content / Creator",
    primary: ["content", "creator", "youtube", "tiktok", "video", "blogger", "influencer", "podcast"],
    careers: ["CONTENT", "DIGIMKT"],
  },
  {
    name: "Entrepreneur",
    primary: ["business", "startup", "entrepreneur", "founder", "ceo", "hustle", "own business"],
    careers: ["ENTREP", "PM"],
  },
  {
    name: "Product Management",
    primary: ["product manager", "product management", "pm role", "roadmap", "agile"],
    careers: ["PM"],
  },
  {
    name: "Finance",
    primary: ["finance", "financial", "stocks", "investment", "investor", "banking", "accounting", "valuation"],
    careers: ["FINTECH", "ENTREP"],
  },
  {
    name: "Mechanical / Engineering",
    primary: ["mechanical", "engineering", "hardware", "robot", "cad", "machine"],
    careers: ["MECHENG"],
  },
];

/* ============ STREAM (WAEC) BASELINE ============ */
function deriveStream(subjects: string[]): "science" | "commercial" | "arts" | "mixed" {
  const s = subjects.map(norm).join("|");
  const sci = /(mathematics|further math|sciences|physics|chemistry|biology|computer studies|technical drawing|ict)/.test(s);
  const com = /(business|economics|data processing)/.test(s);
  const art = /(arts|literature|social sciences)/.test(s);
  const flags = [sci, com, art].filter(Boolean).length;
  if (flags >= 2) return "mixed";
  if (sci) return "science";
  if (com) return "commercial";
  if (art) return "arts";
  return "mixed";
}

const STREAM_BASELINE: Record<string, Partial<Record<string, number>>> = {
  science:    { SOFTDEV: 4, CYBER: 4, MECHENG: 4, AIML: 4, CLOUD: 3, DATAENG: 3, DATA: 3, HEALTHDATA: 3, FINSEC: 2 },
  commercial: { ENTREP: 4, FINTECH: 4, PM: 3, DIGIMKT: 3, FINSEC: 2, DATA: 2 },
  arts:       { CONTENT: 4, GRAPHD: 3, DIGIMKT: 3, UIUX: 3, PM: 1 },
  mixed:      {},
};

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

/* ============ HIERARCHICAL INTENT SCORER ============ */
function applyIntentRules(
  total: Record<string, number>,
  freeText: string,
  statedCareer: string,
  subjects: string[]
): { triggered: string[] } {
  const text = (freeText + " " + statedCareer).toLowerCase();
  const subjLower = subjects.map(norm).join("|");
  const triggered: string[] = [];

  for (const rule of INTENT_RULES) {
    const primaryHits = rule.primary.filter((kw) => text.includes(kw)).length;
    const secondaryHits = (rule.secondary || []).filter((kw) => text.includes(kw)).length;
    const totalHits = primaryHits + 0.5 * secondaryHits;

    if (primaryHits === 0 && secondaryHits === 0) continue;

    triggered.push(rule.name);

    // Base boost: every primary keyword adds +6, secondary adds +3
    const boost = primaryHits * 6 + secondaryHits * 3;
    for (const cid of rule.careers) {
      total[cid] = (total[cid] || 0) + boost;
    }

    // Multiplier: if 2+ primary hits OR (1 primary + relevant subject), apply 1.5x
    const subjectMatch = (rule.requireSubject || []).some((sub) => subjLower.includes(sub.toLowerCase()));
    const strongIntent = totalHits >= 2 || (primaryHits >= 1 && subjectMatch);

    if (strongIntent) {
      for (const cid of rule.careers) {
        total[cid] = Math.round((total[cid] || 0) * 1.5);
      }
      // Dampener on unrelated careers
      for (const cid of rule.dampens || []) {
        total[cid] = Math.round((total[cid] || 0) * 0.8);
      }
      // Hard suppressors
      for (const cid of rule.suppressors || []) {
        total[cid] = Math.round((total[cid] || 0) * 0.4);
      }
    }
  }
  return { triggered };
}

/* ============ MAIN SCORER ============ */
const W = { q1: 0.15, q3: 0.20, q6: 0.25, q7: 0.15, q8: 0.15, stream: 1.0 };

export function generateCareerResults(a: Answers): CareerResult[] {
  const total: Record<string, number> = {};
  for (const c of CAREERS) total[c.id] = 0;

  // Per-question buckets (kept for tiebreaks + reasons)
  const q1: Record<string, number> = {};
  const q3: Record<string, number> = {};
  const q6: Record<string, number> = {};
  const q7: Record<string, number> = {};
  const q8: Record<string, number> = {};

  applyMulti(q1, a.strongSubjects, Q1_SIGNALS);
  applyMulti(q3, a.activities, Q3_SIGNALS);
  if (a.preferenceConflict) applySignals(q6, a.preferenceConflict, Q6_SIGNALS);
  applyMulti(q7, a.taskInterests, Q7_SIGNALS);
  const q8List = (a.outputPreferences && a.outputPreferences.length)
    ? a.outputPreferences
    : (a.outputPreference ? [a.outputPreference] : []);
  applyMulti(q8, q8List, Q8_SIGNALS);

  // Combine weighted question buckets
  for (const c of CAREERS) {
    total[c.id] +=
      (q1[c.id] || 0) * W.q1 +
      (q3[c.id] || 0) * W.q3 +
      (q6[c.id] || 0) * W.q6 +
      (q7[c.id] || 0) * W.q7 +
      (q8[c.id] || 0) * W.q8;
  }

  // Stream baseline (Nigerian curriculum)
  const stream = deriveStream(a.strongSubjects || []);
  const baseline = STREAM_BASELINE[stream] || {};
  for (const [cid, pts] of Object.entries(baseline)) {
    total[cid] = (total[cid] || 0) + (pts as number) * W.stream;
  }

  // Hierarchical intent (Q5b stated career + Q10 free text)
  const intent = applyIntentRules(
    total,
    a.goalOrConcern || "",
    a.statedCareer || "",
    a.strongSubjects || []
  );

  // Sort with Q6 > Q3 > Q8 tiebreakers
  const tiebreak = (x: string, y: string) =>
    (q6[y] || 0) - (q6[x] || 0) ||
    (q3[y] || 0) - (q3[x] || 0) ||
    (q8[y] || 0) - (q8[x] || 0);

  const ranked = CAREERS.slice().sort((ca, cb) => {
    const diff = (total[cb.id] || 0) - (total[ca.id] || 0);
    if (Math.abs(diff) <= 2) return tiebreak(ca.id, cb.id);
    return diff;
  });

  const top4 = ranked.slice(0, 4);

  // Confidence detection
  const sortedScores = ranked.map((c) => total[c.id] || 0);
  const top = sortedScores[0] || 1;
  const second = sortedScores[1] || 0;
  const focused = top > 0 && (top - second) / top > 0.18;

  const bands = focused
    ? [[78, 92], [50, 68], [28, 45], [12, 26]]
    : [[58, 70], [48, 60], [35, 50], [20, 35]];

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
    matchReason: buildReason(c, a, { q6, q3, q8, q1 }, intent.triggered),
    icon: c.icon,
    category: c.category,
    market: c.market,
  }));

  // Debug
  // eslint-disable-next-line no-console
  console.log("=== WorthScope CRS v3 ===");
  // eslint-disable-next-line no-console
  console.log("Stream:", stream, "Triggered intents:", intent.triggered);
  // eslint-disable-next-line no-console
  console.log("Totals:", Object.fromEntries(
    Object.entries(total).map(([k, v]) => [k, +v.toFixed(2)])
  ));
  // eslint-disable-next-line no-console
  console.log("Final top 4:", results.map(r => `${r.title} (${r.percentage}%)`));

  if (typeof window !== "undefined") {
    localStorage.setItem("worthscope_results", JSON.stringify(results));
  }
  return results;
}

function buildReason(
  c: CareerProfile,
  a: Answers,
  parts: { q6: Record<string, number>; q3: Record<string, number>; q8: Record<string, number>; q1: Record<string, number> },
  intents: string[]
): string {
  const reasons: string[] = [];

  // If a high-intent rule fired and matches this career's category, lead with that
  const matchedIntent = intents.find((name) => {
    const rule = INTENT_RULES.find((r) => r.name === name);
    return rule?.careers.includes(c.id);
  });
  if (matchedIntent) reasons.push(`your stated interest in ${matchedIntent.toLowerCase()}`);

  if (a.preferenceConflict && (parts.q6[c.id] || 0) > 0) {
    reasons.push(`preferring to ${stripEmoji(a.preferenceConflict).toLowerCase()}`);
  }
  if ((parts.q1[c.id] || 0) > 0 && (a.strongSubjects || []).length) {
    reasons.push(`your strength in ${stripEmoji(a.strongSubjects[0]).toLowerCase()}`);
  }
  if ((parts.q8[c.id] || 0) > 0) {
    const out = a.outputPreferences?.[0] || a.outputPreference;
    if (out) reasons.push(`wanting to produce ${stripEmoji(out).toLowerCase()}`);
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
  salaryEntryNGN: "₦250k–450k/mo",
  salarySeniorNGN: "₦1.4M–2.2M/mo",
  growthPct: 15,
  heatLabel: "📈 Growing",
};

export const FALLBACK_RESULTS: CareerResult[] = [
  { rank: 1, title: "UI/UX Designer", percentage: 82, description: "Design intuitive digital experiences that people genuinely love using.", matchReason: "Matches your design interest.", icon: "design", category: "creative", market: FALLBACK_MARKET },
  { rank: 2, title: "Software Developer", percentage: 60, description: "Build applications and systems that power the digital world.", matchReason: "Matches your problem-solving strength.", icon: "code", category: "tech", market: FALLBACK_MARKET },
  { rank: 3, title: "Digital Marketer", percentage: 38, description: "Grow brands and audiences through creative, data-driven online strategies.", matchReason: "Matches your communication interest.", icon: "megaphone", category: "communication", market: FALLBACK_MARKET },
  { rank: 4, title: "Data Analyst", percentage: 22, description: "Turn raw data into clear insights that drive smarter decisions.", matchReason: "Matches your analytical strengths.", icon: "chart", category: "tech", market: FALLBACK_MARKET },
];

export function loadResults(): CareerResult[] {
  if (typeof window === "undefined") return FALLBACK_RESULTS;
  try {
    const raw = localStorage.getItem("worthscope_results");
    if (!raw) return FALLBACK_RESULTS;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length === 4) {
      // Backfill market data for any older saved results
      return parsed.map((p: CareerResult) => ({
        ...p,
        market: p.market || FALLBACK_MARKET,
      }));
    }
  } catch { /* ignore */ }
  return FALLBACK_RESULTS;
}
