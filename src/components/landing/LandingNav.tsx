import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PAPER, BLUE_BRIGHT, FONT, LINE } from "../experience/theme";

const LINKS = [
  { label: "How It Works", id: "direction-gap" },
  { label: "For Students", id: "for-students" },
  { label: "For Professionals", id: "for-professionals" },
  { label: "For Businesses", id: "for-businesses" },
];

export default function LandingNav() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const go = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    setMobileOpen(false);
  };

  return (
    <header
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        background: scrolled ? "rgba(5,7,12,.75)" : "transparent",
        backdropFilter: scrolled ? "blur(16px)" : "none",
        WebkitBackdropFilter: scrolled ? "blur(16px)" : "none",
        borderBottom: `1px solid ${scrolled ? LINE : "transparent"}`,
        transition: "all .35s ease",
      }}
    >
      <div style={{ maxWidth: 1320, margin: "0 auto", padding: "0 24px", height: 80, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <button onClick={() => go("hero")} style={{ background: "none", border: "none", cursor: "pointer", padding: 0, fontFamily: FONT, fontWeight: 700, fontSize: 18, color: PAPER, letterSpacing: -0.4 }}>
          Worth<span style={{ color: BLUE_BRIGHT }}>Scope</span>
        </button>

        <nav className="wsx-nav-links" style={{ display: "flex", gap: 28, alignItems: "center" }}>
          {LINKS.map((l) => (
            <button
              key={l.id}
              onClick={() => go(l.id)}
              style={{ background: "none", border: "none", cursor: "pointer", fontFamily: FONT, fontSize: 13.5, fontWeight: 500, color: "rgba(255,255,255,.7)", letterSpacing: 0.2 }}
            >
              {l.label}
            </button>
          ))}
        </nav>

        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <button
            onClick={() => go("talk-to-koko")}
            className="wsx-meet-koko"
            style={{ background: "none", border: `1px solid ${LINE}`, borderRadius: 999, padding: "9px 16px", cursor: "pointer", fontFamily: FONT, fontSize: 12.5, fontWeight: 600, color: PAPER }}
          >
            Talk to Koko
          </button>
          <button
            onClick={() => navigate("/signup")}
            style={{
              background: BLUE_BRIGHT,
              color: "#04070D",
              border: "none",
              borderRadius: 999,
              padding: "9px 18px",
              cursor: "pointer",
              fontFamily: FONT,
              fontWeight: 700,
              fontSize: 12.5,
              boxShadow: `0 0 20px ${BLUE_BRIGHT}55`,
            }}
          >
            Explore Your Worth
          </button>
          <button onClick={() => setMobileOpen((o) => !o)} className="wsx-mobile-btn" aria-label="Menu" style={{ display: "none", background: "none", border: "none", cursor: "pointer", color: PAPER }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div style={{ background: "rgba(5,7,12,.96)", borderTop: `1px solid ${LINE}`, padding: "14px 24px", display: "flex", flexDirection: "column", gap: 4 }}>
          {LINKS.map((l) => (
            <button key={l.id} onClick={() => go(l.id)} style={{ background: "none", border: "none", textAlign: "left", padding: "10px 0", color: PAPER, fontFamily: FONT, fontSize: 15, cursor: "pointer" }}>
              {l.label}
            </button>
          ))}
          <button onClick={() => go("talk-to-koko")} style={{ background: "none", border: "none", textAlign: "left", padding: "10px 0", color: BLUE_BRIGHT, fontFamily: FONT, fontSize: 15, fontWeight: 700, cursor: "pointer" }}>
            Talk to Koko
          </button>
        </div>
      )}

      <style>{`
        @media (max-width: 900px) {
          .wsx-nav-links, .wsx-meet-koko { display: none !important; }
          .wsx-mobile-btn { display: inline-flex !important; }
        }
      `}</style>
    </header>
  );
}
