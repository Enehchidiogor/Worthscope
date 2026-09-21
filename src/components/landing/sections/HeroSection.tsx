import { useState, type CSSProperties } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import ExperienceCanvas from "../../experience/ExperienceCanvas";
import KokoFace from "../../experience/KokoFace";
import MagneticButton from "../MagneticButton";
import { PAPER, PAPER_DIM, BLUE_BRIGHT, FONT, EASE, LINE } from "../../experience/theme";

const QUICK_ACTIONS = [
  { key: "path", label: "Discover My Path", reply: "Let's map it out — three questions and I'll show you directions that fit how you think." },
  { key: "skills", label: "Analyze My Skills", reply: "Good instinct. Most people undervalue what they already know how to do — let's find out what you're sitting on." },
  { key: "potential", label: "Show My Potential", reply: "I can show you a realistic range based on where your skills could take you. Ready when you are." },
] as const;

export default function HeroSection() {
  const navigate = useNavigate();
  const [reply, setReply] = useState<string | null>(null);
  const [talking, setTalking] = useState(false);

  const pick = (key: string, replyText: string) => {
    setReply(replyText);
    setTalking(true);
    window.setTimeout(() => setTalking(false), Math.min(2200, replyText.length * 35));
  };

  return (
    <section id="hero" style={{ minHeight: "100vh", position: "relative", display: "flex", alignItems: "center", padding: "120px 24px 80px" }}>
      <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
        <ExperienceCanvas contained />
      </div>

      <div className="wsx-hero-grid" style={{ position: "relative", zIndex: 1, maxWidth: 1240, margin: "0 auto", width: "100%", display: "grid", gridTemplateColumns: "1.1fr .9fr", gap: 56, alignItems: "center" }}>
        {/* LEFT */}
        <div>
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: EASE, delay: 0.15 }}
            style={{ fontFamily: FONT, fontWeight: 700, fontSize: "clamp(38px,5.6vw,68px)", lineHeight: 1.06, letterSpacing: -1.4, color: PAPER, margin: 0 }}
          >
            YOUR FUTURE
            <br />
            SHOULDN&rsquo;T BE A <span style={{ color: BLUE_BRIGHT, textShadow: `0 0 36px ${BLUE_BRIGHT}88` }}>GUESS.</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: EASE, delay: 0.45 }}
            style={{ marginTop: 22, maxWidth: 500, color: PAPER_DIM, fontFamily: FONT, fontSize: 16.5, lineHeight: 1.6 }}
          >
            WorthScope uses AI to help you understand your skills, discover where they can take you, and see what your future could be worth.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: EASE, delay: 0.65 }}
            style={{ display: "flex", gap: 14, marginTop: 34, flexWrap: "wrap" }}
          >
            <MagneticButton onClick={() => navigate("/signup")} style={primaryBtn}>
              Explore Your Worth →
            </MagneticButton>
            <MagneticButton onClick={() => document.getElementById("talk-to-koko")?.scrollIntoView({ behavior: "smooth" })} style={ghostBtn}>
              Talk to Koko
            </MagneticButton>
          </motion.div>
        </div>

        {/* RIGHT — Koko + chat widget */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: EASE, delay: 0.5 }}
          style={{
            borderRadius: 28,
            padding: "36px 28px",
            background: "rgba(255,255,255,.04)",
            backdropFilter: "blur(18px)",
            WebkitBackdropFilter: "blur(18px)",
            border: `1px solid ${LINE}`,
            boxShadow: "0 40px 90px -40px rgba(0,0,0,.7)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <KokoFace expression={talking ? "talking" : reply ? "happy" : "idle"} talking={talking} size={110} />

          <div style={{ marginTop: 18, width: "100%", maxWidth: 360 }}>
            <div
              style={{
                background: "rgba(255,255,255,.03)",
                border: `1px solid ${LINE}`,
                borderRadius: 18,
                borderTopLeftRadius: 4,
                padding: "14px 16px",
              }}
            >
              <AnimatePresence mode="wait">
                <motion.p
                  key={reply || "greeting"}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.35 }}
                  style={{ margin: 0, fontFamily: FONT, fontSize: 14, color: PAPER, lineHeight: 1.55 }}
                >
                  {reply || (
                    <>
                      Hey 👋 I&rsquo;m Koko.
                      <br />
                      Want to find out what your skills could be worth?
                    </>
                  )}
                </motion.p>
              </AnimatePresence>
            </div>

            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 14, justifyContent: "center" }}>
              {QUICK_ACTIONS.map((a) => (
                <button key={a.key} onClick={() => pick(a.key, a.reply)} style={chipBtn}>
                  {a.label}
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .wsx-hero-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}

const primaryBtn: CSSProperties = {
  background: BLUE_BRIGHT,
  color: "#04070D",
  border: "none",
  borderRadius: 999,
  padding: "15px 26px",
  fontFamily: FONT,
  fontWeight: 700,
  fontSize: 14,
  cursor: "pointer",
  boxShadow: `0 0 28px ${BLUE_BRIGHT}77`,
};
const ghostBtn: CSSProperties = {
  background: "transparent",
  color: PAPER,
  border: "1.5px solid rgba(255,255,255,.25)",
  borderRadius: 999,
  padding: "15px 26px",
  fontFamily: FONT,
  fontWeight: 700,
  fontSize: 14,
  cursor: "pointer",
};
const chipBtn: CSSProperties = {
  background: "rgba(59,130,246,.1)",
  border: `1px solid ${BLUE_BRIGHT}55`,
  borderRadius: 999,
  padding: "8px 14px",
  fontFamily: FONT,
  fontWeight: 600,
  fontSize: 12,
  color: PAPER,
  cursor: "pointer",
};
