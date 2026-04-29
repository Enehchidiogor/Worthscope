import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
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

const Icon = ({ d, size = 20, stroke = ACCENT, fill = "none", sw = 1.8 }: { d: string; size?: number; stroke?: string; fill?: string; sw?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" dangerouslySetInnerHTML={{ __html: d }} />
);

export default function Landing() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const observed = useRef<Set<Element>>(new Set());

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("ws-in");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    document.querySelectorAll(".ws-reveal").forEach((el) => {
      if (!observed.current.has(el)) {
        observed.current.add(el);
        io.observe(el);
      }
    });
    return () => io.disconnect();
  }, []);

  const navLinks = [
    { label: "Home", href: "#home" },
    { label: "Services", href: "#features" },
    { label: "About", href: "#how" },
    { label: "Contact", href: "#cta" },
  ];

  return (
    <div style={{ background: "#FFFFFF", color: TEXT, fontFamily: FONT, scrollBehavior: "smooth" }}>
      {/* NAVBAR */}
      <nav
        style={{
          position: "fixed", top: 0, left: 0, right: 0, height: 76, zIndex: 50,
          background: scrolled ? "rgba(255,255,255,0.92)" : "rgba(255,255,255,0.6)",
          backdropFilter: "blur(16px) saturate(180%)",
          WebkitBackdropFilter: "blur(16px) saturate(180%)",
          borderBottom: scrolled ? `1px solid rgba(229,231,235,0.9)` : "1px solid transparent",
          boxShadow: scrolled ? "0 4px 20px rgba(0,0,0,0.05)" : "none",
          transition: "all 0.28s ease",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "0 36px",
        }}
      >
        <a href="#home" style={{ display: "flex", flexDirection: "column", textDecoration: "none", lineHeight: 1 }}>
          <img src={logo} alt="WorthScope" style={{ height: 36, width: "auto" }} />
          <span style={{ marginTop: 2, fontSize: 9, color: TEXT3, letterSpacing: 0.2 }}>See Your Worth. Build Your Future.</span>
        </a>

        <div
          className="ws-nav-links"
          style={{
            position: "absolute", left: "50%", transform: "translateX(-50%)",
            display: "flex", alignItems: "center", gap: 2,
            background: "#FFFFFF",
            border: `1px solid ${BORDER}`,
            borderRadius: 100,
            padding: "6px 8px",
            boxShadow: "0 4px 16px rgba(0,0,0,0.04)",
          }}
        >
          {navLinks.map((l) => (
            <a
              key={l.label}
              href={l.href}
              className="ws-nav-link"
              style={{
                fontSize: 14, fontWeight: 500, color: TEXT, textDecoration: "none",
                padding: "8px 18px", borderRadius: 100, transition: "all 0.2s ease",
              }}
            >
              {l.label}
            </a>
          ))}
        </div>

        <button
          onClick={() => navigate("/signin")}
          className="ws-signin-btn"
          style={{
            background: ACCENT, color: "#fff", border: "none", borderRadius: 8,
            padding: "10px 22px", fontSize: 14, fontWeight: 500, cursor: "pointer",
            fontFamily: FONT, transition: "all 0.2s ease",
          }}
        >
          Sign In
        </button>

        <button
          className="ws-hamburger"
          aria-label="Menu"
          onClick={() => setMobileOpen((v) => !v)}
          style={{
            display: "none", background: "transparent", border: "none", cursor: "pointer", padding: 6,
          }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={TEXT} strokeWidth="2" strokeLinecap="round">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>

        {mobileOpen && (
          <div
            className="ws-mobile-drawer"
            style={{
              position: "absolute", top: 64, left: 0, right: 0,
              background: "rgba(255,255,255,0.95)", backdropFilter: "blur(16px)",
              borderBottom: `1px solid ${BORDER}`, padding: 20,
              display: "flex", flexDirection: "column", gap: 10,
              animation: "ws-slide-down 0.3s ease",
            }}
          >
            {navLinks.map((l) => (
              <a key={l.label} href={l.href} onClick={() => setMobileOpen(false)}
                style={{ fontSize: 16, fontWeight: 500, color: TEXT, textDecoration: "none", padding: "10px 4px" }}>
                {l.label}
              </a>
            ))}
            <button onClick={() => navigate("/signin")}
              style={{ marginTop: 8, background: ACCENT, color: "#fff", border: "none", borderRadius: 8, padding: "12px", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: FONT }}>
              Sign In
            </button>
          </div>
        )}
      </nav>

      {/* HERO */}
      <section id="home" style={{ minHeight: "100vh", paddingTop: 76, padding: "116px 40px 80px" }}>
        <div className="ws-hero-eyebrow-wrap" style={{ maxWidth: 1200, margin: "0 auto", textAlign: "center", marginBottom: 28 }}>
          <div className="ws-eyebrow" style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            background: ACCENT_LIGHT, border: `1px solid rgba(52,152,219,0.3)`,
            borderRadius: 100, padding: "6px 14px", fontSize: 13, color: ACCENT, fontWeight: 500,
            opacity: 0, animation: "ws-fade-up 0.5s ease 0.1s forwards",
          }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: ACCENT, animation: "ws-pulse 2s infinite" }} />
            AI-Powered Career Intelligence
          </div>
        </div>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "grid", gridTemplateColumns: "55fr 45fr", gap: 56, alignItems: "center" }} className="ws-hero-grid">
          <div>

            <h1 style={{
              marginTop: 24, fontWeight: 700, fontSize: "clamp(40px, 5.5vw, 60px)",
              lineHeight: 1.1, letterSpacing: "-1.5px", color: TEXT,
              opacity: 0, animation: "ws-fade-up 0.5s ease 0.25s forwards",
            }}>
              Find the<br />
              <span style={{ color: ACCENT }}>Right Career</span><br />
              Path for You
            </h1>

            <p style={{
              marginTop: 24, fontSize: 17, color: TEXT2, maxWidth: 480, lineHeight: 1.75,
              opacity: 0, animation: "ws-fade-up 0.5s ease 0.4s forwards",
            }}>
              WorthScope helps you discover the career path that fits your strengths,
              interests, and goals — then shows you exactly what to do next.
            </p>

            <div style={{
              marginTop: 32, display: "flex", gap: 14, flexWrap: "wrap",
              opacity: 0, animation: "ws-fade-up 0.5s ease 0.55s forwards",
            }}>
              <button
                onClick={() => navigate("/onboarding")}
                className="ws-btn-primary"
                style={{
                  background: ACCENT, color: "#fff", border: "none", borderRadius: 8,
                  height: 48, padding: "0 28px", fontSize: 15, fontWeight: 600, cursor: "pointer",
                  fontFamily: FONT, transition: "all 0.2s ease",
                }}
              >
                Start Assessment
              </button>
              <button
                onClick={() => document.getElementById("how")?.scrollIntoView({ behavior: "smooth" })}
                className="ws-btn-secondary"
                style={{
                  background: "transparent", color: TEXT, border: `1.5px solid ${BORDER}`, borderRadius: 8,
                  height: 48, padding: "0 28px", fontSize: 15, fontWeight: 600, cursor: "pointer",
                  fontFamily: FONT, transition: "all 0.2s ease",
                }}
              >
                See How It Works
              </button>
            </div>
          </div>

          {/* Right: Journey diagram */}
          <div style={{ opacity: 0, animation: "ws-fade-up 0.6s ease 0.3s forwards" }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 24 }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: TEXT3, letterSpacing: 2, textTransform: "uppercase" }}>Your Journey</span>
              <span style={{ fontSize: 18, fontWeight: 700, color: TEXT }}>From Confusion to Clarity</span>
            </div>

            <JourneyDiagram />
          </div>
        </div>
      </section>

      {/* PROBLEM */}
      <section style={{ padding: "100px 40px", background: "#FFFFFF" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 56, alignItems: "center" }} className="ws-2col">
          <div className="ws-reveal">
            <h2 style={{ fontSize: "clamp(28px, 3.6vw, 42px)", fontWeight: 700, lineHeight: 1.2, letterSpacing: "-1px", color: TEXT }}>
              Most Students <span style={{ color: ACCENT, position: "relative" }}>Guess</span> Their Future
            </h2>
            <p style={{ marginTop: 20, fontSize: 17, color: TEXT2, lineHeight: 1.75, maxWidth: 480 }}>
              Choosing a course or career should not be based on pressure, confusion, or guesswork.
              Many students make decisions too early without the right guidance.
            </p>
            <div style={{ marginTop: 24, display: "flex", flexWrap: "wrap", gap: 10 }}>
              {["No clear direction", "Peer pressure", "Wrong course choice"].map((t) => (
                <span key={t} style={{
                  background: BG2, color: TEXT2, fontSize: 13, fontWeight: 500,
                  padding: "8px 16px", borderRadius: 100, border: `1px solid ${BORDER}`,
                }}>
                  {t}
                </span>
              ))}
            </div>
          </div>

          <div className="ws-reveal">
            <NetworkDiagram />
          </div>
        </div>
      </section>

      {/* SOLUTION */}
      <section style={{ padding: "100px 40px", background: BG2 }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 56, alignItems: "center" }} className="ws-2col">
          <div className="ws-reveal">
            <span style={{ fontSize: 11, fontWeight: 600, color: ACCENT, letterSpacing: 1.5, textTransform: "uppercase" }}>Career Result</span>
            <h2 style={{ marginTop: 12, fontSize: "clamp(28px, 3.6vw, 42px)", fontWeight: 700, lineHeight: 1.2, letterSpacing: "-1px", color: TEXT }}>
              WorthScope Gives You Clarity
            </h2>
            <p style={{ marginTop: 20, fontSize: 17, color: TEXT2, lineHeight: 1.75, maxWidth: 460 }}>
              We analyze your strengths, interests, and goals to give you a personalized career
              direction and a clear next step.
            </p>
          </div>

          <div className="ws-reveal">
            <ResultCard />
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" style={{ padding: "100px 40px", background: "#FFFFFF" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div className="ws-reveal" style={{ textAlign: "center" }}>
            <h2 style={{ fontSize: "clamp(28px, 3.6vw, 42px)", fontWeight: 700, letterSpacing: "-1px", color: TEXT }}>
              How It Works
            </h2>
            <p style={{ marginTop: 14, fontSize: 17, color: TEXT2 }}>
              Three simple steps to your career blueprint.
            </p>
          </div>

          <div style={{ marginTop: 56, position: "relative" }}>
            <div style={{
              position: "absolute", top: 60, left: "16%", right: "16%",
              height: 1.5, background: BORDER, zIndex: 0,
            }} className="ws-connector" />
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24, position: "relative", zIndex: 1 }} className="ws-3col">
              {[
                { n: 1, t: "Answer a Few Questions", s: "Tell us about your subjects, interests, and goals." },
                { n: 2, t: "We Analyze Your Profile", s: "The system matches your data to relevant career paths." },
                { n: 3, t: "Get Your Career Blueprint", s: "Receive your roadmap, skill suggestions, and future direction." },
              ].map((step, i) => (
                <div
                  key={step.n}
                  className="ws-reveal ws-step-card"
                  style={{
                    background: "#FFFFFF", border: `1px solid ${BORDER}`, borderRadius: 12,
                    padding: 28, transition: "all 0.25s ease", cursor: "default",
                    transitionDelay: `${i * 150}ms`,
                  }}
                >
                  <div style={{
                    width: 44, height: 44, borderRadius: "50%", background: ACCENT,
                    color: "#fff", fontWeight: 700, fontSize: 18,
                    display: "grid", placeItems: "center",
                    boxShadow: "0 4px 12px rgba(52,152,219,0.3)",
                  }}>
                    {step.n}
                  </div>
                  <div style={{ marginTop: 18, fontWeight: 700, fontSize: 17, color: TEXT }}>{step.t}</div>
                  <p style={{ marginTop: 8, fontSize: 14, color: TEXT2, lineHeight: 1.6 }}>{step.s}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" style={{ padding: "100px 40px", background: BG2 }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <h2 className="ws-reveal" style={{ textAlign: "center", fontSize: "clamp(28px, 3.6vw, 42px)", fontWeight: 700, letterSpacing: "-1px", color: TEXT }}>
            Everything You Need to Plan Your Future
          </h2>

          <div style={{ marginTop: 56, display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }} className="ws-3col">
            {[
              { i: '<polyline points="16 3 21 3 21 8"/><line x1="4" y1="20" x2="21" y2="3"/><polyline points="21 16 21 21 16 21"/><line x1="15" y1="15" x2="21" y2="21"/><line x1="4" y1="4" x2="9" y2="9"/>', t: "Career Pathway", s: "Discover which careers align with your profile and goals." },
              { i: '<line x1="12" y1="20" x2="12" y2="10"/><line x1="18" y1="20" x2="18" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>', t: "Skill Gap Scanner", s: "See exactly which skills you need to close the gap." },
              { i: '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>', t: "Course Intelligence", s: "Get matched to the right courses for your career direction." },
              { i: '<polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>', t: "Future Earning Insights", s: "Understand earning potential across different career paths." },
              { i: '<rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>', t: "Job Matching Insights", s: "See which roles are in demand and where your skills fit." },
              { i: '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>', t: "Parent Dashboard", s: "Parents can track progress and understand their child's direction." },
            ].map((f, i) => (
              <div
                key={f.t}
                className="ws-reveal ws-feature-card"
                style={{
                  background: "#FFFFFF", border: `1px solid ${BORDER}`, borderRadius: 12,
                  padding: 28, transition: "all 0.25s ease", cursor: "default",
                  transitionDelay: `${i * 80}ms`,
                }}
              >
                <div style={{
                  width: 44, height: 44, borderRadius: 10, background: ACCENT_LIGHT,
                  display: "grid", placeItems: "center",
                }}>
                  <Icon d={f.i} size={20} stroke={ACCENT} />
                </div>
                <div style={{ marginTop: 16, fontSize: 16, fontWeight: 600, color: TEXT }}>{f.t}</div>
                <p style={{ marginTop: 8, fontSize: 14, color: TEXT2, lineHeight: 1.6 }}>{f.s}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section id="cta" style={{ background: ACCENT, padding: "80px 40px", color: "#fff" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 56, alignItems: "center" }} className="ws-2col">
          <div className="ws-reveal">
            <h2 style={{ fontSize: "clamp(30px, 4vw, 46px)", fontWeight: 700, letterSpacing: "-1px", lineHeight: 1.15, color: "#fff" }}>
              Stop Guessing. Start Planning.
            </h2>
            <p style={{ marginTop: 18, fontSize: 17, color: "rgba(255,255,255,0.9)", lineHeight: 1.7, maxWidth: 480 }}>
              Join thousands of students discovering their right career path with WorthScope.
            </p>
            <button
              onClick={() => navigate("/onboarding")}
              className="ws-cta-btn"
              style={{
                marginTop: 30, background: "#fff", color: ACCENT, border: "none",
                borderRadius: 8, padding: "14px 28px", fontSize: 15, fontWeight: 600,
                cursor: "pointer", fontFamily: FONT, transition: "all 0.2s ease",
              }}
            >
              Start Your Career Assessment
            </button>
          </div>

          <div className="ws-reveal">
            <CtaPath />
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ background: "#111111", color: "#fff", padding: "64px 40px 32px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "grid", gridTemplateColumns: "1.5fr 1fr 1fr 1fr", gap: 40 }} className="ws-footer-grid">
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <img src={logo} alt="WorthScope" style={{ height: 36, width: "auto", filter: "brightness(0) invert(1)" }} />
            </div>
            <p style={{ marginTop: 16, fontSize: 14, color: "rgba(255,255,255,0.45)", lineHeight: 1.6 }}>
              Clarity for every student.
            </p>
          </div>

          {[
            { h: "Company", links: ["About", "Services", "Blog"] },
            { h: "Support", links: ["Contact", "FAQ", "Privacy Policy"] },
            { h: "Follow Us", links: ["Twitter / X", "Instagram", "LinkedIn", "TikTok", "Facebook"] },
          ].map((col) => (
            <div key={col.h}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#fff", textTransform: "uppercase", letterSpacing: 1 }}>{col.h}</div>
              <ul style={{ marginTop: 16, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 10 }}>
                {col.links.map((l) => (
                  <li key={l}>
                    <a href="#" style={{ fontSize: 14, color: "rgba(255,255,255,0.6)", textDecoration: "none", transition: "color 0.2s" }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = "#fff")}
                      onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.6)")}>
                      {l}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 56, paddingTop: 24, borderTop: "1px solid rgba(255,255,255,0.08)", textAlign: "center", fontSize: 13, color: "rgba(255,255,255,0.3)" }}>
          © 2026 WorthScope. All rights reserved.
        </div>
      </footer>

      <style>{`
        html { scroll-behavior: smooth; }
        body { margin: 0; }
        @keyframes ws-fade-up { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes ws-pulse { 0%,100% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.4); opacity: 0.5; } }
        @keyframes ws-float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-5px); } }
        @keyframes ws-glow { 0%,100% { box-shadow: 0 0 16px rgba(52,152,219,0.4); } 50% { box-shadow: 0 0 28px rgba(52,152,219,0.7); } }
        @keyframes ws-draw { to { stroke-dashoffset: 0; } }
        @keyframes ws-slide-down { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }

        .ws-reveal { opacity: 0; transform: translateY(24px); transition: opacity 0.7s ease, transform 0.7s ease; }
        .ws-reveal.ws-in { opacity: 1; transform: translateY(0); }

        .ws-nav-link:hover { background: rgba(52,152,219,0.08); color: ${ACCENT}; }
        .ws-signin-btn:hover { background: ${ACCENT_DARK}; box-shadow: 0 0 0 4px rgba(52,152,219,0.2); transform: translateY(-1px); }
        .ws-btn-primary:hover { background: ${ACCENT_DARK}; box-shadow: 0 8px 24px rgba(52,152,219,0.4); transform: translateY(-2px); }
        .ws-btn-secondary:hover { border-color: ${ACCENT}; color: ${ACCENT}; }
        .ws-btn-primary:active, .ws-btn-secondary:active, .ws-cta-btn:active, .ws-signin-btn:active { transform: translateY(0); }
        .ws-cta-btn:hover { opacity: 0.92; transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.15); }

        .ws-step-card:hover, .ws-feature-card:hover {
          transform: translateY(-4px);
          border-color: rgba(52,152,219,0.3) !important;
          box-shadow: 0 12px 32px rgba(52,152,219,0.1);
        }

        .ws-net-node:hover circle { stroke: ${ACCENT} !important; stroke-width: 2 !important; }
        .ws-net-node:hover text { fill: ${ACCENT} !important; }
        .ws-net-node:hover ~ .ws-net-line { stroke: ${ACCENT}; stroke-opacity: 1; }

        @media (max-width: 900px) {
          .ws-nav-links, .ws-signin-btn { display: none !important; }
          .ws-hamburger { display: block !important; }
          .ws-hero-grid, .ws-2col, .ws-3col, .ws-footer-grid { grid-template-columns: 1fr !important; }
          .ws-connector { display: none !important; }
        }
      `}</style>
    </div>
  );
}

/* ───── Journey diagram ───── */
function JourneyDiagram() {
  const nodes = [
    { y: 30, label: "Lost & Unsure", sub: "No idea what career to pick", color: "#F3F4F6", border: BORDER, iconColor: TEXT3, icon: '<circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/>', size: 28 },
    { y: 110, label: "Take the Assessment", sub: "10 quick questions", color: ACCENT_LIGHT, border: ACCENT, iconColor: ACCENT, icon: '<polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>', size: 28 },
    { y: 190, label: "Profile Analyzed", sub: "AI maps your strengths & goals", color: ACCENT_LIGHT, border: ACCENT, iconColor: ACCENT, icon: '<path d="M9 3a3 3 0 0 0-3 3 3 3 0 0 0-3 3 3 3 0 0 0 1 2 3 3 0 0 0-1 2 3 3 0 0 0 3 3 3 3 0 0 0 3 3h6a3 3 0 0 0 3-3 3 3 0 0 0 3-3 3 3 0 0 0-1-2 3 3 0 0 0 1-2 3 3 0 0 0-3-3 3 3 0 0 0-3-3z"/>', size: 28, floatLabel: true },
    { y: 280, label: "Career Path Unlocked", sub: "Top match + alternatives", color: ACCENT, border: ACCENT, iconColor: "#fff", icon: '<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>', size: 36, glow: true, here: true, floatLabel: true },
    { y: 370, label: "You're on Your Way", sub: "Skills, courses, action plan", color: ACCENT, border: ACCENT, iconColor: "#fff", icon: '<polygon points="12 2 15 9 22 9.5 17 14 18.5 21 12 17.5 5.5 21 7 14 2 9.5 9 9 12 2"/>', size: 44, glow: true, gradient: true },
  ];

  return (
    <div style={{ position: "relative", minHeight: 440, padding: "10px 0" }}>
      <svg width="100%" height="430" viewBox="0 0 360 430" style={{ position: "absolute", left: 0, top: 0, pointerEvents: "none" }}>
        <path
          d="M 60 40 Q 30 90 60 130 Q 90 170 60 210 Q 30 250 60 295 Q 90 340 60 385"
          stroke={ACCENT} strokeWidth="2" fill="none" strokeDasharray="800" strokeDashoffset="800"
          style={{ animation: "ws-draw 1.5s ease forwards" }}
        />
      </svg>

      {nodes.map((n, i) => (
        <div
          key={i}
          style={{
            position: "absolute", left: 60 - n.size / 2, top: n.y,
            opacity: 0, animation: `ws-fade-up 0.5s ease ${0.5 + i * 0.3}s forwards`,
          }}
        >
          {n.here && (
            <div style={{
              position: "absolute", left: n.size + 12, top: -22, fontSize: 9, fontWeight: 700,
              color: ACCENT, letterSpacing: 1.2, textTransform: "uppercase", whiteSpace: "nowrap",
            }}>
              You Are Here
            </div>
          )}
          <div style={{
            width: n.size, height: n.size, borderRadius: "50%",
            background: n.gradient ? `linear-gradient(135deg, ${ACCENT}, ${ACCENT_DARK})` : n.color,
            border: `2px solid ${n.border}`,
            display: "grid", placeItems: "center",
            animation: n.glow ? "ws-glow 2.5s ease-in-out infinite" : undefined,
          }}>
            <svg width={n.size * 0.5} height={n.size * 0.5} viewBox="0 0 24 24" fill="none" stroke={n.iconColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" dangerouslySetInnerHTML={{ __html: n.icon }} />
          </div>
          <div style={{
            position: "absolute", left: n.size + 16, top: n.size / 2 - 18,
            whiteSpace: "nowrap",
          }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: TEXT }}>{n.label}</div>
            <div style={{ fontSize: 11, color: TEXT3, marginTop: 2 }}>{n.sub}</div>
          </div>

          {n.floatLabel && (
            <div style={{
              position: "absolute", left: 200, top: n.size / 2 - 22,
              background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 10,
              padding: "10px 14px", fontSize: 12, color: TEXT,
              boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
              animation: "ws-float 3s ease-in-out infinite",
              whiteSpace: "nowrap",
            }}>
              <div style={{ fontWeight: 600 }}>{n.label}</div>
              <div style={{ fontSize: 11, color: TEXT3, marginTop: 2 }}>{n.sub}</div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

/* ───── Network diagram (problem section) ───── */
function NetworkDiagram() {
  const cx = 200, cy = 200, r = 130;
  const nodes = [
    "Medicine", "Teaching", "Law", "Engineering", "Design", "Business", "Finance", "Tech",
  ].map((label, i, arr) => {
    const angle = (i / arr.length) * Math.PI * 2 - Math.PI / 2;
    return { label, x: cx + Math.cos(angle) * r, y: cy + Math.sin(angle) * r };
  });

  return (
    <div style={{
      position: "relative", width: "100%", maxWidth: 420, height: 420, margin: "0 auto",
      background: "radial-gradient(circle at center, rgba(52,152,219,0.05), transparent 70%)",
      borderRadius: 20,
    }}>
      <svg viewBox="0 0 400 400" width="100%" height="100%">
        {nodes.map((n, i) => (
          <line key={i} className="ws-net-line" x1={cx} y1={cy} x2={n.x} y2={n.y}
            stroke={BORDER} strokeWidth="1" strokeOpacity="0.8"
            style={{ animation: `ws-fade-up 0.5s ease ${0.2 + i * 0.05}s both` }} />
        ))}
        <g>
          <circle cx={cx} cy={cy} r="32" fill="#fff" stroke={ACCENT} strokeWidth="2" />
          <text x={cx} y={cy + 4} textAnchor="middle" fontFamily={FONT} fontSize="13" fontWeight="700" fill={ACCENT}>You</text>
        </g>
        {nodes.map((n, i) => (
          <g key={n.label} className="ws-net-node" style={{ cursor: "pointer", transformOrigin: `${n.x}px ${n.y}px`, animation: `ws-fade-up 0.5s ease ${0.3 + i * 0.07}s both` }}>
            <circle cx={n.x} cy={n.y} r="26" fill="#fff" stroke={BORDER} strokeWidth="1.5" style={{ transition: "all 0.2s ease" }} />
            <text x={n.x} y={n.y + 4} textAnchor="middle" fontFamily={FONT} fontSize="11" fontWeight="500" fill={TEXT2} style={{ transition: "all 0.2s ease" }}>{n.label}</text>
          </g>
        ))}
      </svg>
    </div>
  );
}

/* ───── Result card (solution) ───── */
function ResultCard() {
  const [fill, setFill] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!ref.current) return;
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          setTimeout(() => setFill(87), 200);
          io.disconnect();
        }
      });
    }, { threshold: 0.3 });
    io.observe(ref.current);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={ref} style={{
      background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 14, padding: 28,
      maxWidth: 420, marginLeft: "auto", boxShadow: "0 10px 30px rgba(0,0,0,0.06)",
    }}>
      <div style={{ fontSize: 10, fontWeight: 700, color: ACCENT, letterSpacing: 1.5, textTransform: "uppercase" }}>Career Result</div>
      <div style={{ marginTop: 12, fontSize: 17, fontWeight: 700, color: TEXT }}>
        Your top career match: Product Designer
      </div>
      <div style={{ marginTop: 22 }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
          <span style={{ color: TEXT2, fontWeight: 500 }}>Skill Match</span>
          <span style={{ color: ACCENT, fontWeight: 700 }}>87%</span>
        </div>
        <div style={{ marginTop: 8, height: 8, background: BORDER, borderRadius: 100, overflow: "hidden" }}>
          <div style={{ width: `${fill}%`, height: "100%", background: ACCENT, borderRadius: 100, transition: "width 1.4s cubic-bezier(0.4,0,0.2,1)" }} />
        </div>
      </div>
      <div style={{ marginTop: 18, fontSize: 13, color: TEXT2, display: "flex", alignItems: "center", gap: 6 }}>
        <span style={{ width: 5, height: 5, background: ACCENT, borderRadius: "50%" }} />
        30-day action plan ready
      </div>
    </div>
  );
}

/* ───── CTA path illustration ───── */
function CtaPath() {
  return (
    <div style={{ position: "relative", width: "100%", maxWidth: 360, height: 360, margin: "0 auto" }}>
      <svg viewBox="0 0 300 360" width="100%" height="100%">
        <path
          d="M 150 340 Q 60 270 150 200 Q 240 130 150 60"
          stroke="rgba(255,255,255,0.6)" strokeWidth="2" fill="none"
          strokeDasharray="700" strokeDashoffset="700"
          style={{ animation: "ws-draw 1.6s ease forwards 0.3s" }}
        />
        {[
          { x: 150, y: 340, label: "START", r: 8 },
          { x: 90, y: 250, label: "Discovery", r: 8, delay: 0.8 },
          { x: 210, y: 160, label: "Skill Building", r: 8, delay: 1.1 },
          { x: 150, y: 60, label: "YOUR GOAL", r: 12, delay: 1.4, big: true },
        ].map((n, i) => (
          <g key={i} style={{ opacity: 0, animation: `ws-fade-up 0.5s ease ${(n.delay ?? 0.5)}s forwards` }}>
            <circle cx={n.x} cy={n.y} r={n.r} fill="#fff" />
            {n.big && <circle cx={n.x} cy={n.y} r={n.r + 6} fill="none" stroke="#fff" strokeOpacity="0.5" />}
            <text
              x={n.x} y={n.y - n.r - 10} textAnchor="middle"
              fontFamily={FONT} fontSize={n.big ? 13 : 12} fontWeight={n.big ? 700 : 500}
              fill="#fff" letterSpacing={n.big ? 1 : 0}
            >
              {n.label}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}
