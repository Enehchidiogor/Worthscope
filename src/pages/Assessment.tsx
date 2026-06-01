import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { generateCareerResults, type Answers } from "@/lib/recommendationEngine";
import logo from "@/assets/worthscope-logo.png";

/* WorthScope — CRS v4.0: 6-Question Career Assessment.
   Reads worthscope_user_profile for context. */

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

const TOTAL_STEPS = 6;

type ScreenId = "q1" | "q2" | "q3" | "q4" | "q5" | "q6" | "analyzing";

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

  interests: [],
  personality: null,
  careerInclination: null,
  statedCareer: null,
  outputPreference: null,
  careerConfidence: null,
};

/* ============ v4.0 OPTION DATA ============ */
type OptionDef = { label: string; tooltip: string; subs: string[] };

const Q1_INTERESTS: OptionDef[] = [
  { label: "Technology & Software", tooltip: "Building apps, websites, software and digital products.",
    subs: ["Creating apps", "Coding", "Building systems", "Cloud technology", "Cybersecurity"] },
  { label: "Design & Creativity", tooltip: "Creating experiences, products and visuals people enjoy.",
    subs: ["UI/UX Design", "Graphic Design", "Product Design", "Branding", "Motion Design"] },
  { label: "Data & AI", tooltip: "Using information and technology to solve problems.",
    subs: ["Data Analysis", "Artificial Intelligence", "Machine Learning", "Research", "Data Science"] },
  { label: "Business & Entrepreneurship", tooltip: "Building businesses and helping products grow.",
    subs: ["Entrepreneurship", "Marketing", "Product Management", "Project Management", "Business Analysis"] },
  { label: "Engineering", tooltip: "Solving real-world technical challenges.",
    subs: ["Mechanical Engineering", "Electrical Engineering", "Civil Engineering", "Robotics"] },
  { label: "Communication & Media", tooltip: "Communicating ideas and influencing people.",
    subs: ["Content Creation", "Social Media", "Brand Strategy", "Communications"] },
];

const Q2_PERSONALITY: OptionDef[] = [
  { label: "Creative", tooltip: "You enjoy creating new ideas, visuals or experiences.",
    subs: ["Visual Design", "Branding", "Storytelling", "Product Ideas"] },
  { label: "Logical", tooltip: "You enjoy solving problems step-by-step.",
    subs: ["Coding", "Systems", "Engineering", "Automation"] },
  { label: "Analytical", tooltip: "You enjoy understanding why things happen.",
    subs: ["Data", "Research", "Business Insights", "AI"] },
  { label: "Social", tooltip: "You enjoy interacting and collaborating with people.",
    subs: ["Leadership", "Communication", "Marketing", "Community Building"] },
  { label: "Strategic", tooltip: "You enjoy planning and making decisions.",
    subs: ["Business Growth", "Product Strategy", "Entrepreneurship", "Project Planning"] },
  { label: "Detail-Oriented", tooltip: "You pay attention to details others often miss.",
    subs: ["Design Precision", "Security", "Data Accuracy", "Quality Assurance"] },
];

const Q3_ROLES: { label: string; desc: string }[] = [
  { label: "The Creator", desc: "Creates experiences and designs." },
  { label: "The Builder", desc: "Builds the solution." },
  { label: "The Analyst", desc: "Uses data and insights." },
  { label: "The Protector", desc: "Keeps everything secure." },
  { label: "The Leader", desc: "Guides the team and product." },
  { label: "The Engineer", desc: "Solves technical real-world challenges." },
];

const Q4_PROBLEMS: { label: string; desc: string }[] = [
  { label: "Digital Problems", desc: "Apps, websites and technology." },
  { label: "Human Problems", desc: "Improving experiences and helping people." },
  { label: "Business Problems", desc: "Helping companies grow." },
  { label: "Security Problems", desc: "Protecting systems and information." },
  { label: "Physical Problems", desc: "Infrastructure and engineering challenges." },
  { label: "Scientific Problems", desc: "Research and advanced technology." },
];

const Q5_PRIDE: { label: string; desc: string }[] = [
  { label: "Creating something people love using", desc: "UI/UX · Product Design · Graphic Design" },
  { label: "Building a powerful solution", desc: "Software · Cloud · DevOps" },
  { label: "Keeping people safe", desc: "Cybersecurity" },
  { label: "Discovering valuable insights", desc: "Data · AI" },
  { label: "Growing a successful business", desc: "Entrepreneurship · Marketing" },
  { label: "Leading a team to achieve a goal", desc: "Product Manager · Project Manager" },
];

/* ============ AGE-AWARE COPY ============ */
function ageBucket(ageRange?: string | null): "young" | "older" {
  if (!ageRange) return "young";
  if (ageRange.startsWith("13") || ageRange.startsWith("16")) return "young";
  return "older";
}

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

  // Sub-option selections per question (keyed by parent label)
  const [q1Subs, setQ1Subs] = useState<Record<string, string[]>>({});
  const [q2Subs, setQ2Subs] = useState<Record<string, string[]>>({});

  const [transitioning, setTransitioning] = useState(false);
  const [maxToast, setMaxToast] = useState<string | null>(null);
  const [showGreeting, setShowGreeting] = useState(true);

  useEffect(() => {
    const t = window.setTimeout(() => setShowGreeting(false), 3000);
    return () => clearTimeout(t);
  }, []);

  const stepMap: Partial<Record<ScreenId, number>> = {
    q1: 1, q2: 2, q3: 3, q4: 4, q5: 5, q6: 6,
  };
  const currentStep = stepMap[screen] ?? 0;
  const progressPct = currentStep > 0 ? (currentStep / TOTAL_STEPS) * 100 : 0;

  const young = ageBucket(profile?.ageRange);

  function nextOf(s: ScreenId): ScreenId {
    const order: ScreenId[] = ["q1","q2","q3","q4","q5","q6","analyzing"];
    return order[Math.min(order.indexOf(s) + 1, order.length - 1)];
  }
  function prevOf(s: ScreenId): ScreenId {
    const order: ScreenId[] = ["q1","q2","q3","q4","q5","q6"];
    return order[Math.max(order.indexOf(s) - 1, 0)];
  }

  function go(next: ScreenId, dir: "forward" | "back" = "forward") {
    if (transitioning) return;
    setDirection(dir);
    setTransitioning(true);
    window.setTimeout(() => { setScreen(next); setTransitioning(false); }, 250);
  }
  function autoAdvance(s: ScreenId) {
    window.setTimeout(() => go(nextOf(s), "forward"), 380);
  }
  function showMaxToast(msg: string) {
    setMaxToast(msg);
    window.setTimeout(() => setMaxToast(null), 2000);
  }

  // Flatten sub-selections for scoring
  const flatSubs = (m: Record<string, string[]>) =>
    Object.values(m).flat();

  function commitAndAnalyze() {
    // Build final Answers with everything mapped to engine fields
    const allInterestSubs = flatSubs(q1Subs);
    const allPersonalitySubs = flatSubs(q2Subs);

    // Append sub-keywords to free text so NLP picks them up too
    const enrichedText = [
      answers.goalOrConcern || "",
      allInterestSubs.join(", "),
      allPersonalitySubs.join(", "),
    ].filter(Boolean).join(". ");

    const finalAnswers: Answers = {
      ...answers,
      // Q1 interests + subs → strongSubjects (Q1_SIGNALS)
      strongSubjects: [...answers.strongSubjects, ...allInterestSubs],
      // Q2 personality + subs → personalityTraits (Q7_SIGNALS)
      personalityTraits: [...(answers.personalityTraits || []), ...allPersonalitySubs],
      personality: (answers.personalityTraits || [])[0] || null,
      // Q3 role → differentiation (drives Q8 override)
      // already set on selection
      // Q4 problems → workTypes (Q4_SIGNALS)
      // Q5 pride → outputPreferences (Q6_SIGNALS)
      outputPreference: (answers.outputPreferences || [])[0] || null,
      preferenceConflict: (answers.workTypes || [])[0] || null,
      goalOrConcern: enrichedText,
      statedCareer: answers.goalOrConcern || null,
    };
    localStorage.setItem("worthscope_answers", JSON.stringify(finalAnswers));
    generateCareerResults(finalAnswers);
  }

  // Welcome greeting per age
  const welcomeText =
    young
      ? `Hey ${profile?.firstName ?? "there"} 👋 I'm Koko. A few quick questions and I'll help you discover careers that fit you best.`
      : `Welcome, ${profile?.firstName ?? "there"}. I'm Koko — answer a few questions and I'll generate personalised career recommendations.`;

  const screens: Record<ScreenId, React.ReactNode> = {
    q1: (
      <ExpandableMulti
        tag="STEP 1 OF 6  ·  INTERESTS"
        title="What kinds of things catch your attention the most?"
        sub="Pick up to 3. Tap a card to see related areas."
        greeting={showGreeting ? welcomeText : null}
        options={Q1_INTERESTS}
        selected={answers.strongSubjects}
        subSelections={q1Subs}
        max={3}
        min={1}
        onChangeMain={(arr) => setAnswers((p) => ({ ...p, strongSubjects: arr }))}
        onChangeSubs={setQ1Subs}
        onMaxHit={() => showMaxToast("Max 3 selected")}
        onContinue={() => go(nextOf("q1"))}
      />
    ),
    q2: (
      <ExpandableMulti
        tag="STEP 2 OF 6  ·  PERSONALITY"
        title="Which of these sounds most like you?"
        sub="Pick up to 3. Tap a card to refine."
        options={Q2_PERSONALITY}
        selected={answers.personalityTraits || []}
        subSelections={q2Subs}
        max={3}
        min={1}
        onChangeMain={(arr) => setAnswers((p) => ({ ...p, personalityTraits: arr }))}
        onChangeSubs={setQ2Subs}
        onMaxHit={() => showMaxToast("Max 3 selected")}
        onContinue={() => go(nextOf("q2"))}
      />
    ),
    q3: (
      <QuestionScreen
        tag="STEP 3 OF 6  ·  YOUR ROLE"
        title="Imagine you're part of a team building something exciting. Which role would you enjoy most?"
        sub="Choose one."
      >
        {Q3_ROLES.map((o) => (
          <SingleOption
            key={o.label}
            label={o.label}
            sub={o.desc}
            selected={answers.differentiation === o.label}
            onSelect={() => {
              setAnswers((p) => ({ ...p, differentiation: o.label, careerConfidence: o.label }));
              autoAdvance("q3");
            }}
          />
        ))}
      </QuestionScreen>
    ),
    q4: (
      <DescMulti
        tag="STEP 4 OF 6  ·  PROBLEM TYPE"
        title="What kind of problems would you enjoy solving?"
        sub="Pick up to 2."
        options={Q4_PROBLEMS}
        selected={answers.workTypes || []}
        max={2}
        min={1}
        onChange={(arr) => setAnswers((p) => ({ ...p, workTypes: arr }))}
        onMaxHit={() => showMaxToast("Max 2 selected")}
        onContinue={() => go(nextOf("q4"))}
      />
    ),
    q5: (
      <DescMulti
        tag="STEP 5 OF 6  ·  PRIDE & MOTIVATION"
        title="What would make you feel most proud?"
        sub="Pick up to 2."
        options={Q5_PRIDE}
        selected={answers.outputPreferences || []}
        max={2}
        min={1}
        onChange={(arr) => setAnswers((p) => ({ ...p, outputPreferences: arr }))}
        onMaxHit={() => showMaxToast("Max 2 selected")}
        onContinue={() => go(nextOf("q5"))}
      />
    ),
    q6: (
      <TextareaQuestion
        young={young}
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
        onReadyToCompute={commitAndAnalyze}
        onDone={() => navigate("/career-results")}
      />
    ),
  };

  const showBack = screen !== "q1" && screen !== "analyzing";

  return (
    <div style={{ minHeight: "100vh", background: BG, fontFamily: FONT, color: TEXT }}>
      {screen !== "analyzing" && (
        <header style={{
          position: "sticky", top: 0, zIndex: 30, height: 64,
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "0 24px",
          background: "rgba(255,255,255,0.85)", backdropFilter: "blur(14px)",
          borderBottom: "1px solid rgba(52,152,219,0.1)",
        }}>
          <img src={logo} alt="WorthScope" style={{ height: 64, width: "auto", objectFit: "contain" }} />
          <div style={{ position: "relative", width: 200, maxWidth: "40vw" }}>
            <div style={{ height: 6, background: BORDER, borderRadius: 100, position: "relative" }}>
              <div style={{
                width: `${progressPct}%`, height: "100%", background: ACCENT, borderRadius: 100,
                transition: "width 0.5s cubic-bezier(0.4,0,0.2,1)", position: "relative",
              }}>
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
          <Pill state="active">Answer 6 questions</Pill>
          <Pill state="upcoming">Get your career path</Pill>
        </div>
      )}

      <div style={{ position: "relative", display: "flex", justifyContent: "center", alignItems: "flex-start" }}>
        <main
          key={screen}
          style={{
            width: "100%", maxWidth: 620,
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
                marginTop: 18, background: "transparent", border: "none", cursor: "pointer",
                display: "inline-flex", alignItems: "center", gap: 6,
                color: TEXT3, fontWeight: 500, fontSize: 14, fontFamily: "inherit",
                padding: 0, animation: "ws-fade-in 0.3s ease",
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
        @keyframes ws-spin { to { transform: rotate(360deg) } }
        @keyframes ws-card-pop {
          0% { transform: scale(1) } 50% { transform: scale(1.03) } 100% { transform: scale(1.01) }
        }
        @keyframes ws-expand-down {
          from { opacity:0; transform: translateY(-4px); max-height: 0; }
          to   { opacity:1; transform: translateY(0); max-height: 240px; }
        }
        .ws-opt:hover[data-selected="false"] {
          border-color: rgba(52,152,219,0.4) !important;
          background: ${BG} !important;
          transform: translateY(-1px);
        }
        .ws-opt:active { transform: scale(0.97); transition: transform 0.15s ease; }
        .ws-chip { transition: all 0.15s ease; }
        .ws-chip:hover { background: ${ACCENT_LIGHT} !important; border-color: ${ACCENT} !important; }
        @media (max-width: 640px) {
          .ws-stage { padding: 24px 20px 40px !important; }
        }
      `}</style>
    </div>
  );
}

/* ===================== sub-components ===================== */

function InfoIcon({ tip }: { tip: string }) {
  return (
    <span
      title={tip}
      aria-label={tip}
      style={{
        display: "inline-grid", placeItems: "center",
        width: 18, height: 18, borderRadius: "50%",
        background: "rgba(52,152,219,0.12)", color: ACCENT,
        fontSize: 11, fontWeight: 700, cursor: "help",
        marginLeft: 6, flexShrink: 0,
      }}
    >i</span>
  );
}

function SingleOption({
  label, sub, selected, onSelect,
}: { label: string; sub?: string; selected: boolean; onSelect: () => void }) {
  return (
    <button onClick={onSelect} className="ws-opt" data-selected={selected} style={optStyle(selected)}>
      <div style={{ flex: 1, textAlign: "left" }}>
        <div style={{ fontWeight: 600 }}>{label}</div>
        {sub && <div style={{ fontSize: 12, color: TEXT2, marginTop: 2, fontWeight: 400 }}>{sub}</div>}
      </div>
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
      ...styles[state], padding: "5px 14px", borderRadius: 100,
      fontFamily: FONT, fontWeight: 600, fontSize: 11, whiteSpace: "nowrap",
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

/* Expandable multi: top-level picks + sub-option chips for selected items */
function ExpandableMulti({
  tag, title, sub, greeting, options, selected, subSelections, max, min = 1,
  onChangeMain, onChangeSubs, onMaxHit, onContinue,
}: {
  tag: string; title: string; sub?: string; greeting?: string | null;
  options: OptionDef[]; selected: string[];
  subSelections: Record<string, string[]>;
  max: number; min?: number;
  onChangeMain: (next: string[]) => void;
  onChangeSubs: (next: Record<string, string[]>) => void;
  onMaxHit: () => void;
  onContinue: () => void;
}) {
  const isFull = selected.length >= max;
  const canContinue = selected.length >= min;

  function toggleSub(parent: string, sub: string) {
    const cur = subSelections[parent] || [];
    const next = cur.includes(sub) ? cur.filter((s) => s !== sub) : [...cur, sub];
    onChangeSubs({ ...subSelections, [parent]: next });
  }

  return (
    <>
      <QuestionScreen tag={tag} title={title} sub={sub} greeting={greeting}>
        {options.map((o) => {
          const isSelected = selected.includes(o.label);
          const disabled = !isSelected && isFull;
          const subs = subSelections[o.label] || [];
          return (
            <div key={o.label}>
              <button
                disabled={disabled}
                onClick={() => {
                  if (isSelected) {
                    onChangeMain(selected.filter((s) => s !== o.label));
                    const cp = { ...subSelections }; delete cp[o.label]; onChangeSubs(cp);
                  } else if (selected.length < max) {
                    onChangeMain([...selected, o.label]);
                  } else onMaxHit();
                }}
                className="ws-opt"
                data-selected={isSelected}
                style={{
                  ...optStyle(isSelected),
                  opacity: disabled ? 0.4 : 1,
                  pointerEvents: disabled ? "none" : "auto",
                }}
              >
                <div style={{ flex: 1, textAlign: "left", display: "flex", alignItems: "center" }}>
                  <span style={{ fontWeight: 600 }}>{o.label}</span>
                  <InfoIcon tip={o.tooltip} />
                </div>
                {isSelected && (
                  <span style={checkStyle} aria-hidden>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </span>
                )}
              </button>
              {isSelected && (
                <div style={{
                  display: "flex", flexWrap: "wrap", gap: 6,
                  padding: "10px 4px 4px 4px",
                  animation: "ws-expand-down 0.25s ease both",
                  overflow: "hidden",
                }}>
                  {o.subs.map((s) => {
                    const on = subs.includes(s);
                    return (
                      <button
                        key={s}
                        type="button"
                        className="ws-chip"
                        onClick={() => toggleSub(o.label, s)}
                        style={{
                          padding: "6px 12px", borderRadius: 100,
                          fontSize: 12, fontWeight: 500, fontFamily: "inherit",
                          cursor: "pointer",
                          background: on ? ACCENT : "#fff",
                          color: on ? "#fff" : TEXT2,
                          border: `1.5px solid ${on ? ACCENT : BORDER}`,
                        }}
                      >
                        {s}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </QuestionScreen>
      <ContinueButton enabled={canContinue} onClick={onContinue} />
    </>
  );
}

/* Multi-select with description text under each option */
function DescMulti({
  tag, title, sub, options, selected, max, min = 1, onChange, onMaxHit, onContinue,
}: {
  tag: string; title: string; sub?: string;
  options: { label: string; desc: string }[];
  selected: string[]; max: number; min?: number;
  onChange: (next: string[]) => void;
  onMaxHit: () => void;
  onContinue: () => void;
}) {
  const isFull = selected.length >= max;
  const canContinue = selected.length >= min;
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
              <div style={{ flex: 1, textAlign: "left" }}>
                <div style={{ fontWeight: 600 }}>{o.label}</div>
                <div style={{ fontSize: 12, color: TEXT2, marginTop: 2, fontWeight: 400 }}>{o.desc}</div>
              </div>
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
        marginTop: 24, width: "100%", height: 52, borderRadius: 14, border: "none",
        background: enabled ? ACCENT : BORDER, color: enabled ? "#FFFFFF" : TEXT3,
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
  young, value, onChange, onContinue, onSkip,
}: {
  young: "young" | "older";
  value: string; onChange: (v: string) => void; onContinue: () => void; onSkip: () => void;
}) {
  const [showSkip, setShowSkip] = useState(false);
  const focusedRef = useRef(false);
  useEffect(() => {
    const t = window.setTimeout(() => focusedRef.current && setShowSkip(true), 1500);
    return () => clearTimeout(t);
  }, []);
  const enabled = value.trim().length >= 10;

  const title = young === "young"
    ? "What do you enjoy doing, learning about, creating, or researching in your free time?"
    : "What career interests, goals, skills, or industries are you exploring or considering?";
  const placeholder = young === "young"
    ? 'e.g. "I enjoy designing things and watching videos about apps and technology."'
    : 'e.g. "I\'m interested in UX Design because I enjoy understanding users and creating digital experiences."';

  return (
    <>
      <QuestionScreen
        tag="STEP 6 OF 6  ·  IN YOUR OWN WORDS"
        title={title}
        sub="This one matters most — be honest and specific."
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
            placeholder={placeholder}
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
      "Mapping your interests…",
      "Reading your free-text answer…",
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
      minHeight: "100vh", background: BG,
      display: "flex", alignItems: "center", justifyContent: "center",
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
          {phase === 3 ? "Taking you to your results…" : "Analysing your answers across 6 signals…"}
        </p>
      </div>
    </div>
  );
}
