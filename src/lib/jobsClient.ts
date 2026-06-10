// WorthScope — Career jobs client. Calls the jobs-fetch edge function and
// falls back gracefully to the local curated list if everything else fails.
import { supabase } from "@/integrations/supabase/client";
import { JOBS as LOCAL_JOBS } from "@/components/career/jobsData";

export type UnifiedJob = {
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
  source: "curated" | "jsearch" | "local";
};

export type FetchJobsResult = {
  jobs: UnifiedJob[];
  partial: boolean; // true when JSearch failed but curated was returned
  errored: boolean; // true when everything failed and we fell back to local
};

function localFallback(careerPath: string): UnifiedJob[] {
  return LOCAL_JOBS.slice(0, 6).map((j) => ({
    id: j.id,
    title: j.title,
    company: j.company,
    company_logo_url: null,
    location: j.tags.find((t) => t.includes("Lagos") || t.toLowerCase().includes("remote")) || "Nigeria",
    job_type: j.tags.some((t) => t.toLowerCase().includes("intern"))
      ? "internship"
      : j.tags.some((t) => t.toLowerCase().includes("remote"))
      ? "remote"
      : "full-time",
    salary_range: j.tags.find((t) => t.includes("₦")) || null,
    description: j.why,
    requirements: [],
    apply_url: "https://www.linkedin.com/jobs/",
    posted_at: new Date().toISOString(),
    match_percentage: j.match,
    source: "local",
  }));
}

export async function fetchJobs(opts: {
  careerPath: string;
  location?: string;
  userSkills?: string[];
}): Promise<FetchJobsResult> {
  try {
    const { data, error } = await supabase.functions.invoke("jobs-fetch", {
      body: {
        careerPath: opts.careerPath,
        location: opts.location || "Nigeria",
        userSkills: opts.userSkills || [],
      },
    });
    if (error) throw error;
    const jobs: UnifiedJob[] = Array.isArray(data?.jobs) ? data.jobs : [];
    const partial = !!data?.meta?.jsearch_error;
    if (jobs.length === 0) {
      return { jobs: localFallback(opts.careerPath), partial: false, errored: true };
    }
    return { jobs, partial, errored: false };
  } catch {
    return { jobs: localFallback(opts.careerPath), partial: false, errored: true };
  }
}
