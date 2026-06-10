import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getProgress, getChosenCareer } from "@/lib/userState";
import { getActiveModule, loadModuleForCareer } from "@/lib/careerModules";

export const SkillProgress = () => {
  const [skills, setSkills] = useState<{ name: string; value: number }[]>([]);

  useEffect(() => {
    const refresh = () => {
      const pr = getProgress();
      const mod = getActiveModule() || loadModuleForCareer(getChosenCareer());
      setSkills(
        mod.skills.slice(0, 5).map((s) => ({ name: s.name, value: pr.skills[s.name] || 0 }))
      );
    };
    refresh();
    window.addEventListener("worthscope:progress", refresh);
    return () => window.removeEventListener("worthscope:progress", refresh);
  }, []);

  return (
    <div data-tour="skills" className="rounded-[20px] border border-border bg-card p-6 shadow-card">
      <h3 className="mb-5 text-[16px] font-bold text-foreground">
        <span className="mr-1.5">📊</span> Skill Progress
      </h3>

      {skills.length === 0 ? (
        <p className="text-[13px] text-text2">Complete a mission to start building your skills.</p>
      ) : (
        <ul className="flex flex-col gap-[18px]">
          {skills.map((s, i) => (
            <li key={s.name}>
              <div className="mb-2 flex items-center justify-between">
                <span className="text-[14px] font-medium text-foreground">{s.name}</span>
                <span className="text-[14px] font-semibold text-accent">{s.value}%</span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-foreground/5">
                <div
                  className="h-full rounded-full bg-gradient-progress"
                  style={{
                    width: `${s.value}%`,
                    animation: `ws-bar-fill 1.1s ease-out ${0.1 * i}s both`,
                  }}
                />
              </div>
            </li>
          ))}
        </ul>
      )}

      <Link to="/skills" className="mt-5 inline-block text-[13px] font-medium text-accent hover:underline">
        View all skills →
      </Link>
    </div>
  );
};
