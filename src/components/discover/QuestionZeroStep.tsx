import type { CareerIntent } from "@/lib/careerIntelligence";
import { StepFrame, OptionCard, navPrimaryBtn, CardGrid } from "./shared";

const OPTIONS: { value: CareerIntent; label: string; description: string }[] = [
  { value: "choosing", label: "I don't know what career to choose yet", description: "Help me figure it out from scratch." },
  { value: "exploring", label: "I'm exploring different options", description: "I have some ideas but want to compare them." },
  { value: "career-change", label: "I want to change my current career", description: "I'm in a field that isn't working for me anymore." },
  { value: "grow-current", label: "I want to grow in my current field", description: "I like what I do, I want to go further in it." },
  { value: "earning-potential", label: "I want to know my earning potential", description: "Show me where the money and growth actually are." },
  { value: "opportunities", label: "I want to discover new opportunities", description: "Surprise me with directions I haven't considered." },
];

export default function QuestionZeroStep({
  value,
  onChange,
  onContinue,
}: {
  value: CareerIntent | "";
  onChange: (v: CareerIntent) => void;
  onContinue: () => void;
}) {
  return (
    <StepFrame eyebrow="Before we start" title="What brings you here?" subtitle="Pick whichever fits best — this just helps Koko frame everything else." wide>
      <CardGrid columns={2}>
        {OPTIONS.map((o) => (
          <OptionCard key={o.value} label={o.label} description={o.description} selected={value === o.value} onClick={() => onChange(o.value)} />
        ))}
      </CardGrid>
      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 34 }}>
        <button onClick={onContinue} disabled={!value} style={navPrimaryBtn(!value)}>
          Continue
        </button>
      </div>
    </StepFrame>
  );
}
