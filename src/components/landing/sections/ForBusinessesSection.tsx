import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import MagneticButton from "../MagneticButton";
import AnimatedNumber from "../AnimatedNumber";
import { PAPER, PAPER_DIM, BLUE_BRIGHT, FONT, LINE } from "../../experience/theme";

const METRICS = [
  { label: "Skills", value: 88 },
  { label: "Readiness", value: 74 },
  { label: "Experience", value: 62 },
  { label: "Potential", value: 91 },
  { label: "Match", value: 82 },
];

export default function ForBusinessesSection() {
  const navigate = useNavigate();
  return (
    <section id="for-businesses" style={{ padding: "110px 24px" }}>
      <div className="wsx-grid-2" style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 56, alignItems: "center" }}>
        <div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.8 }}
            style={{ fontFamily: FONT, fontWeight: 700, fontSize: "clamp(26px,4vw,40px)", color: PAPER, letterSpacing: -0.6, lineHeight: 1.15, margin: 0 }}
          >
            Find Talent Beyond the <span style={{ color: BLUE_BRIGHT }}>CV.</span>
          </motion.h2>
          <p style={{ marginTop: 18, color: PAPER_DIM, fontFamily: FONT, fontSize: 15, lineHeight: 1.7, maxWidth: 440 }}>
            WorthScope helps businesses understand talent through skills, readiness and potential — not just job titles and certificates.
          </p>
          <MagneticButton
            onClick={() => navigate("/signup")}
            style={{ marginTop: 26, background: "transparent", color: PAPER, border: `1.5px solid ${BLUE_BRIGHT}`, borderRadius: 999, padding: "14px 24px", fontFamily: FONT, fontWeight: 700, fontSize: 13.5, cursor: "pointer" }}
          >
            Explore Talent Intelligence
          </MagneticButton>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.7 }}
          style={{ borderRadius: 22, padding: 26, background: "rgba(255,255,255,.03)", border: `1px solid ${LINE}`, backdropFilter: "blur(10px)" }}
        >
          <p style={{ fontFamily: FONT, fontSize: 11, letterSpacing: 1.5, textTransform: "uppercase", color: BLUE_BRIGHT, margin: 0 }}>Talent Intelligence Snapshot</p>
          <div style={{ display: "grid", gap: 14, marginTop: 18 }}>
            {METRICS.map((m) => (
              <div key={m.label}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ fontFamily: FONT, fontSize: 13, color: PAPER }}>{m.label}</span>
                  <span style={{ fontFamily: FONT, fontSize: 13, fontWeight: 700, color: BLUE_BRIGHT }}>
                    <AnimatedNumber value={m.value} suffix="%" />
                  </span>
                </div>
                <div style={{ height: 6, borderRadius: 999, background: "rgba(255,255,255,.06)", overflow: "hidden" }}>
                  <motion.div
                    initial={{ width: "0%" }}
                    whileInView={{ width: `${m.value}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    style={{ height: "100%", background: `linear-gradient(90deg, ${BLUE_BRIGHT}, #93C5FD)`, borderRadius: 999 }}
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      <style>{`
        @media (max-width: 860px) { .wsx-grid-2 { grid-template-columns: 1fr !important; gap: 36px !important; } }
      `}</style>
    </section>
  );
}
