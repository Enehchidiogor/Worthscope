/* WorthScope — Career Module System.
   One complete data module per supported career path. Selected on
   "Choose This Path" and saved to localStorage as the single source of
   truth for roadmap, missions, and skills across the app. */

export type ModuleMissionStatus = "active" | "locked" | "completed";

export type ModuleMission = {
  id: string;
  title: string;
  description: string;
  status: ModuleMissionStatus;
  videoTitle?: string;
  task?: string;
  skillsGained: Record<string, number>;
};

export type ModulePhase = {
  id: string;
  title: string;
  subtitle: string;
  status: "active" | "locked" | "completed";
  missions: ModuleMission[];
};

export type ModuleSkill = { name: string; progress: number; level: string };

export type CareerModule = {
  id: string;
  title: string;
  roadmapTitle: string;
  category: "creative" | "tech" | "business" | "science" | "people" | "communication";
  phases: ModulePhase[];
  skills: ModuleSkill[];
  kokoMessage: string;
  careerDescription: string;
};

const m = (
  id: string,
  title: string,
  description: string,
  skillsGained: Record<string, number>,
  status: ModuleMissionStatus = "locked",
  extras: { videoTitle?: string; task?: string } = {}
): ModuleMission => ({ id, title, description, status, skillsGained, ...extras });

export const careerModules: Record<string, CareerModule> = {
  ux_designer: {
    id: "ux_designer",
    title: "UI/UX Designer",
    roadmapTitle: "UI/UX Designer Roadmap",
    category: "creative",
    careerDescription: "Create digital products and experiences that people genuinely love using.",
    kokoMessage:
      "You're on your way to becoming a UI/UX Designer. Start with understanding the basics — your first mission is waiting.",
    phases: [
      {
        id: "phase_1", title: "Phase 1: Foundation", subtitle: "Understand design basics", status: "active",
        missions: [
          m("m1_1", "What is UI and UX Design?", "Learn the difference between UI and UX and why both matter in digital products.", { Figma: 5, "Visual Hierarchy": 3 }, "active", { videoTitle: "Intro to UI/UX Design — 10 min", task: "Write a 2-sentence explanation of UI vs UX in your own words." }),
          m("m1_2", "Introduction to Figma", "Watch an intro to Figma and set up your first design file.", { Figma: 10, Layout: 5 }, "locked", { videoTitle: "Figma for Beginners — 15 min", task: "Create a Figma file and add a frame using the iPhone 14 preset." }),
          m("m1_3", "Layout, Spacing & Hierarchy", "Learn how layout, spacing, and visual hierarchy guide the user's eye.", { Layout: 10, "Visual Hierarchy": 10, Typography: 5 }, "locked", { videoTitle: "Design Principles: Layout — 12 min", task: "Design a simple 3-element layout with correct spacing and hierarchy." }),
          m("m1_4", "Recreate a Login Screen", "Apply what you've learned by recreating a simple login screen in Figma.", { Figma: 10, Layout: 5, "Color Basics": 8 }, "locked", { videoTitle: "Design Challenge Walkthrough — 8 min", task: "Recreate any login screen you see on your phone. Submit a Figma link." }),
        ],
      },
      {
        id: "phase_2", title: "Phase 2: Skill Building", subtitle: "Practice real product design work", status: "locked",
        missions: [
          m("m2_1", "Create Wireframes", "Learn how to wireframe and sketch out app screens before designing.", { Wireframing: 15, Prototyping: 5 }),
          m("m2_2", "Design a 3-Screen Mobile Flow", "Design an onboarding flow for a fictional app with 3 connected screens.", { Prototyping: 15, Wireframing: 5, "User Research": 5 }),
          m("m2_3", "User Research Basics", "Learn how designers research users and why it matters before designing.", { "User Research": 20, "Design Systems": 5 }),
          m("m2_4", "Build a UI Case Study", "Document your design process from problem to solution for one small project.", { "Design Systems": 10, "Responsive Design": 10 }),
        ],
      },
      {
        id: "phase_3", title: "Phase 3: Portfolio & Launch", subtitle: "Get ready to show your work", status: "locked",
        missions: [
          m("m3_1", "Create a Portfolio Case Study", "Write and design a full case study documenting one of your projects.", { "Portfolio Building": 20, "Case Study Writing": 15 }),
          m("m3_2", "Redesign an Existing App Screen", "Pick an app you use, identify a problem, and redesign one screen to fix it.", { "Portfolio Building": 10, "Product Thinking": 10 }),
          m("m3_3", "Present Your Design Choices", "Record or write a presentation explaining the decisions behind your designs.", { Presentation: 20, Collaboration: 10 }),
          m("m3_4", "Build Your Design Profile", "Set up a Behance or personal portfolio and publish your best 2 projects.", { "Portfolio Building": 15, "Product Thinking": 10 }),
        ],
      },
    ],
    skills: [
      "Figma","Layout","Typography","Color Basics","Visual Hierarchy",
      "Wireframing","Prototyping","User Research","Design Systems","Portfolio Building",
    ].map((name) => ({ name, progress: 0, level: "Beginner" })),
  },

  software_dev: {
    id: "software_dev",
    title: "Software Developer",
    roadmapTitle: "Software Developer Roadmap",
    category: "tech",
    careerDescription: "Build applications and systems that power the digital world.",
    kokoMessage:
      "You're on your way to becoming a Software Developer. Start with understanding what programming really is — your first mission is ready.",
    phases: [
      {
        id: "phase_1", title: "Phase 1: Foundation", subtitle: "Understand coding basics", status: "active",
        missions: [
          m("m1_1", "What is Programming?", "Learn what programming is, why it matters, and what developers actually do.", { "Programming Logic": 5, "Problem Solving": 3 }, "active", { videoTitle: "Programming 101 — 8 min", task: "Write a paragraph describing what a software developer builds in their day-to-day job." }),
          m("m1_2", "Choose Your First Language", "Learn the differences between beginner languages and pick one to start with.", { "Programming Logic": 8, Syntax: 5 }, "locked", { videoTitle: "Python vs JavaScript for Beginners — 10 min", task: "Write down which language you chose and why." }),
          m("m1_3", "Variables, Loops & Functions", "Learn the 3 fundamental building blocks used in almost every program.", { Syntax: 15, "Programming Logic": 10, "Debugging Basics": 5 }, "locked", { videoTitle: "Core Coding Concepts — 15 min", task: "Write a short program that uses a variable, a loop, and a function." }),
          m("m1_4", "Build a Simple Calculator", "Apply your coding basics to build a working calculator program.", { "Programming Logic": 10, "Debugging Basics": 10, "Git Basics": 5 }, "locked", { videoTitle: "Calculator Project Walkthrough — 12 min", task: "Build a calculator that can add, subtract, multiply, and divide. Submit your code." }),
        ],
      },
      {
        id: "phase_2", title: "Phase 2: Skill Building", subtitle: "Build real software projects", status: "locked",
        missions: [
          m("m2_1", "Build a To-Do App", "Build a working to-do list with add, complete, and delete features.", { "HTML/CSS": 10, "JavaScript/Python": 15 }),
          m("m2_2", "HTML, CSS & JS Basics", "Learn the language of the web — structure, style, and behaviour.", { "HTML/CSS": 20, "JavaScript/Python": 10 }),
          m("m2_3", "Create a Responsive Page", "Build a webpage that looks good on both desktop and mobile.", { "HTML/CSS": 10, "APIs Basics": 5, "Version Control": 5 }),
          m("m2_4", "Practice Debugging", "Learn how to read error messages, find bugs, and fix them systematically.", { "Debugging Basics": 20, "Problem Solving": 10 }),
        ],
      },
      {
        id: "phase_3", title: "Phase 3: Portfolio & Launch", subtitle: "Become job-ready", status: "locked",
        missions: [
          m("m3_1", "Push Projects to GitHub", "Set up a GitHub profile and upload your best projects.", { "Git Basics": 20, "Version Control": 15 }),
          m("m3_2", "Build a Complete App", "Build one more complete working application end-to-end.", { "JavaScript/Python": 15, "APIs Basics": 15 }),
          m("m3_3", "Learn Deployment Basics", "Deploy your app to the internet so others can use it.", { Deployment: 25, "APIs Basics": 10 }),
          m("m3_4", "Build Your Coding Portfolio", "Create a simple portfolio page that showcases your 3 best projects.", { "Portfolio Presentation": 25 }),
        ],
      },
    ],
    skills: [
      "Programming Logic","Problem Solving","Syntax","Debugging Basics","Git Basics",
      "HTML/CSS","JavaScript/Python","APIs Basics","Version Control","Deployment",
    ].map((name) => ({ name, progress: 0, level: "Beginner" })),
  },

  data_analyst: {
    id: "data_analyst",
    title: "Data Analyst",
    roadmapTitle: "Data Analyst Roadmap",
    category: "tech",
    careerDescription: "Turn raw data into clear insights that drive smarter decisions.",
    kokoMessage:
      "You're on your way to becoming a Data Analyst. Data is everywhere — let's start by understanding how to read it. Your first mission is ready.",
    phases: [
      {
        id: "phase_1", title: "Phase 1: Foundation", subtitle: "Understand data and numbers", status: "active",
        missions: [
          m("m1_1", "What is Data Analysis?", "Learn what data analysts do, what tools they use, and why data matters.", { "Analytical Thinking": 5, Excel: 3 }, "active", { videoTitle: "Data Analysis Explained — 10 min", task: "List 3 ways data is used in a real business you know." }),
          m("m1_2", "Excel & Google Sheets Basics", "Learn how to use spreadsheets to organise, clean, and calculate data.", { Excel: 20, "Data Cleaning": 5 }, "locked", { videoTitle: "Excel for Beginners — 15 min", task: "Create a spreadsheet with 5 columns of data and apply SUM, AVERAGE, and IF formulas." }),
          m("m1_3", "Understanding Charts & Trends", "Learn to read and create charts that tell a story from data.", { "Basic Statistics": 10, Excel: 8 }, "locked", { videoTitle: "Data Visualisation Basics — 12 min", task: "Create a bar chart and a line chart from a sample dataset." }),
          m("m1_4", "Practice Basic Formulas", "Go deeper into spreadsheet formulas used by data analysts daily.", { Excel: 10, "Spreadsheet Logic": 15, "Data Cleaning": 8 }, "locked", { videoTitle: "Advanced Spreadsheet Formulas — 10 min", task: "Complete a set of 10 formula exercises in a spreadsheet." }),
        ],
      },
      {
        id: "phase_2", title: "Phase 2: Skill Building", subtitle: "Analyse real data", status: "locked",
        missions: [
          m("m2_1", "SQL Basics", "Learn how to write queries to pull and filter data from databases.", { SQL: 20, "Data Cleaning": 10 }),
          m("m2_2", "Build a Simple Dashboard", "Create a visual dashboard using Excel, Google Sheets, or Power BI.", { "Dashboard Building": 20, "Data Visualisation": 10 }),
          m("m2_3", "Analyse a Real Dataset", "Download a public dataset and draw 3 meaningful conclusions from it.", { SQL: 10, "Analytical Thinking": 15, "Storytelling with Data": 5 }),
          m("m2_4", "Create a Short Report", "Write a 1-page report summarising your analysis findings.", { Reporting: 20, "Storytelling with Data": 15 }),
        ],
      },
      {
        id: "phase_3", title: "Phase 3: Portfolio & Launch", subtitle: "Present findings like a professional", status: "locked",
        missions: [
          m("m3_1", "Build an Analysis Case Study", "Document a full data analysis project from raw data to final insights.", { Reporting: 15, "Business Thinking": 10 }),
          m("m3_2", "Present Your Insights", "Create a slide deck or video presenting your data findings clearly.", { Presentation: 20, "Storytelling with Data": 10 }),
          m("m3_3", "Build a Mini Portfolio", "Publish 2–3 analysis projects with clear write-ups online.", { Reporting: 10, "Business Thinking": 15 }),
        ],
      },
    ],
    skills: [
      "Excel","Data Cleaning","Basic Statistics","Spreadsheet Logic","Analytical Thinking",
      "SQL","Data Visualisation","Dashboard Building","Reporting","Storytelling with Data",
    ].map((name) => ({ name, progress: 0, level: "Beginner" })),
  },

  graphic_designer: {
    id: "graphic_designer",
    title: "Graphic Designer",
    roadmapTitle: "Graphic Designer Roadmap",
    category: "creative",
    careerDescription: "Communicate ideas visually through compelling, purposeful design.",
    kokoMessage:
      "You're on your way to becoming a Graphic Designer. Let's start with the principles that make great visuals — your first mission is ready.",
    phases: [
      {
        id: "phase_1", title: "Phase 1: Foundation", subtitle: "Understand design principles", status: "active",
        missions: [
          m("m1_1", "Colour Theory Basics", "Learn how colours work together and why colour choices affect design.", { "Colour Theory": 15, "Visual Balance": 3 }, "active", { videoTitle: "Colour Theory for Designers — 12 min", task: "Create a colour palette of 5 colours and explain your choices." }),
          m("m1_2", "Typography Fundamentals", "Learn about fonts, type scales, and how to pair typefaces effectively.", { Typography: 20, Composition: 5 }, "locked", { videoTitle: "Typography 101 — 10 min", task: "Choose 2 complementary fonts and design a simple headline + body text layout." }),
          m("m1_3", "Composition & Layout", "Learn the rules of composition and how to balance elements on a page.", { Composition: 20, "Visual Balance": 15 }, "locked", { videoTitle: "Design Composition Rules — 10 min", task: "Recreate a magazine cover layout using Canva or Figma." }),
          m("m1_4", "Recreate a Simple Poster", "Design a simple event poster applying your colour, type, and layout knowledge.", { "Colour Theory": 8, Composition: 8, "Canva / Figma / Photoshop": 10 }, "locked", { videoTitle: "Poster Design Walkthrough — 8 min", task: "Design an A4 event poster for a fictional event. Submit as PNG." }),
        ],
      },
      {
        id: "phase_2", title: "Phase 2: Skill Building", subtitle: "Create real visual work", status: "locked",
        missions: [
          m("m2_1", "Design Social Media Graphics", "Create a set of 3 Instagram post designs for a fictional brand.", { Branding: 10, Layout: 10, "Visual Communication": 10 }),
          m("m2_2", "Create a Logo Concept", "Design 2–3 logo concepts for a fictional company from scratch.", { Branding: 20, "Creative Direction": 10 }),
          m("m2_3", "Build a Brand Style Board", "Create a brand style guide including colours, fonts, and logo usage.", { Branding: 10, "Image Editing": 10, "Visual Communication": 8 }),
          m("m2_4", "Practice Poster Design", "Design 2 posters from different brief styles (professional and creative).", { "Creative Direction": 15, Layout: 8 }),
        ],
      },
      {
        id: "phase_3", title: "Phase 3: Portfolio & Launch", subtitle: "Become client-ready", status: "locked",
        missions: [
          m("m3_1", "Build a Design Portfolio", "Publish your best 3 projects on Behance, Canva, or a personal site.", { "Portfolio Building": 25, "Design Consistency": 10 }),
          m("m3_2", "Create a Mock Brand Identity", "Build a complete brand identity (logo, colours, fonts, mockups) for a fictional brand.", { Branding: 15, "Brand Identity": 20 }),
          m("m3_3", "Present Your Design Work", "Record a 3–5 minute video walking through your portfolio and explaining your choices.", { "Client Communication": 20, Presentation: 15 }),
        ],
      },
    ],
    skills: [
      "Typography","Colour Theory","Composition","Visual Balance","Canva / Figma / Photoshop",
      "Branding","Layout","Image Editing","Creative Direction","Portfolio Building",
    ].map((name) => ({ name, progress: 0, level: "Beginner" })),
  },

  product_manager: {
    id: "product_manager",
    title: "Product Manager",
    roadmapTitle: "Product Manager Roadmap",
    category: "business",
    careerDescription: "Lead the strategy and vision behind products that millions of people use.",
    kokoMessage:
      "You're on your way to becoming a Product Manager. Great products start with understanding people — let's begin there. Your first mission is ready.",
    phases: [
      {
        id: "phase_1", title: "Phase 1: Foundation", subtitle: "Understand products and users", status: "active",
        missions: [
          m("m1_1", "What Does a Product Manager Do?", "Learn the PM role, how PMs work with designers and developers, and what they own.", { "Product Thinking": 8, Communication: 3 }, "active", { videoTitle: "Product Management Explained — 10 min", task: "Write a summary of what a PM does and how they differ from a developer." }),
          m("m1_2", "Understanding User Problems", "Learn how to identify real user problems that a product can solve.", { "User Empathy": 15, "Problem Solving": 10 }, "locked", { videoTitle: "User Problem Framing — 10 min", task: "Identify one real problem people face and write a clear problem statement." }),
          m("m1_3", "Product Thinking Basics", "Learn how to think about features, value, and user needs at a product level.", { "Product Thinking": 15, "Strategy Basics": 8 }, "locked", { videoTitle: "Product Thinking 101 — 12 min", task: "Pick an app you use and list 3 features you think should be improved and why." }),
          m("m1_4", "Review Real App Features", "Analyse the features of a popular app and understand why they were built.", { "Product Thinking": 10, "Strategy Basics": 10, Communication: 5 }, "locked", { videoTitle: "Feature Analysis Walkthrough — 8 min", task: "Write a 1-page review of a mobile app's top 5 features and their purpose." }),
        ],
      },
      {
        id: "phase_2", title: "Phase 2: Skill Building", subtitle: "Learn how products are planned", status: "locked",
        missions: [
          m("m2_1", "Create a Feature Idea", "Define a new feature for an existing app with a clear user story.", { Roadmapping: 10, Prioritisation: 5 }),
          m("m2_2", "Write a Product Brief", "Write a simple product brief that defines the problem, solution, and success metrics.", { Roadmapping: 15, Research: 10 }),
          m("m2_3", "Prioritise Features", "Use a prioritisation framework (like RICE or MoSCoW) to rank features.", { Prioritisation: 20, "Decision Making": 10 }),
          m("m2_4", "Study User Feedback", "Analyse real app reviews and extract patterns in what users want.", { Research: 15, Collaboration: 10, "User Empathy": 10 }),
        ],
      },
      {
        id: "phase_3", title: "Phase 3: Portfolio & Launch", subtitle: "Show that you can manage a product", status: "locked",
        missions: [
          m("m3_1", "Build a Product Case Study", "Document a full product problem + your proposed solution in a structured case study.", { Roadmaps: 15, "Product Strategy": 15 }),
          m("m3_2", "Create a Feature Roadmap", "Build a visual roadmap showing what to build, in what order, and why.", { Roadmaps: 20, Analytics: 10 }),
          m("m3_3", "Present a Launch Plan", "Prepare a presentation outlining how you would launch a product or feature.", { Communication: 20, Leadership: 10 }),
        ],
      },
    ],
    skills: [
      "Product Thinking","Communication","Problem Solving","User Empathy","Strategy Basics",
      "Roadmapping","Prioritisation","Research","Decision Making","Analytics",
    ].map((name) => ({ name, progress: 0, level: "Beginner" })),
  },

  entrepreneur: {
    id: "entrepreneur",
    title: "Entrepreneur",
    roadmapTitle: "Entrepreneur Roadmap",
    category: "business",
    careerDescription: "Build your own business and create real value from the ground up.",
    kokoMessage:
      "You're on your way to becoming an Entrepreneur. Every great business starts with a real problem — let's find yours. Your first mission is ready.",
    phases: [
      {
        id: "phase_1", title: "Phase 1: Foundation", subtitle: "Understand business ideas and opportunities", status: "active",
        missions: [
          m("m1_1", "Identify a Real Problem", "Learn how great businesses start — by spotting problems people actually have.", { "Business Thinking": 8, "Problem Identification": 5 }, "active", { videoTitle: "Finding Business Opportunities — 10 min", task: "Write down 3 problems you or people around you face regularly." }),
          m("m1_2", "Learn Basic Business Models", "Understand how businesses make money — from product sales to subscriptions.", { "Business Thinking": 12, "Market Awareness": 8 }, "locked", { videoTitle: "Business Models Explained — 12 min", task: "Pick a business you admire and describe how it makes money." }),
          m("m1_3", "Study Market Needs", "Learn how to research whether a market exists for your idea.", { "Market Awareness": 15, "Idea Validation": 8 }, "locked", { videoTitle: "Market Research Basics — 10 min", task: "Research one market segment and write a short summary of who needs what." }),
          m("m1_4", "Explore Simple Business Ideas", "Turn the problem you identified into 2–3 potential business ideas.", { "Idea Validation": 12, "Sales Basics": 5, "Business Thinking": 8 }, "locked", { videoTitle: "Idea Generation Methods — 8 min", task: "Write 3 business idea concepts for the problem you identified in Mission 1." }),
        ],
      },
      {
        id: "phase_2", title: "Phase 2: Skill Building", subtitle: "Test and refine your idea", status: "locked",
        missions: [
          m("m2_1", "Talk to Real People", "Interview 3–5 people who experience the problem you want to solve.", { Validation: 20, "Sales Basics": 5 }),
          m("m2_2", "Create a Simple Landing Page", "Build a basic landing page describing your business idea using Carrd or Notion.", { Marketing: 15, "Sales Basics": 10 }),
          m("m2_3", "Learn Pricing Basics", "Learn how to price your product or service in a way that makes sense.", { "Finance Basics": 20, "Sales Basics": 10 }),
          m("m2_4", "Draft a Business Plan", "Write a 1-page business plan covering problem, solution, market, and revenue.", { Communication: 15, "Finance Basics": 8, Validation: 8 }),
        ],
      },
      {
        id: "phase_3", title: "Phase 3: Launch & Growth", subtitle: "Turn your idea into something real", status: "locked",
        missions: [
          m("m3_1", "Build a Small MVP", "Create the simplest version of your product that someone can actually use.", { Operations: 20, "Growth Thinking": 10 }),
          m("m3_2", "Create a Pitch Deck", "Build a 10-slide pitch deck explaining your business to potential investors or partners.", { Pitching: 25, "Financial Planning": 10 }),
          m("m3_3", "Set a Launch Plan", "Define how you'll launch: who you'll tell, how you'll reach them, what success looks like.", { "Growth Thinking": 15, Operations: 10 }),
          m("m3_4", "Track Early Results", "Set up basic tracking and measure your first 7 days after launch.", { "Financial Planning": 15, Leadership: 10 }),
        ],
      },
    ],
    skills: [
      "Business Thinking","Problem Identification","Market Awareness","Sales Basics","Idea Validation",
      "Validation","Marketing","Finance Basics","Communication","Pitching",
    ].map((name) => ({ name, progress: 0, level: "Beginner" })),
  },
};

/* ---------- Resolution helpers ---------- */

const TITLE_TO_MODULE: Record<string, string> = {
  "ui/ux designer": "ux_designer",
  "ux designer": "ux_designer",
  "ui designer": "ux_designer",
  "product designer": "ux_designer",
  "mobile app developer": "software_dev",
  "software developer": "software_dev",
  "software engineer": "software_dev",
  "frontend developer": "software_dev",
  "cybersecurity analyst": "software_dev",
  "data analyst": "data_analyst",
  "data scientist": "data_analyst",
  "business analyst": "data_analyst",
  "financial analyst": "data_analyst",
  "graphic designer": "graphic_designer",
  "motion designer": "graphic_designer",
  "content creator": "graphic_designer",
  "product manager": "product_manager",
  "marketing strategist": "product_manager",
  "human resource manager": "product_manager",
  "psychologist": "product_manager",
  "teacher / educator": "product_manager",
  "entrepreneur": "entrepreneur",
  "digital marketer": "entrepreneur",
};

const CATEGORY_FALLBACK: Record<string, string> = {
  creative: "ux_designer",
  tech: "software_dev",
  business: "product_manager",
  science: "data_analyst",
  people: "product_manager",
  communication: "graphic_designer",
};

export function moduleIdFor(career?: { title?: string; category?: string } | null): string {
  if (!career) return "ux_designer";
  const byTitle = career.title && TITLE_TO_MODULE[career.title.toLowerCase().trim()];
  if (byTitle) return byTitle;
  return CATEGORY_FALLBACK[career.category || ""] || "ux_designer";
}

export function getActiveModule(): CareerModule | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem("worthscope_active_module");
  if (raw) {
    try { return JSON.parse(raw) as CareerModule; } catch { /* fallthrough */ }
  }
  return null;
}

export function loadModuleForCareer(career?: { title?: string; category?: string } | null): CareerModule {
  const id = moduleIdFor(career);
  return careerModules[id];
}

export function setActiveModule(mod: CareerModule) {
  localStorage.setItem("worthscope_active_module", JSON.stringify(mod));
}

export function flatMissions(mod: CareerModule): ModuleMission[] {
  return mod.phases.flatMap((p) => p.missions);
}

export function totalMissionCount(mod: CareerModule): number {
  return mod.phases.reduce((s, p) => s + p.missions.length, 0);
}
