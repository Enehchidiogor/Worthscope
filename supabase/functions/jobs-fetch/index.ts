// WorthScope — jobs-fetch
// Returns a unified list of jobs combining curated jobs (Supabase) and,
// when fewer than 5 curated matches exist, the JSearch API (RapidAPI).
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

type UnifiedJob = {
  id: string;
  title: string;
  company: string;
  company_logo_url: string | null;
  location: string;
  job_type: string;
  salary_range: string | null;
  description: string;
  requirements: string[];
  apply_url: string;
  posted_at: string;
  match_percentage: number;
  source: "curated" | "jsearch";
};

function matchPct(userSkills: string[], requirements: string[]): number {
  if (!requirements.length) return 70;
  if (!userSkills.length) {
    return Math.floor(Math.random() * 30) + 65; // 65-95
  }
  const reqLower = requirements.map((r) => r.toLowerCase());
  const hits = userSkills.filter((s) =>
    reqLower.some((r) => r.includes(s.toLowerCase()) || s.toLowerCase().includes(r)),
  ).length;
  const raw = Math.round((hits / requirements.length) * 100);
  // Floor at 65 so we never look hopeless; cap at 95.
  return Math.min(95, Math.max(65, raw || 65));
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const body = await req.json().catch(() => ({}));
    const careerPath: string = (body?.careerPath || "").toLowerCase();
    const location: string = body?.location || "Nigeria";
    const userSkills: string[] = Array.isArray(body?.userSkills) ? body.userSkills : [];

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // --- Curated ---
    let curated: any[] = [];
    let curatedError: string | null = null;
    try {
      let q = supabase
        .from("jobs_curated")
        .select("*")
        .eq("is_active", true)
        .order("posted_at", { ascending: false });
      const { data, error } = await q;
      if (error) throw error;
      curated = (data || []).filter((j: any) =>
        !careerPath ||
        (Array.isArray(j.career_paths) &&
          j.career_paths.some((c: string) => c.toLowerCase().includes(careerPath) || careerPath.includes(c.toLowerCase()))),
      );
      // If the strict filter empties the list, fall back to all active jobs.
      if (curated.length === 0) curated = data || [];
    } catch (e) {
      curatedError = String((e as Error).message || e);
    }

    const curatedJobs: UnifiedJob[] = curated.map((j) => ({
      id: j.id,
      title: j.title,
      company: j.company,
      company_logo_url: j.company_logo_url,
      location: j.location,
      job_type: j.job_type,
      salary_range: j.salary_range,
      description: j.description,
      requirements: Array.isArray(j.requirements) ? j.requirements : [],
      apply_url: j.apply_url,
      posted_at: j.posted_at,
      match_percentage: matchPct(userSkills, j.requirements || []),
      source: "curated",
    }));

    // --- JSearch fallback (only if curated < 5 and key is set) ---
    let jsearchJobs: UnifiedJob[] = [];
    let jsearchError: string | null = null;
    const jsearchKey = Deno.env.get("JSEARCH_API_KEY");
    if (curatedJobs.length < 5 && jsearchKey) {
      try {
        const query = encodeURIComponent(`${careerPath || "entry level"} ${location}`);
        const res = await fetch(
          `https://jsearch.p.rapidapi.com/search?query=${query}&page=1&num_pages=1`,
          {
            headers: {
              "X-RapidAPI-Key": jsearchKey,
              "X-RapidAPI-Host": "jsearch.p.rapidapi.com",
            },
          },
        );
        if (!res.ok) throw new Error(`JSearch ${res.status}`);
        const json = await res.json();
        const items = Array.isArray(json?.data) ? json.data : [];
        jsearchJobs = items.slice(0, 5 - curatedJobs.length).map((j: any) => {
          const reqs: string[] = Array.isArray(j.job_highlights?.Qualifications)
            ? j.job_highlights.Qualifications.slice(0, 6)
            : [];
          return {
            id: `jsearch_${j.job_id}`,
            title: j.job_title || "Untitled role",
            company: j.employer_name || "Company",
            company_logo_url: j.employer_logo || null,
            location:
              [j.job_city, j.job_country].filter(Boolean).join(", ") || location,
            job_type: (j.job_employment_type || "FULLTIME").toLowerCase().replace("_", "-"),
            salary_range:
              j.job_min_salary && j.job_max_salary
                ? `${j.job_min_salary}-${j.job_max_salary} ${j.job_salary_currency || ""}`
                : null,
            description: (j.job_description || "").slice(0, 1200),
            requirements: reqs,
            apply_url: j.job_apply_link || j.job_google_link || "#",
            posted_at: j.job_posted_at_datetime_utc || new Date().toISOString(),
            match_percentage: matchPct(userSkills, reqs),
            source: "jsearch" as const,
          };
        });
      } catch (e) {
        jsearchError = String((e as Error).message || e);
      }
    }

    return new Response(
      JSON.stringify({
        jobs: [...curatedJobs, ...jsearchJobs],
        meta: {
          curated_count: curatedJobs.length,
          jsearch_count: jsearchJobs.length,
          curated_error: curatedError,
          jsearch_error: jsearchError,
          jsearch_configured: !!jsearchKey,
        },
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    return new Response(
      JSON.stringify({ error: String((e as Error).message || e), jobs: [] }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
