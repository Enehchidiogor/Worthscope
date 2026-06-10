import { streamKokoChat } from "@/lib/kokoClient";
import { supabase } from "@/integrations/supabase/client";
import { getProfile, getChosenCareer } from "@/lib/userState";

export type KokoRoadmapPhase = {
  title: string;
  goal: string;
  topics: string[];
  tools: string[];
  aiIntegration: string;
  milestone: string;
};

export type KokoRoadmap = {
  career: string;
  summary: string;
  phases: KokoRoadmapPhase[];
};

function extractJson(raw: string): KokoRoadmap | null {
  const cleaned = raw
    .replace(/^```(?:json)?/i, "")
    .replace(/```$/i, "")
    .trim();
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start < 0 || end <= start) return null;
  try {
    const obj = JSON.parse(cleaned.slice(start, end + 1));
    if (!obj || !Array.isArray(obj.phases)) return null;
    return obj as KokoRoadmap;
  } catch {
    return null;
  }
}

export async function loadCachedRoadmap(career: string | undefined): Promise<KokoRoadmap | null> {
  const { data: u } = await supabase.auth.getUser();
  if (!u.user) return null;
  const q = supabase
    .from("koko_roadmaps")
    .select("roadmap_json")
    .eq("user_id", u.user.id);
  const { data } = career ? await q.eq("career", career).maybeSingle() : await q.maybeSingle();
  return (data?.roadmap_json as KokoRoadmap) || null;
}

export async function generateKokoRoadmap(opts?: {
  onDelta?: (raw: string) => void;
}): Promise<KokoRoadmap> {
  const profile = getProfile();
  const career = getChosenCareer();
  if (!career?.title) throw new Error("No career chosen yet.");

  let raw = "";
  await new Promise<void>((resolve, reject) => {
    streamKokoChat({
      messages: [],
      intent: "roadmap",
      mission: {
        career: career.title,
        userName: profile?.firstName,
        userAge: typeof profile?.age === "number" ? profile.age : undefined,
        educationLevel: profile?.educationLevel || undefined,
      },
      onDelta: (c) => {
        raw += c;
        opts?.onDelta?.(raw);
      },
      onDone: () => resolve(),
      onError: (e) => reject(e),
    });
  });

  const parsed = extractJson(raw);
  if (!parsed) throw new Error("Koko returned an invalid roadmap. Please try again.");

  const { data: u } = await supabase.auth.getUser();
  if (u.user) {
    await supabase.from("koko_roadmaps").upsert(
      {
        user_id: u.user.id,
        career: career.title,
        roadmap_json: parsed as unknown as Record<string, unknown>,
      },
      { onConflict: "user_id,career" },
    );
  }
  return parsed;
}
