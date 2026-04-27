import { relatedMissions } from "./skillsData";
import { IconArrowRight, IconLock } from "../dashboard/icons";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export const RelatedMissions = () => {
  const navigate = useNavigate();

  return (
    <div
      className="ws-fade-up rounded-[20px] border border-border bg-card p-7 md:p-8 shadow-card"
      style={{ animationDelay: "0.9s" }}
    >
      <h2 className="text-[18px] font-bold text-foreground">Related Missions</h2>
      <p className="text-[13px] text-text3">Complete these to level up your skills</p>

      <div className="mt-5 grid gap-3.5 md:grid-cols-3">
        {relatedMissions.map((m) => (
          <button
            key={m.id}
            onClick={() => {
              if (m.locked) {
                toast.error("This mission is locked. Complete earlier missions first.");
              } else {
                navigate("/mission");
              }
            }}
            className={[
              "group flex items-center justify-between gap-3 rounded-[14px] border border-border bg-[hsl(var(--background))] p-4 text-left transition-all",
              m.locked
                ? "opacity-60"
                : "hover:-translate-y-0.5 hover:border-accent/30 hover:bg-accent/5 hover:shadow-[0_4px_16px_hsl(var(--accent)/0.10)]",
            ].join(" ")}
          >
            <div className="min-w-0 flex-1">
              <span className="inline-block rounded-full bg-accent/10 px-2 py-0.5 text-[10px] font-semibold text-accent">
                {m.tag}
              </span>
              <div className="mt-1.5 truncate text-[14px] font-semibold text-foreground">{m.title}</div>
              <div className="text-[12px] text-text2">{m.sub}</div>
            </div>
            {m.locked ? (
              <IconLock className="h-4 w-4 flex-shrink-0 text-text3" />
            ) : (
              <IconArrowRight className="h-4 w-4 flex-shrink-0 text-accent transition-transform group-hover:translate-x-0.5" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
};
