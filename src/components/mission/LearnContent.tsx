import { useEffect, useState } from "react";
import { IconPlay } from "@/components/dashboard/icons";
import { fetchKokoVideos, type KokoVideo } from "@/lib/kokoClient";

type Props = {
  query: string;
  fallbackTitle?: string;
};

export const LearnContent = ({ query, fallbackTitle }: Props) => {
  const [videos, setVideos] = useState<KokoVideo[]>([]);
  const [active, setActive] = useState<KokoVideo | null>(null);
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    setPlaying(false);
    fetchKokoVideos(query, 3)
      .then((list) => {
        if (cancelled) return;
        setVideos(list);
        setActive(list[0] || null);
      })
      .catch((e) => {
        if (cancelled) return;
        setError(e.message || "Couldn't load videos");
      })
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [query]);

  return (
    <>
      {/* Player */}
      <div className="relative aspect-video overflow-hidden rounded-[14px] border border-border bg-bg-elevated">
        {loading && (
          <div className="absolute inset-0 grid place-items-center text-[13px] text-text2">
            <div className="flex flex-col items-center gap-2">
              <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-accent border-t-transparent" />
              Koko is finding the best video…
            </div>
          </div>
        )}

        {!loading && error && (
          <div className="absolute inset-0 grid place-items-center px-6 text-center text-[13px] text-text2">
            Couldn't load videos right now. {error}
          </div>
        )}

        {!loading && !error && active && playing && (
          <iframe
            className="h-full w-full"
            src={`https://www.youtube.com/embed/${active.videoId}?autoplay=1&rel=0`}
            title={active.title}
            allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        )}

        {!loading && !error && active && !playing && (
          <>
            <img src={active.thumbnail} alt={active.title} className="h-full w-full object-cover" loading="lazy" />
            <button
              type="button"
              onClick={() => setPlaying(true)}
              className="absolute left-1/2 top-1/2 grid h-16 w-16 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-accent text-white shadow-[0_8px_24px_hsl(var(--accent)/0.35)] transition-all duration-200 hover:scale-[1.08] hover:bg-accent-dark"
              aria-label="Play video"
            >
              <IconPlay className="ml-1 h-[22px] w-[22px]" />
            </button>
            <div className="absolute bottom-0 left-0 max-w-[70%] rounded-tr-[14px] bg-black/60 px-3 py-2 text-[13px] font-semibold text-white">
              {active.title}
            </div>
            <div className="absolute bottom-0 right-0 rounded-tl-[14px] bg-black/60 px-3 py-2 text-[12px] font-medium text-white/85">
              {active.duration}
            </div>
          </>
        )}

        {!loading && !error && !active && (
          <div className="absolute inset-0 grid place-items-center text-[13px] text-text2">
            {fallbackTitle || "No videos found."}
          </div>
        )}
      </div>

      {/* Alternate picks */}
      {videos.length > 1 && (
        <div className="mt-4">
          <div className="mb-2 text-[12px] font-semibold uppercase tracking-wide text-text2">
            More from Koko
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {videos.map((v) => (
              <button
                key={v.videoId}
                type="button"
                onClick={() => {
                  setActive(v);
                  setPlaying(false);
                }}
                className={[
                  "group flex-shrink-0 w-[180px] overflow-hidden rounded-[10px] border text-left transition-all",
                  active?.videoId === v.videoId
                    ? "border-accent shadow-[0_0_0_2px_hsl(var(--accent)/0.25)]"
                    : "border-border hover:border-accent/40",
                ].join(" ")}
              >
                <img src={v.thumbnail} alt="" className="h-[100px] w-full object-cover" loading="lazy" />
                <div className="p-2">
                  <div className="line-clamp-2 text-[12px] font-medium text-foreground">{v.title}</div>
                  <div className="mt-1 text-[11px] text-text3">{v.channel} · {v.duration}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );
};
