import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { generateCareerResults, type Answers } from "@/lib/recommendationEngine";

/* WorthScope — Career Assessment (10 questions + branching).
   Pure CSS animations, Poppins, single accent #3498DB. */

const ACCENT = "#3498DB";
const ACCENT_DARK = "#217DBB";
const ACCENT_LIGHT = "#EBF5FB";
const BG = "#F4F9FE";
const BORDER = "#E5E7EB";
const TEXT = "#111111";
const TEXT2 = "#6B7280";
const TEXT3 = "#9CA3AF";

type ScreenId =
  | "welcome" | "q1" | "q2" | "q3" | "q4" | "q5" | "q6" | "q7"
  | "q8" | "q9" | "q10" | "analyzing";

const initialAnswers: Answers = {
  ageRange: null,
  educationLevel: null,
  strongSubjects: [],
  interests: [],
  activities: [],
  personality: null,
  careerClarity: null,
  schoolClass: null,
  skillsStarted: null,
  uniLevel: null,
  courseAlignment: null,
  goalOrConcern: "",
};

type Option = { emoji?: string; label: string };

const opts = (arr: string[]): Option[] =>
  arr.map((s) => {
    const m = s.match(/^(\p{Emoji_Presentation}|\p{Extended_Pictographic})\s+(.*)$/u);
    return m ? { emoji: m[1], label: m[2] } : { label: s };
  });

const Q1_OPTS = opts(["13–15", "16–18", "19–21", "22–25", "26+"]);
const Q2_OPTS = opts(["🎒 Secondary School", "🎓 University"]);
const Q3_OPTS = opts([
  "📐 Mathematics",
  "🔬 Sciences (Physics, Chemistry, Biology)",
  "💼 Business / Economics",
  "🎨 Arts / Literature",
  "💻 Technology / ICT",
  "🌍 Social Sciences",
]);
const Q4_OPTS = opts([
  "💻 Technology",
  "🚀 Business / Entrepreneurship",
  "🎨 Creative Arts / Design",
  "🔭 Science / Research",
  "🤝 Helping People",
  "📢 Communication / Media",
]);
const Q5_OPTS = opts([
  "🧩 Solving problems",
  "✏️ Creating or designing things",
  "👥 Leading or organizing people",
  "📖 Learning new concepts",
  "🤝 Working with others",
  "🎯 Working independently",
]);
const Q6_OPTS = opts([
  "🧠 Logical and analytical",
  "🎨 Creative and expressive",
  "💬 Social and outgoing",
  "👁️ Quiet and observant",
  "🔧 Practical and hands-on",
  "🔭 Curious and exploratory",
]);
const Q7_OPTS = opts([
  "✅ Very clear", "🔄 Somewhat clear", "🤔 Not sure", "😶 Completely confused",
]);
const Q8_SEC = opts(["📚 SS1", "📚 SS2", "📚 SS3"]);
const Q9_SEC = opts([
  "✅ Yes, actively learning",
  "🔄 I've tried a few things",
  "💭 I haven't started yet",
  "❓ I don't know what to start",
]);
const Q8_UNI = opts(["📗 100 Level", "📘 200 Level", "📙 300 Level", "📕 400 Level", "🎓 Graduate"]);
const Q9_UNI = opts([
  "✅ Yes, completely",
  "🔄 Somewhat",
  "❌ Not really",
  "🚫 Not at all",
  "🤷 I'm not sure",
]);

/* ----- helpers ----- */
const stripEmoji = (label: string, emoji?: string) => (emoji ? label : label);
const fullLabel = (o: Option) => (o.emoji ? `${o.emoji} ${o.label}` : o.label);

export default function Assessment() {
  const navigate = useNavigate();
  const [screen, setScreen] = useState<ScreenId>("welcome");
  const [direction, setDirection] = useState<"forward" | "back">("forward");
  const [answers, setAnswers] = useState<Answers>(initialAnswers);
  const [transitioning, setTransitioning] = useState(false);
  const [maxToast, setMaxToast] = useState<string | null>(null);

  // Step ordering for branching
  const flow = useMemo<ScreenId[]>(
    () => ["q1", "q2", "q3", "q4", "q5", "q6", "q7", "q8", "q9", "q10"],
    []
  );

  const currentStep = flow.indexOf(screen as any) + 1; // 1..10
  const progressPct = currentStep > 0 ? (currentStep / 10) * 100 : 0;

  function go(next: ScreenId, dir: "forward" | "back" = "forward") {
    if (transitioning) return;
    setDirection(dir);
    setTransitioning(true);
    window.setTimeout(() => {
      setScreen(next);
      setTransitioning(false);
    }, 250);
  }

  function nextOf(s: ScreenId): ScreenId {
    const idx = flow.indexOf(s as any);
    if (idx === -1 || idx === flow.length - 1) return "analyzing";
    return flow[idx + 1];
  }
  function prevOf(s: ScreenId): ScreenId {
    const idx = flow.indexOf(s as any);
    if (idx <= 0) return "welcome";
    return flow[idx - 1];
  }

  function autoAdvance(s: ScreenId) {
    window.setTimeout(() => go(nextOf(s), "forward"), 380);
  }

  function showMaxToast(msg: string) {
    setMaxToast(msg);
    window.setTimeout(() => setMaxToast(null), 2000);
  }

  // --- single-select option render ---
  const SingleOption = ({
    option, selected, onSelect,
  }: { option: Option; selected: boolean; onSelect: () => void }) => (
    <button
      onClick={onSelect}
      className="ws-opt"
      data-selected={selected}
      style={optStyle(selected)}
    >
      {option.emoji && <span style={{ fontSize: 20 }}>{option.emoji}</span>}
      <span style={{ flex: 1, textAlign: "left" }}>{option.label}</span>
      {selected && (
        <span style={checkStyle} aria-hidden>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </span>
      )}
    </button>
  );

  /* ---------------- screens ---------------- */
  const screens: Record<ScreenId, React.ReactNode> = {
    welcome: <Welcome onStart={() => go("q1", "forward")} />,
    q1: (
      <QuestionScreen
        tag="STEP 1 OF 10  ·  YOUR PROFILE"
        title="How old are you?"
      >
        {Q1_OPTS.map((o) => (
          <SingleOption
            key={o.label}
            option={o}
            selected={answers.ageRange === o.label}
            onSelect={() => {
              setAnswers((p) => ({ ...p, ageRange: o.label }));
              autoAdvance("q1");
            }}
          />
        ))}
      </QuestionScreen>
    ),
    q2: (
      <QuestionScreen
        tag="STEP 2 OF 10  ·  YOUR PROFILE"
        title="What's your current education level?"
        sub="This helps us personalise your experience"
      >
        {Q2_OPTS.map((o) => {
          const v = o.label.includes("Secondary") ? "secondary" : "university";
          return (
            <SingleOption
              key={o.label}
              option={o}
              selected={answers.educationLevel === v}
              onSelect={() => {
                setAnswers((p) => ({ ...p, educationLevel: v as any }));
                autoAdvance("q2");
              }}
            />
          );
        })}
      </QuestionScreen>
    ),
    q3: (
      <MultiQuestion
        tag="STEP 3 OF 10  ·  CORE ASSESSMENT"
        title="Which subjects are you strongest in?"
        sub="Select up to 3"
        options={Q3_OPTS}
        selected={answers.strongSubjects}
        max={3}
        onChange={(arr) => setAnswers((p) => ({ ...p, strongSubjects: arr }))}
        onMaxHit={() => showMaxToast("Max 3 selected")}
        onContinue={() => go(nextOf("q3"))}
      />
    ),
    q4: (
      <MultiQuestion
        tag="STEP 4 OF 10  ·  CORE ASSESSMENT"
        title="What are you most interested in?"
        sub="Select up to 3"
        options={Q4_OPTS}
        selected={answers.interests}
        max={3}
        onChange={(arr) => setAnswers((p) => ({ ...p, interests: arr }))}
        onMaxHit={() => showMaxToast("Max 3 selected")}
        onContinue={() => go(nextOf("q4"))}
      />
    ),
    q5: (
      <MultiQuestion
        tag="STEP 5 OF 10  ·  CORE ASSESSMENT"
        title="Which activities do you enjoy the most?"
        sub="Select all that apply"
        options={Q5_OPTS}
        selected={answers.activities}
        max={Infinity}
        onChange={(arr) => setAnswers((p) => ({ ...p, activities: arr }))}
        onMaxHit={() => {}}
        onContinue={() => go(nextOf("q5"))}
      />
    ),
    q6: (
      <QuestionScreen tag="STEP 6 OF 10  ·  CORE ASSESSMENT" title="Which best describes your personality?">
        {Q6_OPTS.map((o) => (
          <SingleOption
            key={o.label}
            option={o}
            selected={answers.personality === o.label}
            onSelect={() => {
              setAnswers((p) => ({ ...p, personality: o.label }));
              autoAdvance("q6");
            }}
          />
        ))}
      </QuestionScreen>
    ),
    q7: (
      <QuestionScreen tag="STEP 7 OF 10  ·  CORE ASSESSMENT" title="How clear are you about your future career?">
        {Q7_OPTS.map((o) => (
          <SingleOption
            key={o.label}
            option={o}
            selected={answers.careerClarity === o.label}
            onSelect={() => {
              setAnswers((p) => ({ ...p, careerClarity: o.label }));
              autoAdvance("q7");
            }}
          />
        ))}
      </QuestionScreen>
    ),
    q8: answers.educationLevel === "university" ? (
      <QuestionScreen tag="STEP 8 OF 10  ·  YOUR SITUATION" title="What level are you in?">
        {Q8_UNI.map((o) => (
          <SingleOption
            key={o.label}
            option={o}
            selected={answers.uniLevel === o.label}
            onSelect={() => {
              setAnswers((p) => ({ ...p, uniLevel: o.label }));
              autoAdvance("q8");
            }}
          />
        ))}
      </QuestionScreen>
    ) : (
      <QuestionScreen tag="STEP 8 OF 10  ·  YOUR SITUATION" title="What class are you in?">
        {Q8_SEC.map((o) => (
          <SingleOption
            key={o.label}
            option={o}
            selected={answers.schoolClass === o.label}
            onSelect={() => {
              setAnswers((p) => ({ ...p, schoolClass: o.label }));
              autoAdvance("q8");
            }}
          />
        ))}
      </QuestionScreen>
    ),
    q9: answers.educationLevel === "university" ? (
      <QuestionScreen tag="STEP 9 OF 10  ·  YOUR SITUATION" title="Does your course align with your career goals?">
        {Q9_UNI.map((o) => (
          <SingleOption
            key={o.label}
            option={o}
            selected={answers.courseAlignment === o.label}
            onSelect={() => {
              setAnswers((p) => ({ ...p, courseAlignment: o.label }));
              autoAdvance("q9");
            }}
          />
        ))}
      </QuestionScreen>
    ) : (
      <QuestionScreen tag="STEP 9 OF 10  ·  YOUR SITUATION" title="Have you started learning any career-related skills?">
        {Q9_SEC.map((o) => (
          <SingleOption
            key={o.label}
            option={o}
            selected={answers.skillsStarted === o.label}
            onSelect={() => {
              setAnswers((p) => ({ ...p, skillsStarted: o.label }));
              autoAdvance("q9");
            }}
          />
        ))}
      </QuestionScreen>
    ),
    q10: (
      <TextareaQuestion
        value={answers.goalOrConcern}
        onChange={(v) => setAnswers((p) => ({ ...p, goalOrConcern: v }))}
        onContinue={() => go("analyzing")}
        onSkip={() => {
          setAnswers((p) => ({ ...p, goalOrConcern: "" }));
          go("analyzing");
        }}
      />
    ),
    analyzing: (
      <Analyzing
        onDone={() => {
          // Persist answers + run engine
          localStorage.setItem("worthscope_answers", JSON.stringify(answers));
          generateCareerResults(answers);
          navigate("/career-results");
        }}
      />
    ),
  };

  // Back button visibility
  const showBack = screen !== "welcome" && screen !== "q1" && screen !== "analyzing";

  return (
    <div style={{ minHeight: "100vh", background: BG, fontFamily: "'Poppins', sans-serif", color: TEXT }}>
      {/* Top bar */}
      {screen !== "analyzing" && (
        <header
          style={{
            position: "sticky", top: 0, zIndex: 30, height: 64,
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "0 24px",
            background: "rgba(255,255,255,0.85)", backdropFilter: "blur(14px)",
            borderBottom: "1px solid rgba(52,152,219,0.1)",
          }}
        >
          <div style={{ fontWeight: 700, fontSize: 20, color: ACCENT }}>WorthScope</div>

          {screen !== "welcome" ? (
            <div style={{ position: "relative", width: 200, maxWidth: "40vw" }}>
              <div style={{ height: 6, background: BORDER, borderRadius: 100, overflow: "visible", position: "relative" }}>
                <div
                  style={{
                    width: `${progressPct}%`, height: "100%",
                    background: ACCENT, borderRadius: 100,
                    transition: "width 0.5s cubic-bezier(0.4,0,0.2,1)",
                    position: "relative",
                  }}
                >
                  <span
                    style={{
                      position: "absolute", right: -5, top: "50%", transform: "translateY(-50%)",
                      width: 10, height: 10, borderRadius: "50%",
                      background: ACCENT, boxShadow: "0 0 8px rgba(52,152,219,0.6)",
                    }}
                  />
                </div>
              </div>
            </div>
          ) : <span />}

          <div style={{ fontWeight: 400, fontSize: 13, color: TEXT3, minWidth: 60, textAlign: "right" }}>
            {screen === "welcome" ? "" : `${currentStep} of 10`}
          </div>
        </header>
      )}

      {/* Stage */}
      <div style={{ position: "relative", display: "flex", justifyContent: "center", alignItems: "flex-start" }}>
        <main
          key={screen}
          style={{
            width: "100%", maxWidth: 580,
            padding: "48px 32px",
            animation: transitioning
              ? `${direction === "forward" ? "ws-out-left" : "ws-out-right"} 0.25s ease-in forwards`
              : `${direction === "forward" ? "ws-in-right" : "ws-in-left"} 0.25s ease-out`,
          }}
          className="ws-stage"
        >
          {screens[screen]}

          {/* Back button */}
          {showBack && (
            <button
              onClick={() => go(prevOf(screen), "back")}
              style={{
                marginTop: 18,
                background: "transparent", border: "none", cursor: "pointer",
                display: "inline-flex", alignItems: "center", gap: 6,
                color: TEXT3, fontWeight: 500, fontSize: 14, fontFamily: "inherit",
                padding: 0, opacity: 1, animation: "ws-fade-in 0.3s ease",
                transition: "color 0.18s ease",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = ACCENT)}
              onMouseLeave={(e) => (e.currentTarget.style.color = TEXT3)}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
              </svg>
              Back
            </button>
          )}
        </main>
      </div>

      {/* Max toast */}
      {maxToast && (
        <div
          style={{
            position: "fixed", left: "50%", bottom: 32, transform: "translateX(-50%)",
            background: ACCENT, color: "white", padding: "10px 20px",
            borderRadius: 10, fontFamily: "'Poppins', sans-serif", fontSize: 13, fontWeight: 500,
            zIndex: 100, animation: "ws-toast-slide-up 0.25s ease-out",
            boxShadow: "0 8px 24px rgba(52,152,219,0.35)",
          }}
        >
          {maxToast}
        </div>
      )}

      <style>{`
        @keyframes ws-out-left { from {opacity:1; transform:translateX(0)} to {opacity:0; transform:translateX(-48px)} }
        @keyframes ws-out-right { from {opacity:1; transform:translateX(0)} to {opacity:0; transform:translateX(48px)} }
        @keyframes ws-in-right { from {opacity:0; transform:translateX(48px)} to {opacity:1; transform:translateX(0)} }
        @keyframes ws-in-left { from {opacity:0; transform:translateX(-48px)} to {opacity:1; transform:translateX(0)} }
        @keyframes ws-fade-in { from {opacity:0} to {opacity:1} }
        @keyframes ws-toast-slide-up { from {opacity:0; transform:translate(-50%, 30px)} to {opacity:1; transform:translate(-50%, 0)} }
        @keyframes ws-stagger { from {opacity:0; transform:translateY(16px)} to {opacity:1; transform:translateY(0)} }
        @keyframes ws-float-y { 0%,100% {transform:translateY(0)} 50% {transform:translateY(-8px)} }
        @keyframes ws-spin { to { transform: rotate(360deg) } }
        @keyframes ws-pulse-ring {
          0% { box-shadow: 0 0 0 0 rgba(52,152,219,0.4); }
          100% { box-shadow: 0 0 0 16px rgba(52,152,219,0); }
        }
        @keyframes ws-check-draw { from { stroke-dashoffset: 30 } to { stroke-dashoffset: 0 } }
        @keyframes ws-card-pop {
          0% { transform: scale(1) }
          50% { transform: scale(1.03) }
          100% { transform: scale(1.01) }
        }
        .ws-opt:hover[data-selected="false"] {
          border-color: rgba(52,152,219,0.4) !important;
          background: ${BG} !important;
          transform: translateY(-1px);
        }
        .ws-opt:active { transform: scale(0.97); transition: transform 0.15s ease; }
        @media (max-width: 640px) {
          .ws-stage { padding: 24px 20px !important; }
        }
      `}</style>
    </div>
  );
}

/* ===================== sub-components ===================== */
function optStyle(selected: boolean): React.CSSProperties {
  return {
    display: "flex", alignItems: "center", gap: 12,
    width: "100%", textAlign: "left",
    background: selected ? ACCENT_LIGHT : "#FFFFFF",
    border: selected ? `2px solid ${ACCENT}` : `1.5px solid ${BORDER}`,
    borderRadius: 14, padding: "15px 18px",
    fontFamily: "inherit", fontWeight: 500, fontSize: 15, color: TEXT,
    cursor: "pointer",
    boxShadow: selected ? "0 4px 16px rgba(52,152,219,0.15)" : "none",
    transition: "background 0.18s, border-color 0.18s, box-shadow 0.18s",
    transform: selected ? "scale(1.01)" : "scale(1)",
    animation: selected ? "ws-card-pop 0.3s cubic-bezier(0.34,1.56,0.64,1)" : undefined,
  };
}
const checkStyle: React.CSSProperties = {
  display: "inline-grid", placeItems: "center",
  width: 20, height: 20, borderRadius: "50%", background: ACCENT,
  animation: "ws-card-pop 0.2s cubic-bezier(0.34,1.56,0.64,1)",
};

function QuestionScreen({
  tag, title, sub, children,
}: { tag: string; title: string; sub?: string; children: React.ReactNode }) {
  return (
    <>
      <div style={{ fontWeight: 600, fontSize: 11, color: ACCENT, textTransform: "uppercase", letterSpacing: 1.5 }}>
        {tag}
      </div>
      <h1 style={{ fontWeight: 700, fontSize: 26, color: TEXT, letterSpacing: -0.5, marginTop: 12 }}>{title}</h1>
      {sub && <p style={{ fontWeight: 400, fontSize: 13, color: TEXT2, marginTop: 6 }}>{sub}</p>}
      <div style={{ marginTop: 24, display: "flex", flexDirection: "column", gap: 10 }}>
        {children}
      </div>
    </>
  );
}

function MultiQuestion({
  tag, title, sub, options, selected, max, onChange, onMaxHit, onContinue,
}: {
  tag: string; title: string; sub?: string;
  options: Option[]; selected: string[]; max: number;
  onChange: (next: string[]) => void;
  onMaxHit: () => void;
  onContinue: () => void;
}) {
  const isFull = selected.length >= max;
  const canContinue = selected.length > 0;

  return (
    <>
      <QuestionScreen tag={tag} title={title} sub={sub}>
        {options.map((o) => {
          const isSelected = selected.includes(o.label);
          const disabled = !isSelected && isFull;
          return (
            <button
              key={o.label}
              disabled={disabled}
              onClick={() => {
                if (isSelected) onChange(selected.filter((s) => s !== o.label));
                else if (selected.length < max) onChange([...selected, o.label]);
                else onMaxHit();
              }}
              className="ws-opt"
              data-selected={isSelected}
              style={{
                ...optStyle(isSelected),
                opacity: disabled ? 0.4 : 1,
                pointerEvents: disabled ? "none" : "auto",
              }}
            >
              {o.emoji && <span style={{ fontSize: 20 }}>{o.emoji}</span>}
              <span style={{ flex: 1, textAlign: "left" }}>{o.label}</span>
              {isSelected && (
                <span style={checkStyle} aria-hidden>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </span>
              )}
            </button>
          );
        })}
      </QuestionScreen>
      <ContinueButton enabled={canContinue} onClick={onContinue} />
    </>
  );
}

function ContinueButton({ enabled, onClick }: { enabled: boolean; onClick: () => void }) {
  return (
    <button
      disabled={!enabled}
      onClick={onClick}
      style={{
        marginTop: 24,
        width: "100%", height: 52, borderRadius: 14, border: "none",
        background: enabled ? ACCENT : BORDER,
        color: enabled ? "#FFFFFF" : TEXT3,
        fontFamily: "inherit", fontWeight: 600, fontSize: 16,
        cursor: enabled ? "pointer" : "not-allowed",
        transition: "background 0.3s, box-shadow 0.2s, transform 0.18s",
      }}
      onMouseEnter={(e) => {
        if (!enabled) return;
        e.currentTarget.style.background = ACCENT_DARK;
        e.currentTarget.style.boxShadow = "0 8px 24px rgba(52,152,219,0.35)";
        e.currentTarget.style.transform = "translateY(-1px)";
      }}
      onMouseLeave={(e) => {
        if (!enabled) return;
        e.currentTarget.style.background = ACCENT;
        e.currentTarget.style.boxShadow = "none";
        e.currentTarget.style.transform = "translateY(0)";
      }}
    >
      Continue
    </button>
  );
}

function TextareaQuestion({
  value, onChange, onContinue, onSkip,
}: {
  value: string; onChange: (v: string) => void; onContinue: () => void; onSkip: () => void;
}) {
  const [showSkip, setShowSkip] = useState(false);
  const focusedRef = useRef(false);
  useEffect(() => {
    const t = window.setTimeout(() => focusedRef.current && setShowSkip(true), 1500);
    return () => clearTimeout(t);
  }, []);
  const enabled = value.trim().length >= 10;

  return (
    <>
      <QuestionScreen
        tag="STEP 10 OF 10  ·  ALMOST THERE"
        title="What's your biggest goal or concern about your future?"
        sub="Be honest — this shapes your entire Career Blueprint"
      >
        <div style={{ position: "relative" }}>
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value.slice(0, 300))}
            onFocus={() => { focusedRef.current = true; window.setTimeout(() => setShowSkip(true), 1500); }}
            placeholder="e.g. I want to find a career I enjoy, or I'm worried about choosing the wrong path..."
            style={{
              width: "100%", minHeight: 130, resize: "none",
              background: "#FFFFFF", border: `1.5px solid ${BORDER}`,
              borderRadius: 14, padding: "16px 18px",
              fontFamily: "inherit", fontWeight: 400, fontSize: 15, color: TEXT,
              outline: "none", transition: "border-color 0.18s, box-shadow 0.18s",
            }}
            onFocusCapture={(e) => {
              e.currentTarget.style.borderColor = ACCENT;
              e.currentTarget.style.boxShadow = "0 0 0 4px rgba(52,152,219,0.1)";
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = BORDER;
              e.currentTarget.style.boxShadow = "none";
            }}
          />
          <div
            style={{
              position: "absolute", right: 12, bottom: 8,
              fontSize: 12, color: value.length > 0 ? ACCENT : TEXT3, fontWeight: 500,
            }}
          >
            {value.length} / 300
          </div>
        </div>
        {showSkip && (
          <button
            onClick={onSkip}
            style={{
              alignSelf: "flex-start", marginTop: -2,
              background: "transparent", border: "none", cursor: "pointer",
              fontFamily: "inherit", fontSize: 13, color: TEXT3,
              animation: "ws-fade-in 0.3s ease",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = ACCENT; e.currentTarget.style.textDecoration = "underline"; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = TEXT3; e.currentTarget.style.textDecoration = "none"; }}
          >
            Skip for now
          </button>
        )}
      </QuestionScreen>
      <ContinueButton enabled={enabled} onClick={onContinue} />
    </>
  );
}

function Welcome({ onStart }: { onStart: () => void }) {
  const items = [0, 150, 280, 400, 520];
  return (
    <div
      style={{
        textAlign: "center", padding: "60px 0",
        background: "radial-gradient(circle at 50% 40%, rgba(52,152,219,0.06), transparent 65%)",
      }}
    >
      <div style={{ animation: `ws-stagger 0.5s ease both`, animationDelay: `${items[0]}ms`, opacity: 0 }}>
        <div style={{ display: "inline-block", animation: "ws-float-y 3s ease-in-out infinite" }}>
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
          </svg>
        </div>
      </div>
      <h1
        style={{
          marginTop: 20, fontWeight: 800, fontSize: 32, color: TEXT, letterSpacing: -1,
          animation: "ws-stagger 0.5s ease both", animationDelay: `${items[1]}ms`, opacity: 0,
        }}
      >
        Let's find your path. 🎯
      </h1>
      <p
        style={{
          margin: "12px auto 0", maxWidth: 380, fontWeight: 400, fontSize: 16, color: TEXT2, lineHeight: 1.6,
          animation: "ws-stagger 0.5s ease both", animationDelay: `${items[2]}ms`, opacity: 0,
        }}
      >
        Answer 10 quick questions so we can map out the best career direction for you.
      </p>
      <div
        style={{
          marginTop: 22, display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 8,
          animation: "ws-stagger 0.5s ease both", animationDelay: `${items[3]}ms`, opacity: 0,
        }}
      >
        {["~3 minutes", "100% Personalized", "No wrong answers"].map((c) => (
          <span
            key={c}
            style={{
              background: ACCENT_LIGHT, color: ACCENT,
              border: "1px solid rgba(52,152,219,0.2)", borderRadius: 100,
              fontWeight: 500, fontSize: 12, padding: "5px 14px",
            }}
          >
            {c}
          </span>
        ))}
      </div>
      <button
        onClick={onStart}
        style={{
          marginTop: 30, width: 220, height: 52, borderRadius: 14, border: "none",
          background: ACCENT, color: "#FFFFFF",
          fontFamily: "'Poppins', sans-serif", fontWeight: 600, fontSize: 16, cursor: "pointer",
          animation: "ws-stagger 0.5s ease both", animationDelay: `${items[4]}ms`, opacity: 0,
          transition: "background 0.2s, box-shadow 0.2s, transform 0.2s",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = ACCENT_DARK;
          e.currentTarget.style.boxShadow = "0 8px 28px rgba(52,152,219,0.4)";
          e.currentTarget.style.transform = "translateY(-2px)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = ACCENT;
          e.currentTarget.style.boxShadow = "none";
          e.currentTarget.style.transform = "translateY(0)";
        }}
      >
        Start
      </button>
    </div>
  );
}

function Analyzing({ onDone }: { onDone: () => void }) {
  const [phase, setPhase] = useState<1 | 2 | 3>(1);
  const [textIdx, setTextIdx] = useState(0);
  const messages = ["Mapping your strengths…", "Matching career pathways…", "Building your blueprint…"];

  useEffect(() => {
    const t1 = window.setTimeout(() => setPhase(2), 1500);
    const t2 = window.setTimeout(() => setPhase(3), 3200);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  useEffect(() => {
    if (phase !== 2) return;
    const iv = window.setInterval(() => setTextIdx((i) => (i + 1) % messages.length), 550);
    return () => clearInterval(iv);
  }, [phase]);

  return (
    <div
      style={{
        minHeight: "calc(100vh - 0px)",
        background: BG, display: "flex", alignItems: "center", justifyContent: "center",
        padding: 40, textAlign: "center",
      }}
    >
      <div
        style={{
          padding: "60px 0",
          background: "radial-gradient(circle at 50% 40%, rgba(52,152,219,0.06), transparent 65%)",
        }}
      >
        {phase < 3 ? (
          <div
            style={{
              width: 60, height: 60, borderRadius: "50%",
              border: "3px solid #E5E7EB", borderTopColor: ACCENT,
              animation: "ws-spin 0.9s linear infinite",
              margin: "0 auto",
            }}
          />
        ) : (
          <div
            style={{
              width: 60, height: 60, borderRadius: "50%", background: ACCENT,
              margin: "0 auto", display: "grid", placeItems: "center",
              animation: "ws-pulse-ring 0.6s ease-out",
            }}
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round">
              <polyline
                points="20 6 9 17 4 12"
                strokeDasharray="30"
                style={{ animation: "ws-check-draw 0.4s ease-out forwards" }}
              />
            </svg>
          </div>
        )}

        <div
          style={{
            marginTop: 24,
            fontWeight: phase === 3 ? 700 : 600,
            fontSize: phase === 3 ? 24 : 22,
            color: TEXT, fontFamily: "'Poppins', sans-serif",
          }}
        >
          {phase === 1 && "Analysing your profile…"}
          {phase === 2 && (
            <span style={{ fontWeight: 400, fontSize: 16, color: TEXT2 }}>
              {messages[textIdx]}
            </span>
          )}
          {phase === 3 && "Your Career Blueprint is ready."}
        </div>

        {phase === 3 && (
          <button
            onClick={onDone}
            style={{
              marginTop: 28, width: 260, height: 52, borderRadius: 14, border: "none",
              background: ACCENT, color: "#FFFFFF",
              fontFamily: "'Poppins', sans-serif", fontWeight: 600, fontSize: 16, cursor: "pointer",
              animation: "ws-stagger 0.4s ease both",
              transition: "background 0.2s, box-shadow 0.2s, transform 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = ACCENT_DARK;
              e.currentTarget.style.boxShadow = "0 8px 28px rgba(52,152,219,0.4)";
              e.currentTarget.style.transform = "translateY(-2px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = ACCENT;
              e.currentTarget.style.boxShadow = "none";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            See My Results →
          </button>
        )}
      </div>
    </div>
  );
}
