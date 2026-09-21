import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import MagneticButton from "../MagneticButton";
import KokoFace from "../../experience/KokoFace";
import { PAPER, PAPER_DIM, BLUE_BRIGHT, FONT } from "../../experience/theme";

export default function ForProfessionalsSection() {
  const navigate = useNavigate();
  return (
    <section id="for-professionals" style={{ padding: "110px 24px" }}>
      <div className="wsx-grid-2" style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: ".9fr 1.1fr", gap: 56, alignItems: "center" }}>
        <div style={{ display: "flex", justifyContent: "center" }}>
          <KokoFace expression="curious" size={160} />
        </div>
        <div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.8 }}
            style={{ fontFamily: FONT, fontWeight: 700, fontSize: "clamp(26px,4vw,40px)", color: PAPER, letterSpacing: -0.6, lineHeight: 1.15, margin: 0 }}
          >
            Your Degree Is Only One Part of Your <span style={{ color: BLUE_BRIGHT }}>Worth.</span>
          </motion.h2>
          <p style={{ marginTop: 18, color: PAPER_DIM, fontFamily: FONT, fontSize: 15, lineHeight: 1.7, maxWidth: 480 }}>
            Already working or building your career? Discover the skills that can move you forward, identify gaps holding you back, and explore where your experience
            could take you next.
          </p>
          <MagneticButton
            onClick={() => navigate("/signup")}
            style={{ marginTop: 26, background: "transparent", color: PAPER, border: `1.5px solid ${BLUE_BRIGHT}`, borderRadius: 999, padding: "14px 24px", fontFamily: FONT, fontWeight: 700, fontSize: 13.5, cursor: "pointer" }}
          >
            See What&rsquo;s Next
          </MagneticButton>
        </div>
      </div>

      <style>{`
        @media (max-width: 860px) { .wsx-grid-2 { grid-template-columns: 1fr !important; gap: 36px !important; } }
      `}</style>
    </section>
  );
}
