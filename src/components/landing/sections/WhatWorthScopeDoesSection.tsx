import { useState } from "react";
import { motion } from "framer-motion";
import { PAPER, PAPER_DIM, BLUE_BRIGHT, FONT, LINE } from "../../experience/theme";

const CARDS = [
  { t: "Career Pathway", d: "Discover career directions based on your interests, skills and potential.", detail: "Matched against real role requirements — not generic quizzes.", i: "<path d='M4 20l4-4 4 4 8-8'/><circle cx='20' cy='12' r='2'/>" },
  { t: "Skill Gap Scanner", d: "See what you're missing for the career or opportunity you're targeting.", detail: "Ranked by what matters most for your target direction.", i: "<circle cx='11' cy='11' r='7'/><path d='M21 21l-4.3-4.3'/>" },
  { t: "Course Intelligence", d: "Find learning opportunities that actually connect to your goals.", detail: "Every recommendation comes with a reason, not a random list.", i: "<path d='M4 19V6a2 2 0 0 1 2-2h12v15H6a2 2 0 0 0-2 2z'/><path d='M8 7h8'/>" },
  { t: "Future Earning Simulator", d: "Explore how different skills and career paths can influence your earning potential.", detail: "Illustrative ranges, grounded in market data — never a promise.", i: "<path d='M3 17l6-6 4 4 7-7'/><path d='M14 8h7v7'/>" },
  { t: "University Match", d: "Discover educational paths that align with your interests and career direction.", detail: "Works backwards from career to course to requirements.", i: "<path d='M22 10L12 5 2 10l10 5 10-5z'/><path d='M6 12v5c0 1.5 2.7 3 6 3s6-1.5 6-3v-5'/>" },
  { t: "Opportunity Matching", d: "Connect your profile with relevant internships, jobs and opportunities when you're ready.", detail: "Surfaced only once your readiness actually supports it.", i: "<rect x='3' y='7' width='18' height='13' rx='2'/><path d='M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2'/>" },
];

export default function WhatWorthScopeDoesSection() {
  return (
    <section id="what-worthscope-does" style={{ padding: "120px 24px" }}>
      <div style={{ maxWidth: 760, margin: "0 auto 56px", textAlign: "center" }}>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.8 }}
          style={{ fontFamily: FONT, fontWeight: 700, fontSize: "clamp(28px,4.4vw,46px)", color: PAPER, letterSpacing: -0.8, margin: 0 }}
        >
          From Confusion to <span style={{ color: BLUE_BRIGHT }}>Clarity.</span>
        </motion.h2>
      </div>

      <div className="wsx-cards-grid" style={{ maxWidth: 1200, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 20 }}>
        {CARDS.map((c, i) => (
          <Card key={c.t} card={c} delay={i * 0.06} />
        ))}
      </div>

      <style>{`
        @media (max-width: 900px) { .wsx-cards-grid { grid-template-columns: 1fr 1fr !important; } }
        @media (max-width: 600px) { .wsx-cards-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </section>
  );
}

function Card({ card, delay }: { card: (typeof CARDS)[number]; delay: number }) {
  const [hover, setHover] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{ duration: 0.6, delay }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      whileHover={{ y: -6 }}
      style={{
        borderRadius: 20,
        padding: 26,
        background: hover ? "rgba(59,130,246,.06)" : "rgba(255,255,255,.02)",
        border: `1px solid ${hover ? BLUE_BRIGHT : LINE}`,
        transition: "background .3s ease, border-color .3s ease",
        boxShadow: hover ? `0 24px 50px -28px ${BLUE_BRIGHT}55` : "none",
      }}
    >
      <div style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(59,130,246,.12)", display: "grid", placeItems: "center", color: BLUE_BRIGHT, marginBottom: 16 }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={BLUE_BRIGHT} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" dangerouslySetInnerHTML={{ __html: card.i }} />
      </div>
      <h3 style={{ fontFamily: FONT, fontWeight: 700, fontSize: 16, color: PAPER, margin: "0 0 8px" }}>{card.t}</h3>
      <p style={{ fontFamily: FONT, fontSize: 13.5, color: PAPER_DIM, lineHeight: 1.6, margin: 0 }}>{card.d}</p>
      <motion.p
        initial={false}
        animate={{ opacity: hover ? 1 : 0, height: hover ? "auto" : 0 }}
        transition={{ duration: 0.25 }}
        style={{ fontFamily: FONT, fontSize: 12.5, color: BLUE_BRIGHT, lineHeight: 1.5, margin: 0, marginTop: hover ? 10 : 0, overflow: "hidden" }}
      >
        {card.detail}
      </motion.p>
    </motion.div>
  );
}
