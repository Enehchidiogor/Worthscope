import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import MagneticButton from "../MagneticButton";
import { PAPER, PAPER_DIM, BLUE_BRIGHT, FONT, LINE } from "../../experience/theme";

const STAGES = ["Secondary School", "University", "Skills", "Internship", "Career"];

export default function ForStudentsSection() {
  const navigate = useNavigate();
  return (
    <section id="for-students" style={{ padding: "110px 24px" }}>
      <div className="wsx-grid-2" style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 56, alignItems: "center" }}>
        <div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.8 }}
            style={{ fontFamily: FONT, fontWeight: 700, fontSize: "clamp(26px,4vw,40px)", color: PAPER, letterSpacing: -0.6, lineHeight: 1.15, margin: 0 }}
          >
            Start Before You&rsquo;re <span style={{ color: BLUE_BRIGHT }}>Ready.</span>
          </motion.h2>
          <p style={{ marginTop: 18, color: PAPER_DIM, fontFamily: FONT, fontSize: 15, lineHeight: 1.7, maxWidth: 440 }}>
            Your career shouldn&rsquo;t begin after graduation. WorthScope helps students start understanding their strengths, opportunities and career direction while
            they&rsquo;re still in school.
          </p>
          <MagneticButton
            onClick={() => navigate("/signup")}
            style={{ marginTop: 26, background: "transparent", color: PAPER, border: `1.5px solid ${BLUE_BRIGHT}`, borderRadius: 999, padding: "14px 24px", fontFamily: FONT, fontWeight: 700, fontSize: 13.5, cursor: "pointer" }}
          >
            Start Your Journey
          </MagneticButton>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {STAGES.map((s, i) => (
            <motion.div
              key={s}
              initial={{ opacity: 0, x: -14 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.6 }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              style={{ display: "flex", alignItems: "center", gap: 14 }}
            >
              <div style={{ width: 26, height: 26, borderRadius: "50%", background: "rgba(59,130,246,.14)", border: `1px solid ${BLUE_BRIGHT}`, display: "grid", placeItems: "center", color: BLUE_BRIGHT, fontFamily: FONT, fontSize: 11, fontWeight: 700 }}>
                {i + 1}
              </div>
              <span style={{ fontFamily: FONT, fontSize: 14.5, fontWeight: 600, color: PAPER }}>{s}</span>
              {i < STAGES.length - 1 && <div style={{ flex: 1, height: 1, background: LINE }} />}
            </motion.div>
          ))}
        </div>
      </div>

      <style>{`
        @media (max-width: 860px) { .wsx-grid-2 { grid-template-columns: 1fr !important; gap: 36px !important; } }
      `}</style>
    </section>
  );
}
