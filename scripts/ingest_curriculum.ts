/* One-time ingestion: extract Worthscope_FEED.pdf, split by career, and load
   each career's curriculum into the curriculum_reference table.

   Usage (PowerShell):
     $env:SUPABASE_URL="https://<ref>.supabase.co"
     $env:SUPABASE_SERVICE_ROLE_KEY="<service-role-key>"
     npx tsx scripts/ingest_curriculum.ts

   Place Worthscope_FEED.pdf in the project root before running.
   Safe to re-run: rows are upserted on career_slug.

   Requires devDeps: pdf-parse, tsx (see package.json). Run `npm install` first. */

import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import pdf from "pdf-parse";
import { createClient } from "@supabase/supabase-js";

// The 16 curriculum careers and their slugs (must match _shared/career-slug.ts).
const CAREERS: { path: string; slug: string }[] = [
  { path: "UI/UX Designer", slug: "ui-ux-designer" },
  { path: "Product Designer", slug: "product-designer" },
  { path: "Frontend Developer", slug: "frontend-developer" },
  { path: "Full Stack Developer", slug: "full-stack-developer" },
  { path: "Cloud Engineer", slug: "cloud-engineer" },
  { path: "DevOps Engineer", slug: "devops-engineer" },
  { path: "Cybersecurity Analyst", slug: "cybersecurity-analyst" },
  { path: "Data Analyst", slug: "data-analyst" },
  { path: "Data Scientist", slug: "data-scientist" },
  { path: "AI/ML Engineer", slug: "ai-ml-engineer" },
  { path: "Entrepreneur", slug: "entrepreneur" },
  { path: "Business Analyst", slug: "business-analyst" },
  { path: "Digital Marketer", slug: "digital-marketer" },
  { path: "Product Manager", slug: "product-manager" },
  { path: "Graphic Designer", slug: "graphic-designer" },
  { path: "Project Manager", slug: "project-manager" },
];

// Careers the PDF doesn't fully cover — store as is_complete = false so Koko
// falls back to general knowledge for them.
const FORCE_INCOMPLETE = new Set(["graphic-designer", "project-manager"]);

const PLACEHOLDER =
  "Curriculum reference for this career is still being finalised. Koko will teach from general knowledge until the full reference is available.";

function slugifyHeading(name: string): string {
  return name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

/* Split the extracted PDF text into { slug -> content } using the
   "WORTHSCOPE CURRICULUM: <Career>" headings. When a career appears more than
   once (e.g. an instruction stub plus the real output), keep the longest. */
function splitByCareer(text: string): Map<string, string> {
  const headingRe = /WORTHSCOPE\s+CURRICULUM:\s*([A-Za-z][A-Za-z/ &.+-]*?)\s*(?:\r?\n|$)/gi;
  const marks: { slug: string; start: number }[] = [];
  let match: RegExpExecArray | null;
  while ((match = headingRe.exec(text)) !== null) {
    marks.push({ slug: slugifyHeading(match[1]), start: match.index });
  }

  const bySlug = new Map<string, string>();
  for (let i = 0; i < marks.length; i++) {
    const end = i + 1 < marks.length ? marks[i + 1].start : text.length;
    const content = text.slice(marks[i].start, end).trim();
    const prev = bySlug.get(marks[i].slug);
    if (!prev || content.length > prev.length) bySlug.set(marks[i].slug, content);
  }
  return bySlug;
}

async function main() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error("Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY env vars before running.");
    process.exit(1);
  }

  const pdfPath = resolve(process.cwd(), "Worthscope_FEED.pdf");
  let buffer: Buffer;
  try {
    buffer = readFileSync(pdfPath);
  } catch {
    console.error(`Could not read ${pdfPath}. Place Worthscope_FEED.pdf in the project root.`);
    process.exit(1);
  }

  console.log("Parsing PDF…");
  const parsed = await pdf(buffer);
  const extracted = splitByCareer(parsed.text);
  console.log(`Found ${extracted.size} career sections in the PDF.`);

  const supabase = createClient(url, key, { auth: { persistSession: false } });

  const rows = CAREERS.map(({ path, slug }) => {
    const found = extracted.get(slug);
    const isComplete = !!found && !FORCE_INCOMPLETE.has(slug);
    return {
      career_slug: slug,
      career_path: path,
      full_content: found ?? PLACEHOLDER,
      is_complete: isComplete,
      last_updated: new Date().toISOString(),
    };
  });

  console.log("Upserting curriculum rows…");
  const { error } = await supabase
    .from("curriculum_reference")
    .upsert(rows, { onConflict: "career_slug" });
  if (error) {
    console.error("Upsert failed:", error);
    process.exit(1);
  }

  // Summary + flag noisy/short extractions for manual review.
  const complete = rows.filter((r) => r.is_complete);
  const incomplete = rows.filter((r) => !r.is_complete);
  console.log(`\nDone. ${rows.length} rows (${complete.length} complete, ${incomplete.length} incomplete).`);
  console.log("\nPer-career character counts:");
  for (const r of rows) {
    const flag = r.is_complete && r.full_content.length < 3000 ? "  ⚠️  short — review extraction" : "";
    console.log(`  ${r.career_slug.padEnd(22)} ${String(r.full_content.length).padStart(7)} chars  ${r.is_complete ? "complete" : "incomplete"}${flag}`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
