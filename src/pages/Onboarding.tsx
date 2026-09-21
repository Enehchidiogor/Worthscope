import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "@/assets/worthscope-logo.png";
import { SEO } from "@/components/SEO";
import AmbientBackground from "@/components/landing/AmbientBackground";
import { PAPER, PAPER_DIM, BLUE_BRIGHT, LINE, FONT } from "@/components/experience/theme";

/* WorthScope — Stage 1: User Setup Screen
   Collects identity context: name, age range, education level, and class/level.
   Saves to localStorage as worthscope_user_profile, then hands off to
   /discover (Koko chat/voice discovery), with the static assessment kept as
   a fallback link from there. */

const STORAGE_KEY = "worthscope_user_profile";

const AGE_RANGES = ["Under 13", "13–17", "18–24", "25–34", "35+"] as const;
type EducationLevel = "" | "secondary" | "university";
const SECONDARY_OPTS = ["JSS1", "JSS2", "JSS3", "SS1", "SS2", "SS3"];
const UNI_OPTS = ["100 Level", "200 Level", "300 Level", "400 Level", "500 Level", "Graduate", "Working Professional"];

type Profile = {
  fullName: string;
  firstName: string;
  ageRange: string;
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
        ageRange: p.ageRange || "",
        educationLevel: (p.educationLevel as EducationLevel) || "",
        classOrLevel: p.classOrLevel || "",
      };
    }
  } catch {
    // Corrupt/missing localStorage — fall through to a blank profile.
  }
  return { fullName: "", firstName: "", ageRange: "", educationLevel: "", classOrLevel: "" };
}

export default function Onboarding() {
  const navigate = useNavigate();
  const [p, setP] = useState<Profile>(() => loadProfile());
  const [submitting, setSubmitting] = useState(false);
  const [showGreeting, setShowGreeting] = useState(false);

  const validName = p.fullName.trim().length >= 2;
  const validAge = !!p.ageRange;
  const validLevel = !!p.educationLevel;
  const validClass = !!p.classOrLevel;
  const canContinue = validName && validAge && validLevel && validClass && !submitting;

  const classOptions = useMemo(
    () => (p.educationLevel === "secondary" ? SECONDARY_OPTS : p.educationLevel === "university" ? UNI_OPTS : []),
    [p.educationLevel]
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
      ageRange: p.ageRange,
      educationLevel: p.educationLevel,
      classOrLevel: p.classOrLevel,
    };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
    } catch {
      // Non-critical — worst case the next page re-asks for these details.
    }
    window.setTimeout(() => {
      setShowGreeting(true);
      window.setTimeout(() => navigate("/discover"), 1800);
    }, 800);
  }

  if (showGreeting) {
    const firstName = p.fullName.trim().split(/\s+/)[0] || "there";
    return (
      <div style={{ minHeight: "100vh", position: "relative", fontFamily: FONT, display: "grid", placeItems: "center", padding: 24, overflowX: "clip" as "hidden" }}>
        <AmbientBackground />
        <div style={{ position: "relative", zIndex: 1, textAlign: "center", animation: "ws-fade-up 0.5s ease both" }}>
          <div style={{ fontSize: 56, animation: "ws-wave 1.6s ease-in-out infinite", display: "inline-block", transformOrigin: "70% 70%" }}>
            👋
          </div>
          <h1 style={{ marginTop: 14, fontWeight: 700, fontSize: 28, color: PAPER, letterSpacing: -0.6 }}>
            Nice to meet you, {firstName}
          </h1>
          <p style={{ marginTop: 10, fontWeight: 400, fontSize: 16, color: PAPER_DIM }}>
            Let&rsquo;s find your perfect career path.
          </p>
        </div>
        <style>{`
          body { background: #000; }
          @keyframes ws-fade-up { from {opacity:0; transform:translateY(12px)} to {opacity:1; transform:translateY(0)} }
          @keyframes ws-wave { 0%,60%,100%{transform:rotate(0)} 20%{transform:rotate(18deg)} 40%{transform:rotate(-12deg)} }
        `}</style>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", position: "relative", fontFamily: FONT, color: PAPER, display: "flex", flexDirection: "column", overflowX: "clip" as "hidden" }}>
      <AmbientBackground />
      <SEO
        title="Get Started — WorthScope"
        description="Tell us a little about you so WorthScope can personalize your career discovery and roadmap."
        path="/onboarding"
      />
      <header
        style={{
          height: 80, padding: "0 24px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          position: "absolute", top: 0, left: 0, right: 0, zIndex: 10,
        }}
      >
        <Link to="/" style={{ textDecoration: "none", display: "flex", alignItems: "center" }}>
          <img src={logo} alt="WorthScope" style={{ height: 60, width: "auto", objectFit: "contain", display: "block" }} />
        </Link>
      </header>

      <main style={{ position: "relative", zIndex: 1, flex: 1, width: "100%", maxWidth: 560, margin: "0 auto", padding: "48px 32px" }} className="ws-setup-main">
        <div style={{ display: "flex", justifyContent: "center", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
          <Pill state="active">1 — Tell us about yourself</Pill>
          <Pill state="upcoming">2 — Talk to Koko</Pill>
          <Pill state="upcoming">3 — Get your career path</Pill>
        </div>
        <p style={{ textAlign: "center", fontWeight: 400, fontSize: 13, color: "rgba(255,255,255,.4)", marginBottom: 36 }}>
          A few quick details, then a real conversation with Koko
        </p>

        <h1 style={{ textAlign: "center", fontWeight: 700, fontSize: 30, letterSpacing: -0.8, color: PAPER, margin: 0 }}>
          Let&rsquo;s Get You Started
        </h1>
        <p style={{ textAlign: "center", fontWeight: 400, fontSize: 15, color: PAPER_DIM, maxWidth: 400, margin: "8px auto 36px" }}>
          We&rsquo;ll personalize your career path in just a few steps.
        </p>

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

          {/* Age range */}
          <Field label="Age Range" highlight={validAge}>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {AGE_RANGES.map((opt) => {
                const active = p.ageRange === opt;
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setP({ ...p, ageRange: opt })}
                    style={{
                      padding: "10px 16px", borderRadius: 12,
                      border: `1.5px solid ${active ? BLUE_BRIGHT : LINE}`,
                      background: active ? "rgba(59,130,246,.12)" : "rgba(255,255,255,.03)",
                      color: active ? BLUE_BRIGHT : PAPER,
                      fontFamily: FONT, fontWeight: 600, fontSize: 14,
                      cursor: "pointer", transition: "all 0.15s ease",
                    }}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          </Field>

          {/* Education level */}
          <Field label="Education Level" highlight={validLevel}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {([
                { id: "secondary", label: "Secondary School" },
                { id: "university", label: "University / Beyond" },
              ] as const).map((opt) => {
                const active = p.educationLevel === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => handleSelectLevel(opt.id)}
                    style={{
                      height: 52, borderRadius: 12,
                      border: `1.5px solid ${active ? BLUE_BRIGHT : LINE}`,
                      background: active ? "rgba(59,130,246,.12)" : "rgba(255,255,255,.03)",
                      color: active ? BLUE_BRIGHT : PAPER,
                      fontFamily: FONT, fontWeight: 600, fontSize: 14,
                      cursor: "pointer", transition: "all 0.15s ease",
                    }}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </Field>

          {/* Class / level */}
          {p.educationLevel && (
            <Field label={p.educationLevel === "secondary" ? "Class" : "Level"} highlight={validClass}>
              <select
                value={p.classOrLevel}
                onChange={(e) => setP({ ...p, classOrLevel: e.target.value })}
                className="ws-input"
                style={{ ...inputStyle(), appearance: "none", cursor: "pointer", colorScheme: "dark" }}
              >
                <option value="" style={{ background: "#0A0D14", color: PAPER }}>Select…</option>
                {classOptions.map((opt) => (
                  <option key={opt} value={opt} style={{ background: "#0A0D14", color: PAPER }}>{opt}</option>
                ))}
              </select>
            </Field>
          )}

          <button
            disabled={!canContinue}
            onClick={handleContinue}
            style={{
              marginTop: 12,
              width: "100%", height: 54, borderRadius: 14, border: "none",
              background: canContinue ? BLUE_BRIGHT : LINE,
              color: canContinue ? "#04070D" : "rgba(255,255,255,.4)",
              fontFamily: FONT, fontWeight: 700, fontSize: 16,
              cursor: canContinue ? "pointer" : "not-allowed",
              transition: "all 0.2s ease",
              boxShadow: canContinue ? `0 0 24px ${BLUE_BRIGHT}55` : "none",
            }}
          >
            {submitting ? (
              <span style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
                <span style={{
                  width: 16, height: 16, borderRadius: "50%",
                  border: "2px solid rgba(0,0,0,0.25)", borderTopColor: "#04070D",
                  display: "inline-block", animation: "ws-spin 0.8s linear infinite",
                }} />
                Setting up...
              </span>
            ) : "Continue →"}
          </button>
        </div>
      </main>

      <style>{`
        body { background: #000; }
        @keyframes ws-spin { to { transform: rotate(360deg) } }
        .ws-input::placeholder { color: rgba(255,255,255,.3); }
        .ws-input:focus {
          outline: none;
          border-color: ${BLUE_BRIGHT} !important;
          box-shadow: 0 0 0 4px rgba(59,130,246,0.12) !important;
        }
        @media (max-width: 640px) {
          .ws-setup-main { padding: 28px 20px !important; }
        }
      `}</style>
    </div>
  );
}

function Pill({ state, children }: { state: "active" | "upcoming" | "completed"; children: React.ReactNode }) {
  const styles: Record<string, React.CSSProperties> = {
    active: { background: BLUE_BRIGHT, color: "#04070D", border: "1px solid transparent" },
    upcoming: { background: "rgba(255,255,255,.03)", color: "rgba(255,255,255,.4)", border: `1px solid ${LINE}` },
    completed: { background: "rgba(34,197,94,0.1)", color: "#22C55E", border: "1px solid rgba(34,197,94,0.2)" },
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
        color: highlight ? BLUE_BRIGHT : PAPER, marginBottom: 8, transition: "color 0.2s ease",
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
    border: `1.5px solid ${LINE}`, background: "rgba(255,255,255,.03)",
    fontFamily: FONT, fontSize: 15, fontWeight: 400, color: PAPER,
    transition: "border-color 0.2s ease, box-shadow 0.2s ease",
    boxSizing: "border-box",
  };
}
