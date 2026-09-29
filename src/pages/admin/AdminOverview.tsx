import { AdminLayout } from "@/components/admin/AdminLayout";
import { useAdminFetch } from "@/lib/useAdminFetch";
import { fetchStats } from "@/lib/adminData";

const CARDS: { key: "totalUsers" | "completedCareerPredictions" | "feedbackCount" | "upcomingClasses" | "totalApplications"; label: string; emoji: string }[] = [
  { key: "totalUsers", label: "Total users", emoji: "👥" },
  { key: "completedCareerPredictions", label: "Career predictions completed", emoji: "🎯" },
  { key: "feedbackCount", label: "Feedback submissions", emoji: "💬" },
  { key: "upcomingClasses", label: "Upcoming/live classes", emoji: "📅" },
  { key: "totalApplications", label: "Class applications", emoji: "📝" },
];

export default function AdminOverview() {
  const { data, loading, error } = useAdminFetch(fetchStats);

  return (
    <AdminLayout title="Overview">
      {loading && <p className="text-[13px] text-text2">Loading…</p>}
      {error && (
        <div className="rounded-xl border border-border bg-card p-4 text-[13px] text-text2">
          Couldn't load stats: {error}. This usually means the admin migration hasn't been applied yet, or your account isn't marked as admin.
        </div>
      )}
      {data && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {CARDS.map((c) => (
            <div key={c.key} className="rounded-[16px] border border-border bg-card p-5">
              <div className="text-[24px]">{c.emoji}</div>
              <div className="mt-2 text-[28px] font-bold text-foreground">{data[c.key]}</div>
              <div className="mt-1 text-[12.5px] text-text2">{c.label}</div>
            </div>
          ))}
        </div>
      )}
    </AdminLayout>
  );
}
