import { useState } from "react";
import type { CareerValue } from "@/lib/careerIntelligence";
import { PAPER, PAPER_DIM, PAPER_FAINT, LINE, BLUE_BRIGHT, FONT } from "@/components/experience/theme";
import { StepFrame, OptionCard, NavRow, CardGrid } from "./shared";
import { eyebrowFor } from "./flow";

// `name` is what gets saved and scored; `info` is the plain-language explanation.
const VALUES: { name: string; info: string }[] = [
  { name: "High earning potential", info: "Earning a lot of money, even if the work is demanding. Higher-paying careers often need more training or carry more risk." },
  { name: "Job security", info: "Knowing your job is stable and you'll always be able to find work." },
  { name: "Creative freedom", info: "Having room to use your own ideas and style instead of following strict instructions." },
  { name: "Work-life balance", info: "Enough free time for family, friends and hobbies, so work doesn't take over your life." },
  { name: "Making a real impact", info: "Feeling that your work truly changes something for people or your community." },
  { name: "Continuous learning", info: "Always learning new things instead of doing the exact same thing for years." },
  { name: "Leadership opportunities", info: "The chance to lead people, make big decisions and be responsible for results." },
  { name: "Flexibility & remote work", info: "Choosing when and where you work, including from home or while travelling." },
  { name: "Recognition & status", info: "Being respected and known for what you do, with people noticing your achievements." },
  { name: "Innovation & cutting-edge work", info: "Working with the newest technology and ideas before everyone else does." },
  { name: "Helping others directly", info: "Working face to face with people who need support, like teaching, guiding or caring for them." },
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
    <StepFrame eyebrow={eyebrowFor("q5")} title="What matters most to you?" subtitle={`Tap up to ${MAX} — you'll rank them next.`} wide>
      <CardGrid columns={2} align="start">
        {VALUES.map(({ name, info }) => {
          const sel = picked.find((p) => p.value === name);
          return <OptionCard key={name} label={name} info={info} selected={!!sel} badge={sel?.rank} onClick={() => toggle(name)} />;
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
