type Props = { title: string; locked?: boolean; delay?: string };

export const PhaseLabel = ({ title, locked, delay }: Props) => (
  <div
    className="ws-fade-up my-8 flex items-center gap-3"
    style={{ animationDelay: delay }}
  >
    <div className={["h-px flex-1", locked ? "bg-foreground/[0.05]" : "bg-accent/20"].join(" ")} />
    <div
      className={[
        "rounded-full px-4 py-[5px] text-[12px] font-semibold",
        locked
          ? "border border-foreground/[0.05] bg-foreground/[0.03] text-text3"
          : "border border-accent/20 bg-accent/10 text-accent",
      ].join(" ")}
    >
      {title}
    </div>
    <div className={["h-px flex-1", locked ? "bg-foreground/[0.05]" : "bg-accent/20"].join(" ")} />
  </div>
);
