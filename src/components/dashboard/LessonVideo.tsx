import { useCallback, useEffect, useRef, useState } from "react";
import type { KokoVideo } from "@/lib/kokoClient";
import { findLessonVideos, youtubeSearchUrl } from "@/lib/videoSearch";

const BLUE = "#3B82F6";
const WATCH_TARGET = 0.7; // share of the video that must actually be played

type Props = {
  missionTitle: string;
  careerTitle?: string;
  watched: boolean;
  onWatched: () => void;
};

export function LessonVideo({ missionTitle, careerTitle, watched, onWatched }: Props) {
  const query = `${missionTitle} ${careerTitle ?? ""} tutorial for beginners`.replace(/\s+/g, " ").trim();
  const [videos, setVideos] = useState<KokoVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState(0);
  const [progress, setProgress] = useState(0);
  const [trackingWorks, setTrackingWorks] = useState(false);
  const [manualReady, setManualReady] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const playedRef = useRef(0);
  const lastRef = useRef<{ t: number; at: number } | null>(null);
  const doneRef = useRef(watched);
  doneRef.current = watched;

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    findLessonVideos(query, 3)
      .then((v) => !cancelled && setVideos(v))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [query]);

  const video = videos[active];

  // Reset per-video tracking when the video changes.
  useEffect(() => {
    playedRef.current = 0;
    lastRef.current = null;
    setProgress(0);
    setTrackingWorks(false);
    setManualReady(false);
    if (!video || doneRef.current) return;
    // If the player never reports progress (blocked), fall back to a timed honesty gate.
    const t = window.setTimeout(() => setManualReady(true), 90000);
    return () => window.clearTimeout(t);
  }, [video?.videoId]);

  // Listen to the YouTube player's own progress messages.
  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      if (!/youtube(-nocookie)?\.com$/.test(new URL(e.origin).hostname)) return;
      if (e.source !== iframeRef.current?.contentWindow) return;
      let data: { event?: string; info?: { currentTime?: number; duration?: number; playerState?: number } };
      try {
        data = typeof e.data === "string" ? JSON.parse(e.data) : e.data;
      } catch {
        return;
      }
      if (data.event !== "infoDelivery" || !data.info) return;
      const { currentTime, duration, playerState } = data.info;
      if (typeof currentTime !== "number" || !duration) return;
      setTrackingWorks(true);
      const now = performance.now();
      const last = lastRef.current;
      if (playerState === 1 && last) {
        const wall = (now - last.at) / 1000;
        const media = currentTime - last.t;
        // Count only real playback (not seeking forward).
        if (media > 0 && media <= wall + 1.5) playedRef.current += media;
      }
      lastRef.current = { t: currentTime, at: now };
      const p = Math.min(1, playedRef.current / duration);
      setProgress(p);
      if (!doneRef.current && (p >= WATCH_TARGET || (playerState === 0 && p >= 0.5))) onWatched();
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [onWatched]);

  const subscribe = useCallback(() => {
    iframeRef.current?.contentWindow?.postMessage(JSON.stringify({ event: "listening", id: 1, channel: "widget" }), "*");
  }, []);

  const pct = Math.round(Math.min(1, progress / WATCH_TARGET) * 100);

  return (
    <div>
      {loading && (
        <div className="grid aspect-video place-items-center rounded-lg border border-border bg-black text-[12px] text-white/70">
          Koko is finding the best video for this lesson…
        </div>
      )}

      {!loading && video && (
        <>
          <div className="relative aspect-video overflow-hidden rounded-lg border border-border bg-black">
            <iframe
              ref={iframeRef}
              key={video.videoId}
              onLoad={subscribe}
              src={`https://www.youtube.com/embed/${video.videoId}?enablejsapi=1&rel=0&modestbranding=1&origin=${encodeURIComponent(window.location.origin)}`}
              title={video.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="absolute inset-0 h-full w-full"
            />
          </div>
          <div className="mt-3 flex flex-col gap-1">
            <div className="line-clamp-2 text-[13px] font-semibold text-foreground">{video.title}</div>
            <div className="flex items-center gap-2 text-[12px] text-text2">
              <span>{video.channel}</span>
              <span aria-hidden>·</span>
              <span>{video.duration}</span>
            </div>
          </div>

          {videos.length > 1 && (
            <div className="mt-3">
              <div className="mb-1.5 text-[11px] font-bold uppercase tracking-wide text-text3">Other recommended videos</div>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {videos.map((v, i) =>
                  i === active ? null : (
                    <button
                      key={v.videoId}
                      type="button"
                      onClick={() => setActive(i)}
                      className="flex items-center gap-2.5 rounded-lg border border-border bg-card p-2 text-left transition-colors hover:border-[#3B82F6]"
                    >
                      <img src={v.thumbnail} alt="" className="h-12 w-20 shrink-0 rounded object-cover" />
                      <span className="min-w-0">
                        <span className="line-clamp-2 block text-[12px] font-medium text-foreground">{v.title}</span>
                        <span className="text-[11px] text-text3">{v.duration}</span>
                      </span>
                    </button>
                  ),
                )}
              </div>
            </div>
          )}

          {!watched && trackingWorks && (
            <div className="mt-4">
              <div className="mb-1 flex justify-between text-[11px] text-text3">
                <span>Watch most of the video to unlock your assignment</span>
                <span>{pct}%</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-border">
                <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: BLUE }} />
              </div>
            </div>
          )}
        </>
      )}

      {!loading && !video && (
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-[13px] text-text2">
            Koko couldn't load a video here right now. Watch one on YouTube, then come back and confirm:
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {[query, `${missionTitle} explained`, `${missionTitle} ${careerTitle ?? ""} step by step`].map((q) => (
              <a
                key={q}
                href={youtubeSearchUrl(q)}
                target="_blank"
                rel="noreferrer"
                onClick={() => window.setTimeout(() => setManualReady(true), 60000)}
                className="rounded-lg border border-border px-3 py-1.5 text-[12px] font-medium text-foreground hover:border-[#3B82F6]"
              >
                Search: {q.length > 34 ? `${q.slice(0, 34)}…` : q} ↗
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Completion: automatic when watched enough; honest manual confirm only if tracking is unavailable. */}
      <div className="mt-4 flex items-center justify-end gap-3">
        {watched ? (
          <span className="rounded-lg px-4 py-2 text-[13px] font-semibold text-white" style={{ background: "#16a34a" }}>
            ✓ Video watched
          </span>
        ) : manualReady && !trackingWorks ? (
          <button type="button" onClick={onWatched} className="rounded-lg px-4 py-2 text-[13px] font-semibold text-white" style={{ background: BLUE }}>
            I watched it — continue →
          </button>
        ) : (
          <span className="text-[12px] text-text3">🔒 Assignment unlocks after you watch</span>
        )}
      </div>
    </div>
  );
}
