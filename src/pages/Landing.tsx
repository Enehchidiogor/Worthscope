import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "@/assets/worthscope-logo.png";

/* WorthScope — Landing Page
   Modern, clean, highly interactive. Built per spec:
   - Glassmorphism navbar (sticky, transitions on scroll)
   - Hero with animated vertical journey diagram
   - Problem / Solution / How it Works / Features / CTA / Footer
   - All visuals are SVG / CSS — no external images
*/

const ACCENT = "#3B82F6";
const ACCENT_DARK = "#2563EB";
const TEXT = "#111111";
const TEXT2 = "#6B7280";
const BORDER = "#E5E7EB";
const BG2 = "#FAFAFA";
const FONT = "'Poppins', 'Inter', sans-serif";

/* ───── Tiny inline icon helper ───── */
const I = ({
  d,
  size = 20,
  stroke = "currentColor",
  sw = 1.8,
  fill = "none",
}: {
  d: string;
  size?: number;
  stroke?: string;
  sw?: number;
  fill?: string;
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill={fill}
    stroke={stroke}
    strokeWidth={sw}
    strokeLinecap="round"
    strokeLinejoin="round"
    dangerouslySetInnerHTML={{ __html: d }}
  />
);

/* ───── Journey nodes (hero) ───── */
const JOURNEY = [
  { label: "Lost & Unsure", icon: "<circle cx='12' cy='12' r='9'/><path d='M9.5 9a2.5 2.5 0 0 1 5 0c0 1.5-2.5 2-2.5 4'/><circle cx='12' cy='17' r='.6' fill='currentColor'/>" },
  { label: "Take the Assessment", icon: "<path d='M9 11l3 3 7-7'/><path d='M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11'/>" },
  { label: "Profile Analyzed", icon: "<path d='M3 12a9 9 0 1 0 9-9'/><path d='M12 7v5l3 2'/>" },
  { label: "Career Path Unlocked", icon: "<rect x='3' y='11' width='18' height='10' rx='2'/><path d='M7 11V7a5 5 0 0 1 10 0'/>" },
  { label: "You're on Your Way", icon: "<path d='M5 13l4 4L19 7'/>" },
];

/* ───── Features ───── */
const FEATURES = [
  { t: "Career Pathway", d: "A clear, step-by-step path from where you are to your goal.", i: "<path d='M4 20l4-4 4 4 8-8'/><circle cx='20' cy='12' r='2'/>" },
  { t: "Skill Gap Scanner", d: "See exactly which skills to build next — and which to skip.", i: "<circle cx='11' cy='11' r='7'/><path d='M21 21l-4.3-4.3'/>" },
  { t: "Course Intelligence", d: "Find the right courses, programs, and degrees for your path.", i: "<path d='M4 19V6a2 2 0 0 1 2-2h12v15H6a2 2 0 0 0-2 2z'/><path d='M8 7h8'/>" },
  { t: "Future Earning Insights", d: "Real salary data so you can plan your future with confidence.", i: "<path d='M3 17l6-6 4 4 7-7'/><path d='M14 8h7v7'/>" },
  { t: "Job Matching Insights", d: "See the roles that fit you — locally and globally.", i: "<rect x='3' y='7' width='18' height='13' rx='2'/><path d='M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2'/>" },
  { t: "Parent Dashboard", d: "Parents get visibility, not pressure — clarity for the whole family.", i: "<circle cx='9' cy='8' r='3'/><circle cx='17' cy='10' r='2.5'/><path d='M3 20c0-3 3-5 6-5s6 2 6 5'/><path d='M14 20c0-2 2-3.5 4-3.5s4 1.5 4 3.5'/>" },
];

export default function Landing() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeNode, setActiveNode] = useState(1);
  const observed = useRef<Set<Element>>(new Set());

  /* Sticky navbar */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* Scroll-reveal */
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
      { threshold: 0.12 }
    );
    document.querySelectorAll(".ws-reveal").forEach((el) => {
      if (!observed.current.has(el)) {
        observed.current.add(el);
        io.observe(el);
      }
    });
    return () => io.disconnect();
  }, []);

  /* Cycle the "current" hero node */
  useEffect(() => {
    const t = setInterval(() => setActiveNode((n) => (n + 1) % JOURNEY.length), 2200);
    return () => clearInterval(t);
  }, []);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    setMobileOpen(false);
  };

  return (
    <div style={{ background: "#FFFFFF", color: TEXT, fontFamily: FONT, minHeight: "100vh" }}>
      {/* ─── Fonts + global animations ─── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap');
        .ws-reveal{opacity:0;transform:translateY(24px);transition:opacity .8s ease,transform .8s ease}
        .ws-reveal.ws-in{opacity:1;transform:translateY(0)}
        @keyframes ws-float{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
        @keyframes ws-pulse-ring{0%{box-shadow:0 0 0 0 rgba(59,130,246,.45)}70%{box-shadow:0 0 0 14px rgba(59,130,246,0)}100%{box-shadow:0 0 0 0 rgba(59,130,246,0)}}
        @keyframes ws-dash{to{stroke-dashoffset:-24}}
        @keyframes ws-orbit{from{transform:rotate(0)}to{transform:rotate(360deg)}}
        @keyframes ws-glow{0%,100%{filter:drop-shadow(0 0 4px rgba(59,130,246,.35))}50%{filter:drop-shadow(0 0 14px rgba(59,130,246,.7))}}
        .ws-card{transition:transform .25s ease,box-shadow .25s ease,border-color .25s ease}
        .ws-card:hover{transform:translateY(-6px);box-shadow:0 20px 40px -20px rgba(17,17,17,.18);border-color:${ACCENT}}
        .ws-btn-primary{transition:transform .2s ease,box-shadow .2s ease,background .2s ease}
        .ws-btn-primary:hover{transform:translateY(-2px);box-shadow:0 12px 28px -8px rgba(59,130,246,.55);background:${ACCENT_DARK}}
        .ws-btn-outline{transition:all .2s ease}
        .ws-btn-outline:hover{background:${ACCENT};color:#fff;border-color:${ACCENT}}
        .ws-link{position:relative;transition:color .2s ease}
        .ws-link:hover{color:${ACCENT}}
        .ws-link::after{content:'';position:absolute;left:0;bottom:-4px;width:0;height:2px;background:${ACCENT};transition:width .25s ease}
        .ws-link:hover::after{width:100%}
        .ws-pill{transition:transform .2s ease,background .2s ease}
        .ws-pill:hover{transform:translateY(-2px);background:${ACCENT};color:#fff;border-color:${ACCENT}}
        .ws-nav-link:hover{background:rgba(59,130,246,.08);color:${ACCENT}}
        .ws-jnode{transition:transform .3s cubic-bezier(.2,.7,.3,1.3)}
        .ws-jnode:hover{transform:scale(1.12)}
        .ws-jnode:hover .ws-jlabel{opacity:1;transform:translateY(0)}
      `}</style>

      {/* ───────────── NAVBAR ───────────── */}
      <header
        style={{
          position: "fixed",
          top: 0, left: 0, right: 0,
          zIndex: 50,
          background: scrolled ? "rgba(255,255,255,0.92)" : "rgba(255,255,255,0.65)",
          backdropFilter: "saturate(180%) blur(16px)",
          WebkitBackdropFilter: "saturate(180%) blur(16px)",
          borderBottom: `1px solid ${scrolled ? "rgba(229,231,235,1)" : "rgba(229,231,235,.6)"}`,
          boxShadow: scrolled ? "0 8px 24px -16px rgba(17,17,17,.15)" : "none",
          transition: "all .25s ease",
        }}
      >
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 28px", height: 88, display: "grid", gridTemplateColumns: "1fr auto 1fr", alignItems: "center", gap: 16 }}>
          <button onClick={() => navigate("/")} style={{ justifySelf: "start", display: "flex", alignItems: "center", background: "transparent", border: "none", cursor: "pointer", padding: 0 }}>
            <img src={logo} alt="WorthScope" style={{ height: 72, width: "auto", objectFit: "contain", display: "block" }} />
          </button>

          <nav
            className="ws-nav-pill"
            style={{
              justifySelf: "center",
              display: "flex",
              gap: 4,
              alignItems: "center",
              background: "#fff",
              border: `1px solid ${BORDER}`,
              borderRadius: 999,
              padding: "6px 10px",
              boxShadow: "0 6px 20px -10px rgba(17,17,17,0.15)",
            }}
          >
            {[
              { label: "Home", id: "hero" },
              { label: "Services", id: "features" },
              { label: "About", id: "solution" },
              { label: "Contact", id: "cta" },
            ].map((l) => (
              <button
                key={l.id}
                onClick={() => scrollTo(l.id)}
                className="ws-nav-link"
                style={{
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  color: TEXT,
                  fontSize: 14,
                  fontWeight: 500,
                  fontFamily: FONT,
                  padding: "8px 18px",
                  borderRadius: 999,
                  transition: "all .2s ease",
                }}
              >
                {l.label}
              </button>
            ))}
          </nav>

          <div style={{ justifySelf: "end", display: "flex", gap: 10, alignItems: "center" }}>
            <button onClick={() => navigate("/signin")} className="ws-btn-primary" style={{ background: ACCENT, color: "#fff", border: "none", padding: "10px 22px", borderRadius: 999, fontWeight: 500, fontSize: 14, cursor: "pointer", fontFamily: FONT }}>
              Sign In
            </button>
            <button onClick={() => setMobileOpen((o) => !o)} aria-label="Menu" style={{ display: "none", background: "transparent", border: "none", cursor: "pointer" }} className="ws-mobile-btn">
              <I d="<path d='M4 6h16M4 12h16M4 18h16'/>" stroke={TEXT} />
            </button>
          </div>
        </div>

        {mobileOpen && (
          <div style={{ borderTop: `1px solid ${BORDER}`, background: "#fff", padding: "12px 24px", display: "flex", flexDirection: "column", gap: 8 }}>
            {["Home","Services","About","Contact"].map((l, idx) => (
              <button key={l} onClick={() => scrollTo(["hero","features","solution","cta"][idx])} style={{ background: "transparent", border: "none", textAlign: "left", padding: "10px 0", fontSize: 15, color: TEXT, cursor: "pointer", fontFamily: FONT }}>{l}</button>
            ))}
          </div>
        )}
      </header>

      {/* ───────────── HERO ───────────── */}
      <section id="hero" style={{ minHeight: "100vh", paddingTop: 120, paddingBottom: 80, display: "flex", alignItems: "center", position: "relative", overflow: "hidden" }}>
        {/* Soft background accents */}
        <div aria-hidden style={{ position: "absolute", top: -120, right: -120, width: 480, height: 480, borderRadius: "50%", background: "radial-gradient(circle, rgba(59,130,246,.12), transparent 70%)", pointerEvents: "none" }} />
        <div aria-hidden style={{ position: "absolute", bottom: -160, left: -160, width: 480, height: 480, borderRadius: "50%", background: "radial-gradient(circle, rgba(59,130,246,.07), transparent 70%)", pointerEvents: "none" }} />

        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px", display: "grid", gridTemplateColumns: "1.05fr .95fr", gap: 64, alignItems: "center", width: "100%" }}>
          {/* LEFT */}
          <div className="ws-reveal">
            <span style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "8px 14px", borderRadius: 999, background: "rgba(59,130,246,.08)", border: `1px solid rgba(59,130,246,.2)`, color: ACCENT, fontWeight: 600, fontSize: 13 }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: ACCENT, animation: "ws-float 1.6s ease-in-out infinite" }} />
              AI-Powered Career Intelligence
            </span>
            <h1 style={{ fontSize: 58, lineHeight: 1.08, fontWeight: 600, margin: "20px 0 18px", letterSpacing: -1.2, color: TEXT }}>
              Find the <span style={{ color: ACCENT, fontWeight: 700 }}>Right Career</span> Path for You
            </h1>
            <p style={{ fontSize: 17, lineHeight: 1.65, color: TEXT2, maxWidth: 540, margin: 0, fontWeight: 400 }}>
              WorthScope helps students discover the career path that fits their strengths, interests, and goals — then shows you exactly what to do next.
            </p>
            <div style={{ display: "flex", gap: 14, marginTop: 36, flexWrap: "wrap" }}>
              <button onClick={() => navigate("/onboarding")} className="ws-btn-primary" style={{ background: ACCENT, color: "#fff", border: "none", padding: "16px 28px", borderRadius: 14, fontWeight: 500, fontSize: 15, cursor: "pointer", fontFamily: FONT, display: "inline-flex", alignItems: "center", gap: 10 }}>
                Start Assessment
                <I d="<path d='M5 12h14M13 5l7 7-7 7'/>" size={18} stroke="#fff" />
              </button>
              <button onClick={() => scrollTo("how")} className="ws-btn-outline" style={{ background: "transparent", color: TEXT, border: `1.5px solid ${BORDER}`, padding: "16px 28px", borderRadius: 14, fontWeight: 500, fontSize: 15, cursor: "pointer", fontFamily: FONT }}>
                See How It Works
              </button>
            </div>
          </div>

          {/* RIGHT — Animated journey */}
          <div className="ws-reveal" style={{ position: "relative", height: 560 }}>
            <JourneyDiagram active={activeNode} />
          </div>
        </div>
      </section>

      {/* ───────────── PROBLEM ───────────── */}
      <section id="problem" style={{ background: BG2, padding: "100px 0", borderTop: `1px solid ${BORDER}`, borderBottom: `1px solid ${BORDER}` }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 64, alignItems: "center" }}>
          <div className="ws-reveal">
            <h2 style={{ fontSize: 42, fontWeight: 700, lineHeight: 1.15, margin: 0, color: TEXT, letterSpacing: -1 }}>
              Most Students <span style={{ color: ACCENT }}>Guess</span> Their Future
            </h2>
            <p style={{ fontSize: 17, lineHeight: 1.7, color: TEXT2, marginTop: 20 }}>
              Career choices today are made under pressure — from family, peers, and school. With no real guidance, students pick courses they don't understand, chase trends they don't enjoy, and end up rebuilding from scratch years later.
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 28 }}>
              {["No clear direction", "Peer pressure", "Wrong course choice"].map((p) => (
                <span key={p} className="ws-pill" style={{ padding: "10px 18px", borderRadius: 999, background: "#fff", border: `1px solid ${BORDER}`, color: TEXT, fontSize: 14, fontWeight: 500, cursor: "default" }}>
                  {p}
                </span>
              ))}
            </div>
          </div>

          <div className="ws-reveal">
            <ConfusionDiagram />
          </div>
        </div>
      </section>

      {/* ───────────── SOLUTION ───────────── */}
      <section id="solution" style={{ padding: "110px 0", background: "#fff" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 64, alignItems: "center" }}>
          <div className="ws-reveal">
            <h2 style={{ fontSize: 42, fontWeight: 700, lineHeight: 1.15, margin: 0, color: TEXT, letterSpacing: -1 }}>
              WorthScope Gives You <span style={{ color: ACCENT }}>Clarity</span>
            </h2>
            <p style={{ fontSize: 17, lineHeight: 1.7, color: TEXT2, marginTop: 20 }}>
              Our AI analyses your strengths, interests, and goals across 15 carefully designed signals — then matches you with careers that fit you, not just trends. You walk away with a personalised plan, the skills to build, and the next step to take this week.
            </p>
            <ul style={{ listStyle: "none", padding: 0, margin: "28px 0 0", display: "grid", gap: 12 }}>
              {["Personalised career matches", "30-day action plan", "Skill roadmap built for you"].map((b) => (
                <li key={b} style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 15, color: TEXT }}>
                  <span style={{ width: 22, height: 22, borderRadius: "50%", background: "rgba(59,130,246,.12)", display: "grid", placeItems: "center", color: ACCENT }}>
                    <I d="<path d='M5 12l5 5L20 7'/>" size={13} stroke={ACCENT} sw={2.5} />
                  </span>
                  {b}
                </li>
              ))}
            </ul>
          </div>

          <div className="ws-reveal">
            <ResultPreviewCard />
          </div>
        </div>
      </section>

      {/* ───────────── HOW IT WORKS ───────────── */}
      <section id="how" style={{ padding: "110px 0", background: BG2, borderTop: `1px solid ${BORDER}`, borderBottom: `1px solid ${BORDER}` }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>
          <div className="ws-reveal" style={{ textAlign: "center", maxWidth: 720, margin: "0 auto 60px" }}>
            <h2 style={{ fontSize: 42, fontWeight: 700, margin: 0, letterSpacing: -1, color: TEXT }}>How It Works</h2>
            <p style={{ fontSize: 17, color: TEXT2, marginTop: 14 }}>Three simple steps to your career blueprint.</p>
          </div>

          <div style={{ position: "relative" }}>
            {/* Connecting line */}
            <div aria-hidden style={{ position: "absolute", top: 56, left: "12%", right: "12%", height: 2, background: `linear-gradient(90deg, transparent, ${ACCENT}55, transparent)` }} />
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 32, position: "relative" }}>
              {[
                { n: 1, t: "Answer a Few Questions", d: "15 quick, thoughtful questions about how you think and what excites you.", i: "<path d='M21 12a9 9 0 1 1-3-6.7'/><path d='M21 4v5h-5'/>" },
                { n: 2, t: "We Analyze Your Profile", d: "Our AI cross-references your answers with thousands of real career paths.", i: "<circle cx='12' cy='12' r='3'/><path d='M19 12a7 7 0 1 1-14 0 7 7 0 0 1 14 0z'/>" },
                { n: 3, t: "Get Your Career Blueprint", d: "Personalised matches, skills to build, and your first step — clear today.", i: "<path d='M9 11l3 3L22 4'/><path d='M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11'/>" },
              ].map((s) => (
                <div key={s.n} className="ws-reveal ws-card" style={{ background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 20, padding: 32, textAlign: "center", position: "relative" }}>
                  <div style={{ width: 64, height: 64, margin: "0 auto", borderRadius: 18, background: "linear-gradient(135deg,rgba(59,130,246,.12),rgba(59,130,246,.04))", display: "grid", placeItems: "center", color: ACCENT, position: "relative" }}>
                    <I d={s.i} size={28} stroke={ACCENT} />
                    <span style={{ position: "absolute", top: -8, right: -8, width: 26, height: 26, borderRadius: "50%", background: ACCENT, color: "#fff", fontSize: 12, fontWeight: 700, display: "grid", placeItems: "center" }}>{s.n}</span>
                  </div>
                  <h3 style={{ fontSize: 19, fontWeight: 700, marginTop: 22, marginBottom: 10, color: TEXT }}>{s.t}</h3>
                  <p style={{ fontSize: 14.5, color: TEXT2, lineHeight: 1.6, margin: 0 }}>{s.d}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ───────────── FEATURES ───────────── */}
      <section id="features" style={{ padding: "110px 0", background: "#fff" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>
          <div className="ws-reveal" style={{ textAlign: "center", maxWidth: 760, margin: "0 auto 56px" }}>
            <h2 style={{ fontSize: 42, fontWeight: 700, margin: 0, letterSpacing: -1, color: TEXT }}>
              Everything You Need to Plan Your Future
            </h2>
            <p style={{ fontSize: 17, color: TEXT2, marginTop: 14 }}>
              Tools built for students, parents, and counsellors — all in one place.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 24 }}>
            {FEATURES.map((f) => (
              <div key={f.t} className="ws-reveal ws-card" style={{ background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 18, padding: 28 }}>
                <div style={{ width: 48, height: 48, borderRadius: 12, background: "rgba(59,130,246,.1)", display: "grid", placeItems: "center", color: ACCENT, marginBottom: 18 }}>
                  <I d={f.i} size={22} stroke={ACCENT} />
                </div>
                <h3 style={{ fontSize: 17, fontWeight: 700, color: TEXT, margin: "0 0 8px" }}>{f.t}</h3>
                <p style={{ fontSize: 14, color: TEXT2, lineHeight: 1.6, margin: 0 }}>{f.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───────────── CTA ───────────── */}
      <section id="cta" style={{ padding: "100px 0", background: ACCENT, position: "relative", overflow: "hidden" }}>
        <div aria-hidden style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 80% 20%, rgba(255,255,255,.18), transparent 50%)" }} />
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px", display: "grid", gridTemplateColumns: "1.1fr .9fr", gap: 56, alignItems: "center", position: "relative" }}>
          <div className="ws-reveal">
            <h2 style={{ fontSize: 46, fontWeight: 700, color: "#fff", lineHeight: 1.1, margin: 0, letterSpacing: -1.2 }}>
              Stop Guessing. Start Planning.
            </h2>
            <p style={{ color: "rgba(255,255,255,.85)", fontSize: 17, lineHeight: 1.7, marginTop: 18, maxWidth: 520 }}>
              Join thousands of students discovering their right career path with WorthScope.
            </p>
            <button onClick={() => navigate("/onboarding")} className="ws-btn-primary" style={{ marginTop: 30, background: "#fff", color: ACCENT, border: "none", padding: "16px 30px", borderRadius: 14, fontWeight: 700, fontSize: 16, cursor: "pointer", fontFamily: FONT, display: "inline-flex", alignItems: "center", gap: 10 }}>
              Start Your Career Assessment
              <I d="<path d='M5 12h14M13 5l7 7-7 7'/>" size={18} stroke={ACCENT} />
            </button>
          </div>

          <div className="ws-reveal">
            <RoadmapPath />
          </div>
        </div>
      </section>

      {/* ───────────── FOOTER ───────────── */}
      <footer style={{ background: "#111111", color: "#9CA3AF", padding: "70px 0 30px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr 1fr 1fr", gap: 40 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <img src={logo} alt="WorthScope" style={{ height: 32, width: "auto", filter: "brightness(0) invert(1)" }} />
                <span style={{ color: "#fff", fontWeight: 700, fontSize: 18 }}>WorthScope</span>
              </div>
              <p style={{ marginTop: 14, fontSize: 14, lineHeight: 1.7, maxWidth: 320 }}>
                See your worth. Build your future. AI-powered career guidance for the next generation of students.
              </p>
            </div>
            {[
              { h: "Company", l: ["About", "Careers", "Press", "Contact"] },
              { h: "Support", l: ["Help Center", "Privacy", "Terms", "Status"] },
              { h: "Social", l: ["Twitter", "LinkedIn", "Instagram", "YouTube"] },
            ].map((c) => (
              <div key={c.h}>
                <div style={{ color: "#fff", fontWeight: 600, fontSize: 14, marginBottom: 16 }}>{c.h}</div>
                <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: 10 }}>
                  {c.l.map((i) => (
                    <li key={i}><a href="#" style={{ color: "#9CA3AF", textDecoration: "none", fontSize: 14, transition: "color .2s" }} onMouseEnter={(e) => (e.currentTarget.style.color = "#fff")} onMouseLeave={(e) => (e.currentTarget.style.color = "#9CA3AF")}>{i}</a></li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 50, paddingTop: 24, borderTop: "1px solid rgba(255,255,255,.08)", fontSize: 13, color: "#6B7280", textAlign: "center" }}>
            © 2026 WorthScope. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}

/* ───────────────────────────── COMPONENTS ───────────────────────────── */

function JourneyDiagram({ active }: { active: number }) {
  return (
    <div style={{ position: "relative", height: "100%", width: "100%" }}>
      {/* curved path */}
      <svg viewBox="0 0 320 560" width="100%" height="100%" style={{ position: "absolute", inset: 0 }}>
        <defs>
          <linearGradient id="jpath" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={ACCENT} stopOpacity="0.25" />
            <stop offset="50%" stopColor={ACCENT} stopOpacity="0.85" />
            <stop offset="100%" stopColor={ACCENT} stopOpacity="0.25" />
          </linearGradient>
        </defs>
        <path
          d="M160,30 C 80,120 240,200 160,290 C 80,380 240,460 160,540"
          fill="none"
          stroke="url(#jpath)"
          strokeWidth="2.5"
          strokeDasharray="6 6"
          style={{ animation: "ws-dash 2.5s linear infinite" }}
        />
      </svg>

      {/* nodes */}
      {JOURNEY.map((n, i) => {
        const ys = [40, 160, 280, 400, 520];
        const xs = [160, 80, 240, 80, 160];
        const isActive = i === active;
        const isPast = i < active;
        return (
          <div
            key={n.label}
            style={{
              position: "absolute",
              top: ys[i] - 30,
              left: `calc(${(xs[i] / 320) * 100}% - 30px)`,
              animation: `ws-float ${3 + i * 0.4}s ease-in-out infinite`,
              animationDelay: `${i * 0.2}s`,
            }}
          >
            <div
              style={{
                width: 60, height: 60, borderRadius: "50%",
                background: isActive ? ACCENT : isPast ? "rgba(59,130,246,.15)" : "#fff",
                color: isActive ? "#fff" : isPast ? ACCENT : TEXT2,
                border: `2px solid ${isActive || isPast ? ACCENT : BORDER}`,
                display: "grid", placeItems: "center",
                boxShadow: isActive ? "0 12px 28px -8px rgba(59,130,246,.55)" : "0 6px 18px -8px rgba(17,17,17,.15)",
                animation: isActive ? "ws-pulse-ring 2s ease-in-out infinite" : undefined,
                transition: "all .4s ease",
              }}
            >
              <I d={n.icon} size={24} stroke={isActive ? "#fff" : isPast ? ACCENT : TEXT2} />
            </div>
            <div
              style={{
                position: "absolute",
                top: 68,
                left: "50%",
                transform: "translateX(-50%)",
                whiteSpace: "nowrap",
                fontSize: 12,
                fontWeight: isActive ? 700 : 500,
                color: isActive ? TEXT : TEXT2,
                background: "#fff",
                padding: "4px 10px",
                borderRadius: 8,
                border: `1px solid ${BORDER}`,
                boxShadow: "0 4px 10px -4px rgba(17,17,17,.08)",
              }}
            >
              {n.label}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ConfusionDiagram() {
  const fields = ["Medicine", "Engineering", "Business", "Design", "Tech", "Law", "Finance", "Arts"];
  return (
    <div style={{ position: "relative", height: 420, width: "100%" }}>
      <svg viewBox="0 0 420 420" width="100%" height="100%" style={{ position: "absolute", inset: 0 }}>
        {fields.map((_, i) => {
          const angle = (i / fields.length) * Math.PI * 2;
          const x = 210 + Math.cos(angle) * 160;
          const y = 210 + Math.sin(angle) * 160;
          return <line key={i} x1={210} y1={210} x2={x} y2={y} stroke={BORDER} strokeWidth="1" strokeDasharray="4 4" />;
        })}
      </svg>

      {/* center user */}
      <div style={{
        position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)",
        width: 88, height: 88, borderRadius: "50%", background: "#fff", border: `2px solid ${ACCENT}`,
        display: "grid", placeItems: "center", color: ACCENT,
        boxShadow: "0 12px 28px -8px rgba(59,130,246,.4)",
        animation: "ws-pulse-ring 2.4s ease-in-out infinite",
      }}>
        <I d="<circle cx='12' cy='8' r='4'/><path d='M4 21c0-4 4-7 8-7s8 3 8 7'/>" size={36} stroke={ACCENT} />
      </div>

      {/* field pills */}
      {fields.map((f, i) => {
        const angle = (i / fields.length) * Math.PI * 2;
        const x = 50 + Math.cos(angle) * 38;
        const y = 50 + Math.sin(angle) * 38;
        return (
          <div
            key={f}
            style={{
              position: "absolute",
              top: `${y}%`, left: `${x}%`,
              transform: "translate(-50%,-50%)",
              padding: "8px 14px",
              background: "#fff",
              border: `1px solid ${BORDER}`,
              borderRadius: 999,
              fontSize: 13,
              fontWeight: 500,
              color: TEXT,
              boxShadow: "0 6px 16px -8px rgba(17,17,17,.15)",
              animation: `ws-float ${3 + (i % 3)}s ease-in-out infinite`,
              animationDelay: `${i * 0.15}s`,
              whiteSpace: "nowrap",
            }}
          >
            {f}
          </div>
        );
      })}
    </div>
  );
}

function ResultPreviewCard() {
  return (
    <div
      style={{
        background: "#fff",
        border: `1px solid ${BORDER}`,
        borderRadius: 22,
        padding: 28,
        boxShadow: "0 30px 60px -30px rgba(17,17,17,.18)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div aria-hidden style={{ position: "absolute", top: -60, right: -60, width: 200, height: 200, borderRadius: "50%", background: "radial-gradient(circle, rgba(59,130,246,.18), transparent 70%)" }} />
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", position: "relative" }}>
        <span style={{ fontSize: 12, fontWeight: 600, padding: "5px 10px", borderRadius: 999, background: "rgba(59,130,246,.1)", color: ACCENT }}>YOUR TOP MATCH</span>
        <span style={{ fontSize: 12, color: TEXT2 }}>Updated today</span>
      </div>
      <h3 style={{ fontSize: 24, fontWeight: 700, marginTop: 18, marginBottom: 6, color: TEXT, letterSpacing: -0.5 }}>Product Designer</h3>
      <p style={{ fontSize: 14, color: TEXT2, margin: 0 }}>Creative + analytical · Strong fit for your strengths</p>

      <div style={{ marginTop: 22 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
          <span style={{ fontSize: 13, color: TEXT2 }}>Match score</span>
          <span style={{ fontSize: 13, fontWeight: 700, color: ACCENT }}>87%</span>
        </div>
        <div style={{ height: 8, background: BG2, borderRadius: 999, overflow: "hidden" }}>
          <div style={{ width: "87%", height: "100%", background: `linear-gradient(90deg, ${ACCENT}, ${ACCENT_DARK})`, borderRadius: 999, animation: "ws-glow 3s ease-in-out infinite" }} />
        </div>
      </div>

      <div style={{ marginTop: 22, padding: 14, borderRadius: 14, background: BG2, display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: "#fff", border: `1px solid ${BORDER}`, display: "grid", placeItems: "center", color: ACCENT }}>
          <I d="<path d='M12 2l3 7h7l-5.5 4.5L18 21l-6-4-6 4 1.5-7.5L2 9h7z'/>" size={18} stroke={ACCENT} />
        </div>
        <div>
          <div style={{ fontSize: 13.5, fontWeight: 600, color: TEXT }}>30-day action plan ready</div>
          <div style={{ fontSize: 12, color: TEXT2 }}>Personalised for your strengths and goals</div>
        </div>
      </div>
    </div>
  );
}

function RoadmapPath() {
  return (
    <div style={{ position: "relative", height: 380, background: "rgba(255,255,255,.08)", borderRadius: 22, padding: 24, border: "1px solid rgba(255,255,255,.15)", backdropFilter: "blur(10px)" }}>
      <svg viewBox="0 0 360 340" width="100%" height="100%">
        <defs>
          <linearGradient id="rmp" x1="0" y1="1" x2="1" y2="0">
            <stop offset="0%" stopColor="#fff" stopOpacity=".4" />
            <stop offset="100%" stopColor="#fff" stopOpacity="1" />
          </linearGradient>
        </defs>
        <path
          d="M30,300 C 100,260 80,180 180,160 C 280,140 260,60 330,40"
          fill="none"
          stroke="url(#rmp)"
          strokeWidth="3"
          strokeDasharray="8 6"
          style={{ animation: "ws-dash 3s linear infinite" }}
        />
        {[
          { x: 30, y: 300, l: "START" },
          { x: 130, y: 230, l: "Discovery" },
          { x: 230, y: 130, l: "Skill Building" },
          { x: 330, y: 40, l: "YOUR GOAL" },
        ].map((n, i) => (
          <g key={n.l}>
            <circle cx={n.x} cy={n.y} r={i === 3 ? 14 : 10} fill="#fff" style={{ animation: `ws-float ${2.5 + i * 0.3}s ease-in-out infinite` }} />
            {i === 3 && <circle cx={n.x} cy={n.y} r="22" fill="none" stroke="#fff" strokeOpacity=".5" strokeWidth="1.5" style={{ animation: "ws-pulse-ring 2s ease-in-out infinite" }} />}
            <text x={n.x} y={n.y - 22} textAnchor="middle" fill="#fff" fontSize="12" fontWeight="600" fontFamily={FONT}>{n.l}</text>
          </g>
        ))}
      </svg>
    </div>
  );
}
