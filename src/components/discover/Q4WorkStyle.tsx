import { useState } from "react";
import { motion } from "framer-motion";
import type { WorkStyle } from "@/lib/careerIntelligence";
import { PAPER, LINE, BLUE_BRIGHT, FONT } from "@/components/experience/theme";
import { StepFrame, NavRow } from "./shared";
import { eyebrowFor } from "./flow";

type PairKey = keyof WorkStyle;

const PAIRS: { key: PairKey; prompt: string; a: { value: string; label: string }; b: { value: string; label: string } }[] = [
  { key: "structure", prompt: "When you work, you'd rather have…", a: { value: "structured", label: "A clear structure and plan" }, b: { value: "flexible", label: "Flexibility to figure it out" } },
  { key: "collaboration", prompt: "You do your best work…", a: { value: "collaborative", label: "With other people" }, b: { value: "independent", label: "On your own" } },
  { key: "execution", prompt: "Given a choice, you'd rather be…", a: { value: "accuracy", label: "Careful and precise" }, b: { value: "speed", label: "Fast and adaptive" } },
  { key: "variety", prompt: "You feel most comfortable with…", a: { value: "stability", label: "A stable, predictable routine" }, b: { value: "variety", label: "Constant variety and change" } },
  { key: "ideasVsExecution", prompt: "You get more energy from…", a: { value: "ideas", label: "Coming up with ideas" }, b: { value: "execution", label: "Actually making them happen" } },
];

export default function Q4WorkStyle({
  value,
  onBack,
  onContinue,
}: {
  value: WorkStyle;
  onBack: () => void;
  onContinue: (v: WorkStyle) => void;
}) {
  const [style, setStyle] = useState<WorkStyle>(value);
  const [i, setI] = useState(0);

  const pair = PAIRS[i];
  const current = style[pair.key];

  function pick(v: string) {
    const next = { ...style, [pair.key]: v } as WorkStyle;
    setStyle(next);
    if (i < PAIRS.length - 1) {
      setI(i + 1);
    } else {
      onContinue(next);
    }
  }

  function back() {
    if (i === 0) {
      onBack();
    } else {
      setI(i - 1);
    }
  }

  return (
    <StepFrame eyebrow={eyebrowFor("q4", ` — choice ${i + 1}/${PAIRS.length}`)} title={pair.prompt}>
      <div style={{ display: "grid", gap: 12 }}>
        {[pair.a, pair.b].map((opt) => (
          <motion.button
            key={opt.value}
            onClick={() => pick(opt.value)}
            whileTap={{ scale: 0.98 }}
            style={{
              textAlign: "left",
              padding: "20px 22px",
              borderRadius: 16,
              cursor: "pointer",
              background: current === opt.value ? "rgba(96,165,250,.10)" : "rgba(255,255,255,.025)",
              border: `1.5px solid ${current === opt.value ? BLUE_BRIGHT : LINE}`,
              fontFamily: FONT,
              fontWeight: 600,
              fontSize: 15.5,
              color: PAPER,
            }}
          >
            {opt.label}
          </motion.button>
        ))}
      </div>
      <div style={{ marginTop: 18, display: "flex", gap: 6 }}>
        {PAIRS.map((p, idx) => (
          <div key={p.key} style={{ height: 3, flex: 1, borderRadius: 999, background: idx <= i ? BLUE_BRIGHT : LINE }} />
        ))}
      </div>
      <NavRow onBack={back} onContinue={() => current && pick(current)} continueDisabled={!current} continueLabel={i < PAIRS.length - 1 ? "Next" : "Continue"} />
    </StepFrame>
  );
}
