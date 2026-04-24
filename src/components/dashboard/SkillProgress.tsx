const skills = [
  { name: "Figma", value: 40 },
  { name: "Problem Solving", value: 60 },
  { name: "Communication", value: 30 },
];

export const SkillProgress = () => (
  <div className="rounded-[20px] border border-border bg-card p-6 shadow-card">
    <h3 className="mb-5 text-[16px] font-bold text-foreground">
      <span className="mr-1.5">📊</span> Skill Progress
    </h3>

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

    <a href="#" className="mt-5 inline-block text-[13px] font-medium text-accent hover:underline">
      View all skills →
    </a>
  </div>
);
