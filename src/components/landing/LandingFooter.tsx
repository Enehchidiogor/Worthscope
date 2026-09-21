import { useNavigate } from "react-router-dom";
import { PAPER, PAPER_DIM, LINE, FONT, BLUE_BRIGHT } from "../experience/theme";

const COLUMNS: { heading: string; links: { label: string; id?: string }[] }[] = [
  {
    heading: "Product",
    links: [
      { label: "Career Pathways", id: "what-worthscope-does" },
      { label: "Skill Intelligence", id: "what-worthscope-does" },
      { label: "Koko", id: "talk-to-koko" },
    ],
  },
  {
    heading: "Who It's For",
    links: [
      { label: "For Students", id: "for-students" },
      { label: "For Professionals", id: "for-professionals" },
      { label: "For Businesses", id: "for-businesses" },
    ],
  },
  {
    heading: "Company",
    links: [{ label: "About" }, { label: "Contact" }],
  },
];

export default function LandingFooter() {
  const navigate = useNavigate();
  const go = (id?: string) => {
    if (id) document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <footer style={{ position: "relative", zIndex: 1, borderTop: `1px solid ${LINE}`, padding: "64px 24px 32px" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 48, justifyContent: "space-between" }}>
          <div style={{ maxWidth: 300 }}>
            <div style={{ fontFamily: FONT, fontWeight: 700, fontSize: 18, color: PAPER, letterSpacing: -0.3 }}>
              Worth<span style={{ color: BLUE_BRIGHT }}>Scope</span>
            </div>
            <p style={{ marginTop: 12, fontSize: 13.5, color: PAPER_DIM, fontFamily: FONT, lineHeight: 1.6 }}>Know Your Worth. Build Your Direction.</p>
            <button
              onClick={() => navigate("/signup")}
              style={{
                marginTop: 18,
                background: BLUE_BRIGHT,
                color: "#04070D",
                border: "none",
                borderRadius: 999,
                padding: "10px 20px",
                fontFamily: FONT,
                fontWeight: 700,
                fontSize: 12.5,
                letterSpacing: 0.3,
                cursor: "pointer",
              }}
            >
              Discover My Worth
            </button>
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", gap: 48 }}>
            {COLUMNS.map((col) => (
              <div key={col.heading}>
                <div style={{ fontFamily: FONT, fontWeight: 700, fontSize: 12, letterSpacing: 1, textTransform: "uppercase", color: PAPER }}>{col.heading}</div>
                <ul style={{ listStyle: "none", padding: 0, margin: "14px 0 0", display: "grid", gap: 10 }}>
                  {col.links.map((l) => (
                    <li key={l.label}>
                      <button
                        onClick={() => go(l.id)}
                        style={{ background: "none", border: "none", padding: 0, cursor: l.id ? "pointer" : "default", fontFamily: FONT, fontSize: 13.5, color: PAPER_DIM, textAlign: "left" }}
                      >
                        {l.label}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            <div>
              <div style={{ fontFamily: FONT, fontWeight: 700, fontSize: 12, letterSpacing: 1, textTransform: "uppercase", color: PAPER }}>Social</div>
              <ul style={{ listStyle: "none", padding: 0, margin: "14px 0 0", display: "grid", gap: 10 }}>
                {["Twitter", "LinkedIn", "Instagram"].map((s) => (
                  <li key={s}>
                    <a href="#" style={{ fontFamily: FONT, fontSize: 13.5, color: PAPER_DIM, textDecoration: "none" }}>
                      {s}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div style={{ marginTop: 48, paddingTop: 24, borderTop: `1px solid ${LINE}`, display: "flex", flexWrap: "wrap", justifyContent: "space-between", gap: 12 }}>
          <p style={{ fontSize: 12, color: "rgba(255,255,255,.35)", fontFamily: FONT, margin: 0 }}>© 2026 WorthScope. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
