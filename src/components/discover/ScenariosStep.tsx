import { useState } from "react";
import { motion } from "framer-motion";
import { SCENARIOS } from "@/lib/careerQuestions";
import { PAPER, LINE, BLUE_BRIGHT, FONT } from "@/components/experience/theme";
import { StepFrame, NavRow } from "./shared";

/** "What would you do?" — one real-life situation per screen. */
export default function ScenariosStep({
  eyebrow,
  value,
  onBack,
  onContinue,
}: {
  eyebrow: string;
  value: Record<string, string>;
  onBack: () => void;
  onContinue: (v: Record<string, string>) => void;
}) {
  const [answers, setAnswers] = useState<Record<string, string>>(value);
  const [i, setI] = useState(0);
  const scenario = SCENARIOS[i];
  const current = answers[scenario.id];

  function pick(optionId: string) {
    const next = { ...answers, [scenario.id]: optionId };
    setAnswers(next);
    if (i < SCENARIOS.length - 1) setI(i + 1);
    else onContinue(next);
  }

  return (
    <StepFrame eyebrow={`${eyebrow} — situation ${i + 1}/${SCENARIOS.length}`} title={scenario.prompt} subtitle="There's no right answer — pick what you'd honestly do.">
      <div style={{ display: "grid", gap: 10 }}>
        {scenario.options.map((o) => (
          <motion.button
            key={o.id}
            type="button"
            onClick={() => pick(o.id)}
            whileTap={{ scale: 0.98 }}
            style={{
              textAlign: "left",
              padding: "16px 18px",
              borderRadius: 14,
              cursor: "pointer",
              background: current === o.id ? "rgba(96,165,250,.10)" : "rgba(255,255,255,.025)",
              border: `1.5px solid ${current === o.id ? BLUE_BRIGHT : LINE}`,
              fontFamily: FONT,
              fontWeight: 600,
              fontSize: 14.5,
              color: PAPER,
            }}
          >
            {o.label}
          </motion.button>
        ))}
      </div>
      <div style={{ marginTop: 18, display: "flex", gap: 6 }}>
        {SCENARIOS.map((s, idx) => (
          <div key={s.id} style={{ height: 3, flex: 1, borderRadius: 999, background: idx <= i ? BLUE_BRIGHT : LINE }} />
        ))}
      </div>
      <NavRow
        onBack={() => (i === 0 ? onBack() : setI(i - 1))}
        onContinue={() => current && pick(current)}
        continueDisabled={!current}
        continueLabel={i < SCENARIOS.length - 1 ? "Next" : "Continue"}
      />
    </StepFrame>
  );
}
