import { useState } from "react";
import { StepFrame, OptionCard, NavRow, CardGrid } from "./shared";

const ACTIVITIES = [
  "Building or fixing things",
  "Designing visuals or experiences",
  "Solving logical or technical problems",
  "Writing or storytelling",
  "Analyzing data or patterns",
  "Leading or organizing people",
  "Persuading or selling ideas",
  "Helping or teaching others",
  "Researching and learning",
  "Planning and strategizing",
];

const MAX = 2;

export default function Q3Activities({
  value,
  onBack,
  onContinue,
}: {
  value: string[];
  onBack: () => void;
  onContinue: (v: string[]) => void;
}) {
  const [picked, setPicked] = useState<string[]>(value);

  function toggle(activity: string) {
    if (picked.includes(activity)) {
      setPicked(picked.filter((a) => a !== activity));
      return;
    }
    setPicked(picked.length >= MAX ? [...picked.slice(1), activity] : [...picked, activity]);
  }

  return (
    <StepFrame eyebrow="Question 3 of 6" title="What keeps you engaged?" subtitle={`Pick up to ${MAX} activities that genuinely hold your attention.`} wide>
      <CardGrid columns={2}>
        {ACTIVITIES.map((a) => (
          <OptionCard key={a} label={a} selected={picked.includes(a)} onClick={() => toggle(a)} />
        ))}
      </CardGrid>
      <NavRow onBack={onBack} onContinue={() => onContinue(picked)} continueDisabled={picked.length === 0} />
    </StepFrame>
  );
}
