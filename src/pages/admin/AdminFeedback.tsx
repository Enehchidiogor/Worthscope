import { AdminLayout } from "@/components/admin/AdminLayout";
import { useAdminFetch } from "@/lib/useAdminFetch";
import { fetchFeedback } from "@/lib/adminData";

const VERDICT_LABEL: Record<string, string> = { "spot-on": "🎯 Spot on", partly: "🤔 Partly", "not-really": "🙅 Not really" };

export default function AdminFeedback() {
  const { data, loading, error } = useAdminFetch(fetchFeedback);

  return (
    <AdminLayout title="Career Prediction Feedback">
      {loading && <p className="text-[13px] text-text2">Loading…</p>}
      {error && <div className="rounded-xl border border-border bg-card p-4 text-[13px] text-text2">Couldn't load feedback: {error}</div>}
      {data && data.length === 0 && <p className="text-[13px] text-text2">No feedback submitted yet.</p>}
      {data && data.length > 0 && (
        <div className="flex flex-col gap-3">
          {data.map((f) => (
            <div key={f.id} className="rounded-[14px] border border-border bg-card p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-[13px] font-semibold text-foreground">{VERDICT_LABEL[f.verdict] || f.verdict}</span>
                <span className="text-[11.5px] text-text3">{new Date(f.created_at).toLocaleString()}</span>
              </div>
              <div className="mt-2 text-[12.5px] text-text2">
                Top pick: <span className="text-foreground">{f.top_pick || "—"}</span>
                {f.confidence && <span className="ml-2 text-text3">({f.confidence})</span>}
              </div>
              {f.expected_career && (
                <div className="mt-1 text-[12.5px] text-text2">
                  Expected: <span className="text-foreground">{f.expected_career}</span>
                </div>
              )}
              {f.comment && <p className="mt-2 text-[12.5px] leading-relaxed text-text2">"{f.comment}"</p>}
            </div>
          ))}
        </div>
      )}
    </AdminLayout>
  );
}
