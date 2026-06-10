import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { IconBell } from "@/components/dashboard/icons";
import {
  type AppNotification,
  type NotificationType,
  markRead,
  markAllRead,
  timeAgo,
  useNotifications,
} from "@/lib/notifications";

/* WorthScope — Notifications Bell + Dropdown
   Now backed by the `notifications` table in Supabase. Shows the 5 most
   recent items, marks them read on click, navigates to action_url if set,
   and live-updates via realtime + custom events. */

const TYPE_STYLES: Record<NotificationType, { bg: string; color: string }> = {
  mission: { bg: "#EBF5FB", color: "#3498DB" },
  streak: { bg: "rgba(251,146,60,0.1)", color: "#FB923C" },
  koko: { bg: "rgba(137,90,246,0.12)", color: "#895AF6" },
  progress: { bg: "rgba(34,197,94,0.1)", color: "#22C55E" },
  reminder: { bg: "rgba(245,158,11,0.1)", color: "#F59E0B" },
  milestone: { bg: "rgba(137,90,246,0.12)", color: "#895AF6" },
  system: { bg: "#F3F4F6", color: "#6B7280" },
};

const TypeGlyph = ({ n }: { n: AppNotification }) => {
  if (n.icon) return <span className="text-[16px] leading-none">{n.icon}</span>;
  const color = TYPE_STYLES[n.type]?.color || "#6B7280";
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v6M12 16h.01" />
    </svg>
  );
};

export const NotificationsBell = () => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const { items, unreadCount } = useNotifications({ limit: 5, filter: "all" });

  // Close on click outside
  useEffect(() => {
    if (!open) return;
    const handle = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [open]);

  const handleItemClick = async (n: AppNotification) => {
    if (!n.read_at) await markRead(n.id);
    setOpen(false);
    if (n.action_url) {
      if (n.action_url.startsWith("/")) navigate(n.action_url);
      else if (n.action_url === "koko:open") window.dispatchEvent(new CustomEvent("koko:open"));
    }
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
                onClick={() => markAllRead()}
                className="text-[12px] font-medium text-[#3498DB] hover:underline"
              >
                Mark all read
              </button>
            )}
          </div>

          {/* List or empty state */}
          <div className="max-h-[340px] overflow-y-auto">
            {items.length === 0 ? (
              <div className="flex flex-col items-center px-5 py-10 text-center">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
                  <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
                </svg>
                <div className="mt-3 text-[15px] font-semibold text-[#111]">You're all caught up</div>
                <div className="mt-1 text-[13px] text-[#9CA3AF]">No new notifications right now.</div>
              </div>
            ) : (
              items.map((n, i) => {
                const style = TYPE_STYLES[n.type] || TYPE_STYLES.system;
                const read = !!n.read_at;
                return (
                  <button
                    key={n.id}
                    onClick={() => handleItemClick(n)}
                    className="relative flex w-full items-start gap-3 px-[18px] py-3.5 text-left transition-colors"
                    style={{
                      background: read ? "#FFFFFF" : "#F0F8FF",
                      borderBottom: i === items.length - 1 ? "none" : "1px solid #E5E7EB",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "#F4F9FE")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = read ? "#FFFFFF" : "#F0F8FF")}
                  >
                    {!read && <span className="absolute left-0 top-0 h-full w-1 bg-[#3498DB]" />}

                    <div
                      className="grid h-9 w-9 flex-shrink-0 place-items-center rounded-full"
                      style={{ background: style.bg }}
                    >
                      <TypeGlyph n={n} />
                    </div>

                    <div className="min-w-0 flex-1 pr-3">
                      <div
                        className="text-[14px] font-semibold leading-snug"
                        style={{ color: read ? "#6B7280" : "#111" }}
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
                      <div className="mt-1 text-[11px] text-[#9CA3AF]">{timeAgo(n.created_at)}</div>
                    </div>

                    {!read && (
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
                navigate("/notifications");
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
