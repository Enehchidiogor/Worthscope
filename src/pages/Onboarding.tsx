import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "@/assets/worthscope-logo.png";

/* WorthScope — Stage 1: User Setup Screen
   Collects identity context ONCE: name, age, education level, class/level.
   Saves to localStorage as worthscope_user_profile. */

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

const STORAGE_KEY = "worthscope_user_profile";

type EducationLevel = "secondary" | "university" | "";
type Profile = {
  fullName: string;
  firstName: string;
  age: number | "";
  educationLevel: EducationLevel;
  classOrLevel: string;
};

function loadProfile(): Profile {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const p = JSON.parse(raw);
      return {
        fullName: p.fullName || "",
        firstName: p.firstName || "",
        age: typeof p.age === "number" ? p.age : "",
        educationLevel: (p.educationLevel as EducationLevel) || "",
        classOrLevel: p.classOrLevel || "",
      };
    }
  } catch {}
  return { fullName: "", firstName: "", age: "", educationLevel: "", classOrLevel: "" };
}

const SECONDARY_OPTS = ["SS1", "SS2", "SS3"];
const UNI_OPTS = ["100 Level", "200 Level", "300 Level", "400 Level", "500 Level"];

export default function Onboarding() {
  const navigate = useNavigate();
  const [p, setP] = useState<Profile>(() => loadProfile());
  const [submitting, setSubmitting] = useState(false);
  const [showGreeting, setShowGreeting] = useState(false);

  const ageNum = typeof p.age === "number" ? p.age : NaN;
  const validName = p.fullName.trim().length >= 2;
  const validAge = !Number.isNaN(ageNum) && ageNum >= 12 && ageNum <= 35;
  const validLevel = p.educationLevel !== "";
  const validClass = p.classOrLevel.trim().length > 0;
  const canContinue = validName && validAge && validLevel && validClass && !submitting;

  const yearOptions = useMemo(
    () => (p.educationLevel === "secondary" ? SECONDARY_OPTS : p.educationLevel === "university" ? UNI_OPTS : []),
    [p.educationLevel],
  );

  function handleSelectLevel(level: EducationLevel) {
    setP((prev) => ({ ...prev, educationLevel: level, classOrLevel: "" }));
  }

  function handleContinue() {
    if (!canContinue) return;
    setSubmitting(true);
    const firstName = p.fullName.trim().split(/\s+/)[0] || "";
    const profile = {
      fullName: p.fullName.trim(),
      firstName,
      age: ageNum,
      educationLevel: p.educationLevel,
      classOrLevel: p.classOrLevel,
    };
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(profile)); } catch {}
    window.setTimeout(() => {
      setShowGreeting(true);
      window.setTimeout(() => navigate("/assessment"), 1800);
    }, 800);
  }

  if (showGreeting) {
    const firstName = p.fullName.trim().split(/\s+/)[0] || "there";
    return (
      <div style={{ minHeight: "100vh", background: BG, fontFamily: FONT, display: "grid", placeItems: "center", padding: 24 }}>
        <div style={{ textAlign: "center", animation: "ws-fade-up 0.5s ease both" }}>
          <div style={{ fontSize: 56, animation: "ws-wave 1.6s ease-in-out infinite", display: "inline-block", transformOrigin: "70% 70%" }}>
            👋
          </div>
          <h1 style={{ marginTop: 14, fontWeight: 700, fontSize: 28, color: TEXT, letterSpacing: -0.6 }}>
            Nice to meet you, {firstName}
          </h1>
          <p style={{ marginTop: 10, fontWeight: 400, fontSize: 16, color: TEXT2 }}>
            Let's find your perfect career path.
          </p>
        </div>
        <style>{`
          @keyframes ws-fade-up { from {opacity:0; transform:translateY(12px)} to {opacity:1; transform:translateY(0)} }
          @keyframes ws-wave { 0%,60%,100%{transform:rotate(0)} 20%{transform:rotate(18deg)} 40%{transform:rotate(-12deg)} }
        `}</style>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: BG, fontFamily: FONT, color: TEXT, display: "flex", flexDirection: "column" }}>
      {/* Top bar */}
      <header
        style={{
          height: 80, padding: "0 24px",
          background: "transparent",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          position: "absolute", top: 0, left: 0, right: 0, zIndex: 10,
        }}
      >
        <Link to="/" style={{ textDecoration: "none", display: "flex", alignItems: "center" }}>
          <img src={logo} alt="WorthScope" style={{ height: 72, width: "auto", objectFit: "contain", display: "block" }} />
        </Link>
      </header>

      <main style={{ flex: 1, width: "100%", maxWidth: 560, margin: "0 auto", padding: "48px 32px" }} className="ws-setup-main">
        {/* Step pills */}
        <div style={{ display: "flex", justifyContent: "center", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
          <Pill state="active">1 — Tell us about yourself</Pill>
          <Pill state="upcoming">2 — Answer 10 questions</Pill>
          <Pill state="upcoming">3 — Get your career path</Pill>
        </div>
        <p style={{ textAlign: "center", fontWeight: 400, fontSize: 13, color: TEXT3, marginBottom: 36 }}>
          3 simple steps to your personalised career blueprint
        </p>

        {/* Header */}
        <h1 style={{ textAlign: "center", fontWeight: 700, fontSize: 30, letterSpacing: -0.8, color: TEXT, margin: 0 }}>
          Let's Get You Started
        </h1>
        <p style={{ textAlign: "center", fontWeight: 400, fontSize: 15, color: TEXT2, maxWidth: 400, margin: "8px auto 36px" }}>
          We'll personalize your career path in just a few steps.
        </p>

        {/* Form */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Full Name */}
          <Field label="Full Name" highlight={validName}>
            <input
              type="text"
              value={p.fullName}
              onChange={(e) => setP({ ...p, fullName: e.target.value })}
              placeholder="Enter your full name"
              className="ws-input"
              style={inputStyle()}
            />
          </Field>

          {/* Age + Education Level row */}
          <div className="ws-row" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <Field label="Age" highlight={validAge}>
              <input
                type="number"
                inputMode="numeric"
                min={12}
                max={35}
                value={p.age === "" ? "" : p.age}
                onChange={(e) => {
                  const v = e.target.value;
                  setP({ ...p, age: v === "" ? "" : Number(v) });
                }}
                placeholder="Enter your age"
                className="ws-input"
                style={inputStyle()}
              />
            </Field>

            <Field label="Education Level" highlight={validLevel}>
              <div style={{ display: "flex", gap: 8 }}>
                {(["secondary", "university"] as const).map((opt) => {
                  const active = p.educationLevel === opt;
                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => handleSelectLevel(opt)}
                      style={{
                        flex: 1, height: 52, borderRadius: 12,
                        border: `1.5px solid ${active ? ACCENT : BORDER}`,
                        background: active ? ACCENT_LIGHT : "#fff",
                        color: active ? ACCENT : TEXT,
                        fontFamily: FONT, fontWeight: 500, fontSize: 14,
                        cursor: "pointer", transition: "all 0.2s ease",
                      }}
                    >
                      {opt === "secondary" ? "🎒 Secondary" : "🎓 University"}
                    </button>
                  );
                })}
              </div>
            </Field>
          </div>

          {/* Conditional class/level */}
          <div
            style={{
              overflow: "hidden",
              maxHeight: p.educationLevel ? 200 : 0,
              opacity: p.educationLevel ? 1 : 0,
              transition: "max-height 0.3s ease, opacity 0.3s ease",
            }}
          >
            {p.educationLevel && (
              <Field
                label={p.educationLevel === "secondary" ? "What class are you in?" : "What level are you in?"}
                highlight={validClass}
              >
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: p.educationLevel === "secondary" ? "repeat(3, 1fr)" : "repeat(5, 1fr)",
                    gap: 8,
                  }}
                  className="ws-class-grid"
                >
                  {yearOptions.map((y) => {
                    const active = p.classOrLevel === y;
                    return (
                      <button
                        key={y}
                        type="button"
                        onClick={() => setP({ ...p, classOrLevel: y })}
                        style={{
                          position: "relative",
                          height: 44, borderRadius: 12,
                          border: `1.5px solid ${active ? ACCENT : BORDER}`,
                          background: active ? ACCENT_LIGHT : "#fff",
                          color: active ? ACCENT : TEXT,
                          fontFamily: FONT, fontWeight: 500, fontSize: 13,
                          cursor: "pointer", transition: "all 0.18s ease",
                        }}
                      >
                        {y}
                        {active && (
                          <span style={{
                            position: "absolute", top: 4, right: 6,
                            fontSize: 11, color: ACCENT, fontWeight: 700,
                          }}>✓</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </Field>
            )}
          </div>

          {/* Continue */}
          <button
            disabled={!canContinue}
            onClick={handleContinue}
            style={{
              marginTop: 12,
              width: "100%", height: 54, borderRadius: 14, border: "none",
              background: canContinue ? ACCENT : BORDER,
              color: canContinue ? "#fff" : TEXT3,
              fontFamily: FONT, fontWeight: 600, fontSize: 16,
              cursor: canContinue ? "pointer" : "not-allowed",
              transition: "background 0.3s, box-shadow 0.2s, transform 0.18s",
            }}
            onMouseEnter={(e) => {
              if (!canContinue) return;
              e.currentTarget.style.background = ACCENT_DARK;
              e.currentTarget.style.boxShadow = "0 8px 24px rgba(52,152,219,0.35)";
              e.currentTarget.style.transform = "translateY(-1px)";
            }}
            onMouseLeave={(e) => {
              if (!canContinue) return;
              e.currentTarget.style.background = ACCENT;
              e.currentTarget.style.boxShadow = "none";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            {submitting ? (
              <span style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
                <span style={{
                  width: 16, height: 16, borderRadius: "50%",
                  border: "2px solid rgba(255,255,255,0.4)", borderTopColor: "#fff",
                  display: "inline-block", animation: "ws-spin 0.8s linear infinite",
                }} />
                Setting up...
              </span>
            ) : "Continue →"}
          </button>
        </div>
      </main>

      <style>{`
        @keyframes ws-spin { to { transform: rotate(360deg) } }
        .ws-input:focus {
          outline: none;
          border-color: ${ACCENT} !important;
          box-shadow: 0 0 0 4px rgba(52,152,219,0.1) !important;
        }
        @media (max-width: 640px) {
          .ws-setup-main { padding: 28px 20px !important; }
          .ws-row { grid-template-columns: 1fr !important; }
          .ws-class-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
      `}</style>
    </div>
  );
}

function Pill({ state, children }: { state: "active" | "upcoming" | "completed"; children: React.ReactNode }) {
  const styles: Record<string, React.CSSProperties> = {
    active: { background: ACCENT, color: "#fff", border: "1px solid transparent" },
    upcoming: { background: BG, color: TEXT3, border: `1px solid ${BORDER}` },
    completed: { background: "rgba(34,197,94,0.1)", color: SUCCESS, border: "1px solid rgba(34,197,94,0.2)" },
  };
  return (
    <span
      style={{
        ...styles[state],
        padding: "6px 16px", borderRadius: 100,
        fontFamily: FONT, fontWeight: 600, fontSize: 11,
        whiteSpace: "nowrap",
      }}
    >
      {state === "completed" && "✓ "}
      {children}
    </span>
  );
}

function Field({ label, highlight, children }: { label: string; highlight?: boolean; children: React.ReactNode }) {
  return (
    <label style={{ display: "block" }}>
      <span style={{
        display: "block", fontFamily: FONT, fontWeight: 600, fontSize: 13,
        color: highlight ? ACCENT : TEXT, marginBottom: 8, transition: "color 0.2s ease",
      }}>
        {label}
      </span>
      {children}
    </label>
  );
}

function inputStyle(): React.CSSProperties {
  return {
    width: "100%", height: 52, padding: "0 18px", borderRadius: 12,
    border: `1.5px solid ${BORDER}`, background: "#fff",
    fontFamily: FONT, fontSize: 15, fontWeight: 400, color: TEXT,
    transition: "border-color 0.2s ease, box-shadow 0.2s ease",
    boxSizing: "border-box",
  };
}
