import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { IconBell } from "@/components/dashboard/icons";

/* WorthScope — Notifications Bell + Dropdown
   Lives in the TopBar. Shows a badge with unread count, opens a
   dropdown with 5 actionable notifications. Items mark themselves
   as read on click and navigate to relevant pages. */

type NotifType = "mission" | "streak" | "koko" | "progress" | "reminder";

type Notif = {
  id: number;
  type: NotifType;
  title: string;
  message: string;
  time: string;
  read: boolean;
  action: () => void;
};

const TYPE_STYLES: Record<NotifType, { bg: string; color: string }> = {
  mission: { bg: "#EBF5FB", color: "#3498DB" },
  streak: { bg: "rgba(251,146,60,0.1)", color: "#FB923C" },
  koko: { bg: "#EBF5FB", color: "#3498DB" },
  progress: { bg: "rgba(34,197,94,0.1)", color: "#22C55E" },
  reminder: { bg: "rgba(245,158,11,0.1)", color: "#F59E0B" },
};

const TypeIcon = ({ type }: { type: NotifType }) => {
  const stroke = TYPE_STYLES[type].color;
  const common = { width: 16, height: 16, viewBox: "0 0 24 24", fill: "none", stroke, strokeWidth: 2, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  switch (type) {
    case "mission":
      return (
        <svg {...common}>
          <path d="m3 6 6-2 6 2 6-2v14l-6 2-6-2-6 2z" />
          <path d="M9 4v16M15 6v16" />
        </svg>
      );
    case "streak":
      return (
        <svg {...common}>
          <path d="M12 2s4 4 4 8a4 4 0 0 1-8 0c0-1.5.5-2.5 1-3 0 2 1 3 2 3 0-3-3-4-3-7 0 0 4 1 4-1z" />
        </svg>
      );
    case "koko":
      return (
        <svg {...common}>
          <rect x="4" y="7" width="16" height="12" rx="3" />
          <path d="M12 3v4M9 12h.01M15 12h.01" />
          <path d="M9 16c.8.6 1.8 1 3 1s2.2-.4 3-1" />
        </svg>
      );
    case "progress":
      return (
        <svg {...common}>
          <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />
        </svg>
      );
    case "reminder":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7v5l3 2" />
        </svg>
      );
  }
};

export const NotificationsBell = () => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  const [items, setItems] = useState<Notif[]>(() => [
    {
      id: 1,
      type: "mission",
      title: "New mission unlocked 🎯",
      message: "You've unlocked Mission 4: Build Your First Project Brief. Start when you're ready.",
      time: "Just now",
      read: false,
      action: () => navigate("/roadmap"),
    },
    {
      id: 2,
      type: "streak",
      title: "You're on a 5-day streak 🔥",
      message: "Keep it going! Come back tomorrow to reach 6 days and stay on track.",
      time: "2h ago",
      read: false,
      action: () => navigate("/"),
    },
    {
      id: 3,
      type: "koko",
      title: "Koko has a suggestion for you 💡",
      message: "You're close to leveling up your UI Design skill. One more mission should do it.",
      time: "5h ago",
      read: false,
      action: () => window.dispatchEvent(new CustomEvent("koko:open")),
    },
    {
      id: 4,
      type: "reminder",
      title: "Complete your task today",
      message: "Mission 3 is still waiting. Finish it to keep your progress moving forward.",
      time: "Yesterday",
      read: true,
      action: () => navigate("/mission"),
    },
    {
      id: 5,
      type: "progress",
      title: "Weekly progress update 📊",
      message: "Your overall skill level grew by +10% this week. Problem Solving is your top skill.",
      time: "2 days ago",
      read: true,
      action: () => navigate("/skills"),
    },
  ]);

  const unreadCount = items.filter((i) => !i.read).length;

  // Close on click outside
  useEffect(() => {
    if (!open) return;
    const handle = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [open]);

  const markRead = (id: number) =>
    setItems((arr) => arr.map((i) => (i.id === id ? { ...i, read: true } : i)));
  const markAllRead = () => setItems((arr) => arr.map((i) => ({ ...i, read: true })));

  const handleItemClick = (n: Notif) => {
    markRead(n.id);
    setTimeout(() => {
      setOpen(false);
      n.action();
    }, 200);
  };

  return (
    <div ref={wrapRef} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Notifications"
        className="relative rounded-lg p-1.5 transition-colors"
        style={{ color: open ? "#3498DB" : "#6B7280" }}
        onMouseEnter={(e) => {
          if (!open) e.currentTarget.style.color = "#111";
          e.currentTarget.style.background = "#F4F9FE";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = open ? "#3498DB" : "#6B7280";
          e.currentTarget.style.background = "transparent";
        }}
      >
        <IconBell className="h-[22px] w-[22px]" />
        {unreadCount > 0 && (
          <span
            className="absolute right-0.5 top-0.5 grid min-w-[18px] place-items-center rounded-full bg-[#EF4444] px-1 text-[10px] font-bold leading-none text-white"
            style={{ height: 18, border: "2px solid #fff", animation: "ws-koko-pop 0.25s ease-out both" }}
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          className="absolute right-0 top-[44px] z-[400] w-[360px] max-w-[calc(100vw-32px)] overflow-hidden rounded-2xl bg-white"
          style={{
            border: "1px solid #E5E7EB",
            boxShadow: "0 16px 48px rgba(0,0,0,0.12)",
            transformOrigin: "top right",
            animation: "ws-notif-open 0.2s ease-out both",
            maxHeight: 480,
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[#E5E7EB] px-[18px] py-4">
            <div className="flex items-center">
              <h3 className="text-[16px] font-bold text-[#111]">Notifications</h3>
              {unreadCount > 0 && (
                <span
                  className="ml-2 rounded-full px-2.5 py-0.5 text-[11px] font-semibold text-[#3498DB]"
                  style={{ background: "#EBF5FB" }}
                >
                  {unreadCount} new
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="text-[12px] font-medium text-[#3498DB] hover:underline"
              >
                Mark all read
              </button>
            )}
          </div>

          {/* List or empty state */}
          <div className="max-h-[340px] overflow-y-auto">
            {items.length === 0 || items.every((i) => i.read && false) ? null : null}

            {unreadCount === 0 && items.every((i) => i.read) ? (
              <div className="flex flex-col items-center px-5 py-10 text-center">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
                  <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
                  <path d="M3 3l18 18" />
                </svg>
                <div className="mt-3 text-[15px] font-semibold text-[#111]">No new notifications</div>
                <div className="mt-1 text-[13px] text-[#9CA3AF]">You're all caught up. Check back later.</div>
              </div>
            ) : (
              items.map((n, i) => {
                const style = TYPE_STYLES[n.type];
                return (
                  <button
                    key={n.id}
                    onClick={() => handleItemClick(n)}
                    className="relative flex w-full items-start gap-3 px-[18px] py-3.5 text-left transition-colors"
                    style={{
                      background: n.read ? "#FFFFFF" : "#F0F8FF",
                      borderBottom: i === items.length - 1 ? "none" : "1px solid #E5E7EB",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "#F4F9FE")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = n.read ? "#FFFFFF" : "#F0F8FF")}
                  >
                    {!n.read && (
                      <span className="absolute left-0 top-0 h-full w-1 bg-[#3498DB]" />
                    )}

                    <div
                      className="grid h-9 w-9 flex-shrink-0 place-items-center rounded-full"
                      style={{ background: style.bg }}
                    >
                      <TypeIcon type={n.type} />
                    </div>

                    <div className="min-w-0 flex-1 pr-3">
                      <div
                        className="text-[14px] font-semibold leading-snug"
                        style={{ color: n.read ? "#6B7280" : "#111" }}
                      >
                        {n.title}
                      </div>
                      <p
                        className="mt-0.5 text-[13px] leading-[1.55] text-[#6B7280]"
                        style={{
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                        }}
                      >
                        {n.message}
                      </p>
                      <div className="mt-1 text-[11px] text-[#9CA3AF]">{n.time}</div>
                    </div>

                    {!n.read && (
                      <span className="absolute right-4 top-4 h-1.5 w-1.5 rounded-full bg-[#3498DB]" />
                    )}
                  </button>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-[#E5E7EB] bg-white py-3 text-center">
            <button
              onClick={() => {
                setOpen(false);
              }}
              className="text-[13px] font-medium text-[#3498DB] hover:underline"
            >
              View all notifications →
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
