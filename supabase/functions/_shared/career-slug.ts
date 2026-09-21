// Maps a career display name (as stored in profiles.career_path) to the
// curriculum_reference.career_slug used for lookup.
//
// Two name systems exist in this codebase:
//   1. The 16 curriculum careers in Worthscope_FEED.pdf (the slugs below).
//   2. The CRS canonical titles (recommendationEngine.ts) that are actually
//      written to profiles.career_path — some of which differ. Those are
//      aliased to the closest curriculum where one exists.
// Careers with no curriculum (Financial Analyst, Content Creator, Mechanical
// Engineer, etc.) simply won't match a row, and Koko falls back to general
// knowledge gracefully.

const SLUG_MAP: Record<string, string> = {
  // --- 16 curriculum careers (PDF) ---
  "UI/UX Designer": "ui-ux-designer",
  "Product Designer": "product-designer",
  "Frontend Developer": "frontend-developer",
  "Full Stack Developer": "full-stack-developer",
  "Cloud Engineer": "cloud-engineer",
  "DevOps Engineer": "devops-engineer",
  "Cybersecurity Analyst": "cybersecurity-analyst",
  "Data Analyst": "data-analyst",
  "Data Scientist": "data-scientist",
  "AI/ML Engineer": "ai-ml-engineer",
  "Entrepreneur": "entrepreneur",
  "Business Analyst": "business-analyst",
  "Digital Marketer": "digital-marketer",
  "Product Manager": "product-manager",
  "Graphic Designer": "graphic-designer",
  "Project Manager": "project-manager",

  // --- CRS canonical aliases (recommendationEngine.ts) → closest curriculum ---
  "Software Developer": "full-stack-developer", // broadest dev curriculum available
};

export function normaliseCareerSlug(careerPath: string | null | undefined): string {
  if (!careerPath) return "";
  const exact = SLUG_MAP[careerPath.trim()];
  if (exact) return exact;
  // Fallback: derive a slug; if it doesn't match a row the caller falls back.
  return careerPath.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}
