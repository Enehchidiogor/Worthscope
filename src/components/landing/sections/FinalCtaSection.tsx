import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import MagneticButton from "../MagneticButton";
import { PAPER, PAPER_DIM, BLUE_BRIGHT, FONT } from "../../experience/theme";

export default function FinalCtaSection() {
  const navigate = useNavigate();
  return (
    <section style={{ padding: "130px 24px", textAlign: "center" }}>
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 0.8 }}
        style={{ fontFamily: FONT, fontWeight: 700, fontSize: "clamp(30px,5.5vw,54px)", color: PAPER, letterSpacing: -1, margin: 0 }}
      >
        So... What&rsquo;s Your <span style={{ color: BLUE_BRIGHT }}>Worth?</span>
      </motion.h2>
      <p style={{ marginTop: 18, maxWidth: 460, margin: "18px auto 0", fontFamily: FONT, color: PAPER_DIM, fontSize: 16, lineHeight: 1.6 }}>
        Your next opportunity could start with understanding where you are right now.
      </p>
      <div style={{ display: "flex", gap: 14, marginTop: 34, flexWrap: "wrap", justifyContent: "center" }}>
        <MagneticButton
          onClick={() => navigate("/signup")}
          style={{ background: BLUE_BRIGHT, color: "#04070D", border: "none", borderRadius: 999, padding: "16px 30px", fontFamily: FONT, fontWeight: 700, fontSize: 14, cursor: "pointer", boxShadow: `0 0 30px ${BLUE_BRIGHT}77` }}
        >
          Discover My Worth →
        </MagneticButton>
        <MagneticButton
          onClick={() => document.getElementById("talk-to-koko")?.scrollIntoView({ behavior: "smooth" })}
          style={{ background: "transparent", color: PAPER, border: "1.5px solid rgba(255,255,255,.25)", borderRadius: 999, padding: "16px 30px", fontFamily: FONT, fontWeight: 700, fontSize: 14, cursor: "pointer" }}
        >
          Talk to Koko →
        </MagneticButton>
      </div>
    </section>
  );
}
