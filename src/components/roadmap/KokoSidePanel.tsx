import { IconArrowRight, IconChart, IconTarget, IconLock } from "@/components/dashboard/icons";

export const KokoSidePanel = () => (
  <aside
    className="ws-fade-up rounded-[20px] border border-accent/25 bg-card p-6 shadow-[0_0_32px_hsl(var(--accent)/0.07)] lg:sticky lg:top-[88px]"
    style={{ animationDelay: "0.5s" }}
  >
    <div className="flex items-center gap-3">
      <div className="grid h-10 w-10 place-items-center rounded-full bg-gradient-accent text-[15px] font-bold text-white shadow-accent">
        K
      </div>
      <div>
        <div className="text-[15px] font-bold text-foreground">Koko</div>
        <div className="text-[12px] text-text2">AI Career Assistant</div>
      </div>
    </div>

    <div
      className="mt-4 rounded-[14px] border border-accent/15 bg-accent/[0.08] px-4 py-3.5"
      style={{ borderTopLeftRadius: 4 }}
    >
      <p className="text-[13px] leading-[1.65] text-foreground">
        You're doing great! Complete Mission 03 to unlock Phase 2 — Exploration.
        You're only 1 step away.
      </p>
    </div>

    <div className="mt-4 text-[11px] font-semibold uppercase tracking-[1px] text-text3">
      Quick Actions
    </div>
    <div className="mt-2 flex flex-col gap-2">
      <ActionBtn Icon={IconArrowRight}>Continue current mission</ActionBtn>
      <ActionBtn Icon={IconChart}>View my skill progress</ActionBtn>
      <ActionBtn Icon={IconTarget}>Update my career goals</ActionBtn>
    </div>

    <div className="mt-5 text-[10px] font-semibold uppercase tracking-[1px] text-text3">
      Next Unlock
    </div>
    <div className="mt-2 rounded-xl bg-bg-elevated px-3.5 py-3">
      <div className="flex items-center gap-2.5">
        <IconLock className="h-4 w-4 text-text3" />
        <div className="min-w-0">
          <div className="text-[13px] font-medium text-text3">Phase 2 — Exploration</div>
          <div className="text-[11px] text-text3/70">1 mission away from unlocking</div>
        </div>
      </div>
    </div>
  </aside>
);

const ActionBtn = ({
  Icon,
  children,
}: {
  Icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) => (
  <button className="flex items-center gap-2.5 rounded-[10px] border border-accent/10 bg-bg-elevated px-3.5 py-2.5 text-left text-[13px] font-medium text-text2 transition-all hover:border-accent/30 hover:text-foreground">
    <Icon className="h-4 w-4 text-accent" />
    <span>{children}</span>
  </button>
);
