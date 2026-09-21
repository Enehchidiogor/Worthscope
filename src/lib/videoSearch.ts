/* Finds lesson videos. Uses the koko-youtube edge function when it works (needs
   a YOUTUBE_API_KEY secret on the server); otherwise falls back to public,
   key-less search endpoints (Piped / Invidious). Best-effort: only the search
   text leaves the browser. Returns [] when nothing could be found. */

import { fetchKokoVideos, type KokoVideo } from "@/lib/kokoClient";

const PIPED = ["https://pipedapi.kavin.rocks", "https://pipedapi.adminforge.de", "https://api.piped.private.coffee"];
const INVIDIOUS = ["https://yewtu.be", "https://inv.nadeko.net"];

function fmt(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

async function getJson(url: string, ms = 5000): Promise<unknown> {
  const ctrl = new AbortController();
  const t = window.setTimeout(() => ctrl.abort(), ms);
  try {
    const res = await fetch(url, { signal: ctrl.signal });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } finally {
    window.clearTimeout(t);
  }
}

async function fromPiped(base: string, q: string): Promise<KokoVideo[]> {
  const data = (await getJson(`${base}/search?q=${encodeURIComponent(q)}&filter=videos`)) as { items?: Record<string, unknown>[] };
  const out: KokoVideo[] = [];
  for (const it of data.items ?? []) {
    const id = String(it.url ?? "").match(/[?&]v=([\w-]{11})/)?.[1];
    if (!id) continue;
    const dur = Number(it.duration ?? 0);
    out.push({
      videoId: id,
      title: String(it.title ?? ""),
      channel: String(it.uploaderName ?? ""),
      thumbnail: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
      duration: fmt(dur),
      durationSec: dur,
      views: Number(it.views ?? 0),
      score: 0,
    });
  }
  if (!out.length) throw new Error("empty");
  return out;
}

async function fromInvidious(base: string, q: string): Promise<KokoVideo[]> {
  const data = (await getJson(`${base}/api/v1/search?q=${encodeURIComponent(q)}&type=video`)) as Record<string, unknown>[];
  const out: KokoVideo[] = [];
  for (const it of data ?? []) {
    const id = String(it.videoId ?? "");
    if (!/^[\w-]{11}$/.test(id)) continue;
    const dur = Number(it.lengthSeconds ?? 0);
    out.push({
      videoId: id,
      title: String(it.title ?? ""),
      channel: String(it.author ?? ""),
      thumbnail: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
      duration: fmt(dur),
      durationSec: dur,
      views: Number(it.viewCount ?? 0),
      score: 0,
    });
  }
  if (!out.length) throw new Error("empty");
  return out;
}

/** Prefer 3–20 minute videos with real view counts; drop shorts and marathons. */
function pick(videos: KokoVideo[], max: number): KokoVideo[] {
  const good = videos.filter((v) => v.durationSec >= 120 && v.durationSec <= 1200);
  const pool = good.length >= max ? good : videos.filter((v) => v.durationSec >= 60);
  return [...pool].sort((a, b) => b.views - a.views).slice(0, max);
}

export async function findLessonVideos(query: string, max = 3): Promise<KokoVideo[]> {
  try {
    const vs = await fetchKokoVideos(query, max);
    if (vs.length) return vs;
  } catch {
    // Function missing/unconfigured — use the key-less fallback below.
  }
  try {
    const found = await firstSuccess([
      ...PIPED.map((b) => fromPiped(b, query)),
      ...INVIDIOUS.map((b) => fromInvidious(b, query)),
    ]);
    return pick(found, max);
  } catch {
    return [];
  }
}

/** Resolves with the first promise that succeeds; rejects only if all fail. */
function firstSuccess<T>(promises: Promise<T>[]): Promise<T> {
  return new Promise((resolve, reject) => {
    let failed = 0;
    for (const p of promises) {
      p.then(resolve, () => {
        failed += 1;
        if (failed === promises.length) reject(new Error("all failed"));
      });
    }
  });
}

export function youtubeSearchUrl(query: string): string {
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
}
