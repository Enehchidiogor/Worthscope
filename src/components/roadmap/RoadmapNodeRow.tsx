import { IconCheck, IconLock } from "@/components/dashboard/icons";
import type { RoadmapNode } from "./nodesData";

type Props = {
  node: RoadmapNode;
  /** index within full list; controls left/right zigzag (desktop only) */
  zigIndex: number;
  onClick: (node: RoadmapNode) => void;
  delay?: string;
};

/**
 * Renders both a mobile (left-aligned) and a desktop (zigzag) version of the
 * node row. We use Tailwind's responsive classes to swap which one is visible.
 */
export const RoadmapNodeRow = ({ node, zigIndex, onClick, delay }: Props) => {
  const onLeft = zigIndex % 2 === 0;

  return (
    <div className="ws-fade-up" style={{ animationDelay: delay }}>
      {/* MOBILE: node sits on the left line, card to the right */}
      <div className="md:hidden flex items-center gap-5 pl-0">
        <div className="relative shrink-0 w-12 grid place-items-center">
          <NodeCircle node={node} onClick={onClick} />
        </div>
        <div className="flex-1 min-w-0">
          <NodeCard node={node} side="right" onClick={onClick} />
        </div>
      </div>

      {/* DESKTOP: zigzag with center node */}
      <div className="hidden md:grid grid-cols-[1fr_auto_1fr] items-center gap-6">
        <div className={["flex justify-end", onLeft ? "" : "invisible"].join(" ")}>
          {onLeft && <NodeCard node={node} side="left" onClick={onClick} />}
        </div>
        <div className="grid place-items-center">
          <NodeCircle node={node} onClick={onClick} />
        </div>
        <div className={["flex justify-start", onLeft ? "invisible" : ""].join(" ")}>
          {!onLeft && <NodeCard node={node} side="right" onClick={onClick} />}
        </div>
      </div>
    </div>
  );
};

/* ---------- Node circle ---------- */

const NodeCircle = ({ node, onClick }: { node: RoadmapNode; onClick: (n: RoadmapNode) => void }) => {
  const { status, Icon } = node;

  if (status === "current") {
    return (
      <div className="relative flex flex-col items-center">
        <div
          className="absolute -top-7 animate-[ws-float_2s_ease-in-out_infinite] whitespace-nowrap rounded-full px-2.5 py-[3px] text-[10px] font-semibold uppercase tracking-[1px] text-accent"
          style={{ background: "hsl(var(--accent) / 0.12)" }}
        >
          You are here
        </div>
        <button
          onClick={() => onClick(node)}
          aria-label={`Open mission ${node.num}: ${node.title}`}
          className="relative grid h-16 w-16 place-items-center rounded-full bg-gradient-accent text-white shadow-[0_0_24px_hsl(var(--accent)/0.5)] transition-transform hover:scale-105"
        >
          <Icon className="h-[22px] w-[22px]" />
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 rounded-full border-2 border-accent"
            style={{ animation: "ws-pulse-ring 2s ease-out infinite" }}
          />
        </button>
      </div>
    );
  }

  if (status === "completed") {
    return (
      <button
        onClick={() => onClick(node)}
        aria-label={`Review completed mission ${node.num}: ${node.title}`}
        className="relative grid h-[52px] w-[52px] place-items-center rounded-full bg-success text-white shadow-[0_0_16px_hsl(var(--success)/0.3)] transition-transform hover:scale-105"
      >
        <IconCheck className="h-5 w-5" />
      </button>
    );
  }

  // locked
  return (
    <button
      onClick={() => onClick(node)}
      aria-label={`Locked mission ${node.num}: ${node.title}`}
      className="grid h-12 w-12 place-items-center rounded-full border-2 border-locked bg-bg-elevated text-text3 opacity-60"
    >
      <IconLock className="h-[18px] w-[18px]" />
    </button>
  );
};

/* ---------- Node side card ---------- */

const NodeCard = ({
  node,
  side,
  onClick,
}: {
  node: RoadmapNode;
  side: "left" | "right";
  onClick: (n: RoadmapNode) => void;
}) => {
  const { status, num, title, sub } = node;
  const isLocked = status === "locked";
  const isCurrent = status === "current";
  const isCompleted = status === "completed";

  return (
    <div className="relative w-full md:w-[240px]">
      {/* horizontal connector — desktop only */}
      <span
        aria-hidden
        className={[
          "absolute top-1/2 hidden h-[1.5px] w-8 -translate-y-1/2 md:block",
          side === "left" ? "right-[-32px]" : "left-[-32px]",
          isLocked ? "bg-locked" : "bg-accent",
        ].join(" ")}
      />

      <button
        onClick={() => onClick(node)}
        className={[
          "block w-full text-left rounded-2xl border p-[18px] transition-all duration-200",
          "hover:-translate-y-0.5",
          isCurrent
            ? "border-accent/35 shadow-[0_8px_32px_hsl(var(--accent)/0.12)]"
            : "border-border bg-card hover:border-accent/25 hover:shadow-[0_8px_28px_hsl(var(--accent)/0.12)]",
          isCompleted ? "opacity-80" : "",
          isLocked ? "opacity-60 cursor-not-allowed hover:translate-y-0 hover:shadow-none" : "",
        ].join(" ")}
        style={
          isCurrent
            ? {
                background:
                  "linear-gradient(135deg, hsl(var(--accent) / 0.10), hsl(var(--accent-dark) / 0.05))",
              }
            : undefined
        }
      >
        <div
          className={[
            "text-[11px] font-bold uppercase tracking-[1px]",
            isLocked ? "text-text3" : "text-accent",
          ].join(" ")}
        >
          {num}
        </div>
        <div
          className={[
            "mt-1 text-[15px] font-semibold leading-snug",
            isLocked ? "text-text3" : "text-foreground",
          ].join(" ")}
        >
          {title}
        </div>
        <div
          className={[
            "mt-1 text-[12px] leading-[1.55]",
            isLocked ? "text-text3/70" : "text-text2",
          ].join(" ")}
        >
          {sub}
        </div>

        {isCompleted && (
          <div className="mt-2 inline-flex items-center rounded-full bg-success/10 px-2.5 py-[3px] text-[11px] font-semibold text-success">
            ✓ Completed
          </div>
        )}

        {isCurrent && (
          <div className="mt-3 grid w-full place-items-center rounded-[10px] bg-accent px-4 py-2.5 text-[13px] font-semibold text-accent-foreground transition-all hover:bg-accent-dark hover:shadow-[0_4px_16px_hsl(var(--accent)/0.4)]">
            Start Mission →
          </div>
        )}
      </button>
    </div>
  );
};
