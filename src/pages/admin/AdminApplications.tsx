import { AdminLayout } from "@/components/admin/AdminLayout";
import { useAdminFetch } from "@/lib/useAdminFetch";
import { fetchApplications, fetchAllClasses } from "@/lib/adminData";

export default function AdminApplications() {
  const apps = useAdminFetch(fetchApplications);
  const classes = useAdminFetch(fetchAllClasses);
  const classTitle = (id: string) => classes.data?.find((c) => c.id === id)?.title || "(class removed)";

  const loading = apps.loading || classes.loading;
  const error = apps.error || classes.error;

  return (
    <AdminLayout title="Class Applications">
      {loading && <p className="text-[13px] text-text2">Loading…</p>}
      {error && <div className="rounded-xl border border-border bg-card p-4 text-[13px] text-text2">Couldn't load applications: {error}</div>}
      {apps.data && apps.data.length === 0 && <p className="text-[13px] text-text2">No applications yet.</p>}
      {apps.data && apps.data.length > 0 && (
        <div className="overflow-x-auto rounded-[16px] border border-border">
          <table className="w-full text-left text-[13px]">
            <thead>
              <tr className="border-b border-border bg-bg-elevated text-[11px] uppercase tracking-wide text-text3">
                <th className="px-4 py-3 font-semibold">Class</th>
                <th className="px-4 py-3 font-semibold">Applicant</th>
                <th className="px-4 py-3 font-semibold">Email</th>
                <th className="px-4 py-3 font-semibold">Applied</th>
              </tr>
            </thead>
            <tbody>
              {apps.data.map((a) => (
                <tr key={a.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3 font-medium text-foreground">{classTitle(a.class_id)}</td>
                  <td className="px-4 py-3 text-text2">{a.applicant_name || "—"}</td>
                  <td className="px-4 py-3 text-text2">{a.applicant_email || "—"}</td>
                  <td className="px-4 py-3 text-text3">{new Date(a.created_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AdminLayout>
  );
}
