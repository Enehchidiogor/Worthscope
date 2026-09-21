import { useState } from "react";
import type { ScoredOption } from "@/lib/careerQuestions";
import { PAPER_FAINT, FONT } from "@/components/experience/theme";
import { StepFrame, OptionCard, NavRow, CardGrid } from "./shared";

/** Pick-several question used for strengths, experience and dislikes. */
export default function MultiPickStep({
  eyebrow,
  title,
  subtitle,
  options,
  value,
  max,
  optional,
  hint,
  onBack,
  onContinue,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
  options: ScoredOption[];
  value: string[];
  max: number;
  /** When true, Continue works with nothing picked (e.g. "I haven't tried any of these"). */
  optional?: boolean;
  hint?: string;
  onBack: () => void;
  onContinue: (ids: string[]) => void;
}) {
  const [picked, setPicked] = useState<string[]>(value);

  function toggle(id: string) {
    if (picked.includes(id)) setPicked(picked.filter((x) => x !== id));
    else setPicked(picked.length >= max ? [...picked.slice(1), id] : [...picked, id]);
  }

  const canContinue = optional || picked.length > 0;

  return (
    <StepFrame eyebrow={eyebrow} title={title} subtitle={subtitle} wide>
      {hint && <p style={{ margin: "-14px 0 18px", fontFamily: FONT, fontSize: 12.5, color: PAPER_FAINT }}>{hint}</p>}
      <CardGrid columns={2} align="start">
        {options.map((o) => (
          <OptionCard key={o.id} label={o.label} info={o.info} selected={picked.includes(o.id)} onClick={() => toggle(o.id)} />
        ))}
      </CardGrid>
      <NavRow
        onBack={onBack}
        onContinue={() => onContinue(picked)}
        continueDisabled={!canContinue}
        continueLabel={optional && picked.length === 0 ? "None of these — continue" : "Continue"}
      />
    </StepFrame>
  );
}
