import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CareerIcon } from "@/components/career/CareerIcon";
import { loadResults, type CareerResult } from "@/lib/recommendationEngine";
import { setChosenCareer } from "@/lib/userState";
import { persistCareerPath } from "@/lib/authClient";
import logo from "@/assets/worthscope-logo.png";
import { SEO } from "@/components/SEO";

const ACCENT = "#3498DB";
const ACCENT_DARK = "#217DBB";
const ACCENT_LIGHT = "#EBF5FB";
const BG = "#F4F9FE";
const BORDER = "#E5E7EB";
const TEXT = "#111111";
const TEXT2 = "#6B7280";
const TEXT3 = "#9CA3AF";

export default function CareerResults() {
  const navigate = useNavigate();
  const [results, setResults] = useState<CareerResult[]>([]);
  const [fills, setFills] = useState<number[]>([0, 0, 0, 0]);

  useEffect(() => {
    const r = loadResults();
    setResults(r);
    // Stagger match-bar fills aligned with card stagger
    r.forEach((res, i) => {
      const delay = 600 + i * 150 + 200;
      window.setTimeout(() => {
        setFills((prev) => {
          const next = [...prev];
          next[i] = res.percentage;
          return next;
        });
      }, delay);
    });
  }, []);

  const top = results[0];
  const others = results.slice(1);

  const choose = (r: CareerResult) => {
    setChosenCareer({
      title: r.title,
      description: r.description,
      icon: r.icon,
      category: r.category,
      percentage: r.percentage,
    });
    // Fire-and-forget — DB write shouldn't block navigation.
    persistCareerPath(r.title).catch(() => {});
    navigate("/dashboard");
  };

  return (
    <div style={{ minHeight: "100vh", background: BG, fontFamily: "'Poppins', sans-serif", color: TEXT }}>
      <SEO
        title="Your Career Matches — WorthScope"
        description="Top career recommendations from your WorthScope assessment. Pick a path and start your roadmap."
        path="/career-results"
      />
      {/* Top bar */}
      <header
        style={{
          position: "sticky", top: 0, zIndex: 30, height: 64,
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "0 24px",
          background: "rgba(255,255,255,0.88)", backdropFilter: "blur(14px)",
          borderBottom: `1px solid ${BORDER}`,
          animation: "ws-fade-in 0.4s ease",
        }}
      >
        <img
          src={logo}
          alt="WorthScope — See Your Worth. Build Your Future."
          style={{ height: 64, width: "auto", objectFit: "contain", display: "block" }}
        />
        <button
          onClick={() => navigate("/assessment")}
          style={{
            background: "transparent", border: `1px solid ${BORDER}`, borderRadius: 8,
            padding: "7px 14px", fontFamily: "inherit", fontWeight: 500, fontSize: 13, color: TEXT3,
            cursor: "pointer", transition: "all 0.18s ease",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = ACCENT; e.currentTarget.style.color = ACCENT; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = BORDER; e.currentTarget.style.color = TEXT3; }}
        >
          Retake Assessment
        </button>
      </header>

      <main style={{ maxWidth: 680, margin: "0 auto", padding: "56px 32px" }}>
        {/* Header */}
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              display: "inline-block",
              animation: "ws-trophy-bounce 0.5s cubic-bezier(0.34,1.56,0.64,1), ws-trophy-float 3s ease-in-out 0.5s infinite",
            }}
          >
            <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
              <path d="M8 21h8M12 17v4M17 4h3v4a4 4 0 0 1-4 4M7 4H4v4a4 4 0 0 0 4 4" />
              <path d="M17 4H7v6a5 5 0 0 0 10 0V4z" />
            </svg>
          </div>
          <h1
            style={{
              marginTop: 16, fontWeight: 700, fontSize: 30, color: TEXT, letterSpacing: -0.5,
              animation: "ws-fade-up 0.5s ease 0.3s both",
            }}
          >
            Your Career Matches Are In 🎯
          </h1>
          <p
            style={{
              margin: "10px auto 0", maxWidth: 480, fontWeight: 400, fontSize: 15, color: TEXT2, lineHeight: 1.7,
              animation: "ws-fade-up 0.5s ease 0.3s both",
            }}
          >
            Based on your answers, here are the top career paths that align with your strengths,
            interests, and personality.
          </p>
        </div>

        {top?.lowConfidence && (
          <div
            style={{
              marginTop: 28, padding: "16px 20px", borderRadius: 14,
              background: "#FFF8E6", border: "1px solid #F4D67A", color: "#8A5A00",
              fontSize: 13.5, lineHeight: 1.55,
              animation: "ws-fade-up 0.5s ease 0.4s both",
            }}
          >
            <strong>Heads up — these matches are exploratory.</strong> Your answers didn't form
            a strong single pattern yet. Consider retaking the assessment with more specific
            interests in Q10 (the open-ended question) for sharper results.
          </div>
        )}

        <div
          style={{
            height: 1, margin: "32px 0",
            background: "linear-gradient(90deg, transparent, rgba(52,152,219,0.2), transparent)",
            transformOrigin: "left", animation: "ws-line-grow 0.5s ease 0.5s both",
          }}
        />

        {/* Cards */}
        {top && (
          <div
            style={{
              background: ACCENT, borderRadius: 20, padding: 32, color: "#FFFFFF",
              boxShadow: "0 16px 48px rgba(52,152,219,0.35)", textAlign: "center",
              animation: "ws-fade-up 0.5s ease 0.6s both", opacity: 0, position: "relative",
            }}
          >
            <div
              style={{
                position: "absolute", top: 16, left: 16,
                background: "rgba(255,255,255,0.2)", border: "1px solid rgba(255,255,255,0.3)",
                borderRadius: 100, padding: "4px 12px",
                fontWeight: 600, fontSize: 11, color: "#FFFFFF",
                textTransform: "uppercase", letterSpacing: 1.5,
              }}
            >
              Top Match
            </div>

            <div style={{ fontWeight: 700, fontSize: 48, color: "#FFFFFF", lineHeight: 1, marginTop: 8 }}>
              {top.percentage}%
            </div>

            <div
              style={{
                width: 64, height: 64, borderRadius: "50%",
                background: "rgba(255,255,255,0.15)", margin: "16px auto 0",
                display: "grid", placeItems: "center",
              }}
            >
              <CareerIcon name={top.icon} size={26} color="#FFFFFF" />
            </div>

            <div style={{ fontWeight: 700, fontSize: 22, color: "#FFFFFF", marginTop: 10 }}>{top.title}</div>
            <p
              style={{
                margin: "8px auto 0", maxWidth: 320,
                fontWeight: 400, fontSize: 14, color: "rgba(255,255,255,0.82)", lineHeight: 1.65,
              }}
            >
              {top.description}
            </p>
            <p style={{ marginTop: 6, fontWeight: 400, fontSize: 13, color: "rgba(255,255,255,0.7)", fontStyle: "italic" }}>
              {top.matchReason}
            </p>

            {/* Market Heat Index */}
            <div
              style={{
                marginTop: 16,
                background: "rgba(255,255,255,0.12)",
                border: "1px solid rgba(255,255,255,0.2)",
                borderRadius: 12,
                padding: "10px 14px",
                display: "flex",
                justifyContent: "space-around",
                gap: 8,
                fontSize: 11,
                color: "#FFFFFF",
                textAlign: "center",
              }}
            >
              <div>
                <div style={{ fontWeight: 700, fontSize: 13 }}>{top.market.salaryEntryNGN}</div>
                <div style={{ opacity: 0.75, marginTop: 2 }}>Entry</div>
              </div>
              <div style={{ width: 1, background: "rgba(255,255,255,0.25)" }} />
              <div>
                <div style={{ fontWeight: 700, fontSize: 13 }}>{top.market.salarySeniorNGN}</div>
                <div style={{ opacity: 0.75, marginTop: 2 }}>Senior</div>
              </div>
              <div style={{ width: 1, background: "rgba(255,255,255,0.25)" }} />
              <div>
                <div style={{ fontWeight: 700, fontSize: 13 }}>{top.market.heatLabel}</div>
                <div style={{ opacity: 0.75, marginTop: 2 }}>+{top.market.growthPct}% / yr</div>
              </div>
            </div>

            {/* Match bar */}
            <div style={{ marginTop: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 500, fontSize: 12, color: "#FFFFFF" }}>
                <span>Match Score</span>
                <span>{top.percentage}%</span>
              </div>
              <div style={{ marginTop: 6, height: 6, background: "rgba(255,255,255,0.2)", borderRadius: 100, overflow: "hidden" }}>
                <div
                  style={{
                    width: `${fills[0]}%`, height: "100%", background: "#FFFFFF", borderRadius: 100,
                    transition: "width 1.2s cubic-bezier(0.4,0,0.2,1)",
                  }}
                />
              </div>
            </div>

            <button
              onClick={() => choose(top)}
              style={{
                marginTop: 22, width: "100%", height: 48, borderRadius: 10, border: "none",
                background: "#FFFFFF", color: ACCENT,
                fontFamily: "inherit", fontWeight: 600, fontSize: 14, cursor: "pointer",
                transition: "background 0.18s, box-shadow 0.18s",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.9)"; e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.12)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "#FFFFFF"; e.currentTarget.style.boxShadow = "none"; }}
            >
              Choose This Path →
            </button>
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 16, marginTop: 16 }}>
          {others.map((r, i) => (
            <div
              key={r.title}
              className="ws-result-card"
              style={{
                background: "#FFFFFF", border: `1.5px solid ${BORDER}`, borderRadius: 18,
                padding: "24px 28px", boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
                display: "flex", flexDirection: "row", gap: 20, alignItems: "stretch",
                opacity: 0, animation: `ws-fade-up 0.5s ease ${0.75 + i * 0.15}s both`,
                transition: "all 0.2s ease",
              }}
            >
              <div style={{ flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "center" }}>
                <div
                  style={{
                    width: 56, height: 56, borderRadius: "50%", background: ACCENT_LIGHT,
                    display: "grid", placeItems: "center",
                  }}
                >
                  <CareerIcon name={r.icon} size={22} color={ACCENT} />
                </div>
                <div style={{ marginTop: 6, fontWeight: 600, fontSize: 12, color: TEXT3 }}>#{r.rank}</div>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12 }}>
                  <div style={{ fontWeight: 600, fontSize: 18, color: TEXT }}>{r.title}</div>
                  <div style={{ fontWeight: 700, fontSize: 22, color: ACCENT }}>{r.percentage}%</div>
                </div>
                <p style={{ marginTop: 6, fontWeight: 400, fontSize: 13, color: TEXT2, lineHeight: 1.6 }}>
                  {r.description}
                </p>
                <p style={{ marginTop: 4, fontWeight: 400, fontSize: 12, color: TEXT3, fontStyle: "italic" }}>
                  {r.matchReason}
                </p>
                <div
                  style={{
                    marginTop: 10,
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 6,
                    fontSize: 11,
                    fontWeight: 500,
                  }}
                >
                  <span style={{ background: ACCENT_LIGHT, color: ACCENT_DARK, padding: "3px 8px", borderRadius: 6 }}>
                    {r.market.salaryEntryNGN}
                  </span>
                  <span style={{ background: "#FFF7E6", color: "#B45309", padding: "3px 8px", borderRadius: 6 }}>
                    {r.market.heatLabel} · +{r.market.growthPct}%/yr
                  </span>
                </div>
                <div style={{ marginTop: 14, height: 5, background: BORDER, borderRadius: 100, overflow: "hidden" }}>
                  <div
                    style={{
                      width: `${fills[r.rank - 1]}%`, height: "100%",
                      background: "linear-gradient(90deg, #3498DB, #5DADE2)",
                      borderRadius: 100, transition: "width 1.2s cubic-bezier(0.4,0,0.2,1)",
                    }}
                  />
                </div>
                <div style={{ marginTop: 12, textAlign: "right" }}>
                  <button
                    onClick={() => choose(r)}
                    style={{
                      background: "transparent", border: "none", padding: 0, cursor: "pointer",
                      fontFamily: "inherit",
                      fontWeight: 600, fontSize: 13, color: ACCENT,
                      display: "inline-flex", alignItems: "center", gap: 4,
                    }}
                  >
                    Choose This Path
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div
          style={{
            marginTop: 48, textAlign: "center",
            opacity: 0, animation: "ws-fade-up 0.5s ease 1.5s both",
          }}
        >
          <div style={{ fontWeight: 600, fontSize: 11, color: ACCENT, textTransform: "uppercase", letterSpacing: 2 }}>
            What's Next
          </div>
          <h2 style={{ marginTop: 10, fontWeight: 700, fontSize: 24, color: TEXT, letterSpacing: -0.3 }}>
            Ready to start building your path?
          </h2>
          <p style={{ margin: "10px auto 0", maxWidth: 420, fontWeight: 400, fontSize: 14, color: TEXT2, lineHeight: 1.7 }}>
            Your full Career Blueprint includes skill gaps, course recommendations, earning potential, and a 30-day action plan.
          </p>
          <button
            onClick={() => top && choose(top)}
            style={{
              marginTop: 28, width: 280, height: 52, borderRadius: 14, border: "none",
              background: ACCENT, color: "#FFFFFF",
              fontFamily: "inherit", fontWeight: 600, fontSize: 16, cursor: "pointer",
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
            Choose Top Match → Dashboard
          </button>
          <button
            onClick={() => navigate("/assessment")}
            style={{
              display: "block", margin: "14px auto 0", background: "transparent", border: "none",
              fontFamily: "inherit", fontWeight: 400, fontSize: 13, color: TEXT3, cursor: "pointer",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = ACCENT; e.currentTarget.style.textDecoration = "underline"; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = TEXT3; e.currentTarget.style.textDecoration = "none"; }}
          >
            Retake the assessment
          </button>
        </div>
      </main>

      <style>{`
        @keyframes ws-fade-in { from {opacity:0} to {opacity:1} }
        @keyframes ws-fade-up { from {opacity:0; transform:translateY(24px)} to {opacity:1; transform:translateY(0)} }
        @keyframes ws-line-grow { from {transform:scaleX(0)} to {transform:scaleX(1)} }
        @keyframes ws-trophy-bounce { 0% {transform:scale(0)} 60% {transform:scale(1.15)} 100% {transform:scale(1)} }
        @keyframes ws-trophy-float { 0%,100% {transform:translateY(0)} 50% {transform:translateY(-6px)} }
        .ws-result-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 12px 36px rgba(52,152,219,0.12) !important;
          border-color: rgba(52,152,219,0.3) !important;
        }
        .ws-result-card:hover .ws-explore-link { text-decoration: underline; }
        @media (max-width: 640px) {
          .ws-result-card { flex-direction: column !important; align-items: center !important; text-align: center; }
        }
      `}</style>
    </div>
  );
}
