import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { NotificationsBell } from "@/components/notifications/NotificationsBell";
import { getProfile, getStreak } from "@/lib/userState";
import { UserAvatar } from "@/components/UserAvatar";

type Props = {
  title?: string;
  /** When provided, shows a "% Complete" pill instead of the streak badge. */
  progress?: number;
};

export const TopBar = ({ title = "Dashboard", progress }: Props) => {
  const [initials, setInitials] = useState("U");
  const [name, setName] = useState("User");
  const [streakCount, setStreakCount] = useState(1);
  useEffect(() => {
    const p = getProfile();
    if (p?.firstName) {
      setInitials((p.firstName[0] + (p.lastName?.[0] || "")).toUpperCase() || "U");
      setName(p.firstName);
    }
    const refresh = () => setStreakCount(getStreak().count || 1);
    refresh();
    window.addEventListener("worthscope:streak", refresh);
    return () => window.removeEventListener("worthscope:streak", refresh);
  }, []);

  return (
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
            <span className="text-[12px] font-semibold text-streak">{streakCount} Day Streak</span>
          </div>
        )}

        {/* Notifications */}
        <NotificationsBell />

        {/* Avatar → Profile */}
        <Link
          to="/profile"
          className="rounded-full transition-shadow hover:shadow-[0_0_0_3px_hsl(var(--accent)/0.3)]"
          aria-label="Profile"
        >
          <UserAvatar size={36} fallbackInitial={initials} fallbackName={name} />
        </Link>
      </div>
    </header>
  );
};
