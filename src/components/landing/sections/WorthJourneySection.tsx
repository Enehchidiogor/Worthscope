import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PAPER, PAPER_DIM, BLUE_BRIGHT, FONT, LINE } from "../../experience/theme";

const STEPS = [
  { n: "01", t: "Discover", d: "Understand your interests, strengths and existing skills." },
  { n: "02", t: "Analyze", d: "WorthScope identifies your strengths and skill gaps." },
  { n: "03", t: "Explore", d: "Discover career paths, courses, universities and opportunities." },
  { n: "04", t: "Build", d: "Develop the skills you need through targeted learning." },
  { n: "05", t: "Validate", d: "Test your readiness before moving into opportunities." },
  { n: "06", t: "Earn", d: "Connect your skills to real opportunities and earning potential." },
];

export default function WorthJourneySection() {
  const [active, setActive] = useState(0);

  return (
    <section style={{ padding: "120px 24px", background: "rgba(255,255,255,.015)", borderTop: `1px solid ${LINE}`, borderBottom: `1px solid ${LINE}` }}>
      <div style={{ maxWidth: 760, margin: "0 auto 56px", textAlign: "center" }}>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.8 }}
          style={{ fontFamily: FONT, fontWeight: 700, fontSize: "clamp(28px,4.4vw,46px)", color: PAPER, letterSpacing: -0.8, margin: 0 }}
        >
          Know Where You Are.
          <br />
          Know What&rsquo;s <span style={{ color: BLUE_BRIGHT }}>Next.</span>
        </motion.h2>
      </div>

      <div className="wsx-journey-track" style={{ maxWidth: 1200, margin: "0 auto", display: "flex", justifyContent: "center", gap: 4, flexWrap: "wrap" }}>
        {STEPS.map((s, i) => (
          <div key={s.n} style={{ display: "flex", alignItems: "center" }}>
            <button onClick={() => setActive(i)} style={{ background: "none", border: "none", cursor: "pointer", padding: "0 6px", textAlign: "center" }}>
              <motion.div
                animate={{ scale: active === i ? 1.06 : 1, opacity: active === i ? 1 : 0.55 }}
                transition={{ duration: 0.3 }}
                style={{
                  width: 92,
                  padding: "16px 10px",
                  borderRadius: 16,
                  background: active === i ? "rgba(59,130,246,.14)" : "rgba(255,255,255,.02)",
                  border: `1px solid ${active === i ? BLUE_BRIGHT : LINE}`,
                }}
              >
                <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 11, color: BLUE_BRIGHT, letterSpacing: 1 }}>{s.n}</div>
                <div style={{ fontFamily: FONT, fontWeight: 700, fontSize: 13, color: PAPER, marginTop: 4 }}>{s.t}</div>
              </motion.div>
            </button>
            {i < STEPS.length - 1 && <div style={{ width: 18, height: 2, background: active > i ? BLUE_BRIGHT : LINE }} />}
          </div>
        ))}
      </div>

      <div style={{ minHeight: 40, marginTop: 32, maxWidth: 480, textAlign: "center", margin: "32px auto 0" }}>
        <AnimatePresence mode="wait">
          <motion.p
            key={active}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.3 }}
            style={{ fontFamily: FONT, fontSize: 15.5, color: PAPER_DIM, margin: 0, lineHeight: 1.6 }}
          >
            {STEPS[active].d}
          </motion.p>
        </AnimatePresence>
      </div>

      <style>{`
        @media (max-width: 700px) { .wsx-journey-track { gap: 2px !important; } }
      `}</style>
    </section>
  );
}
