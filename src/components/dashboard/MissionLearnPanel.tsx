import { useEffect, useRef, useState } from "react";
import { streamKokoChat, fetchKokoVideos, type KokoMsg, type KokoVideo } from "@/lib/kokoClient";
import {
  getProfile,
  getChosenCareer,
  getSavedLesson,
  saveLesson,
  isLessonComplete,
  markLessonComplete,
} from "@/lib/userState";

type Props = {
  missionId: string;
  missionTitle: string;
  missionDescription: string;
};

type QA = { role: "koko" | "user"; text: string };

const ERR = "Koko is having a moment — please try again shortly.";

/* Very small markdown-ish renderer: bold (**x**) + bullets (- ).
   The lesson prompt forces a known structure so this is enough. */
function renderLesson(raw: string) {
  const lines = raw.split("\n").map((l) => l.trimEnd());
  let hook = "";
  const out: { type: "p" | "ul" | "hook"; content: string | string[] }[] = [];
  let bullets: string[] = [];

  const flushBullets = () => {
    if (bullets.length) {
      out.push({ type: "ul", content: bullets });
      bullets = [];
    }
  };

  for (const line of lines) {
    if (!line.trim()) {
      flushBullets();
      continue;
    }
    if (line.startsWith("HOOK:") || line.startsWith("**HOOK:**")) {
      hook = line.replace(/^\**HOOK:\**\s*/i, "").trim();
      continue;
    }
    if (line.startsWith("- ") || line.startsWith("* ")) {
      bullets.push(line.slice(2).trim());
      continue;
    }
    flushBullets();
    out.push({ type: "p", content: line });
  }
  flushBullets();

  const renderInline = (s: string) => {
    const parts = s.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((p, i) =>
      p.startsWith("**") && p.endsWith("**") ? (
        <strong key={i} className="font-semibold text-foreground">
          {p.slice(2, -2)}
        </strong>
      ) : (
        <span key={i}>{p}</span>
      ),
    );
  };

  return (
    <div className="text-[14px] leading-[1.7] text-foreground">
      {hook && (
        <p className="mb-3 text-[16px] font-semibold leading-snug text-accent">
          {renderInline(hook)}
        </p>
      )}
      {out.map((b, i) =>
        b.type === "p" ? (
          <p key={i} className="mb-2.5 text-text2">
            {renderInline(b.content as string)}
          </p>
        ) : (
          <ul key={i} className="my-3 flex flex-col gap-1.5 pl-1">
            {(b.content as string[]).map((li, j) => (
              <li key={j} className="flex gap-2 text-foreground">
                <span aria-hidden className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                <span className="font-medium">{renderInline(li)}</span>
              </li>
            ))}
          </ul>
        ),
      )}
    </div>
  );
}

export const MissionLearnPanel = ({ missionId, missionTitle, missionDescription }: Props) => {
  const profile = getProfile();
  const career = getChosenCareer();
  const missionMeta = {
    title: missionTitle,
    description: missionDescription,
    career: career?.title,
    userName: profile?.firstName,
    userAge: typeof profile?.age === "number" ? profile.age : undefined,
  };

  const [lesson, setLesson] = useState<string>(() => getSavedLesson(missionId) || "");
  const [loadingLesson, setLoadingLesson] = useState(false);
  const [lessonErr, setLessonErr] = useState<string | null>(null);
  const [completed, setCompleted] = useState<boolean>(() => isLessonComplete(missionId));

  const startedRef = useRef(false);

  // Generate lesson once on first mount (if not cached)
  useEffect(() => {
    if (lesson || startedRef.current) return;
    startedRef.current = true;
    setLoadingLesson(true);
    setLessonErr(null);
    let acc = "";
    streamKokoChat({
      messages: [],
      intent: "lesson",
      mission: missionMeta,
      onDelta: (c) => {
        acc += c;
        setLesson(acc);
      },
      onDone: () => {
        setLoadingLesson(false);
        if (acc.trim()) saveLesson(missionId, acc);
        else setLessonErr(ERR);
      },
      onError: () => {
        setLoadingLesson(false);
        setLessonErr(ERR);
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ---------- Q&A ---------- */
  const [qaInput, setQaInput] = useState("");
  const [qaMessages, setQaMessages] = useState<QA[]>([]);
  const [qaThinking, setQaThinking] = useState(false);

  const askKoko = async () => {
    const q = qaInput.trim();
    if (!q || qaThinking) return;
    setQaInput("");
    setQaMessages((m) => [...m, { role: "user", text: q }]);
    setQaThinking(true);

    const history: KokoMsg[] = [
      ...qaMessages.map((m) => ({ role: m.role === "koko" ? "assistant" : "user", content: m.text } as KokoMsg)),
      { role: "user", content: q },
    ];

    let acc = "";
    let started = false;
    await streamKokoChat({
      messages: history,
      intent: "qa",
      mission: missionMeta,
      onDelta: (c) => {
        acc += c;
        if (!started) {
          started = true;
          setQaThinking(false);
          setQaMessages((m) => [...m, { role: "koko", text: acc }]);
        } else {
          setQaMessages((m) => m.map((msg, i) => (i === m.length - 1 ? { ...msg, text: acc } : msg)));
        }
      },
      onDone: () => {
        setQaThinking(false);
        if (!started) setQaMessages((m) => [...m, { role: "koko", text: ERR }]);
      },
      onError: () => {
        setQaThinking(false);
        setQaMessages((m) => [...m, { role: "koko", text: ERR }]);
      },
    });
  };

  const onComplete = () => {
    markLessonComplete(missionId);
    setCompleted(true);
  };

  /* ---------- Subsection 02: Watch & Learn ---------- */
  const [video, setVideo] = useState<KokoVideo | null>(null);
  const [videoLoading, setVideoLoading] = useState(false);
  const videoFetchedRef = useRef(false);

  useEffect(() => {
    if (!completed || videoFetchedRef.current) return;
    videoFetchedRef.current = true;
    setVideoLoading(true);
    fetchKokoVideos(`${missionTitle} ${career?.title || ""} tutorial`, 1)
      .then((vs) => setVideo(vs[0] || null))
      .catch(() => setVideo(null))
      .finally(() => setVideoLoading(false));
  }, [completed, missionTitle, career?.title]);

  return (
    <div className="mt-3 flex flex-col gap-3 border-t border-border pt-4">
      {/* ───── Subsection 01 ───── */}
      <section className="rounded-xl border border-border bg-bg-elevated/60 p-4">
        <header className="mb-3 flex items-center gap-2">
          <span className="text-[11px] font-bold tracking-[1.5px] text-accent">01</span>
          <h4 className="text-[14px] font-semibold text-foreground">Learn with Koko</h4>
        </header>

        {loadingLesson && !lesson && (
          <div className="flex items-center gap-2.5 py-4 text-[13px] text-text2">
            <span className="flex gap-1">
              {[0, 0.15, 0.3].map((d) => (
                <span
                  key={d}
                  className="inline-block h-1.5 w-1.5 rounded-full bg-accent"
                  style={{ animation: `ws-koko-bounce 0.8s ease-in-out ${d}s infinite` }}
                />
              ))}
            </span>
            Koko is preparing your lesson...
          </div>
        )}

        {lessonErr && !lesson && (
          <div className="rounded-lg border border-border bg-card px-3 py-2 text-[13px] text-text2">{lessonErr}</div>
        )}

        {lesson && (
          <>
            {renderLesson(lesson)}
            <div className="mt-3 text-[11px] italic text-text3">Generated by Koko</div>
          </>
        )}

        {/* Q&A */}
        {lesson && !loadingLesson && (
          <div className="mt-5 border-t border-border pt-4">
            <label className="mb-2 block text-[12px] font-semibold text-foreground">
              Ask Koko anything about this topic
            </label>

            {qaMessages.length > 0 && (
              <div className="mb-3 flex flex-col gap-2.5">
                {qaMessages.map((m, i) =>
                  m.role === "koko" ? (
                    <div key={i} className="flex items-start gap-2">
                      <div
                        className="grid h-6 w-6 shrink-0 place-items-center rounded-full text-[10px] font-bold text-white"
                        style={{ background: "linear-gradient(135deg,#895AF6,#a87bff)" }}
                      >
                        K
                      </div>
                      <div className="max-w-[88%] rounded-[0_12px_12px_12px] border border-border bg-card px-3 py-2 text-[13px] leading-[1.6] text-foreground">
                        {m.text}
                      </div>
                    </div>
                  ) : (
                    <div key={i} className="flex justify-end">
                      <div
                        className="max-w-[88%] rounded-[12px_0_12px_12px] px-3 py-2 text-[13px] leading-[1.6] text-white"
                        style={{ background: "#895AF6" }}
                      >
                        {m.text}
                      </div>
                    </div>
                  ),
                )}
                {qaThinking && (
                  <div className="flex items-start gap-2">
                    <div
                      className="grid h-6 w-6 shrink-0 place-items-center rounded-full text-[10px] font-bold text-white"
                      style={{ background: "linear-gradient(135deg,#895AF6,#a87bff)" }}
                    >
                      K
                    </div>
                    <div className="flex items-center gap-1 rounded-[0_12px_12px_12px] border border-border bg-card px-3 py-2.5">
                      {[0, 0.15, 0.3].map((d) => (
                        <span
                          key={d}
                          className="inline-block h-1.5 w-1.5 rounded-full bg-text3"
                          style={{ animation: `ws-koko-bounce 0.8s ease-in-out ${d}s infinite` }}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="flex gap-2">
              <input
                type="text"
                value={qaInput}
                onChange={(e) => setQaInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    askKoko();
                  }
                }}
                placeholder="e.g. Can you explain that in a simpler way?..."
                className="flex-1 rounded-lg border border-border bg-card px-3 py-2 text-[13px] text-foreground placeholder:text-text3 focus:border-accent focus:outline-none"
              />
              <button
                type="button"
                onClick={askKoko}
                disabled={!qaInput.trim() || qaThinking}
                className="rounded-lg px-3.5 py-2 text-[13px] font-semibold text-white transition-opacity disabled:opacity-50"
                style={{ background: "#895AF6" }}
              >
                Ask
              </button>
            </div>
          </div>
        )}

        {/* Mark as complete */}
        {lesson && !loadingLesson && (
          <div className="mt-5 flex justify-end">
            <button
              type="button"
              onClick={onComplete}
              disabled={completed}
              className="rounded-lg px-4 py-2 text-[13px] font-semibold text-white transition-opacity disabled:opacity-60"
              style={{ background: "#895AF6" }}
            >
              {completed ? "✓ Completed" : "Mark as Complete →"}
            </button>
          </div>
        )}
      </section>

      {/* ───── Subsection 02 ───── */}
      <section
        className={[
          "rounded-xl border p-4 transition-opacity",
          completed ? "border-border bg-bg-elevated/60" : "border-border bg-bg-elevated/30 opacity-60",
        ].join(" ")}
      >
        <header className="mb-3 flex items-center gap-2">
          <span className="text-[11px] font-bold tracking-[1.5px] text-accent">02</span>
          <h4 className="text-[14px] font-semibold text-foreground">Watch & Learn</h4>
          {!completed && (
            <span className="ml-auto flex items-center gap-1.5 text-[11px] text-text3">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="4" y="11" width="16" height="10" rx="2" />
                <path d="M8 11V8a4 4 0 0 1 8 0v3" />
              </svg>
              Complete the reading first
            </span>
          )}
        </header>

        {completed ? (
          <>
            <div className="mb-2 text-[13px] font-semibold text-foreground">{missionTitle}</div>
            <div className="relative overflow-hidden rounded-lg border border-border bg-black aspect-video">
              {videoLoading && (
                <div className="absolute inset-0 grid place-items-center text-[12px] text-white/70">
                  Loading video...
                </div>
              )}
              {!videoLoading && video && (
                <iframe
                  src={`https://www.youtube.com/embed/${video.videoId}`}
                  title={video.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="absolute inset-0 h-full w-full"
                />
              )}
              {!videoLoading && !video && (
                <div className="absolute inset-0 grid place-items-center text-[12px] text-white/70">
                  No video available right now.
                </div>
              )}
            </div>
            <p className="mt-3 text-[12px] text-text2">
              Video lessons powered by YouTube — curated to match your learning path
            </p>
            <p className="mt-1 text-[12px] font-medium text-text2">🎬 Watch to reinforce what you just learned</p>
          </>
        ) : (
          <div className="rounded-lg border border-dashed border-border bg-card/40 py-8 text-center text-[12px] text-text3">
            Locked — complete Subsection 01 to unlock
          </div>
        )}
      </section>
    </div>
  );
};
