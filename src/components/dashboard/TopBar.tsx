import { IconBell } from "./icons";

type Props = {
  title?: string;
  /** When provided, shows a "% Complete" pill instead of the streak badge. */
  progress?: number;
};

export const TopBar = ({ title = "Dashboard", progress }: Props) => (
  <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background/85 px-4 backdrop-blur-xl md:px-8">
    <h1 className="text-[18px] font-semibold text-foreground">{title}</h1>

    <div className="flex items-center gap-4">
      {typeof progress === "number" ? (
        <div className="flex items-center gap-2 rounded-full border border-accent/20 bg-accent/10 px-3.5 py-1.5">
          <span className="text-[13px] font-semibold text-accent">{progress}% Complete</span>
        </div>
      ) : (
        <div className="flex items-center gap-1.5 rounded-full border border-streak/25 bg-streak/10 px-3 py-[5px]">
          <span className="inline-block animate-ws-flame text-[14px] leading-none">🔥</span>
          <span className="text-[12px] font-semibold text-streak">5 Day Streak</span>
        </div>
      )}

      {/* Notification */}
      <button className="relative text-text2 transition-colors hover:text-foreground" aria-label="Notifications">
        <IconBell className="h-5 w-5" />
        <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-destructive ring-2 ring-background" />
      </button>

      {/* Avatar */}
      <button
        className="grid h-9 w-9 place-items-center rounded-full bg-gradient-accent text-[14px] font-semibold text-white transition-shadow hover:shadow-[0_0_0_3px_hsl(var(--accent)/0.3)]"
        aria-label="Profile"
      >
        U
      </button>
    </div>
  </header>
);
