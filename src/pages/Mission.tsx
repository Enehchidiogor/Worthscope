import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { MobileTabBar } from "@/components/dashboard/MobileTabBar";
import { MissionHeader } from "@/components/mission/MissionHeader";
import { KokoBanner } from "@/components/mission/KokoBanner";
import { SectionShell } from "@/components/mission/SectionShell";
import { LearnContent } from "@/components/mission/LearnContent";
import { StepsContent } from "@/components/mission/StepsContent";
import { TaskContent } from "@/components/mission/TaskContent";
import { SubmitContent } from "@/components/mission/SubmitContent";
import { StickyCompleteBar } from "@/components/mission/StickyCompleteBar";
import { IconArrowRight } from "@/components/dashboard/icons";
import { completeMission, getChosenCareer } from "@/lib/userState";

const skillsForCategory = (cat?: string): Record<string, number> => {
  if (cat === "tech") return { "Problem Solving": 8, "Technical Tools": 10 };
  if (cat === "creative") return { "UI Design": 10, "Problem Solving": 5 };
  if (cat === "business") return { "Communication": 8, "Problem Solving": 6 };
  if (cat === "science") return { "Research": 10, "Problem Solving": 6 };
  if (cat === "people") return { "Communication": 10, "Research": 5 };
  if (cat === "communication") return { "Communication": 10, "UI Design": 4 };
  return { "UI Design": 8, "Problem Solving": 6 };
};

const Mission = () => {
  const navigate = useNavigate();

  // Section completion: [Learn, Steps, Task, Submit]
  const [sectionsDone, setSectionsDone] = useState<boolean[]>([false, false, false, false]);
  const [submitted, setSubmitted] = useState(false);

  const setSection = (idx: number, value: boolean) =>
    setSectionsDone((prev) => prev.map((v, i) => (i === idx ? value : v)));

  // Auto-mark Submit section when a file/link is provided
  const onSubmittedChange = (ok: boolean) => {
    setSubmitted(ok);
    setSection(3, ok);
  };

  const progress = useMemo(() => {
    const done = sectionsDone.filter(Boolean).length;
    return Math.round((done / sectionsDone.length) * 100);
  }, [sectionsDone]);

  const handleAllComplete = () => {
    const cat = getChosenCareer()?.category;
    completeMission(skillsForCategory(cat));
    navigate("/roadmap");
  };

  return (
    <div className="min-h-screen bg-background font-poppins text-foreground">
      <Sidebar activePath="/missions" />

      <div className="md:ml-[220px]">
        {/* Top bar — back link + mission progress pill */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background/85 px-4 backdrop-blur-xl md:px-8">
          <button
            type="button"
            onClick={() => navigate("/roadmap")}
            className="flex items-center gap-2 text-[14px] font-medium text-text2 transition-colors hover:text-accent"
          >
            <IconArrowRight className="h-[18px] w-[18px] rotate-180" />
            Back to Roadmap
          </button>
          <div className="rounded-full border border-accent/20 bg-accent/10 px-3.5 py-1.5 text-[12px] font-semibold text-accent">
            Phase 1 · Mission 3 of 9
          </div>
        </header>

        <main className="mx-auto w-full max-w-[860px] px-4 pb-32 pt-8 md:px-8 md:pt-10">
          <MissionHeader
            phase="Phase 1: Foundation"
            time="30–45 mins"
            title="Design Your First UI Screen"
            subtitle="Learn the fundamentals of UI layout, then apply them by designing a real screen you can add to your portfolio."
            progress={progress}
          />

          <KokoBanner message="Focus on completing each section before moving forward. This mission builds the foundation for everything in Phase 2." />

          <SectionShell
            number="01"
            label="Learn"
            title="Watch & Understand"
            done={sectionsDone[0]}
            onToggle={() => setSection(0, !sectionsDone[0])}
            delay="0.35s"
          >
            <LearnContent />
          </SectionShell>

          <SectionShell
            number="02"
            label="Guided Steps"
            title="Follow These Steps"
            subtitle="Work through each step in order before moving to the task."
            done={sectionsDone[1]}
            onToggle={() => setSection(1, !sectionsDone[1])}
            delay="0.5s"
          >
            <StepsContent />
          </SectionShell>

          <SectionShell
            number="03"
            label="Your Task"
            title="Now Apply It"
            subtitle="Use what you've learned to complete this real task. This will go directly into your portfolio."
            done={sectionsDone[2]}
            onToggle={() => setSection(2, !sectionsDone[2])}
            emphasized
            delay="0.65s"
          >
            <TaskContent />
          </SectionShell>

          <SectionShell
            number="04"
            label="Submit Your Work"
            title="Share What You Built"
            subtitle="Upload your work or paste a link. This is what makes your learning real and trackable."
            done={sectionsDone[3]}
            onToggle={() => {
              // Manual toggle should still respect submission state
              if (submitted) setSection(3, !sectionsDone[3]);
            }}
            delay="0.8s"
          >
            <SubmitContent onSubmittedChange={onSubmittedChange} />
          </SectionShell>
        </main>
      </div>

      <MobileTabBar />

      <StickyCompleteBar sectionsDone={sectionsDone} onComplete={handleAllComplete} />
    </div>
  );
};

export default Mission;
