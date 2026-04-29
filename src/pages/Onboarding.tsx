import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "@/assets/worthscope-logo.png";

const ACCENT = "#3498DB";
const ACCENT_DARK = "#217BBB";
const ACCENT_LIGHT = "#EBF5FB";
const TEXT = "#111111";
const TEXT2 = "#6B7280";
const TEXT3 = "#9CA3AF";
const BORDER = "#E5E7EB";
const BG2 = "#F8FAFC";
const FONT = "'DM Sans', sans-serif";

type Profile = {
  name: string;
  level: "Secondary" | "University" | "";
  year: string;
};

const STORAGE_KEY = "worthscope_profile";

function loadProfile(): Profile {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return { name: "", level: "", year: "", ...JSON.parse(raw) };
  } catch {}
  return { name: "", level: "", year: "" };
}

const SLIDES = [
  {
    eyebrow: "Welcome",
    title: "Welcome to WorthScope",
    body: "Your guided journey from confusion to a clear, personalized career direction starts here.",
    icon: '<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>',
  },
  {
    eyebrow: "How it works",
    title: "Three simple steps",
    body: "Answer a short assessment, let our system analyze your strengths, and unlock your personalized career blueprint.",
    icon: '<polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>',
  },
  {
    eyebrow: "Almost ready",
    title: "Tell us a little about you",
    body: "Just a couple of details so we can tailor your assessment and results.",
    icon: '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
  },
];

export default function Onboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [profile, setProfile] = useState<Profile>(() => loadProfile());
  const total = SLIDES.length;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") back();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, profile]);

  const isLast = step === total - 1;
  const canContinue = useMemo(() => {
    if (!isLast) return true;
    return profile.name.trim().length > 0 && profile.level !== "" && profile.year.trim().length > 0;
  }, [isLast, profile]);

  function next() {
    if (!isLast) {
      setStep((s) => Math.min(total - 1, s + 1));
    } else if (canContinue) {
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(profile)); } catch {}
      navigate("/assessment");
    }
  }
  function back() {
    if (step > 0) setStep((s) => s - 1);
    else navigate("/");
  }

  const slide = SLIDES[step];
  const yearOptions =
    profile.level === "University"
      ? ["Year 1", "Year 2", "Year 3", "Year 4+"]
      : ["Form 1-3", "Form 4", "Form 5", "Form 6 / A-Levels"];

  return (
    <div style={{ minHeight: "100vh", background: "#fff", fontFamily: FONT, color: TEXT, position: "relative", display: "flex", flexDirection: "column" }}>
      {/* Top bar */}
      <header style={{ height: 76, padding: "0 36px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: `1px solid ${BORDER}` }}>
        <Link to="/" style={{ display: "flex", flexDirection: "column", textDecoration: "none", lineHeight: 1 }}>
          <img src={logo} alt="WorthScope" style={{ height: 36, width: "auto" }} />
          <span style={{ marginTop: 2, fontSize: 9, color: TEXT3 }}>See Your Worth. Build Your Future.</span>
        </Link>
        <button
          onClick={() => navigate("/")}
          style={{
            background: "transparent", border: "none", color: TEXT2, fontSize: 14, fontWeight: 500,
            cursor: "pointer", fontFamily: FONT, padding: "8px 12px", borderRadius: 8,
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = TEXT)}
          onMouseLeave={(e) => (e.currentTarget.style.color = TEXT2)}
        >
          Skip
        </button>
      </header>

      {/* Progress */}
      <div style={{ padding: "20px 36px 0" }}>
        <div style={{ maxWidth: 720, margin: "0 auto", display: "flex", gap: 8 }}>
          {SLIDES.map((_, i) => (
            <div key={i} style={{ flex: 1, height: 4, borderRadius: 100, background: BORDER, overflow: "hidden" }}>
              <div
                style={{
                  height: "100%",
                  width: i <= step ? "100%" : "0%",
                  background: ACCENT,
                  transition: "width 0.4s ease",
                }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Body */}
      <main style={{ flex: 1, display: "grid", placeItems: "center", padding: "32px 24px" }}>
        <div
          key={step}
          style={{
            width: "100%", maxWidth: 560, textAlign: "center",
            animation: "ws-onb-in 0.45s ease",
          }}
        >
          <div
            style={{
              width: 72, height: 72, borderRadius: 20, margin: "0 auto",
              background: ACCENT_LIGHT, display: "grid", placeItems: "center",
              boxShadow: "0 10px 30px rgba(52,152,219,0.18)",
            }}
          >
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" dangerouslySetInnerHTML={{ __html: slide.icon }} />
          </div>
          <div style={{ marginTop: 24, fontSize: 12, fontWeight: 600, color: ACCENT, letterSpacing: 1.5, textTransform: "uppercase" }}>
            {slide.eyebrow}
          </div>
          <h1 style={{ marginTop: 10, fontSize: "clamp(28px, 4vw, 40px)", fontWeight: 700, letterSpacing: "-0.8px", lineHeight: 1.15, color: TEXT }}>
            {slide.title}
          </h1>
          <p style={{ marginTop: 14, fontSize: 16, color: TEXT2, lineHeight: 1.65 }}>
            {slide.body}
          </p>

          {isLast && (
            <div style={{ marginTop: 28, textAlign: "left", display: "flex", flexDirection: "column", gap: 16 }}>
              <Field label="Your name">
                <input
                  type="text"
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  placeholder="e.g. Amani"
                  className="ws-onb-input"
                  style={inputStyle()}
                />
              </Field>

              <Field label="I'm currently in">
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  {(["Secondary", "University"] as const).map((opt) => {
                    const active = profile.level === opt;
                    return (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => setProfile({ ...profile, level: opt, year: "" })}
                        style={{
                          height: 52, borderRadius: 12, fontFamily: FONT, fontSize: 14, fontWeight: 600,
                          cursor: "pointer", transition: "all 0.18s ease",
                          background: active ? ACCENT_LIGHT : "#fff",
                          color: active ? ACCENT : TEXT,
                          border: `1.5px solid ${active ? ACCENT : BORDER}`,
                        }}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>
              </Field>

              {profile.level && (
                <Field label="Current year / level">
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 10 }}>
                    {yearOptions.map((y) => {
                      const active = profile.year === y;
                      return (
                        <button
                          key={y}
                          type="button"
                          onClick={() => setProfile({ ...profile, year: y })}
                          style={{
                            height: 46, borderRadius: 10, fontFamily: FONT, fontSize: 13, fontWeight: 600,
                            cursor: "pointer", transition: "all 0.18s ease",
                            background: active ? ACCENT_LIGHT : "#fff",
                            color: active ? ACCENT : TEXT,
                            border: `1.5px solid ${active ? ACCENT : BORDER}`,
                          }}
                        >
                          {y}
                        </button>
                      );
                    })}
                  </div>
                </Field>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Footer nav */}
      <footer style={{ padding: "20px 24px 28px", borderTop: `1px solid ${BORDER}`, background: BG2 }}>
        <div style={{ maxWidth: 560, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
          <button
            onClick={back}
            style={{
              height: 48, padding: "0 22px", borderRadius: 10, fontFamily: FONT, fontSize: 14, fontWeight: 600,
              background: "transparent", color: TEXT, border: `1.5px solid ${BORDER}`, cursor: "pointer",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = ACCENT; e.currentTarget.style.color = ACCENT; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = BORDER; e.currentTarget.style.color = TEXT; }}
          >
            {step === 0 ? "Back to home" : "Back"}
          </button>

          <div style={{ fontSize: 13, color: TEXT3, fontWeight: 500 }}>
            Step {step + 1} of {total}
          </div>

          <button
            onClick={next}
            disabled={!canContinue}
            style={{
              height: 48, padding: "0 26px", borderRadius: 10, fontFamily: FONT, fontSize: 14, fontWeight: 700,
              background: canContinue ? ACCENT : "#BFD9EE", color: "#fff", border: "none",
              cursor: canContinue ? "pointer" : "not-allowed",
              transition: "all 0.2s ease",
              boxShadow: canContinue ? "0 6px 18px rgba(52,152,219,0.35)" : "none",
            }}
            onMouseEnter={(e) => { if (canContinue) { e.currentTarget.style.background = ACCENT_DARK; e.currentTarget.style.transform = "translateY(-1px)"; } }}
            onMouseLeave={(e) => { if (canContinue) { e.currentTarget.style.background = ACCENT; e.currentTarget.style.transform = "translateY(0)"; } }}
          >
            {isLast ? "Start Assessment" : "Continue"}
          </button>
        </div>
      </footer>

      <style>{`
        @keyframes ws-onb-in { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        .ws-onb-input:focus { outline: none; border-color: ${ACCENT} !important; box-shadow: 0 0 0 4px rgba(52,152,219,0.15); }
      `}</style>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label style={{ display: "block" }}>
      <span style={{ display: "block", fontSize: 13, fontWeight: 600, color: TEXT, marginBottom: 8 }}>{label}</span>
      {children}
    </label>
  );
}

function inputStyle(): React.CSSProperties {
  return {
    width: "100%", height: 52, padding: "0 16px", borderRadius: 12,
    border: `1.5px solid ${BORDER}`, background: "#fff",
    fontFamily: FONT, fontSize: 15, color: TEXT,
    transition: "all 0.18s ease", boxSizing: "border-box",
  };
}
