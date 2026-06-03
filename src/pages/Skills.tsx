import { useEffect, useState } from "react";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { MobileTabBar } from "@/components/dashboard/MobileTabBar";
import { IconBell } from "@/components/dashboard/icons";
import { OverallSummary } from "@/components/skills/OverallSummary";
import { KokoBanner } from "@/components/mission/KokoBanner";
import { SkillBreakdown } from "@/components/skills/SkillBreakdown";
import { WeeklyChart } from "@/components/skills/WeeklyChart";
import { FocusNext } from "@/components/skills/FocusNext";
import { RelatedMissions } from "@/components/skills/RelatedMissions";
import { iconForSkill, levelFor, type Skill } from "@/components/skills/skillsData";
import { getProgress, getChosenCareer } from "@/lib/userState";
import { getActiveModule, loadModuleForCareer } from "@/lib/careerModules";
import { SEO } from "@/components/SEO";

const Skills = () => {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [overall, setOverall] = useState(1);
  const [careerTitle, setCareerTitle] = useState<string | null>(null);

  useEffect(() => {
    const refresh = () => {
      const pr = getProgress();
      const mod = getActiveModule() || loadModuleForCareer(getChosenCareer());
      const list: Skill[] = mod.skills.map((s) => {
        const value = Math.max(0, pr.skills[s.name] || 0);
        return {
          id: s.name.toLowerCase().replace(/\s+/g, "-"),
          name: s.name,
          percent: Math.max(1, value || 1),
          level: levelFor(value),
          growth: 0,
          icon: iconForSkill(s.name),
          link: value > 0 ? "Continue →" : "Start here →",
        };
      });
      setSkills(list);
      const avg = list.length ? Math.round(list.reduce((s, x) => s + x.percent, 0) / list.length) : 1;
      setOverall(Math.max(1, avg));
      setCareerTitle(getChosenCareer()?.title || mod.title || null);
    };
    refresh();
    window.addEventListener("worthscope:progress", refresh);
    return () => window.removeEventListener("worthscope:progress", refresh);
  }, []);

  // Find strongest + weakest for Focus Next
  const sorted = [...skills].sort((a, b) => b.percent - a.percent);
  const strongest = sorted[0];
  const weakest = sorted[sorted.length - 1];

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Skill Progress — WorthScope"
        description="Track weekly skill growth, see your strongest competencies, and find where to focus next."
        path="/skills"
      />
      <Sidebar activePath="/skills" />

      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background/85 px-4 backdrop-blur-xl md:ml-[220px] md:px-8">
        <h1 className="text-[18px] font-semibold text-foreground">
          Skill Progress{careerTitle ? <span className="ml-2 text-[13px] font-medium text-text2">— {careerTitle}</span> : null}
        </h1>
        <div className="flex items-center gap-4">
          <div className="rounded-full border border-accent/20 bg-accent/10 px-3.5 py-1.5">
            <span className="text-[12px] font-semibold text-accent">Overall: {overall}%</span>
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

      <main className="flex flex-col items-center px-4 pb-24 pt-8 md:ml-[220px] md:px-12 md:pt-10">
        <div className="w-full max-w-[860px] space-y-6">
          <OverallSummary percent={overall} />
          <KokoBanner
            message={
              strongest && strongest.percent > 1
                ? `Your strongest skill is ${strongest.name}. Focus on improving ${weakest?.name || "another skill"} next.`
                : "Complete your first mission to start building your skills."
            }
          />
          <SkillBreakdown skills={skills} />
          <WeeklyChart />
          <FocusNext weakest={weakest} strongest={strongest} />
          <RelatedMissions />
        </div>
      </main>

      <MobileTabBar />
    </div>
  );
};

export default Skills;
