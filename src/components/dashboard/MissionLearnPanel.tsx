import { useEffect, useRef, useState } from "react";
import { streamKokoChat, type KokoMsg } from "@/lib/kokoClient";
import { LessonVideo } from "@/components/dashboard/LessonVideo";
import { getProfile, getChosenCareer, markLessonComplete, completeMission } from "@/lib/userState";
import { markRoadmapMissionComplete } from "@/lib/kokoRoadmap";
import { supabase } from "@/integrations/supabase/client";
import { aggregateSignal, type LearningSignal } from "@/lib/learningSignal";
import { loadChatHistory, saveChatMessages } from "@/lib/kokoChatHistory";
import { KokoAvatar } from "@/components/koko/KokoAvatar";

type Props = {
  missionId: string;
  missionTitle: string;
  missionDescription: string;
  onMissionComplete?: () => void;
};

type QA = { role: "koko" | "user"; text: string };

const ERR = "Koko is having a moment — please try again shortly.";
const KOKO_PURPLE = "#3B82F6";

type Assessment = {
  passed: boolean;
  relevance_score: number;
  quality_score: number;
  what_you_did_well: string;
  what_needs_improvement: string;
  one_focus_for_next_attempt: string;
  encouragement: string;
};

// Koko returns the assessment as a JSON object. Parse defensively — strip any
// stray code fences / preamble the model might add despite instructions.
function parseAssessment(raw: string): Assessment | null {
  let s = raw.trim();
  const fence = s.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fence) s = fence[1].trim();
  const start = s.indexOf("{");
  const end = s.lastIndexOf("}");
  if (start === -1 || end === -1) return null;
  try {
    const obj = JSON.parse(s.slice(start, end + 1));
    if (typeof obj?.passed !== "boolean") return null;
    return obj as Assessment;
  } catch {
    return null;
  }
}

/* ---------- Lightweight markdown renderer ---------- */
function renderMarkdown(raw: string) {
  const lines = raw.split("\n").map((l) => l.trimEnd());
  type Block =
    | { type: "hook"; text: string }
    | { type: "h2"; text: string }
    | { type: "h3"; text: string }
    | { type: "p"; text: string }
    | { type: "ul"; items: string[] }
    | { type: "ol"; items: string[] };
  const blocks: Block[] = [];
  let bullets: string[] = [];
  let numbered: string[] = [];

  const flush = () => {
    if (bullets.length) { blocks.push({ type: "ul", items: bullets }); bullets = []; }
    if (numbered.length) { blocks.push({ type: "ol", items: numbered }); numbered = []; }
  };

  for (const raw of lines) {
    const line = raw;
    if (!line.trim()) { flush(); continue; }
    if (/^HOOK:/i.test(line) || /^\*\*HOOK:\*\*/i.test(line)) {
      flush();
      blocks.push({ type: "hook", text: line.replace(/^\**HOOK:\**\s*/i, "").trim() });
      continue;
    }
    if (line.startsWith("### ")) { flush(); blocks.push({ type: "h3", text: line.slice(4).trim() }); continue; }
    if (line.startsWith("## "))  { flush(); blocks.push({ type: "h2", text: line.slice(3).trim() }); continue; }
    if (/^\s*[-*]\s+/.test(line)) { bullets.push(line.replace(/^\s*[-*]\s+/, "").trim()); continue; }
    if (/^\s*\d+\.\s+/.test(line)) { numbered.push(line.replace(/^\s*\d+\.\s+/, "").trim()); continue; }
    flush();
    blocks.push({ type: "p", text: line });
  }
  flush();

  const inline = (s: string) => {
    const parts = s.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((p, i) =>
      p.startsWith("**") && p.endsWith("**") ? (
        <strong key={i} className="font-semibold text-foreground">{p.slice(2, -2)}</strong>
      ) : <span key={i}>{p}</span>
    );
  };

  // Group "How AI helps" h3/h2 + following content into a highlighted block.
  const out: React.ReactNode[] = [];
  let i = 0;
  while (i < blocks.length) {
    const b = blocks[i];
    if (b.type === "hook") {
      out.push(
        <p key={i} className="mb-4 text-[16px] font-semibold leading-snug" style={{ color: KOKO_PURPLE }}>
          {inline(b.text)}
        </p>
      );
      i++;
    } else if ((b.type === "h2" || b.type === "h3") && /how ai helps/i.test(b.text)) {
      // Collect this heading + everything until next h2/h3.
      const group: Block[] = [b];
      i++;
      while (i < blocks.length && blocks[i].type !== "h2" && blocks[i].type !== "h3") {
        group.push(blocks[i]); i++;
      }
      out.push(
        <aside
          key={`ai-${i}`}
          className="my-4 rounded-r-lg p-3.5"
          style={{ borderLeft: `3px solid ${KOKO_PURPLE}`, background: "rgba(59, 130, 246, 0.06)" }}
        >
          <div className="mb-2 text-[12px] font-bold tracking-wide" style={{ color: KOKO_PURPLE }}>
            ✦ {group[0].type === "h2" || group[0].type === "h3" ? group[0].text : "How AI helps"}
          </div>
          {group.slice(1).map((g, j) => renderBlock(g, j, inline))}
        </aside>
      );
    } else {
      out.push(renderBlock(b, i, inline));
      i++;
    }
  }

  return <div className="text-[14px] leading-[1.7] text-foreground">{out}</div>;
}

function renderBlock(
  b: { type: "p" | "h2" | "h3" | "ul" | "ol" | "hook"; text?: string; items?: string[] } | any,
  key: number,
  inline: (s: string) => React.ReactNode,
): React.ReactNode {
  if (b.type === "p")  return <p key={key} className="mb-2.5 text-text2">{inline(b.text)}</p>;
  if (b.type === "h2") return <h3 key={key} className="mt-3 mb-2 text-[15px] font-semibold text-foreground">{inline(b.text)}</h3>;
  if (b.type === "h3") return <h4 key={key} className="mt-3 mb-1.5 text-[13px] font-semibold text-foreground">{inline(b.text)}</h4>;
  if (b.type === "ul") return (
    <ul key={key} className="my-2 flex flex-col gap-1.5 pl-1">
      {b.items.map((li: string, j: number) => (
        <li key={j} className="flex gap-2 text-foreground">
          <span aria-hidden className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: KOKO_PURPLE }} />
          <span className="font-medium">{inline(li)}</span>
        </li>
      ))}
    </ul>
  );
  if (b.type === "ol") return (
    <ol key={key} className="my-2 flex flex-col gap-1.5 pl-5 list-decimal">
      {b.items.map((li: string, j: number) => (
        <li key={j} className="text-foreground"><span className="font-medium">{inline(li)}</span></li>
      ))}
    </ol>
  );
  return null;
}

export const MissionLearnPanel = ({ missionId, missionTitle, missionDescription, onMissionComplete }: Props) => {
  const profile = getProfile();
  const career = getChosenCareer();

  const baseMission = {
    title: missionTitle,
    description: missionDescription,
    career: career?.title,
    userName: profile?.firstName,
    userAge: typeof profile?.age === "number" ? profile.age : undefined,
    educationLevel: profile?.educationLevel || undefined,
  };

  const [lesson, setLesson] = useState<string>("");
  const [loadingLesson, setLoadingLesson] = useState(true);
  const [lessonErr, setLessonErr] = useState<string | null>(null);
  const [completed, setCompleted] = useState<boolean>(false);
  const [hydrated, setHydrated] = useState(false);

  const startedRef = useRef(false);

  // 1. Hydrate from DB on mount.
  useEffect(() => {
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) { setHydrated(true); setLoadingLesson(false); return; }
      const { data: row } = await supabase
        .from("mission_lessons")
        .select("lesson_md, completed_at")
        .eq("user_id", u.user.id)
        .eq("mission_id", missionId)
        .maybeSingle();
      if (row?.lesson_md) {
        setLesson(row.lesson_md);
        setLoadingLesson(false);
      }
      if (row?.completed_at) setCompleted(true);
      setHydrated(true);
    })();
  }, [missionId]);

  // 2. Generate lesson once if not cached.
  useEffect(() => {
    if (!hydrated || lesson || startedRef.current) return;
    startedRef.current = true;
    setLoadingLesson(true);
    setLessonErr(null);
    let acc = "";
    streamKokoChat({
      messages: [],
      intent: "lesson",
      mission: baseMission,
      onDelta: (c) => { acc += c; setLesson(acc); },
      onDone: async () => {
        setLoadingLesson(false);
        if (!acc.trim()) { setLessonErr(ERR); return; }
        const { data: u } = await supabase.auth.getUser();
        if (u.user) {
          await supabase.from("mission_lessons").upsert({
            user_id: u.user.id,
            mission_id: missionId,
            mission_title: missionTitle,
            lesson_md: acc,
          }, { onConflict: "user_id,mission_id" });
        }
      },
      onError: () => { setLoadingLesson(false); setLessonErr(ERR); },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated]);

  /* ---------- Q&A + learning signal ---------- */
  const [qaInput, setQaInput] = useState("");
  const [qaMessages, setQaMessages] = useState<QA[]>([]);
  const [qaThinking, setQaThinking] = useState(false);
  const learningSignal: LearningSignal = aggregateSignal(qaMessages);

  // Load persisted Q&A thread for this mission (survives refresh / re-login).
  useEffect(() => {
    let cancelled = false;
    loadChatHistory(`mission:${missionId}`)
      .then((hist) => {
        if (cancelled || hist.length === 0) return;
        setQaMessages(hist.map((m) => ({ role: m.role, text: m.content })));
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [missionId]);

  const askKoko = async () => {
    const q = qaInput.trim();
    if (!q || qaThinking) return;
    setQaInput("");
    const nextMsgs: QA[] = [...qaMessages, { role: "user", text: q }];
    setQaMessages(nextMsgs);
    setQaThinking(true);
    const signal = aggregateSignal(nextMsgs);

    const history: KokoMsg[] = nextMsgs.map((m) => ({
      role: m.role === "koko" ? "assistant" : "user",
      content: m.text,
    } as KokoMsg));

    let acc = "";
    let started = false;
    await streamKokoChat({
      messages: history,
      intent: "qa",
      mission: { ...baseMission, learningSignal: signal },
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
        if (!started) { setQaMessages((m) => [...m, { role: "koko", text: ERR }]); return; }
        // Persist this exchange so the thread survives refresh.
        saveChatMessages(`mission:${missionId}`, [
          { role: "user", content: q },
          { role: "koko", content: acc },
        ]).catch(() => {});
      },
      onError: () => {
        setQaThinking(false);
        setQaMessages((m) => [...m, { role: "koko", text: ERR }]);
      },
    });
  };

  const onComplete = async () => {
    markLessonComplete(missionId);
    setCompleted(true);
    const { data: u } = await supabase.auth.getUser();
    if (u.user) {
      await supabase.from("mission_lessons").upsert({
        user_id: u.user.id,
        mission_id: missionId,
        mission_title: missionTitle,
        lesson_md: lesson,
        completed_at: new Date().toISOString(),
        learning_signal: learningSignal,
      }, { onConflict: "user_id,mission_id" });
    }
  };

  /* ---------- Subsection 02: Watch & Apply ---------- */
  const [videoCompleted, setVideoCompleted] = useState(false);
  const [assignmentCompleted, setAssignmentCompleted] = useState(false);
  const [missionDone, setMissionDone] = useState(false);

  /* ---------- Subsection 03: Real-world project ---------- */
  const [brief, setBrief] = useState<string>("");
  const [briefLoading, setBriefLoading] = useState(false);
  const [briefErr, setBriefErr] = useState<string | null>(null);
  const [submission, setSubmission] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [assessResult, setAssessResult] = useState<Assessment | null>(null);
  const [lastFocus, setLastFocus] = useState("");
  const [attemptCount, setAttemptCount] = useState(0);
  const [assessmentErr, setAssessmentErr] = useState<string | null>(null);
  const projectHydrated = useRef(false);

  useEffect(() => {
    if (!completed || projectHydrated.current) return;
    projectHydrated.current = true;
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return;
      // attempt_count is added by the koko_quality_persistence migration; the
      // generated types don't know it yet (Lovable regenerates on migration).
      const { data: row } = await (supabase as any)
        .from("mission_projects")
        .select("brief_md, submission, assessment_md, attempt_count")
        .eq("user_id", u.user.id)
        .eq("mission_id", missionId)
        .maybeSingle();
      if (row?.brief_md) setBrief(row.brief_md);
      if (row?.submission) setSubmission(row.submission);
      if (row?.assessment_md) {
        const prev = parseAssessment(row.assessment_md);
        setAssessResult(prev);
        if (prev && !prev.passed) setLastFocus(prev.one_focus_for_next_attempt || "");
      }
      if (typeof row?.attempt_count === "number") setAttemptCount(row.attempt_count);
    })();
  }, [completed, missionId]);

  const generateBrief = async () => {
    if (briefLoading) return;
    setBriefLoading(true);
    setBriefErr(null);
    setBrief("");
    let acc = "";
    await streamKokoChat({
      messages: [],
      intent: "project",
      mission: { ...baseMission, learningSignal },
      onDelta: (c) => { acc += c; setBrief(acc); },
      onDone: async () => {
        setBriefLoading(false);
        if (!acc.trim()) { setBriefErr(ERR); return; }
        const { data: u } = await supabase.auth.getUser();
        if (u.user) {
          await supabase.from("mission_projects").upsert({
            user_id: u.user.id,
            mission_id: missionId,
            brief_md: acc,
          }, { onConflict: "user_id,mission_id" });
        }
      },
      onError: () => { setBriefLoading(false); setBriefErr(ERR); },
    });
  };

  const submitProject = async () => {
    const text = submission.trim();
    if (!text || submitting) return;
    setSubmitting(true);
    setAssessmentErr(null);
    setAssessResult(null);
    const nextAttempt = attemptCount + 1;
    let acc = "";
    await streamKokoChat({
      messages: [],
      intent: "assess",
      mission: { ...baseMission, learningSignal, attempts: attemptCount },
      brief,
      submission: text,
      onDelta: (c) => { acc += c; },
      onDone: async () => {
        setSubmitting(false);
        const parsed = parseAssessment(acc);
        if (!parsed) { setAssessmentErr(ERR); return; }
        setAssessResult(parsed);
        setLastFocus(parsed.passed ? "" : parsed.one_focus_for_next_attempt || "");
        setAttemptCount(nextAttempt);
        const { data: u } = await supabase.auth.getUser();
        if (u.user) {
          // attempt_count / mission status added by migration (untyped here).
          await (supabase as any).from("mission_projects").upsert({
            user_id: u.user.id,
            mission_id: missionId,
            brief_md: brief,
            submission: text,
            assessment_md: acc,
            submitted_at: new Date().toISOString(),
            attempt_count: nextAttempt,
          }, { onConflict: "user_id,mission_id" });
          await (supabase as any).from("mission_lessons")
            .update({ status: "in_progress" })
            .eq("user_id", u.user.id).eq("mission_id", missionId);
        }
      },
      onError: () => { setSubmitting(false); setAssessmentErr(ERR); },
    });
  };

  return (
    <div className="mt-3 flex flex-col gap-3 border-t border-border pt-4">
      {/* ───── Subsection 01 ───── */}
      <section className="rounded-xl border border-border bg-bg-elevated/60 p-4">
        <header className="mb-3 flex items-center gap-2">
          <span className="text-[11px] font-bold tracking-[1.5px]" style={{ color: KOKO_PURPLE }}>01</span>
          <h4 className="text-[14px] font-semibold text-foreground">Learn with Koko</h4>
        </header>

        {loadingLesson && !lesson && (
          <div className="flex items-center gap-2.5 py-4 text-[13px] text-text2">
            <span className="flex gap-1">
              {[0, 0.15, 0.3].map((d) => (
                <span key={d} className="inline-block h-1.5 w-1.5 rounded-full"
                  style={{ background: KOKO_PURPLE, animation: `ws-koko-bounce 0.8s ease-in-out ${d}s infinite` }} />
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
            {renderMarkdown(lesson)}
            <div className="mt-3 text-[11px] italic text-text3">Generated by Koko ✦</div>
          </>
        )}

        {/* Q&A */}
        {lesson && !loadingLesson && (
          <div className="mt-5 border-t border-border pt-4">
            <label className="mb-2 block text-[12px] font-semibold text-foreground">
              Answer the Quick Check here, or ask your coach anything
            </label>

            {qaMessages.length > 0 && (
              <div className="mb-3 flex flex-col gap-2.5">
                {qaMessages.map((m, i) =>
                  m.role === "koko" ? (
                    <div key={i} className="flex items-start gap-2">
                      <KokoAvatar size={24} />
                      <div className="max-w-[88%] rounded-[0_12px_12px_12px] border border-border bg-card px-3 py-2 text-[13px] leading-[1.6] text-foreground whitespace-pre-wrap">
                        {m.text}
                      </div>
                    </div>
                  ) : (
                    <div key={i} className="flex justify-end">
                      <div className="max-w-[88%] rounded-[12px_0_12px_12px] px-3 py-2 text-[13px] leading-[1.6] text-white"
                        style={{ background: KOKO_PURPLE }}>{m.text}</div>
                    </div>
                  ),
                )}
                {qaThinking && (
                  <div className="flex items-start gap-2">
                    <KokoAvatar size={24} />
                    <div className="flex items-center gap-1 rounded-[0_12px_12px_12px] border border-border bg-card px-3 py-2.5">
                      {[0, 0.15, 0.3].map((d) => (
                        <span key={d} className="inline-block h-1.5 w-1.5 rounded-full bg-text3"
                          style={{ animation: `ws-koko-bounce 0.8s ease-in-out ${d}s infinite` }} />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="flex gap-2">
              <input type="text" value={qaInput} onChange={(e) => setQaInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); askKoko(); } }}
                placeholder="e.g. Can you explain that in a simpler way?..."
                className="flex-1 rounded-lg border border-border bg-card px-3 py-2 text-[13px] text-foreground placeholder:text-text3 focus:outline-none"
                style={{ borderColor: undefined }} />
              <button type="button" onClick={askKoko} disabled={!qaInput.trim() || qaThinking}
                className="rounded-lg px-3.5 py-2 text-[13px] font-semibold text-white transition-opacity disabled:opacity-50"
                style={{ background: KOKO_PURPLE }}>Ask</button>
            </div>
          </div>
        )}

        {lesson && !loadingLesson && (
          <div className="mt-5 flex justify-end">
            <button type="button" onClick={onComplete} disabled={completed}
              className="rounded-lg px-4 py-2 text-[13px] font-semibold text-white transition-opacity disabled:opacity-60"
              style={{ background: KOKO_PURPLE }}>
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
          <span className="text-[11px] font-bold tracking-[1.5px]" style={{ color: KOKO_PURPLE }}>02</span>
          <h4 className="text-[14px] font-semibold text-foreground">Watch & Apply</h4>
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
            <div className="mb-3 rounded-lg p-3" style={{ background: "rgba(59, 130, 246, 0.06)", borderLeft: `3px solid ${KOKO_PURPLE}` }}>
              <div className="text-[11px] font-bold tracking-wide mb-1" style={{ color: KOKO_PURPLE }}>
                ✦ COACH'S NOTE
              </div>
              <p className="text-[12px] text-foreground leading-snug">
                Watch with a purpose: see {missionTitle.toLowerCase()} in action, pause when something clicks, and note one thing you could try yourself. Your assignment unlocks once you've watched most of it.
              </p>
            </div>

            <LessonVideo
              missionTitle={missionTitle}
              careerTitle={career?.title}
              watched={videoCompleted}
              onWatched={() => setVideoCompleted(true)}
            />
          </>
        ) : (
          <div className="rounded-lg border border-dashed border-border bg-card/40 py-8 text-center text-[12px] text-text3">
            Locked — complete Subsection 01 to unlock
          </div>
        )}
      </section>

      {/* ───── Subsection 03: Assignment ───── */}
      <AssignmentSection
        unlocked={videoCompleted}
        brief={brief}
        briefLoading={briefLoading}
        briefErr={briefErr}
        onGenerate={generateBrief}
        completed={assignmentCompleted}
        onComplete={() => setAssignmentCompleted(true)}
      />

      {/* ───── Subsection 04: Submission ───── */}
      <SubmissionSection
        unlocked={assignmentCompleted}
        submission={submission}
        setSubmission={setSubmission}
        submitting={submitting}
        assessResult={assessResult}
        attemptCount={attemptCount}
        lastFocus={lastFocus}
        assessmentErr={assessmentErr}
        onSubmit={submitProject}
        onTryAgain={() => setAssessResult(null)}
        missionDone={missionDone}
        onFinalize={async () => {
          // A mission can only be completed with a passing review — never otherwise.
          if (missionDone || assessResult?.passed !== true) return;
          setMissionDone(true);
          const { data: u } = await supabase.auth.getUser();
          if (u.user) {
            await (supabase as any).from("mission_lessons")
              .update({ status: "completed" })
              .eq("user_id", u.user.id).eq("mission_id", missionId);
          }
          markRoadmapMissionComplete(missionId);
          completeMission();
          onMissionComplete?.();
        }}
      />

      <style>{`
        @keyframes ws-koko-bounce {
          0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
          40% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

/* ───── Stage 3 — Assignment ───── */
function AssignmentSection({
  unlocked, brief, briefLoading, briefErr, onGenerate, completed, onComplete,
}: {
  unlocked: boolean;
  brief: string;
  briefLoading: boolean;
  briefErr: string | null;
  onGenerate: () => void;
  completed: boolean;
  onComplete: () => void;
}) {
  useEffect(() => {
    if (unlocked && !brief && !briefLoading && !briefErr) onGenerate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unlocked]);

  return (
    <section className={["rounded-xl border p-4 transition-opacity",
      unlocked ? "border-border bg-bg-elevated/60" : "border-border bg-bg-elevated/30 opacity-60"].join(" ")}>
      <header className="mb-3 flex items-center gap-2">
        <span className="text-[11px] font-bold tracking-[1.5px]" style={{ color: KOKO_PURPLE }}>03</span>
        <h4 className="text-[14px] font-semibold text-foreground">Assignment</h4>
        {!unlocked && (
          <span className="ml-auto text-[11px] text-text3">🔒 Watch the video first</span>
        )}
      </header>

      {!unlocked ? (
        <div className="rounded-lg border border-dashed border-border bg-card/40 py-8 text-center text-[12px] text-text3">
          Locked — complete Subsection 02 to unlock
        </div>
      ) : (
        <>
          {briefLoading && !brief && (
            <div className="py-4 text-[13px] text-text2">Koko is preparing your assignment…</div>
          )}
          {briefErr && !brief && (
            <div className="rounded-lg border border-border bg-card px-3 py-2 text-[13px] text-text2">{briefErr}</div>
          )}
          {brief && renderMarkdown(brief)}

          {brief && (
            <div className="mt-4 flex justify-end">
              <button type="button" onClick={onComplete} disabled={completed}
                className="rounded-lg px-4 py-2 text-[13px] font-semibold text-white transition-opacity disabled:opacity-60"
                style={{ background: KOKO_PURPLE }}>
                {completed ? "✓ Assignment Acknowledged" : "I'm ready to submit →"}
              </button>
            </div>
          )}
        </>
      )}
    </section>
  );
}

/* ───── Stage 4 — Submission ───── */
function SubmissionSection({
  unlocked, submission, setSubmission, submitting, assessResult, attemptCount, lastFocus,
  assessmentErr, onSubmit, onTryAgain, missionDone, onFinalize,
}: {
  unlocked: boolean;
  submission: string;
  setSubmission: (s: string) => void;
  submitting: boolean;
  assessResult: Assessment | null;
  attemptCount: number;
  lastFocus: string;
  assessmentErr: string | null;
  onSubmit: () => void;
  onTryAgain: () => void;
  missionDone: boolean;
  onFinalize: () => void;
}) {
  const passed = assessResult?.passed === true;

  return (
    <section className={["rounded-xl border p-4 transition-opacity",
      unlocked ? "border-border bg-bg-elevated/60" : "border-border bg-bg-elevated/30 opacity-60"].join(" ")}>
      <header className="mb-3 flex items-center gap-2">
        <span className="text-[11px] font-bold tracking-[1.5px]" style={{ color: KOKO_PURPLE }}>04</span>
        <h4 className="text-[14px] font-semibold text-foreground">Submission</h4>
        {!unlocked && (
          <span className="ml-auto text-[11px] text-text3">🔒 Finish the assignment first</span>
        )}
      </header>

      {!unlocked ? (
        <div className="rounded-lg border border-dashed border-border bg-card/40 py-8 text-center text-[12px] text-text3">
          Locked — complete Subsection 03 to unlock
        </div>
      ) : (
        <>
          {/* Submission form — hidden while a result is being shown */}
          {!assessResult && (
            <>
              <label className="mb-2 block text-[12px] font-semibold text-foreground">
                Paste a link or describe what you built
              </label>
              <textarea
                value={submission}
                onChange={(e) => setSubmission(e.target.value)}
                placeholder="Share a link to your work, or describe what you did and what you learned…"
                rows={5}
                className="w-full rounded-lg border border-border bg-card px-3 py-2 text-[13px] text-foreground placeholder:text-text3 focus:outline-none"
              />
              <div className="mt-3 flex justify-end">
                <button type="button" onClick={onSubmit} disabled={submitting || !submission.trim()}
                  className="rounded-lg px-4 py-2 text-[13px] font-semibold text-white transition-opacity disabled:opacity-50"
                  style={{ background: KOKO_PURPLE }}>
                  {submitting ? "Koko is reviewing…" : attemptCount > 0 ? "Resubmit for review" : "Submit for Koko's review"}
                </button>
              </div>
              {assessmentErr && (
                <div className="mt-3 rounded-lg border border-border bg-card px-3 py-2 text-[13px] text-text2">{assessmentErr}</div>
              )}
            </>
          )}

          {/* Structured assessment result */}
          {assessResult && (
            <div className="mt-1">
              <AssessmentFeedback a={assessResult} />
              {passed ? (
                <div className="mt-4 flex justify-end">
                  <button type="button" onClick={onFinalize} disabled={missionDone}
                    className="rounded-lg px-4 py-2 text-[13px] font-semibold text-white transition-opacity disabled:opacity-60"
                    style={{ background: missionDone ? "#16a34a" : KOKO_PURPLE }}>
                    {missionDone ? "🎉 Mission Completed" : "Continue to next mission →"}
                  </button>
                </div>
              ) : (
                <div className="mt-4 rounded-xl border p-4" style={{ borderColor: "rgba(59,130,246,0.45)", background: "rgba(59,130,246,0.07)" }}>
                  <div className="text-[12px] font-bold tracking-wide" style={{ color: KOKO_PURPLE }}>✦ YOUR COACH SAYS</div>
                  <p className="mt-1.5 text-[13px] leading-[1.6] text-foreground">
                    This one needs a redo before you can move on — that's how real skills get built, and every attempt gets you closer. Read the feedback above, fix the one thing I flagged, and send it again. If you're stuck, ask me in the lesson chat above.
                  </p>
                  <div className="mt-3 flex justify-end">
                    <button type="button" onClick={onTryAgain}
                      className="rounded-lg px-4 py-2 text-[13px] font-semibold text-white"
                      style={{ background: KOKO_PURPLE }}>
                      Redo the project →
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

        </>
      )}
    </section>
  );
}

/* Structured feedback card — green when passed, neutral (never alarming red) when not. */
function AssessmentFeedback({ a }: { a: Assessment }) {
  const ok = a.passed;
  const accent = ok ? "#16a34a" : "#6B7280";
  return (
    <div className="rounded-xl border p-4" style={{ borderColor: ok ? "#16a34a" : "#D1D5DB", background: ok ? "rgba(22,163,74,0.06)" : "rgba(107,114,128,0.06)" }}>
      <div className="mb-3 flex items-center gap-2">
        <span className="text-[12px] font-bold tracking-wide" style={{ color: accent }}>
          {ok ? "✓ PASSED" : "NOT PASSED YET"}
        </span>
        <span className="ml-auto text-[11px] text-text3">
          Relevance {a.relevance_score} · Quality {a.quality_score}
        </span>
      </div>
      {a.what_you_did_well && <FeedbackBlock label="What you did well" text={a.what_you_did_well} />}
      {a.what_needs_improvement && <FeedbackBlock label="What needs improvement" text={a.what_needs_improvement} />}
      {a.one_focus_for_next_attempt && <FeedbackBlock label="Focus on this next" text={a.one_focus_for_next_attempt} />}
      {a.encouragement && <p className="mt-2 text-[13px] italic text-text2">{a.encouragement}</p>}
    </div>
  );
}

function FeedbackBlock({ label, text }: { label: string; text: string }) {
  return (
    <div className="mb-2.5">
      <div className="text-[12px] font-semibold text-foreground">{label}</div>
      <p className="mt-0.5 whitespace-pre-wrap text-[13px] leading-[1.6] text-text2">{text}</p>
    </div>
  );
}
