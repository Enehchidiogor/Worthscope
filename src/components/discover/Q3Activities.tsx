import { useState } from "react";
import { PAPER_FAINT, FONT } from "@/components/experience/theme";
import { StepFrame, OptionCard, NavRow, CardGrid } from "./shared";
import { eyebrowFor } from "./flow";

// `name` is what gets saved and scored; `info` is the plain-language explanation.
const ACTIVITIES: { name: string; info: string }[] = [
  { name: "Building or fixing things", info: "Making or repairing real things, like assembling a shelf, fixing a bike, or working out why a gadget stopped working." },
  { name: "Designing visuals or experiences", info: "Making things look good or feel easy to use: posters, logos, slides, or how a phone app is laid out." },
  { name: "Solving logical or technical problems", info: "Working out puzzles, maths or how a system works, like finding the mistake that breaks a program." },
  { name: "Writing or storytelling", info: "Putting ideas into words: stories, captions, scripts, blog posts or speeches." },
  { name: "Analyzing data or patterns", info: "Looking at numbers or information to find out what it means, like checking which post got the most views, and why." },
  { name: "Leading or organizing people", info: "Getting a group moving in the same direction: running a club, a team project or an event." },
  { name: "Persuading or selling ideas", info: "Convincing people: pitching an idea, selling something, or winning a debate." },
  { name: "Helping or teaching others", info: "Explaining things or supporting people, like tutoring a friend or helping someone solve a problem." },
  { name: "Researching and learning", info: "Digging deep to find out how things work: reading, watching and testing until you truly understand." },
  { name: "Planning and strategizing", info: "Working out the best way to reach a goal, like planning a budget or the steps to launch a project." },
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
    <StepFrame eyebrow={eyebrowFor("q3")} title="What keeps you engaged?" subtitle={`Pick the ${MAX} activities you could do for hours without getting bored.`} wide>
      <p style={{ margin: "-14px 0 18px", fontFamily: FONT, fontSize: 12.5, color: PAPER_FAINT }}>
        Not sure what one means? Tap the <span style={{ fontFamily: "Georgia, serif", fontStyle: "italic", fontWeight: 700 }}>i</span> for a simple explanation.
      </p>
      <CardGrid columns={2} align="start">
        {ACTIVITIES.map(({ name, info }) => (
          <OptionCard key={name} label={name} info={info} selected={picked.includes(name)} onClick={() => toggle(name)} />
        ))}
      </CardGrid>
      <NavRow onBack={onBack} onContinue={() => onContinue(picked)} continueDisabled={picked.length === 0} />
    </StepFrame>
  );
}
