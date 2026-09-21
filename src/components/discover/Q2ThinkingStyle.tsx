import { useState } from "react";
import type { ThinkingStyleTrait } from "@/lib/careerIntelligence";
import { PAPER_FAINT, FONT } from "@/components/experience/theme";
import { StepFrame, OptionCard, NavRow, CardGrid } from "./shared";
import { eyebrowFor } from "./flow";

// `name` is what gets saved and scored; `info` is the plain-language explanation.
const TRAITS: { name: string; info: string }[] = [
  {
    name: "Logical & analytical",
    info: "You like working things out step by step and spotting patterns. Example: solving a puzzle, or figuring out why a phone app keeps crashing.",
  },
  {
    name: "Creative & expressive",
    info: "You come up with original ideas and enjoy showing them, through drawing, music, writing, videos, fashion or design. You like making things that feel like you.",
  },
  {
    name: "Big-picture thinker",
    info: "You think about the whole goal first, before the small details. Example: imagining how a whole event should feel before choosing the decorations.",
  },
  {
    name: "Detail-oriented",
    info: "You notice small things other people miss and like getting things exactly right. Example: spotting a spelling mistake or a wrong number straight away.",
  },
  {
    name: "People-focused",
    info: "You care about how people feel and enjoy helping, teaching, leading or convincing others. You'd rather work with people than alone with a screen.",
  },
  {
    name: "Hands-on & practical",
    info: "You learn best by doing and building real things, not just reading about them. Example: you'd rather fix the bike than read the manual.",
  },
  {
    name: "Strategic planner",
    info: "You plan ahead and think a few steps in front. Example: making a revision timetable weeks before exams so you're ready in time.",
  },
  {
    name: "Fast decision-maker",
    info: "You're comfortable choosing quickly with the information you have, and fixing things as you go, instead of waiting until everything is certain.",
  },
  {
    name: "Curious & exploratory",
    info: "You love asking \"why?\" and trying new things just to see what happens. You get bored doing the same thing over and over.",
  },
  {
    name: "Calm under pressure",
    info: "You stay steady when things get stressful, like a tight deadline or an exam, and can still think clearly and help others stay calm.",
  },
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
    <StepFrame eyebrow={eyebrowFor("q2")} title="How do you think?" subtitle={`Pick up to ${MAX}, in the order they fit you best — the first pick matters most.`} wide>
      <p style={{ margin: "-14px 0 18px", fontFamily: FONT, fontSize: 12.5, color: PAPER_FAINT }}>
        Not sure what a word means? Tap the <span style={{ fontFamily: "Georgia, serif", fontStyle: "italic", fontWeight: 700 }}>i</span> on any card for a simple explanation.
      </p>
      <CardGrid columns={2} align="start">
        {TRAITS.map(({ name, info }) => {
          const sel = picked.find((t) => t.trait === name);
          return <OptionCard key={name} label={name} info={info} selected={!!sel} badge={sel?.selectionOrder} onClick={() => toggle(name)} />;
        })}
      </CardGrid>
      <NavRow onBack={onBack} onContinue={() => onContinue(picked)} continueDisabled={picked.length === 0} />
    </StepFrame>
  );
}
