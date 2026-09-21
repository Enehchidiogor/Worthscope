import { useRef } from "react";
import { motion, useScroll, useTransform, type MotionValue } from "framer-motion";
import { PAPER, PAPER_DIM, BLUE_BRIGHT, FONT, LINE } from "../../experience/theme";

const FLOW = ["YOU", "Skills", "Career Paths", "Skill Gaps", "Opportunities", "Earning Potential"];

export default function DirectionGapSection() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 80%", "end 40%"] });

  return (
    <section id="direction-gap" style={{ padding: "120px 24px", position: "relative" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: "1.1fr .9fr", gap: 60, alignItems: "center" }} className="wsx-grid-2">
        <div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.8 }}
            style={{ fontFamily: FONT, fontWeight: 700, fontSize: "clamp(28px,4.4vw,46px)", color: PAPER, letterSpacing: -0.8, lineHeight: 1.15, margin: 0 }}
          >
            You Don&rsquo;t Need More Information.
            <br />
            You Need <span style={{ color: BLUE_BRIGHT }}>Direction.</span>
          </motion.h2>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.8, delay: 0.15 }}
            style={{ marginTop: 22, color: PAPER_DIM, fontFamily: FONT, fontSize: 15.5, lineHeight: 1.75, maxWidth: 480 }}
          >
            <p style={{ margin: 0 }}>
              Students are constantly told to choose a career, learn a skill, get a degree, or find a job. But very few tools help them understand where they are, what
              they&rsquo;re missing, where they can go, and what they could earn.
            </p>
            <p style={{ marginTop: 14, fontWeight: 600, color: PAPER }}>WorthScope connects those pieces.</p>
          </motion.div>
        </div>

        <div ref={ref} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 0 }}>
          {FLOW.map((item, i) => (
            <FlowNode
              key={item}
              label={item}
              isFirst={i === 0}
              isLast={i === FLOW.length - 1}
              step={i / (FLOW.length - 1)}
              progress={scrollYProgress}
            />
          ))}
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) { .wsx-grid-2 { grid-template-columns: 1fr !important; gap: 40px !important; } }
      `}</style>
    </section>
  );
}

function FlowNode({ label, isFirst, isLast, step, progress }: { label: string; isFirst: boolean; isLast: boolean; step: number; progress: MotionValue<number> }) {
  const lineOpacity = useTransform(progress, [step, step + 0.12], [0.15, 1]);
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <motion.div style={{ opacity: lineOpacity }}>
        <span
          style={{
            display: "inline-block",
            padding: isFirst ? "12px 26px" : "12px 22px",
            borderRadius: 999,
            background: isFirst || isLast ? "rgba(59,130,246,.14)" : "rgba(255,255,255,.03)",
            border: `1px solid ${isFirst || isLast ? BLUE_BRIGHT : LINE}`,
            color: PAPER,
            fontFamily: FONT,
            fontWeight: 700,
            fontSize: isFirst ? 14 : 13,
            letterSpacing: 0.3,
          }}
        >
          {label}
        </span>
      </motion.div>
      {!isLast && (
        <motion.svg width="2" height="34" style={{ opacity: lineOpacity }}>
          <line x1="1" y1="0" x2="1" y2="34" stroke={BLUE_BRIGHT} strokeWidth="2" strokeDasharray="4 4" />
        </motion.svg>
      )}
    </div>
  );
}
