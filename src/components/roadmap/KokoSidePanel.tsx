import { IconArrowRight, IconChart, IconTarget, IconLock } from "@/components/dashboard/icons";
import { KokoAvatar } from "@/components/koko/KokoAvatar";
import type { RoadmapNode } from "./nodesData";

type Props = {
  nodes: RoadmapNode[];
  phases: { num: number; title: string; locked: boolean }[];
  onOpenMission: (node: RoadmapNode) => void;
  onGoTo: (path: string) => void;
};

export const KokoSidePanel = ({ nodes, phases, onOpenMission, onGoTo }: Props) => {
  const current = nodes.find((n) => n.status === "current") ?? null;
  const allDone = nodes.length > 0 && nodes.every((n) => n.status === "completed");
  const remainingInPhase = current ? nodes.filter((n) => n.phase === current.phase && n.status !== "completed").length : 0;
  const nextLocked = phases.find((p) => p.locked) ?? null;

  const message = allDone
    ? "You finished your whole roadmap. Amazing work! Check your matched jobs next."
    : current
      ? remainingInPhase === 1 && nextLocked
        ? `You're on Mission ${current.num}: ${current.title}. Pass this one and you unlock ${nextLocked.title}.`
        : `You're on Mission ${current.num}: ${current.title}. ${remainingInPhase} mission${remainingInPhase === 1 ? "" : "s"} left in this phase — one step at a time.`
      : "Your roadmap is ready. Open a mission to begin.";

  return (
    <aside
      className="ws-fade-up rounded-[20px] border border-accent/25 bg-card p-6 shadow-[0_0_32px_hsl(var(--accent)/0.07)] lg:sticky lg:top-[88px]"
      style={{ animationDelay: "0.5s" }}
    >
      <div className="flex items-center gap-3">
        <KokoAvatar size={40} />
        <div>
          <div className="text-[15px] font-bold text-foreground">Koko</div>
          <div className="text-[12px] text-text2">Your career coach</div>
        </div>
      </div>

      <div className="mt-4 rounded-[14px] border border-accent/15 bg-accent/[0.08] px-4 py-3.5" style={{ borderTopLeftRadius: 4 }}>
        <p className="text-[13px] leading-[1.65] text-foreground">{message}</p>
      </div>

      <div className="mt-4 text-[11px] font-semibold uppercase tracking-[1px] text-text3">Quick Actions</div>
      <div className="mt-2 flex flex-col gap-2">
        <ActionBtn Icon={IconArrowRight} disabled={!current} onClick={() => current && onOpenMission(current)}>
          {current ? `Continue Mission ${current.num}` : "Continue current mission"}
        </ActionBtn>
        <ActionBtn Icon={IconChart} onClick={() => onGoTo("/skills")}>
          View my skill progress
        </ActionBtn>
        <ActionBtn Icon={IconTarget} onClick={() => onGoTo("/discover")}>
          Update my career goals
        </ActionBtn>
      </div>

      {nextLocked && (
        <>
          <div className="mt-5 text-[10px] font-semibold uppercase tracking-[1px] text-text3">Next Unlock</div>
          <div className="mt-2 rounded-xl bg-bg-elevated px-3.5 py-3">
            <div className="flex items-center gap-2.5">
              <IconLock className="h-4 w-4 text-text3" />
              <div className="min-w-0">
                <div className="text-[13px] font-medium text-text2">{nextLocked.title}</div>
                <div className="text-[11px] text-text3">
                  {current && remainingInPhase > 0
                    ? `${remainingInPhase} mission${remainingInPhase === 1 ? "" : "s"} away from unlocking`
                    : "Complete your missions to unlock"}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </aside>
  );
};

const ActionBtn = ({
  Icon,
  children,
  onClick,
  disabled,
}: {
  Icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
}) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    className="flex cursor-pointer items-center gap-2.5 rounded-[10px] border border-accent/10 bg-bg-elevated px-3.5 py-2.5 text-left text-[13px] font-medium text-text2 transition-all hover:border-accent/40 hover:text-foreground hover:shadow-[0_0_0_1px_hsl(var(--accent)/0.15)] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
  >
    <Icon className="h-4 w-4 text-accent" />
    <span>{children}</span>
  </button>
);
