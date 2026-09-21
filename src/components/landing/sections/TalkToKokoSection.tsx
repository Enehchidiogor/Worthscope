import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import KokoFace from "../../experience/KokoFace";
import MagneticButton from "../MagneticButton";
import { PAPER, PAPER_DIM, BLUE_BRIGHT, FONT, LINE } from "../../experience/theme";

const RESPONSES: Record<string, string> = {
  "Building things": "That's a maker's instinct — you'd likely enjoy paths like engineering, software, or product design.",
  "Solving problems": "Analytical mind. Careers in data, strategy, or software tend to fit that well.",
  Designing: "Visual thinking — UI/UX, product design, or content design could be strong fits.",
  "Working with people": "People-first. Product management, teaching, or customer-facing roles often suit that best.",
};

export default function TalkToKokoSection() {
  const navigate = useNavigate();
  const [picked, setPicked] = useState<string | null>(null);
  const [talking, setTalking] = useState(false);

  const pick = (label: string) => {
    setPicked(label);
    setTalking(true);
    window.setTimeout(() => setTalking(false), 1600);
  };

  return (
    <section id="talk-to-koko" style={{ padding: "120px 24px" }}>
      <div style={{ maxWidth: 720, margin: "0 auto", textAlign: "center" }}>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.8 }}
          style={{ fontFamily: FONT, fontWeight: 700, fontSize: "clamp(28px,4.4vw,46px)", color: PAPER, letterSpacing: -0.8, margin: 0 }}
        >
          Meet Koko.
          <br />
          Your <span style={{ color: BLUE_BRIGHT }}>Career Intelligence</span> Assistant.
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          style={{ marginTop: 18, color: PAPER_DIM, fontFamily: FONT, fontSize: 15.5, lineHeight: 1.7, maxWidth: 520, margin: "18px auto 0" }}
        >
          Koko doesn&rsquo;t just give you answers. Koko helps you understand yourself — ask about careers, skills, earning potential, courses, opportunities, or your
          next move.
        </motion.p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 0.8, delay: 0.15 }}
        style={{
          maxWidth: 560,
          margin: "48px auto 0",
          borderRadius: 26,
          padding: "32px 28px",
          background: "rgba(255,255,255,.03)",
          border: `1px solid ${LINE}`,
          backdropFilter: "blur(14px)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <span style={{ background: "rgba(255,255,255,.06)", borderRadius: 16, borderBottomRightRadius: 4, padding: "10px 16px", fontFamily: FONT, fontSize: 13.5, color: PAPER, maxWidth: 320 }}>
            I like technology but I don&rsquo;t know what career fits me.
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginTop: 18 }}>
          <KokoFace expression={talking ? "talking" : picked ? "happy" : "listening"} talking={talking} size={54} lookAtCursor={false} />
          <div
            style={{
              background: "rgba(59,130,246,.1)",
              border: `1px solid ${BLUE_BRIGHT}44`,
              borderRadius: 16,
              borderTopLeftRadius: 4,
              padding: "10px 16px",
              maxWidth: 340,
            }}
          >
            <AnimatePresence mode="wait">
              <motion.p
                key={picked || "intro"}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.3 }}
                style={{ margin: 0, fontFamily: FONT, fontSize: 13.5, color: PAPER, lineHeight: 1.55 }}
              >
                {picked ? RESPONSES[picked] : "Let's figure that out. Tell me what you enjoy doing most."}
              </motion.p>
            </AnimatePresence>
          </div>
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 20, justifyContent: "center" }}>
          {Object.keys(RESPONSES).map((label) => (
            <button
              key={label}
              onClick={() => pick(label)}
              style={{
                background: picked === label ? "rgba(59,130,246,.16)" : "rgba(255,255,255,.03)",
                border: `1px solid ${picked === label ? BLUE_BRIGHT : LINE}`,
                borderRadius: 999,
                padding: "9px 16px",
                fontFamily: FONT,
                fontWeight: 600,
                fontSize: 12.5,
                color: PAPER,
                cursor: "pointer",
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </motion.div>

      <div style={{ textAlign: "center", marginTop: 32 }}>
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
          Talk to Koko →
        </MagneticButton>
      </div>
    </section>
  );
}
