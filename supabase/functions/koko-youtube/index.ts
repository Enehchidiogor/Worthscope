// Koko — Real-time educational video discovery via YouTube Data API v3.
// Returns 3 high-quality short videos for a given mission/topic.
// Applies a simple Educational Quality Score (EQS): views + channel signals.

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

type SearchItem = {
  id: { videoId: string };
  snippet: {
    title: string;
    description: string;
    channelTitle: string;
    thumbnails: { medium?: { url: string }; high?: { url: string } };
    publishedAt: string;
  };
};

type StatsItem = {
  id: string;
  statistics: { viewCount?: string; likeCount?: string };
  contentDetails: { duration: string };
};

// ISO8601 → seconds (PT#H#M#S)
const isoToSeconds = (iso: string): number => {
  const m = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!m) return 0;
  return (+(m[1] || 0)) * 3600 + (+(m[2] || 0)) * 60 + (+(m[3] || 0));
};

const fmtDuration = (sec: number): string => {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const YOUTUBE_API_KEY = Deno.env.get("YOUTUBE_API_KEY");
    if (!YOUTUBE_API_KEY) {
      return new Response(JSON.stringify({ error: "YOUTUBE_API_KEY not configured" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { query, max = 3 } = await req.json();
    if (!query || typeof query !== "string") {
      return new Response(JSON.stringify({ error: "query is required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 1. Search — short videos, English, by relevance
    const searchUrl = new URL("https://www.googleapis.com/youtube/v3/search");
    searchUrl.searchParams.set("part", "snippet");
    searchUrl.searchParams.set("q", `${query} tutorial`);
    searchUrl.searchParams.set("type", "video");
    searchUrl.searchParams.set("videoDuration", "short");
    searchUrl.searchParams.set("relevanceLanguage", "en");
    searchUrl.searchParams.set("safeSearch", "strict");
    searchUrl.searchParams.set("maxResults", "10");
    searchUrl.searchParams.set("key", YOUTUBE_API_KEY);

    const searchRes = await fetch(searchUrl.toString());
    if (!searchRes.ok) {
      const t = await searchRes.text();
      console.error("YT search failed", searchRes.status, t);
      return new Response(JSON.stringify({ error: "YouTube search failed", detail: t }), {
        status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const searchJson = await searchRes.json();
    const items: SearchItem[] = searchJson.items || [];
    if (items.length === 0) {
      return new Response(JSON.stringify({ videos: [] }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 2. Stats lookup for EQS ranking
    const ids = items.map((i) => i.id.videoId).filter(Boolean);
    const statsUrl = new URL("https://www.googleapis.com/youtube/v3/videos");
    statsUrl.searchParams.set("part", "statistics,contentDetails");
    statsUrl.searchParams.set("id", ids.join(","));
    statsUrl.searchParams.set("key", YOUTUBE_API_KEY);

    const statsRes = await fetch(statsUrl.toString());
    const statsJson = await statsRes.json();
    const stats: Record<string, StatsItem> = {};
    for (const s of (statsJson.items || []) as StatsItem[]) stats[s.id] = s;

    // 3. EQS scoring: prefer >10k views, decent like ratio, 2–15 min duration
    const scored = items.map((it) => {
      const s = stats[it.id.videoId];
      const views = +(s?.statistics.viewCount || 0);
      const likes = +(s?.statistics.likeCount || 0);
      const dur = isoToSeconds(s?.contentDetails.duration || "PT0S");
      let score = Math.log10(views + 1) * 10;
      if (likes > 0 && views > 0) score += (likes / views) * 1000;
      if (dur >= 120 && dur <= 900) score += 15; // 2-15 min sweet spot
      if (dur < 60) score -= 10; // too short
      return {
        videoId: it.id.videoId,
        title: it.snippet.title,
        channel: it.snippet.channelTitle,
        thumbnail: it.snippet.thumbnails.high?.url || it.snippet.thumbnails.medium?.url || "",
        duration: fmtDuration(dur),
        durationSec: dur,
        views,
        score,
      };
    });
    scored.sort((a, b) => b.score - a.score);

    return new Response(JSON.stringify({ videos: scored.slice(0, max) }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("koko-youtube error", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "unknown" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
