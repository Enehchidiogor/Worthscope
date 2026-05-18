import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { generateCareerResults, type Answers } from "@/lib/recommendationEngine";
import logo from "@/assets/worthscope-logo.png";

/* WorthScope — Stage 2: 9-Question Career Assessment.
   Reads worthscope_user_profile for context. Q1/Q2 branch by education level. */

const ACCENT = "#3498DB";
const ACCENT_DARK = "#217BBB";
const ACCENT_LIGHT = "#EBF5FB";
const BG = "#F4F9FE";
const BORDER = "#E5E7EB";
const TEXT = "#111111";
const TEXT2 = "#6B7280";
const TEXT3 = "#9CA3AF";
const SUCCESS = "#22C55E";
const FONT = "'Poppins', sans-serif";

const TOTAL_STEPS = 9;

type ScreenId =
  | "q1" | "q2" | "q3" | "q4" | "q5"
  | "q6" | "q7" | "q8" | "q9"
  | "analyzing";

type Profile = {
  fullName: string;
  firstName: string;
  ageRange?: string;
  educationLevel: "secondary" | "university";
  classOrLevel: string;
};

function loadProfile(): Profile | null {
  try {
    const raw = localStorage.getItem("worthscope_user_profile");
    if (!raw) return null;
    const p = JSON.parse(raw);
    if (!p.educationLevel || !p.classOrLevel) return null;
    return p as Profile;
  } catch {
    return null;
  }
}

const initialAnswers: Answers = {
  educationLevel: null,
  strongSubjects: [],
  experienceLevel: null,
  activities: [],
  preferenceConflict: null,
  taskInterests: [],
  outputPreferences: [],
  personalityTraits: [],
  differentiation: null,
  goalOrConcern: "",

  // legacy / unused
  interests: [],
  personality: null,
  careerInclination: null,
  statedCareer: null,
  outputPreference: null,
  careerConfidence: null,
};

type Option = { emoji?: string; label: string };
const opts = (arr: string[]): Option[] =>
  arr.map((s) => {
    const m = s.match(/^(\p{Emoji_Presentation}|\p{Extended_Pictographic})\s+(.*)$/u);
    return m ? { emoji: m[1], label: m[2] } : { label: s };
  });

/* ============ QUESTION OPTIONS ============ */
// Q1 — Subjects (Secondary)
const Q1_SECONDARY = opts([
  "📐 Mathematics",
  "🔬 Sciences",
  "💻 ICT / Technology",
  "🎨 Arts / Creative",
  "💼 Business / Economics",
  "🌍 Social Sciences",
]);
// Q1 — Academic areas (University)
const Q1_UNIVERSITY = opts([
  "💻 Computer Science / Tech",
  "⚙️ Engineering",
  "🎨 Design / Creative",
  "💼 Business / Management",
  "📊 Data / Analytics",
  "🌍 Social Sciences",
  "🧬 Health / Science",
  "📰 Communication / Media",
]);
// Q2 — Experience (Secondary)
const Q2_SECONDARY = opts([
  "🌱 I haven't started learning anything yet",
  "🔍 I've tried learning something small",
  "📚 I've learned a skill before",
  "🏆 I've built or completed something before",
]);
// Q2 — Experience (University)
const Q2_UNIVERSITY = opts([
  "🌱 No experience yet",
  "📖 Basic knowledge",
  "🛠️ Intermediate (I've done projects before)",
  "🚀 Advanced (real-world experience)",
]);

const Q3_OPTS = opts([
  "🎨 Designing or creating visuals",
  "🧩 Solving logical problems",
  "🔧 Building or fixing systems",
  "📊 Analyzing information or data",
  "👥 Leading or organizing people",
  "💬 Communicating or persuading people",
]);

const Q4_OPTS = opts([
  "📱 Creating digital products like apps or websites",
  "✨ Designing user experiences or visuals",
  "📊 Working with data and insights",
  "🏗️ Building systems or infrastructure",
  "🛡️ Protecting systems and data",
  "🚀 Running or growing a business",
  "🤝 Working with people and communication",
  "❓ I'm not sure yet",
]);

const Q5_OPTS = opts([
  "🎨 Designing interfaces or visuals",
  "💻 Writing code or scripts",
  "☁️ Setting up systems or cloud tools",
  "🔍 Finding patterns in data",
  "📋 Managing projects or products",
  "📣 Selling or marketing ideas",
  "❓ I'm not sure yet",
]);

const Q6_OPTS = opts([
  "🎨 A beautiful design",
  "📱 A working application",
  "🛡️ A secure system",
  "📊 A data insight or report",
  "🚀 A successful business or product",
  "🔧 A physical machine or engineered system",
  "📣 An audience, community, or media presence",
  "⚙️ A scalable system",
]);

const Q7_OPTS = opts([
  "🎨 Creative",
  "🧠 Logical",
  "📊 Analytical",
  "💬 Social",
  "♟️ Strategic",
  "🔍 Detail-oriented",
]);

const Q8_OPTS = opts([
  "🎨 Design how something looks",
  "✨ Design how something works",
  "🛠️ Build the system behind it",
  "📊 Analyze and improve performance",
  "📋 Manage and organize everything",
  "📣 Grow and reach an audience",
  "🛡️ Protect and secure systems",
  "🔧 Design and build physical things",
]);

export default function Assessment() {
  const navigate = useNavigate();
  const [profile] = useState<Profile | null>(() => loadProfile());

  useEffect(() => {
    if (!profile) navigate("/onboarding", { replace: true });
  }, [profile, navigate]);

  const [screen, setScreen] = useState<ScreenId>("q1");
  const [direction, setDirection] = useState<"forward" | "back">("forward");
  const [answers, setAnswers] = useState<Answers>(() => ({
    ...initialAnswers,
    educationLevel: profile?.educationLevel ?? null,
    classOrLevel: profile?.classOrLevel ?? null,
    firstName: profile?.firstName,
    fullName: profile?.fullName,
    ageRange: profile?.ageRange ?? null,
  }));
  const [transitioning, setTransitioning] = useState(false);
  const [maxToast, setMaxToast] = useState<string | null>(null);
  const [showGreeting, setShowGreeting] = useState(true);

  useEffect(() => {
    const t = window.setTimeout(() => setShowGreeting(false), 3000);
    return () => clearTimeout(t);
  }, []);

  const stepMap: Partial<Record<ScreenId, number>> = {
    q1: 1, q2: 2, q3: 3, q4: 4, q5: 5, q6: 6, q7: 7, q8: 8, q9: 9,
  };
  const currentStep = stepMap[screen] ?? 0;
  const progressPct = currentStep > 0 ? (currentStep / TOTAL_STEPS) * 100 : 0;

  function nextOf(s: ScreenId): ScreenId {
    const order: ScreenId[] = ["q1","q2","q3","q4","q5","q6","q7","q8","q9","analyzing"];
    const i = order.indexOf(s);
    return order[Math.min(i + 1, order.length - 1)];
  }
  function prevOf(s: ScreenId): ScreenId {
    const order: ScreenId[] = ["q1","q2","q3","q4","q5","q6","q7","q8","q9"];
    const i = order.indexOf(s);
    return order[Math.max(i - 1, 0)];
  }

  function go(next: ScreenId, dir: "forward" | "back" = "forward") {
    if (transitioning) return;
    setDirection(dir);
    setTransitioning(true);
    window.setTimeout(() => {
      setScreen(next);
      setTransitioning(false);
    }, 250);
  }

  function autoAdvance(s: ScreenId) {
    window.setTimeout(() => go(nextOf(s), "forward"), 380);
  }

  function showMaxToast(msg: string) {
    setMaxToast(msg);
    window.setTimeout(() => setMaxToast(null), 2000);
  }

  const isUni = profile?.educationLevel === "university";

  // Q1 spec
  const q1Title = isUni
    ? "Which academic areas fit you the most?"
    : "Which subjects are you strongest in?";
  const q1Sub = isUni
    ? "Pick the areas or courses you enjoy the most. Min 2 · Max 3"
    : "Pick at least 3 subjects you enjoy or perform well in. Min 3 · Max 4";
  const q1Options = isUni ? Q1_UNIVERSITY : Q1_SECONDARY;
  const q1Min = isUni ? 2 : 3;
  const q1Max = isUni ? 3 : 4;

  // Q2 spec
  const q2Title = isUni
    ? "What is your current experience level?"
    : "How much experience do you currently have?";
  const q2Sub = isUni
    ? "Select the option that best describes you."
    : "This helps us understand where you are starting from.";
  const q2Options = isUni ? Q2_UNIVERSITY : Q2_SECONDARY;

  const screens: Record<ScreenId, React.ReactNode> = {
    q1: (
      <MultiQuestion
        tag="STEP 1 OF 9  ·  ACADEMIC FIT"
        title={q1Title}
        sub={q1Sub}
        greeting={showGreeting && profile ? `Welcome, ${profile.firstName}! Let's find your perfect career direction.` : null}
        options={q1Options}
        selected={answers.strongSubjects}
        max={q1Max}
        min={q1Min}
        onChange={(arr) => setAnswers((p) => ({ ...p, strongSubjects: arr }))}
        onMaxHit={() => showMaxToast(`Max ${q1Max} selected`)}
        onContinue={() => go(nextOf("q1"))}
      />
    ),
    q2: (
      <QuestionScreen tag="STEP 2 OF 9  ·  EXPERIENCE" title={q2Title} sub={q2Sub}>
        {q2Options.map((o) => (
          <SingleOption
            key={o.label}
            option={o}
            selected={answers.experienceLevel === o.label}
            onSelect={() => {
              setAnswers((p) => ({ ...p, experienceLevel: o.label }));
              autoAdvance("q2");
            }}
          />
        ))}
      </QuestionScreen>
    ),
    q3: (
      <MultiQuestion
        tag="STEP 3 OF 9  ·  NATURAL TENDENCIES"
        title="What do you naturally enjoy doing?"
        sub="Pick the activities that feel most natural to you. Max 2"
        options={Q3_OPTS}
        selected={answers.activities}
        max={2}
        onChange={(arr) => setAnswers((p) => ({ ...p, activities: arr }))}
        onMaxHit={() => showMaxToast("Max 2 selected")}
        onContinue={() => go(nextOf("q3"))}
      />
    ),
    q4: (
      <MultiQuestion
        tag="STEP 4 OF 9  ·  WORK PREFERENCE"
        title="What type of work sounds most interesting to you?"
        sub="Choose the work styles that excite you the most. Min 2 · Max 3"
        options={Q4_OPTS}
        selected={
          answers.preferenceConflict
            ? [answers.preferenceConflict, ...(answers.workTypes || []).filter(x => x !== answers.preferenceConflict)]
            : (answers.workTypes || [])
        }
        max={3}
        min={2}
        onChange={(arr) => setAnswers((p) => ({
          ...p,
          workTypes: arr,
          preferenceConflict: arr[0] || null,
        }))}
        onMaxHit={() => showMaxToast("Max 3 selected")}
        onContinue={() => go(nextOf("q4"))}
      />
    ),
    q5: (
      <MultiQuestion
        tag="STEP 5 OF 9  ·  DAILY TASKS"
        title="Which tasks would you enjoy doing regularly?"
        sub="Choose the tasks you would not mind doing every day. Max 2"
        options={Q5_OPTS}
        selected={answers.taskInterests}
        max={2}
        onChange={(arr) => setAnswers((p) => ({ ...p, taskInterests: arr }))}
        onMaxHit={() => showMaxToast("Max 2 selected")}
        onContinue={() => go(nextOf("q5"))}
      />
    ),
    q6: (
      <MultiQuestion
        tag="STEP 6 OF 9  ·  DESIRED OUTCOME"
        title="What kind of result would make you feel proud?"
        sub="Choose the type of outcome you would enjoy creating. Max 2"
        options={Q6_OPTS}
        selected={answers.outputPreferences || []}
        max={2}
        onChange={(arr) => setAnswers((p) => ({
          ...p,
          outputPreferences: arr,
          outputPreference: arr[0] || null,
        }))}
        onMaxHit={() => showMaxToast("Max 2 selected")}
        onContinue={() => go(nextOf("q6"))}
      />
    ),
    q7: (
      <MultiQuestion
        tag="STEP 7 OF 9  ·  PERSONALITY"
        title="Which personality traits describe you best?"
        sub="Pick the traits that match how you usually think or behave. Max 3"
        options={Q7_OPTS}
        selected={answers.personalityTraits || []}
        max={3}
        onChange={(arr) => setAnswers((p) => ({
          ...p,
          personalityTraits: arr,
          personality: arr[0] || null,
        }))}
        onMaxHit={() => showMaxToast("Max 3 selected")}
        onContinue={() => go(nextOf("q7"))}
      />
    ),
    q8: (
      <QuestionScreen
        tag="STEP 8 OF 9  ·  DIFFERENTIATION"
        title="Which of these would you rather do?"
        sub="Pick the option that feels most exciting to you."
      >
        {Q8_OPTS.map((o) => (
          <SingleOption
            key={o.label}
            option={o}
            selected={answers.differentiation === o.label}
            onSelect={() => {
              setAnswers((p) => ({ ...p, differentiation: o.label, careerConfidence: o.label }));
              autoAdvance("q8");
            }}
          />
        ))}
      </QuestionScreen>
    ),
    q9: (
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
        onReadyToCompute={() => generateCareerResults(answers)}
        onDone={() => {
          localStorage.setItem("worthscope_answers", JSON.stringify(answers));
          navigate("/career-results");
        }}
      />
    ),
  };

  const showBack = screen !== "q1" && screen !== "analyzing";

  return (
    <div style={{ minHeight: "100vh", background: BG, fontFamily: FONT, color: TEXT }}>
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
          <img
            src={logo}
            alt="WorthScope — See Your Worth. Build Your Future."
            style={{ height: 64, width: "auto", objectFit: "contain", display: "block" }}
          />
          <div style={{ position: "relative", width: 200, maxWidth: "40vw" }}>
            <div style={{ height: 6, background: BORDER, borderRadius: 100, position: "relative" }}>
              <div
                style={{
                  width: `${progressPct}%`, height: "100%",
                  background: ACCENT, borderRadius: 100,
                  transition: "width 0.5s cubic-bezier(0.4,0,0.2,1)",
                  position: "relative",
                }}
              >
                <span style={{
                  position: "absolute", right: -5, top: "50%", transform: "translateY(-50%)",
                  width: 10, height: 10, borderRadius: "50%",
                  background: ACCENT, boxShadow: "0 0 8px rgba(52,152,219,0.6)",
                }} />
              </div>
            </div>
          </div>
          <div style={{ fontWeight: 400, fontSize: 13, color: TEXT3, minWidth: 60, textAlign: "right" }}>
            {`${currentStep} of ${TOTAL_STEPS}`}
          </div>
        </header>
      )}

      {screen !== "analyzing" && (
        <div style={{ display: "flex", justifyContent: "center", gap: 8, padding: "16px 24px 0", flexWrap: "wrap" }}>
          <Pill state="completed">Tell us about yourself</Pill>
          <Pill state="active">Answer 9 questions</Pill>
          <Pill state="upcoming">Get your career path</Pill>
        </div>
      )}

      <div style={{ position: "relative", display: "flex", justifyContent: "center", alignItems: "flex-start" }}>
        <main
          key={screen}
          style={{
            width: "100%", maxWidth: 580,
            padding: "32px 32px 48px",
            animation: transitioning
              ? `${direction === "forward" ? "ws-out-left" : "ws-out-right"} 0.25s ease-in forwards`
              : `${direction === "forward" ? "ws-in-right" : "ws-in-left"} 0.25s ease-out`,
          }}
          className="ws-stage"
        >
          {screens[screen]}

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

      {maxToast && (
        <div style={{
          position: "fixed", left: "50%", bottom: 32, transform: "translateX(-50%)",
          background: ACCENT, color: "white", padding: "10px 20px",
          borderRadius: 10, fontFamily: FONT, fontSize: 13, fontWeight: 500,
          zIndex: 100, animation: "ws-toast-slide-up 0.25s ease-out",
          boxShadow: "0 8px 24px rgba(52,152,219,0.35)",
        }}>{maxToast}</div>
      )}

      <style>{`
        @keyframes ws-out-left { from {opacity:1; transform:translateX(0)} to {opacity:0; transform:translateX(-48px)} }
        @keyframes ws-out-right { from {opacity:1; transform:translateX(0)} to {opacity:0; transform:translateX(48px)} }
        @keyframes ws-in-right { from {opacity:0; transform:translateX(48px)} to {opacity:1; transform:translateX(0)} }
        @keyframes ws-in-left { from {opacity:0; transform:translateX(-48px)} to {opacity:1; transform:translateX(0)} }
        @keyframes ws-fade-in { from {opacity:0} to {opacity:1} }
        @keyframes ws-fade-up { from {opacity:0; transform:translateY(12px)} to {opacity:1; transform:translateY(0)} }
        @keyframes ws-toast-slide-up { from {opacity:0; transform:translate(-50%, 30px)} to {opacity:1; transform:translate(-50%, 0)} }
        @keyframes ws-float-y { 0%,100% {transform:translateY(0)} 50% {transform:translateY(-8px)} }
        @keyframes ws-spin { to { transform: rotate(360deg) } }
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
          .ws-stage { padding: 24px 20px 40px !important; }
        }
      `}</style>
    </div>
  );
}

/* ===================== sub-components ===================== */
function SingleOption({
  option, selected, onSelect,
}: { option: Option; selected: boolean; onSelect: () => void }) {
  return (
    <button onClick={onSelect} className="ws-opt" data-selected={selected} style={optStyle(selected)}>
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
}

function Pill({ state, children }: { state: "active" | "upcoming" | "completed"; children: React.ReactNode }) {
  const styles: Record<string, React.CSSProperties> = {
    active: { background: ACCENT, color: "#fff", border: "1px solid transparent" },
    upcoming: { background: BG, color: TEXT3, border: `1px solid ${BORDER}` },
    completed: { background: "rgba(34,197,94,0.1)", color: SUCCESS, border: "1px solid rgba(34,197,94,0.2)" },
  };
  return (
    <span style={{
      ...styles[state],
      padding: "5px 14px", borderRadius: 100,
      fontFamily: FONT, fontWeight: 600, fontSize: 11,
      whiteSpace: "nowrap",
    }}>
      {state === "completed" && "✓ "}{children}
    </span>
  );
}

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
  tag, title, sub, greeting, children,
}: { tag: string; title: string; sub?: string; greeting?: string | null; children: React.ReactNode }) {
  return (
    <>
      <div style={{ fontWeight: 600, fontSize: 11, color: ACCENT, textTransform: "uppercase", letterSpacing: 1.5 }}>
        {tag}
      </div>
      <h1 style={{ fontWeight: 700, fontSize: 26, color: TEXT, letterSpacing: -0.5, marginTop: 12 }}>{title}</h1>
      {sub && <p style={{ fontWeight: 400, fontSize: 13, color: TEXT2, marginTop: 6 }}>{sub}</p>}
      {greeting && (
        <p style={{ fontWeight: 400, fontSize: 14, color: TEXT2, marginTop: 10, animation: "ws-fade-in 0.4s ease both" }}>
          {greeting}
        </p>
      )}
      <div style={{ marginTop: 24, display: "flex", flexDirection: "column", gap: 10 }}>
        {children}
      </div>
    </>
  );
}

function MultiQuestion({
  tag, title, sub, greeting, options, selected, max, min = 1, onChange, onMaxHit, onContinue,
}: {
  tag: string; title: string; sub?: string; greeting?: string | null;
  options: Option[]; selected: string[]; max: number; min?: number;
  onChange: (next: string[]) => void;
  onMaxHit: () => void;
  onContinue: () => void;
}) {
  const isFull = selected.length >= max;
  const canContinue = selected.length >= min;

  return (
    <>
      <QuestionScreen tag={tag} title={title} sub={sub} greeting={greeting}>
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
      {!canContinue && min > 1 && (
        <p style={{ marginTop: 8, fontSize: 12, color: TEXT3 }}>
          Select at least {min} option{min > 1 ? "s" : ""} to continue.
        </p>
      )}
    </>
  );
}

function ContinueButton({ enabled, onClick, width }: { enabled: boolean; onClick: () => void; width?: number | string }) {
  return (
    <button
      disabled={!enabled}
      onClick={onClick}
      style={{
        marginTop: 24,
        width: width ?? "100%", height: 52, borderRadius: 14, border: "none",
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
        tag="STEP 9 OF 9  ·  IN YOUR OWN WORDS"
        title="In your own words, what kind of career or work do you see yourself doing?"
        sub="You can describe anything you are interested in, even if you are unsure."
      >
        <div style={{ position: "relative" }}>
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value.slice(0, 400))}
            onFocus={(e) => {
              focusedRef.current = true;
              window.setTimeout(() => setShowSkip(true), 1500);
              e.currentTarget.style.borderColor = ACCENT;
              e.currentTarget.style.boxShadow = "0 0 0 4px rgba(52,152,219,0.1)";
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = BORDER;
              e.currentTarget.style.boxShadow = "none";
            }}
            placeholder='e.g. "I want to design apps people enjoy using" or "I want to build secure systems and solve technical problems."'
            style={{
              width: "100%", minHeight: 140, resize: "none",
              background: "#FFFFFF", border: `1.5px solid ${BORDER}`,
              borderRadius: 14, padding: "16px 18px",
              fontFamily: "inherit", fontWeight: 400, fontSize: 15, color: TEXT,
              outline: "none", transition: "border-color 0.18s, box-shadow 0.18s",
            }}
          />
          <div style={{
            position: "absolute", right: 12, bottom: 8,
            fontSize: 12, color: value.length > 0 ? ACCENT : TEXT3, fontWeight: 500,
          }}>
            {value.length} / 400
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

function Analyzing({ onDone, onReadyToCompute }: { onDone: () => void; onReadyToCompute: () => void }) {
  const [phase, setPhase] = useState<1 | 2 | 3>(1);
  const [textIdx, setTextIdx] = useState(0);
  const messages = useMemo(
    () => [
      "Mapping your strengths…",
      "Weighing your preferences…",
      "Matching career pathways…",
      "Building your blueprint…",
    ],
    []
  );
  const computedRef = useRef(false);

  useEffect(() => {
    const t1 = window.setTimeout(() => setPhase(2), 1500);
    const t2 = window.setTimeout(() => {
      if (!computedRef.current) {
        computedRef.current = true;
        try { onReadyToCompute(); } catch (e) { console.error(e); }
      }
      setPhase(3);
    }, 3200);
    const t3 = window.setTimeout(() => onDone(), 4400);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [onReadyToCompute, onDone]);

  useEffect(() => {
    if (phase !== 2) return;
    const iv = window.setInterval(() => setTextIdx((i) => (i + 1) % messages.length), 550);
    return () => clearInterval(iv);
  }, [phase, messages]);

  return (
    <div style={{
      minHeight: "100vh",
      background: BG, display: "flex", alignItems: "center", justifyContent: "center",
      padding: 40, textAlign: "center",
    }}>
      <div style={{ animation: "ws-fade-up 0.5s ease both" }}>
        <div style={{
          width: 80, height: 80, borderRadius: "50%",
          border: `4px solid ${ACCENT_LIGHT}`, borderTopColor: ACCENT,
          margin: "0 auto 24px", animation: "ws-spin 1s linear infinite",
        }} />
        <h2 style={{ fontWeight: 700, fontSize: 22, color: TEXT, letterSpacing: -0.5 }}>
          {phase === 3 ? "Your blueprint is ready ✨" : messages[textIdx]}
        </h2>
        <p style={{ marginTop: 10, fontSize: 14, color: TEXT2 }}>
          {phase === 3 ? "Taking you to your results…" : "Analysing your answers across 9 signals…"}
        </p>
      </div>
    </div>
  );
}
