import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { TopBar } from "@/components/dashboard/TopBar";
import { MobileTabBar } from "@/components/dashboard/MobileTabBar";
import { SEO } from "@/components/SEO";
import { KokoAvatar } from "@/components/koko/KokoAvatar";
import {
  type AppNotification,
  type ListFilter,
  type NotificationType,
  clearAll,
  deleteNotification,
  listNotifications,
  markAllRead,
  markRead,
  timeAgo,
} from "@/lib/notifications";

/* WorthScope — /notifications
   Full list of the user's notifications with filter tabs, pagination,
   per-item mark-as-read, and bulk actions. Reads directly from Supabase. */

const PAGE_SIZE = 20;
const KOKO = "#3498DB";
const ACCENT = "#3498DB";

const TYPE_META: Record<NotificationType, { label: string; bg: string; color: string }> = {
  koko:      { label: "Koko",      bg: "rgba(52,152,219,0.12)", color: "#3498DB" },
  milestone: { label: "Milestone", bg: "rgba(52,152,219,0.12)", color: "#3498DB" },
  mission:   { label: "Mission",   bg: "#EBF5FB",               color: "#3498DB" },
  reminder:  { label: "Reminder",  bg: "rgba(245,158,11,0.1)",  color: "#F59E0B" },
  streak:    { label: "Streak",    bg: "rgba(251,146,60,0.1)",  color: "#FB923C" },
  progress:  { label: "Progress",  bg: "rgba(34,197,94,0.1)",   color: "#22C55E" },
  system:    { label: "System",    bg: "#F3F4F6",               color: "#6B7280" },
};

const TABS: { id: ListFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "unread", label: "Unread" },
  { id: "read", label: "Read" },
];

export default function Notifications() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<ListFilter>("all");
  const [page, setPage] = useState(0);
  const [items, setItems] = useState<AppNotification[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [confirmClear, setConfirmClear] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const r = await listNotifications({
      filter,
      limit: PAGE_SIZE,
      offset: page * PAGE_SIZE,
    });
    setItems(r.items);
    setTotal(r.total);
    setLoading(false);
  }, [filter, page]);

  useEffect(() => { load(); }, [load]);

  // Listen for realtime / event updates
  useEffect(() => {
    const refresh = () => load();
    window.addEventListener("worthscope:notifications", refresh);
    return () => window.removeEventListener("worthscope:notifications", refresh);
  }, [load]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const handleClick = async (n: AppNotification) => {
    if (!n.read_at) await markRead(n.id);
    if (n.action_url?.startsWith("/")) navigate(n.action_url);
  };

  const onMarkRead = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    await markRead(id);
  };

  const onDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    await deleteNotification(id);
  };

  const onMarkAll = async () => {
    await markAllRead();
  };

  const onClearAll = async () => {
    await clearAll();
    setConfirmClear(false);
    setPage(0);
  };

  return (
    <div className="min-h-screen bg-background font-poppins text-foreground">
      <SEO
        title="Notifications — WorthScope"
        description="Your full notifications history — milestones, mission updates, and messages from Koko."
        path="/notifications"
      />
      <Sidebar activePath="/notifications" />

      <div className="md:ml-[220px]">
        <TopBar title="Notifications" />

        <main className="mx-auto w-full max-w-[900px] px-4 pb-24 pt-8 md:px-8 md:pb-12">
          {/* Header row */}
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-[22px] font-bold text-foreground">Notifications</h2>
              <p className="mt-0.5 text-[13px] text-text2">
                {total === 0 ? "Nothing here yet." : `${total} ${total === 1 ? "notification" : "notifications"}`}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={onMarkAll}
                className="rounded-lg border border-border bg-card px-3 py-1.5 text-[13px] font-medium text-foreground transition-colors hover:bg-[#F4F9FE]"
              >
                Mark all as read
              </button>
              <button
                onClick={() => setConfirmClear(true)}
                className="rounded-lg border border-[#FCA5A5]/60 bg-white px-3 py-1.5 text-[13px] font-medium text-[#DC2626] transition-colors hover:bg-[#FEF2F2]"
              >
                Clear all
              </button>
            </div>
          </div>

          {/* Filter tabs */}
          <div className="mb-5 flex gap-1 rounded-xl border border-border bg-card p-1">
            {TABS.map((t) => {
              const active = filter === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => { setFilter(t.id); setPage(0); }}
                  className="flex-1 rounded-lg px-3 py-2 text-[13px] font-semibold transition-all"
                  style={{
                    background: active ? KOKO : "transparent",
                    color: active ? "#fff" : "#6B7280",
                  }}
                >
                  {t.label}
                </button>
              );
            })}
          </div>

          {/* List */}
          {loading ? (
            <div className="grid place-items-center py-16 text-[13px] text-text3">Loading…</div>
          ) : items.length === 0 ? (
            <EmptyState filter={filter} />
          ) : (
            <ul className="flex flex-col gap-2.5">
              {items.map((n) => (
                <NotificationCard
                  key={n.id}
                  n={n}
                  onClick={() => handleClick(n)}
                  onMarkRead={(e) => onMarkRead(e, n.id)}
                  onDelete={(e) => onDelete(e, n.id)}
                />
              ))}
            </ul>
          )}

          {/* Pagination */}
          {!loading && items.length > 0 && totalPages > 1 && (
            <div className="mt-6 flex items-center justify-between">
              <button
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
                className="rounded-lg border border-border bg-card px-3 py-1.5 text-[13px] font-medium text-foreground disabled:opacity-40"
              >
                ← Previous
              </button>
              <span className="text-[13px] text-text2">
                Page {page + 1} of {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
                className="rounded-lg border border-border bg-card px-3 py-1.5 text-[13px] font-medium text-foreground disabled:opacity-40"
              >
                Next →
              </button>
            </div>
          )}
        </main>
      </div>

      <MobileTabBar />

      {/* Clear-all confirmation */}
      {confirmClear && (
        <div
          className="fixed inset-0 z-[500] grid place-items-center bg-black/40 px-4"
          onClick={() => setConfirmClear(false)}
        >
          <div
            className="w-full max-w-[420px] rounded-2xl bg-white p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-[18px] font-bold text-[#111]">Clear all notifications?</h3>
            <p className="mt-2 text-[14px] text-[#6B7280]">
              This permanently deletes all your notifications. You can't undo this.
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setConfirmClear(false)}
                className="rounded-lg border border-border bg-white px-4 py-2 text-[13px] font-medium text-foreground hover:bg-[#F4F9FE]"
              >
                Cancel
              </button>
              <button
                onClick={onClearAll}
                className="rounded-lg bg-[#DC2626] px-4 py-2 text-[13px] font-semibold text-white hover:bg-[#B91C1C]"
              >
                Yes, clear all
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function NotificationCard({
  n, onClick, onMarkRead, onDelete,
}: {
  n: AppNotification;
  onClick: () => void;
  onMarkRead: (e: React.MouseEvent) => void;
  onDelete: (e: React.MouseEvent) => void;
}) {
  const meta = TYPE_META[n.type] || TYPE_META.system;
  const read = !!n.read_at;
  return (
    <li>
      <div
        onClick={onClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === "Enter") onClick(); }}
        className="group relative flex cursor-pointer items-start gap-3 rounded-xl border border-border bg-card p-4 transition-all hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)]"
        style={{
          background: read ? "hsl(var(--card))" : "#F0F8FF",
          borderLeft: read ? "1px solid hsl(var(--border))" : `4px solid ${ACCENT}`,
          paddingLeft: read ? 16 : 13,
        }}
      >
        <div
          className="grid h-10 w-10 flex-shrink-0 place-items-center rounded-full text-[18px]"
          style={{ background: meta.bg, color: meta.color }}
        >
          {n.icon || "•"}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3
              className="text-[15px] font-semibold leading-tight"
              style={{ color: read ? "#6B7280" : "#111" }}
            >
              {n.title}
            </h3>
            <span
              className="rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide"
              style={{ background: meta.bg, color: meta.color }}
            >
              {meta.label}
            </span>
            {!read && <span className="h-1.5 w-1.5 rounded-full bg-[#3498DB]" />}
          </div>
          <p className="mt-1 text-[13.5px] leading-[1.55] text-[#6B7280]">{n.message}</p>
          <div className="mt-2 text-[11.5px] text-[#9CA3AF]">{timeAgo(n.created_at)}</div>
        </div>

        <div className="flex flex-shrink-0 flex-col items-end gap-1 opacity-70 transition-opacity group-hover:opacity-100">
          {!read && (
            <button
              onClick={onMarkRead}
              className="rounded-md px-2 py-1 text-[11.5px] font-medium text-[#3498DB] hover:bg-[#EBF5FB]"
            >
              Mark as read
            </button>
          )}
          <button
            onClick={onDelete}
            aria-label="Delete notification"
            className="rounded-md p-1 text-[#9CA3AF] hover:bg-[#FEF2F2] hover:text-[#DC2626]"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
            </svg>
          </button>
        </div>
      </div>
    </li>
  );
}

function EmptyState({ filter }: { filter: ListFilter }) {
  const msg =
    filter === "unread"
      ? "No unread notifications. You're all caught up!"
      : filter === "read"
      ? "No read notifications yet."
      : "You're all caught up! No new notifications.";
  return (
    <div className="grid place-items-center rounded-2xl border border-dashed border-border bg-card py-16 px-6 text-center">
      <KokoAvatar size={72} />
      <h3 className="mt-4 text-[17px] font-bold text-foreground">All clear</h3>
      <p className="mt-1.5 max-w-[320px] text-[13.5px] text-[#6B7280]">{msg}</p>
    </div>
  );
}
