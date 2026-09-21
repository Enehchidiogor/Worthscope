import { useState } from "react";
import type { ThinkingStyleTrait } from "@/lib/careerIntelligence";
import { StepFrame, OptionCard, NavRow, CardGrid } from "./shared";

const TRAITS = [
  "Logical & analytical",
  "Creative & expressive",
  "Big-picture thinker",
  "Detail-oriented",
  "People-focused",
  "Hands-on & practical",
  "Strategic planner",
  "Fast decision-maker",
  "Curious & exploratory",
  "Calm under pressure",
];

const MAX = 3;

export default function Q2ThinkingStyle({
  value,
  onBack,
  onContinue,
}: {
  value: ThinkingStyleTrait[];
  onBack: () => void;
  onContinue: (v: ThinkingStyleTrait[]) => void;
}) {
  const [picked, setPicked] = useState<ThinkingStyleTrait[]>(value);

  function toggle(trait: string) {
    const exists = picked.find((t) => t.trait === trait);
    if (exists) {
      setPicked(picked.filter((t) => t.trait !== trait).map((t, i) => ({ trait: t.trait, selectionOrder: i + 1 })));
      return;
    }
    if (picked.length >= MAX) return;
    setPicked([...picked, { trait, selectionOrder: picked.length + 1 }]);
  }

  return (
    <StepFrame eyebrow="Question 2 of 6" title="How do you think?" subtitle={`Pick up to ${MAX}, in the order they fit best — the first pick matters most.`} wide>
      <CardGrid columns={2}>
        {TRAITS.map((trait) => {
          const sel = picked.find((t) => t.trait === trait);
          return (
            <OptionCard key={trait} label={trait} selected={!!sel} badge={sel?.selectionOrder} onClick={() => toggle(trait)} />
          );
        })}
      </CardGrid>
      <NavRow onBack={onBack} onContinue={() => onContinue(picked)} continueDisabled={picked.length === 0} />
    </StepFrame>
  );
}
