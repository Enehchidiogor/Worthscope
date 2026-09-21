/* Content + scoring weights for the deeper Career Intelligence questions.
   `scores` strings are "Career title:points|Career title:points". Positive
   points push a career up; negative points (dislikes) push it down. The titles
   match the careers in recommendationEngine.ts. */

export type ScoredOption = { id: string; label: string; info?: string; scores: string };
export type Scenario = { id: string; prompt: string; options: ScoredOption[] };

export const STRENGTHS: ScoredOption[] = [
  { id: "maths", label: "Mathematics", info: "Numbers, algebra and problem-solving with figures.", scores: "Data Analyst:9|Financial Analyst:9|Software Developer:7|Mechanical Engineer:6|Cybersecurity Analyst:5" },
  { id: "english", label: "English & writing", info: "Reading, essays, speaking and expressing ideas clearly.", scores: "Content Creator:9|Digital Marketer:8|Product Manager:3" },
  { id: "science", label: "Sciences (Physics, Chemistry, Biology)", info: "Understanding how the natural and physical world works.", scores: "Mechanical Engineer:9|Data Analyst:4|Cybersecurity Analyst:2" },
  { id: "ict", label: "Computer studies / ICT", info: "Using computers, coding, and understanding how software works.", scores: "Software Developer:10|Cybersecurity Analyst:9|Data Analyst:6|UI/UX Designer:4" },
  { id: "art", label: "Art & design", info: "Drawing, colour, layout and making things look good.", scores: "Graphic Designer:10|UI/UX Designer:9|Content Creator:6" },
  { id: "business", label: "Business, Economics & Commerce", info: "How money, markets, buying and selling and companies work.", scores: "Entrepreneur:10|Financial Analyst:8|Product Manager:7|Digital Marketer:7" },
  { id: "media", label: "Music, Film & Media", info: "Making or studying music, video, photography or performance.", scores: "Content Creator:11|Digital Marketer:4|Graphic Designer:3" },
  { id: "social", label: "Social studies, Government & Languages", info: "People, society, communication and how groups work.", scores: "Product Manager:4|Digital Marketer:4|Entrepreneur:3|Content Creator:3" },
];

export const EXPERIENCE: ScoredOption[] = [
  { id: "videos", label: "Made videos or posted content online", info: "TikTok, YouTube, Instagram, podcasts, vlogs — anything you created and shared.", scores: "Content Creator:10|Digital Marketer:5" },
  { id: "code", label: "Built a website, app or written code", info: "Even a simple page, a small game or following a coding tutorial.", scores: "Software Developer:12|UI/UX Designer:4|Cybersecurity Analyst:3" },
  { id: "design", label: "Designed graphics, logos or posters", info: "Using tools like Canva, Photoshop or drawing by hand for something real.", scores: "Graphic Designer:11|UI/UX Designer:6|Content Creator:3" },
  { id: "sold", label: "Sold something or run a small business", info: "Selling snacks, clothes, services or anything to real customers.", scores: "Entrepreneur:11|Digital Marketer:6" },
  { id: "led", label: "Led a team, club or event", info: "Head prefect, class captain, organising a programme or a group project.", scores: "Product Manager:10|Entrepreneur:5" },
  { id: "numbers", label: "Worked with numbers, budgets or spreadsheets", info: "Managing money for a group, using Excel or tracking results.", scores: "Data Analyst:10|Financial Analyst:10" },
  { id: "physical", label: "Fixed or built physical things", info: "Repairing gadgets, building models, working with tools or machines.", scores: "Mechanical Engineer:12|Cybersecurity Analyst:1" },
  { id: "security", label: "Secured devices, accounts or networks", info: "Recovering a hacked account, setting up Wi-Fi or protecting a device.", scores: "Cybersecurity Analyst:10|Software Developer:3" },
  { id: "writing", label: "Written stories, blogs or articles", info: "Any writing you did by choice, not just for school.", scores: "Content Creator:8|Digital Marketer:6" },
  { id: "invest", label: "Managed savings or learned about investing", info: "Budgeting, saving plans, or learning how stocks or crypto work.", scores: "Financial Analyst:8|Entrepreneur:3" },
];

export const SCENARIOS: Scenario[] = [
  {
    id: "event",
    prompt: "Your school club is organising a big event. Which job do you grab first?",
    options: [
      { id: "poster", label: "Design the posters and how everything looks", scores: "Graphic Designer:8|UI/UX Designer:6|Content Creator:4" },
      { id: "video", label: "Film videos and post them to get people excited", scores: "Content Creator:10|Digital Marketer:5" },
      { id: "plan", label: "Plan the schedule and make sure everyone does their part", scores: "Product Manager:10|Entrepreneur:3" },
      { id: "money", label: "Handle the money, budget and tickets", scores: "Financial Analyst:9|Data Analyst:3" },
      { id: "site", label: "Build a page or app for sign-ups", scores: "Software Developer:9|UI/UX Designer:5" },
      { id: "sell", label: "Sell tickets and convince people to come", scores: "Digital Marketer:8|Entrepreneur:6" },
    ],
  },
  {
    id: "group",
    prompt: "A group project is going badly. What do you do?",
    options: [
      { id: "evidence", label: "Look at the facts to work out what's actually going wrong", scores: "Data Analyst:8|Financial Analyst:4|Cybersecurity Analyst:4" },
      { id: "newidea", label: "Come up with a fresh idea to restart it", scores: "Entrepreneur:5|Content Creator:4|UI/UX Designer:4|Graphic Designer:3" },
      { id: "organise", label: "Re-organise everyone's roles and set clear deadlines", scores: "Product Manager:9" },
      { id: "fixpart", label: "Quietly fix the broken part myself", scores: "Software Developer:6|Mechanical Engineer:6|Cybersecurity Analyst:5" },
      { id: "listen", label: "Talk to each person to understand what they need", scores: "UI/UX Designer:6|Product Manager:5|Digital Marketer:3" },
    ],
  },
  {
    id: "weekend",
    prompt: "You get a free weekend and no rules. What do you make?",
    options: [
      { id: "media", label: "A video, song or story", scores: "Content Creator:10" },
      { id: "app", label: "An app, game or website", scores: "Software Developer:10|UI/UX Designer:4" },
      { id: "biz", label: "A small business idea I can test", scores: "Entrepreneur:10|Digital Marketer:3" },
      { id: "gadget", label: "Something physical — a gadget, model or repair", scores: "Mechanical Engineer:10" },
      { id: "study", label: "A study of a real problem, using data", scores: "Data Analyst:9|Financial Analyst:3" },
      { id: "brand", label: "A poster, logo or brand look", scores: "Graphic Designer:10|UI/UX Designer:4" },
    ],
  },
  {
    id: "app",
    prompt: "When you use an app you love, what do you notice most?",
    options: [
      { id: "look", label: "How good it looks and how easy it feels to use", scores: "UI/UX Designer:10|Graphic Designer:5" },
      { id: "built", label: "How it was built and how it works inside", scores: "Software Developer:10|Mechanical Engineer:2" },
      { id: "money", label: "How the company makes money from it", scores: "Entrepreneur:7|Financial Analyst:5|Product Manager:4" },
      { id: "safe", label: "Whether it keeps my information safe", scores: "Cybersecurity Analyst:10" },
      { id: "data", label: "What information it collects and how it uses it", scores: "Data Analyst:8|Cybersecurity Analyst:3" },
      { id: "viral", label: "Why it became so popular online", scores: "Digital Marketer:9|Content Creator:5" },
    ],
  },
];

export const DISLIKES: ScoredOption[] = [
  { id: "screen", label: "Sitting at a computer all day", info: "Long hours in front of a screen.", scores: "Software Developer:-6|Data Analyst:-6|Cybersecurity Analyst:-6|UI/UX Designer:-5|Graphic Designer:-4" },
  { id: "numbers", label: "Working with numbers and spreadsheets", info: "Lots of maths, figures and tables.", scores: "Data Analyst:-8|Financial Analyst:-9" },
  { id: "speaking", label: "Talking to lots of people or presenting", info: "Meetings, pitching and speaking in front of others.", scores: "Digital Marketer:-5|Product Manager:-6|Entrepreneur:-5|Content Creator:-3" },
  { id: "camera", label: "Being on camera or posting about myself publicly", info: "Putting your face and life online.", scores: "Content Creator:-9|Digital Marketer:-3" },
  { id: "routine", label: "Doing the same routine every day", info: "Predictable, repeated tasks.", scores: "Financial Analyst:-4|Data Analyst:-4|Mechanical Engineer:-3" },
  { id: "hands", label: "Physical, hands-on work", info: "Working with tools, machines or equipment.", scores: "Mechanical Engineer:-9" },
  { id: "risk", label: "Uncertainty and financial risk", info: "Not knowing if money will come in.", scores: "Entrepreneur:-9|Content Creator:-3" },
  { id: "writing", label: "Writing long pieces of text", info: "Reports, articles and long emails.", scores: "Content Creator:-5|Digital Marketer:-4" },
  { id: "pressure", label: "Constant deadlines and pressure", info: "Always racing against the clock.", scores: "Product Manager:-4|Cybersecurity Analyst:-3|Entrepreneur:-2" },
];

/** Parses "Title:pts|Title:pts" into [title, pts] pairs. */
export function parseScores(scores: string): [string, number][] {
  return scores.split("|").filter(Boolean).map((p) => {
    const i = p.lastIndexOf(":");
    return [p.slice(0, i), Number(p.slice(i + 1))] as [string, number];
  });
}
