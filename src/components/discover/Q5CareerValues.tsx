import { useState } from "react";
import type { CareerValue } from "@/lib/careerIntelligence";
import { PAPER, PAPER_DIM, PAPER_FAINT, LINE, BLUE_BRIGHT, FONT } from "@/components/experience/theme";
import { StepFrame, OptionCard, NavRow, CardGrid } from "./shared";

const VALUES = [
  "High earning potential",
  "Job security",
  "Creative freedom",
  "Work-life balance",
  "Making a real impact",
  "Continuous learning",
  "Leadership opportunities",
  "Flexibility & remote work",
  "Recognition & status",
  "Innovation & cutting-edge work",
  "Helping others directly",
];

const MAX = 5;

export default function Q5CareerValues({
  value,
  onBack,
  onContinue,
}: {
  value: CareerValue[];
  onBack: () => void;
  onContinue: (v: CareerValue[]) => void;
}) {
  const [picked, setPicked] = useState<CareerValue[]>([...value].sort((a, b) => a.rank - b.rank));

  function toggle(v: string) {
    const exists = picked.find((p) => p.value === v);
    if (exists) {
      setPicked(picked.filter((p) => p.value !== v).map((p, i) => ({ value: p.value, rank: i + 1 })));
      return;
    }
    if (picked.length >= MAX) return;
    setPicked([...picked, { value: v, rank: picked.length + 1 }]);
  }

  function move(index: number, dir: -1 | 1) {
    const target = index + dir;
    if (target < 0 || target >= picked.length) return;
    const next = [...picked];
    [next[index], next[target]] = [next[target], next[index]];
    setPicked(next.map((p, i) => ({ value: p.value, rank: i + 1 })));
  }

  return (
    <StepFrame eyebrow="Question 5 of 6" title="What matters most to you?" subtitle={`Tap up to ${MAX} — you'll rank them next.`} wide>
      <CardGrid columns={2}>
        {VALUES.map((v) => {
          const sel = picked.find((p) => p.value === v);
          return <OptionCard key={v} label={v} selected={!!sel} badge={sel?.rank} onClick={() => toggle(v)} />;
        })}
      </CardGrid>

      {picked.length > 0 && (
        <div style={{ marginTop: 30 }}>
          <div style={{ fontFamily: FONT, fontSize: 12, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", color: PAPER_FAINT, marginBottom: 12 }}>
            Your ranking — most important first
          </div>
          <div style={{ display: "grid", gap: 8 }}>
            {picked.map((p, i) => (
              <div
                key={p.value}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "12px 14px",
                  borderRadius: 12,
                  background: "rgba(255,255,255,.025)",
                  border: `1px solid ${LINE}`,
                }}
              >
                <span style={{ width: 22, height: 22, borderRadius: "50%", background: BLUE_BRIGHT, color: "#04070D", fontSize: 11, fontWeight: 800, display: "grid", placeItems: "center", flexShrink: 0 }}>
                  {i + 1}
                </span>
                <span style={{ flex: 1, fontFamily: FONT, fontSize: 13.5, color: PAPER }}>{p.value}</span>
                <div style={{ display: "flex", gap: 4 }}>
                  <ArrowBtn dir="up" disabled={i === 0} onClick={() => move(i, -1)} />
                  <ArrowBtn dir="down" disabled={i === picked.length - 1} onClick={() => move(i, 1)} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <NavRow onBack={onBack} onContinue={() => onContinue(picked)} continueDisabled={picked.length === 0} />
    </StepFrame>
  );
}

function ArrowBtn({ dir, disabled, onClick }: { dir: "up" | "down"; disabled: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={dir === "up" ? "Move up" : "Move down"}
      style={{
        width: 26,
        height: 26,
        borderRadius: 8,
        border: `1px solid ${LINE}`,
        background: "transparent",
        color: disabled ? PAPER_FAINT : PAPER_DIM,
        cursor: disabled ? "default" : "pointer",
        display: "grid",
        placeItems: "center",
        opacity: disabled ? 0.4 : 1,
      }}
    >
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        {dir === "up" ? <polyline points="18 15 12 9 6 15" /> : <polyline points="6 9 12 15 18 9" />}
      </svg>
    </button>
  );
}
