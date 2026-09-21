import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import KokoFace from "@/components/experience/KokoFace";
import { PAPER, PAPER_DIM, PAPER_FAINT, FONT, EASE } from "@/components/experience/theme";
import { navPrimaryBtn } from "./shared";

export default function WelcomeStep({ firstName, onStart }: { firstName: string; onStart: () => void }) {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: EASE }}
      style={{ textAlign: "center", maxWidth: 540, margin: "0 auto" }}
    >
      <KokoFace expression="curious" size={100} />

      <h1 style={{ marginTop: 24, fontFamily: FONT, fontWeight: 700, fontSize: "clamp(24px,4vw,32px)", color: PAPER, letterSpacing: -0.7, margin: "24px 0 0" }}>
        Hey {firstName || "there"} — let's find your direction.
      </h1>
      <p style={{ marginTop: 12, color: PAPER_DIM, fontFamily: FONT, fontSize: 15, lineHeight: 1.65 }}>
        Six quick, thoughtful questions — no right answers, just honest ones. Koko will use them to map out career directions that actually fit you.
      </p>

      <div style={{ marginTop: 32, display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
        <button onClick={onStart} style={{ ...navPrimaryBtn(false), padding: "14px 36px", fontSize: 15 }}>
          Start with Koko
        </button>
        <button
          onClick={() => navigate("/dashboard")}
          style={{ background: "transparent", border: "none", color: PAPER_FAINT, fontFamily: FONT, fontSize: 13, cursor: "pointer" }}
        >
          I'll do this later
        </button>
      </div>

      <p style={{ marginTop: 26, color: PAPER_FAINT, fontFamily: FONT, fontSize: 12.5 }}>
        Tip: you can tap the mic on the writing questions and just speak your answer.
      </p>
    </motion.div>
  );
}
