/* Search shortcuts for finding real jobs and freelance work for a career.
   These only OPEN a search on the other site (in a new tab) — no data is
   scraped or pulled from them, so no keys or permissions are needed. */

export type OpportunityLink = { label: string; kind: "job" | "freelance"; url: string; blurb: string };

const q = encodeURIComponent;

// What people actually search for on job boards vs. freelance marketplaces.
const JOB_TERMS: Record<string, string> = {
  "Content Creator": "content creator",
  "Digital Marketer": "digital marketer",
  "UI/UX Designer": "ui ux designer",
  "Graphic Designer": "graphic designer",
  "Software Developer": "software developer",
  "Data Analyst": "data analyst",
  "Cybersecurity Analyst": "cybersecurity analyst",
  "Product Manager": "product manager",
  Entrepreneur: "business development",
  "Financial Analyst": "financial analyst",
  "Mechanical Engineer": "mechanical engineer",
};

const FREELANCE_TERMS: Record<string, string> = {
  "Content Creator": "video editing",
  "Digital Marketer": "social media marketing",
  "UI/UX Designer": "ui ux design",
  "Graphic Designer": "logo design",
  "Software Developer": "web development",
  "Data Analyst": "data analysis",
  "Cybersecurity Analyst": "cybersecurity",
  "Product Manager": "project management",
  Entrepreneur: "business plan",
  "Financial Analyst": "financial analysis",
  "Mechanical Engineer": "cad design",
};

export function opportunityLinks(careerTitle: string): OpportunityLink[] {
  const job = JOB_TERMS[careerTitle] ?? careerTitle.toLowerCase();
  const gig = FREELANCE_TERMS[careerTitle] ?? careerTitle.toLowerCase();
  return [
    { label: "LinkedIn Jobs", kind: "job", blurb: "Full-time & internships in Nigeria", url: `https://www.linkedin.com/jobs/search/?keywords=${q(job)}&location=Nigeria` },
    { label: "Google Jobs", kind: "job", blurb: "Listings from many sites at once", url: `https://www.google.com/search?q=${q(`${job} jobs in Nigeria`)}&ibp=htl;jobs` },
    { label: "Jobberman", kind: "job", blurb: "Nigerian job board", url: `https://www.jobberman.com/jobs?q=${q(job)}` },
    { label: "Fiverr", kind: "freelance", blurb: "Earn from gigs while you learn", url: `https://www.fiverr.com/search/gigs?query=${q(gig)}` },
    { label: "Upwork", kind: "freelance", blurb: "Freelance projects & clients", url: `https://www.upwork.com/nx/search/jobs/?q=${q(gig)}` },
  ];
}
