import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import MagneticButton from "../MagneticButton";
import AnimatedNumber from "../AnimatedNumber";
import { PAPER, PAPER_DIM, BLUE_BRIGHT, FONT, LINE } from "../../experience/theme";

const PRESETS = [
  {
    skills: ["Video Editing", "Social Media", "AI Tools"],
    careers: ["Content Strategist", "Creative Producer", "Social Media Manager"],
    low: 45,
    high: 120,
  },
  {
    skills: ["Programming", "Problem Solving", "Data"],
    careers: ["Software Engineer", "Data Analyst", "Product Engineer"],
    low: 60,
    high: 180,
  },
  {
    skills: ["Design", "Communication", "Research"],
    careers: ["UI/UX Designer", "Product Designer", "Brand Strategist"],
    low: 50,
    high: 140,
  },
];

export default function FutureEarningSection() {
  const navigate = useNavigate();
  const [active, setActive] = useState(0);
  const preset = PRESETS[active];

  return (
    <section style={{ padding: "120px 24px" }}>
      <div style={{ maxWidth: 720, margin: "0 auto 48px", textAlign: "center" }}>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.8 }}
          style={{ fontFamily: FONT, fontWeight: 700, fontSize: "clamp(28px,4.4vw,46px)", color: PAPER, letterSpacing: -0.8, margin: 0 }}
        >
          What Could Your Skills Be <span style={{ color: BLUE_BRIGHT }}>Worth?</span>
        </motion.h2>
      </div>

      <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap", marginBottom: 36 }}>
        {PRESETS.map((p, i) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            style={{
              padding: "10px 16px",
              borderRadius: 999,
              background: active === i ? "rgba(59,130,246,.16)" : "rgba(255,255,255,.03)",
              border: `1px solid ${active === i ? BLUE_BRIGHT : LINE}`,
              color: PAPER,
              fontFamily: FONT,
              fontSize: 12.5,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            {p.skills.join(" + ")}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={active}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.4 }}
          style={{
            maxWidth: 640,
            margin: "0 auto",
            borderRadius: 24,
            padding: "32px 30px",
            background: "rgba(255,255,255,.03)",
            border: `1px solid ${LINE}`,
            textAlign: "center",
          }}
        >
          <p style={{ fontFamily: FONT, fontSize: 11.5, letterSpacing: 1.5, textTransform: "uppercase", color: BLUE_BRIGHT, margin: 0 }}>Potential Career Paths</p>
          <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap", marginTop: 12 }}>
            {preset.careers.map((c) => (
              <span key={c} style={{ padding: "7px 14px", borderRadius: 999, background: "rgba(59,130,246,.1)", border: `1px solid ${BLUE_BRIGHT}44`, color: PAPER, fontFamily: FONT, fontSize: 12.5, fontWeight: 600 }}>
                {c}
              </span>
            ))}
          </div>

          <p style={{ fontFamily: FONT, fontSize: 11.5, letterSpacing: 1.5, textTransform: "uppercase", color: BLUE_BRIGHT, margin: "28px 0 0" }}>Potential Earning Range</p>
          <div style={{ fontFamily: FONT, fontWeight: 700, fontSize: 34, color: PAPER, marginTop: 10, letterSpacing: -0.5 }}>
            $<AnimatedNumber value={preset.low} />k – $<AnimatedNumber value={preset.high} />k
            <span style={{ fontSize: 14, color: PAPER_DIM, fontWeight: 500 }}> / year</span>
          </div>
          <div style={{ height: 8, borderRadius: 999, background: "rgba(255,255,255,.06)", marginTop: 16, overflow: "hidden" }}>
            <motion.div
              initial={{ width: "0%" }}
              animate={{ width: `${(preset.high / 200) * 100}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              style={{ height: "100%", background: `linear-gradient(90deg, ${BLUE_BRIGHT}, #93C5FD)`, borderRadius: 999 }}
            />
          </div>

          <p style={{ marginTop: 18, fontFamily: FONT, fontSize: 11.5, color: "rgba(255,255,255,.4)", lineHeight: 1.5 }}>
            Estimates are based on available market data and individual profiles. Actual earnings vary.
          </p>
        </motion.div>
      </AnimatePresence>

      <div style={{ textAlign: "center", marginTop: 34 }}>
        <MagneticButton
          onClick={() => navigate("/signup")}
          style={{
            background: BLUE_BRIGHT,
            color: "#04070D",
            border: "none",
            borderRadius: 999,
            padding: "15px 28px",
            fontFamily: FONT,
            fontWeight: 700,
            fontSize: 14,
            cursor: "pointer",
            boxShadow: `0 0 26px ${BLUE_BRIGHT}77`,
          }}
        >
          Explore Your Potential →
        </MagneticButton>
      </div>
    </section>
  );
}
