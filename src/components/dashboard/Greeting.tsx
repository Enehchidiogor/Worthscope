import { useEffect, useState } from "react";
import { getProfile, getProgress, isFirstLogin } from "@/lib/userState";

export const Greeting = () => {
  const [name, setName] = useState("there");
  const [pct, setPct] = useState(0);
  const [first, setFirst] = useState(false);

  useEffect(() => {
    const p = getProfile();
    setName(p?.firstName || "there");
    setPct(getProgress().overallPct);
    setFirst(isFirstLogin());
    const onProgress = () => setPct(getProgress().overallPct);
    window.addEventListener("worthscope:progress", onProgress);
    return () => window.removeEventListener("worthscope:progress", onProgress);
  }, []);

  return (
    <section className="ws-fade-up mb-7 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center" style={{ animationDelay: "0.1s" }}>
      <div>
        <h2 className="text-[26px] font-bold tracking-[-0.5px] text-foreground">
          {first ? "Welcome" : "Welcome back"}, {name} <span aria-hidden>👋</span>
        </h2>
        <p className="mt-1 text-[15px] text-text2">Let's continue your journey.</p>
      </div>

      <div className="flex items-center gap-3 rounded-full border border-accent/20 bg-accent/10 px-4 py-2">
        <ProgressRing value={pct} />
        <span className="text-[13px] font-semibold text-accent">{pct}% Complete</span>
      </div>
    </section>
  );
};

const ProgressRing = ({ value }: { value: number }) => {
  const r = 13;
  const c = 2 * Math.PI * r;
  const offset = c - (c * value) / 100;
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" className="-rotate-90">
      <circle cx="16" cy="16" r={r} fill="none" stroke="hsl(var(--accent) / 0.2)" strokeWidth="3" />
      <circle
        cx="16"
        cy="16"
        r={r}
        fill="none"
        stroke="hsl(var(--accent))"
        strokeWidth="3"
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={offset}
      />
    </svg>
  );
};
