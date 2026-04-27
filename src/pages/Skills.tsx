import { Sidebar } from "@/components/dashboard/Sidebar";
import { MobileTabBar } from "@/components/dashboard/MobileTabBar";
import { IconBell } from "@/components/dashboard/icons";
import { OverallSummary } from "@/components/skills/OverallSummary";
import { KokoBanner } from "@/components/mission/KokoBanner";
import { SkillBreakdown } from "@/components/skills/SkillBreakdown";
import { WeeklyChart } from "@/components/skills/WeeklyChart";
import { FocusNext } from "@/components/skills/FocusNext";
import { RelatedMissions } from "@/components/skills/RelatedMissions";
import { skills } from "@/components/skills/skillsData";

const Skills = () => {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar activePath="/skills" />

      {/* Top bar */}
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background/85 px-4 backdrop-blur-xl md:ml-[220px] md:px-8">
        <h1 className="text-[18px] font-semibold text-foreground">Skill Progress</h1>
        <div className="flex items-center gap-4">
          <div className="rounded-full border border-accent/20 bg-accent/10 px-3.5 py-1.5">
            <span className="text-[12px] font-semibold text-accent">Overall: 35%</span>
          </div>
          <button className="relative text-text2 transition-colors hover:text-foreground" aria-label="Notifications">
            <IconBell className="h-5 w-5" />
            <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-destructive ring-2 ring-background" />
          </button>
          <button className="grid h-9 w-9 place-items-center rounded-full bg-gradient-accent text-[14px] font-semibold text-white">
            U
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-[860px] px-4 pb-24 pt-8 md:ml-[220px] md:px-8 md:pt-10">
        <OverallSummary percent={35} />

        <div className="mt-6">
          <KokoBanner message="Your strongest skill is Problem Solving. Focus on improving UI Design next to unlock better opportunities in Phase 2." />
        </div>

        <div className="mt-6 space-y-6">
          <SkillBreakdown skills={skills} />
          <WeeklyChart />
          <FocusNext />
          <RelatedMissions />
        </div>
      </main>

      <MobileTabBar />
    </div>
  );
};

export default Skills;
